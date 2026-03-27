<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('uploadAttachment', $this->route('task'));
    }

    public function rules(): array
    {
        return [
            'files'   => ['required', 'array', 'min:1'],
            'files.*' => [
                'required',
                'file',
                'max:10240', // 10 MB per file
                'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
            ],
        ];
    }
}
