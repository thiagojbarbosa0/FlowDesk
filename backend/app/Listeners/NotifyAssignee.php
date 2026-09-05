<?php

namespace App\Listeners;

use App\Events\CardAssigned;
use App\Jobs\CreateNotificationJob;

class NotifyAssignee
{
    public function handle(CardAssigned $event): void
    {
        // Notificação vai para a FILA (Redis): não bloqueia a resposta HTTP.
        CreateNotificationJob::dispatch(
            userId: $event->assignee->id,
            type: 'card.assigned',
            title: "Você foi atribuído ao card \"{$event->card->title}\"",
            data: [
                'card_id' => $event->card->id,
                'board_id' => $event->card->column->board_id,
                'workspace_id' => $event->card->workspaceId(),
            ],
        );
    }
}
