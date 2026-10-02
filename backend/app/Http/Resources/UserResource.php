<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'email'          => $this->email,
            'avatar'         => $this->avatar,
            'role'           => $this->role,
            'department_id'  => $this->department_id,
            'department'     => $this->whenLoaded('department', function () {
                return $this->department?->name;
            }),
            'joined_at'      => $this->created_at->format('Y-m-d H:i:s'),
            'created_at'     => $this->created_at->toISOString(),
        ];
    }
}
