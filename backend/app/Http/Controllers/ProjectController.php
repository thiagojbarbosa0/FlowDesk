<?php

namespace App\Http\Controllers;

use App\Actions\Project\CreateProjectAction;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);

        $projects = $workspace->projects()
            ->when($request->query('search'), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(min((int) $request->query('per_page', 15), 50));

        return ProjectResource::collection($projects)->response();
    }

    public function store(StoreProjectRequest $request, Workspace $workspace): ProjectResource
    {
        $this->authorize('create', [Project::class, $workspace]);

        $project = app(CreateProjectAction::class)->execute(
            $request->user(),
            $workspace,
            $request->validated('name'),
            $request->validated('description'),
        );

        return ProjectResource::make($project)->response()->setStatusCode(201);
    }

    public function show(Request $request, Project $project): ProjectResource
    {
        $this->authorize('view', $project);

        return ProjectResource::make($project->loadCount('boards'));
    }

    public function update(UpdateProjectRequest $request, Project $project): ProjectResource
    {
        $this->authorize('update', $project);

        $project->update($request->validated());

        return ProjectResource::make($project->fresh());
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $project->delete(); // soft delete

        return response()->noContent();
    }
}
