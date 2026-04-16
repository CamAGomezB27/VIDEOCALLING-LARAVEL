"use client";

import type { CurrentUser } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { useChat } from "@/features/chat/hooks/useChat";

import { useRoom } from "../hooks/useRoom";
import { Controls } from "./Controls";
import { HostWaitingPanel } from "./HostWaitingPanel";
import { PreLobby } from "./PreLobby";
import { VideoGrid } from "./VideoGrid";
import { WaitingRoom } from "./WaitingRoom";

import { formatDuration } from "@/shared/utils/formatDate";
import type { PreLobbyConfig } from "../types";

interface Props {
  appointmentId: number;
  user: CurrentUser;
}

export function VideoRoom({ appointmentId, user }: Props) {
  const router = useRouter();

  const [toast, setToast] = useState<string | null>(null);
  const [showWaitingPanel, setShowWaitingPanel] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const chat = useChat(user, appointmentId);

  const {
    phase,
    room,
    roomName,
    localVideoTrack,
    remoteTracks,
    micEnabled,
    camEnabled,
    isRecording,
    participantCount,
    seconds,
    speaking,
    waitingRoom,
    isHost,
    identity,
    connect,
    disconnect,
    toggleMic,
    toggleCam,
    toggleRecording,
    endMeeting,
  } = useRoom(
    appointmentId,
    user.role,
    user.id,
    user.name,
    chat.setupListeners, // 👈 AQUÍ está la solución
  );

  /* ─────────────────────────────
     PRE-LOBBY → CONNECT
  ───────────────────────────── */
  const handleEnter = useCallback(
    async (config: PreLobbyConfig) => {
      try {
        await connect(config, (msg) => chat.addSystemMsg(msg));
        await chat.loadHistory();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al conectar";
        showToast(message);
      }
    },
    [connect, chat, showToast],
  );

  /* ─────────────────────────────
     LEAVE
  ───────────────────────────── */
  const handleLeave = useCallback(async () => {
    await disconnect();
    router.push("/dashboard");
  }, [disconnect, router]);

  /* ─────────────────────────────
     END MEETING (HOST)
  ───────────────────────────── */
  const handleEndMeeting = useCallback(async () => {
    if (!confirm("¿Cerrar la reunión para todos los participantes?")) return;
    await endMeeting();
    showToast("Reunión finalizada");
    setTimeout(() => router.push("/dashboard"), 800);
  }, [endMeeting, router, showToast]);

  /* ─────────────────────────────
     AUTO OPEN WAITING PANEL
  ───────────────────────────── */
  const shouldShowWaitingPanel =
    isHost && (showWaitingPanel || waitingRoom.waitingList.length > 0);

  /* ─────────────────────────────
     RENDER POR FASE
  ───────────────────────────── */

  if (phase === "pre-lobby") {
    return (
      <PreLobby
        userName={user.name}
        role={user.role}
        onEnter={handleEnter}
        onCancel={() => router.push("/dashboard")}
      />
    );
  }

  if (phase === "waiting") {
    return (
      <WaitingRoom
        userName={user.name}
        message={waitingRoom.waitingMessage}
        wasRejected={waitingRoom.wasRejected}
        onLeave={handleLeave}
      />
    );
  }

  /* ─────────────────────────────
     ACTIVE ROOM
  ───────────────────────────── */

  return (
    <div className="h-screen bg-[#090e14] flex flex-col overflow-hidden">
      {/* TOPBAR */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-[#111820] border-b border-white/10 flex-shrink-0">
        {/* LEFT */}
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

        {/* CENTER USER */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border font-medium
              ${
                user.role === "patient"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20"
              }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                user.role === "patient" ? "bg-blue-400" : "bg-[#00d4aa]"
              }`}
            />
            {user.name} · {user.role === "patient" ? "Paciente" : "Médico"}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* WAITING ROOM BUTTON */}
          {isHost && (
            <button
              onClick={() => setShowWaitingPanel((v) => !v)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all
                ${
                  showWaitingPanel
                    ? "bg-amber-500/15 border-amber-500/35 text-amber-400"
                    : "bg-[#1a2330] border-white/10 text-[#5a7a96]"
                }`}
            >
              Sala de espera
              {waitingRoom.waitingList.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 text-[#090e14] text-xs rounded-full flex items-center justify-center font-mono">
                  {waitingRoom.waitingList.length}
                </span>
              )}
            </button>
          )}

          {/* CHAT */}
          <button
            onClick={() => chat.setOpen(!chat.isOpen)}
            className={`relative w-9 h-9 flex items-center justify-center rounded-xl border
              ${
                chat.isOpen
                  ? "bg-[#00d4aa]/12 border-[#00d4aa]/35 text-[#00d4aa]"
                  : "bg-[#1a2330] border-white/10 text-[#5a7a96]"
              }`}
          >
            💬
            {chat.unreadCount > 0 && !chat.isOpen && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
              </span>
            )}
          </button>

          {/* REC */}
          {isRecording && <div className="text-xs text-red-400">REC</div>}

          {/* TIMER */}
          <span className="text-sm text-[#5a7a96] font-mono">
            {formatDuration(seconds)}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* VIDEO */}
        <VideoGrid
          localTrack={localVideoTrack}
          localIdentity={identity}
          remoteTracks={remoteTracks}
          speaking={speaking}
        />

        {/* WAITING PANEL */}
        {shouldShowWaitingPanel && (
          <div className="w-72 bg-[#111820] border-l border-white/10">
            <HostWaitingPanel
              waitingList={waitingRoom.waitingList}
              onAdmit={waitingRoom.admit}
              onReject={waitingRoom.reject}
              onSendMessage={waitingRoom.sendWaitingMessage}
            />
          </div>
        )}

        {/* CHAT */}
        <ChatPanel
          messages={chat.messages}
          isOpen={chat.isOpen}
          onClose={() => chat.setOpen(false)}
          onSend={(text) => chat.sendMessage(room, text)}
        />
      </div>

      {/* CONTROLS */}
      <Controls
        micEnabled={micEnabled}
        camEnabled={camEnabled}
        isRecording={isRecording}
        participantCount={participantCount}
        isHost={isHost}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
        onToggleRecording={toggleRecording}
        onLeave={handleLeave}
        onEndMeeting={handleEndMeeting}
      />

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#1a2330] px-5 py-3 rounded-xl text-sm text-white">
          {toast}
        </div>
      )}
    </div>
  );
}
