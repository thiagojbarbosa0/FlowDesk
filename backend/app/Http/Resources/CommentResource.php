<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'card_id' => $this->card_id,
            'body' => $this->body,
            'author' => UserResource::make($this->whenLoaded('author')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
