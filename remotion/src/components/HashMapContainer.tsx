import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GlassPanel } from "./GlassPanel";
import { theme } from "../lib/theme";
import { TwoSumStep } from "../lib/two-sum";

export const MAP_SLOTS = 6;
export const MAP_PAD = 34;
export const MAP_HEADER = 74;
export const SLOT_H = 148;
export const SLOT_GAP = 20;
export const MAP_W = 960;
export const MAP_H = MAP_PAD * 2 + MAP_HEADER + SLOT_H * 2 + SLOT_GAP + 52;

const COLS = 3;
export const SLOT_W = (MAP_W - MAP_PAD * 2 - SLOT_GAP * (COLS - 1)) / COLS;

/** slot centre relative to the container's top-left */
export function slotCenter(i: number) {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return {
    x: MAP_PAD + col * (SLOT_W + SLOT_GAP) + SLOT_W / 2,
    y: MAP_PAD + MAP_HEADER + row * (SLOT_H + SLOT_GAP) + SLOT_H / 2,
  };
}

export const HashMapContainer: React.FC<{
  step: TwoSumStep;
  progress: number;
  x: number;
  y: number;
}> = ({ step, progress, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame: frame - 34, fps, config: { damping: 20, stiffness: 150 } });
  const stepSpring = spring({
    frame: Math.round(progress * 20),
    fps,
    config: { damping: 12, stiffness: 210 },
    durationInFrames: 20,
  });

  const scanning = step.kind === "lookup";
  const scanPos = scanning ? progress * (MAP_SLOTS + 1) : -1;
  const miss = scanning && step.hit === null && progress > 0.72;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: MAP_W,
        height: MAP_H,
        transform: `translateY(${(1 - enter) * 28}px)`,
        opacity: enter,
      }}
    >
      <GlassPanel style={{ width: MAP_W, height: MAP_H }} radius={42}>
        {/* header */}
        <div
          style={{
            position: "absolute",
            top: MAP_PAD,
            left: MAP_PAD,
            right: MAP_PAD,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 34,
                fontWeight: 800,
                color: theme.ink,
                letterSpacing: -0.5,
              }}
            >
              HASH MAP
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 22,
                fontWeight: 500,
                color: theme.inkSoft,
              }}
            >
              value → index
            </div>
          </div>
          <SizeBadge size={step.map.length} pulse={step.kind === "store" ? stepSpring : 0} />
        </div>

        {/* slots */}
        {Array.from({ length: MAP_SLOTS }).map((_, s) => {
          const c = slotCenter(s);
          const entry = step.map[s];
          const filled = !!entry;
          const isNew = step.kind === "store" && step.slot === s;
          const isHit =
            (step.kind === "found" || step.kind === "result") && step.hit === s;
          const scanHere = scanning && scanPos >= s && scanPos < s + 1.35;

          const fillSpring = isNew ? stepSpring : filled ? 1 : 0;
          const scaleIn = isNew ? interpolate(stepSpring, [0, 1], [0.6, 1]) : 1;
          const hitPop = isHit ? interpolate(stepSpring, [0, 1], [1, 1.07]) : 1;

          let bg = "rgba(255,255,255,0.30)";
          let border = "2px dashed rgba(120,130,180,0.30)";
          let shadow = "none";
          if (filled) {
            bg = "rgba(167,139,250,0.14)";
            border = "2px solid rgba(167,139,250,0.55)";
            shadow = "0 10px 24px rgba(167,139,250,0.18)";
          }
          if (scanHere) {
            bg = "rgba(255,177,153,0.26)";
            border = "2px solid rgba(255,140,105,0.75)";
            shadow = "0 12px 30px rgba(255,140,105,0.30)";
          }
          if (isHit) {
            bg = "linear-gradient(180deg, rgba(126,231,199,0.55), rgba(76,192,160,0.42))";
            border = "2.5px solid rgba(64,180,148,0.95)";
            shadow = "0 18px 40px rgba(76,192,160,0.40)";
          }

          const dim = miss && filled ? 0.55 : 1;

          return (
            <div
              key={s}
              style={{
                position: "absolute",
                left: c.x - SLOT_W / 2,
                top: c.y - SLOT_H / 2,
                width: SLOT_W,
                height: SLOT_H,
                borderRadius: 26,
                background: bg,
                border,
                boxShadow: shadow,
                opacity: (filled ? 0.35 + 0.65 * fillSpring : 0.85) * dim,
                transform: `scale(${scaleIn * hitPop})`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 16,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 17,
                  fontWeight: 600,
                  color: theme.inkSoft,
                  opacity: 0.55,
                }}
              >
                #{s}
              </div>
              {filled ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <Row label="key" value={entry.value} big />
                  <div
                    style={{
                      width: SLOT_W - 60,
                      height: 1.5,
                      background: "rgba(120,130,180,0.25)",
                      margin: "4px 0",
                    }}
                  />
                  <Row label="val" value={entry.index} />
                </div>
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 26,
                    fontWeight: 500,
                    color: theme.inkSoft,
                    opacity: 0.35,
                  }}
                >
                  empty
                </div>
              )}
            </div>
          );
        })}

        {/* caption */}
        <div
          style={{
            position: "absolute",
            left: MAP_PAD,
            right: MAP_PAD,
            bottom: 18,
            textAlign: "center",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 24,
            fontWeight: 600,
            color: theme.ink,
            opacity: interpolate(progress, [0, 0.1], [0.45, 0.95], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          {step.caption}
        </div>
      </GlassPanel>
    </div>
  );
};

const Row: React.FC<{ label: string; value: number; big?: boolean }> = ({
  label,
  value,
  big,
}) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 19,
        fontWeight: 600,
        color: theme.inkSoft,
        letterSpacing: 1,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: big ? 46 : 34,
        fontWeight: 800,
        color: theme.ink,
        letterSpacing: -1,
      }}
    >
      {value}
    </span>
  </div>
);

const SizeBadge: React.FC<{ size: number; pulse: number }> = ({ size, pulse }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 20px",
      borderRadius: 999,
      background: "rgba(167,139,250,0.16)",
      boxShadow: `inset 0 0 0 1.5px rgba(167,139,250,0.45), 0 0 ${16 * pulse}px rgba(167,139,250,${0.6 * pulse})`,
      transform: `scale(${1 + pulse * 0.08})`,
    }}
  >
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 19,
        fontWeight: 600,
        color: theme.inkSoft,
      }}
    >
      size
    </span>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: 30,
        fontWeight: 800,
        color: theme.ink,
      }}
    >
      {size}
    </span>
  </div>
);
