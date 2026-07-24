import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SortStep } from "../lib/sort-merge";

export const VfxLayerMerge: React.FC<{
  step: SortStep;
  progress: number;
  n: number;
  originX: number;
  originY: number;
  slotW: number;
  bufferY: number;
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
      {step.kind === "compare" && (
        <CompareArc
          x1={slotCenter(step.i)}
          y1={barTop(step.i) - 60}
          x2={slotCenter(step.j)}
          y2={barTop(step.j) - 60}
          progress={progress}
        />
      )}

      {step.kind === "mergeDone" && (
        <SwapFlash
          x={(slotCenter(step.lo) + slotCenter(step.hi)) / 2}
          y={originY - 350}
          progress={progress}
          color="#58C7A3"
        />
      )}

      {step.kind === "mergeDone" && (
        <LockSheen
          x={originX + step.lo * slotW}
          y={originY - 720}
          width={(step.hi - step.lo + 1) * slotW}
          height={720}
          progress={progress}
        />
      )}

      {finalFlashActive && <FinalFlash frame={frame} fps={fps} />}
    </>
  );
};

const CompareArc: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
}> = ({ x1, y1, x2, y2, progress }) => {
  const midX = (x1 + x2) / 2;
  const midY = Math.min(y1, y2) - 90;
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
          <linearGradient id="mcmpGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7AB8FF" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
        <path
          d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
          fill="none"
          stroke="url(#mcmpGrad)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="8 6"
          style={{ filter: "drop-shadow(0 0 6px rgba(167,139,250,0.6))" }}
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
          background:
            "radial-gradient(circle, #FFFFFF 0%, #A78BFA 60%, rgba(167,139,250,0) 100%)",
          opacity,
          boxShadow: "0 0 20px #A78BFA, 0 0 40px rgba(167,139,250,0.6)",
        }}
      />
    </>
  );
};

const SwapFlash: React.FC<{ x: number; y: number; progress: number; color: string }> = ({
  x,
  y,
  progress,
  color,
}) => {
  const rp = Math.max(0, Math.min(1, (progress - 0.2) / 0.5));
  const size = interpolate(rp, [0, 1], [40, 340]);
  const op = interpolate(rp, [0, 0.25, 1], [0, 0.7, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}CC 0%, ${color}44 40%, ${color}00 80%)`,
        opacity: op,
        filter: "blur(2px)",
      }}
    />
  );
};

const LockSheen: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  progress: number;
}> = ({ x, y, width, height, progress }) => {
  const sx = interpolate(progress, [0, 1], [-width * 0.4, width]);
  const opacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 0.65, 0.45, 0]);
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
          width: 200,
          height: "100%",
          background:
            "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)",
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