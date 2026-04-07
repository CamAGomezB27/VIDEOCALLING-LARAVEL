"use client";

import type { Participant, Room } from "livekit-client";
import { RoomEvent } from "livekit-client";
import { useCallback, useState } from "react";
import type { SpeakingState } from "../types";

export function useSpeakingDetection() {
  const [speaking, setSpeaking] = useState<SpeakingState>({});

  const setupSpeakingDetection = useCallback((room: Room) => {
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
      // Construir nuevo mapa: solo los que están hablando ahora
      const next: SpeakingState = {};
      speakers.forEach((p) => {
        next[p.identity] = true;
      });
      setSpeaking(next);
    });
  }, []);

  return { speaking, setupSpeakingDetection };
}
