import type { AppointmentStatus } from "@/shared/types";

const STATUS_CONFIG: Record<
  AppointmentStatus,
  {
    label: string;
    pill: string;
    dot: string;
    bar: string;
  }
> = {
  scheduled: {
    label: "Programada",
    pill: "bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20",
    dot: "bg-[#00d4aa]",
    bar: "bg-[#00d4aa]",
  },
  in_progress: {
    label: "En curso",
    pill: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
    bar: "bg-amber-400",
  },
  completed: {
    label: "Completada",
    pill: "bg-[#5a7a96]/10 text-[#5a7a96] border-[#5a7a96]/20",
    dot: "bg-[#5a7a96]",
    bar: "bg-[#5a7a96]",
  },
  cancelled: {
    label: "Cancelada",
    pill: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-400",
    bar: "bg-red-400",
  },
};

export function AppointmentBadge({ status }: { status: AppointmentStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5
                  text-xs font-medium px-2.5 py-1
                  rounded-full border ${config.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function AppointmentStatusBar({
  status,
}: {
  status: AppointmentStatus;
}) {
  const config = STATUS_CONFIG[status];

  return <div className={`w-0.5 h-11 rounded-full shrink-0 ${config.bar}`} />;
}
