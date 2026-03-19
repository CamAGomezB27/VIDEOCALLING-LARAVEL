<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'doctor_id',
        'patient_id',
        'scheduled_at',
        'duration',
        'status',
        'livekit_room_name',
        'started_at',
        'ended_at',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at'   => 'datetime',
        'ended_at'     => 'datetime',
        'duration'     => 'integer',
    ];

    // Relaciones
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    // Helpers de estado
    public function isJoinable(): bool
    {
        if ($this->status !== 'scheduled') return false;

        $windowStart = $this->scheduled_at->subMinutes(10);
        $windowEnd   = $this->scheduled_at->addMinutes($this->duration);

        return now()->between($windowStart, $windowEnd);
    }
}