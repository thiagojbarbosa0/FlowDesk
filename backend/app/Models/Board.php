<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Board extends Model
{
    use SoftDeletes;

    protected $fillable = ['project_id', 'name'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function columns(): HasMany
    {
        return $this->hasMany(Column::class)->orderBy('position');
    }

    /**
     * Payload ideal para o endpoint show(): colunas + cards leves
     * (com contadores), sem transformar a resposta num dump gigante.
     */
    public function loadForRendering(): self
    {
        return $this->load([
            'project:id,name,workspace_id',
            'columns' => fn ($q) => $q->orderBy('position'),
            'columns.cards' => fn ($q) => $q
                ->withCount('comments')
                ->with([
                    'assignees' => fn ($u) => $u->select('users.id', 'users.name', 'users.email'),
                    'labels',
                ])
                ->orderBy('position'),
        ]);
    }
}
