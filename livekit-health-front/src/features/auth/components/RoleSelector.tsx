"use client";

import type { Role } from "@/shared/types";

interface Props {
  onSelect: (role: Role) => void;
}

export function RoleSelector({ onSelect }: Props) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1
          className="text-5xl md:text-7xl font-extralight tracking-[-0.04em]
                     text-[#f4f8fc] leading-none"
        >
          Elige tu acceso
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-[#6e8aa3]">
          Una experiencia moderna diseñada para pacientes y profesionales de la
          salud.
        </p>

        <p className="mt-3 text-[#8a9eb8] text-lg font-light">
          Selecciona tu perfil para continuar
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Paciente */}
        <button
          onClick={() => onSelect("patient")}
          className="group relative overflow-hidden rounded-3xl border border-blue-500/10
                     bg-linear-to-b from-[#111827] to-[#0d141c] cursor-pointer
                     p-8 text-left transition-all duration-300
                     hover:-translate-y-1 hover:border-blue-400/30
                     hover:shadow-[0_0_60px_rgba(59,130,246,0.12)]"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400">
              <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <div className="mt-8 flex-1">
              <h2 className="text-3xl font-light text-white tracking-tight">
                Paciente
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#7d97ad]">
                Consulta tus citas, historial médico y resultados clínicos de
                forma rápida y segura.
              </p>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#5d7890]">
                  Acceso
                </p>
                <p className="text-sm text-[#d7e4ef] mt-1">
                  Correo y documento
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl border border-blue-400/20 bg-blue-500/10 flex items-center justify-center text-blue-300 group-hover:translate-x-1 transition-transform">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                  <path d="M13 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </button>

        {/* Médico */}
        <button
          onClick={() => onSelect("doctor")}
          className="group relative overflow-hidden rounded-3xl border border-[#00d4aa]/10
                     bg-linear-to-b from-[#101b1a] to-[#0c1414] cursor-pointer
                     p-8 text-left transition-all duration-300
                     hover:-translate-y-1 hover:border-[#00d4aa]/30
                     hover:shadow-[0_0_60px_rgba(0,212,170,0.12)]"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#00d4aa]/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center justify-center text-[#00d4aa]">
              <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>

            <div className="mt-8 flex-1">
              <h2 className="text-3xl font-light text-white tracking-tight">
                Médico
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#7d97ad]">
                Administra pacientes, consultas y seguimientos clínicos desde un
                entorno optimizado.
              </p>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#5d7890]">
                  Acceso
                </p>
                <p className="text-sm text-[#d7e4ef] mt-1">
                  Correo y licencia médica
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl border border-[#00d4aa]/20 bg-[#00d4aa]/10 flex items-center justify-center text-[#7ff5dc] group-hover:translate-x-1 transition-transform">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                  <path d="M13 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Acceso Seguro */}
      <div className="flex justify-center mt-12">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-sm tracking-wider text-[#9cc3e6]">
          <div className="w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-2.5 h-2.5 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="font-medium">Acceso seguro</span>
        </div>
      </div>
    </div>
  );
}
