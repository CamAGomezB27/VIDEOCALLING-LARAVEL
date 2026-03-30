"use client";

import type { Role } from "@/shared/types";
import {
  createLocalTracks,
  LocalTrack,
  LocalVideoTrack,
  RemoteTrack,
  Room,
  RoomEvent,
} from "livekit-client";
import { useCallback, useRef, useState } from "react";
import { livekitApi } from "../services/livekitApi";

export function useRoom(appointmentId: number, role: Role, userName: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState("");
  const [connected, setConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [participantCount, setPartCount] = useState(1);
  const [localVideoTrack, setLocalVideo] = useState<LocalVideoTrack | null>(
    null,
  );

  const [remoteTracks, setRemoteTracks] = useState<
    Array<{ track: RemoteTrack; identity: string }>
  >([]);

  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // evitar warning por ahora
  void userName;

  const startTimer = useCallback(() => {
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSeconds(0);
  }, []);

  const updateParticipants = useCallback((r: Room) => {
    setPartCount(r.remoteParticipants.size + 1);
  }, []);

  const connect = useCallback(
    async (
      onSystemMsg: (text: string) => void,
      setupChat: (r: Room) => void,
    ) => {
      const data = await livekitApi.join(appointmentId);
      const token = role === "patient" ? data.patient_token : data.doctor_token;

      const r = new Room({ adaptiveStream: true, dynacast: true });

      r.on(RoomEvent.ParticipantConnected, (p) => {
        updateParticipants(r);
        onSystemMsg(`${p.identity} se unió a la consulta`);
      });

      r.on(RoomEvent.ParticipantDisconnected, (p) => {
        updateParticipants(r);
        onSystemMsg(`${p.identity} salió de la consulta`);
        setRemoteTracks((prev) =>
          prev.filter((t) => t.identity !== p.identity),
        );
      });

      r.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
        if (track.kind === "video") {
          setRemoteTracks((prev) => [
            ...prev,
            { track: track as RemoteTrack, identity: participant.identity },
          ]);
        }
      });

      r.on(RoomEvent.TrackUnsubscribed, (_track, _pub, participant) => {
        setRemoteTracks((prev) =>
          prev.filter((t) => t.identity !== participant.identity),
        );
      });

      setupChat(r);

      await r.connect(data.livekit_url, token);

      setRoomName(data.room_name);
      setRoom(r);
      setConnected(true);
      updateParticipants(r);
      startTimer();

      let tracks: LocalTrack[] = [];

      try {
        tracks = await createLocalTracks({ audio: true, video: true });
      } catch {
        try {
          tracks = await createLocalTracks({ audio: true, video: false });
        } catch {}
      }

      for (const track of tracks) {
        await r.localParticipant.publishTrack(track);

        if (track.kind === "video") {
          setLocalVideo(track as LocalVideoTrack);
        }
      }

      return r;
    },
    [appointmentId, role, updateParticipants, startTimer],
  );

  const disconnect = useCallback(async () => {
    await room?.disconnect();
    stopTimer();
    setConnected(false);
    setRoom(null);
    setLocalVideo(null);
    setRemoteTracks([]);
  }, [room, stopTimer]);

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

    if (isRecording) {
      await livekitApi.stopRecording(appointmentId);
    }

    const msg = JSON.stringify({
      type: "system",
      text: "La reunión ha sido finalizada.",
    });

    await room.localParticipant.publishData(new TextEncoder().encode(msg), {
      reliable: true,
    });

    await livekitApi.endMeeting(appointmentId);
    await disconnect();
  }, [room, isRecording, appointmentId, disconnect]);

  return {
    room,
    roomName,
    connected,
    micEnabled,
    camEnabled,
    isRecording,
    participantCount,
    seconds,
    localVideoTrack,
    remoteTracks,
    connect,
    disconnect,
    toggleMic,
    toggleCam,
    toggleRecording,
    endMeeting,
  };
}
