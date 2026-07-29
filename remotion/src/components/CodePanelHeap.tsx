import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GlassPanel } from "./GlassPanel";
import { theme } from "../lib/theme";
import { SortStep } from "../lib/sort-heap";

const LINES = [
  "function heapify(a, n, i) {",
  "  let largest = i;",
  "  const l = 2*i + 1;",
  "  const r = 2*i + 2;",
  "  if (l < n && a[l] > a[largest]) largest = l;",
  "  if (r < n && a[r] > a[largest]) largest = r;",
  "  if (largest !== i) {",
  "    swap(a, i, largest);",
  "    heapify(a, n, largest);",
  "  }",
  "}",
];

// Map heap steps to line hints for the extract phase too.
const EXTRACT_LINES = [
  "// sort phase",
  "for (let end = n - 1; end > 0; end--) {",
  "  swap(a, 0, end);      // extract max",
  "  heapify(a, end, 0);   // restore heap",
  "}",
];

export const CodePanelHeap: React.FC<{
  step: SortStep;
  progress: number;
  x: number;
  y: number;
  width: number;
  height: number;
}> = ({ step, progress, x, y, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isSort = step.phase === "sort";
  const lines = isSort ? EXTRACT_LINES : LINES;

  // remap step.codeLine to the shorter EXTRACT_LINES list
  let activeLine = step.codeLine;
  if (isSort) {
    // extract=8, lock=9, done=10, heapify calls=0..6
    if (step.kind === "extract") activeLine = 2;
    else if (step.kind === "lock") activeLine = 2;
    else if (step.kind === "done") activeLine = 4;
    else activeLine = 3; // heapify calls during extract
  }

  const lineHeight = 46;
  const paddingTop = 40;
  const paddingLeft = 36;

  const highlightY = paddingTop + activeLine * lineHeight - 4;
  const highlightW = interpolate(
    spring({ frame: Math.round(progress * 20), fps, config: { damping: 18, stiffness: 200 }, durationInFrames: 20 }),
    [0, 1],
    [width * 0.35, width - paddingLeft * 2],
  );

  const chipEnter = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

  return (
    <div style={{ position: "absolute", left: x, top: y, width, height }}>
      <GlassPanel style={{ width, height }} radius={40}>
        <div style={{ position: "relative", width, height }}>
          <div style={{ position: "absolute", top: 18, left: paddingLeft, display: "flex", gap: 10, alignItems: "center" }}>
            <Dot color="#FF7EB3" /><Dot color="#FFB199" /><Dot color="#7EE7C7" />
            <div style={{ marginLeft: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: theme.inkSoft, fontWeight: 500 }}>
              heap_sort.js · {isSort ? "sort phase" : "heapify"}
            </div>
          </div>
          <div style={{
            position: "absolute", left: paddingLeft - 8, top: highlightY + 38, width: highlightW, height: 40, borderRadius: 14,
            background: "linear-gradient(90deg, rgba(255,177,153,0.55), rgba(255,126,179,0.35), rgba(167,139,250,0.28))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
          }} />
          <div style={{
            position: "absolute", top: paddingTop + 38, left: paddingLeft,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 22,
            lineHeight: `${lineHeight}px`, color: theme.ink, whiteSpace: "pre", letterSpacing: -0.2,
          }}>
            {lines.map((ln, i) => {
              const active = i === activeLine;
              return (
                <div key={i} style={{ fontWeight: active ? 700 : 500, color: active ? theme.ink : theme.inkSoft, opacity: active ? 1 : 0.7 }}>
                  {ln}
                </div>
              );
            })}
          </div>
          <div style={{
            position: "absolute", bottom: 22, left: paddingLeft, right: paddingLeft, display: "flex", gap: 10,
            transform: `translateY(${(1 - chipEnter) * 20}px)`, opacity: chipEnter,
          }}>
            <VarChip label="i" value={step.i} tint="#7AB8FF" />
            <VarChip label="L" value={step.left} tint="#A78BFA" />
            <VarChip label="R" value={step.right} tint="#A78BFA" />
            <VarChip label="max" value={step.largest} tint="#FF7EB3" />
            <VarChip label="end" value={step.heapEnd} tint="#58C7A3" />
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ width: 14, height: 14, borderRadius: 7, background: color, boxShadow: `0 2px 6px ${color}66` }} />
);

const VarChip: React.FC<{ label: string; value: number; tint: string }> = ({ label, value, tint }) => (
  <div style={{
    flex: 1, borderRadius: 16, padding: "8px 12px", background: "rgba(255,255,255,0.7)",
    boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.9), 0 4px 12px ${tint}33`,
    display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0,
  }}>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: theme.inkSoft, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 24, color: theme.ink, fontWeight: 800, letterSpacing: -0.5 }}>{value}</div>
  </div>
);