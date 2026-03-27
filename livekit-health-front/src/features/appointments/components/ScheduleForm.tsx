"use client";

import type { Doctor, Patient, Role } from "@/shared/types";
import { useEffect, useState } from "react";
import { appointmentsApi } from "../services/appointmentsApi";
import type { NewAppointment } from "../types";

interface Props {
  role: Role;
  userId: number;
  onSuccess: () => void;
  onCancel: () => void;
  onSchedule: (data: NewAppointment) => Promise<unknown>;
}

export function ScheduleForm({
  role,
  userId,
  onSuccess,
  onCancel,
  onSchedule,
}: Props) {
  const [others, setOthers] = useState<(Doctor | Patient)[]>([]);
  const [otherId, setOtherId] = useState("");
  const [datetime, setDatetime] = useState("");
  const [duration, setDuration] = useState("30");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPatient = role === "patient";
  const otherLabel = isPatient ? "Médico" : "Paciente";

  // Fecha mínima: ahora + 1 hora
  const minDate = (() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  })();

  useEffect(() => {
    setDatetime(minDate);

    const load = async () => {
      try {
        if (isPatient) {
          const doctors = await appointmentsApi.getDoctors();
          setOthers(doctors);
        } else {
          const patients = await appointmentsApi.getPatients();
          setOthers(patients);
        }
      } catch {
        // opcional manejar error
      }
    };

    load();
  }, [isPatient, minDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otherId) {
      return setError(`Selecciona un ${otherLabel.toLowerCase()}`);
    }

    setLoading(true);
    setError(null);

    try {
      await onSchedule({
        doctor_id: isPatient ? Number(otherId) : userId,
        patient_id: isPatient ? userId : Number(otherId),
        scheduled_at: datetime.replace("T", " ") + ":00",
        duration: Number(duration),
        notes: notes.trim() || null,
      });

      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full bg-[#1a2330] border border-white/10 rounded-xl px-4 py-3
                    text-[#e8f0f7] font-mono text-sm outline-none appearance-none
                    focus:border-[#00d4aa]/40 transition-colors`;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#111820] border border-white/10 rounded-2xl p-7
                     flex flex-col gap-5"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#5a7a96] uppercase tracking-wider">
            {otherLabel}
          </label>

          <select
            value={otherId}
            onChange={(e) => setOtherId(e.target.value)}
            className={inputCls}
          >
            <option value="">Selecciona...</option>

            {others.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#5a7a96] uppercase tracking-wider">
            Fecha y hora
          </label>

          <input
            type="datetime-local"
            value={datetime}
            min={minDate}
            onChange={(e) => setDatetime(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#5a7a96] uppercase tracking-wider">
            Duración
          </label>

          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={inputCls}
          >
            <option value="15">15 minutos</option>
            <option value="30">30 minutos</option>
            <option value="45">45 minutos</option>
            <option value="60">60 minutos</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 col-span-2">
          <label className="text-xs font-medium text-[#5a7a96] uppercase tracking-wider">
            Notas (opcional)
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Motivo de la consulta, síntomas..."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      {error && (
        <p
          className="text-xs text-red-400 font-mono bg-red-500/10
                      border border-red-500/20 rounded-lg px-3 py-2"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-[#5a7a96] border border-white/10
                           rounded-xl hover:text-[#e8f0f7] hover:border-white/20 transition-colors"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 bg-[#00d4aa] text-[#04342c]
                           text-sm font-medium rounded-xl hover:bg-[#00e8ba]
                           transition-colors disabled:opacity-50"
        >
          {loading ? "Agendando..." : "Confirmar cita"}
        </button>
      </div>
    </form>
  );
}
