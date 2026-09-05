<?php

namespace App\Http\Controllers;

use App\Actions\Board\CreateBoardAction;
use App\Http\Requests\StoreBoardRequest;
use App\Http\Resources\BoardResource;
use App\Models\Board;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $boards = $project->boards()->orderBy('name')->paginate(min((int) $request->query('per_page', 50), 100));

        return BoardResource::collection($boards)->response();
    }

    public function store(StoreBoardRequest $request, Project $project): BoardResource
    {
        $this->authorize('create', [Board::class, $project]);

        $board = app(CreateBoardAction::class)->execute($request->user(), $project, $request->validated('name'));

        return BoardResource::make($board->loadForRendering())->response()->setStatusCode(201);
    }

    public function show(Request $request, Board $board): BoardResource
    {
        $this->authorize('view', $board);

        return BoardResource::make($board->loadForRendering());
    }

    public function update(Request $request, Board $board): BoardResource
    {
        $this->authorize('update', $board);

        $board->update($request->validate(['name' => ['sometimes', 'required', 'string', 'max:120']]));

        return BoardResource::make($board->fresh());
    }

    public function destroy(Request $request, Board $board): JsonResponse
    {
        $this->authorize('delete', $board);

        $board->delete();

        return response()->noContent();
    }
}
