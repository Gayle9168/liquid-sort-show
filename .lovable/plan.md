## Goal

A 40-second 9:16 short explaining **Two Sum (hash map, optimal)** in the same Liquid Glass style as the sort shorts — but on a **single flat background color, no gradient**. Renders to `/mnt/documents/two-sum-liquid-glass.mp4`.

## Visual direction

- **Background**: one solid color, `#EFF3F8` (cool pearl). No gradient, no blobs, no dark, no black. Depth comes only from glass panels, soft shadows and highlights.
- **Glass**: reuse `GlassPanel` (white translucent fill, inner highlight, soft shadow) on the flat backdrop.
- **Accents** (sparing): sky `#7AB8FF` (current element), lilac `#A78BFA` (hash map), peach `#FFB199` (searching for complement), mint `#58C7A3` (match found).

## Data

`nums = [4, 1, 8, 6, 3, 5]`, `target = 11`. The match fires on the last index (6 of 6), so every element gets its own on-screen step and the answer is `[3, 5]` (values 6 + 5).

## Screen layout (1080 x 1920)

```text
 ┌──────────────────────────────┐
 │ ARRAY · O(n)                 │
 │ Two Sum — Hash Map           │
 ├──────────────────────────────┤
 │ target = 11        (glass)   │
 │ [ 4 ][ 1 ][ 8 ][ 6 ][ 3 ][5] │  array row + index labels
 │        ^ i                   │
 ├──────────────────────────────┤
 │ need = target - nums[i]      │  complement chip
 ├──────────────────────────────┤
 │ HASH MAP  (teaching box)     │
 │ ┌────────┐ ┌────────┐        │
 │ │key  4  │ │key  1  │  ...   │
 │ │val  0  │ │val  1  │        │
 │ └────────┘ └────────┘        │
 │  6 empty slots, fill one     │
 │  per step, left to right     │
 ├──────────────────────────────┤
 │ code panel, synced highlight │
 ├──────────────────────────────┤
 │ Time O(n) · Space O(n)       │
 │ vs brute force O(n^2)        │
 └──────────────────────────────┘
```

## Step model

New `remotion/src/lib/two-sum.ts`, single source of truth.

```text
StepKind =
  | "intro"       // show array + target
  | "visit"       // i moves to next element
  | "complement"  // need = target - nums[i]
  | "lookup"      // check map for need (miss)
  | "store"       // map.set(nums[i], i)
  | "found"       // hit -> return [map.get(need), i]
  | "result"      // answer pair highlighted
```

`Step` fields: `i`, `value`, `need`, `map: {value,index}[]`, `hit: number | null`, `active: number[]`, `matched: number[]`, `codeLine`.

`buildSteps(nums, target)` emits per index: `visit` -> `complement` -> `lookup` -> (`store` or `found`) — 6 visited indices, ~22 atomic steps. Timing reuses `lib/timing.ts` (`buildStepClock` / `locateStep`) so the first index is slow and teachy and later ones accelerate — same slow-to-fast ramp, no freezes.

## Components (new, mirroring existing patterns)

- `FlatBackground.tsx` — solid `#EFF3F8` fill (replaces `LiquidBackground` here).
- `ArrayRowTwoSum.tsx` — 6 glass cells with value + index; current `i` lifts and tints sky; matched pair springs to mint with a lock sheen.
- `HashMapPanel.tsx` — glass table; each `store` springs a new `value -> index` row in from the right in lilac; on `found` the matching row pulses mint with a connector to the current cell.
- `ComplementChip.tsx` — animated `need = 11 - 6 = 5` chip with digits counting into place.
- `CodePanelTwoSum.tsx` — existing code-panel styling; `step.codeLine` drives the spring highlight; chips show `i`, `nums[i]`, `need`, `map.size`.
- `ComplexityPanel.tsx` — bottom glass strip: `Time O(n)` / `Space O(n)` with a small bar comparison against brute force `O(n^2)`; animates in during the outro.
- `StepLabelTwoSum.tsx` — glass pill: `Visit`, `Need complement`, `Not in map`, `Store in map`, `Match found!`, `Answer`.
- `VfxLayerTwoSum.tsx` — arc from array cell down into the hash map on `store`; peach search ripple across the map on `lookup`; mint radial bloom + connector beam on `found`; final sweep across the answer pair. Additive, frame-driven, no `backdropFilter`.
- `SfxTrackTwoSum.tsx` — reuses existing `public/sfx/*`: `pick` (visit), `compare` (lookup), `shift` (store), `insert` (found), `lock` (result), plus `ambient`, `whoosh_intro`, `sparkle_outro`.

Code listing shown in the panel:

```text
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) {
      return [map.get(need), i];
    }
    map.set(nums[i], i);
  }
}
```

## Timeline (1200 frames @ 30fps = 40s)

- 0–90: title + array + target reveal (intro whoosh)
- 90–1020: the 6 indices, slow to fast
- 1020–1110: match found — mint bloom, answer pair `[3, 5]` locked
- 1110–1200: complexity panel takes the stage (`O(n)` vs `O(n^2)`), sparkle outro

## Wiring

- `MainVideoTwoSum.tsx` composes background, title, array row, complement chip, hash map, code panel, complexity, label, VFX and SFX, all driven by one `curr/prev/local` from `locateStep`.
- Register `<Composition id="twosum" ... 1200 / 30 / 1080 / 1920 />` in `remotion/src/Root.tsx`.
- `remotion/scripts/render-twosum.mjs` + `still-twosum.mjs` cloned from the heap versions, output `/mnt/documents/two-sum-liquid-glass.mp4`.

## Verification

Stills at frames 60, 300, 700, 1040, 1160; short audio test render; then the full 40s render, reporting path and file size.

## Files touched

New: `src/lib/two-sum.ts`, `src/MainVideoTwoSum.tsx`, `src/components/{FlatBackground,ArrayRowTwoSum,HashMapPanel,ComplementChip,CodePanelTwoSum,ComplexityPanel,StepLabelTwoSum,VfxLayerTwoSum,SfxTrackTwoSum}.tsx`, `scripts/render-twosum.mjs`, `scripts/still-twosum.mjs`.
Updated: `src/Root.tsx`. Unchanged: timing, theme, GlassPanel, existing sort shorts.