"use client";

import type { RemoteParticipant, Room } from "livekit-client";
import { useCallback, useRef, useState } from "react";
import type { DataMessage, Role, WaitingParticipant } from "../types";

export function useWaitingRoom(
  isHost: boolean,
  myIdentity: string,
  myName: string,
  myRole: Role,
) {
  // Lista de participantes esperando (solo el médico la ve)
  const [waitingList, setWaitingList] = useState<WaitingParticipant[]>([]);

  // Estado propio: ¿estoy esperando admisión?
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState<string | null>(null);
  const [wasRejected, setWasRejected] = useState(false);

  // Referencia al room para publicar datos
  const roomRef = useRef<Room | null>(null);

  // ── Publicar un mensaje a todos ──────────────────────────
  const publish = useCallback(async (msg: DataMessage) => {
    if (!roomRef.current) return;

    const encoded = new TextEncoder().encode(JSON.stringify(msg));

    await roomRef.current.localParticipant.publishData(encoded, {
      reliable: true,
    });
  }, []);

  // ── Médico: activar la reunión ───────────────────────────
  const startMeeting = useCallback(async () => {
    await publish({ type: "meeting_started" });
  }, [publish]);

  // ── Paciente/tercero: tocar la puerta ────────────────────
  const knock = useCallback(async () => {
    setIsWaiting(true);
    setWasRejected(false);

    await publish({
      type: "knock",
      identity: myIdentity,
      name: myName,
      role: myRole,
    });
  }, [publish, myIdentity, myName, myRole]);

  // ── Médico: admitir a alguien ────────────────────────────
  const admit = useCallback(
    async (targetIdentity: string) => {
      await publish({ type: "admit", targetIdentity });

      setWaitingList((prev) =>
        prev.filter((p) => p.identity !== targetIdentity),
      );
    },
    [publish],
  );

  // ── Médico: rechazar a alguien ───────────────────────────
  const reject = useCallback(
    async (targetIdentity: string, message?: string) => {
      await publish({ type: "reject", targetIdentity, message });

      setWaitingList((prev) =>
        prev.filter((p) => p.identity !== targetIdentity),
      );
    },
    [publish],
  );

  // ── Médico: enviar mensaje a sala de espera ──────────────
  const sendWaitingMessage = useCallback(
    async (message: string) => {
      await publish({ type: "waiting_message", message });
    },
    [publish],
  );

  // ── Procesar mensajes entrantes ──────────────────────────
  const handleDataMessage = useCallback(
    (
      msg: DataMessage,
      senderIdentity: string,
      onMeetingStarted: () => void,
      onMeetingEnded: () => void,
      onAdmitted: () => void,
    ) => {
      switch (msg.type) {
        case "knock":
          if (isHost && msg.identity && msg.name && msg.role) break;

        case "meeting_started":
          if (!isHost) onMeetingStarted();
          break;

        case "meeting_ended":
          if (!isHost) onMeetingEnded();
          break;

        case "admit":
          if (msg.targetIdentity === myIdentity) {
            setIsWaiting(false);
            onAdmitted();
          }
          break;

        case "reject":
          if (msg.targetIdentity === myIdentity) {
            setIsWaiting(false);
            setWasRejected(true);
            setWaitingMessage(
              msg.message ?? "No puedes unirte a esta reunión.",
            );
          }
          break;

        case "waiting_message":
          if (!isHost && isWaiting && msg.message) {
            setWaitingMessage(msg.message);
          }
          break;
      }
    },
    [isHost, myIdentity, isWaiting],
  );

  // ── Registrar room y escuchar DataReceived ───────────────
  const setupWaitingRoom = useCallback(
    (
      room: Room,
      onMeetingStarted: () => void,
      onMeetingEnded: () => void,
      onAdmitted: () => void,
    ) => {
      roomRef.current = room;

      room.on(
        "dataReceived",
        (payload: Uint8Array, participant?: RemoteParticipant) => {
          try {
            const msg: DataMessage = JSON.parse(
              new TextDecoder().decode(payload),
            );

            handleDataMessage(
              msg,
              participant?.identity ?? "",
              onMeetingStarted,
              onMeetingEnded,
              onAdmitted,
            );
          } catch {
            // payload no válido
          }
        },
      );
    },
    [handleDataMessage],
  );

  return {
    // Estado sala de espera (host)
    waitingList,

    // Estado propio (no-host)
    isWaiting,
    wasRejected,
    waitingMessage,

    // Acciones
    startMeeting,
    knock,
    admit,
    reject,
    sendWaitingMessage,
    setupWaitingRoom,
    publish,
  };
}
