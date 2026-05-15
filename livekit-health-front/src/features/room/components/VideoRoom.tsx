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
    chat.setupListeners,
  );

  const handleEnter = useCallback(
    async (config: PreLobbyConfig) => {
      try {
        await connect(config, (msg) => chat.addSystemMsg(msg));
        await chat.loadHistory();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Error al conectar");
      }
    },
    [connect, chat, showToast],
  );

  const handleLeave = useCallback(async () => {
    await disconnect();
    router.push("/dashboard");
  }, [disconnect, router]);

  const handleEndMeeting = useCallback(async () => {
    if (!confirm("¿Cerrar la reunión para todos los participantes?")) return;
    await endMeeting();
    showToast("Reunión finalizada");
    setTimeout(() => router.push("/dashboard"), 800);
  }, [endMeeting, router, showToast]);

  const shouldShowWaitingPanel =
    isHost && (showWaitingPanel || waitingRoom.waitingList.length > 0);

  /* ─────────────────────────────
     PRE / WAITING
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
    <div className="h-screen flex flex-col bg-[#090e14] overflow-hidden">
      {/* TOPBAR */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#111820] border-b border-white/10 shrink-0">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
            <span className="text-xs font-semibold text-[#00d4aa] tracking-widest">
              MediCall
            </span>
          </div>

          <div className="w-px h-4 bg-white/10" />

          <span className="text-xs text-[#5a7a96] font-mono">
            {roomName || "—"}
          </span>
        </div>
        {/* CENTER */}
        <div className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/70">
          {user.name} · {user.role === "patient" ? "Paciente" : "Médico"}
        </div>
        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {isHost && (
            <button
              onClick={() => setShowWaitingPanel((v) => !v)}
              className={`relative text-xs px-3 py-1.5 rounded-xl border transition-all duration-150
        hover:scale-[1.02] hover:brightness-110 active:scale-95 cursor-pointer
        ${
          showWaitingPanel
            ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10"
            : "bg-[#1a2330] border-white/10 text-[#6f8aa3] hover:border-white/20 hover:text-[#cfe3f3]"
        }`}
            >
              Sala de espera
              {waitingRoom.waitingList.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-amber-400 text-black text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm">
                  {waitingRoom.waitingList.length}
                </span>
              )}
            </button>
          )}

          {/* CHAT */}
          <button
            onClick={() => chat.setOpen(!chat.isOpen)}
            className={`w-14 h-8 rounded-xl border flex items-center justify-center text-xs font-medium transition-all duration-150
      hover:scale-[1.03] active:scale-95 cursor-pointer
      ${
        chat.isOpen
          ? "bg-[#00d4aa]/15 border-[#00d4aa]/40 text-[#00d4aa] shadow-sm shadow-[#00d4aa]/10"
          : "bg-[#1a2330] border-white/10 text-[#6f8aa3] hover:border-white/20 hover:text-[#cfe3f3]"
      }`}
          >
            Chat
          </button>

          {/* REC */}
          {isRecording && (
            <span className="relative text-xs text-red-400 font-mono px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 animate-pulse">
              ● REC
            </span>
          )}

          {/* TIMER */}
          <span className="text-xs text-[#6f8aa3] font-mono px-2 py-1 rounded-md bg-white/5 border border-white/10">
            {formatDuration(seconds)}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* VIDEO (sin “card extra”, más limpio como tu original) */}
        <div className="flex-1">
          <VideoGrid
            localTrack={localVideoTrack}
            localIdentity={identity}
            remoteTracks={remoteTracks}
            speaking={speaking}
          />
        </div>

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

        {/* CHAT (sin animación agresiva, más estable) */}
        <div
          className={`w-80 border-l border-white/10 bg-[#111820] transition ${
            chat.isOpen ? "block" : "hidden"
          }`}
        >
          <ChatPanel
            messages={chat.messages}
            isOpen={chat.isOpen}
            onClose={() => chat.setOpen(false)}
            onSend={(text) => chat.sendMessage(room, text)}
          />
        </div>
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

      {/* TOAST (más integrado, menos flotante agresivo) */}
      {toast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-[#111820] border border-white/10 px-4 py-2 rounded-lg text-sm text-white/80">
          {toast}
        </div>
      )}
    </div>
  );
}
