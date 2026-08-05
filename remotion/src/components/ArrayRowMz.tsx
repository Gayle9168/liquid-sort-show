import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { theme } from "../lib/theme";
import { MzStep } from "../lib/move-zeroes";

export const ArrayRowMz: React.FC<{
  step: MzStep;
  progress: number;
  x: number;
  y: number;
  cellW: number;
  cellH: number;
  gap: number;
  intro?: boolean;
}> = ({ step, progress, x, y, cellW, cellH, gap, intro }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const swapping = step.kind === "place" && step.swap && step.swap[0] !== step.swap[1];
  const cells = swapping ? step.prev : step.arr;

  const move = spring({
    frame: Math.round(progress * 22),
    fps,
    config: { damping: 17, stiffness: 190 },
    durationInFrames: 22,
  });
  const pop = spring({
    frame: Math.round(progress * 18),
    fps,
    config: { damping: 13, stiffness: 220 },
    durationInFrames: 18,
  });

  const slotX = (i: number) => i * (cellW + gap);

  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {cells.map((v, i) => {
        const appear = spring({
          frame: frame - (8 + i * 5),
          fps,
          config: { damping: 15, stiffness: 150 },
        });

        let left = slotX(i);
        let lift = 0;
        if (swapping && step.swap) {
          const [a, b] = step.swap;
          if (i === a) {
            left = interpolate(move, [0, 1], [slotX(a), slotX(b)]);
            lift = -Math.sin(move * Math.PI) * 72;
          } else if (i === b) {
            left = interpolate(move, [0, 1], [slotX(b), slotX(a)]);
            lift = Math.sin(move * Math.PI) * 72;
          }
        }

        const isZero = v === 0;
        const isActive = step.active.includes(i) && !intro;
        const isPacked = step.packed.includes(i);
        const isRead = i === step.read;

        if (isRead && !swapping) lift = interpolate(pop, [0, 1], [0, -18]);

        let fill = isZero ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.88)";
        let ring = isZero
          ? "inset 0 0 0 2px rgba(120,130,180,0.22)"
          : "inset 0 0 0 1.5px rgba(120,130,180,0.18)";
        let glow = "0 12px 26px rgba(120,130,180,0.14)";
        let textColor = isZero ? "rgba(74,82,122,0.55)" : theme.ink;

        if (isPacked) {
          fill = "linear-gradient(180deg,#7EE7C7,#4CC0A0)";
          textColor = "white";
          ring = "inset 0 1px 0 rgba(255,255,255,0.7)";
          glow = "0 18px 38px rgba(76,192,160,0.40)";
        }
        if (isActive && !isPacked) {
          fill = "linear-gradient(180deg,#8FC3FF,#6AA9F5)";
          textColor = "white";
          ring = "inset 0 1px 0 rgba(255,255,255,0.7)";
          glow = "0 18px 36px rgba(106,169,245,0.42)";
        }
        if (step.kind === "skip" && isRead) {
          fill = "linear-gradient(180deg,#FFC7B2,#FF9C7A)";
          textColor = "white";
          glow = "0 16px 34px rgba(255,140,105,0.38)";
        }

        const scale = isActive ? interpolate(pop, [0, 1], [0.97, 1.05]) : 1;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top: lift,
              width: cellW,
              height: cellH,
              transform: `scale(${interpolate(appear, [0, 1], [0.55, scale])})`,
              opacity: appear,
              borderRadius: 30,
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
                fontSize: isZero ? 58 : 62,
                color: textColor,
                letterSpacing: -1.5,
              }}
            >
              {v}
            </div>
          </div>
        );
      })}

      {cells.map((_, i) => (
        <div
          key={`ix${i}`}
          style={{
            position: "absolute",
            left: slotX(i),
            top: cellH + 12,
            width: cellW,
            textAlign: "center",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 22,
            fontWeight: 600,
            color: theme.inkSoft,
            opacity: i === step.read || i === step.write ? 1 : 0.55,
          }}
        >
          {i}
        </div>
      ))}
    </div>
  );
};