import type { AppointmentStatus } from "@/shared/types";

const config: Record<AppointmentStatus, { label: string; classes: string }> = {
  scheduled: {
    label: "Programada",
    classes: "bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20",
  },
  in_progress: {
    label: "En curso",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  completed: {
    label: "Completada",
    classes: "bg-[#5a7a96]/10 text-[#5a7a96] border-[#5a7a96]/20",
  },
  cancelled: {
    label: "Cancelada",
    classes: "bg-red-500/10  text-red-400   border-red-500/20",
  },
};

const barColor: Record<AppointmentStatus, string> = {
  scheduled: "bg-[#00d4aa]",
  in_progress: "bg-amber-400",
  completed: "bg-[#5a7a96]",
  cancelled: "bg-red-400",
};

export function AppointmentBadge({ status }: { status: AppointmentStatus }) {
  const { label, classes } = config[status];
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${classes}`}
    >
      {label}
    </span>
  );
}

export function AppointmentStatusBar({
  status,
}: {
  status: AppointmentStatus;
}) {
  return (
    <div className={`w-0.5 h-11 rounded-full shrink-0 ${barColor[status]}`} />
  );
}
