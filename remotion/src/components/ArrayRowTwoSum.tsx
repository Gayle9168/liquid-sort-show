import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { theme } from "../lib/theme";
import { TwoSumStep } from "../lib/two-sum";

export const ArrayRowTwoSum: React.FC<{
  nums: number[];
  step: TwoSumStep;
  progress: number;
  x: number;
  y: number;
  cellW: number;
  cellH: number;
  gap: number;
  intro?: boolean;
}> = ({ nums, step, progress, x, y, cellW, cellH, gap, intro }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {nums.map((v, i) => {
        const appear = spring({
          frame: frame - (10 + i * 5),
          fps,
          config: { damping: 15, stiffness: 150 },
        });
        const isActive = step.active.includes(i);
        const isMatched = step.matched.includes(i);
        const isStored = step.map.some((m) => m.index === i);

        const pop = spring({
          frame: Math.round(progress * 18),
          fps,
          config: { damping: 13, stiffness: 220 },
          durationInFrames: 18,
        });
        const lift = isActive ? interpolate(pop, [0, 1], [0, -16]) : 0;
        const scale = isMatched
          ? interpolate(pop, [0, 1], [1, 1.08])
          : isActive
            ? interpolate(pop, [0, 1], [0.96, 1.04])
            : 1;

        let fill = "rgba(255,255,255,0.85)";
        let textColor = theme.ink;
        let ring = "inset 0 0 0 1.5px rgba(120,130,180,0.20)";
        let glow = "0 10px 24px rgba(120,130,180,0.16)";
        if (isStored && !isActive && !isMatched) {
          fill = "rgba(167,139,250,0.16)";
          ring = "inset 0 0 0 2px rgba(167,139,250,0.45)";
        }
        if (isActive && !isMatched) {
          fill = "linear-gradient(180deg, #8FC3FF, #6AA9F5)";
          textColor = "white";
          ring = "inset 0 1px 0 rgba(255,255,255,0.7)";
          glow = "0 16px 34px rgba(106,169,245,0.42)";
        }
        if (isMatched) {
          fill = "linear-gradient(180deg, #7EE7C7, #4CC0A0)";
          textColor = "white";
          ring = "inset 0 1px 0 rgba(255,255,255,0.7)";
          glow = "0 18px 40px rgba(76,192,160,0.45)";
        }

        const dim = intro ? 1 : isActive || isMatched ? 1 : 0.94;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * (cellW + gap),
              top: lift,
              width: cellW,
              height: cellH,
              transform: `scale(${interpolate(appear, [0, 1], [0.5, scale])})`,
              opacity: appear * dim,
              borderRadius: 26,
              background: fill,
              boxShadow: `${glow}, ${ring}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: 56,
                color: textColor,
                letterSpacing: -1,
              }}
            >
              {v}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -34,
                left: 0,
                right: 0,
                textAlign: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 20,
                fontWeight: 600,
                color: isActive || isMatched ? theme.ink : theme.inkSoft,
                opacity: isActive || isMatched ? 1 : 0.6,
              }}
            >
              {i}
            </div>
          </div>
        );
      })}
    </div>
  );
};
