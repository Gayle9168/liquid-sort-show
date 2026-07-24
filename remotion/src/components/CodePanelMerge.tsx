import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GlassPanel } from "./GlassPanel";
import { theme } from "../lib/theme";
import { SortStep } from "../lib/sort-merge";

const LINES = [
  "function mergeSort(a, lo, hi) {",
  "  if (lo >= hi) return;",
  "  const mid = (lo + hi) >> 1;",
  "  mergeSort(a, lo, mid);",
  "  mergeSort(a, mid + 1, hi);",
  "  merge(a, lo, mid, hi);",
  "}",
  "",
  "function merge(a, lo, mid, hi) {",
  "  const t = []; let i=lo, j=mid+1;",
  "  while (i<=mid && j<=hi) {",
  "    if (a[i] <= a[j]) t.push(a[i++]);",
  "    else               t.push(a[j++]);",
  "  }",
  "",
  "  while (i<=mid) t.push(a[i++]);",
  "  while (j<=hi)  t.push(a[j++]);",
  "  for (const [k,v] of t.entries()) a[lo+k]=v;",
  "}",
];

export const CodePanelMerge: React.FC<{
  step: SortStep;
  progress: number;
  x: number;
  y: number;
  width: number;
  height: number;
}> = ({ step, progress, x, y, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineHeight = 21;
  const paddingTop = 24;
  const paddingLeft = 40;

  const highlightY = paddingTop + step.codeLine * lineHeight - 4;
  const highlightW = interpolate(
    spring({
      frame: Math.round(progress * 20),
      fps,
      config: { damping: 18, stiffness: 200 },
      durationInFrames: 20,
    }),
    [0, 1],
    [width * 0.35, width - paddingLeft * 2],
  );

  const chipEnter = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

  return (
    <div style={{ position: "absolute", left: x, top: y, width, height }}>
      <GlassPanel style={{ width, height }} radius={40}>
        <div style={{ position: "relative", width, height, padding: 0 }}>
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
            <div
              style={{
                marginLeft: 14,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 20,
                color: theme.inkSoft,
                fontWeight: 500,
              }}
            >
              merge_sort.js
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: paddingLeft - 8,
              top: highlightY + 44,
              width: highlightW,
              height: 34,
              borderRadius: 12,
              background:
                "linear-gradient(90deg, rgba(122,184,255,0.55), rgba(167,139,250,0.4), rgba(255,177,153,0.28))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: paddingTop + 40,
              left: paddingLeft,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 17,
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
                    opacity: active ? 1 : 0.65,
                  }}
                >
                  {ln || " "}
                </div>
              );
            })}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: paddingLeft,
              right: paddingLeft,
              display: "flex",
              gap: 10,
              transform: `translateY(${(1 - chipEnter) * 20}px)`,
              opacity: chipEnter,
            }}
          >
            <VarChip label="lo" value={step.lo} tint="#7AB8FF" />
            <VarChip label="mid" value={step.mid} tint="#A78BFA" />
            <VarChip label="hi" value={step.hi} tint="#FFB199" />
            <VarChip label="i" value={step.i} tint="#FF7EB3" />
            <VarChip label="j" value={step.j} tint="#58C7A3" />
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <div
    style={{
      width: 16,
      height: 16,
      borderRadius: 8,
      background: color,
      boxShadow: `0 2px 6px ${color}66`,
    }}
  />
);

const VarChip: React.FC<{ label: string; value: number; tint: string }> = ({
  label,
  value,
  tint,
}) => (
  <div
    style={{
      flex: 1,
      borderRadius: 18,
      padding: "10px 14px",
      background: "rgba(255,255,255,0.7)",
      boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.9), 0 6px 16px ${tint}33`,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 2,
    }}
  >
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 14,
        color: theme.inkSoft,
        fontWeight: 500,
        letterSpacing: 1,
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: 26,
        color: theme.ink,
        fontWeight: 800,
        letterSpacing: -0.5,
      }}
    >
      {value}
    </div>
  </div>
);