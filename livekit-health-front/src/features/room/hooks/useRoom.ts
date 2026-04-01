"use client";

import type { Role } from "@/shared/types";
import {
  createLocalTracks,
  LocalTrack,
  LocalVideoTrack,
  RemoteTrack,
  RemoteVideoTrack,
  Room,
  RoomEvent,
} from "livekit-client";
import { useCallback, useRef, useState } from "react";
import { livekitApi } from "../services/livekitApi";
import type { PreLobbyConfig, RoomPhase } from "../types";
import { useSpeakingDetection } from "./useSpeakingDetection";
import { useWaitingRoom } from "./useWaitingRoom";

export function useRoom(
  appointmentId: number,
  role: Role,
  userId: number,
  userName: string,
  setupChat: (room: Room) => void,
) {
  const isHost = role === "doctor";
  const identity = `${role}-${userId}`;

  // ── Fases ────────────────────────────────────────────────
  const [phase, setPhase] = useState<RoomPhase>("pre-lobby");
  const [room, setRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState("");

  // ── Tracks locales ───────────────────────────────────────
  const [localVideoTrack, setLocalVideo] = useState<LocalVideoTrack | null>(
    null,
  );
  const [remoteTracks, setRemoteTracks] = useState<
    Array<{ track: RemoteVideoTrack; identity: string }>
  >([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  // ── Otros estados ────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [participantCount, setPartCount] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Sub-hooks ────────────────────────────────────────────
  const { speaking, setupSpeakingDetection } = useSpeakingDetection();

  const waitingRoom = useWaitingRoom(isHost, identity, userName, role);

  // ── Timer ────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSeconds(0);
  }, []);

  // ── Publicar tracks al entrar a la reunión ───────────────
  const publishTracks = useCallback(async (r: Room, config: PreLobbyConfig) => {
    let tracks: LocalTrack[] = [];
    try {
      tracks = await createLocalTracks({
        audio: config.micEnabled,
        video: config.camEnabled,
      });
    } catch {
      try {
        tracks = await createLocalTracks({
          audio: config.micEnabled,
          video: false,
        });
      } catch {}
    }

    for (const track of tracks) {
      await r.localParticipant.publishTrack(track);
      if (track.kind === "video") {
        setLocalVideo(track as LocalVideoTrack);
      }
    }

    setMicEnabled(config.micEnabled);
    setCamEnabled(config.camEnabled);
  }, []);

  // ── Conectar al LiveKit room (fase post-pre-lobby) ───────
  const connect = useCallback(
    async (
      config: PreLobbyConfig,
      onSystemMsg: (text: string) => void,
      setupChat: (r: Room) => void,
    ) => {
      const data = await livekitApi.join(appointmentId);
      const token = role === "patient" ? data.patient_token : data.doctor_token;

      const r = new Room({ adaptiveStream: true, dynacast: true });

      // Participantes
      r.on(RoomEvent.ParticipantConnected, (p) => {
        setPartCount(r.remoteParticipants.size + 1);
        if (phase === "active") onSystemMsg(`${p.identity} se unió`);
      });

      r.on(RoomEvent.ParticipantDisconnected, (p) => {
        setPartCount(r.remoteParticipants.size + 1);
        setRemoteTracks((prev) =>
          prev.filter((t) => t.identity !== p.identity),
        );
        onSystemMsg(`${p.identity} salió`);
      });

      // Video remoto
      r.on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, _pub, participant) => {
          if (track.kind === "video") {
            setRemoteTracks((prev) => [
              ...prev,
              {
                track: track as RemoteVideoTrack,
                identity: participant.identity,
              },
            ]);
          }
        },
      );

      r.on(
        RoomEvent.TrackUnsubscribed,
        (track: RemoteTrack, _pub, participant) => {
          if (track.kind === "video") {
            setRemoteTracks((prev) =>
              prev.filter((t) => t.identity !== participant.identity),
            );
          }
        },
      );

      r.on(RoomEvent.Disconnected, () => {
        stopTimer();
        setPhase("pre-lobby");
      });

      // Speaking detection
      setupSpeakingDetection(r);

      // Chat
      setupChat(r);

      // Sala de espera — callbacks de transición de fase
      waitingRoom.setupWaitingRoom(
        r,
        () => {
          // meeting_started recibido → pasar de waiting a active
          setPhase("active");
          startTimer();
          publishTracks(r, config);
        },
        () => {
          // meeting_ended recibido
          setPhase("waiting");
          stopTimer();
        },
        () => {
          // admit recibido → pasar de waiting a active
          setPhase("active");
          startTimer();
          publishTracks(r, config);
        },
      );

      await r.connect(data.livekit_url, token);
      setRoomName(data.room_name);
      setRoom(r);
      setPartCount(r.remoteParticipants.size + 1);

      if (isHost) {
        // El médico entra directo a active y activa la reunión
        setPhase("active");
        startTimer();
        await publishTracks(r, config);
        await waitingRoom.startMeeting();
      } else {
        // Paciente/tercero: ir a sala de espera y tocar
        setPhase("waiting");
        await waitingRoom.knock();
      }

      return r;
    },
    [
      appointmentId,
      role,
      isHost,
      phase,
      setupSpeakingDetection,
      setupChat,
      waitingRoom,
      startTimer,
      stopTimer,
      publishTracks,
    ],
  );

  // ── Desconectar ──────────────────────────────────────────
  const disconnect = useCallback(async () => {
    await room?.disconnect();
    stopTimer();
    setRoom(null);
    setLocalVideo(null);
    setRemoteTracks([]);
    setPhase("pre-lobby");
  }, [room, stopTimer]);

  // ── Controles ────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    if (!room) return;
    const next = !micEnabled;
    room.localParticipant.setMicrophoneEnabled(next);
    setMicEnabled(next);
  }, [room, micEnabled]);

  const toggleCam = useCallback(() => {
    if (!room) return;
    const next = !camEnabled;
    room.localParticipant.setCameraEnabled(next);
    setCamEnabled(next);
  }, [room, camEnabled]);

  const toggleRecording = useCallback(async () => {
    if (!isRecording) {
      await livekitApi.startRecording(appointmentId);
      setIsRecording(true);
    } else {
      await livekitApi.stopRecording(appointmentId);
      setIsRecording(false);
    }
  }, [isRecording, appointmentId]);

  const endMeeting = useCallback(async () => {
    if (!room) return;
    if (isRecording) await livekitApi.stopRecording(appointmentId);
    await waitingRoom.publish({ type: "meeting_ended" });
    await livekitApi.endMeeting(appointmentId);
    await disconnect();
  }, [room, isRecording, appointmentId, waitingRoom, disconnect]);

  return {
    // Fase actual
    phase,
    // Room
    room,
    roomName,
    // Tracks
    localVideoTrack,
    remoteTracks,
    // Controles
    micEnabled,
    camEnabled,
    isRecording,
    participantCount,
    seconds,
    // Speaking
    speaking,
    // Sala de espera
    waitingRoom,
    isHost,
    identity,
    // Acciones
    connect,
    disconnect,
    toggleMic,
    toggleCam,
    toggleRecording,
    endMeeting,
  };
}
