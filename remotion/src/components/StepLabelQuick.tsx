import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { theme } from "../lib/theme";
import { SortStep, StepKind } from "../lib/sort-quick";

const LABELS: Record<StepKind, string> = {
  pickPivot: "Pick pivot",
  setBounds: "New sub-array",
  scanStart: "Start scan",
  compare: "Compare",
  swap: "Swap",
  pivotSwap: "Place pivot",
  recurseLeft: "Recurse left",
  recurseRight: "Recurse right",
  done: "Locked in",
};

const ACCENT: Record<StepKind, string> = {
  pickPivot: "#FFB199",
  setBounds: "#7AB8FF",
  scanStart: "#A78BFA",
  compare: "#FFB199",
  swap: "#FF7EB3",
  pivotSwap: "#58C7A3",
  recurseLeft: "#7AB8FF",
  recurseRight: "#A78BFA",
  done: "#7EE7C7",
};

export const StepLabelQuick: React.FC<{
  step: SortStep;
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
    config: { damping: 18, stiffness: 220 },
    durationInFrames: 16,
  });
  const scale = interpolate(enter, [0, 1], [0.85, 1]);
  const opacity = interpolate(progress, [0, 0.12, 0.9, 1], [0, 1, 1, 0.85]);
  const float = Math.sin((frame + stepIndex * 9) / 18) * 2;

  const label = LABELS[step.kind];
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
          gap: 16,
          padding: "18px 30px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.72)",
          boxShadow: `0 20px 40px rgba(120,130,180,0.22), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(255,255,255,0.5), 0 0 24px ${accent}44`,
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
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 38,
            fontWeight: 800,
            color: theme.ink,
            letterSpacing: -0.5,
          }}
        >
          {label}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginLeft: 6,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: 20,
            color: theme.inkSoft,
          }}
        >
          <Chip k="lo" v={step.lo} />
          <Chip k="hi" v={step.hi} />
          <Chip k="pv" v={step.pivotValue} />
          <Chip k="i" v={step.i} />
          <Chip k="j" v={step.j} />
        </div>
      </div>
    </div>
  );
};

const Chip: React.FC<{ k: string; v: number }> = ({ k, v }) => (
  <div
    style={{
      padding: "6px 10px",
      borderRadius: 10,
      background: "rgba(255,255,255,0.8)",
      boxShadow: "inset 0 0 0 1px rgba(120,130,180,0.15)",
    }}
  >
    <span style={{ opacity: 0.6 }}>{k}=</span>
    <span style={{ color: "#1E2340" }}>{v}</span>
  </div>
);