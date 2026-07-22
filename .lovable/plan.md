## Goal
Add synced step labels, sound effects, and visual effects to the existing 40s Liquid Glass insertion-sort short. Re-render to `/mnt/documents/insertion-sort-liquid-glass.mp4`.

## 1. On-screen step labels (synced to step clock)

New component `remotion/src/components/StepLabel.tsx` — a small glass pill floating above the bars, driven by the same `locateStep()` result already used by `BarsStage` and `CodePanel`, so it is structurally in sync.

Label map by `StepKind`:
- `pickStart` → "Next pass"
- `keyGrab` → "Pick key"
- `compare` → "Compare"
- `shift` → "Shift right"
- `decJ` → "Move left"
- `insert` → "Insert"
- `advance` → "Locked in"

Motion: on step change, old label fades/scales out (6f), new label springs in (`damping: 18, stiffness: 220`) with a subtle 2px sinusoidal float so it never freezes. Also shows `i`, `j`, `key` chips (mono font) inline for extra clarity. Rendered inside `MainVideo` between title and bars stage (around y=290 in canvas coords) so it doesn't collide with the code panel.

Intro shows "Insertion Sort" caption; outro shows "Complete".

## 2. VFX (visual effects)

Purely additive, all frame-driven (`interpolate`/`spring`), no `backdropFilter`:

- **Compare spark**: on `compare` steps, a thin animated connector line arcs between the key bar (i) and the compared bar (j) with a small glowing dot that travels along it (progress 0→1). Peach/pink stroke, fades out over the step.
- **Shift trail**: on `shift` steps, a soft motion-blur ghost (2–3 stacked, decreasing-opacity copies) trails behind the moving bar for the first ~60% of the step.
- **Insert impact**: on `insert` steps at p≈0.75, a radial ring pulse expands from the landing slot baseline (mint gradient, opacity 0.5→0) plus a 6-particle burst (small circles fanning up-and-out with gravity), signalling the lock-in.
- **Lock cascade sheen**: on `advance` after each pass, a diagonal light sheen sweeps across newly-locked bars (translateX gradient, 20f).
- **Final green cascade**: at frame ≥ 900, sequential mint glow pulses run left→right across all bars (staggered 6f each), matching the existing outro payoff.
- **Screen flash on final insert**: single subtle white radial bloom (opacity 0→0.25→0) over ~18f when the last element locks.
- **Persistent ambient**: keep existing pastel blob drift; add slow-moving 1% grain overlay (pre-rendered noise div, animated opacity) for filmic texture.

All effects are keyed off the same `steps[idx].kind` and `local` progress — no independent timers, so nothing can desync.

## 3. SFX (sound effects)

Generate a small library once, then place occurrences on step boundaries using Remotion `<Audio>` + `<Sequence from={...}>`. Generation strategy:

- **Preferred**: ElevenLabs Sound Effects via the connector (`ELEVENLABS_API_KEY`). One-off Node script `remotion/scripts/generate-sfx.mjs` calls `POST https://api.elevenlabs.io/v1/sound-generation` for each cue and writes MP3s into `remotion/public/sfx/`.
- **Fallback if the connector isn't linked**: synthesize the same cues offline with a tiny Node WAV generator (sine/triangle + envelope + light noise) so the render is never blocked. I'll ask before generation which path you want.

Cues (short, tasteful, all ≤ 0.5s except ambient):
- `pick.mp3` — soft glass "tick" (pickStart / keyGrab)
- `compare.mp3` — light "blip" (compare)
- `shift.mp3` — subtle woody "thock" with tiny whoosh (shift)
- `insert.mp3` — warm "clink" with short mint shimmer tail (insert)
- `lock.mp3` — bright "ding" (advance, final cascade)
- `whoosh_intro.mp3` — 0.6s riser (frame 0–20)
- `sparkle_outro.mp3` — 1.2s glassy sparkle (frame 1080)
- `ambient.mp3` — 40s soft airy pad, looped/volumed at ~0.15 gain (bed under whole video)

Placement: build a list `sfxEvents = steps.map((s, i) => ({ frame: SORT_START + clock.starts[i], kind: s.kind }))` and render `<Sequence from={frame}><Audio src={staticFile('sfx/…')} volume={0.6} /></Sequence>` for each. Small per-cue volume tuning so it never gets busy.

Rendering: switch the render script's `muted: true` to `muted: false`. The Nix ffmpeg lacks `libfdk_aac`, so use `audioCodec: 'aac'` (the default ffmpeg AAC encoder, which is present) in `renderMedia`; if that specific ffmpeg build still rejects AAC, fall back to `codec: 'h264'` + separate `renderMedia({ codec: 'wav' })` audio track and mux with `ffmpeg -c:a aac`. Verified before final render with a 2-second still test.

## 4. Files touched

- `remotion/src/components/StepLabel.tsx` (new)
- `remotion/src/components/VfxLayer.tsx` (new) — compare arc, shift trail, insert burst, sheen, final flash
- `remotion/src/components/SfxTrack.tsx` (new) — reads step clock, mounts `<Audio>` per event
- `remotion/src/MainVideo.tsx` — mount the three new layers, add intro/outro sfx, reposition title slightly to make room for label
- `remotion/scripts/generate-sfx.mjs` (new) — ElevenLabs generation, one-shot
- `remotion/public/sfx/*.mp3` (generated assets)
- `remotion/scripts/render-remotion.mjs` — `muted: false`, add `audioCodec: 'aac'`

## 5. Verification

- `bunx remotion still` at frames 130 (label mid-step), 500 (compare arc + trail), 850 (insert burst), 1100 (outro flash) — visually confirm.
- Short 2s test render with audio to confirm AAC path works.
- Full 40s render to `/mnt/documents/insertion-sort-liquid-glass.mp4`; report final size.

## Question before I build

Which SFX source do you want?
1. Generate via **ElevenLabs connector** (best quality; I'll link it if not already).
2. **Offline synthesized** cues (instant, no external call, slightly more utilitarian sound).