"use client";

import { LocalVideoTrack, RemoteVideoTrack, Track } from "livekit-client";
import { useEffect, useRef } from "react";
import type { SpeakingState } from "../types";

/* =========================
   VideoTile
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
      className={`relative rounded-2xl overflow-hidden bg-[#111820] border flex-1 max-w-3xl aspect-video transition-all duration-200
        ${
          speaking
            ? "border-[#00d4aa] shadow-[0_0_0_2px_rgba(0,212,170,0.4)]"
            : "border-white/10"
        }`}
    >
      <div ref={ref} className="w-full h-full" />

      <div className="absolute bottom-3 left-3 text-xs font-medium text-[#e8f0f7] bg-[#090e14]/75 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10 font-mono">
        {identity}
      </div>
    </div>
  );
}

/* =========================
   VideoGrid
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
  const isEmpty = !localTrack && remoteTracks.length === 0;

  if (isEmpty) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-[#5a7a96]">
        <div className="w-9 h-9 rounded-full border-2 border-white/10 border-t-[#00d4aa] animate-spin" />
        <span className="text-sm font-mono">Conectando a la sala...</span>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex items-center justify-center gap-3 p-5 overflow-hidden"
      style={{
        background: `radial-gradient(ellipse 40% 40% at 50% 50%,
          rgba(0,212,170,0.03) 0%, transparent 70%), #090e14`,
      }}
    >
      {localTrack && (
        <VideoTile
          track={localTrack}
          identity={`${localIdentity} (tú)`}
          muted
          speaking={speaking[localIdentity] ?? false}
        />
      )}

      {remoteTracks.map(({ track, identity }) => (
        <VideoTile
          key={identity}
          track={track}
          identity={identity}
          speaking={speaking[identity] ?? false}
        />
      ))}
    </div>
  );
}
