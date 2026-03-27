<?php

namespace App\Services;

use App\Enums\ProjectPhaseTitle;
use App\Models\Project;
use Carbon\Carbon;

class ProjectMilestoneChartService
{
    /**
     * Build the full chart payload for a project.
     */
    public function buildChartPayload(Project $project): array
    {
        $project->load([
            'phases.milestones',
            'approvals.approver',
            'creator',
        ]);

        $phases = $project->phases;

        // ── Determine timeline months ──────────────────────────────────
        $allDates = collect();
        foreach ($phases as $phase) {
            $allDates->push($phase->start_date, $phase->end_date);
            foreach ($phase->milestones as $ms) {
                $allDates->push($ms->start_date, $ms->end_date);
            }
        }

        $timelineMonths = [];
        if ($allDates->isNotEmpty()) {
            $minDate = $allDates->min();
            $maxDate = $allDates->max();

            $cursor = Carbon::parse($minDate)->startOfMonth();
            $end    = Carbon::parse($maxDate)->startOfMonth();

            while ($cursor->lte($end)) {
                $timelineMonths[] = [
                    'key'   => $cursor->format('Y-m'),
                    'label' => $cursor->format('F'),
                    'year'  => (int) $cursor->format('Y'),
                ];
                $cursor->addMonth();
            }
        }

        // ── Build phase + milestone data ───────────────────────────────
        $phaseData = [];
        foreach ($phases as $phase) {
            $milestoneData = [];
            foreach ($phase->milestones as $ms) {
                $milestoneData[] = [
                    'id'              => $ms->id,
                    'milestone_name'  => $ms->milestone_name,
                    'start_date'      => $ms->start_date->format('Y-m-d'),
                    'end_date'        => $ms->end_date->format('Y-m-d'),
                    'has_quantity'    => (bool) $ms->has_quantity,
                    'quantity_target' => $ms->target_quantity ? (float) $ms->target_quantity : null,
                    'sequence_no'     => $ms->sequence_no,
                    'month_spans'     => $this->getMonthSpans($ms->start_date, $ms->end_date),
                ];
            }

            $phaseData[] = [
                'id'                => $phase->id,
                'phase_key'         => $phase->phase_key,
                'phase_title'       => $phase->phase_title, // derived from accessor
                'weight_percentage' => (float) $phase->weight_percentage,
                'start_date'        => $phase->start_date->format('Y-m-d'),
                'end_date'          => $phase->end_date->format('Y-m-d'),
                'sequence_no'       => $phase->sequence_no,
                'milestones'        => $milestoneData,
            ];
        }

        // ── Approval history ───────────────────────────────────────────
        $approvalHistory = $project->approvals->map(fn ($a) => [
            'stage'         => $a->approval_stage,
            'decision'      => $a->decision,
            'approver_name' => $a->approver
                ? $a->approver->first_name . ' ' . $a->approver->last_name
                : null,
            'comments'      => $a->comments,
            'decided_at'    => $a->decided_at?->toISOString(),
        ])->toArray();

        // ── Last submission info ───────────────────────────────────────
        $lastSubmissionLog = $project->activityLogs()
            ->whereIn('action', ['MILESTONES_SUBMITTED', 'MILESTONES_RESUBMITTED'])
            ->orderByDesc('created_at')
            ->first();

        return [
            'project_id'       => $project->id,
            'project_name'     => $project->project_name,
            'timeline_months'  => $timelineMonths,
            'phases'           => $phaseData,
            'approval_history' => $approvalHistory,
            'submitted_by'     => $lastSubmissionLog
                ? ($lastSubmissionLog->user
                    ? $lastSubmissionLog->user->first_name . ' ' . $lastSubmissionLog->user->last_name
                    : null)
                : ($project->creator
                    ? $project->creator->first_name . ' ' . $project->creator->last_name
                    : null),
            'submitted_at'     => $lastSubmissionLog?->created_at?->toISOString(),
        ];
    }

    /**
     * Get array of month keys a milestone spans.
     */
    private function getMonthSpans(Carbon $start, Carbon $end): array
    {
        $spans  = [];
        $cursor = $start->copy()->startOfMonth();
        $endMonth = $end->copy()->startOfMonth();

        while ($cursor->lte($endMonth)) {
            $spans[] = $cursor->format('Y-m');
            $cursor->addMonth();
        }

        return $spans;
    }
}
