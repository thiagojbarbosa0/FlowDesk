<?php

use App\Jobs\SendDueDateReminders;
use Illuminate\Support\Facades\Schedule;

// O job é idempotente (ver App\Jobs\SendDueDateReminders): reexecuções no
// mesmo dia não duplicam notificações.
Schedule::job(new SendDueDateReminders)->dailyAt('08:00');
