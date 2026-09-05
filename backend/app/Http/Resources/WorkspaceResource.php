<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkspaceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'owner_id' => $this->owner_id,
            'role' => $this->when($this->pivot, fn () => $this->pivot->role->value),
            'projects_count' => $this->whenCounted('projects'),
            'members_count' => $this->whenCounted('members'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
