<?php

namespace App\Enums;

enum WorkspaceRole: string
{
    case Owner = 'owner';
    case Admin = 'admin';
    case Member = 'member';
    case Viewer = 'viewer';

    /**
     * Comparação hierárquica: Viewer < Member < Admin < Owner.
     * Centraliza a "matriz de permissões" em um único lugar testável.
     */
    public function atLeast(self $minimum): bool
    {
        return $this->rank() >= $minimum->rank();
    }

    private function rank(): int
    {
        return match ($this) {
            self::Viewer => 0,
            self::Member => 1,
            self::Admin => 2,
            self::Owner => 3,
        };
    }
}
