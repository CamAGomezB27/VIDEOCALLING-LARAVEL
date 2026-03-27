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
  const docLabel = isPatient ? "Número de cédula" : "Número de licencia médica";
  const docHolder = isPatient ? "1234567890" : "MED-001";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email.trim(), docNumber.trim(), role);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#5a7a96] hover:text-[#e8f0f7]
                   transition-colors w-fit cursor-pointer"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Volver
      </button>

      <div className="flex flex-col gap-1.5">
        <span
          className={`text-xs font-medium uppercase tracking-widest px-3 py-1
                          rounded-full w-fit ${
                            isPatient
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20"
                          }`}
        >
          {isPatient ? "Paciente" : "Médico"}
        </span>
        <h2 className="text-2xl font-light text-[#e8f0f7] tracking-tight">
          {isPatient ? "Ingresa tus datos" : "Acceso médico"}
        </h2>
        <p className="text-sm text-[#5a7a96] font-mono">
          Verificaremos tu identidad antes de la consulta
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-[#111820] border border-white/10
                       rounded-2xl p-7"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#5a7a96] uppercase tracking-wider">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            className="bg-[#1a2330] border border-white/10 rounded-xl px-4 py-3
                       text-[#e8f0f7] font-mono text-sm outline-none
                       focus:border-[#00d4aa]/40 transition-colors placeholder:text-[#5a7a96]/60"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#5a7a96] uppercase tracking-wider">
            {docLabel}
          </label>
          <input
            type="text"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            placeholder={docHolder}
            required
            className="bg-[#1a2330] border border-white/10 rounded-xl px-4 py-3
                       text-[#e8f0f7] font-mono text-sm outline-none
                       focus:border-[#00d4aa]/40 transition-colors placeholder:text-[#5a7a96]/60"
          />
        </div>

        {error && (
          <p
            className="text-xs text-red-400 font-mono bg-red-500/10
                        border border-red-500/20 rounded-lg px-3 py-2"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 py-3 rounded-xl
                     bg-[#00d4aa] text-[#04342c] font-medium text-sm
                     hover:bg-[#00e8ba] transition-colors disabled:opacity-50
                     disabled:cursor-not-allowed mt-1 cursor-pointer"
        >
          {loading ? "Verificando..." : "Continuar"}
          {!loading && (
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
