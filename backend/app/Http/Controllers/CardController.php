<?php

namespace App\Http\Controllers;

use App\Actions\Card\CreateCardAction;
use App\Actions\Card\MoveCardAction;
use App\Actions\Card\UpdateCardAction;
use App\Http\Requests\MoveCardRequest;
use App\Http\Requests\StoreCardRequest;
use App\Http\Requests\UpdateCardRequest;
use App\Http\Resources\BoardResource;
use App\Http\Resources\CardResource;
use App\Models\Board;
use App\Models\Card;
use App\Models\Column;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function store(StoreCardRequest $request, Column $column): CardResource
    {
        $this->authorize('create', [Card::class, $column]);

        $card = app(CreateCardAction::class)->execute($request->user(), $column, $request->validated());

        return CardResource::make($this->detail($card))->response()->setStatusCode(201);
    }

    public function show(Request $request, Card $card): CardResource
    {
        $this->authorize('view', $card);

        return CardResource::make($this->detail($card));
    }

    public function update(UpdateCardRequest $request, Card $card): CardResource
    {
        $this->authorize('update', $card);

        $card = app(UpdateCardAction::class)->execute($request->user(), $card, $request->validated());

        return CardResource::make($this->detail($card));
    }

    public function destroy(Request $request, Card $card): JsonResponse
    {
        $this->authorize('delete', $card);

        $card->delete(); // soft delete

        return response()->noContent();
    }

    /**
     * Drag-and-drop como operação de DOMÍNIO.
     * Retorna o board inteiro re-renderizado (fonte de verdade pós-mutation).
     */
    public function move(MoveCardRequest $request, Card $card): BoardResource
    {
        $this->authorize('move', $card);

        $card = app(MoveCardAction::class)->execute(
            $request->user(),
            $card,
            Column::findOrFail($request->validated('column_id')),
            $request->validated('position'),
        );

        $board = Board::findOrFail($card->column->board_id);

        return BoardResource::make($board->loadForRendering());
    }

    private function detail(Card $card): Card
    {
        return $card->load([
            'column:id,board_id',
            'assignees:id,name,email',
            'labels',
            'creator:id,name',
            'comments' => fn ($q) => $q->with('author:id,name')->latest('id'),
        ])->loadCount('comments');
    }
}
