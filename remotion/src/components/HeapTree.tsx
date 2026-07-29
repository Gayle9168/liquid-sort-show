import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../lib/theme";
import { SortStep } from "../lib/sort-heap";

// Node positions for up to 15 nodes (4 levels). Values in [x, y] within a
// bounding box we scale later.
function nodePosition(idx: number, centerX: number, topY: number, levelH: number, spanX: number) {
  const level = Math.floor(Math.log2(idx + 1));
  const posInLevel = idx - (Math.pow(2, level) - 1);
  const nodesInLevel = Math.pow(2, level);
  const step = spanX / Math.max(1, nodesInLevel);
  const x = centerX - spanX / 2 + step * (posInLevel + 0.5);
  const y = topY + level * levelH;
  return { x, y, level };
}

export const HeapTree: React.FC<{
  step: SortStep;
  progress: number;
  n: number;
  centerX: number;
  topY: number;
  levelH: number;
  spanX: number;
  radius: number;
}> = ({ step, progress, n, centerX, topY, levelH, spanX, radius }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = 1 + Math.sin(frame / 6) * 0.04;

  const positions = React.useMemo(() => {
    const arr: { x: number; y: number; level: number }[] = [];
    for (let i = 0; i < n; i++) arr.push(nodePosition(i, centerX, topY, levelH, spanX));
    return arr;
  }, [n, centerX, topY, levelH, spanX]);

  const isInHeap = (i: number) => i < step.heapEnd;
  const isLocked = (i: number) => step.locked.includes(i);
  const isActive = (i: number) => step.active.includes(i);

  const edgeKey = step.edgeActive ? `${step.edgeActive[0]}-${step.edgeActive[1]}` : "";

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <defs>
        <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#7AB8FF" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="edgeActive" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFB199" />
          <stop offset="100%" stopColor="#FF7EB3" />
        </linearGradient>
        <linearGradient id="nodeIdle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7AB8FF" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="nodeActive" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB199" />
          <stop offset="100%" stopColor="#FF7EB3" />
        </linearGradient>
        <linearGradient id="nodeLocked" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7EE7C7" />
          <stop offset="100%" stopColor="#58C7A3" />
        </linearGradient>
        <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* edges */}
      {positions.map((p, i) => {
        if (i === 0) return null;
        const parent = Math.floor((i - 1) / 2);
        const pp = positions[parent];
        const inHeap = isInHeap(i) && isInHeap(parent);
        const active = step.edgeActive && ((step.edgeActive[0] === parent && step.edgeActive[1] === i) || (step.edgeActive[0] === i && step.edgeActive[1] === parent));
        const opacity = inHeap ? (active ? 1 : 0.55) : 0.15;
        return (
          <line
            key={`e-${i}`}
            x1={pp.x} y1={pp.y} x2={p.x} y2={p.y}
            stroke={active ? "url(#edgeActive)" : "url(#edgeGrad)"}
            strokeWidth={active ? 5 : 3}
            strokeLinecap="round"
            opacity={opacity}
            style={active ? { filter: "drop-shadow(0 0 6px rgba(255,126,179,0.6))" } : undefined}
          />
        );
      })}

      {/* traveling dot on active edge */}
      {step.edgeActive && (() => {
        const [a, b] = step.edgeActive;
        const pa = positions[a], pb = positions[b];
        const t = Math.max(0, Math.min(1, progress));
        const dx = pa.x + (pb.x - pa.x) * t;
        const dy = pa.y + (pb.y - pa.y) * t;
        const op = interpolate(progress, [0, 0.1, 0.85, 1], [0, 1, 1, 0]);
        return (
          <g key={edgeKey} opacity={op}>
            <circle cx={dx} cy={dy} r={10} fill="#fff" />
            <circle cx={dx} cy={dy} r={7} fill="#FF7EB3" />
          </g>
        );
      })()}

      {/* nodes */}
      {positions.map((p, i) => {
        const inHeap = isInHeap(i);
        const locked = isLocked(i);
        const active = isActive(i);
        const enter = spring({ frame: frame - (i * 3), fps, config: { damping: 16, stiffness: 160 }, durationInFrames: 20 });
        const baseScale = interpolate(enter, [0, 1], [0.4, 1]);
        const scale = active ? baseScale * pulse : baseScale;
        const opacity = inHeap ? 1 : locked ? 0.9 : 0.35;
        const fill = locked ? "url(#nodeLocked)" : active ? "url(#nodeActive)" : "url(#nodeIdle)";
        const shadow = active
          ? "drop-shadow(0 8px 18px rgba(255,126,179,0.5))"
          : locked
            ? "drop-shadow(0 8px 18px rgba(88,199,163,0.45))"
            : "drop-shadow(0 8px 18px rgba(122,184,255,0.35))";
        return (
          <g key={`n-${i}`} opacity={opacity} transform={`translate(${p.x} ${p.y}) scale(${scale})`}>
            <circle cx={0} cy={0} r={radius + 4} fill="rgba(255,255,255,0.35)" />
            <circle cx={0} cy={0} r={radius} fill={fill} style={{ filter: shadow }} />
            <circle cx={-radius * 0.35} cy={-radius * 0.4} r={radius * 0.28} fill="rgba(255,255,255,0.55)" />
            <text x={0} y={radius * 0.32}
              textAnchor="middle"
              fontFamily="Inter, sans-serif" fontWeight={800} fontSize={radius * 0.95}
              fill="#fff"
              style={{ letterSpacing: -1, filter: "drop-shadow(0 2px 4px rgba(30,35,64,0.35))" }}
            >{step.arr[i]}</text>
            <text x={0} y={-radius - 10}
              textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace" fontWeight={600} fontSize={16}
              fill={theme.inkSoft}
              opacity={0.85}
            >[{i}]</text>
          </g>
        );
      })}
    </svg>
  );
};