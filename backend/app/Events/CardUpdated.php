<?php

namespace App\Events;

use App\Models\Card;
use App\Models\User;
use App\Support\ActivityData;

final class CardUpdated extends ActivityEvent
{
    /** @param array<int, string> $changed */
    public function __construct(
        public readonly Card $card,
        public readonly User $actor,
        public readonly array $changed = [],
    ) {}

    public function activity(): ActivityData
    {
        return new ActivityData(
            workspaceId: $this->card->workspaceId(),
            userId: $this->actor->id,
            action: 'card.updated',
            entityType: 'card',
            entityId: $this->card->id,
            metadata: ['title' => $this->card->title, 'changed' => $this->changed],
        );
    }
}
