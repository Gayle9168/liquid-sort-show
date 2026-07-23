## Goal
Create a 40-second 9:16 Remotion short for **Quick Sort** that matches the same Liquid Glass aesthetic, synced code + animation + labels + SFX/VFX quality as the existing insertion-sort short. The final output renders to `/mnt/documents/quick-sort-liquid-glass.mp4`.

## Design decisions (already resolved)
- **Pivot strategy**: last element of the current sub-array as pivot.
- **Recursion style**: flat view — the animation uses a sliding partition window and step labels to imply recursion without a full tree panel.
- **Visual language**: same light pearl gradient, glass panels, pastel bars, and motion system as the insertion-sort short.

## 1. Quick-sort step model

Create `remotion/src/lib/sort-quick.ts` as the single source of truth.

```text
StepKind =
  | "pickPivot"      // choose pivot (last element in range)
  | "setBounds"      // lo = range start, hi = range end
  | "scanStart"      // start the partition scan
  | "compare"        // compare a[j] with pivot
  | "swap"           // swap a[i+1] with a[j]
  | "pivotSwap"      // final swap placing pivot in its sorted position
  | "recurseLeft"    // mark left sub-array and recurse
  | "recurseRight"   // mark right sub-array and recurse
  | "done"           // sub-array size 0 or 1, already sorted
```

`SortStep` extends the existing shape but replaces insertion-sort fields with quick-sort ones:
- `arr: number[]` — array state after the step.
- `lo: number`, `hi: number` — current sub-array bounds.
- `pivotIndex: number` — index of the pivot element.
- `i: number`, `j: number` — partition scan pointers (`i` is the partition boundary; `j` scans).
- `active: number[]` — indices visually highlighted (scan pointer, pivot, swap pair).
- `locked: number[]` — indices whose final sorted position is already known.
- `rangeStack: { lo, hi }[]` — pending sub-array ranges (drives subtle range brackets).
- `pass: number` — 1-based recursion call count.
- `codeLine: number` — 0-based line in the quick-sort code listing.

`buildSteps(input)` runs an in-place Lomuto-style quick sort and pushes one immutable step per atomic UI moment. Array size stays at 8 elements (`[7, 3, 5, 8, 2, 6, 4, 1]`) for visual consistency with the insertion sort, so the two shorts are comparable.

The expected step count is roughly 40-60 steps, which fits comfortably into the 990-frame sort window.

## 2. Shared timing and sync

Reuse `remotion/src/lib/timing.ts` (`buildStepClock`, `locateStep`) without changes. The same slow → fast ramp works: first partition is slow and readable, later recursive calls accelerate.

In `MainVideo` (or a new quick-sort `MainVideo`), compute:
- `steps = buildSteps(INITIAL)`
- `clock = buildStepClock(steps.length, SORT_END - SORT_START)`
- `curr / prev / local = locateStep(...)`

Pass the same `curr/prev/local` into `BarsStage`, `VfxLayer`, `StepLabel`, and `CodePanel` — the same single-source-of-truth sync pattern.

## 3. Bar stage: partition + swap motion

Create `remotion/src/components/BarsStageQuick.tsx` (specialized) or parameterize the existing `BarsStage`. Given the different animation vocabulary, a dedicated quick-sort variant is cleaner.

Motion rules:
- **Pivot**: the pivot bar gets a permanent marker ring (peach/pink glow) and sits at the right end of the active range. It stays visually lifted ~90px during partition so the viewer always knows where the boundary is.
- **Scan pointer `j`**: the bar under comparison gently pulses (scale 1.03) and lifts ~40px.
- **Swap**: the two bars arc-slide across each other with a 120px mid-lift. Use a 2-step arc: rise to mid-lift over [0, 0.5], swap x over [0, 1], descend over [0.5, 1].
- **Pivot swap**: when `pivotSwap` places the pivot, the pivot drops from its lifted position into its final slot and its color transitions to locked (mint green).
- **Recurse**: on `recurseLeft`/`recurseRight`, the active range bracket slides/reshapes to the new `lo..hi`; bars outside the current range dim slightly (opacity 0.45) so the viewer focuses on the sub-problem.
- **Locked bars**: bars that have reached final position use the existing `locked` gradient and a subtle sheen.

Use the same stable position-matching logic as the insertion sort to derive horizontal motion between `prev.arr` and `curr.arr`.

## 4. Code panel

Create `remotion/src/components/CodePanelQuick.tsx` with the quick-sort code listing:

```text
function quickSort(a, lo, hi) {
  if (lo >= hi) return;
  const p = partition(a, lo, hi);
  quickSort(a, lo, p - 1);
  quickSort(a, p + 1, hi);
}

function partition(a, lo, hi) {
  const pivot = a[hi];
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    if (a[j] <= pivot) {
      i++;
      swap(a, i, j);
    }
  }
  swap(a, i + 1, hi);
  return i + 1;
}
```

`step.codeLine` maps to the active line. Variable chips show `lo`, `hi`, `pivot`, `i`, `j`, and `pass` (recursion call count). The same spring-animated highlight bar and chip enter animation from the insertion sort are reused.

## 5. Step labels

Create `remotion/src/components/StepLabelQuick.tsx` or make `StepLabel` accept a label map. Map `StepKind` to:

