<?php

namespace App\Events;

use App\Models\Card;
use App\Models\Comment;
use App\Models\User;
use App\Support\ActivityData;

final class CommentCreated extends ActivityEvent
{
    public function __construct(
        public readonly Card $card,
        public readonly Comment $comment,
    ) {}

    public function activity(): ActivityData
    {
        return new ActivityData(
            workspaceId: $this->card->workspaceId(),
            userId: $this->comment->author_id,
            action: 'comment.created',
            entityType: 'card',
            entityId: $this->card->id,
            metadata: ['title' => $this->card->title, 'comment_id' => $this->comment->id],
        );
    }
}
