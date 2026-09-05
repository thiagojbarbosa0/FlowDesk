<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\Board;
use App\Models\Column;
use App\Models\User;
use App\Policies\Concerns\ResolvesMembership;

class ColumnPolicy
{
    use ResolvesMembership;

    public function create(User $user, Board $board): bool
    {
        return $this->roleOrNotFound($user, $board->workspace())->atLeast(WorkspaceRole::Member);
    }

    public function update(User $user, Column $column): bool
    {
        return $this->roleOrNotFound($user, $column->workspace())->atLeast(WorkspaceRole::Member);
    }

    public function delete(User $user, Column $column): bool
    {
        return $this->roleOrNotFound($user, $column->workspace())->atLeast(WorkspaceRole::Member);
    }
}
