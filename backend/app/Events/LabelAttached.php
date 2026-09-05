<?php

namespace App\Events;

use App\Models\Card;
use App\Models\Label;
use App\Models\User;
use App\Support\ActivityData;

final class LabelAttached extends ActivityEvent
{
    public function __construct(
        public readonly Card $card,
        public readonly Label $label,
        public readonly User $actor,
    ) {}

    public function activity(): ActivityData
    {
        return new ActivityData(
            workspaceId: $this->card->workspaceId(),
            userId: $this->actor->id,
            action: 'label.attached',
            entityType: 'card',
            entityId: $this->card->id,
            metadata: ['title' => $this->card->title, 'label' => $this->label->name],
        );
    }
}
