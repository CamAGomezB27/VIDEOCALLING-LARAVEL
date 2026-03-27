"use client";

import { LoginForm, RoleSelector } from "@/features/auth";
import type { Role } from "@/shared/types";
import { useState } from "react";

export default function HomePage() {
  const [role, setRole] = useState<Role | null>(null);

  return (
    <main
      className="min-h-screen bg-[#090e14] flex flex-col items-center
                     justify-center px-6"
      style={{
        background: `
              radial-gradient(ellipse 55% 45% at 15% 65%, rgba(0,212,170,0.06) 0%, transparent 70%),
              radial-gradient(ellipse 45% 35% at 85% 25%, rgba(0,102,255,0.07) 0%, transparent 70%),
              #090e14
            `,
      }}
    >
      {/* Brand */}
      <div className="absolute top-6 left-7 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
        <span className="text-xs font-medium tracking-widest text-[#00d4aa] uppercase">
          MediCall
        </span>
      </div>

      {!role ? (
        <div className="flex flex-col items-center gap-10 w-full max-w-sm">
          <div className="text-center flex flex-col gap-2">
            <h1 className="text-3xl font-light text-[#e8f0f7] tracking-tight">
              Bienvenido
            </h1>
            <p className="text-sm text-[#5a7a96] italic">¿Cómo ingresas hoy?</p>
          </div>
          <RoleSelector onSelect={setRole} />
        </div>
      ) : (
        <LoginForm role={role} onBack={() => setRole(null)} />
      )}
    </main>
  );
}
