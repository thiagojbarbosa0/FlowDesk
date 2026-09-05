<?php

namespace App\Events;

use App\Models\Card;
use App\Models\User;
use App\Support\ActivityData;

final class CardCreated extends ActivityEvent
{
    public function __construct(
        public readonly Card $card,
        public readonly User $actor,
    ) {}

    public function activity(): ActivityData
    {
        return new ActivityData(
            workspaceId: $this->card->workspaceId(),
            userId: $this->actor->id,
            action: 'card.created',
            entityType: 'card',
            entityId: $this->card->id,
            metadata: ['title' => $this->card->title, 'column' => $this->card->column->name],
        );
    }
}
