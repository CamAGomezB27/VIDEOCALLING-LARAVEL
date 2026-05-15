"use client";

import type { Appointment, Role } from "@/shared/types";
import { AppointmentCard } from "./AppointmentCard";

interface Props {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  role: Role;
}

export function AppointmentList({ appointments, loading, error, role }: Props) {
  const isEmpty = !loading && !error && appointments.length === 0;

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        {/* Spinner mejorado */}
        <div className="relative">
          <div
            className="h-10 w-10 rounded-full border-2 border-white/10
                       border-t-[#00d4aa] animate-spin"
          />
          <div className="absolute inset-0 rounded-full bg-[#00d4aa]/10 blur-2xl animate-pulse" />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm text-[#c8d6e2]">Sincronizando citas</p>
          <p className="text-[11px] text-[#5a7a96] uppercase tracking-wider">
            Conectando con el servidor en tiempo real
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
        <p className="text-sm text-red-300 font-mono leading-relaxed">
          {error}
        </p>
      </div>
    );

  if (isEmpty)
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="relative">
          <svg
            className="h-12 w-12 text-[#5a7a96] opacity-30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>

          <div className="absolute inset-0 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="space-y-1">
          <p className="text-sm text-[#e1edf7]">
            Aún no hay actividad registrada
          </p>

          <p className="text-xs text-[#5a7a96]">
            Las citas aparecerán automáticamente cuando se creen en el sistema
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      {/* HEADER (mejor jerarquía visual) */}
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#5a7a96]">
            Agenda
          </p>
          <p className="text-sm text-[#c8d6e2]"></p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#5a7a96]">
          <span className="h-2 w-2 rounded-full bg-[#00d4aa] animate-pulse" />
          Conexión en Tiempo Real
        </div>
      </div>

      {/* LISTA */}
      <div className="flex flex-col gap-2 border-l border-white/5 pl-3">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="transition-all duration-200 hover:translate-x-1"
          >
            <AppointmentCard appointment={appt} role={role} />
          </div>
        ))}
      </div>
    </div>
  );
}
