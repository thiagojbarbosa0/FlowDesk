<?php

namespace App\Actions\Board;

use App\Events\BoardCreated;
use App\Models\Board;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateBoardAction
{
    private const DEFAULT_COLUMNS = ['Backlog', 'In Progress', 'Review', 'Done'];

    /**
     * Decisão de produto: todo board nasce com 4 colunas padrão,
     * criadas na mesma transação com posições espaçadas (gap 100).
     */
    public function execute(User $actor, Project $project, string $name): Board
    {
        $board = DB::transaction(function () use ($project, $name) {
            $board = $project->boards()->create(['name' => $name]);

            foreach (self::DEFAULT_COLUMNS as $i => $columnName) {
                $board->columns()->create([
                    'name' => $columnName,
                    'position' => ($i + 1) * 100,
                ]);
            }

            return $board;
        });

        BoardCreated::dispatch($board->load('project'), $actor);

        return $board;
    }
}
