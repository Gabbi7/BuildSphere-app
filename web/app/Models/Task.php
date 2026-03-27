<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'project_id',
        'phase_id',
        'milestone_id',
        'title',
        'description',
        'assigned_by',
        'assigned_to',
        'priority',
        'status',
        'department_role',
        'visibility_scope',
        'start_date',
        'due_date',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'due_date'   => 'date',
        ];
    }

    // ── Visibility Logic ────────────────────────────────────────────────

    /**
     * Reusable condition for whether a single task is visible to a user.
     */
    public function isVisibleTo(User $user): bool
    {
        $role = str_replace(' ', '_', strtolower($user->role));
        if (in_array($role, ['ceo', 'coo'], true)) {
            return true;
        }

        return $this->assigned_to === $user->id || $this->assigned_by === $user->id;
    }

    /**
     * Query scope to filter tasks logically.
     */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        $role = str_replace(' ', '_', strtolower($user->role));
        if (in_array($role, ['ceo', 'coo'], true)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($user) {
            $q->where('assigned_to', $user->id)
              ->orWhere('assigned_by', $user->id);
        });
    }

    // ── Relationships ───────────────────────────────────────────────────

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function phase(): BelongsTo
    {
        return $this->belongsTo(ProjectPhase::class, 'phase_id');
    }

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(ProjectMilestone::class, 'milestone_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class)->orderBy('created_at');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class)->orderBy('created_at');
    }
}
