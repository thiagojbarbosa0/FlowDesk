<?php

namespace App\Listeners;

use App\Events\CommentCreated;
use App\Jobs\CreateNotificationJob;
use App\Models\Card;
use App\Models\User;

/**
 * Quando alguém comenta, notifica assignees + criador do card,
 * exceto o próprio autor do comentário.
 */
class NotifyCardStakeholders
{
    public function handle(CommentCreated $event): void
    {
        $card = $event->card->loadMissing(['assignees', 'creator', 'column.board.project']);

        $recipients = $card->assignees
            ->concat([$card->creator])
            ->unique('id')
            ->reject(fn (User $u) => $u->is($event->comment->author));

        foreach ($recipients as $recipient) {
            CreateNotificationJob::dispatch(
                userId: $recipient->id,
                type: 'comment.created',
                title: "Novo comentário em \"{$card->title}\"",
                data: [
                    'card_id' => $card->id,
                    'board_id' => $card->column->board_id,
                    'workspace_id' => $card->workspaceId(),
                ],
            );
        }
    }
}
