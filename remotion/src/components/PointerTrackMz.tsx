import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { theme } from "../lib/theme";

const Pointer: React.FC<{
  label: string;
  value: number;
  targetLeft: number;
  top: number;
  color: string;
  colorSoft: string;
  frameKey: number;
}> = ({ label, value, targetLeft, top, color, colorSoft, frameKey }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({ frame: frame - frameKey, fps, config: { damping: 18, stiffness: 150 } });
  const bob = Math.sin(frame / 14) * 3;

  return (
    <div
      style={{
        position: "absolute",
        left: targetLeft,
        top: top + bob,
        transform: `translateX(-50%) scale(${interpolate(slide, [0, 1], [0.9, 1])})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderBottom: `16px solid ${color}`,
        }}
      />
      <div
        style={{
          padding: "8px 20px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.9)",
          boxShadow: `0 12px 26px rgba(120,130,180,0.20), inset 0 0 0 2px ${colorSoft}`,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: 26,
          color,
          whiteSpace: "nowrap",
        }}
      >
        {label} = {value}
      </div>
    </div>
  );
};

export const PointerTrackMz: React.FC<{
  read: number;
  write: number;
  x: number;
  y: number;
  cellW: number;
  gap: number;
  count: number;
  stepStartFrame: number;
}> = ({ read, write, x, y, cellW, gap, count, stepStartFrame }) => {
  const clamp = (i: number) => Math.max(0, Math.min(count - 1, i));
  const center = (i: number) => x + clamp(i) * (cellW + gap) + cellW / 2;

  return (
    <>
      <Pointer
        label="read"
        value={clamp(read)}
        targetLeft={center(read)}
        top={y}
        color="#3E86DE"
        colorSoft="#8FC3FF"
        frameKey={stepStartFrame}
      />
      <Pointer
        label="write"
        value={clamp(write)}
        targetLeft={center(write)}
        top={y + 92}
        color="#7C5CE0"
        colorSoft="#C6B3FF"
        frameKey={stepStartFrame}
      />
      <div
        style={{
          position: "absolute",
          left: x,
          top: y + 196,
          width: (cellW + gap) * count - gap,
          textAlign: "center",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 22,
          color: theme.inkSoft,
          opacity: 0.85,
        }}
      >
        read scans every element · write marks the next non-zero slot
      </div>
    </>
  );
};