<?php

namespace App\Jobs;

use App\Models\Card;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class SendDueDateReminders implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function handle(): void
    {
        Card::query()
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [now(), now()->addDay()])
            ->with(['assignees', 'column.board.project'])
            ->get()
            ->each(function (Card $card) {
                $workspaceId = $card->workspaceId();
                $boardId = $card->column->board_id;

                foreach ($card->assignees as $user) {
                    if ($this->alreadyRemindedToday($user->id, $card->id)) {
                        continue;
                    }

                    Notification::create([
                        'user_id' => $user->id,
                        'type' => 'card.due_soon',
                        'title' => "O card \"{$card->title}\" vence em breve",
                        'data' => [
                            'card_id' => $card->id,
                            'board_id' => $boardId,
                            'workspace_id' => $workspaceId,
                        ],
                    ]);
                }
            });
    }

    /**
     * Idempotência: um mesmo card+usuário só recebe UM lembrete "due_soon"
     * por dia, mesmo que o job rode mais de uma vez (retry, scheduler
     * duplicado, reprocessamento manual etc.).
     */
    private function alreadyRemindedToday(int $userId, int $cardId): bool
    {
        return Notification::query()
            ->where('user_id', $userId)
            ->where('type', 'card.due_soon')
            ->whereDate('created_at', now()->toDateString())
            ->whereJsonContains('data->card_id', $cardId)
            ->exists();
    }
}
