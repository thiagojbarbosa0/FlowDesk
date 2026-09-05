<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLabelRequest;
use App\Http\Requests\UpdateLabelRequest;
use App\Http\Resources\LabelResource;
use App\Models\Label;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    public function index(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);

        return LabelResource::collection($workspace->labels()->orderBy('name')->get())->response();
    }

    public function store(StoreLabelRequest $request, Workspace $workspace): LabelResource
    {
        $this->authorize('manageLabels', $workspace);

        $label = $workspace->labels()->create($request->validated());

        return LabelResource::make($label)->response()->setStatusCode(201);
    }

    public function update(UpdateLabelRequest $request, Label $label): LabelResource
    {
        $this->authorize('update', $label);

        $label->update($request->validated());

        return LabelResource::make($label->fresh());
    }

    public function destroy(Request $request, Label $label): JsonResponse
    {
        $this->authorize('delete', $label);

        $label->delete();

        return response()->noContent();
    }
}
