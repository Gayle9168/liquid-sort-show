import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SortStep } from "../lib/sort-quick";

export const VfxLayerQuick: React.FC<{
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

  const showPivotGlow =
    step.pivotIndex >= 0 &&
    (step.kind === "pickPivot" ||
      step.kind === "scanStart" ||
      step.kind === "compare" ||
      step.kind === "swap");

  return (
    <>
      {/* Pivot marker glow ring */}
      {showPivotGlow && (
        <PivotGlow x={slotCenter(step.pivotIndex)} y={originY - 4} frame={frame} />
      )}

      {/* Compare arc between j and pivot */}
      {step.kind === "compare" && step.pivotIndex >= 0 && step.j !== step.pivotIndex && (
        <CompareArc
          x1={slotCenter(step.j)}
          y1={barTop(step.j) - 40}
          x2={slotCenter(step.pivotIndex)}
          y2={barTop(step.pivotIndex) - 40}
          progress={progress}
        />
      )}

      {/* Swap flash */}
      {(step.kind === "swap" || step.kind === "pivotSwap") && (
        <SwapFlash
          x={(slotCenter(step.i) + slotCenter(step.j)) / 2}
          y={originY - 240}
          progress={progress}
          color={step.kind === "pivotSwap" ? "#7EE7C7" : "#FF7EB3"}
        />
      )}

      {/* Partition boundary line at i */}
      {(step.kind === "compare" || step.kind === "swap" || step.kind === "scanStart") &&
        step.i >= step.lo - 1 && (
          <PartitionLine
            x={originX + (step.i + 1) * slotW}
            yTop={originY - 720}
            yBot={originY + 10}
            frame={frame}
          />
        )}

      {/* Lock sheen when pivot placed */}
      {step.kind === "pivotSwap" && (
        <LockSheen
          x={slotCenter(step.i) - slotW / 2}
          y={originY - 720}
          width={slotW}
          height={720}
          progress={progress}
        />
      )}

      {/* Final flash */}
      {finalFlashActive && <FinalFlash frame={frame} fps={fps} />}
    </>
  );
};

const PivotGlow: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => {
  const pulse = 0.6 + Math.sin(frame / 6) * 0.25;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - 60,
          top: y - 12,
          width: 120,
          height: 24,
          borderRadius: 12,
          background:
            "radial-gradient(ellipse at center, rgba(255,177,153,0.9) 0%, rgba(255,126,179,0.4) 40%, rgba(255,126,179,0) 80%)",
          filter: "blur(2px)",
          opacity: pulse,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - 22,
          top: y - 34,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 16,
          fontWeight: 800,
          color: "#B44A6B",
          letterSpacing: 1.5,
          textShadow: "0 0 8px rgba(255,255,255,0.9)",
        }}
      >
        PIVOT
      </div>
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
  const midY = Math.min(y1, y2) - 100;
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
          <linearGradient id="qcmpGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFB199" />
            <stop offset="100%" stopColor="#FF7EB3" />
          </linearGradient>
        </defs>
        <path
          d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
          fill="none"
          stroke="url(#qcmpGrad)"
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
          background:
            "radial-gradient(circle, #FFFFFF 0%, #FF7EB3 60%, rgba(255,126,179,0) 100%)",
          opacity,
          boxShadow: "0 0 20px #FF7EB3, 0 0 40px rgba(255,126,179,0.6)",
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
  const rp = Math.max(0, Math.min(1, (progress - 0.35) / 0.4));
  const size = interpolate(rp, [0, 1], [40, 220]);
  const op = interpolate(rp, [0, 0.25, 1], [0, 0.75, 0]);
  return (
    <>
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
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const dist = interpolate(rp, [0, 1], [0, 90]);
        const px = x + Math.cos(angle) * dist;
        const py = y + Math.sin(angle) * dist;
        const s = interpolate(rp, [0, 0.3, 1], [2, 10, 4]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px - s / 2,
              top: py - s / 2,
              width: s,
              height: s,
              borderRadius: "50%",
              background: "#FFFFFF",
              opacity: op,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        );
      })}
    </>
  );
};

const PartitionLine: React.FC<{
  x: number;
  yTop: number;
  yBot: number;
  frame: number;
}> = ({ x, yTop, yBot, frame }) => {
  const pulse = 0.4 + Math.sin(frame / 6) * 0.2;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 2,
        top: yTop,
        width: 4,
        height: yBot - yTop,
        background: "linear-gradient(180deg, rgba(88,199,163,0) 0%, rgba(88,199,163,0.8) 30%, rgba(126,231,199,0.8) 100%)",
        borderRadius: 2,
        opacity: pulse,
        boxShadow: `0 0 12px rgba(126,231,199,${pulse})`,
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
  const opacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 0.7, 0.5, 0]);
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
          width: 160,
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