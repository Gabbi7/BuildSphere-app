<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'project_code'        => $this->project_code,
            'project_name'        => $this->project_name,
            'client_name'         => $this->client_name,
            'address'             => $this->address,
            'description'         => $this->description,
            'contract_price'      => (float) $this->contract_price,
            'contract_unit_price' => $this->contract_unit_price ? (float) $this->contract_unit_price : null,
            'budget_for_materials'=> $this->budget_for_materials ? (float) $this->budget_for_materials : null,
            'start_date'          => $this->start_date?->format('Y-m-d'),
            'end_date'            => $this->end_date?->format('Y-m-d'),
            'status'              => $this->status->value,
            'status_label'        => $this->status->label(),
            'status_badge_label'  => $this->status->badgeLabel(),
            'status_badge_color'  => $this->status->badgeColor(),
            'is_editable'         => $this->isEditable(),

            // Relationships
            'created_by' => $this->whenLoaded('creator', fn () => [
                'id'   => $this->creator->id,
                'name' => $this->creator->first_name . ' ' . $this->creator->last_name,
            ]),
            'project_in_charge' => $this->whenLoaded('projectInCharge', fn () => $this->projectInCharge ? [
                'id'   => $this->projectInCharge->id,
                'name' => $this->projectInCharge->first_name . ' ' . $this->projectInCharge->last_name,
            ] : null),

            // Counts
            'milestones_count' => $this->whenCounted('milestones'),

            // Timestamps
            'created_at' => $this->created_at?->format('m/d/Y'),
            'updated_at' => $this->updated_at?->toISOString(),

            // Approval info
            'rejection_reason' => $this->rejection_reason,
            'accounting_approved_at' => $this->accounting_approved_at?->toISOString(),
            'executive_approved_at'  => $this->executive_approved_at?->toISOString(),
        ];
    }
}
