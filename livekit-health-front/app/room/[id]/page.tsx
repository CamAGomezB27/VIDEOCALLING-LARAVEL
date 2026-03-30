"use client";

import { useAuth } from "@/features/auth";
import { VideoRoom } from "@/features/room";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { getUser } = useAuth();

  const { id } = use(params); // ✅ aquí se resuelve el Promise

  const user = getUser();
  const appointmentId = parseInt(id); // ✅ ahora sí funciona

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  if (isNaN(appointmentId)) {
    console.error("ID inválido:", id);
    return <div>Error: ID inválido</div>;
  }

  if (!user) {
    return (
      <div className="h-screen bg-[#090e14] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#00d4aa] animate-spin" />
      </div>
    );
  }

  return <VideoRoom appointmentId={appointmentId} user={user} />;
}
