import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SortStep } from "../lib/sort";

// Frame-driven VFX layer keyed off the current sort step.
// Additive glow effects on top of the bars stage.
export const VfxLayer: React.FC<{
  step: SortStep;
  progress: number;
  n: number;
  originX: number;
  originY: number;
  slotW: number;
  maxValue: number;
  finalFlashActive: boolean;
}> = ({ step, progress, originX, originY, slotW, maxValue, finalFlashActive }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slotCenter = (idx: number) => originX + idx * slotW + slotW / 2;
  const barTop = (idx: number) => {
    const v = step.arr[idx] ?? 0;
    const h = (v / maxValue) * 700;
    return originY - h;
  };

  return (
    <>
      {/* Compare arc: peach/pink arc between i and j */}
      {step.kind === "compare" && step.j >= 0 && (
        <CompareArc
          x1={slotCenter(step.i)}
          y1={barTop(step.i) - 60}
          x2={slotCenter(step.j)}
          y2={barTop(step.j) - 20}
          progress={progress}
        />
      )}

      {/* Insert impact: ring pulse + particle burst at landing slot */}
      {step.kind === "insert" && (
        <InsertImpact
          x={slotCenter(step.j + 1)}
          y={originY}
          progress={progress}
        />
      )}

      {/* Advance / lock sheen sweep across locked bars */}
      {step.kind === "advance" && (
        <LockSheen
          x={originX}
          y={originY - 720}
          width={slotW * step.locked.length}
          height={720}
          progress={progress}
        />
      )}

      {/* Final white bloom flash */}
      {finalFlashActive && <FinalFlash frame={frame} fps={fps} />}
    </>
  );
};

const CompareArc: React.FC<{
  x1: number; y1: number; x2: number; y2: number; progress: number;
}> = ({ x1, y1, x2, y2, progress }) => {
  const midX = (x1 + x2) / 2;
  const midY = Math.min(y1, y2) - 120;
  const opacity = interpolate(progress, [0, 0.15, 0.7, 1], [0, 1, 1, 0]);
  const dotP = Math.min(1, progress * 1.2);
  const bez = (t: number, a: number, b: number, c: number) =>
    (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
  const dx = bez(dotP, x1, midX, x2);
  const dy = bez(dotP, y1, midY, y2);

  return (
    <>
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity,
        }}
      >
        <defs>
          <linearGradient id="cmpGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFB199" />
            <stop offset="100%" stopColor="#FF7EB3" />
          </linearGradient>
        </defs>
        <path
          d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
          fill="none"
          stroke="url(#cmpGrad)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="8 6"
          style={{ filter: "drop-shadow(0 0 6px rgba(255,126,179,0.6))" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: dx - 12,
          top: dy - 12,
          width: 24,
          height: 24,
          borderRadius: 12,
          background: "radial-gradient(circle, #FFFFFF 0%, #FF7EB3 60%, rgba(255,126,179,0) 100%)",
          opacity,
          boxShadow: "0 0 20px #FF7EB3, 0 0 40px rgba(255,126,179,0.6)",
        }}
      />
    </>
  );
};

const InsertImpact: React.FC<{ x: number; y: number; progress: number }> = ({ x, y, progress }) => {
  // ring: starts at p ~ 0.6
  const rp = Math.max(0, (progress - 0.55) / 0.45);
  const ringSize = interpolate(rp, [0, 1], [40, 260]);
  const ringOpacity = interpolate(rp, [0, 0.2, 1], [0, 0.55, 0]);

  const particles = 8;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - ringSize / 2,
          top: y - ringSize / 2,
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          border: "4px solid #7EE7C7",
          opacity: ringOpacity,
          boxShadow: "0 0 30px rgba(126,231,199,0.6), inset 0 0 20px rgba(126,231,199,0.4)",
        }}
      />
      {Array.from({ length: particles }).map((_, i) => {
        const angle = (i / particles) * Math.PI * 2 - Math.PI / 2;
        const dist = interpolate(rp, [0, 1], [0, 140]);
        const px = x + Math.cos(angle) * dist;
        const py = y + Math.sin(angle) * dist - rp * rp * 30; // slight gravity
        const size = interpolate(rp, [0, 0.3, 1], [4, 14, 6]);
        const op = interpolate(rp, [0, 0.15, 1], [0, 1, 0]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px - size / 2,
              top: py - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#7EE7C7" : "#FFFFFF",
              opacity: op,
              boxShadow: "0 0 12px #7EE7C7",
            }}
          />
        );
      })}
    </>
  );
};

const LockSheen: React.FC<{
  x: number; y: number; width: number; height: number; progress: number;
}> = ({ x, y, width, height, progress }) => {
  const sx = interpolate(progress, [0, 1], [-width * 0.4, width]);
  const opacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 0.55, 0.4, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        overflow: "hidden",
        pointerEvents: "none",
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: sx,
          top: 0,
          width: 260,
          height: "100%",
          background:
            "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)",
          transform: "skewX(-18deg)",
          filter: "blur(6px)",
        }}
      />
    </div>
  );
};

const FinalFlash: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - 1080;
  const s = spring({ frame: localFrame, fps, config: { damping: 40, stiffness: 60 }, durationInFrames: 30 });
  const opacity = interpolate(s, [0, 0.4, 1], [0, 0.3, 0]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at center 60%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%)",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};