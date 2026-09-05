<?php

namespace App\Actions\Workspace;

use App\Events\MemberRemoved;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Validation\ValidationException;

class RemoveMemberAction
{
    public function execute(User $actor, Workspace $workspace, User $target): void
    {
        if ($target->is($workspace->owner)) {
            throw ValidationException::withMessages(['user' => 'O owner não pode ser removido. Transfira o ownership primeiro.']);
        }

        $deleted = $workspace->memberships()->where('user_id', $target->id)->delete();

        if ($deleted === 0) {
            abort(404);
        }

        MemberRemoved::dispatch($workspace, $actor, $target);
    }
}
