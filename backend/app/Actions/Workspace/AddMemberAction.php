<?php

namespace App\Actions\Workspace;

use App\Enums\WorkspaceRole;
use App\Events\MemberAdded;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Validation\ValidationException;

class AddMemberAction
{
    public function execute(User $actor, Workspace $workspace, string $email, WorkspaceRole $role): WorkspaceMember
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            throw ValidationException::withMessages(['email' => 'Nenhum usuário encontrado com este e-mail.']);
        }

        if ($user->is($workspace->owner)) {
            throw ValidationException::withMessages(['email' => 'Este usuário já é o owner do workspace.']);
        }

        if ($role === WorkspaceRole::Owner) {
            throw ValidationException::withMessages(['role' => 'Ownership só pode ser transferida pelo owner.']);
        }

        if ($workspace->memberships()->where('user_id', $user->id)->exists()) {
            throw ValidationException::withMessages(['email' => 'Usuário já é membro deste workspace.']);
        }

        $member = $workspace->memberships()->create([
            'user_id' => $user->id,
            'role' => $role,
        ]);

        MemberAdded::dispatch($workspace, $actor, $user, $role);

        return $member->load('user');
    }
}
