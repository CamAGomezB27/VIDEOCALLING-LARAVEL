"use client";

import type { CurrentUser } from "@/features/auth";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { useChat } from "@/features/chat/hooks/useChat";
import { formatDuration } from "@/shared/utils/formatDate";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRoom } from "../hooks/useRoom";
import { Controls } from "./Controls";
import { VideoGrid } from "./VideoGrid";

interface Props {
  appointmentId: number;
  user: CurrentUser;
}

export function VideoRoom({ appointmentId, user }: Props) {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const {
    room,
    roomName,
    // connected,
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
  } = useRoom(appointmentId, user.role, user.name);

  const chat = useChat(room, user, appointmentId);

  // Conectar al montar
  useEffect(() => {
    connect(
      (msg) => chat.addSystemMsg(msg),
      (r) => chat.setupListeners(r),
    )
      .then(() => chat.loadHistory())
      .catch((err) => showToast("Error al conectar: " + err.message));

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLeave = async () => {
    await disconnect();
    router.push("/dashboard");
  };

  const handleEndMeeting = async () => {
    if (!confirm("¿Cerrar la reunión para todos?")) return;
    await endMeeting();
    showToast("Reunión finalizada");
    setTimeout(() => router.push("/dashboard"), 800);
  };

  return (
    <div className="h-screen bg-[#090e14] flex flex-col overflow-hidden">
      {/* Topbar */}
      <div
        className="flex items-center justify-between px-6 py-3.5
                      bg-[#111820] border-b border-white/10 flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
            <span className="text-xs font-medium tracking-widest text-[#00d4aa] uppercase">
              MediCall
            </span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-xs text-[#5a7a96] font-mono">
            {roomName || "—"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full
                           border font-medium
                           ${
                             user.role === "patient"
                               ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                               : "bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20"
                           }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full
                             ${user.role === "patient" ? "bg-blue-400" : "bg-[#00d4aa]"}`}
            />
            {user.name} · {user.role === "patient" ? "Paciente" : "Médico"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Chat toggle */}
          <button
            onClick={() => chat.setOpen(!chat.isOpen)}
            className={`relative w-9 h-9 flex items-center justify-center rounded-xl
                         border transition-all
                         ${
                           chat.isOpen
                             ? "bg-[#00d4aa]/12 border-[#00d4aa]/35 text-[#00d4aa]"
                             : "bg-[#1a2330] border-white/10 text-[#5a7a96] hover:text-[#e8f0f7]"
                         }`}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {chat.unreadCount > 0 && !chat.isOpen && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white
                               text-xs rounded-full flex items-center justify-center
                               font-mono leading-none"
              >
                {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
              </span>
            )}
          </button>

          {/* Rec indicator */}
          {isRecording && (
            <div
              className="flex items-center gap-1.5 text-xs text-red-400 font-medium
                            bg-red-500/10 border border-red-500/25 rounded-full px-3 py-1"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              REC
            </div>
          )}

          {/* Timer */}
          <span className="text-sm text-[#5a7a96] font-mono">
            {formatDuration(seconds)}
          </span>
        </div>
      </div>

      {/* Body: video + chat */}
      <div className="flex flex-1 overflow-hidden">
        <VideoGrid
          localTrack={localVideoTrack}
          localIdentity={user.name}
          remoteTracks={remoteTracks}
        />
        <ChatPanel
          messages={chat.messages}
          isOpen={chat.isOpen}
          onClose={() => chat.setOpen(false)}
          onSend={chat.sendMessage}
        />
      </div>

      {/* Controls */}
      <Controls
        micEnabled={micEnabled}
        camEnabled={camEnabled}
        isRecording={isRecording}
        participantCount={participantCount}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
        onToggleRecording={toggleRecording}
        onLeave={handleLeave}
        onEndMeeting={handleEndMeeting}
      />

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50
                        bg-[#1a2330] border border-white/10 rounded-xl
                        px-5 py-3 text-sm text-[#e8f0f7] font-mono"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
