import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { theme } from "../lib/theme";
import { TwoSumStep } from "../lib/two-sum";

export const ComplementChip: React.FC<{
  step: TwoSumStep;
  progress: number;
  target: number;
  x: number;
  y: number;
  width: number;
}> = ({ step, progress, target, x, y, width }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const show = step.i >= 0;
  const pop = spring({
    frame: Math.round(progress * 18),
    fps,
    config: { damping: 12, stiffness: 220 },
    durationInFrames: 18,
  });
  const emphasise = step.kind === "complement" || step.kind === "lookup";
  const scale = emphasise ? interpolate(pop, [0, 1], [0.92, 1]) : 1;
  const float = Math.sin(frame / 26) * 2;
  const accent = step.kind === "found" || step.kind === "result" ? "#4CC0A0" : "#FF8C69";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + float,
        width,
        display: "flex",
        justifyContent: "center",
        opacity: show ? 1 : 0.35,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          display: "inline-flex",
          alignItems: "center",
          gap: 18,
          padding: "18px 34px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.82)",
          boxShadow: `0 18px 36px rgba(120,130,180,0.18), inset 0 0 0 1.5px rgba(255,255,255,0.9), 0 0 ${emphasise ? 26 : 0}px ${accent}55`,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 38,
          fontWeight: 700,
          color: theme.inkSoft,
        }}
      >
        <span>need</span>
        <span style={{ opacity: 0.5 }}>=</span>
        <span style={{ color: theme.ink }}>{target}</span>
        <span style={{ opacity: 0.5 }}>−</span>
        <span style={{ color: theme.ink }}>{show ? step.value : "?"}</span>
        <span style={{ opacity: 0.5 }}>=</span>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 46,
            color: accent,
            letterSpacing: -1,
          }}
        >
          {show ? step.need : "?"}
        </span>
      </div>
    </div>
  );
};
