<?php

namespace App\Enums;

enum ProjectPhaseTitle: string
{
    case PREPARATION_PLANNING   = 'PREPARATION_PLANNING';
    case CLIENT_KICKOFF_MEETING = 'CLIENT_KICKOFF_MEETING';
    case PROCUREMENT            = 'PROCUREMENT';
    case MOBILIZATION           = 'MOBILIZATION';
    case EXECUTION              = 'EXECUTION';
    case COMPLETION             = 'COMPLETION';
    case CLOSE_OUT              = 'CLOSE_OUT';

    /**
     * Human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::PREPARATION_PLANNING   => 'Preparation & Planning',
            self::CLIENT_KICKOFF_MEETING => 'Client Kick-off Meeting',
            self::PROCUREMENT            => 'Procurement',
            self::MOBILIZATION           => 'Mobilization',
            self::EXECUTION              => 'Execution',
            self::COMPLETION             => 'Completion',
            self::CLOSE_OUT              => 'Close Out',
        };
    }

    /**
     * All enum values as a flat array (for validation rules).
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Key-label pairs for frontend dropdown.
     */
    public static function options(): array
    {
        return array_map(
            fn (self $case) => ['key' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }
}
