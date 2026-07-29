import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { theme } from "../lib/theme";
import { SortStep } from "../lib/sort-heap";

// Compact array-cell view of the heap array (below the tree).
export const BarsStageHeap: React.FC<{
  step: SortStep;
  progress: number;
  n: number;
  originX: number;
  originY: number;
  slotW: number;
  cellW: number;
  cellH: number;
}> = ({ step, progress, n, originX, originY, slotW, cellW, cellH }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {step.arr.map((v, i) => {
        const active = step.active.includes(i);
        const locked = step.locked.includes(i);
        const inHeap = i < step.heapEnd;
        const enter = spring({ frame: frame - i * 3, fps, config: { damping: 14, stiffness: 160 }, durationInFrames: 20 });
        const scale = interpolate(enter, [0, 1], [0.4, 1]);
        const float = Math.sin((frame + i * 9) / 20) * 2;
        const pulse = active ? 1 + Math.sin(frame / 5) * 0.05 : 1;

        const colors = locked ? theme.bar.locked : active ? theme.bar.active : theme.bar.idle;
        const shadow = active
          ? "0 14px 30px rgba(255,126,179,0.35), inset 0 2px 0 rgba(255,255,255,0.55)"
          : locked
            ? "0 14px 30px rgba(88,199,163,0.32), inset 0 2px 0 rgba(255,255,255,0.55)"
            : "0 14px 30px rgba(167,139,250,0.28), inset 0 2px 0 rgba(255,255,255,0.55)";
        const opacity = inHeap || locked ? 1 : 0.5;

        const x = originX + i * slotW + slotW / 2;
        return (
          <div key={i} style={{
            position: "absolute",
            left: x - cellW / 2, top: originY + float,
            width: cellW, height: cellH,
            transform: `scale(${scale * pulse})`, transformOrigin: "50% 50%",
            opacity,
          }}>
            <div style={{
              position: "relative", width: "100%", height: "100%",
              borderRadius: 20,
              background: `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
              boxShadow: shadow,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0) 60%)",
              }} />
              <div style={{
                fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 36, color: "#fff",
                textShadow: "0 2px 6px rgba(30,35,64,0.35)", letterSpacing: -0.5,
              }}>{v}</div>
            </div>
            <div style={{
              position: "absolute", top: cellH + 6, left: 0, right: 0, textAlign: "center",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 600, color: theme.inkSoft, opacity: 0.75,
            }}>[{i}]</div>
          </div>
        );
      })}
    </>
  );
};