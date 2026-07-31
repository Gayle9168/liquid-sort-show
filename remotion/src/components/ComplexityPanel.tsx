import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GlassPanel } from "./GlassPanel";
import { theme } from "../lib/theme";

export const ComplexityPanel: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  appearFrame: number;
}> = ({ x, y, width, height, appearFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - appearFrame, fps, config: { damping: 20, stiffness: 150 } });
  const barGrow = spring({ frame: frame - appearFrame - 10, fps, config: { damping: 22, stiffness: 120 } });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        transform: `translateY(${(1 - enter) * 24}px)`,
        opacity: enter,
      }}
    >
      <GlassPanel style={{ width, height }} radius={36}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "22px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 30,
          }}
        >
          <div style={{ display: "flex", gap: 16 }}>
            <Metric label="TIME" value="O(n)" tint="#4CC0A0" />
            <Metric label="SPACE" value="O(n)" tint="#A78BFA" />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <CompareBar
              label="hash map"
              width={interpolate(barGrow, [0, 1], [0, 0.22])}
              color="linear-gradient(90deg,#7EE7C7,#4CC0A0)"
              text="n"
            />
            <CompareBar
              label="brute force"
              width={interpolate(barGrow, [0, 1], [0, 1])}
              color="linear-gradient(90deg,#FFC2AB,#FF8C69)"
              text="n²"
            />
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; tint: string }> = ({ label, value, tint }) => (
  <div
    style={{
      padding: "12px 22px",
      borderRadius: 20,
      background: "rgba(255,255,255,0.75)",
      boxShadow: `inset 0 0 0 1.5px ${tint}55, 0 8px 20px ${tint}22`,
    }}
  >
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, letterSpacing: 1.6, color: theme.inkSoft, fontWeight: 600 }}>
      {label}
    </div>
    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 36, fontWeight: 800, color: theme.ink, letterSpacing: -1 }}>
      {value}
    </div>
  </div>
);

const CompareBar: React.FC<{ label: string; width: number; color: string; text: string }> = ({
  label,
  width,
  color,
  text,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <div
      style={{
        width: 170,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 18,
        fontWeight: 600,
        color: theme.inkSoft,
        textAlign: "right",
      }}
    >
      {label}
    </div>
    <div style={{ flex: 1, height: 26, borderRadius: 999, background: "rgba(120,130,180,0.12)", overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.max(0, Math.min(1, width)) * 100}%`,
          height: "100%",
          borderRadius: 999,
          background: color,
        }}
      />
    </div>
    <div style={{ width: 44, fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 22, color: theme.ink }}>{text}</div>
  </div>
);
