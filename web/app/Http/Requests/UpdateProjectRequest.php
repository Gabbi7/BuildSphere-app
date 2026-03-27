<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        $project = $this->route('project');
        return $this->user()->role === 'Sales' && $project->isEditable();
    }

    public function rules(): array
    {
        return [
            'project_name'        => 'sometimes|required|string|max:255',
            'client_name'         => 'sometimes|required|string|max:255',
            'address'             => 'sometimes|required|string|max:1000',
            'description'         => 'nullable|string|max:5000',
            'contract_price'      => 'sometimes|required|numeric|min:0',
            'contract_unit_price' => 'nullable|numeric|min:0',
            'budget_for_materials'=> 'nullable|numeric|min:0',
            'start_date'          => 'sometimes|required|date',
            'end_date'            => 'sometimes|required|date|after_or_equal:start_date',
            'project_in_charge_id'=> 'nullable|exists:users,id',
        ];
    }
}
