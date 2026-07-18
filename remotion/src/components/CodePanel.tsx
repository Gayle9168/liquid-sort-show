import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GlassPanel } from "./GlassPanel";
import { theme } from "../lib/theme";
import { SortStep } from "../lib/sort";

const LINES = [
  "for (let i = 1; i < a.length; i++) {",
  "  let key = a[i], j = i - 1;",
  "  while (j >= 0 && a[j] > key) {",
  "    a[j + 1] = a[j];",
  "    j--;",
  "  }",
  "  a[j + 1] = key;",
  "}",
];

export const CodePanel: React.FC<{
  step: SortStep;
  progress: number;
  x: number;
  y: number;
  width: number;
  height: number;
}> = ({ step, progress, x, y, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineHeight = 58;
  const paddingTop = 46;
  const paddingLeft = 40;

  const highlightY = paddingTop + step.codeLine * lineHeight - 6;
  const highlightW = interpolate(
    spring({ frame: Math.round(progress * 20), fps, config: { damping: 18, stiffness: 200 }, durationInFrames: 20 }),
    [0, 1],
    [width * 0.35, width - paddingLeft * 2],
  );

  const chipEnter = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

  return (
    <div style={{ position: "absolute", left: x, top: y, width, height }}>
      <GlassPanel style={{ width, height }} radius={40}>
        <div style={{ position: "relative", width, height, padding: 0 }}>
          {/* header */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: paddingLeft,
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <Dot color="#FF7EB3" />
            <Dot color="#FFB199" />
            <Dot color="#7EE7C7" />
            <div style={{
              marginLeft: 14,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 20,
              color: theme.inkSoft,
              fontWeight: 500,
            }}>
              insertion_sort.js
            </div>
          </div>

          {/* active line highlight */}
          <div
            style={{
              position: "absolute",
              left: paddingLeft - 8,
              top: highlightY + 44,
              width: highlightW,
              height: 52,
              borderRadius: 16,
              background:
                "linear-gradient(90deg, rgba(255,177,153,0.55), rgba(255,126,179,0.35), rgba(167,139,250,0.28))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
            }}
          />

          {/* code lines */}
          <div
            style={{
              position: "absolute",
              top: paddingTop + 44,
              left: paddingLeft,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 30,
              lineHeight: `${lineHeight}px`,
              color: theme.ink,
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
                    opacity: active ? 1 : 0.75,
                  }}
                >
                  {ln}
                </div>
              );
            })}
          </div>

          {/* variable chip */}
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: paddingLeft,
              right: paddingLeft,
              display: "flex",
              gap: 14,
              transform: `translateY(${(1 - chipEnter) * 20}px)`,
              opacity: chipEnter,
            }}
          >
            <VarChip label="i" value={step.i} tint="#7AB8FF" />
            <VarChip label="j" value={step.j} tint="#A78BFA" />
            <VarChip label="key" value={step.key} tint="#FF7EB3" />
            <VarChip label="pass" value={step.pass} tint="#58C7A3" />
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ width: 16, height: 16, borderRadius: 8, background: color, boxShadow: `0 2px 6px ${color}66` }} />
);

const VarChip: React.FC<{ label: string; value: number; tint: string }> = ({ label, value, tint }) => (
  <div
    style={{
      flex: 1,
      borderRadius: 20,
      padding: "12px 18px",
      background: "rgba(255,255,255,0.7)",
      boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.9), 0 6px 16px ${tint}33`,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 2,
    }}
  >
    <div style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 16,
      color: theme.inkSoft,
      fontWeight: 500,
      letterSpacing: 1,
      textTransform: "uppercase",
    }}>
      {label}
    </div>
    <div style={{
      fontFamily: "Inter, sans-serif",
      fontSize: 30,
      color: theme.ink,
      fontWeight: 800,
      letterSpacing: -0.5,
    }}>
      {value}
    </div>
  </div>
);