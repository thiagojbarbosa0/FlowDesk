<?php

namespace Tests\Feature;

use App\Actions\Board\CreateBoardAction;
use App\Actions\Card\CreateCardAction;
use App\Actions\Project\CreateProjectAction;
use App\Actions\Workspace\CreateWorkspaceAction;
use App\Enums\WorkspaceRole;
use App\Models\Board;
use App\Models\Column;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CardAccessTest extends TestCase
{
    use RefreshDatabase;

    private Workspace $workspace;
    private Column $column;
    private Board $board;

    public function setUp(): void
    {
        parent::setUp();

        $owner = User::factory()->create();
        $this->workspace = app(CreateWorkspaceAction::class)->execute($owner, 'WS');
        $project = app(CreateProjectAction::class)->execute($owner, $this->workspace, 'P1');
        $this->board = app(CreateBoardAction::class)->execute($owner, $project, 'B1');
        $this->column = $this->board->columns()->first();
    }

    private function memberWithRole(WorkspaceRole $role): User
    {
        $user = User::factory()->create();
        $this->workspace->memberships()->create(['user_id' => $user->id, 'role' => $role]);

        return $user;
    }

    public function test_member_can_create_card(): void
    {
        $member = $this->memberWithRole(WorkspaceRole::Member);

        $this->actingAs($member, 'sanctum')
            ->postJson("/api/v1/columns/{$this->column->id}/cards", ['title' => 'Novo card'])
            ->assertCreated();
    }

    public function test_viewer_cannot_create_card(): void
    {
        $viewer = $this->memberWithRole(WorkspaceRole::Viewer);

        $this->actingAs($viewer, 'sanctum')
            ->postJson("/api/v1/columns/{$this->column->id}/cards", ['title' => 'Novo card'])
            ->assertForbidden();
    }

    public function test_viewer_can_comment(): void
    {
        $viewer = $this->memberWithRole(WorkspaceRole::Viewer);
        $card = app(CreateCardAction::class)->execute($viewer, $this->column, ['title' => 'C1']);

        $this->actingAs($viewer, 'sanctum')
            ->postJson("/api/v1/cards/{$card->id}/comments", ['body' => 'Comentário permitido'])
            ->assertCreated();
    }

    public function test_member_deletes_only_own_or_assigned_cards(): void
    {
        $author = $this->memberWithRole(WorkspaceRole::Member);
        $other = $this->memberWithRole(WorkspaceRole::Member);

        $ownCard = app(CreateCardAction::class)->execute($author, $this->column, ['title' => 'Meu']);
        $othersCard = app(CreateCardAction::class)->execute($other, $this->column, ['title' => 'Dele']);

        $this->actingAs($author, 'sanctum')
            ->deleteJson("/api/v1/cards/{$othersCard->id}")->assertForbidden();

        $this->actingAs($author, 'sanctum')
            ->deleteJson("/api/v1/cards/{$ownCard->id}")->assertNoContent();
    }

    public function test_admin_deletes_any_card(): void
    {
        $admin = $this->memberWithRole(WorkspaceRole::Admin);
        $member = $this->memberWithRole(WorkspaceRole::Member);
        $card = app(CreateCardAction::class)->execute($member, $this->column, ['title' => 'Qualquer']);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/cards/{$card->id}")->assertNoContent();
    }

    public function test_user_from_other_workspace_cannot_access_card_even_with_id(): void
    {
        $outsider = app(CreateWorkspaceAction::class)->execute(User::factory()->create(), 'Outro WS')->owner;
        $member = $this->memberWithRole(WorkspaceRole::Member);
        $card = app(CreateCardAction::class)->execute($member, $this->column, ['title' => 'Secreto']);

        $this->actingAs($outsider, 'sanctum')
            ->getJson("/api/v1/cards/{$card->id}")->assertNotFound();

        $this->actingAs($outsider, 'sanctum')
            ->postJson("/api/v1/cards/{$card->id}/move", [
                'column_id' => $this->column->id,
                'position' => 0,
            ])->assertNotFound();
    }

    public function test_assignee_must_belong_to_card_workspace(): void
    {
        $member = $this->memberWithRole(WorkspaceRole::Member);
        $card = app(CreateCardAction::class)->execute($member, $this->column, ['title' => 'C']);

        $outsider = User::factory()->create();

        $this->actingAs($member, 'sanctum')
            ->postJson("/api/v1/cards/{$card->id}/assignees", ['user_id' => $outsider->id])
            ->assertUnprocessable();
    }

    public function test_column_with_cards_cannot_be_deleted(): void
    {
        $member = $this->memberWithRole(WorkspaceRole::Member);
        app(CreateCardAction::class)->execute($member, $this->column, ['title' => 'Bloqueia']);

        $this->actingAs($member, 'sanctum')
            ->deleteJson("/api/v1/columns/{$this->column->id}")
            ->assertUnprocessable();
    }
}
