<?php

namespace App\Actions\Card;

use App\Events\CardUnassigned;
use App\Models\Card;
use App\Models\User;

class UnassignCardAction
{
    public function execute(User $actor, Card $card, User $assignee): Card
    {
        $card->assignees()->detach($assignee->id);

        $card->loadMissing('column.board.project');
        CardUnassigned::dispatch($card, $actor, $assignee);

        return $card->load('assignees');
    }
}
