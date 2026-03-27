<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppointmentChat extends Model
{
    protected $fillable = [
        'appointment_id',
        'sender_id',
        'sender_type',
        'sender_role',
        'message',
    ];

    // Relación polimórfica
    public function sender()
    {
        return $this->morphTo();
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}