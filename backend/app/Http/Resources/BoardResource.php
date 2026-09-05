<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BoardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'project_id' => $this->project_id,
            'workspace_id' => $this->whenLoaded('project', fn () => $this->project->workspace_id),
            'columns' => ColumnResource::collection($this->whenLoaded('columns')),
        ];
    }
}
