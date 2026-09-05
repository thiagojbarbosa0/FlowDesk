<?php

namespace App\Jobs;

use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class CreateNotificationJob implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function __construct(
        public int $userId,
        public string $type,
        public string $title,
        public array $data = [],
    ) {}

    public function handle(): void
    {
        Notification::create([
            'user_id' => $this->userId,
            'type' => $this->type,
            'title' => $this->title,
            'data' => $this->data,
        ]);
    }
}
