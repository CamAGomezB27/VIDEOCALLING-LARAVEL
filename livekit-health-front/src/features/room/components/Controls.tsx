"use client";

interface Props {
  micEnabled: boolean;
  camEnabled: boolean;
  isRecording: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleRecording: () => void;
  onLeave: () => void;
  onEndMeeting: () => void;
  participantCount: number;
}

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
}: Props) {
  const btn = `flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm
               font-medium transition-all`;

  return (
    <div
      className="flex items-center justify-center gap-2.5 px-6 py-4
                    bg-[#111820] border-t border-white/10 flex-shrink-0"
    >
      <button
        onClick={onToggleMic}
        className={`${btn} ${
          micEnabled
            ? "bg-[#1a2330] border-white/10 text-[#e8f0f7] hover:border-white/20"
            : "bg-[#00d4aa]/12 border-[#00d4aa]/35 text-[#00d4aa]"
        }`}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {micEnabled ? (
            <>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
            </>
          ) : (
            <>
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23M12 19v4M8 23h8" />
            </>
          )}
        </svg>
        Mic
      </button>

      <button
        onClick={onToggleCam}
        className={`${btn} ${
          camEnabled
            ? "bg-[#1a2330] border-white/10 text-[#e8f0f7] hover:border-white/20"
            : "bg-[#00d4aa]/12 border-[#00d4aa]/35 text-[#00d4aa]"
        }`}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        Cámara
      </button>

      <div className="w-px h-8 bg-white/10 flex-shrink-0" />

      <button
        onClick={onToggleRecording}
        className={`${btn} ${
          isRecording
            ? "bg-red-500/12 border-red-500/35 text-red-400"
            : "bg-[#1a2330] border-white/10 text-[#e8f0f7] hover:border-white/20"
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

      <button
        onClick={onLeave}
        className={`${btn} bg-red-500/12 border-red-500/30 text-red-400
                          hover:bg-red-500/22`}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        Salir
      </button>

      <button
        onClick={onEndMeeting}
        className={`${btn} bg-emerald-500/12 border-emerald-500/30
                          text-emerald-400 hover:bg-emerald-500/22`}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        Cerrar reunión
      </button>

      <div className="ml-auto flex items-center gap-1.5 text-xs text-[#5a7a96] font-mono">
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        {participantCount} participante{participantCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
