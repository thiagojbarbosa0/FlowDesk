<?php

namespace App\Events;

use App\Support\ActivityData;

abstract class ActivityEvent
{
    abstract public function activity(): ActivityData;
}
