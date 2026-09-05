<?php

namespace App\Http\Controllers;

use App\Actions\Comment\CreateCommentAction;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Card;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Request $request, Card $card): JsonResponse
    {
        $this->authorize('view', $card);

        $comments = $card->comments()
            ->with('author:id,name')
            ->latest('id')
            ->paginate(min((int) $request->query('per_page', 20), 100));

        return CommentResource::collection($comments)->response();
    }

    public function store(StoreCommentRequest $request, Card $card): CommentResource
    {
        $this->authorize('create', [\App\Models\Comment::class, $card]);

        $comment = app(CreateCommentAction::class)->execute(
            $request->user(),
            $card,
            $request->validated('body'),
        );

        return CommentResource::make($comment)->response()->setStatusCode(201);
    }
}
