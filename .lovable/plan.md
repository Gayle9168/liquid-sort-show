## Goal

Create a 40-second 9:16 Remotion short for **Merge Sort** that matches the same Liquid Glass aesthetic, synced code + animation + labels + SFX/VFX quality as the existing insertion-sort and quick-sort shorts. The final output renders to `/mnt/documents/merge-sort-liquid-glass.mp4`.

## Design decisions (resolved)

- **Algorithm style**: top-down recursive split-and-merge (classic divide-and-conquer).
- **Auxiliary array visual**: a second glass "merge buffer" row below the main bar stage. During a merge, the two sorted halves send their chosen elements down into the buffer, then the completed buffer slides back up to overwrite the original range.
- **Visual language**: same light pearl gradient, glass panels, pastel bars, and motion system as the existing shorts.

## 1. Merge-sort step model

Create `remotion/src/lib/sort-merge.ts` as the single source of truth.

```text
StepKind =
  | "split"          // mark the current range as being split in half
  | "recurseLeft"    // recurse on the left half
  | "recurseRight"   // recurse on the right half
  | "mergeStart"     // start merging two sorted halves back together
  | "compare"        // compare left[i] vs right[j] (or their source positions)
  | "takeLeft"       // copy the smaller left element into the buffer
  | "takeRight"      // copy the smaller right element into the buffer
  | "copyBack"       // copy the remaining tail of the other half
  | "mergeDone"      // merge buffer contents slide back into the original array
  | "done"           // single-element range is already sorted
```

`SortStep` extends the shared shape but uses merge-sort fields:
- `arr: number[]` — array state AFTER this step (source row).
- `lo: number`, `mid: number`, `hi: number` — current sub-range and its split point.
- `leftPos: number`, `rightPos: number` — pointers into the left and right halves during a merge.
- `bufPos: number` — next free slot in the merge buffer.
- `buffer: number[]` — current state of the auxiliary merge buffer (same length as `arr`, unused slots can be `null` or a sentinel).
- `source: ("left" | "right" | null)[]` — which half each buffer slot came from (for color coding).
- `active: number[]` — indices in the source row currently highlighted.
- `locked: number[]` — indices whose final sorted position is already known (size-1 ranges + completed merges).
- `rangeStack: { lo, hi, mid }[]` — pending recursion frames (drives the range-bracket stack).
- `pass: number` — recursion call count / merge phase count.
- `codeLine: number` — 0-based line in the merge-sort code listing.

`buildSteps(input)` runs a top-down recursive merge sort on the same 8-element array `[7, 3, 5, 8, 2, 6, 4, 1]` for visual consistency. It pushes one immutable step per atomic UI moment (split, recurse, compare, take-left/right, copy-tail, merge-done). Expected step count is roughly 50–70 steps, fitting comfortably in the 990-frame sort window.

The implementation mirrors the classic JS:

```text
function mergeSort(a, lo, hi) {
  if (lo >= hi) return;
  const mid = Math.floor((lo + hi) / 2);
  mergeSort(a, lo, mid);
  mergeSort(a, mid + 1, hi);
  merge(a, lo, mid, hi);
}

function merge(a, lo, mid, hi) {
  const temp = [];
  let i = lo, j = mid + 1;
  while (i <= mid && j <= hi) {
    if (a[i] <= a[j]) temp.push(a[i++]);
    else temp.push(a[j++]);
  }
  while (i <= mid) temp.push(a[i++]);
  while (j <= hi) temp.push(a[j++]);
  for (let k = 0; k < temp.length; k++) a[lo + k] = temp[k];
}
```

## 2. Shared timing and sync

Reuse `remotion/src/lib/timing.ts` (`buildStepClock`, `locateStep`) without changes. The same slow → fast ramp works: first splits and merges are slow and readable, later recursive calls accelerate.

In `MainVideoMerge` compute:
- `steps = buildSteps(INITIAL)`
- `clock = buildStepClock(steps.length, SORT_END - SORT_START)`
- `curr / prev / local = locateStep(...)`

Pass the same `curr/prev/local` into `BarsStageMerge`, `VfxLayerMerge`, `StepLabelMerge`, and `CodePanelMerge` — the same single-source-of-truth sync pattern.

## 3. Bar stage: split + merge motion

