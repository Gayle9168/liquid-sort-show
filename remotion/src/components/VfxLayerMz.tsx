import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { MzStep } from "../lib/move-zeroes";

type Pt = { x: number; y: number };

export const VfxLayerMz: React.FC<{
  step: MzStep;
  progress: number;
  cellCenter: (i: number) => Pt;
}> = ({ step, progress, cellCenter }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {step.kind === "scan" && step.read >= 0 && (
        <ScanRing at={cellCenter(step.read)} p={progress} />
      )}
      {step.kind === "skip" && step.read >= 0 && (
        <ZeroPuff at={cellCenter(step.read)} p={progress} />
      )}
      {step.kind === "place" && step.swap && (
        <SwapBloom
          a={cellCenter(step.swap[0])}
          b={cellCenter(step.swap[1])}
          p={progress}
          frame={frame}
        />
      )}
      {step.kind === "result" && (
        <>
          {step.packed.map((i) => (
            <LockSheen key={i} at={cellCenter(i)} p={progress} delay={i * 0.08} />
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};

const ScanRing: React.FC<{ at: Pt; p: number }> = ({ at, p }) => {
  const r = interpolate(p, [0, 0.6], [30, 120], { extrapolateRight: "clamp" });
  const o = interpolate(p, [0, 0.15, 0.7], [0, 0.8, 0], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: at.x - r,
        top: at.y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        border: "3px solid rgba(106,169,245,0.9)",
        opacity: o,
      }}
    />
  );
};

const ZeroPuff: React.FC<{ at: Pt; p: number }> = ({ at, p }) => {
  const o = interpolate(p, [0, 0.2, 0.85], [0, 1, 0], { extrapolateRight: "clamp" });
  return (
    <>
      {Array.from({ length: 8 }).map((_, k) => {
        const ang = (k / 8) * Math.PI * 2;
        const d = interpolate(p, [0, 0.85], [10, 130], { extrapolateRight: "clamp" });
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: at.x + Math.cos(ang) * d - 6,
              top: at.y + Math.sin(ang) * d - 6,
              width: 12,
              height: 12,
              borderRadius: 6,
              background: "#FF9C7A",
              opacity: o * 0.75,
            }}
          />
        );
      })}
    </>
  );
};

const SwapBloom: React.FC<{ a: Pt; b: Pt; p: number; frame: number }> = ({ a, b, p, frame }) => {
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const grow = interpolate(p, [0, 0.7], [0, 1], { extrapolateRight: "clamp" });
  const pulse = 0.75 + Math.sin(frame / 6) * 0.25;
  const dx = b.x - a.x;
  const len = Math.abs(dx) * grow;
  const fade = interpolate(p, [0, 0.15, 0.8, 1], [0, 1, 0.8, 0]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: Math.min(a.x, b.x),
          top: a.y - 3,
          width: len,
          height: 6,
          borderRadius: 3,
          background: "linear-gradient(90deg, rgba(167,139,250,0.85), rgba(122,184,255,0.35))",
          boxShadow: `0 0 ${18 * pulse}px rgba(167,139,250,0.55)`,
          opacity: fade,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: mid.x - 110 * grow,
          top: mid.y - 110 * grow,
          width: 220 * grow,
          height: 220 * grow,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.28), rgba(167,139,250,0) 70%)",
          opacity: fade,
        }}
      />
    </>
  );
};

const LockSheen: React.FC<{ at: Pt; p: number; delay: number }> = ({ at, p, delay }) => {
  const t = Math.max(0, Math.min(1, (p - delay) / 0.5));
  const r = interpolate(t, [0, 1], [40, 150]);
  const o = interpolate(t, [0, 0.2, 1], [0, 0.9, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: at.x - r,
        top: at.y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        border: "4px solid rgba(76,192,160,0.8)",
        opacity: o,
      }}
    />
  );
};