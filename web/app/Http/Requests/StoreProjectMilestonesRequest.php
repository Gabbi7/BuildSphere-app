<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectMilestonesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'Project Engineer';
    }

    public function rules(): array
    {
        return [
            'milestones'                    => 'required|array|min:1',
            'milestones.*.milestone_name'   => 'required|string|max:255',
            'milestones.*.description'      => 'nullable|string|max:2000',
            'milestones.*.start_date'       => 'required|date',
            'milestones.*.end_date'         => 'required|date|after_or_equal:milestones.*.start_date',
            'milestones.*.weight_percentage'=> 'required|numeric|min:0.01|max:100',
            'milestones.*.target_quantity'  => 'nullable|numeric|min:0',
            'milestones.*.sequence_no'      => 'required|integer|min:1',
        ];
    }

    /**
     * Additional validation: total weight must equal 100.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $milestones = $this->input('milestones', []);
            $totalWeight = collect($milestones)->sum('weight_percentage');

            if (abs($totalWeight - 100) > 0.01) {
                $validator->errors()->add(
                    'milestones',
                    "Total milestone weight must equal 100%. Current total: {$totalWeight}%"
                );
            }
        });
    }
}
