<?php

namespace App\Actions\Card;

use App\Events\CardMoved;
use App\Models\Card;
use App\Models\Column;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Estratégia oficial de ordenação:
 * - posições são INTEIROS com gap de 100;
 * - o "position" do payload é o índice ordinal (0-based) desejado na
 *   coluna de destino — NÃO um número cru persistido como veio;
 * - a coluna inteira é reindexada a cada movimento => posições ficam
 *   estáveis e nunca colidem, sem decimais;
 * - tudo dentro de transação com lock (SELECT ... FOR UPDATE) para
 *   evitar corrida entre movimentos simultâneos.
 */
class MoveCardAction
{
    public function execute(User $actor, Card $card, Column $targetColumn, int $index): Card
    {
        $card->loadMissing('column.board');

        if ($card->column->board_id !== $targetColumn->board_id) {
            throw ValidationException::withMessages([
                'column_id' => 'Cards só podem ser movidos dentro do mesmo board.',
            ]);
        }

        return DB::transaction(function () use ($actor, $card, $targetColumn, $index) {
            $sourceColumn = Column::findOrFail($card->column_id);

            $sourceIds = Card::where('column_id', $sourceColumn->id)
                ->whereKeyNot($card->id)
                ->orderBy('position')
                ->lockForUpdate()
                ->pluck('id');

            $targetIds = Card::where('column_id', $targetColumn->id)
                ->whereKeyNot($card->id)
                ->orderBy('position')
                ->lockForUpdate()
                ->pluck('id');

            $index = max(0, min($index, $targetIds->count()));

            $this->applyPositions($sourceIds, $sourceColumn->id);

            $targetIds->splice($index, 0, [$card->id]);
            $this->applyPositions($targetIds, $targetColumn->id);

            $card->refresh();
            CardMoved::dispatch($card, $actor, $sourceColumn, $targetColumn);

            return $card;
        });
    }

    private function applyPositions(Collection $ids, int $columnId): void
    {
        foreach ($ids as $i => $id) {
            Card::whereKey($id)->update([
                'column_id' => $columnId,
                'position' => ($i + 1) * 100,
            ]);
        }
    }
}
