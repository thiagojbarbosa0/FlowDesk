<?php

namespace App\Actions\Workspace;

use App\Events\WorkspaceCreated;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;

class CreateWorkspaceAction
{
    /**
     * Invariante: workspace nasce SEMPRE com exatamente um Owner
     * (o criador). Workspace + membership na mesma transação.
     */
    public function execute(User $user, string $name): Workspace
    {
        $workspace = DB::transaction(function () use ($user, $name) {
            $workspace = Workspace::create(['name' => $name, 'owner_id' => $user->id]);
            $workspace->memberships()->create([
                'user_id' => $user->id,
                'role' => \App\Enums\WorkspaceRole::Owner,
            ]);

            return $workspace;
        });

        WorkspaceCreated::dispatch($workspace, $user);

        return $workspace;
    }
}
