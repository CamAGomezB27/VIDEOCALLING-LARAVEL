"use client";

import type { Role } from "@/shared/types";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface Props {
  role: Role;
  onBack: () => void;
}

export function LoginForm({ role, onBack }: Props) {
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [docNumber, setDocNumber] = useState("");

  const isPatient = role === "patient";

  const docLabel = isPatient ? "Número de documento" : "Licencia profesional";

  const docHolder = isPatient ? "1234567890" : "MED-001";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    login(email.trim(), docNumber.trim(), role);
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Glow */}
      <div
        className={`absolute inset-0 rounded-4xl blur-3xl opacity-20
        ${isPatient ? "bg-blue-500/20" : "bg-[#00d4aa]/20"}`}
      />

      <div
        className="relative overflow-hidden rounded-4xl
                   border border-white/10 bg-[#0f1722]/90
                   backdrop-blur-2xl"
      >
        {/* Top gradient line */}
        <div
          className={`h-0.5 w-full ${
            isPatient
              ? "bg-gradient-to-r from-transparent via-blue-400 to-transparent"
              : "bg-gradient-to-r from-transparent via-[#00d4aa] to-transparent"
          }`}
        />

        {/* Content */}
        <div className="flex flex-col gap-8 p-8 md:p-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-4">
              <button
                onClick={onBack}
                className="group flex items-center gap-2 text-sm
                           text-[#60758a] transition-colors
                           hover:text-[#e8f0f7] w-fit cursor-pointer"
              >
                <svg
                  className="h-4 w-4 transition-transform
                             group-hover:-translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Volver
              </button>

              <div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full
                  px-3 py-1 text-[11px] uppercase tracking-[0.25em]
                  border ${
                    isPatient
                      ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                      : "border-[#00d4aa]/20 bg-[#00d4aa]/10 text-[#7ff5dc]"
                  }`}
                >
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      isPatient ? "bg-blue-400" : "bg-[#00d4aa]"
                    }`}
                  />

                  {isPatient ? "Paciente" : "Profesional"}
                </div>

                <h2
                  className="mt-5 text-3xl font-extralight
                             tracking-[-0.03em] text-[#f4f8fc]"
                >
                  {isPatient ? "Accede a tu espacio" : "Ingreso profesional"}
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-[#6c859d]">
                  Verificaremos tu identidad antes de establecer la conexión.
                </p>
              </div>
            </div>

            {/* Icon */}
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center
              rounded-2xl border ${
                isPatient
                  ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                  : "border-[#00d4aa]/20 bg-[#00d4aa]/10 text-[#7ff5dc]"
              }`}
            >
              {isPatient ? (
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[11px] font-medium uppercase
                           tracking-[0.2em] text-[#60758a]"
              >
                Correo electrónico
              </label>

              <div
                className="group flex items-center gap-3 rounded-2xl
                           border border-white/8 bg-white/3
                           px-4 py-3 transition-all
                           focus-within:border-white/20
                           focus-within:bg-white/5"
              >
                <svg
                  className="h-5 w-5 text-[#60758a]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full bg-transparent text-sm text-[#f4f8fc]
                             outline-none placeholder:text-[#60758a]"
                />
              </div>
            </div>

            {/* Document */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[11px] font-medium uppercase
                           tracking-[0.2em] text-[#60758a]"
              >
                {docLabel}
              </label>

              <div
                className="group flex items-center gap-3 rounded-2xl
                           border border-white/8 bg-white/3
                           px-4 py-3 transition-all
                           focus-within:border-white/20
                           focus-within:bg-white/5"
              >
                <svg
                  className="h-5 w-5 text-[#60758a]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect x="4" y="5" width="16" height="14" rx="2" />
                  <path d="M8 9h8M8 13h5" />
                </svg>

                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder={docHolder}
                  required
                  className="w-full bg-transparent text-sm text-[#f4f8fc]
                             outline-none placeholder:text-[#60758a]"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`group mt-2 flex h-14 items-center justify-center
              gap-3 rounded-2xl font-medium transition-all
              disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer
              ${
                isPatient
                  ? "bg-blue-500 text-white hover:bg-blue-400"
                  : "bg-[#00d4aa] text-[#03241f] hover:bg-[#00e8ba]"
              }`}
            >
              {loading ? (
                <>
                  <div
                    className="h-4 w-4 animate-spin rounded-full
                               border-2 border-current border-t-transparent"
                  />
                  Verificando acceso...
                </>
              ) : (
                <>
                  Continuar
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
          </form>
        </div>
      </div>
    </div>
  );
}
