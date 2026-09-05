<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActivityResource;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);

        $activities = $workspace->activityLogs()
            ->with('user:id,name')
            ->latest('id')
            ->paginate(min((int) $request->query('per_page', 30), 100));

        return ActivityResource::collection($activities)->response();
    }
}
