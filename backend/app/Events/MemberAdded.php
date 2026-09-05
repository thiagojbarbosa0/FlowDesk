<?php

namespace App\Events;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use App\Support\ActivityData;

final class MemberAdded extends ActivityEvent
{
    public function __construct(
        public readonly Workspace $workspace,
        public readonly User $actor,
        public readonly User $member,
        public readonly WorkspaceRole $role,
    ) {}

    public function activity(): ActivityData
    {
        return new ActivityData(
            workspaceId: $this->workspace->id,
            userId: $this->actor->id,
            action: 'member.added',
            entityType: 'workspace',
            entityId: $this->workspace->id,
            metadata: [
                'member' => $this->member->name,
                'email' => $this->member->email,
                'role' => $this->role->value,
            ],
        );
    }
}
