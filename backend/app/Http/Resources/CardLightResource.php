<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Versão "leve" do card: o suficiente para renderizar o Kanban.
 * Detalhes completos vêm de GET /cards/{card}.
 */
class CardLightResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'column_id' => $this->column_id,
            'title' => $this->title,
            'priority' => $this->priority->value,
            'due_date' => $this->due_date?->toISOString(),
            'position' => $this->position,
            'labels' => LabelResource::collection($this->whenLoaded('labels')),
            'assignees' => UserResource::collection($this->whenLoaded('assignees')),
            'comments_count' => $this->whenCounted('comments'),
        ];
    }
}
