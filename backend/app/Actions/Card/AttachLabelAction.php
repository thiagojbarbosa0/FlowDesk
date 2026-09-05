<?php

namespace App\Actions\Card;

use App\Events\LabelAttached;
use App\Models\Card;
use App\Models\Label;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AttachLabelAction
{
    /**
     * Regra de domínio: label de Workspace A jamais é anexada a card de Workspace B.
     */
    public function execute(User $actor, Card $card, Label $label): Card
    {
        if ($label->workspace_id !== $card->workspaceId()) {
            throw ValidationException::withMessages([
                'label_id' => 'Label não pertence ao workspace deste card.',
            ]);
        }

        $card->labels()->syncWithoutDetaching([$label->id]);

        $card->loadMissing('column.board.project');
        LabelAttached::dispatch($card, $label, $actor);

        return $card->load('labels');
    }
}
