<?php

namespace App\Actions\Workspace;

use App\Enums\WorkspaceRole;
use App\Events\MemberRoleChanged;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateMemberRoleAction
{
    public function execute(User $actor, Workspace $workspace, User $target, WorkspaceRole $newRole): WorkspaceMember
    {
        if ($newRole === WorkspaceRole::Owner) {
            if (! $actor->is($workspace->owner)) {
                throw ValidationException::withMessages(['role' => 'Apenas o owner pode transferir ownership.']);
            }

            DB::transaction(function () use ($workspace, $target) {
                $workspace->memberships()
                    ->where('user_id', $workspace->owner_id)
                    ->update(['role' => WorkspaceRole::Admin->value]);
                $workspace->forceFill(['owner_id' => $target->id])->save();
            });
        } elseif ($target->is($workspace->owner)) {
            throw ValidationException::withMessages(['user' => 'Transfira o ownership antes de alterar o papel do owner.']);
        }

        $member = $workspace->memberships()->where('user_id', $target->id)->firstOrFail();
        $member->update(['role' => $newRole]);

        MemberRoleChanged::dispatch($workspace, $actor, $target, $newRole);

        return $member->load('user');
    }
}
