<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\LiveKitService;

class AppointmentController extends Controller
{
    public function index(): JsonResponse
    {
        $appointments = Appointment::with(['doctor', 'patient'])
            ->orderBy('scheduled_at')
            ->get();

        return response()->json($appointments);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'doctor_id'    => 'required|exists:doctors,id',
            'patient_id'   => 'required|exists:patients,id',
            'scheduled_at' => 'required|date|after:now',
            'duration'     => 'nullable|integer|min:15|max:120',
            'notes'        => 'nullable|string',
        ]);

        $appointment = Appointment::create($validated);

        // Cargar relaciones para devolverlas en la respuesta
        $appointment->load(['doctor', 'patient']);

        return response()->json($appointment, 201);
    }

    public function show(Appointment $appointment): JsonResponse
    {
        $appointment->load(['doctor', 'patient']);

        return response()->json($appointment);
    }

    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $validated = $request->validate([
            'scheduled_at' => 'sometimes|date|after:now',
            'duration'     => 'sometimes|integer|min:15|max:120',
            'status'       => 'sometimes|in:scheduled,in_progress,completed,cancelled',
            'notes'        => 'nullable|string',
        ]);

        $appointment->update($validated);
        $appointment->load(['doctor', 'patient']);

        return response()->json($appointment);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();

        return response()->json(['message' => 'Cita eliminada']);
    }

    public function join(Appointment $appointment): JsonResponse
    {
        if ($appointment->status === 'cancelled') {
            return response()->json(['error' => 'Esta cita fue cancelada'], 403);
        }

        if ($appointment->status === 'completed') {
            return response()->json(['error' => 'Esta cita ya finalizó'], 403);
        }

        $service = new LiveKitService();
        $data    = $service->getOrCreateRoom($appointment);

        return response()->json([
            'room_name'     => $data['room_name'],
            'livekit_url'   => config('livekit.url'),
            'patient_token' => $data['patient_token'],
            'doctor_token'  => $data['doctor_token'],
        ]);
    }

    public function startRecording(Appointment $appointment): JsonResponse
    {
        if (!$appointment->livekit_room_name) {
            return response()->json(['error' => 'La sala no existe aún'], 422);
        }

        $egressId = (new LiveKitService())->startRecording($appointment);

        return response()->json([
            'message'   => 'Grabación iniciada',
            'egress_id' => $egressId,
        ]);
    }

    public function stopRecording(Appointment $appointment): JsonResponse
    {
        if (!$appointment->egress_id) {
            return response()->json(['error' => 'No hay grabación activa'], 422);
        }

        (new LiveKitService())->stopRecording($appointment);

        return response()->json(['message' => 'Grabación detenida']);
    }
}