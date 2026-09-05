<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\Label;
use App\Models\User;
use App\Models\Workspace;
use App\Policies\Concerns\ResolvesMembership;

class LabelPolicy
{
    use ResolvesMembership;

    public function create(User $user, Workspace $workspace): bool
    {
        return $this->roleOrNotFound($user, $workspace)->atLeast(WorkspaceRole::Member);
    }

    public function update(User $user, Label $label): bool
    {
        return $this->roleOrNotFound($user, $label->workspace)->atLeast(WorkspaceRole::Member);
    }

    public function delete(User $user, Label $label): bool
    {
        return $this->roleOrNotFound($user, $label->workspace)->atLeast(WorkspaceRole::Member);
    }
}
