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

  // Preview de cámara
  useEffect(() => {
    if (!camEnabled) {
      videoTrack.current?.stop();
      videoTrack.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }

    setPreviewing(true);
    setCamError(false);

    createLocalTracks({ video: true, audio: false })
      .then((tracks) => {
        const vt = tracks.find((t) => t.kind === "video") as
          | LocalVideoTrack
          | undefined;
        if (!vt || !videoRef.current) return;
        videoTrack.current = vt;
        vt.attach(videoRef.current);
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

  // Preview de micrófono
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
    // Detener previews antes de entrar (el hook useRoom los crea de nuevo)
    videoTrack.current?.stop();
    audioTrack.current?.stop();
    onEnter({ micEnabled, camEnabled });
  };

  return (
    <div
      className="min-h-screen bg-[#090e14] flex items-center justify-center px-6"
      style={{
        background: `
             radial-gradient(ellipse 50% 40% at 20% 60%, rgba(0,212,170,0.05) 0%, transparent 70%),
             radial-gradient(ellipse 40% 35% at 80% 30%, rgba(0,102,255,0.06) 0%, transparent 70%),
             #090e14`,
      }}
    >
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
            <span className="text-xs font-medium tracking-widest text-[#00d4aa] uppercase">
              MediCall
            </span>
          </div>
          <h1 className="text-2xl font-light text-[#e8f0f7] tracking-tight">
            {isHost ? "Configurar y abrir sala" : "Prepararte para entrar"}
          </h1>
          <p className="text-sm text-[#5a7a96] font-mono">
            {isHost
              ? "Cuando entres, la reunión se activará para los participantes"
              : "Configura tu cámara y micrófono antes de unirte"}
          </p>
        </div>

        <div className="grid grid-cols-[1fr_260px] gap-5">
          {/* Preview de video */}
          <div
            className="relative aspect-video bg-[#111820] rounded-2xl overflow-hidden
                          border border-white/10 flex items-center justify-center"
          >
            {camEnabled && !camError ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {previewing && (
                  <div
                    className="absolute inset-0 flex items-center justify-center
                                  bg-[#111820]"
                  >
                    <div
                      className="w-7 h-7 rounded-full border-2 border-white/10
                                    border-t-[#00d4aa] animate-spin"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-[#5a7a96]">
                <div
                  className="w-16 h-16 rounded-full bg-[#1a2330] border border-white/10
                                flex items-center justify-center"
                >
                  <span className="text-2xl font-medium text-[#e8f0f7]">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-mono">
                  {camError ? "No se encontró cámara" : "Cámara desactivada"}
                </span>
              </div>
            )}

            {/* Nombre en preview */}
            <div
              className="absolute bottom-3 left-3 text-xs font-mono text-[#e8f0f7]
                            bg-[#090e14]/75 backdrop-blur-sm px-2.5 py-1 rounded-lg
                            border border-white/10"
            >
              {userName}
            </div>
          </div>

          {/* Controles */}
          <div className="flex flex-col gap-4">
            {/* Mic toggle */}
            <div
              className="bg-[#111820] border border-white/10 rounded-2xl p-4
                            flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#e8f0f7]">
                  Micrófono
                </span>
                <button
                  onClick={() => setMicEnabled((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    micEnabled
                      ? "bg-[#00d4aa]"
                      : "bg-[#1a2330] border border-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full
                                    shadow transition-transform ${
                                      micEnabled
                                        ? "translate-x-5"
                                        : "translate-x-0.5"
                                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#5a7a96] font-mono">
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

            {/* Cam toggle */}
            <div
              className="bg-[#111820] border border-white/10 rounded-2xl p-4
                            flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#e8f0f7]">
                  Cámara
                </span>
                <button
                  onClick={() => setCamEnabled((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    camEnabled
                      ? "bg-[#00d4aa]"
                      : "bg-[#1a2330] border border-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full
                                    shadow transition-transform ${
                                      camEnabled
                                        ? "translate-x-5"
                                        : "translate-x-0.5"
                                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#5a7a96] font-mono">
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

            {/* Info rol */}
            <div
              className={`rounded-2xl p-4 border text-xs font-mono leading-relaxed
                             ${
                               isHost
                                 ? "bg-[#00d4aa]/8 border-[#00d4aa]/20 text-[#00d4aa]"
                                 : "bg-blue-500/8 border-blue-500/20 text-blue-400"
                             }`}
            >
              {isHost
                ? "Como médico, controlas el inicio y fin de la reunión. Los participantes esperarán hasta que entres."
                : "Esperarás en sala de espera hasta que el médico te admita."}
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-2 mt-auto">
              <button
                onClick={handleEnter}
                className="flex items-center justify-center gap-2 py-3 rounded-xl
                           bg-[#00d4aa] text-[#04342c] font-medium text-sm
                           hover:bg-[#00e8ba] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                {isHost ? "Abrir reunión" : "Unirme"}
              </button>
              <button
                onClick={onCancel}
                className="py-2.5 rounded-xl text-sm text-[#5a7a96]
                           hover:text-[#e8f0f7] transition-colors font-mono"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
