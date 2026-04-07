"use client";

import { useState } from "react";
import type { WaitingParticipant } from "../types";

interface Props {
  waitingList: WaitingParticipant[];
  onAdmit: (identity: string) => Promise<void>;
  onReject: (identity: string, message?: string) => Promise<void>;
  onSendMessage: (message: string) => Promise<void>;
}

export function HostWaitingPanel({
  waitingList,
  onAdmit,
  onReject,
  onSendMessage,
}: Props) {
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectMsg, setRejectMsg] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [sending, setSending] = useState(false);

  const handleReject = async (identity: string) => {
    await onReject(identity, rejectMsg.trim() || undefined);
    setRejectTarget(null);
    setRejectMsg("");
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    setSending(true);
    try {
      await onSendMessage(broadcastMsg.trim());
      setBroadcastMsg("");
    } finally {
      setSending(false);
    }
  };

  if (waitingList.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-[#5a7a96]">
        <svg
          className="w-8 h-8 opacity-30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p className="text-xs font-mono">Sala de espera vacía</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Lista de espera */}
      <div className="flex flex-col gap-2">
        {waitingList.map((participant) => (
          <div
            key={participant.identity}
            className="bg-[#1a2330] border border-white/10 rounded-xl p-3
                          flex flex-col gap-2.5"
          >
            {/* Info */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center
                               text-xs font-medium flex-shrink-0
                               ${
                                 participant.role === "patient"
                                   ? "bg-blue-500/15 text-blue-400"
                                   : "bg-[#00d4aa]/15 text-[#00d4aa]"
                               }`}
              >
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#e8f0f7] truncate">
                  {participant.name}
                </p>
                <p className="text-xs text-[#5a7a96] font-mono capitalize">
                  {participant.role === "patient" ? "Paciente" : "Médico"}
                </p>
              </div>
            </div>

            {/* Acciones o formulario de rechazo */}
            {rejectTarget === participant.identity ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={rejectMsg}
                  onChange={(e) => setRejectMsg(e.target.value)}
                  placeholder="Motivo (opcional)"
                  className="w-full bg-[#111820] border border-white/10 rounded-lg
                             px-3 py-1.5 text-xs text-[#e8f0f7] font-mono outline-none
                             focus:border-red-500/40 transition-colors
                             placeholder:text-[#5a7a96]/60"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(participant.identity)}
                    className="flex-1 py-1.5 rounded-lg bg-red-500/15 text-red-400
                               text-xs font-medium border border-red-500/25
                               hover:bg-red-500/25 transition-colors"
                  >
                    Confirmar rechazo
                  </button>
                  <button
                    onClick={() => {
                      setRejectTarget(null);
                      setRejectMsg("");
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#5a7a96]
                               hover:text-[#e8f0f7] transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => onAdmit(participant.identity)}
                  className="flex-1 py-1.5 rounded-lg bg-[#00d4aa]/15 text-[#00d4aa]
                             text-xs font-medium border border-[#00d4aa]/25
                             hover:bg-[#00d4aa]/25 transition-colors"
                >
                  Admitir
                </button>
                <button
                  onClick={() => setRejectTarget(participant.identity)}
                  className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-400
                             text-xs font-medium border border-red-500/20
                             hover:bg-red-500/20 transition-colors"
                >
                  Rechazar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mensaje a sala de espera */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <p className="text-xs text-[#5a7a96] font-mono">
          Mensaje a sala de espera
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleBroadcast();
            }}
            placeholder="Ej: Un momento por favor..."
            className="flex-1 bg-[#1a2330] border border-white/10 rounded-lg
                       px-3 py-2 text-xs text-[#e8f0f7] font-mono outline-none
                       focus:border-[#00d4aa]/40 transition-colors
                       placeholder:text-[#5a7a96]/60"
          />
          <button
            onClick={handleBroadcast}
            disabled={!broadcastMsg.trim() || sending}
            className="px-3 py-2 rounded-lg bg-[#00d4aa]/15 text-[#00d4aa]
                       border border-[#00d4aa]/25 hover:bg-[#00d4aa]/25
                       transition-colors disabled:opacity-40"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
