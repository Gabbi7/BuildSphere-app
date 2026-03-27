<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case PROPOSED                    = 'PROPOSED';
    case PENDING_MILESTONES          = 'PENDING_MILESTONES';
    case PENDING_ACCOUNTING_APPROVAL = 'PENDING_ACCOUNTING_APPROVAL';
    case PENDING_EXECUTIVE_APPROVAL  = 'PENDING_EXECUTIVE_APPROVAL';
    case FOR_REVISION                = 'FOR_REVISION';
    case REJECTED                    = 'REJECTED';
    case ONGOING                     = 'ONGOING';
    case COMPLETED                   = 'COMPLETED';

    /**
     * User-friendly display label for frontend badges.
     */
    public function label(): string
    {
        return match ($this) {
            self::PROPOSED                    => 'Proposed',
            self::PENDING_MILESTONES          => 'Pending Milestones',
            self::PENDING_ACCOUNTING_APPROVAL => 'Pending Accounting Approval',
            self::PENDING_EXECUTIVE_APPROVAL  => 'Pending Executive Approval',
            self::FOR_REVISION                => 'For Revision',
            self::REJECTED                    => 'Rejected',
            self::ONGOING                     => 'Ongoing',
            self::COMPLETED                   => 'Completed',
        };
    }

    /**
     * Badge display label (shorter, for compact badges).
     */
    public function badgeLabel(): string
    {
        return match ($this) {
            self::PROPOSED                    => 'Proposed',
            self::PENDING_MILESTONES          => 'Pending Milestones',
            self::PENDING_ACCOUNTING_APPROVAL => 'For Approval',
            self::PENDING_EXECUTIVE_APPROVAL  => 'For Approval',
            self::FOR_REVISION                => 'For Revision',
            self::REJECTED                    => 'Rejected',
            self::ONGOING                     => 'Approved',
            self::COMPLETED                   => 'Completed',
        };
    }

    /**
     * Tailwind badge color classes.
     */
    public function badgeColor(): string
    {
        return match ($this) {
            self::PROPOSED                    => 'bg-blue-100 text-blue-700',
            self::PENDING_MILESTONES          => 'bg-yellow-100 text-yellow-700',
            self::PENDING_ACCOUNTING_APPROVAL => 'bg-orange-100 text-orange-600',
            self::PENDING_EXECUTIVE_APPROVAL  => 'bg-orange-100 text-orange-600',
            self::FOR_REVISION                => 'bg-red-100 text-red-600',
            self::REJECTED                    => 'bg-red-100 text-red-700',
            self::ONGOING                     => 'bg-green-100 text-green-700',
            self::COMPLETED                   => 'bg-emerald-100 text-emerald-700',
        };
    }

    /**
     * Whether the project can be edited (by Sales).
     */
    public function isEditable(): bool
    {
        return in_array($this, [self::PROPOSED, self::FOR_REVISION]);
    }

    /**
     * All statuses as an array for validation rules.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
