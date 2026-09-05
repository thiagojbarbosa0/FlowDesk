<?php

namespace App\Events;

use App\Models\User;
use App\Models\Workspace;
use App\Support\ActivityData;

final class WorkspaceCreated extends ActivityEvent
{
    public function __construct(
        public readonly Workspace $workspace,
        public readonly User $actor,
    ) {}

    public function activity(): ActivityData
    {
        return new ActivityData(
            workspaceId: $this->workspace->id,
            userId: $this->actor->id,
            action: 'workspace.created',
            entityType: 'workspace',
            entityId: $this->workspace->id,
            metadata: ['name' => $this->workspace->name],
        );
    }
}
