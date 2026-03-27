<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AccountingApprovalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'Accounting';
    }

    public function rules(): array
    {
        return [
            'decision' => 'required|in:APPROVED,REJECTED',
            'comments' => 'required_if:decision,REJECTED|nullable|string|max:2000',
        ];
    }

    public function messages(): array
    {
        return [
            'comments.required_if' => 'A comment is required when rejecting a project.',
        ];
    }
}
