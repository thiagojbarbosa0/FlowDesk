<?php

namespace App\Support;

/**
 * DTO imutável que descreve uma entrada de Activity Log.
 * Os eventos de domínio o produzem; o listener RecordActivity o persiste.
 */
final class ActivityData
{
    public function __construct(
        public readonly int $workspaceId,
        public readonly int $userId,
        public readonly string $action,
        public readonly string $entityType,
        public readonly int $entityId,
        public readonly array $metadata = [],
    ) {}

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
