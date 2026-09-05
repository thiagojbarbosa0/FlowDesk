<?php

namespace App\Actions\Project;

use App\Events\ProjectCreated;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;

class CreateProjectAction
{
    public function execute(User $actor, Workspace $workspace, string $name, ?string $description = null): Project
    {
        $project = $workspace->projects()->create([
            'name' => $name,
            'description' => $description,
        ]);

        ProjectCreated::dispatch($project, $actor);

        return $project;
    }
}
