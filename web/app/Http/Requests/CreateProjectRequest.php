<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'Sales';
    }

    public function rules(): array
    {
        return [
            'project_name'        => 'required|string|max:255',
            'client_name'         => 'required|string|max:255',
            'address'             => 'required|string|max:1000',
            'description'         => 'nullable|string|max:5000',
            'contract_price'      => 'required|numeric|min:0',
            'contract_unit_price' => 'nullable|numeric|min:0',
            'budget_for_materials'=> 'nullable|numeric|min:0',
            'start_date'          => 'required|date',
            'end_date'            => 'required|date|after_or_equal:start_date',
            'project_in_charge_id'=> 'nullable|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'end_date.after_or_equal' => 'Project end date must be on or after the start date.',
        ];
    }
}
