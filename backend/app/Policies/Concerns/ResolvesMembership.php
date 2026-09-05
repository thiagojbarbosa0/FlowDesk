<?php

namespace App\Policies\Concerns;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;

/**
 * Convenção de segurança do FlowDesk:
 * - Usuário que NÃO é membro do workspace => 404 (esconde a existência do recurso).
 * - Membro sem permissão suficiente => 403 (explícito).
 */
trait ResolvesMembership
{
    protected function roleOrNotFound(User $user, ?Workspace $workspace): WorkspaceRole
    {
        $role = $workspace?->roleOf($user);

        if ($role === null) {
            abort(404);
        }

        return $role;
    }
}
