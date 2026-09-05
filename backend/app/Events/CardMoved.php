<?php

namespace App\Events;

use App\Models\Card;
use App\Models\Column;
use App\Models\User;
use App\Support\ActivityData;

final class CardMoved extends ActivityEvent
{
    public function __construct(
        public readonly Card $card,
        public readonly User $actor,
        public readonly Column $from,
        public readonly Column $to,
    ) {}

    public function activity(): ActivityData
    {
        return new ActivityData(
            workspaceId: $this->card->workspaceId(),
            userId: $this->actor->id,
            action: 'card.moved',
            entityType: 'card',
            entityId: $this->card->id,
            metadata: ['title' => $this->card->title, 'from' => $this->from->name, 'to' => $this->to->name],
        );
    }
}
