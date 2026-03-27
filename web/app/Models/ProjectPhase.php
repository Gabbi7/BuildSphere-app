<?php

namespace App\Models;

use App\Enums\ProjectPhaseTitle;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectPhase extends Model
{
    protected $fillable = [
        'project_id',
        'phase_key',
        'sequence_no',
        'weight_percentage',
        'start_date',
        'end_date',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'start_date'        => 'date',
            'end_date'          => 'date',
            'weight_percentage' => 'decimal:2',
        ];
    }

    // ── Accessors ───────────────────────────────────────────────────────

    /**
     * Derive display label from enum.
     */
    public function getPhaseTitleAttribute(): string
    {
        return ProjectPhaseTitle::from($this->phase_key)->label();
    }

    // ── Relationships ───────────────────────────────────────────────────

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(ProjectMilestone::class, 'project_phase_id')->orderBy('sequence_no');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
