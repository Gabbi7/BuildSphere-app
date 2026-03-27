<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'company_name'   => $this->company_name,
            'contact_person' => $this->contact_person,
            'contact_number' => $this->contact_number,
            'email'          => $this->email,
            'address'        => $this->address,
        ];
    }
}
