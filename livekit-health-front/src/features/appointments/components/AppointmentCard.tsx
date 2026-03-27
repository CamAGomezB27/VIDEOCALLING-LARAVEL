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
      className="flex items-center gap-4 bg-[#111820] border border-white/10
                    rounded-2xl px-5 py-4 hover:border-white/20 transition-colors"
    >
      <AppointmentStatusBar status={appointment.status} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#e8f0f7] truncate">{name}</p>
        <p className="text-xs text-[#5a7a96] font-mono mt-0.5">
          {formatDate(appointment.scheduled_at)} ·{" "}
          {formatTime(appointment.scheduled_at)} · {appointment.duration} min
        </p>
      </div>

      <AppointmentBadge status={appointment.status} />

      {canJoin && (
        <button
          onClick={() => router.push(`/room/${appointment.id}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00d4aa] text-[#04342c]
                     text-xs font-medium rounded-lg hover:bg-[#00e8ba] transition-colors
                     shrink-0"
        >
          <svg
            className="w-3 h-3"
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
