<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('task'));
    }

    public function rules(): array
    {
        $task = $this->route('task');

        return [
            'title'        => ['sometimes', 'required', 'string', 'max:255'],
            'description'  => ['sometimes', 'required', 'string'],
            'phase_id'     => [
                'nullable', 'integer',
                Rule::exists('project_phases', 'id')->where('project_id', $task->project_id),
            ],
            'milestone_id' => [
                'nullable', 'integer',
                Rule::exists('project_milestones', 'id')->where('project_id', $task->project_id),
            ],
            'assigned_to'  => ['sometimes', 'required', 'integer', 'exists:users,id'],
            'priority'     => ['sometimes', 'required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'start_date'   => ['nullable', 'date'],
            'due_date'     => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $task        = $this->route('task');
            $milestoneId = $this->input('milestone_id');
            $phaseId     = $this->input('phase_id', $task->phase_id);

            if ($milestoneId && $phaseId) {
                $exists = \App\Models\ProjectMilestone::where('id', $milestoneId)
                    ->where('project_id', $task->project_id)
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