```text
pickPivot   → "Pick pivot"
setBounds   → "Set bounds"
scanStart   → "Start scan"
compare     → "Compare"
swap        → "Swap"
pivotSwap   → "Place pivot"
recurseLeft → "Recurse left"
recurseRight→ "Recurse right"
done        → "Done"
```

Color accents per kind (pivot = peach, swap = pink, recurse = sky blue, done = mint). The pill keeps the same glass styling, spring-in scale, and floating sine motion. Inline chips show `lo`, `hi`, `pivot`, `i`, `j`.

Intro label is "Quick Sort"; outro label is "Complete".

## 6. VFX

Create `remotion/src/components/VfxLayerQuick.tsx` keyed off `step.kind` and `local` progress.

Effects:
- **Pivot glow**: persistent peach ring under the pivot bar during the whole partition window.
- **Compare arc**: same bezier arc + traveling dot as insertion sort, but between the scan bar (`j`) and the pivot bar (`pivotIndex`).
- **Swap flash**: at the midpoint of a `swap` or `pivotSwap`, a brief radial bloom at the center of the swap pair (pink/white, 12 frames).
- **Partition boundary**: a vertical dashed line or glowing bracket that follows the partition index `i` during partition steps, subtly pulsing.
- **Range bracket**: soft rounded rectangle that frames the current `lo..hi` range; reshapes on recurse steps.
- **Lock sheen**: when a pivot is placed (`pivotSwap`), a diagonal light sweep across the newly locked slot.
- **Final green cascade**: at `frame >= OUTRO_START`, sequential mint glow pulses run left-to-right across all bars (same as insertion sort outro).
- **Screen flash on final pivot**: subtle white radial bloom when the last pivot locks into place.

All effects are additive and frame-driven; no `backdropFilter`.

## 7. SFX

Generate quick-sort-specific cues. Since the existing insertion sort used offline synthesis, follow the same reliable path.

Create `remotion/scripts/gen-sfx-quick.mjs` (or extend the existing generator) to synthesize WAV files into `remotion/public/sfx-quick/`:
- `pick_pivot.wav` — soft crystalline tick.
- `compare.wav` — light blip (reuse insertion sort's compare).
- `swap.wav` — quick airy whoosh + glass clink.
- `pivot_place.wav` — warm descending "lock" chime with mint shimmer.
- `recurse.wav` — short digital shimmer/riser to mark entering a sub-problem.
- `done.wav` — tiny affirmative pop.
- `whoosh_intro.wav` — same intro riser (reuse).
- `sparkle_outro.wav` — same outro sparkle (reuse).
- `ambient.wav` — same airy pad (reuse).

`SfxTrackQuick.tsx` maps `StepKind` to cue and volume. Important: suppress audio for very late/fast recursive steps to avoid clutter; for example, only play `recurse` for the first 8 recursion boundaries and mute subsequent ones, or lower volume for repeated `compare` steps after step index 30.

Keep the render script `muted: false` with `audioCodec: 'aac'` as already configured.

## 8. MainVideo and Root composition

Option A (recommended): create a new composition in `remotion/src/Root.tsx` so both shorts coexist in the same project.

```text
<Composition id="quick" component={MainVideoQuick} durationInFrames={1200} fps={30} width={1080} height={1920} />
<Composition id="main"  component={MainVideo}      durationInFrames={1200} fps={30} width={1080} height={1920} />
```

`MainVideoQuick.tsx` mirrors `MainVideo.tsx` but uses:
- `buildSteps` from `lib/sort-quick`
- `BarsStageQuick`
- `VfxLayerQuick`
- `StepLabelQuick`
- `CodePanelQuick`
- `SfxTrackQuick`

Title reads: "ALGORITHM · O(n log n)" / "Quick Sort". Keep the same intro/outro structure and timing windows (`INTRO_END=90`, `OUTRO_START=1080`, total 1200 frames at 30fps).

Update `remotion/scripts/render-remotion.mjs` to accept a composition id argument (or create a second script `render-remotion-quick.mjs`) and output to `/mnt/documents/quick-sort-liquid-glass.mp4`.

## 9. Verification

- `bunx remotion still` at key frames: 130 (first pivot picked), 450 (mid-partition swap), 900 (late recursion), 1100 (outro cascade).
- 2-second test render with audio to confirm AAC path.
- Full 40-second render to `/mnt/documents/quick-sort-liquid-glass.mp4`.
- Report final file size and confirm no console errors.

## Files touched
- New: `remotion/src/lib/sort-quick.ts`
- New: `remotion/src/components/BarsStageQuick.tsx`
- New: `remotion/src/components/CodePanelQuick.tsx`
- New: `remotion/src/components/StepLabelQuick.tsx`
- New: `remotion/src/components/VfxLayerQuick.tsx`
- New: `remotion/src/components/SfxTrackQuick.tsx`
- New: `remotion/src/MainVideoQuick.tsx`
- New: `remotion/scripts/gen-sfx-quick.mjs`
- New: `remotion/public/sfx-quick/*.wav`
- Update: `remotion/src/Root.tsx` (register second composition)
- Update: `remotion/scripts/render-remotion.mjs` (parameterize or duplicate)
- Unchanged: `remotion/src/lib/timing.ts`, `remotion/src/components/Bar.tsx`, `remotion/src/components/GlassPanel.tsx`, `remotion/src/components/LiquidBackground.tsx`, `remotion/src/lib/theme.ts` (reused as-is)