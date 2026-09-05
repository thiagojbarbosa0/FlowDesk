<?php

namespace Tests\Feature;

use App\Actions\Workspace\CreateWorkspaceAction;
use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceTenancyTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_workspace_makes_creator_owner_and_logs_activity(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/workspaces', ['name' => 'Meu Workspace']);

        $response->assertCreated();

        $workspace = Workspace::first();

        $this->assertSame($user->id, $workspace->owner_id);
        $this->assertSame(WorkspaceRole::Owner, $workspace->roleOf($user));
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'workspace.created',
            'workspace_id' => $workspace->id,
        ]);
    }

    public function test_non_member_gets_404_for_other_workspace(): void
    {
        [$userA, $userB] = [User::factory()->create(), User::factory()->create()];

        $workspaceB = app(CreateWorkspaceAction::class)->execute($userB, 'Workspace B');

        $this->actingAs($userA, 'sanctum')
            ->getJson("/api/v1/workspaces/{$workspaceB->id}")
            ->assertNotFound();
    }

    public function test_viewer_cannot_update_workspace(): void
    {
        [$workspace, $viewer] = $this->workspaceWithMember(WorkspaceRole::Viewer);

        $this->actingAs($viewer, 'sanctum')
            ->putJson("/api/v1/workspaces/{$workspace->id}", ['name' => 'Novo nome'])
            ->assertForbidden();
    }

    public function test_admin_cannot_delete_workspace_but_owner_can(): void
    {
        [$workspace, $admin] = $this->workspaceWithMember(WorkspaceRole::Admin);
        $owner = $workspace->owner;

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/workspaces/{$workspace->id}")
            ->assertForbidden();

        $this->actingAs($owner, 'sanctum')
            ->deleteJson("/api/v1/workspaces/{$workspace->id}")
            ->assertNoContent();
    }

    public function test_member_cannot_invite_but_admin_can(): void
    {
        [$workspace, $member] = $this->workspaceWithMember(WorkspaceRole::Member);
        [, $admin] = $this->workspaceWithMember(WorkspaceRole::Admin, $workspace);
        $newUser = User::factory()->create();

        $this->actingAs($member, 'sanctum')
            ->postJson("/api/v1/workspaces/{$workspace->id}/members", [
                'email' => $newUser->email,
                'role' => 'member',
            ])->assertForbidden();

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/workspaces/{$workspace->id}/members", [
                'email' => $newUser->email,
                'role' => 'member',
            ])->assertCreated();
    }

    public function test_owner_cannot_be_removed(): void
    {
        [$workspace, $admin] = $this->workspaceWithMember(WorkspaceRole::Admin);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/workspaces/{$workspace->id}/members/{$workspace->owner_id}")
            ->assertUnprocessable();
    }

    public function test_admin_cannot_transfer_ownership(): void
    {
        [$workspace, $admin] = $this->workspaceWithMember(WorkspaceRole::Admin);
        $target = User::factory()->create();
        $workspace->memberships()->create(['user_id' => $target->id, 'role' => WorkspaceRole::Member]);

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/workspaces/{$workspace->id}/members/{$target->id}", ['role' => 'owner'])
            ->assertUnprocessable();
    }

    /** @return array{0: Workspace, 1: User} */
    private function workspaceWithMember(WorkspaceRole $role, ?Workspace $workspace = null): array
    {
        $user = User::factory()->create();

        if (! $workspace) {
            $owner = User::factory()->create();
            $workspace = app(CreateWorkspaceAction::class)->execute($owner, 'WS');
        }

        $workspace->memberships()->create(['user_id' => $user->id, 'role' => $role]);

        return [$workspace, $user];
    }
}
