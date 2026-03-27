"use client";

import type { Appointment, Role } from "@/shared/types";
import { useCallback, useEffect, useState } from "react";
import { appointmentsApi } from "../services/appointmentsApi";
import type { NewAppointment } from "../types";

export function useAppointments(userId: number, role: Role) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await appointmentsApi.getAll();

      const mine = all
        .filter((a) =>
          role === "patient" ? a.patient_id === userId : a.doctor_id === userId,
        )
        .sort(
          (a, b) =>
            new Date(a.scheduled_at).getTime() -
            new Date(b.scheduled_at).getTime(),
        );

      setAppointments(mine);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado");
      }
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    load();
  }, [load]);

  const schedule = useCallback(
    async (data: NewAppointment) => {
      const created = await appointmentsApi.create(data);
      await load();
      return created;
    },
    [load],
  );

  return { appointments, loading, error, reload: load, schedule };
}
