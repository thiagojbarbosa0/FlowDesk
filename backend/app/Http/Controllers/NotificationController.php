<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $paginator = $request->user()->notifications()->latest('id')->paginate(30);

        return response()->json([
            'data' => NotificationResource::collection($paginator->items())->resolve(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
                'unread_count' => $request->user()->notifications()->unread()->count(),
            ],
        ]);
    }

    public function markRead(Request $request, int $notification): JsonResponse
    {
        $model = $request->user()->notifications()->whereKey($notification)->firstOrFail();

        $model->update(['read_at' => now()]);

        return NotificationResource::make($model->fresh())->response();
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->notifications()->unread()->update(['read_at' => now()]);

        return response()->noContent();
    }
}
