import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Bar, BarState } from "./Bar";
import { SortStep } from "../lib/sort-quick";

// Bars stage specialized for quick sort:
// - out-of-range bars dim
// - pivot bar has a permanent lift + peach glow marker
// - swap = two bars arc across each other
// - pivotSwap = pivot drops into slot i, other bar slides sideways
export const BarsStageQuick: React.FC<{
  prev: SortStep;
  curr: SortStep;
  progress: number;
  n: number;
  originX: number;
  originY: number;
  slotW: number;
  barW: number;
  maxValue: number;
  appearBaseFrame: number;
}> = ({
  prev,
  curr,
  progress,
  n,
  originX,
  originY,
  slotW,
  barW,
  maxValue,
  appearBaseFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const e = spring({
    frame: Math.round(progress * 20),
    fps,
    config: { damping: 18, stiffness: 200 },
    durationInFrames: 20,
  });
  const p = Math.max(0, Math.min(1, e));

  // Match each curr slot back to prev slot by value (greedy nearest).
  const used = new Array(n).fill(false);
  const fromSlot: number[] = [];
  for (let k = 0; k < n; k++) {
    const v = curr.arr[k];
    let best = -1;
    let bestD = Infinity;
    for (let m = 0; m < n; m++) {
      if (used[m]) continue;
      if (prev.arr[m] !== v) continue;
      const d = Math.abs(m - k);
      if (d < bestD) {
        bestD = d;
        best = m;
      }
    }
    if (best === -1) best = k;
    used[best] = true;
    fromSlot.push(best);
  }

  const scanLift = 40;
  const pivotLift = 90;
  const swapLift = 130;

  return (
    <>
      {curr.arr.map((v, slot) => {
        const from = fromSlot[slot];
        const startX = originX + from * slotW + slotW / 2;
        const endX = originX + slot * slotW + slotW / 2;

        const dx = endX - startX;
        const midLift = dx !== 0 ? -swapLift : 0;
        const arcY = Math.sin(p * Math.PI) * midLift;
        const x = startX + (endX - startX) * p;

        let lift = arcY;

        // Scan pointer (j) mild lift, only if in range
        const inRange = slot >= curr.lo && slot <= curr.hi;
        const isPivot =
          (curr.kind === "pickPivot" ||
            curr.kind === "scanStart" ||
            curr.kind === "compare" ||
            curr.kind === "swap") &&
          slot === curr.pivotIndex;

        if (isPivot) {
          lift = interpolate(p, [0, 1], [-pivotLift * 0.6, -pivotLift]);
        }
        if (
          (curr.kind === "compare" || curr.kind === "swap") &&
          slot === curr.j &&
          slot !== curr.pivotIndex
        ) {
          lift = Math.min(lift, -scanLift);
        }
        if (curr.kind === "pivotSwap" && slot === curr.i) {
          // pivot drops into its final position
          lift = interpolate(p, [0, 1], [-pivotLift, 0]);
        }

        // Bar state
        let state: BarState = "idle";
        if (curr.locked.includes(slot)) state = "locked";
        if (curr.active.includes(slot)) state = "active";
        if (curr.kind === "pivotSwap" && slot === curr.i && p > 0.7) state = "locked";

        // Out-of-range dimming (but never dim locked / done view)
        const dim = !inRange && !curr.locked.includes(slot) ? 0.42 : 1;

        return (
          <div
            key={`slot-${slot}-v${v}`}
            style={{ position: "absolute", inset: 0, opacity: dim, transition: "none" }}
          >
            <Bar
              value={v}
              maxValue={maxValue}
              slotX={x}
              targetY={originY}
              liftY={lift}
              width={barW}
              state={state}
              index={slot}
              appearAt={appearBaseFrame + slot * 4}
            />
          </div>
        );
      })}

      {/* Range bracket around current lo..hi */}
      {curr.lo <= curr.hi && (curr.hi - curr.lo) < n && curr.kind !== "done" && (
        <RangeBracket
          originX={originX}
          originY={originY}
          slotW={slotW}
          lo={curr.lo}
          hi={curr.hi}
        />
      )}
    </>
  );
};

const RangeBracket: React.FC<{
  originX: number;
  originY: number;
  slotW: number;
  lo: number;
  hi: number;
}> = ({ originX, originY, slotW, lo, hi }) => {
  const frame = useCurrentFrame();
  const left = originX + lo * slotW + 6;
  const right = originX + (hi + 1) * slotW - 6;
  const width = right - left;
  const pulse = 0.7 + Math.sin(frame / 8) * 0.15;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: originY + 18,
        width,
        height: 46,
        borderRadius: 22,
        border: "3px solid rgba(122,184,255,0.55)",
        background: "linear-gradient(180deg, rgba(122,184,255,0.08), rgba(167,139,250,0.05))",
        boxShadow: `0 0 24px rgba(122,184,255,${0.25 * pulse})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 20,
          fontWeight: 700,
          color: "#4A527A",
          opacity: 0.8,
        }}
      >
        [{lo}…{hi}]
      </div>
    </div>
  );
};