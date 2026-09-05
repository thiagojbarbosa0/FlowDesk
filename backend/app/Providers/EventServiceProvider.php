<?php

namespace App\Providers;

use App\Events\BoardCreated;
use App\Events\CardAssigned;
use App\Events\CardCreated;
use App\Events\CardMoved;
use App\Events\CardUnassigned;
use App\Events\CardUpdated;
use App\Events\CommentCreated;
use App\Events\LabelAttached;
use App\Events\MemberAdded;
use App\Events\MemberRemoved;
use App\Events\MemberRoleChanged;
use App\Events\ProjectCreated;
use App\Events\WorkspaceCreated;
use App\Listeners\NotifyAssignee;
use App\Listeners\NotifyCardStakeholders;
use App\Listeners\RecordActivity;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // 1) Todo evento de domínio alimenta o Activity Log.
        foreach ([
            WorkspaceCreated::class, MemberAdded::class, MemberRoleChanged::class, MemberRemoved::class,
            ProjectCreated::class, BoardCreated::class,
            CardCreated::class, CardUpdated::class, CardMoved::class,
            CardAssigned::class, CardUnassigned::class,
            CommentCreated::class, LabelAttached::class,
        ] as $event) {
            Event::listen($event, RecordActivity::class);
        }

        // 2) Efeitos colaterais desacoplados: notificações.
        Event::listen(CardAssigned::class, NotifyAssignee::class);
        Event::listen(CommentCreated::class, NotifyCardStakeholders::class);
    }
}
