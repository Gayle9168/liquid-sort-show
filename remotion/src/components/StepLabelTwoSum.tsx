import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { theme } from "../lib/theme";
import { TwoSumStep, StepKind } from "../lib/two-sum";

const LABELS: Record<StepKind, string> = {
  intro: "Setup",
  visit: "Visit element",
  complement: "Find complement",
  lookup: "Check the map",
  store: "Store in map",
  found: "Match found!",
  result: "Answer",
};

const ACCENT: Record<StepKind, string> = {
  intro: "#6AA9F5",
  visit: "#6AA9F5",
  complement: "#FF8C69",
  lookup: "#FF8C69",
  store: "#A78BFA",
  found: "#4CC0A0",
  result: "#4CC0A0",
};

export const StepLabelTwoSum: React.FC<{
  step: TwoSumStep;
  stepIndex: number;
  progress: number;
  x: number;
  y: number;
  width: number;
}> = ({ step, stepIndex, progress, x, y, width }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: Math.round(progress * 16),
    fps,
    config: { damping: 16, stiffness: 230 },
    durationInFrames: 16,
  });
  const scale = interpolate(enter, [0, 1], [0.86, 1]);
  const opacity = interpolate(progress, [0, 0.1, 0.92, 1], [0, 1, 1, 0.9]);
  const float = Math.sin((frame + stepIndex * 9) / 20) * 2;

  const accent = ACCENT[step.kind];

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + float,
        width,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          display: "inline-flex",
          alignItems: "center",
          gap: 20,
          padding: "18px 36px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.85)",
          boxShadow: `0 20px 40px rgba(120,130,180,0.20), inset 0 0 0 1.5px rgba(255,255,255,0.95), 0 0 26px ${accent}44`,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            background: accent,
            boxShadow: `0 0 12px ${accent}, 0 0 0 3px ${accent}33`,
          }}
        />
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 42, fontWeight: 800, color: theme.ink, letterSpacing: -0.8 }}>
          {LABELS[step.kind]}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: 24,
            color: theme.inkSoft,
            padding: "6px 14px",
            borderRadius: 12,
            background: "rgba(120,130,180,0.10)",
          }}
        >
          step {stepIndex + 1}
        </div>
      </div>
    </div>
  );
};
