<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use App\Policies\Concerns\ResolvesMembership;

class WorkspacePolicy
{
    use ResolvesMembership;

    public function view(User $user, Workspace $workspace): bool
    {
        $this->roleOrNotFound($user, $workspace);

        return true;
    }

    public function update(User $user, Workspace $workspace): bool
    {
        return $this->roleOrNotFound($user, $workspace)->atLeast(WorkspaceRole::Admin);
    }

    public function delete(User $user, Workspace $workspace): bool
    {
        return $this->roleOrNotFound($user, $workspace) === WorkspaceRole::Owner;
    }

    public function manageMembers(User $user, Workspace $workspace): bool
    {
        return $this->roleOrNotFound($user, $workspace)->atLeast(WorkspaceRole::Admin);
    }

    public function manageLabels(User $user, Workspace $workspace): bool
    {
        return $this->roleOrNotFound($user, $workspace)->atLeast(WorkspaceRole::Member);
    }
}
