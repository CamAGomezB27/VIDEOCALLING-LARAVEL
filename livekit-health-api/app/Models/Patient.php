<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'birth_date',
        'document_number',
        'notes',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function appointments(): HasMany {
        return $this->hasMany(Appointment::class);
    }
}