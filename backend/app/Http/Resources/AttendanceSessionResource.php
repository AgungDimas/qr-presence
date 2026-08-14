<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'qr_code_data' => $this->qr_code_data, 
            'valid_until' => $this->valid_until->format('Y-m-d H:i:s'),
            'is_active' => $this->is_active,
            'location' => [
                'latitude' => $this->latitude,
                'longitude' => $this->longitude,
                'radius' => $this->radius,
            ],
            'created_by' => $this->whenLoaded('creator', function() {
                return $this->creator->name;
            }),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
