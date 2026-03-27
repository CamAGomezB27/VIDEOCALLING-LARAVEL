"use client";

import type { Role } from "@/shared/types";

interface Props {
  onSelect: (role: Role) => void;
}

export function RoleSelector({ onSelect }: Props) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      <button
        onClick={() => onSelect("patient")}
        className="flex items-center gap-4 p-5 bg-[#111820] border border-white/10
                   rounded-2xl text-left hover:border-blue-500/40 hover:bg-[#1a2330]
                   transition-all group"
      >
        <div
          className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20
                        flex items-center justify-center shrink-0 text-blue-400"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#e8f0f7]">Soy paciente</p>
          <p className="text-xs text-[#5a7a96] font-mono mt-0.5">
            Accede con tu correo y cédula
          </p>
        </div>
        <svg
          className="w-4 h-4 text-[#5a7a96] group-hover:translate-x-0.5 transition-transform"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <button
        onClick={() => onSelect("doctor")}
        className="flex items-center gap-4 p-5 bg-[#111820] border border-white/10
                   rounded-2xl text-left hover:border-[#00d4aa]/40 hover:bg-[#1a2330]
                   transition-all group"
      >
        <div
          className="w-12 h-12 rounded-xl bg-[#00d4aa]/10 border border-[#00d4aa]/20
                        flex items-center justify-center shrink-0 text-[#00d4aa]"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#e8f0f7]">Soy médico</p>
          <p className="text-xs text-[#5a7a96] font-mono mt-0.5">
            Accede con tu correo y licencia
          </p>
        </div>
        <svg
          className="w-4 h-4 text-[#5a7a96] group-hover:translate-x-0.5 transition-transform"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
