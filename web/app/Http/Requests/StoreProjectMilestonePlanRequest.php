<?php

namespace App\Http\Requests;

use App\Enums\ProjectPhaseTitle;
use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectMilestonePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $project = $this->route('project');

        // Only Project Engineer can submit milestones
        if ($user->role !== 'Project Engineer') {
            return false;
        }

        // Only editable statuses
        return in_array($project->status, [
            ProjectStatus::PROPOSED,
            ProjectStatus::FOR_REVISION,
        ]);
    }

    public function rules(): array
    {
        $phaseTitleValues = ProjectPhaseTitle::values();

        return [
            // ── Phase-level ──
            'phases'                          => 'required|array|min:1|max:10',
            'phases.*.phase_key'              => ['required', 'string', Rule::in($phaseTitleValues)],
            'phases.*.weight_percentage'      => 'required|numeric|gt:0|max:100',
            'phases.*.start_date'             => 'required|date',
            'phases.*.end_date'               => 'required|date|after_or_equal:phases.*.start_date',

            // ── Milestone-level ──
            'phases.*.milestones'             => 'required|array|min:1',
            'phases.*.milestones.*.milestone_name' => 'required|string|max:255',
            'phases.*.milestones.*.start_date'     => 'required|date',
            'phases.*.milestones.*.end_date'       => 'required|date|after_or_equal:phases.*.milestones.*.start_date',
            'phases.*.milestones.*.has_quantity'    => 'boolean',
            'phases.*.milestones.*.quantity_target' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * Custom validation after standard rules pass.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $phases = $this->input('phases', []);

            // ── Total weight must equal 100 ──
            $totalWeight = collect($phases)->sum('weight_percentage');
            if (abs($totalWeight - 100) > 0.01) {
                $validator->errors()->add('phases', "Total phase weight must equal 100%. Current total: {$totalWeight}%.");
            }

            // ── No duplicate phase keys ──
            $keys = collect($phases)->pluck('phase_key')->filter();
            if ($keys->count() !== $keys->unique()->count()) {
                $validator->errors()->add('phases', 'Each phase title must be unique within a project.');
            }

            // ── Milestone dates must be within parent phase range ──
            foreach ($phases as $pi => $phase) {
                $phaseStart = $phase['start_date'] ?? null;
                $phaseEnd   = $phase['end_date'] ?? null;
                if (!$phaseStart || !$phaseEnd) continue;

                foreach (($phase['milestones'] ?? []) as $mi => $ms) {
                    $msStart = $ms['start_date'] ?? null;
                    $msEnd   = $ms['end_date'] ?? null;
                    if (!$msStart || !$msEnd) continue;

                    if ($msStart < $phaseStart || $msEnd > $phaseEnd) {
                        $validator->errors()->add(
                            "phases.{$pi}.milestones.{$mi}",
                            "Milestone dates must fall within the phase date range ({$phaseStart} to {$phaseEnd})."
                        );
                    }
                }
            }

            // ── quantity_target required when has_quantity is true ──
            foreach ($phases as $pi => $phase) {
                foreach (($phase['milestones'] ?? []) as $mi => $ms) {
                    if (!empty($ms['has_quantity']) && empty($ms['quantity_target'])) {
                        $validator->errors()->add(
                            "phases.{$pi}.milestones.{$mi}.quantity_target",
                            'Quantity target is required when "has quantity" is enabled.'
                        );
                    }
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'phases.required'                      => 'At least one phase is required.',
            'phases.min'                           => 'At least one phase is required.',
            'phases.max'                           => 'Maximum 10 phases allowed.',
            'phases.*.phase_key.required'           => 'Phase title is required.',
            'phases.*.phase_key.in'                => 'Invalid phase title selected.',
            'phases.*.milestones.required'          => 'Each phase must have at least one milestone.',
            'phases.*.milestones.min'              => 'Each phase must have at least one milestone.',
        ];
    }
}
