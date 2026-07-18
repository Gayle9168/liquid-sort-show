import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Bar, BarState } from "./Bar";
import { SortStep } from "../lib/sort";

// Renders bars driven by (prevStep -> currStep) with local progress 0..1.
// Handles: shift (arc slide), insert (drop into slot), lift on pick, etc.
export const BarsStage: React.FC<{
  prev: SortStep;
  curr: SortStep;
  progress: number;   // 0..1 within current step
  n: number;          // slot count
  originX: number;
  originY: number;    // baseline
  slotW: number;
  barW: number;
  maxValue: number;
  appearBaseFrame: number;
}> = ({ prev, curr, progress, n, originX, originY, slotW, barW, maxValue, appearBaseFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Ease
  const e = spring({ frame: Math.round(progress * 20), fps, config: { damping: 18, stiffness: 200 }, durationInFrames: 20 });
  const p = Math.max(0, Math.min(1, e));

  // Build a stable identity per bar value+original index is hard because of duplicates.
  // Use position mapping: for each slot in curr, we know what value; for each slot in prev, same.
  // We'll render by CURRENT slot index and derive its previous slot to animate horizontal motion.
  // For "shift": prev has value V at slot j, curr has V at slot j+1 -> slide right.
  // For "insert": before insert, key floats above slot i; after insert, at slot j+1.
  // We approximate: match values by position preference; for identical arrays, no motion.

  // Compute where each current slot's value came from in prev.
  // Greedy: find same value in prev, prefer nearest index not yet used.
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
    if (best === -1) best = k; // shouldn't happen (multisets equal)
    used[best] = true;
    fromSlot.push(best);
  }

  // For "keyGrab" step: the bar at i lifts up (visual pick).
  // For "insert" step: incoming bar drops into slot j+1 from above.
  const liftAmount = 140;

  return (
    <>
      {curr.arr.map((v, slot) => {
        const from = fromSlot[slot];
        const startX = originX + from * slotW + slotW / 2;
        const endX = originX + slot * slotW + slotW / 2;

        // Arc: rise then fall between different slots
        const dx = endX - startX;
        const midLift = dx !== 0 ? -60 : 0;
        const arcY = Math.sin(p * Math.PI) * midLift;
        const x = startX + (endX - startX) * p;

        // Lift logic for pick/insert
        let lift = arcY;
        const active = curr.active.includes(slot);

        if (curr.kind === "keyGrab" && slot === curr.i) {
          // lift from 0 -> -lift
          lift = interpolate(p, [0, 1], [0, -liftAmount]);
        } else if (curr.kind === "pickStart" && slot === curr.i) {
          lift = interpolate(p, [0, 1], [0, -liftAmount * 0.4]);
        } else if (
          (curr.kind === "compare" || curr.kind === "shift" || curr.kind === "decJ") &&
          slot === curr.i
        ) {
          // key bar stays lifted while inner loop runs
          lift = -liftAmount;
        } else if (curr.kind === "insert" && slot === curr.j + 1) {
          // drop from -lift to 0
          lift = interpolate(p, [0, 1], [-liftAmount, 0]);
        }

        let state: BarState = "idle";
        if (curr.locked.includes(slot)) state = "locked";
        if (active) state = "active";
        if (curr.kind === "insert" && slot === curr.j + 1 && p > 0.7) state = "locked";

        return (
          <Bar
            key={`slot-${slot}-v${v}`}
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
        );
      })}
    </>
  );
};