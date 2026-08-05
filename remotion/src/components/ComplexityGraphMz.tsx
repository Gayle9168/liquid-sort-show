import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GlassPanel } from "./GlassPanel";
import { theme } from "../lib/theme";

const W = 960;
const H = 820;
const PAD_L = 96;
const PAD_B = 190;
const PAD_T = 220;
const PAD_R = 60;

/** Animated O(n) vs O(n^2) graph + metric cards. Takes the stage in the last 5s. */
export const ComplexityGraphMz: React.FC<{
  x: number;
  y: number;
  appearFrame: number;
}> = ({ x, y, appearFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - appearFrame;

  const enter = spring({ frame: local, fps, config: { damping: 20, stiffness: 140 } });
  const draw = interpolate(local, [16, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const px = (t: number) => PAD_L + t * plotW;
  const py = (v: number) => PAD_T + plotH - v * plotH;

  const linear = (t: number) => t * 0.42;
  const quad = (t: number) => t * t;

  const path = (f: (t: number) => number) => {
    const pts: string[] = [];
    for (let k = 0; k <= 60; k++) {
      const t = k / 60;
      pts.push(`${k === 0 ? "M" : "L"}${px(t).toFixed(1)},${py(f(t)).toFixed(1)}`);
    }
    return pts.join(" ");
  };

  const LEN = 2600;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: W,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 40}px) scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
      }}
    >
      <GlassPanel style={{ width: W, height: H }} radius={44}>
        <div style={{ position: "absolute", top: 40, left: 48, right: 48 }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 22,
              letterSpacing: 2,
              fontWeight: 600,
              color: theme.inkSoft,
            }}
          >
            COMPLEXITY
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, color: theme.ink, letterSpacing: -1.4, marginTop: 2 }}>
            One pass beats shifting
          </div>
        </div>

        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
            <line
              key={g}
              x1={PAD_L}
              x2={W - PAD_R}
              y1={py(g)}
              y2={py(g)}
              stroke="rgba(120,130,180,0.16)"
              strokeWidth={2}
            />
          ))}
          <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={py(0)} stroke="rgba(120,130,180,0.35)" strokeWidth={3} />
          <line x1={PAD_L} x2={W - PAD_R} y1={py(0)} y2={py(0)} stroke="rgba(120,130,180,0.35)" strokeWidth={3} />

          <path
            d={path(quad)}
            fill="none"
            stroke="#FF8C69"
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={LEN}
            strokeDashoffset={LEN * (1 - draw)}
          />
          <path
            d={path(linear)}
            fill="none"
            stroke="#4CC0A0"
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={LEN}
            strokeDashoffset={LEN * (1 - draw)}
          />

          <circle cx={px(draw)} cy={py(quad(draw))} r={13} fill="#FF8C69" opacity={draw > 0.02 ? 1 : 0} />
          <circle cx={px(draw)} cy={py(linear(draw))} r={13} fill="#4CC0A0" opacity={draw > 0.02 ? 1 : 0} />

          <text x={PAD_L - 34} y={PAD_T - 20} fill={theme.inkSoft} fontSize={22} fontFamily="'JetBrains Mono', monospace">
            work
          </text>
          <text x={W - PAD_R - 100} y={py(0) + 44} fill={theme.inkSoft} fontSize={22} fontFamily="'JetBrains Mono', monospace">
            input n
          </text>
        </svg>

        <div
          style={{
            position: "absolute",
            left: PAD_L + 20,
            top: PAD_T + 14,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            opacity: interpolate(local, [50, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <Legend color="#FF8C69" text="shift-on-every-zero  ·  O(n²)" />
          <Legend color="#4CC0A0" text="two pointers  ·  O(n)" />
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 44,
            left: 48,
            right: 48,
            display: "flex",
            gap: 18,
            justifyContent: "center",
            opacity: interpolate(local, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <Metric label="TIME" value="O(n)" tint="#4CC0A0" />
          <Metric label="SPACE" value="O(1)" tint="#A78BFA" />
          <Metric label="PASSES" value="1" tint="#6AA9F5" />
        </div>
      </GlassPanel>
    </div>
  );
};

const Legend: React.FC<{ color: string; text: string }> = ({ color, text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ width: 34, height: 8, borderRadius: 4, background: color }} />
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 24,
        fontWeight: 600,
        color: theme.ink,
      }}
    >
      {text}
    </div>
  </div>
);

const Metric: React.FC<{ label: string; value: string; tint: string }> = ({ label, value, tint }) => (
  <div
    style={{
      padding: "14px 30px",
      borderRadius: 22,
      background: "rgba(255,255,255,0.78)",
      boxShadow: `inset 0 0 0 1.5px ${tint}55, 0 10px 22px ${tint}22`,
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 16,
        letterSpacing: 1.8,
        color: theme.inkSoft,
        fontWeight: 600,
      }}
    >
      {label}
    </div>
    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 40, fontWeight: 800, color: theme.ink, letterSpacing: -1 }}>
      {value}
    </div>
  </div>
);