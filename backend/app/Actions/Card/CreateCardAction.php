<?php

namespace App\Actions\Card;

use App\Events\CardCreated;
use App\Models\Card;
use App\Models\Column;
use App\Models\User;

class CreateCardAction
{
    public function execute(User $author, Column $column, array $data): Card
    {
        $position = ((int) $column->cards()->max('position')) + 100;

        $card = $column->cards()->create([
            ...$data,
            'created_by' => $author->id,
            'position' => $position,
        ]);

        $card->loadMissing('column.board.project');

        CardCreated::dispatch($card, $author);

        return $card;
    }
}
