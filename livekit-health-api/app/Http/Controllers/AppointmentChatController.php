<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AppointmentChat;
use Illuminate\Http\Request;

class AppointmentChatController extends Controller
{
    /**
     * Obtener historial de mensajes de una cita
     */
public function store(Request $request, $appointmentId)
{
    $request->validate([
        'message'      => 'required|string|max:1000',
        'sender_id'    => 'required|integer',
        'sender_role'  => 'required|in:patient,doctor',
    ]);

    $appointment = Appointment::findOrFail($appointmentId);

    $senderType = $request->sender_role === 'patient' 
        ? \App\Models\Patient::class 
        : \App\Models\Doctor::class;

    $chat = AppointmentChat::create([
        'appointment_id' => $appointmentId,
        'sender_id'      => $request->sender_id,
        'sender_type'    => $senderType,
        'sender_role'    => $request->sender_role,
        'message'        => $request->message,
    ]);

    return response()->json([
        'success' => true,
        'message' => $chat->load('sender')
    ], 201);
}

public function index($appointmentId)
{
    $appointment = Appointment::findOrFail($appointmentId);

    $messages = AppointmentChat::where('appointment_id', $appointmentId)
        ->orderBy('created_at', 'asc')
        ->with('sender:id,name')   // trae nombre del paciente o doctor
        ->get();

    return response()->json($messages->map(function ($msg) {
        return [
            'id'           => $msg->id,
            'sender_id'    => $msg->sender_id,
            'sender_name'  => $msg->sender?->name ?? 'Usuario',
            'sender_role'  => $msg->sender_role,
            'message'      => $msg->message,
            'created_at'   => $msg->created_at,
        ];
    }));
}
}