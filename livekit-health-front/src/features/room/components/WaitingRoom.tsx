"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  userName: string;
  message: string | null;
  wasRejected: boolean;
  onLeave: () => void;
}

export function WaitingRoom({
  userName,
  message,
  wasRejected,
  onLeave,
}: Props) {
  const router = useRouter();
  const [dots, setDots] = useState(".");

  useEffect(() => {
    if (wasRejected) return;

    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 600);

    return () => clearInterval(id);
  }, [wasRejected]);

  const handleLeave = async () => {
    await onLeave();
    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090e14] flex items-center justify-center px-6">
      {/* Fondo dinámico */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#00d4aa]/10 blur-3xl animate-pulse" />
      </div>

      {/* Card principal */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#111820]/80 backdrop-blur-xl p-8 text-center shadow-2xl">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-[#0f1722] border border-white/10 flex items-center justify-center">
              <span className="text-3xl font-light text-[#e8f0f7]">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>

            {!wasRejected && (
              <span className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-amber-400 border-2 border-[#090e14] flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-[#090e14]" />
              </span>
            )}
          </div>
        </div>

        {wasRejected ? (
          <>
            {/* ERROR STATE */}
            <div className="mb-6">
              <h2 className="text-xl font-light text-[#e8f0f7]">
                Acceso rechazado
              </h2>

              <p className="mt-3 text-sm text-[#7b90a5] leading-relaxed">
                {message ?? "El médico no admitió tu ingreso a la sesión."}
              </p>
            </div>

            <button
              onClick={handleLeave}
              className="w-full py-3 rounded-2xl bg-[#111820] border border-white/10
                         text-sm text-[#e8f0f7] hover:border-white/20 transition-all"
            >
              Volver al inicio
            </button>
          </>
        ) : (
          <>
            {/* WAITING STATE */}
            <div className="mb-6">
              <h2 className="text-2xl font-light text-[#e8f0f7] tracking-tight">
                Conectando{dots}
              </h2>

              <p className="mt-3 text-sm text-[#7b90a5] leading-relaxed">
                El médico revisará tu solicitud en tiempo real
              </p>
            </div>

            {/* MESSAGE */}
            {message && (
              <div className="mb-6 text-left rounded-2xl border border-[#00d4aa]/15 bg-[#0f1722] p-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#00d4aa] mb-2">
                  Mensaje del médico
                </p>

                <p className="text-sm text-[#e8f0f7] leading-relaxed">
                  {message}
                </p>
              </div>
            )}

            {/* LIVE INDICATOR */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="h-2 w-2 rounded-full bg-[#00d4aa] animate-pulse" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#5a7a96]">
                esperando respuesta
              </span>
            </div>

            {/* ACTION */}
            <button
              onClick={handleLeave}
              className="text-sm text-[#7b90a5] hover:text-red-400 transition-colors"
            >
              Cancelar y salir
            </button>
          </>
        )}
      </div>
    </div>
  );
}
