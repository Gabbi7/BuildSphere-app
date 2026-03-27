<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Task::class);
    }

    public function rules(): array
    {
        return [
            'title'        => ['required', 'string', 'max:255'],
            'description'  => ['required', 'string'],
            'project_id'   => ['required', 'integer', 'exists:projects,id'],
            'phase_id'     => [
                'nullable', 'integer',
                Rule::exists('project_phases', 'id')->where('project_id', $this->input('project_id')),
            ],
            'milestone_id' => [
                'nullable', 'integer',
                Rule::exists('project_milestones', 'id')->where('project_id', $this->input('project_id')),
            ],
            'assigned_to'  => ['required', 'integer', 'exists:users,id'],
            'priority'     => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'status'       => ['sometimes', Rule::in(['todo', 'in_progress', 'in_review', 'completed'])],
            'start_date'   => ['nullable', 'date'],
            'due_date'     => ['required', 'date', 'after_or_equal:start_date'],
            'attachments'  => ['sometimes', 'nullable', 'array'],
            'attachments.*' => [
                'file',
                'max:10240', // 10 MB per file
                'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // If milestone is selected and phase is selected, verify milestone belongs to that phase
            $milestoneId = $this->input('milestone_id');
            $phaseId     = $this->input('phase_id');
            $projectId   = $this->input('project_id');

            if ($milestoneId && $phaseId) {
                $exists = \App\Models\ProjectMilestone::where('id', $milestoneId)
                    ->where('project_id', $projectId)
                    ->where('project_phase_id', $phaseId)
                    ->exists();

                if (! $exists) {
                    $validator->errors()->add(
                        'milestone_id',
                        'The selected milestone does not belong to the selected phase.'
                    );
                }
            }
        });
    }
}
