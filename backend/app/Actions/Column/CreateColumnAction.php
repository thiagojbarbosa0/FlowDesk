<?php

namespace App\Actions\Column;

use App\Models\Board;
use App\Models\Column;

class CreateColumnAction
{
    public function execute(Board $board, string $name): Column
    {
        $position = ((int) $board->columns()->max('position')) + 100;

        return $board->columns()->create(['name' => $name, 'position' => $position]);
    }
}
