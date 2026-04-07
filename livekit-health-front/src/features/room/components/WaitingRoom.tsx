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

  // Animación de puntos suspensivos
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
    <div className="min-h-screen bg-[#090e14] flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-8 text-center max-w-sm w-full">
        {/* Avatar */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-2xl bg-[#111820] border border-white/10
                          flex items-center justify-center"
          >
            <span className="text-3xl font-light text-[#e8f0f7]">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          {!wasRejected && (
            <span
              className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-amber-400
                             rounded-full border-2 border-[#090e14] flex items-center
                             justify-center"
            >
              <span className="w-2 h-2 rounded-full bg-[#090e14]" />
            </span>
          )}
        </div>

        {wasRejected ? (
          <>
            {/* Estado: rechazado */}
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-light text-[#e8f0f7]">
                No pudiste unirte
              </h2>
              <p className="text-sm text-[#5a7a96] font-mono leading-relaxed">
                {message ?? "El médico no admitió tu ingreso a esta reunión."}
              </p>
            </div>
            <button
              onClick={handleLeave}
              className="px-6 py-3 rounded-xl bg-[#111820] border border-white/10
                         text-sm text-[#e8f0f7] hover:border-white/20 transition-colors"
            >
              Volver al inicio
            </button>
          </>
        ) : (
          <>
            {/* Estado: esperando */}
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-light text-[#e8f0f7]">
                Sala de espera{dots}
              </h2>
              <p className="text-sm text-[#5a7a96] font-mono leading-relaxed">
                El médico revisará tu solicitud de ingreso en breve
              </p>
            </div>

            {/* Mensaje del médico si llegó */}
            {message && (
              <div
                className="w-full bg-[#111820] border border-[#00d4aa]/20
                              rounded-2xl px-5 py-4 text-left"
              >
                <p className="text-xs text-[#00d4aa] font-mono mb-1.5 uppercase tracking-wider">
                  Mensaje del médico
                </p>
                <p className="text-sm text-[#e8f0f7] leading-relaxed">
                  {message}
                </p>
              </div>
            )}

            {/* Indicador animado */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#5a7a96]"
                  style={{
                    animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleLeave}
              className="text-sm text-[#5a7a96] hover:text-red-400 transition-colors
                         font-mono"
            >
              Cancelar y salir
            </button>
          </>
        )}
      </div>
    </div>
  );
}
