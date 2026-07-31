import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GlassPanel } from "./GlassPanel";
import { theme } from "../lib/theme";
import { TwoSumStep } from "../lib/two-sum";

const LINES = [
  "const map = new Map();",
  "for (let i = 0; i < nums.length; i++) {",
  "  const need = target - nums[i];",
  "  if (map.has(need)) {",
  "    return [map.get(need), i];",
  "  }",
  "  map.set(nums[i], i);",
  "}",
];

export const CodePanelTwoSum: React.FC<{
  step: TwoSumStep;
  progress: number;
  x: number;
  y: number;
  width: number;
  height: number;
}> = ({ step, progress, x, y, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineHeight = 39;
  const codeTop = 78;
  const paddingLeft = 40;

  const highlightW = interpolate(
    spring({
      frame: Math.round(progress * 20),
      fps,
      config: { damping: 18, stiffness: 200 },
      durationInFrames: 20,
    }),
    [0, 1],
    [width * 0.3, width - paddingLeft * 2],
  );

  const chipEnter = spring({ frame: frame - 40, fps, config: { damping: 20, stiffness: 200 } });

  return (
    <div style={{ position: "absolute", left: x, top: y, width, height }}>
      <GlassPanel style={{ width, height }} radius={40}>
        <div style={{ position: "absolute", top: 22, left: paddingLeft, display: "flex", gap: 10, alignItems: "center" }}>
          <Dot color="#FF8C69" />
          <Dot color="#A78BFA" />
          <Dot color="#4CC0A0" />
          <div style={{ marginLeft: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 20, color: theme.inkSoft, fontWeight: 500 }}>
            two_sum.js
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: paddingLeft - 10,
            top: codeTop + step.codeLine * lineHeight - 5,
            width: highlightW,
            height: 40,
            borderRadius: 14,
            background:
              "linear-gradient(90deg, rgba(122,184,255,0.45), rgba(167,139,250,0.30), rgba(167,139,250,0))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: codeTop,
            left: paddingLeft,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 25,
            lineHeight: `${lineHeight}px`,
            whiteSpace: "pre",
            letterSpacing: -0.2,
          }}
        >
          {LINES.map((ln, i) => {
            const active = i === step.codeLine;
            return (
              <div
                key={i}
                style={{
                  fontWeight: active ? 700 : 500,
                  color: active ? theme.ink : theme.inkSoft,
                  opacity: active ? 1 : 0.7,
                }}
              >
                {ln}
              </div>
            );
          })}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 22,
            left: paddingLeft,
            right: paddingLeft,
            display: "flex",
            gap: 14,
            transform: `translateY(${(1 - chipEnter) * 18}px)`,
            opacity: chipEnter,
          }}
        >
          <VarChip label="i" value={step.i < 0 ? "–" : step.i} tint="#6AA9F5" />
          <VarChip label="nums[i]" value={step.i < 0 ? "–" : step.value} tint="#A78BFA" />
          <VarChip label="need" value={step.i < 0 ? "–" : step.need} tint="#FF8C69" />
          <VarChip label="map.size" value={step.map.length} tint="#4CC0A0" />
        </div>
      </GlassPanel>
    </div>
  );
};

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ width: 15, height: 15, borderRadius: 8, background: color, boxShadow: `0 2px 6px ${color}66` }} />
);

const VarChip: React.FC<{ label: string; value: number | string; tint: string }> = ({ label, value, tint }) => (
  <div
    style={{
      flex: 1,
      borderRadius: 18,
      padding: "10px 16px",
      background: "rgba(255,255,255,0.75)",
      boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.9), 0 6px 16px ${tint}33`,
    }}
  >
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: theme.inkSoft, fontWeight: 600, letterSpacing: 0.8 }}>
      {label}
    </div>
    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 28, color: theme.ink, fontWeight: 800, letterSpacing: -0.5 }}>
      {value}
    </div>
  </div>
);
