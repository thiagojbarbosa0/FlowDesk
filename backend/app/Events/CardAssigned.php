<?php

namespace App\Events;

use App\Models\Card;
use App\Models\User;
use App\Support\ActivityData;

final class CardAssigned extends ActivityEvent
{
    public function __construct(
        public readonly Card $card,
        public readonly User $actor,
        public readonly User $assignee,
    ) {}

    public function activity(): ActivityData
    {
        return new ActivityData(
            workspaceId: $this->card->workspaceId(),
            userId: $this->actor->id,
            action: 'card.assigned',
            entityType: 'card',
            entityId: $this->card->id,
            metadata: ['title' => $this->card->title, 'assignee' => $this->assignee->name],
        );
    }
}
