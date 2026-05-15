"use client";

import {
  createLocalTracks,
  LocalAudioTrack,
  LocalVideoTrack,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";
import type { PreLobbyConfig } from "../types";

interface Props {
  userName: string;
  role: "patient" | "doctor";
  onEnter: (config: PreLobbyConfig) => void;
  onCancel: () => void;
}

export function PreLobby({ userName, role, onEnter, onCancel }: Props) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [camError, setCamError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoTrack = useRef<LocalVideoTrack | null>(null);
  const audioTrack = useRef<LocalAudioTrack | null>(null);

  const isHost = role === "doctor";

  useEffect(() => {
    if (!camEnabled) {
      videoTrack.current?.stop();
      videoTrack.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }
    createLocalTracks({ video: true, audio: false })
      .then((tracks) => {
        const vt = tracks.find((t) => t.kind === "video") as
          | LocalVideoTrack
          | undefined;
        if (!vt || !videoRef.current) return;
        videoTrack.current = vt;
        vt.attach(videoRef.current);
        setCamError(false);
        setPreviewing(false);
      })
      .catch(() => {
        setCamError(true);
        setPreviewing(false);
      });

    return () => {
      videoTrack.current?.stop();
      videoTrack.current = null;
    };
  }, [camEnabled]);

  useEffect(() => {
    if (!micEnabled) {
      audioTrack.current?.stop();
      audioTrack.current = null;
      return;
    }
    createLocalTracks({ audio: true, video: false })
      .then((tracks) => {
        audioTrack.current =
          (tracks.find((t) => t.kind === "audio") as
            | LocalAudioTrack
            | undefined) ?? null;
      })
      .catch(() => {});
    return () => {
      audioTrack.current?.stop();
      audioTrack.current = null;
    };
  }, [micEnabled]);

  const handleEnter = () => {
    videoTrack.current?.stop();
    audioTrack.current?.stop();
    onEnter({ micEnabled, camEnabled });
  };

  return (
    <div className="min-h-screen bg-[#090e14] flex flex-col items-center justify-center px-4 py-8">
      {/* Fondo dinámico */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(0,212,170,0.05), transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(0,102,255,0.05), transparent 60%)`,
        }}
      />

      {/* Preview grande */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl w-full max-w-3xl aspect-video bg-[#111820] flex items-center justify-center">
        {camEnabled && !camError ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-[#5a7a96]">
            <div className="w-28 h-28 rounded-full bg-[#1a2330] border border-white/10 flex items-center justify-center">
              <span className="text-4xl font-medium text-[#e8f0f7]">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-base font-mono">
              {camError ? "No se encontró cámara" : "Cámara desactivada"}
            </span>
          </div>
        )}

        {previewing && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111820]/80">
            <div className="w-10 h-10 border-4 border-t-[#00d4aa] border-white/20 rounded-full animate-spin" />
          </div>
        )}

        <div className="absolute bottom-4 left-4 text-sm font-mono text-[#e8f0f7] bg-[#090e14]/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
          {userName}
        </div>
      </div>

      {/* CONTROLES */}
      <div className="flex flex-row gap-6 mt-8">
        {/* Mic toggle */}
        <div className="bg-[#111820] border border-white/10 rounded-2xl p-4 flex flex-col gap-3 w-52">
          <div className="flex flex-col gap-1 p-3 bg-[#111820] rounded-lg h-full">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#e8f0f7]">
                Micrófono
              </span>
              <button
                onClick={() => setMicEnabled((v) => !v)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                  micEnabled
                    ? "bg-[#00d4aa]"
                    : "bg-[#1a2330] border border-white/20"
                }`}
              >
                <span
                  className={`absolute top-1/2 left-0 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    micEnabled
                      ? "translate-x-6 -translate-y-1/2"
                      : "-translate-y-1/2"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#5a7a96] font-mono mt-2">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
              {micEnabled ? "Activo" : "Silenciado"}
            </div>
          </div>
        </div>

        {/* Cam toggle */}
        <div className="bg-[#111820] border border-white/10 rounded-2xl p-4 flex flex-col gap-3 w-52">
          <div className="flex flex-col gap-1 p-3 bg-[#111820] rounded-lg h-full">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#e8f0f7]">Cámara</span>
              <button
                onClick={() => setCamEnabled((v) => !v)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                  camEnabled
                    ? "bg-[#00d4aa]"
                    : "bg-[#1a2330] border border-white/20"
                }`}
              >
                <span
                  className={`absolute top-1/2 left-0 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    camEnabled
                      ? "translate-x-6 -translate-y-1/2"
                      : "-translate-y-1/2"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#5a7a96] font-mono mt-2">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              {camEnabled ? "Activa" : "Desactivada"}
            </div>
          </div>
        </div>
      </div>

      {/* Info rol */}
      <div
        className={`rounded-2xl p-4 mt-8 border text-sm font-mono leading-relaxed text-center w-full max-w-3xl transition-colors ${
          isHost
            ? "bg-[#00d4aa]/10 border-[#00d4aa]/30 text-[#00d4aa]"
            : "bg-blue-500/10 border-blue-500/30 text-blue-400"
        }`}
      >
        {isHost
          ? "Como médico, controlas el inicio y fin de la reunión. Los participantes esperarán hasta que entres."
          : "Esperarás en sala de espera hasta que el médico te admita."}
      </div>

      {/* Acciones principales */}
      <div className="flex flex-col gap-4 mt-8 w-full max-w-sm">
        <button
          onClick={handleEnter}
          className="py-4 rounded-2xl bg-[#00d4aa] text-[#04342c] font-bold text-lg
             shadow-lg shadow-[#00d4aa]/20
             transition-all duration-300
             hover:bg-[#00e8ba]
             hover:shadow-[#00d4aa]/40
             hover:scale-[1.02]
             active:scale-[0.98]
             focus-visible:outline-none focus-visible:ring-0
             cursor-pointer"
        >
          {isHost ? "Abrir reunión" : "Unirme"}
        </button>
        <button
          onClick={onCancel}
          className="py-3 rounded-2xl bg-[#111820] border border-[#00d4aa] text-[#00d4aa] font-semibold text-center hover:bg-[#00d4aa] hover:text-[#04342c] shadow-md transition-all cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
