<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectMilestoneResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'project_id'        => $this->project_id,
            'milestone_name'    => $this->milestone_name,
            'description'       => $this->description,
            'start_date'        => $this->start_date?->format('Y-m-d'),
            'end_date'          => $this->end_date?->format('Y-m-d'),
            'weight_percentage' => (float) $this->weight_percentage,
            'target_quantity'   => $this->target_quantity ? (float) $this->target_quantity : null,
            'sequence_no'       => $this->sequence_no,
            'status'            => $this->status,
            'created_by' => $this->whenLoaded('creator', fn () => [
                'id'   => $this->creator->id,
                'name' => $this->creator->first_name . ' ' . $this->creator->last_name,
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
