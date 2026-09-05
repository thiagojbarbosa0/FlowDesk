<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\Card;
use App\Models\Column;
use App\Models\User;
use App\Policies\Concerns\ResolvesMembership;

class CardPolicy
{
    use ResolvesMembership;

    public function view(User $user, Card $card): bool
    {
        $this->roleOrNotFound($user, $card->workspace());

        return true;
    }

    public function create(User $user, Column $column): bool
    {
        return $this->roleOrNotFound($user, $column->workspace())->atLeast(WorkspaceRole::Member);
    }

    public function update(User $user, Card $card): bool
    {
        return $this->roleOrNotFound($user, $card->workspace())->atLeast(WorkspaceRole::Member);
    }

    public function move(User $user, Card $card): bool
    {
        return $this->roleOrNotFound($user, $card->workspace())->atLeast(WorkspaceRole::Member);
    }

    /**
     * Regra explícita e testada:
     * Admin/Owner apagam qualquer card; Member apaga apenas cards
     * que criou OU nos quais está atribuído; Viewer nunca apaga.
     */
    public function delete(User $user, Card $card): bool
    {
        $role = $this->roleOrNotFound($user, $card->workspace());

        if ($role->atLeast(WorkspaceRole::Admin)) {
            return true;
        }

        if ($role === WorkspaceRole::Member) {
            return $card->created_by === $user->id
                || $card->assignees()->whereKey($user->id)->exists();
        }

        return false;
    }
}
