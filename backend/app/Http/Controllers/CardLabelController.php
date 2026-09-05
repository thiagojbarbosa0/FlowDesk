<?php

namespace App\Http\Controllers;

use App\Actions\Card\AttachLabelAction;
use App\Http\Requests\AttachLabelRequest;
use App\Http\Resources\CardResource;
use App\Models\Card;
use App\Models\Label;
use Illuminate\Http\Request;

class CardLabelController extends Controller
{
    public function store(AttachLabelRequest $request, Card $card): CardResource
    {
        $this->authorize('update', $card);

        $card = app(AttachLabelAction::class)->execute(
            $request->user(),
            $card,
            Label::findOrFail($request->validated('label_id')),
        );

        return CardResource::make($card->load('labels'));
    }

    public function destroy(Request $request, Card $card, Label $label): CardResource
    {
        $this->authorize('update', $card);

        $card->labels()->detach($label->id);

        return CardResource::make($card->load('labels'));
    }
}
