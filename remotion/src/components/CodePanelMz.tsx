import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GlassPanel } from "./GlassPanel";
import { theme } from "../lib/theme";
import { MzStep } from "../lib/move-zeroes";

const LINES = [
  "let write = 0;",
  "for (let read = 0; read < nums.length; read++) {",
  "  if (nums[read] === 0) continue;",
  "  [nums[write], nums[read]] = [nums[read], nums[write]];",
  "  write++;",
  "}",
  "return nums;",
];

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ width: 12, height: 12, borderRadius: 6, background: color, opacity: 0.85 }} />
);

export const CodePanelMz: React.FC<{
  step: MzStep;
  progress: number;
  x: number;
  y: number;
  width: number;
  height: number;
}> = ({ step, progress, x, y, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineHeight = 40;
  const codeTop = 82;
  const paddingLeft = 40;

  const highlightW = interpolate(
    spring({
      frame: Math.round(progress * 20),
      fps,
      config: { damping: 18, stiffness: 200 },
      durationInFrames: 20,
    }),
    [0, 1],
    [width * 0.32, width - paddingLeft * 2],
  );

  const chipEnter = spring({ frame: frame - 36, fps, config: { damping: 20, stiffness: 200 } });

  return (
    <div style={{ position: "absolute", left: x, top: y, width, height }}>
      <GlassPanel style={{ width, height }} radius={40}>
        <div style={{ position: "absolute", top: 24, left: paddingLeft, display: "flex", gap: 10, alignItems: "center" }}>
          <Dot color="#FF8C69" />
          <Dot color="#A78BFA" />
          <Dot color="#4CC0A0" />
          <div
            style={{
              marginLeft: 14,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 20,
              color: theme.inkSoft,
              fontWeight: 500,
            }}
          >
            move_zeroes.js
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: paddingLeft - 10,
            top: codeTop + step.codeLine * lineHeight - 6,
            width: highlightW,
            height: 40,
            borderRadius: 14,
            background:
              "linear-gradient(90deg, rgba(122,184,255,0.45), rgba(167,139,250,0.28), rgba(167,139,250,0))",
            boxShadow: "0 6px 18px rgba(122,150,245,0.20)",
          }}
        />

        {LINES.map((l, i) => {
          const on = i === step.codeLine;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: paddingLeft,
                top: codeTop + i * lineHeight,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 23,
                lineHeight: "28px",
                fontWeight: on ? 700 : 500,
                color: on ? theme.ink : "rgba(74,82,122,0.72)",
                whiteSpace: "pre",
              }}
            >
              {l}
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            left: paddingLeft,
            bottom: 26,
            display: "flex",
            gap: 14,
            opacity: chipEnter,
            transform: `translateY(${(1 - chipEnter) * 10}px)`,
          }}
        >
          <Chip k="read" v={step.read < 0 ? "–" : String(step.read)} tint="#6AA9F5" />
          <Chip k="write" v={String(step.write)} tint="#A78BFA" />
          <Chip k="nums[read]" v={step.read < 0 || step.read >= step.arr.length ? "–" : String(step.prev[step.read])} tint="#FF8C69" />
          <Chip k="swaps" v={String(step.write)} tint="#4CC0A0" />
        </div>
      </GlassPanel>
    </div>
  );
};

const Chip: React.FC<{ k: string; v: string; tint: string }> = ({ k, v, tint }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 18px",
      borderRadius: 16,
      background: "rgba(255,255,255,0.75)",
      boxShadow: `inset 0 0 0 1.5px ${tint}55, 0 8px 18px ${tint}20`,
      fontFamily: "'JetBrains Mono', monospace",
    }}
  >
    <span style={{ fontSize: 19, fontWeight: 600, color: theme.inkSoft }}>{k}</span>
    <span style={{ fontSize: 24, fontWeight: 800, color: theme.ink }}>{v}</span>
  </div>
);