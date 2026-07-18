import { interpolate } from "remotion";

// Given N steps and a total frame budget, return the start frame of each step,
// with a smooth easeInOut ramp from slow (pass 1) -> fast (later passes).
// Duration multiplier per step position p in [0,1]:
//   1.0 (slow teaching) -> 0.5 -> 0.20 (final, quick)
export function buildStepClock(steps: number, totalFrames: number) {
  const weights: number[] = [];
  for (let s = 0; s < steps; s++) {
    const p = s / Math.max(1, steps - 1);
    // piecewise: slow first ~18% of steps, then ramp
    const mult = interpolate(p, [0, 0.18, 0.55, 1], [1.0, 0.85, 0.42, 0.22]);
    weights.push(mult);
  }
  const sum = weights.reduce((a, b) => a + b, 0);
  const scale = totalFrames / sum;
  const starts: number[] = [];
  let acc = 0;
  for (const w of weights) {
    starts.push(acc);
    acc += w * scale;
  }
  const durations = weights.map((w) => w * scale);
  return { starts, durations };
}

// Given a frame within the sort window, return which step index + local progress.
export function locateStep(
  frame: number,
  starts: number[],
  durations: number[],
) {
  let idx = 0;
  for (let i = 0; i < starts.length; i++) {
    if (frame >= starts[i]) idx = i;
    else break;
  }
  const local = (frame - starts[idx]) / Math.max(1, durations[idx]);
  return { idx, local: Math.max(0, Math.min(1, local)) };
}