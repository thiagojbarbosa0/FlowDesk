<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Policies\Concerns\ResolvesMembership;

class ProjectPolicy
{
    use ResolvesMembership;

    public function view(User $user, Project $project): bool
    {
        $this->roleOrNotFound($user, $project->workspace);

        return true;
    }

    public function create(User $user, Workspace $workspace): bool
    {
        return $this->roleOrNotFound($user, $workspace)->atLeast(WorkspaceRole::Member);
    }

    public function update(User $user, Project $project): bool
    {
        return $this->roleOrNotFound($user, $project->workspace)->atLeast(WorkspaceRole::Member);
    }

    public function delete(User $user, Project $project): bool
    {
        return $this->roleOrNotFound($user, $project->workspace)->atLeast(WorkspaceRole::Admin);
    }
}
