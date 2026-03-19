<?php

namespace App\Services;

use App\Models\Appointment;
use Agence104\LiveKit\AccessToken;
use Agence104\LiveKit\AccessTokenOptions;
use Agence104\LiveKit\VideoGrant;

class LiveKitService
{
    public function getOrCreateRoom(Appointment $appointment): array
    {
        if (!$appointment->livekit_room_name) {
            $roomName = 'appt-' . $appointment->id . '-' . time();

            $appointment->update([
                'livekit_room_name' => $roomName,
                'status'            => 'in_progress',
                'started_at'        => now(),
            ]);
        }

        $roomName = $appointment->livekit_room_name;

        return [
            'room_name'     => $roomName,
            'patient_token' => $this->generateToken(
                identity: 'patient-' . $appointment->patient_id,
                name:     $appointment->patient?->name ?? 'Paciente',
                room:     $roomName,
                isAdmin:  false,
            ),
            'doctor_token'  => $this->generateToken(
                identity: 'doctor-' . $appointment->doctor_id,
                name:     $appointment->doctor?->name ?? 'Doctor',
                room:     $roomName,
                isAdmin:  true,
            ),
        ];
    }

    private function generateToken(
        string $identity,
        string $name,
        string $room,
        bool $isAdmin
    ): string {
        $videoGrant = (new VideoGrant())
            ->setRoomJoin(true)
            ->setRoomName($room)           // ← importante: setRoomName, NO setRoom
            ->setCanPublish(true)
            ->setCanSubscribe(true);

        if ($isAdmin) {
            $videoGrant->setRoomAdmin(true);   // o setCanAdmin(true) en algunas versiones
        }

        $tokenOptions = (new AccessTokenOptions())
            ->setIdentity($identity)
            ->setName($name)
            ->setTtl(3600);  // 3600 segundos = 1 hora

        // Forma recomendada actual
        $accessToken = (new AccessToken(
            config('livekit.api_key'),
            config('livekit.api_secret')
        ))
            ->init($tokenOptions)
            ->setGrant($videoGrant);

        return $accessToken->toJwt();
    }
}