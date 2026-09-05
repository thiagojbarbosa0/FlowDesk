<?php

namespace App\Http\Controllers;

use App\Actions\Workspace\CreateWorkspaceAction;
use App\Http\Requests\StoreWorkspaceRequest;
use App\Http\Requests\UpdateWorkspaceRequest;
use App\Http\Resources\WorkspaceResource;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkspaceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $workspaces = $request->user()->workspaces()
            ->withCount(['projects', 'members'])
            ->get();

        return WorkspaceResource::collection($workspaces)->response();
    }

    public function store(StoreWorkspaceRequest $request): WorkspaceResource
    {
        $workspace = app(CreateWorkspaceAction::class)
            ->execute($request->user(), $request->validated('name'));

        return WorkspaceResource::make($workspace)->response()->setStatusCode(201);
    }

    public function show(Request $request, Workspace $workspace): WorkspaceResource
    {
        // Autorização explícita + re-consulta pela relation do usuário
        // (o findOrFail também devolve 404 para não-membros: defesa em profundidade).
        $this->authorize('view', $workspace);

        $workspace = $request->user()->workspaces()
            ->withCount(['projects', 'members'])
            ->findOrFail($workspace->id);

        return WorkspaceResource::make($workspace);
    }

    public function update(UpdateWorkspaceRequest $request, Workspace $workspace): WorkspaceResource
    {
        $this->authorize('update', $workspace);

        $workspace->update($request->validated());

        return WorkspaceResource::make($workspace->fresh());
    }

    public function destroy(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('delete', $workspace);

        $workspace->delete(); // FKs em cascata removem tudo abaixo.

        return response()->noContent();
    }
}
