<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = [
        'company_name',
        'contact_person',
        'contact_number',
        'email',
        'address',
    ];

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}
