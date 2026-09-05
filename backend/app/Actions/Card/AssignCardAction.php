<?php

namespace App\Actions\Card;

use App\Events\CardAssigned;
use App\Models\Card;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AssignCardAction
{
    /**
     * Regra obrigatória: assignee.workspace_id == card.workspace_id
     */
    public function execute(User $actor, Card $card, User $assignee): Card
    {
        $workspace = $card->workspace();

        if (! $workspace || ! $workspace->roleOf($assignee)) {
            throw ValidationException::withMessages([
                'user_id' => 'O usuário precisa ser membro do mesmo workspace do card.',
            ]);
        }

        $card->assignees()->syncWithoutDetaching([$assignee->id]);

        $card->loadMissing('column.board.project');

        CardAssigned::dispatch($card, $actor, $assignee);

        return $card->load('assignees');
    }
}
