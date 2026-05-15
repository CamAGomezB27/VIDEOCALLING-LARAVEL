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

  /* ─────────────────────────────
     EMPTY STATE
  ───────────────────────────── */

  if (waitingList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-[#5a7a96] px-4">
        <div className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center">
          <svg
            className="w-5 h-5 opacity-40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>

        <p className="text-xs font-mono text-center">Sala de espera vacía</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-xs font-mono text-[#5a7a96]">
          Sala de espera ({waitingList.length})
        </p>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {waitingList.map((p) => (
          <div
            key={p.identity}
            className="bg-[#1a2330]/60 border border-white/10 rounded-xl p-3 space-y-3"
          >
            {/* USER */}
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium
                  ${
                    p.role === "patient"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-[#00d4aa]/10 text-[#00d4aa]"
                  }`}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="text-sm text-[#e8f0f7] truncate">{p.name}</p>
                <p className="text-[11px] text-[#5a7a96] font-mono capitalize">
                  {p.role === "patient" ? "Paciente" : "Médico"}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            {rejectTarget === p.identity ? (
              <div className="space-y-2">
                <input
                  value={rejectMsg}
                  onChange={(e) => setRejectMsg(e.target.value)}
                  placeholder="Motivo (opcional)"
                  className="w-full bg-[#111820] border border-white/10 rounded-lg
                             px-3 py-2 text-xs text-[#e8f0f7] font-mono
                             outline-none focus:border-red-500/40
                             placeholder:text-[#5a7a96]/50"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(p.identity)}
                    className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400
                               border border-red-500/20 text-xs hover:bg-red-500/20"
                  >
                    Confirmar
                  </button>

                  <button
                    onClick={() => {
                      setRejectTarget(null);
                      setRejectMsg("");
                    }}
                    className="px-3 py-2 text-xs text-[#5a7a96] hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => onAdmit(p.identity)}
                  className="flex-1 py-2 rounded-lg bg-[#00d4aa]/10 text-[#00d4aa]
                             border border-[#00d4aa]/20 text-xs hover:bg-[#00d4aa]/20 cursor-pointer"
                >
                  Admitir
                </button>

                <button
                  onClick={() => setRejectTarget(p.identity)}
                  className="flex-1 py-2 rounded-lg bg-white/5 text-red-400
                             border border-white/10 text-xs hover:bg-red-500/10 cursor-pointer"
                >
                  Rechazar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* BROADCAST */}
      <div className="border-t border-white/10 p-3 space-y-2">
        <p className="text-[11px] text-[#5a7a96] font-mono">
          Mensaje a sala de espera
        </p>

        <div className="flex gap-2">
          <input
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBroadcast()}
            placeholder="Ej: Un momento por favor..."
            className="flex-1 bg-[#1a2330] border border-white/10 rounded-lg
                       px-3 py-2 text-xs text-[#e8f0f7] font-mono
                       outline-none focus:border-[#00d4aa]/40
                       placeholder:text-[#5a7a96]/50"
          />

          <button
            onClick={handleBroadcast}
            disabled={!broadcastMsg.trim() || sending}
            className="px-3 py-2 rounded-lg bg-[#00d4aa]/10 text-[#00d4aa]
                       border border-[#00d4aa]/20 text-xs
                       hover:bg-[#00d4aa]/20 disabled:opacity-40 cursor-pointer"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
