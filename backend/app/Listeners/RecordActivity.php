<?php

namespace App\Listeners;

use App\Events\ActivityEvent;
use App\Models\ActivityLog;

/**
 * Listener genérico: qualquer evento de domínio que estenda ActivityEvent
 * vira uma linha no activity_logs. O log NUNCA depende do frontend.
 */
class RecordActivity
{
    public function handle(ActivityEvent $event): void
    {
        ActivityLog::create($event->activity()->toArray());
    }
}
