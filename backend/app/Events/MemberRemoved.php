<?php

namespace App\Events;

use App\Models\User;
use App\Models\Workspace;
use App\Support\ActivityData;

final class MemberRemoved extends ActivityEvent
{
    public function __construct(
        public readonly Workspace $workspace,
        public readonly User $actor,
        public readonly User $member,
    ) {}

    public function activity(): ActivityData
    {
        return new ActivityData(
            workspaceId: $this->workspace->id,
            userId: $this->actor->id,
            action: 'member.removed',
            entityType: 'workspace',
            entityId: $this->workspace->id,
            metadata: ['member' => $this->member->email],
        );
    }
}
