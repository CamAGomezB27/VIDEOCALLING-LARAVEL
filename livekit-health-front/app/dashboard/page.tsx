"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import {
  AppointmentList,
  ScheduleForm,
  useAppointments,
} from "@/features/appointments";
import type { NewAppointment } from "@/features/appointments/types";
import { useAuth } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { getUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("appointments");
  const [toast, setToast] = useState<string | null>(null);

  const user = getUser();

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  const { appointments, loading, error, schedule } = useAppointments(
    user?.id ?? 0,
    user?.role ?? "patient",
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSchedule = async (data: NewAppointment) => {
    await schedule(data);
    showToast("Cita agendada correctamente");
    setActiveTab("appointments");
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  const isPatient = user.role === "patient";

  return (
    <div className="h-screen bg-[#090e14] flex overflow-hidden">
      <Sidebar
        userName={user.name}
        userRole={isPatient ? "Paciente" : "Médico"}
        isPatient={isPatient}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto px-9 py-8 flex flex-col gap-6">
        {activeTab === "appointments" && (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-light text-[#e8f0f7] tracking-tight">
                  Mis citas
                </h2>
                <p className="text-sm text-[#5a7a96] font-mono mt-1">
                  Consultas programadas y anteriores
                </p>
              </div>
              <button
                onClick={() => setActiveTab("new")}
                className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-[#04342c]
                           text-sm font-medium rounded-xl hover:bg-[#00e8ba] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nueva cita
              </button>
            </div>

            <AppointmentList
              appointments={appointments}
              loading={loading}
              error={error}
              role={user.role}
            />
          </>
        )}

        {activeTab === "new" && (
          <>
            <div>
              <h2 className="text-xl font-light text-[#e8f0f7] tracking-tight">
                Agendar cita
              </h2>
              <p className="text-sm text-[#5a7a96] font-mono mt-1">
                Programa una nueva consulta virtual
              </p>
            </div>

            <ScheduleForm
              role={user.role}
              userId={user.id}
              onSchedule={handleSchedule}
              onSuccess={() => setActiveTab("appointments")}
              onCancel={() => setActiveTab("appointments")}
            />
          </>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                        bg-[#1a2330] border border-white/10 rounded-xl
                        px-5 py-3 text-sm text-[#e8f0f7] font-mono
                        animate-in fade-in slide-in-from-bottom-2"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
