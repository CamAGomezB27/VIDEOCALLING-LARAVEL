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
  if (loading)
    return (
      <div className="flex items-center gap-3 text-sm text-[#5a7a96] font-mono py-6">
        <div
          className="w-5 h-5 rounded-full border-2 border-white/10 border-t-[#00d4aa]
                      animate-spin shrink-0"
        />
        Cargando citas...
      </div>
    );

  if (error)
    return <p className="text-sm text-red-400 font-mono py-6">{error}</p>;

  if (appointments.length === 0)
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-[#5a7a96]">
        <svg
          className="w-10 h-10 opacity-30"
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
        <p className="text-sm">No tienes citas aún</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-2.5">
      {appointments.map((appt) => (
        <AppointmentCard key={appt.id} appointment={appt} role={role} />
      ))}
    </div>
  );
}
