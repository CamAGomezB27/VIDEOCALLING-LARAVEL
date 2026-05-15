"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import {
  AppointmentList,
  ScheduleForm,
  useAppointments,
} from "@/features/appointments";
import { useAuth } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { getUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("appointments");
  const [toast, setToast] = useState<string | null>(null);

  const user = getUser();

  // ✅ Hook SIEMPRE se llama
  const { appointments, loading, error, schedule } = useAppointments(
    user?.id ?? 0,
    user?.role ?? "patient",
  );

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="h-screen bg-[#090e14] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#00d4aa] animate-spin" />
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSchedule = async (data: Parameters<typeof schedule>[0]) => {
    await schedule(data);
    showToast("Cita agendada correctamente");
    setActiveTab("appointments");
  };

  const isPatient = user.role === "patient";

  return (
    <div className="h-screen bg-[#090e14] flex overflow-hidden">
      <Sidebar
        userName={user.name}
        userRole={isPatient ? "Paciente" : "Médico"}
        isPatient={isPatient}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
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
                className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa]
                           text-[#04342c] text-sm font-medium rounded-xl
                           hover:bg-[#00e8ba] transition-colors cursor-pointer"
              >
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
          <ScheduleForm
            role={user.role}
            userId={user.id}
            onSchedule={handleSchedule}
            onSuccess={() => setActiveTab("appointments")}
            onCancel={() => setActiveTab("appointments")}
          />
        )}
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a2330] border border-white/10 rounded-xl px-5 py-3 text-sm text-[#e8f0f7] font-mono">
          {toast}
        </div>
      )}
    </div>
  );
}
