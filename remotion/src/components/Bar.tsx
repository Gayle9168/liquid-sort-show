import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../lib/theme";

export type BarState = "idle" | "active" | "locked";

export const Bar: React.FC<{
  value: number;
  maxValue: number;
  slotX: number;      // target slot x (center)
  targetY: number;    // baseline y (top of bar area when resting)
  liftY: number;      // additional lift (0 rest, negative = up)
  width: number;
  state: BarState;
  index: number;      // for stagger + float phase
  appearAt: number;   // frame when it enters
  label?: string;
}> = ({ value, maxValue, slotX, targetY, liftY, width, state, index, appearAt, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - appearAt,
    fps,
    config: { damping: 14, stiffness: 140 },
  });
  const scale = interpolate(enter, [0, 1], [0.4, 1]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  // constant subtle float so nothing looks frozen
  const float = Math.sin((frame + index * 7) / 22) * 2;

  const height = (value / maxValue) * 700; // px
  const colors =
    state === "active" ? theme.bar.active :
    state === "locked" ? theme.bar.locked :
    theme.bar.idle;

  const shadow =
    state === "active"
      ? "0 20px 40px rgba(255,126,179,0.35), 0 6px 14px rgba(255,126,179,0.25)"
      : state === "locked"
      ? "0 18px 36px rgba(88,199,163,0.32), 0 4px 12px rgba(88,199,163,0.22)"
      : "0 18px 36px rgba(167,139,250,0.28), 0 4px 12px rgba(122,184,255,0.22)";

  return (
    <div
      style={{
        position: "absolute",
        left: slotX - width / 2,
        top: targetY - height + liftY + float,
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: "50% 100%",
        opacity,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 26,
          background: `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
          boxShadow: `${shadow}, inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -6px 12px rgba(0,0,0,0.06)`,
          overflow: "hidden",
        }}
      >
        {/* specular sheen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0) 55%)",
          }}
        />
        {/* value label */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 44,
            color: "rgba(255,255,255,0.98)",
            textShadow: "0 2px 6px rgba(30,35,64,0.25)",
            letterSpacing: -1,
          }}
        >
          {label ?? value}
        </div>
      </div>
    </div>
  );
};