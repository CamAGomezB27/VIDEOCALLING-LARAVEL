"use client";

import { LoginForm, RoleSelector } from "@/features/auth";
import type { Role } from "@/shared/types";
import { useState } from "react";

export default function HomePage() {
  const [role, setRole] = useState<Role | null>(null);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090e14]">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base */}
        <div
          className="absolute inset-0"
          style={{
            background: `
        radial-gradient(circle at 15% 20%, rgba(0,102,255,0.18), transparent 25%),
        radial-gradient(circle at 85% 80%, rgba(0,212,170,0.14), transparent 25%),
        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03), transparent 60%),
        #090e14
      `,
          }}
        />

        {/* BIG floating blue orb */}
        <div
          className="absolute -top-52 -left-52 h-162.5 w-162.5
               rounded-full bg-blue-500/20 blur-3xl"
          style={{
            animation: "floatBlue 14s ease-in-out infinite",
          }}
        />

        {/* BIG floating green orb */}
        <div
          className="absolute -bottom-56 -right-52 h-162.5 w-162.5
               rounded-full bg-[#00d4aa]/20 blur-3xl"
          style={{
            animation: "floatGreen 16s ease-in-out infinite",
          }}
        />

        {/* Center animated orb */}
        <div
          className="absolute top-[25%] left-[35%] h-80 w-[320px]
               rounded-full bg-cyan-400/10 blur-3xl"
          style={{
            animation: "pulseCenter 8s ease-in-out infinite",
          }}
        />

        {/* Moving spotlight */}
        <div
          className="absolute top-[-20%] left-[-10%] h-350 w-125
               rotate-12 bg-linear-to-b
               from-blue-500/10 via-cyan-400/5 to-transparent blur-3xl"
          style={{
            animation: "lightSweep 18s linear infinite",
          }}
        />

        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
        linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
      `,
            backgroundSize: "70px 70px",
            animation: "gridMove 18s linear infinite",
          }}
        />

        {/* Noise */}
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-soft-light"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140"%3E%3Cg fill="white" fill-opacity="0.4"%3E%3Ccircle cx="12" cy="12" r="1"/%3E%3Ccircle cx="80" cy="40" r="1"/%3E%3Ccircle cx="50" cy="90" r="1"/%3E%3Ccircle cx="120" cy="100" r="1"/%3E%3C/g%3E%3C/svg%3E\')',
          }}
        />
      </div>

      {/* Brand */}
      <div className="absolute top-7 left-8 z-20 flex items-center gap-3">
        <div className="relative">
          <div className="h-2.5 w-2.5 rounded-full bg-[#00d4aa]" />

          <div
            className="absolute inset-0 rounded-full bg-[#00d4aa]
                       animate-ping opacity-40"
          />
        </div>

        <span
          className="text-xs font-semibold tracking-[0.35em]
                     text-[#00d4aa] uppercase"
        >
          MediCall
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        {!role ? (
          <div className="w-full max-w-7xl">
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 rounded-full
                           border border-white/10 bg-white/3
                           px-5 py-2 backdrop-blur-sm"
              >
                <div className="h-2 w-2 rounded-full bg-[#00d4aa]" />

                <span
                  className="text-[11px] uppercase tracking-[0.3em]
                             text-[#89a6bf]"
                >
                  Espacio de conexión inteligente
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <RoleSelector onSelect={setRole} />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <LoginForm role={role} onBack={() => setRole(null)} />
          </div>
        )}
      </div>
    </main>
  );
}