Create `remotion/src/components/BarsStageMerge.tsx`.

Layout:
- **Source row**: the main bars, positioned at the same baseline as the existing shorts (`originY ~ 1160`).
- **Merge buffer row**: a glass tray below the source row (`originY + ~220`). The tray shows placeholder slots or only fills the active range; completed merges fly back up to the source row.

Motion rules:
- **Split**: during a `split` step, the active range subtly fans outward — the left half shifts left by ~20px, the right half shifts right by ~20px — to visually show the divide. A vertical dashed split line appears at `mid`.
- **Recurse**: on `recurseLeft`/`recurseRight`, the range bracket reshapes to the new sub-range (`lo..mid` or `mid+1..hi`). Bars outside the current range dim slightly (opacity 0.45) to keep focus on the sub-problem.
- **Merge start**: the two halves tint differently (left = sky blue, right = lilac) and the buffer row slots for the range become visible.
- **Compare**: the two candidate bars (left pointer and right pointer) lift gently and pulse.
- **Take left / take right**: the chosen bar arcs down from its source position to the next free buffer slot (`bufPos`). A duplicate bar is rendered during the flight so the source row still shows the original sub-array until the merge completes.
- **Copy tail**: once one half is exhausted, the remaining elements arc down into the buffer one by one.
- **Merge done**: the filled buffer bars spring back up as a group and replace the original source range. Their state changes to `locked` (mint) once back in the source row, indicating that `lo..hi` is now sorted.
- **Single element**: a `done` step highlights the bar as already sorted (mint glow).
- **Locked bars**: completed ranges use the existing `locked` gradient and a subtle sheen.

Use stable position-matching logic between `prev.arr` and `curr.arr` to derive horizontal motion for any non-merge transitions (e.g., when the buffer slides back up).

## 4. Code panel

Create `remotion/src/components/CodePanelMerge.tsx` with the merge-sort code listing:

```text
function mergeSort(a, lo, hi) {
  if (lo >= hi) return;
  const mid = Math.floor((lo + hi) / 2);
  mergeSort(a, lo, mid);
  mergeSort(a, mid + 1, hi);
  merge(a, lo, mid, hi);
}

function merge(a, lo, mid, hi) {
  const temp = [];
  let i = lo, j = mid + 1;
  while (i <= mid && j <= hi) {
    if (a[i] <= a[j]) temp.push(a[i++]);
    else temp.push(a[j++]);
  }
  while (i <= mid) temp.push(a[i++]);
  while (j <= hi) temp.push(a[j++]);
  for (let k = 0; k < temp.length; k++) {
    a[lo + k] = temp[k];
  }
}
```

`step.codeLine` maps to the active line. Variable chips show `lo`, `mid`, `hi`, `i`, `j`, `bufPos`, and `pass`. Reuse the same spring-animated highlight bar and chip enter animation from the insertion-sort code panel.

## 5. Step labels

Create `remotion/src/components/StepLabelMerge.tsx` (or extend the existing label component). Map `StepKind` to:

```text
split       → "Split in half"
recurseLeft → "Recurse left"
recurseRight→ "Recurse right"
mergeStart  → "Merge halves"
compare     → "Compare"
takeLeft    → "Take left"
takeRight   → "Take right"
copyBack    → "Copy rest"
mergeDone   → "Merged"
done        → "Sorted"
```

Color accents per kind (split = sky blue, merge = peach, take left/right = lilac/sky, done = mint). The pill keeps the same glass styling, spring-in scale, and floating sine motion. Inline chips show `lo`, `mid`, `hi`, `i`, `j`, `bufPos`.

Intro label is "Merge Sort"; outro label is "Complete".

## 6. VFX

Create `remotion/src/components/VfxLayerMerge.tsx` keyed off `step.kind` and `local` progress.

