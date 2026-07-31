import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TwoSumStep } from "../lib/two-sum";

type Pt = { x: number; y: number };

export const VfxLayerTwoSum: React.FC<{
  step: TwoSumStep;
  progress: number;
  cellCenter: (i: number) => Pt;
  slotPos: (i: number) => Pt;
}> = ({ step, progress, cellCenter, slotPos }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {step.kind === "store" && step.slot >= 0 && (
        <FlyToken from={cellCenter(step.i)} to={slotPos(step.slot)} p={progress} value={step.value} />
      )}
      {step.kind === "lookup" && (
        <QueryToken
          from={cellCenter(step.i)}
          to={slotPos(step.hit ?? Math.min(5, step.map.length))}
          p={progress}
          need={step.need}
          hit={step.hit !== null}
        />
      )}
      {(step.kind === "found" || step.kind === "result") && step.hit !== null && (
        <MatchBeam
          a={slotPos(step.hit)}
          b={cellCenter(step.i)}
          c={cellCenter(step.matched[0] ?? step.i)}
          p={step.kind === "found" ? progress : 1}
          frame={frame}
        />
      )}
    </AbsoluteFill>
  );
};

function arc(from: Pt, to: Pt, t: number, lift: number): Pt {
  const mx = (from.x + to.x) / 2;
  const my = Math.min(from.y, to.y) - lift;
  const u = 1 - t;
  return {
    x: u * u * from.x + 2 * u * t * mx + t * t * to.x,
    y: u * u * from.y + 2 * u * t * my + t * t * to.y,
  };
}

const FlyToken: React.FC<{ from: Pt; to: Pt; p: number; value: number }> = ({ from, to, p, value }) => {
  const t = interpolate(p, [0.05, 0.75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pos = arc(from, to, t, 60);
  const fade = interpolate(p, [0, 0.08, 0.72, 0.82], [0, 1, 1, 0]);
  const impact = interpolate(p, [0.72, 0.95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <>
      {[0, 1, 2, 3].map((k) => {
        const tt = Math.max(0, t - k * 0.05);
        const q = arc(from, to, tt, 60);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: q.x - 12,
              top: q.y - 12,
              width: 24,
              height: 24,
              borderRadius: 12,
              background: "rgba(167,139,250,0.5)",
              opacity: fade * (1 - k * 0.24),
              filter: "blur(4px)",
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: pos.x - 42,
          top: pos.y - 34,
          width: 84,
          height: 68,
          borderRadius: 20,
          background: "linear-gradient(180deg,#B79BFF,#8B6BF0)",
          boxShadow: "0 14px 30px rgba(139,107,240,0.45), inset 0 1px 0 rgba(255,255,255,0.6)",
          opacity: fade,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 38,
          color: "white",
        }}
      >
        {value}
      </div>
      <div
        style={{
          position: "absolute",
          left: to.x - 150 * impact,
          top: to.y - 150 * impact,
          width: 300 * impact,
          height: 300 * impact,
          borderRadius: "50%",
          border: `${3 * (1 - impact)}px solid rgba(167,139,250,${0.6 * (1 - impact)})`,
          opacity: impact > 0 ? 1 : 0,
        }}
      />
    </>
  );
};

const QueryToken: React.FC<{ from: Pt; to: Pt; p: number; need: number; hit: boolean }> = ({
  from,
  to,
  p,
  need,
  hit,
}) => {
  const t = interpolate(p, [0.05, 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pos = arc(from, to, t, 50);
  const fade = interpolate(p, [0, 0.08, 0.7, 0.9], [0, 1, 1, 0]);
  const color = hit ? "#4CC0A0" : "#FF8C69";
  return (
    <div
      style={{
        position: "absolute",
        left: pos.x - 60,
        top: pos.y - 30,
        width: 120,
        height: 60,
        borderRadius: 999,
        background: "rgba(255,255,255,0.92)",
        boxShadow: `0 12px 26px rgba(120,130,180,0.25), inset 0 0 0 2px ${color}`,
        opacity: fade,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        fontSize: 30,
        color,
      }}
    >
      {need}?
    </div>
  );
};

const MatchBeam: React.FC<{ a: Pt; b: Pt; c: Pt; p: number; frame: number }> = ({ a, b, c, p, frame }) => {
  const grow = interpolate(p, [0, 0.6], [0, 1], { extrapolateRight: "clamp" });
  const bloom = interpolate(p, [0.15, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 0.75 + Math.sin(frame / 6) * 0.25;

  const line = (from: Pt, to: Pt, key: string) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) * grow;
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    return (
      <div
        key={key}
        style={{
          position: "absolute",
          left: from.x,
          top: from.y - 3,
          width: len,
          height: 6,
          borderRadius: 3,
          transformOrigin: "0 50%",
          transform: `rotate(${ang}deg)`,
          background: "linear-gradient(90deg, rgba(76,192,160,0.9), rgba(126,231,199,0.35))",
          boxShadow: `0 0 ${18 * pulse}px rgba(76,192,160,0.6)`,
        }}
      />
    );
  };

  return (
    <>
      {line(a, b, "ab")}
      {line(a, c, "ac")}
      {[a, b, c].map((pt, k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: pt.x - 90 * bloom,
            top: pt.y - 90 * bloom,
            width: 180 * bloom,
            height: 180 * bloom,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(126,231,199,${0.35 * (1 - bloom * 0.6)}), rgba(126,231,199,0) 70%)`,
          }}
        />
      ))}
      {Array.from({ length: 10 }).map((_, k) => {
        const ang = (k / 10) * Math.PI * 2;
        const r = bloom * 130;
        return (
          <div
            key={`p${k}`}
            style={{
              position: "absolute",
              left: b.x + Math.cos(ang) * r - 5,
              top: b.y + Math.sin(ang) * r - 5,
              width: 10,
              height: 10,
              borderRadius: 5,
              background: "#4CC0A0",
              opacity: (1 - bloom) * 0.9,
            }}
          />
        );
      })}
    </>
  );
};
