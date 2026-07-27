import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Bar, BarState } from "./Bar";
import { SortStep } from "../lib/sort-selection";

export const BarsStageSelection: React.FC<{
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
}> = ({ prev, curr, progress, n, originX, originY, slotW, barW, maxValue, appearBaseFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const e = spring({ frame: Math.round(progress * 20), fps, config: { damping: 18, stiffness: 200 }, durationInFrames: 20 });
  const p = Math.max(0, Math.min(1, e));

  // Position matching between prev and curr (handles swap)
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
      if (d < bestD) { bestD = d; best = m; }
    }
    if (best === -1) best = k;
    used[best] = true;
    fromSlot.push(best);
  }

  const liftMin = 100;
  const liftScan = 40;

  return (
    <>
      {curr.arr.map((v, slot) => {
        const from = fromSlot[slot];
        const startX = originX + from * slotW + slotW / 2;
        const endX = originX + slot * slotW + slotW / 2;
        const dx = endX - startX;
        // Swap: arc, one over the top, one under
        const arcLift = dx !== 0 ? (slot < from ? -160 : -80) * Math.sin(p * Math.PI) : 0;
        const x = startX + (endX - startX) * p;

        let lift = arcLift;
        const isMin = slot === curr.min;
        const isI = slot === curr.i;
        const isJ = slot === curr.j;

        if (curr.kind === "scan") {
          if (isJ) lift = -liftScan;
          if (isMin && !isJ) lift = -liftMin;
        } else if (curr.kind === "newMin") {
          if (isMin) lift = -liftMin;
        } else if (curr.kind === "startPass") {
          if (isI) lift = -liftScan;
        }

        let state: BarState = "idle";
        if (curr.locked.includes(slot)) state = "locked";
        if (curr.active.includes(slot)) state = "active";
        // dim out-of-range
        const outOfRange = slot < curr.i && !curr.locked.includes(slot);
        // after swap completes, i becomes locked visually
        if ((curr.kind === "swap" || curr.kind === "noSwap") && slot === curr.i && p > 0.7) {
          state = "locked";
        }

        return (
          <div key={`slot-${slot}`} style={{ opacity: outOfRange ? 0.5 : 1 }}>
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
    </>
  );
};