Effects:
- **Split line**: a vertical dashed/glowing line at `mid` during `split` and `recurseLeft`/`recurseRight`, with a subtle pulse.
- **Range brackets**: soft rounded rectangle framing the current `lo..hi` range; reshapes on recurse steps. A small stack of pending frames can be shown as ghosted mini brackets above the stage.
- **Compare arc**: a bezier arc between the two candidate bars during `compare`, with a traveling dot.
- **Flight trail**: a faint motion trail following a bar as it arcs down into the buffer or back up.
- **Buffer glow**: a soft peach/lilac glow behind the active buffer slots during a merge.
- **Merge completion flash**: a brief radial bloom at the center of the range when `mergeDone` locks the sorted range.
- **Lock sheen**: when a range is locked, a diagonal light sweep across the newly sorted bars.
- **Final green cascade**: at `frame >= OUTRO_START`, sequential mint glow pulses run left-to-right across all bars (same as the other shorts).
- **Screen flash on final merge**: subtle white radial bloom when the last merge completes.

All effects are additive and frame-driven; no `backdropFilter`.

## 7. SFX

Generate merge-sort-specific cues. Reuse the existing offline synthesis script pattern and add new files to `remotion/public/sfx/` (or `remotion/public/sfx-merge/`):

- `split.wav` — soft crystalline rip indicating a split.
- `merge_start.wav` — warm riser / shimmer as two halves come together.
- `compare.wav` — light blip (reuse existing compare).
- `take.wav` — quick airy whoosh for a single element moving down into the buffer.
- `copy_tail.wav` — softer, lighter version of `take.wav`.
- `merge_done.wav` — warm descending "lock" chime with mint shimmer (similar to pivot place).
- `done.wav` — tiny affirmative pop.
- `whoosh_intro.wav` — same intro riser (reuse).
- `sparkle_outro.wav` — same outro sparkle (reuse).
- `ambient.wav` — same airy pad (reuse).

`SfxTrackMerge.tsx` maps `StepKind` to cue and volume. Suppress audio for very late/fast recursive merges to avoid clutter — for example, only play `split` and `merge_start` for the first few recursion levels and lower compare volume after step index ~40.

Keep the render script `muted: false` with `audioCodec: 'aac'` as already configured.

## 8. MainVideo and Root composition

Create a new composition in `remotion/src/Root.tsx` so all three shorts coexist.

```text
<Composition id="main"  component={MainVideo}      durationInFrames={1200} fps={30} width={1080} height={1920} />
<Composition id="quick" component={MainVideoQuick}  durationInFrames={1200} fps={30} width={1080} height={1920} />
<Composition id="merge" component={MainVideoMerge} durationInFrames={1200} fps={30} width={1080} height={1920} />
```

`MainVideoMerge.tsx` mirrors `MainVideoQuick.tsx` but uses:
- `buildSteps` from `lib/sort-merge`
- `BarsStageMerge`
- `VfxLayerMerge`
- `StepLabelMerge`
- `CodePanelMerge`
- `SfxTrackMerge`

Title reads: "ALGORITHM · O(n log n)" / "Merge Sort". Keep the same intro/outro structure and timing windows (`INTRO_END=90`, `OUTRO_START=1080`, total 1200 frames at 30fps).

Create `remotion/scripts/render-merge.mjs` (or parameterize the existing script) to output to `/mnt/documents/merge-sort-liquid-glass.mp4`.

## 9. Verification

- `bunx remotion still` (or the custom still script) at key frames: 130 (first split), 450 (mid-merge), 900 (late recursion), 1100 (outro cascade).
- 2-second test render with audio to confirm AAC path.
- Full 40-second render to `/mnt/documents/merge-sort-liquid-glass.mp4`.
- Report final file size and confirm no console errors.

## Files touched
- New: `remotion/src/lib/sort-merge.ts`
- New: `remotion/src/components/BarsStageMerge.tsx`
- New: `remotion/src/components/CodePanelMerge.tsx`
- New: `remotion/src/components/StepLabelMerge.tsx`
- New: `remotion/src/components/VfxLayerMerge.tsx`
- New: `remotion/src/components/SfxTrackMerge.tsx`
- New: `remotion/src/MainVideoMerge.tsx`
- New: `remotion/scripts/render-merge.mjs` (or update existing script)
- New: `remotion/public/sfx-merge/*.wav` (or extend `gen-sfx.mjs`)
- Update: `remotion/src/Root.tsx` (register third composition)
- Unchanged: `remotion/src/lib/timing.ts`, `remotion/src/components/Bar.tsx`, `remotion/src/components/GlassPanel.tsx`, `remotion/src/components/LiquidBackground.tsx`, `remotion/src/lib/theme.ts` (reused as-is)
