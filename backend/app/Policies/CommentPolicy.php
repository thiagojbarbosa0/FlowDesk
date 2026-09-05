<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\Card;
use App\Models\Comment;
use App\Models\User;
use App\Policies\Concerns\ResolvesMembership;

class CommentPolicy
{
    use ResolvesMembership;

    public function view(User $user, Card $card): bool
    {
        $this->roleOrNotFound($user, $card->workspace());

        return true;
    }

    // Pela matriz, TODOS os papéis (inclusive Viewer) podem comentar.
    public function create(User $user, Card $card): bool
    {
        $this->roleOrNotFound($user, $card->workspace());

        return true;
    }

    public function update(User $user, Comment $comment): bool
    {
        $this->roleOrNotFound($user, $comment->card->workspace());

        return $comment->author_id === $user->id;
    }

    public function delete(User $user, Comment $comment): bool
    {
        $role = $this->roleOrNotFound($user, $comment->card->workspace());

        return $comment->author_id === $user->id || $role->atLeast(WorkspaceRole::Admin);
    }
}
