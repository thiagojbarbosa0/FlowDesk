<?php

namespace App\Events;

use App\Models\Board;
use App\Models\User;
use App\Support\ActivityData;

final class BoardCreated extends ActivityEvent
{
    public function __construct(
        public readonly Board $board,
        public readonly User $actor,
    ) {}

    public function activity(): ActivityData
    {
        return new ActivityData(
            workspaceId: $this->board->project->workspace_id,
            userId: $this->actor->id,
            action: 'board.created',
            entityType: 'board',
            entityId: $this->board->id,
            metadata: ['name' => $this->board->name, 'project' => $this->board->project->name],
        );
    }
}
