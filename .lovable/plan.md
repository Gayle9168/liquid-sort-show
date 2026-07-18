# Insertion Sort — Liquid Glass Short (9:16, 40s) — Light Edition

A world-class, satisfying motion piece rendered with Remotion. Bars and code line highlight stay perfectly synced. Pass 1 runs slowly (teaching beat), then the algorithm smoothly accelerates with no freezes and a clean landing frame. **Light, airy Liquid Glass palette — no dark, no black backgrounds.**

## Deliverable
- File: `/mnt/documents/insertion-sort-liquid-glass.mp4`
- 1080 x 1920, 30 fps, 1200 frames (40.00s), H.264, muted
- Source saved under `remotion/` in the project (re-renderable next session)

## Creative direction — Light Liquid Glass
- Background: soft pearl gradient `#F6F1FF → #EAF3FF → #FFF0F6` with a slow-drifting aurora of pastel blobs (peach `#FFD6C2`, sky `#BFE0FF`, lilac `#E4D4FF`, mint `#CFF3E1`) pre-blurred behind the glass — never pure white, never dark
- Glass surface: `rgba(255,255,255,0.55)` fill, 1px inner border `rgba(255,255,255,0.85)`, top specular highlight, faint noise, subtle iOS-style shadow `0 30px 60px rgba(120,130,180,0.18)`
- Bars:
  - Idle: gradient `#7AB8FF → #A78BFA` (sky → lilac), inner highlight, soft violet shadow
  - Active/compare: `#FFB199 → #FF7EB3` (peach → pink)
  - Locked/sorted: `#7EE7C7 → #58C7A3` (mint), soft green glow
- Type: **Inter** 700 (display) + **JetBrains Mono** 500/700 (code) via `@remotion/google-fonts`, ink color `#1E2340` (near-black text on light — NOT a black background)
- Liquid-glass recipe (sandbox-safe, NO `backdropFilter`): pre-blurred pastel blob layer under every glass panel (`filter: blur(60px)`), used on 2–3 elements max to avoid headless-Chromium crashes
- Motion vocabulary:
  - Entrances: spring `{ damping: 22, stiffness: 180 }`
  - Bar lift/settle: spring `{ damping: 14, stiffness: 140 }` (gel-like overshoot)
  - Swaps use arc paths (rise → translate → settle), not linear slides
  - Persistent ±2px sinusoidal float on all bars so nothing looks frozen

## Timing (1200 frames)
```text
[0–90]     Intro glass card slides up, array materializes
[90–450]   Pass 1 SLOW (teaching pace, ~2.5x slower)
[450–900]  Passes 2–5 smoothly ramp to ~1x then ~0.6x
[900–1080] Final pass + green "locked-in" cascade
[1080–1200] Outro: pulse + "Sorted." title, gentle drift hold
```
Speed ramp is a single `interpolate(progress, [0,0.25,1], [1, 0.5, 0.18], easeInOut)` on per-step frame budgets — monotonic, no hard gear shifts, no freezes.

## Sort choreography
- Array: 8 values `[7, 3, 5, 8, 2, 6, 4, 1]`
- Steps precomputed once as keyframe records: `pick → compare → shift → insert → advance`
- Same step index drives BOTH bar animation AND code line highlight — sync is structural, not timed

## Code panel (synced)
```js
for (let i = 1; i < a.length; i++) {
  let key = a[i], j = i - 1;
  while (j >= 0 && a[j] > key) {
    a[j + 1] = a[j];
    j--;
  }
  a[j + 1] = key;
}
```
- Active line: animated glass highlight bar (spring width) + bolder ink
- Inline chip shows live `i`, `j`, `key` values per step

## File structure
```
remotion/
  package.json, tsconfig.json
  scripts/render-remotion.mjs
  src/
    index.ts
    Root.tsx                 # <Composition id="main" 1080x1920 30fps 1200f>
    MainVideo.tsx            # persistent bg + TransitionSeries
    lib/{sort.ts,timing.ts,theme.ts}
    components/
      LiquidBackground.tsx   # pearl gradient + drifting pastel blobs
      GlassPanel.tsx
      Bar.tsx
      BarsStage.tsx          # reads step clock
      CodePanel.tsx          # synced line highlight + var chip
      TitleCard.tsx
    scenes/{Intro,SortRun,Outro}.tsx
  public/  (empty)
```

## Sandbox render pipeline
- `bun install` Remotion + `@remotion/transitions`, `@remotion/google-fonts`, `@remotion/compositor-linux-x64-musl`
- Overwrite gnu compositor binary with musl and symlink system `ffmpeg`/`ffprobe`
- Render via `scripts/render-remotion.mjs`: `chromeMode: "chrome-for-testing"`, `muted: true`, `concurrency: 1`
- NO `backdropFilter` — pre-blurred blob layers only
- Spot-check frames at 60, 300, 700, 1050 with `bunx remotion still` before full render

## Quality guardrails
- Continuous motion on every element (float/drift) — zero frozen frames
- One motion vocabulary throughout (spring entrances, arc swaps, sheen sweep)
- Bars + code highlight driven off the same step index (perfect sync)
- Speed ramp is smooth easeInOut (feels like getting into a groove)
- Final green cascade + 4s hold as the emotional payoff

Ready to build on approval.