"use client";

import { useAuth } from "@/features/auth";
import { VideoRoom } from "@/features/room";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getUser } = useAuth();

  const user = getUser();
  const appointmentId = parseInt(params.id);

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="h-screen bg-[#090e14] flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 border-white/10
                      border-t-[#00d4aa] animate-spin"
        />
      </div>
    );
  }

  return <VideoRoom appointmentId={appointmentId} user={user} />;
}
