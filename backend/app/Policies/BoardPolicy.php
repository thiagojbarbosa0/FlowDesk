<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\Board;
use App\Models\Project;
use App\Models\User;
use App\Policies\Concerns\ResolvesMembership;

class BoardPolicy
{
    use ResolvesMembership;

    public function view(User $user, Board $board): bool
    {
        $this->roleOrNotFound($user, $board->project->workspace);

        return true;
    }

    public function create(User $user, Project $project): bool
    {
        return $this->roleOrNotFound($user, $project->workspace)->atLeast(WorkspaceRole::Member);
    }

    public function update(User $user, Board $board): bool
    {
        return $this->roleOrNotFound($user, $board->project->workspace)->atLeast(WorkspaceRole::Member);
    }

    public function delete(User $user, Board $board): bool
    {
        return $this->roleOrNotFound($user, $board->project->workspace)->atLeast(WorkspaceRole::Admin);
    }
}
