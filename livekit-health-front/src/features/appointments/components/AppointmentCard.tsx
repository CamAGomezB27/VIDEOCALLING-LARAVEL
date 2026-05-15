"use client";

import type { Appointment, Role } from "@/shared/types";
import { formatDate, formatTime } from "@/shared/utils/formatDate";
import { useRouter } from "next/navigation";
import { AppointmentBadge, AppointmentStatusBar } from "./AppointmentBadge";

interface Props {
  appointment: Appointment;
  role: Role;
}

export function AppointmentCard({ appointment, role }: Props) {
  const router = useRouter();

  const other = role === "patient" ? appointment.doctor : appointment.patient;

  const label = role === "patient" ? "Dr." : "Paciente";
  const name = other ? `${label} ${other.name}` : "—";

  const canJoin =
    appointment.status === "scheduled" || appointment.status === "in_progress";

  return (
    <div
      className="group relative flex items-center gap-4
                 rounded-2xl border border-white/10
                 bg-[#111820] px-5 py-4
                 transition-all duration-200
                 hover:-translate-y-[1px]
                 hover:border-white/20
                 hover:bg-[#141d28]"
    >
      {/* Glow hover sutil */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#00d4aa]/5 blur-2xl" />
      </div>

      {/* Status bar */}
      <AppointmentStatusBar status={appointment.status} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#e8f0f7] truncate">{name}</p>

        <p className="text-xs text-[#5a7a96] font-mono mt-0.5">
          {formatDate(appointment.scheduled_at)} ·{" "}
          {formatTime(appointment.scheduled_at)} · {appointment.duration} min
        </p>
      </div>

      {/* Badge */}
      <div className="shrink-0">
        <AppointmentBadge status={appointment.status} />
      </div>

      {/* Action */}
      {canJoin && (
        <button
          onClick={() => router.push(`/room/${appointment.id}`)}
          className="group/btn flex items-center gap-2
                     rounded-xl bg-[#00d4aa]
                     px-4 py-2 text-xs font-medium
                     text-[#04342c] transition-all duration-200
                     hover:bg-[#00e8ba]
                     hover:shadow-lg hover:shadow-[#00d4aa]/10
                     active:scale-[0.98]"
        >
          <svg
            className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          Entrar
        </button>
      )}
    </div>
  );
}
