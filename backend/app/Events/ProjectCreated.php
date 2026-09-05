<?php

namespace App\Events;

use App\Models\Project;
use App\Models\User;
use App\Support\ActivityData;

final class ProjectCreated extends ActivityEvent
{
    public function __construct(
        public readonly Project $project,
        public readonly User $actor,
    ) {}

    public function activity(): ActivityData
    {
        return new ActivityData(
            workspaceId: $this->project->workspace_id,
            userId: $this->actor->id,
            action: 'project.created',
            entityType: 'project',
            entityId: $this->project->id,
            metadata: ['name' => $this->project->name],
        );
    }
}
