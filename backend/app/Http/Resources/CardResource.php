<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'column_id' => $this->column_id,
            'board_id' => $this->whenLoaded('column', fn () => $this->column->board_id),
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority->value,
            'due_date' => $this->due_date?->toISOString(),
            'position' => $this->position,
            'created_by' => $this->created_by,
            'creator' => UserResource::make($this->whenLoaded('creator')),
            'assignees' => UserResource::collection($this->whenLoaded('assignees')),
            'labels' => LabelResource::collection($this->whenLoaded('labels')),
            'comments' => CommentResource::collection($this->whenLoaded('comments')),
            'comments_count' => $this->whenCounted('comments'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
