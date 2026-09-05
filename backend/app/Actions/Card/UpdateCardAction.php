<?php

namespace App\Actions\Card;

use App\Events\CardUpdated;
use App\Models\Card;
use App\Models\User;

class UpdateCardAction
{
    public function execute(User $actor, Card $card, array $data): Card
    {
        $card->update($data);
        $card->refresh();

        if ($data !== []) {
            CardUpdated::dispatch($card, $actor, array_keys($data));
        }

        return $card;
    }
}
