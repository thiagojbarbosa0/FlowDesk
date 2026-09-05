<?php

namespace App\Http\Controllers;

use App\Actions\Column\CreateColumnAction;
use App\Http\Requests\StoreColumnRequest;
use App\Http\Requests\UpdateColumnRequest;
use App\Http\Resources\ColumnResource;
use App\Models\Board;
use App\Models\Column;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ColumnController extends Controller
{
    public function store(StoreColumnRequest $request, Board $board): ColumnResource
    {
        $this->authorize('create', [Column::class, $board]);

        $column = app(CreateColumnAction::class)->execute($board, $request->validated('name'));

        return ColumnResource::make($column)->response()->setStatusCode(201);
    }

    public function update(UpdateColumnRequest $request, Column $column): ColumnResource
    {
        $this->authorize('update', $column);

        $column->update($request->validated());

        return ColumnResource::make($column->fresh());
    }

    /**
     * Regra explícita e testada: coluna com cards NÃO pode ser excluída (422).
     */
    public function destroy(Request $request, Column $column): JsonResponse
    {
        $this->authorize('delete', $column);

        if ($column->cards()->exists()) {
            throw ValidationException::withMessages([
                'column' => 'A coluna contém cards. Mova-os antes de excluir.',
            ]);
        }

        $column->delete();

        return response()->noContent();
    }
}
