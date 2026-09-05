<?php

namespace App\Models;

use App\Enums\CardPriority;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Card extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'column_id', 'created_by', 'title', 'description',
        'priority', 'due_date', 'position',
    ];

    protected function casts(): array
    {
        return [
            'priority' => CardPriority::class,
            'due_date' => 'datetime',
        ];
    }

    public function column(): BelongsTo
    {
        return $this->belongsTo(Column::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'card_user')->withTimestamps();
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class, 'card_label');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * O card pertence INDIRETAMENTE ao workspace: card -> column -> board -> project.
     */
    public function workspaceId(): int
    {
        $this->loadMissing('column.board.project');

        return $this->column->board->project->workspace_id;
    }

    public function workspace(): ?Workspace
    {
        $this->loadMissing('column.board.project.workspace');

        return $this->column?->board?->project?->workspace;
    }
}
