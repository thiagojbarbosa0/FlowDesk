<?php

namespace App\Http\Controllers;

use App\Actions\Card\AssignCardAction;
use App\Actions\Card\UnassignCardAction;
use App\Http\Requests\AssignCardRequest;
use App\Http\Resources\CardResource;
use App\Models\Card;
use App\Models\User;
use Illuminate\Http\Request;

class CardAssigneeController extends Controller
{
    public function store(AssignCardRequest $request, Card $card): CardResource
    {
        $this->authorize('update', $card);

        $card = app(AssignCardAction::class)->execute(
            $request->user(),
            $card,
            User::findOrFail($request->validated('user_id')),
        );

        return CardResource::make($card->load('assignees:id,name,email'));
    }

    public function destroy(Request $request, Card $card, User $user): CardResource
    {
        $this->authorize('update', $card);

        $card = app(UnassignCardAction::class)->execute($request->user(), $card, $user);

        return CardResource::make($card->load('assignees:id,name,email'));
    }
}
