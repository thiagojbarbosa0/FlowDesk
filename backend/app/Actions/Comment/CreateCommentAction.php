<?php

namespace App\Actions\Comment;

use App\Events\CommentCreated;
use App\Models\Card;
use App\Models\Comment;
use App\Models\User;

class CreateCommentAction
{
    public function execute(User $author, Card $card, string $body): Comment
    {
        $comment = $card->comments()->create([
            'author_id' => $author->id,
            'body' => $body,
        ]);

        CommentCreated::dispatch($card->loadMissing('column.board.project'), $comment);

        return $comment->load('author');
    }
}
