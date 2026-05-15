"use client";

export function Controls({
  micEnabled,
  camEnabled,
  isRecording,
  onToggleMic,
  onToggleCam,
  onToggleRecording,
  onLeave,
  onEndMeeting,
  participantCount,
  isHost,
}: Props) {
  const btn =
    "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 hover:brightness-110 active:scale-[0.98]";

  return (
    <div className="flex items-center justify-center gap-2.5 px-6 py-4 bg-[#111820] border-t border-white/10 flex-shrink-0">
      {/* MIC */}
      <button
        onClick={onToggleMic}
        className={`${btn} cursor-pointer ${
          micEnabled
            ? "bg-[#1a2330] border-white/15 text-[#e8f0f7]"
            : "bg-[#00d4aa]/10 border-[#00d4aa]/40 text-[#00d4aa]"
        }`}
      >
        <svg
          className="w-4 h-4 opacity-90"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {micEnabled ? (
            <>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </>
          ) : (
            <>
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5 2" />
            </>
          )}
        </svg>
        Mic
      </button>

      {/* CAM */}
      <button
        onClick={onToggleCam}
        className={`${btn} cursor-pointer ${
          camEnabled
            ? "bg-[#1a2330] border-white/15 text-[#e8f0f7]"
            : "bg-[#00d4aa]/10 border-[#00d4aa]/40 text-[#00d4aa]"
        }`}
      >
        <svg
          className="w-4 h-4 opacity-90"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" />
        </svg>
        Cámara
      </button>

      <div className="w-px h-8 bg-white/10 flex-shrink-0" />

      {/* RECORD */}
      <button
        onClick={onToggleRecording}
        className={`${btn} ${
          isRecording
            ? "bg-red-500/15 border-red-500/40 text-red-400 shadow-sm shadow-red-500/10"
            : "bg-[#1a2330] border-white/15 text-[#e8f0f7] cursor-pointer"
        }`}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        </svg>
        {isRecording ? "Detener" : "Grabar"}
      </button>

      <div className="w-px h-8 bg-white/10 flex-shrink-0" />

      {/* LEAVE */}
      <button
        onClick={onLeave}
        className={`${btn} bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer`}
      >
        <svg
          className="w-4 h-4 opacity-90"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
        </svg>
        Salir
      </button>

      {/* END MEETING */}
      {isHost && (
        <button
          onClick={onEndMeeting}
          className={`${btn} bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer`}
        >
          <svg
            className="w-4 h-4 opacity-90"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14 9 11" />
          </svg>
          Cerrar reunión
        </button>
      )}

      {/* PARTICIPANTES */}
      <div className="ml-auto flex items-center gap-1.5 text-xs text-[#6f8aa3] font-mono">
        <svg
          className="w-3.5 h-3.5 opacity-70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
        {participantCount} participante{participantCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
