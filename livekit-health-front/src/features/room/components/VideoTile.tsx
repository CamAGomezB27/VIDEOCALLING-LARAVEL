"use client";

import type { LocalVideoTrack, RemoteVideoTrack } from "livekit-client";
import { useEffect, useRef } from "react";

interface Props {
  track: LocalVideoTrack | RemoteVideoTrack;
  identity: string;
  muted?: boolean;
  speaking?: boolean;
}

export function VideoTile({
  track,
  identity,
  muted = false,
  speaking = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = track.attach() as HTMLVideoElement;
    el.muted = muted;
    el.autoplay = true;
    el.playsInline = true;
    el.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";

    containerRef.current.appendChild(el);
    videoRef.current = el;

    return () => {
      track.detach(el);
      el.remove();
      videoRef.current = null;
    };
  }, [track, muted]);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#111820] flex-1
                     max-w-3xl aspect-video transition-all duration-200
                     ${
                       speaking
                         ? "ring-2 ring-[#00d4aa] ring-offset-2 ring-offset-[#090e14]"
                         : "border border-white/10"
                     }`}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Label */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        {speaking && (
          <div className="flex items-center gap-0.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-0.5 bg-[#00d4aa] rounded-full"
                style={{
                  height: `${8 + i * 4}px`,
                  animation: `speaking-bar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                }}
              />
            ))}
          </div>
        )}
        <div
          className="text-xs font-mono text-[#e8f0f7]
                        bg-[#090e14]/75 backdrop-blur-sm px-2.5 py-1
                        rounded-lg border border-white/10"
        >
          {identity}
        </div>
      </div>
    </div>
  );
}
