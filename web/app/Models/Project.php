<?php

namespace App\Models;

use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'project_code',
        'project_name',
        'client_name',
        'address',
        'description',
        'contract_price',
        'contract_unit_price',
        'budget_for_materials',
        'start_date',
        'end_date',
        'status',
        'created_by',
        'project_in_charge_id',
        'accounting_approved_by',
        'accounting_approved_at',
        'executive_approved_by',
        'executive_approved_at',
        'rejected_by',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'status'                => ProjectStatus::class,
            'contract_price'        => 'decimal:2',
            'contract_unit_price'   => 'decimal:2',
            'budget_for_materials'  => 'decimal:2',
            'start_date'            => 'date',
            'end_date'              => 'date',
            'accounting_approved_at' => 'datetime',
            'executive_approved_at'  => 'datetime',
        ];
    }

    // ── Auto-generate project code ──────────────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (Project $project) {
            if (empty($project->project_code)) {
                $project->project_code = self::generateProjectCode();
            }
        });
    }

    public static function generateProjectCode(): string
    {
        $year = now()->format('Y');
        $prefix = "PRJ-{$year}-";

        $lastProject = self::withTrashed()
            ->where('project_code', 'like', "{$prefix}%")
            ->orderByDesc('project_code')
            ->first();

        if ($lastProject) {
            $lastNumber = (int) str_replace($prefix, '', $lastProject->project_code);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    // ── Relationships ───────────────────────────────────────────────────

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function projectInCharge(): BelongsTo
    {
        return $this->belongsTo(User::class, 'project_in_charge_id');
    }

    public function accountingApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accounting_approved_by');
    }

    public function executiveApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'executive_approved_by');
    }

    public function rejectedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function phases(): HasMany
    {
        return $this->hasMany(ProjectPhase::class)->orderBy('sequence_no');
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(ProjectMilestone::class)->orderBy('sequence_no');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(ProjectApproval::class)->orderByDesc('decided_at');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ProjectActivityLog::class)->orderByDesc('created_at');
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(ProjectRevision::class)->orderByDesc('created_at');
    }

    // ── Query Scopes ────────────────────────────────────────────────────

    public function scopeByStatus(Builder $query, string|ProjectStatus $status): Builder
    {
        $value = $status instanceof ProjectStatus ? $status->value : $status;
        return $query->where('status', $value);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->where('project_name', 'ilike', "%{$term}%")
              ->orWhere('client_name', 'ilike', "%{$term}%")
              ->orWhere('project_code', 'ilike', "%{$term}%");
        });
    }

    public function scopeCreatedByUser(Builder $query, int $userId): Builder
    {
        return $query->where('created_by', $userId);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    public function isEditable(): bool
    {
        return $this->status->isEditable();
    }
}
