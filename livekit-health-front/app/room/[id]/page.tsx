"use client";

import { useAuth } from "@/features/auth";
import { VideoRoom } from "@/features/room";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();

  const { getUser } = useAuth();
  const user = getUser();

  const id = params?.id as string;
  const appointmentId = parseInt(id, 10);

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  if (!id || isNaN(appointmentId)) {
    console.error("ID inválido:", id);
    return (
      <div className="h-screen bg-[#090e14] flex items-center justify-center text-white">
        Error: ID inválido
      </div>
    );
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