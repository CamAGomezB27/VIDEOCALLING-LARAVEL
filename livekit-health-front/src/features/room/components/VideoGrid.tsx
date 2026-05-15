"use client";

import { LocalVideoTrack, RemoteVideoTrack, Track } from "livekit-client";
import { useEffect, useRef } from "react";
import type { SpeakingState } from "../types";

/* =========================
   VIDEO TILE
========================= */

interface VideoTileProps {
  track: Track;
  identity: string;
  muted?: boolean;
  speaking?: boolean;
}

export function VideoTile({
  track,
  identity,
  muted = false,
  speaking = false,
}: VideoTileProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = track.attach() as HTMLMediaElement;

    el.muted = muted;
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.objectFit = "cover";

    ref.current.appendChild(el);

    return () => {
      track.detach(el);
      el.remove();
    };
  }, [track, muted]);

  return (
    <div
      className={`
        relative overflow-hidden bg-[#111820] border rounded-2xl
        w-full h-full aspect-video
        transition-all duration-200
        ${
          speaking
            ? "border-[#00d4aa] shadow-[0_0_0_2px_rgba(0,212,170,0.4)]"
            : "border-white/10"
        }
      `}
    >
      <div ref={ref} className="w-full h-full" />

      <div className="absolute bottom-3 left-3 text-xs font-mono text-[#e8f0f7] bg-[#090e14]/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
        {identity}
      </div>
    </div>
  );
}

/* =========================
   VIDEO GRID
========================= */

interface Props {
  localTrack: LocalVideoTrack | null;
  localIdentity: string;
  remoteTracks: Array<{ track: RemoteVideoTrack; identity: string }>;
  speaking: SpeakingState;
}

export function VideoGrid({
  localTrack,
  localIdentity,
  remoteTracks,
  speaking,
}: Props) {
  const participants = [
    ...(localTrack
      ? [
          {
            track: localTrack,
            identity: `${localIdentity} (tú)`,
            isLocal: true,
          },
        ]
      : []),

    ...remoteTracks.map(({ track, identity }) => ({
      track,
      identity,
      isLocal: false,
    })),
  ];

  const count = participants.length;

  if (count === 0) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-[#5a7a96]">
        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-[#00d4aa] animate-spin" />
        <span className="text-sm font-mono">Conectando a la sala...</span>
      </div>
    );
  }

  return (
    <div
      className={`
        flex-1 w-full h-full p-4 grid gap-3
        ${getGridClass(count)}
      `}
      style={{
        background: `radial-gradient(ellipse 40% 40% at 50% 50%,
          rgba(0,212,170,0.03) 0%, transparent 70%), #090e14`,
      }}
    >
      {participants.map((p) => (
        <VideoTile
          key={p.identity}
          track={p.track}
          identity={p.identity}
          muted={p.isLocal}
          speaking={speaking?.[p.identity] ?? false}
        />
      ))}
    </div>
  );
}

/* =========================
   GRID LOGIC
========================= */

function getGridClass(count: number) {
  if (count === 1) {
    return "grid-cols-1 grid-rows-1";
  }

  if (count === 2) {
    return "grid-cols-2 grid-rows-1";
  }

  if (count === 3) {
    return "grid-cols-2 grid-rows-2";
  }

  if (count === 4) {
    return "grid-cols-2 grid-rows-2";
  }

  if (count <= 6) {
    return "grid-cols-3 grid-rows-2";
  }

  if (count <= 9) {
    return "grid-cols-3 grid-rows-3";
  }

  return "grid-cols-4 auto-rows-fr";
}
