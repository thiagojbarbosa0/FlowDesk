<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Card;
use App\Models\Column;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Métricas com consultas AGREGADAS no banco (count/groupBy),
     * nunca carregando centenas de cards no PHP para contar.
     */
    public function show(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);

        $projectIds = $workspace->projects()->pluck('id');
        $boardIds = Board::whereIn('project_id', $projectIds)->pluck('id');
        $columnIds = Column::whereIn('board_id', $boardIds)->pluck('id');

        $cards = fn () => Card::whereIn('column_id', $columnIds);

        return response()->json([
            'total' => $cards()->count(),
            'overdue' => $cards()->where('due_date', '<', now())->count(),
            'by_priority' => $cards()
                ->select('priority', DB::raw('count(*) as total'))
                ->groupBy('priority')
                ->pluck('total', 'priority'),
            'by_assignee' => DB::table('cards')
                ->join('card_user', 'cards.id', '=', 'card_user.card_id')
                ->join('users', 'card_user.user_id', '=', 'users.id')
                ->whereIn('cards.column_id', $columnIds)
                ->whereNull('cards.deleted_at')
                ->select('users.id', 'users.name', DB::raw('count(*) as total'))
                ->groupBy('users.id', 'users.name')
                ->orderByDesc('total')
                ->get(),
            'by_project' => DB::table('cards')
                ->join('columns', 'cards.column_id', '=', 'columns.id')
                ->join('boards', 'columns.board_id', '=', 'boards.id')
                ->join('projects', 'boards.project_id', '=', 'projects.id')
                ->whereIn('columns.board_id', $boardIds)
                ->whereNull('cards.deleted_at')
                ->whereNull('projects.deleted_at')
                ->select('projects.id', 'projects.name', DB::raw('count(*) as total'))
                ->groupBy('projects.id', 'projects.name')
                ->get(),
        ]);
    }
}
