"use client";

import type { Doctor, Patient, Role } from "@/shared/types";
import { useEffect, useState } from "react";
import { appointmentsApi } from "../services/appointmentsApi";
import type { NewAppointment } from "../types";
import { useRef } from "react";

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
  const datetimeRef = useRef<HTMLInputElement>(null);

  const options = [
    { value: "15", label: "15 minutos" },
    { value: "30", label: "30 minutos" },
    { value: "45", label: "45 minutos" },
    { value: "60", label: "60 minutos" },
  ];

  const isPatient = role === "patient";

  const otherLabel = isPatient ? "Profesional" : "Paciente";

  const accent = isPatient
    ? {
        soft: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-300",
        glow: "bg-blue-500/20",
        button: "bg-blue-500 hover:bg-blue-400 text-white",
      }
    : {
        soft: "bg-[#00d4aa]/10",
        border: "border-[#00d4aa]/20",
        text: "text-[#7ff5dc]",
        glow: "bg-[#00d4aa]/20",
        button: "bg-[#00d4aa] hover:bg-[#00e8ba] text-[#03241f]",
      };

  // Fecha mínima
  const minDate = (() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);

    const pad = (n: number) => String(n).padStart(2, "0");

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate(),
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
        //
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

  const fieldCls = `
    w-full rounded-2xl border border-white/8 bg-white/[0.03]
    px-4 py-3 text-sm text-[#f4f8fc]
    outline-none transition-all
    placeholder:text-[#60758a]
    focus:border-white/20 focus:bg-white/[0.05]
  `;

  return (
    <div className="relative w-full">
      {/* Glow */}
      <div
        className={`absolute inset-0 rounded-[32px] blur-3xl opacity-20 ${accent.glow}`}
      />

      <form
        onSubmit={handleSubmit}
        className="relative overflow-hidden rounded-[32px]
                   border border-white/10 bg-[#0f1722]/90
                   backdrop-blur-2xl"
      >
        {/* Top line */}
        <div
          className={`h-[2px] w-full bg-gradient-to-r
          from-transparent via-white/60 to-transparent`}
        />

        <div className="flex flex-col gap-8 p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div
                className={`inline-flex items-center gap-2 rounded-full
                px-3 py-1 text-[11px] uppercase tracking-[0.25em]
                border ${accent.border} ${accent.soft} ${accent.text}`}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    isPatient ? "bg-blue-400" : "bg-[#00d4aa]"
                  }`}
                />
                Nueva sesión
              </div>

              <h2
                className="mt-5 text-3xl font-extralight
                           tracking-[-0.03em] text-[#f4f8fc]"
              >
                Programar cita
              </h2>

              <p className="mt-3 text-sm text-[#6c859d] leading-relaxed">
                Configura la fecha, duración y participante para iniciar una
                conexión segura.
              </p>
            </div>

            {/* Icon */}
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center
              rounded-2xl border ${accent.border} ${accent.soft} ${accent.text}`}
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <rect x="3" y="4" width="18" height="18" rx="4" />
                <path d="M8 2v4M16 2v4M3 10h18" />
              </svg>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Participant */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[11px] uppercase tracking-[0.2em]
                           text-[#60758a]"
              >
                {otherLabel}
              </label>

              <div className="relative">
                <select
                  value={otherId}
                  onChange={(e) => setOtherId(e.target.value)}
                  className={`${fieldCls} appearance-none pr-10`}
                >
                  {/* Opción placeholder */}
                  <option value="" disabled>
                    Selecciona una opción
                  </option>

                  {others.map((u) => (
                    <option
                      key={u.id}
                      value={u.id}
                      className="bg-[#0f1722] text-white"
                    >
                      {u.name}
                    </option>
                  ))}
                </select>

                {/* dropdown icon */}
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#60758a]">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Datetime */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-[#60758a]">
                Fecha y hora
              </label>

              <div className="relative">
                <input
                  ref={datetimeRef}
                  type="datetime-local"
                  value={datetime}
                  min={minDate}
                  onChange={(e) => setDatetime(e.target.value)}
                  className={`${fieldCls} pl-11 cursor-pointer`}
                />

                {/* Icono que activa el calendario */}
                <button
                  type="button"
                  onClick={() => datetimeRef.current?.showPicker()} // ← Esta es la clave
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#60758a] hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.25}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-[#60758a]">
                Duración
              </label>

              <div className="relative">
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={`${fieldCls} appearance-none pr-10`}
                >
                  <option value="" disabled>
                    Selecciona duración
                  </option>

                  {options.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className="bg-[#0f1722] text-white"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* mismo icono que paciente */}
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#60758a]">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label
                className="text-[11px] uppercase tracking-[0.2em]
                           text-[#60758a]"
              >
                Notas adicionales
              </label>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe el motivo de la consulta o información relevante..."
                rows={4}
                className={`${fieldCls} resize-none`}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-2xl border border-red-500/20
                         bg-red-500/10 px-4 py-3"
            >
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div
            className="flex flex-col-reverse gap-3 border-t border-white/8
                       pt-6 sm:flex-row sm:items-center sm:justify-end"
          >
            <button
              type="button"
              onClick={onCancel}
              className="h-12 rounded-2xl border border-white/10
                         px-5 text-sm text-[#7b90a5]
                         transition-all hover:border-white/20 cursor-pointer
                         hover:bg-white/[0.03] hover:text-[#f4f8fc]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`group flex h-12 items-center justify-center
              gap-3 rounded-2xl px-6 text-sm font-medium cursor-pointer
              transition-all disabled:cursor-not-allowed
              disabled:opacity-50 ${accent.button}`}
            >
              {loading ? (
                <>
                  <div
                    className="h-4 w-4 animate-spin rounded-full
                               border-2 border-current border-t-transparent"
                  />
                  Agendando...
                </>
              ) : (
                <>
                  Confirmar cita
                  <svg
                    className="h-4 w-4 transition-transform
                               group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="M13 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
