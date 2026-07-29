import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { LiquidBackground } from "./components/LiquidBackground";
import { GlassPanel } from "./components/GlassPanel";
import { HeapTree } from "./components/HeapTree";
import { BarsStageHeap } from "./components/BarsStageHeap";
import { CodePanelHeap } from "./components/CodePanelHeap";
import { StepLabelHeap } from "./components/StepLabelHeap";
import { VfxLayerHeap } from "./components/VfxLayerHeap";
import { SfxTrackHeap } from "./components/SfxTrackHeap";
import { buildSteps, SortStep } from "./lib/sort-heap";
import { buildStepClock, locateStep } from "./lib/timing";
import { theme } from "./lib/theme";

loadInter("normal", { weights: ["500", "700", "800"], subsets: ["latin"] });
loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] });

const INITIAL = [4, 10, 3, 5, 1, 15, 2];
const N = INITIAL.length;

const INTRO_END = 90;
const OUTRO_START = 1080;
const SORT_START = INTRO_END;
const SORT_END = OUTRO_START;

export const MainVideoHeap: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  const steps = React.useMemo(() => buildSteps(INITIAL), []);
  const clock = React.useMemo(() => buildStepClock(steps.length, SORT_END - SORT_START), [steps.length]);

  // tree geometry
  const treeCenterX = width / 2;
  const treeTopY = 500;
  const treeLevelH = 175;
  const treeSpanX = 900;
  const nodeRadius = 56;

  // array geometry (below tree)
  const stageWidth = 980;
  const originX = (width - stageWidth) / 2;
  const slotW = stageWidth / N;
  const cellW = slotW - 14;
  const cellH = 100;
  const arrayY = 1170;

  const inSort = frame >= SORT_START && frame < SORT_END;
  const sortFrame = Math.max(0, frame - SORT_START);
  const { idx, local } = locateStep(sortFrame, clock.starts, clock.durations);
  const curr = steps[Math.min(idx, steps.length - 1)];
  const prev = steps[Math.max(0, Math.min(idx - 1, steps.length - 1))];

  const titleEnter = spring({ frame, fps, config: { damping: 20, stiffness: 140 } });
  const titleExit = interpolate(frame, [INTRO_END - 20, INTRO_END + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOpacity = Math.min(titleEnter, titleExit);
  const outroEnter = spring({ frame: frame - OUTRO_START, fps, config: { damping: 20, stiffness: 140 } });

  const fallback: SortStep = { kind: "buildStart", arr: [...INITIAL], i: 0, left: -1, right: -1, largest: 0, heapEnd: N, active: [], locked: [], edgeActive: null, pass: 0, phase: "build", codeLine: 0 };
  const displayStep = inSort ? curr : (frame >= SORT_END ? steps[steps.length - 1] : fallback);
  const displayPrev = inSort ? prev : displayStep;
  const displayProgress = inSort ? local : 1;

  const lastExtractIdx = React.useMemo(() => {
    for (let i = steps.length - 1; i >= 0; i--) if (steps[i].kind === "extract" || steps[i].kind === "lock") return i;
    return -1;
  }, [steps]);
  const lastExtractFrame = lastExtractIdx >= 0 ? SORT_START + clock.starts[lastExtractIdx] : OUTRO_START;
  const finalFlashActive = frame >= lastExtractFrame && frame <= lastExtractFrame + 24;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <LiquidBackground />
      <SfxTrackHeap
        steps={steps}
        starts={clock.starts}
        sortStartFrame={SORT_START}
        introFrame={0}
        outroFrame={OUTRO_START}
        totalFrames={durationInFrames}
      />

      {/* Title */}
      <div style={{ position: "absolute", top: 90, left: 60, right: 60, opacity: titleOpacity, transform: `translateY(${(1 - titleEnter) * 30}px)` }}>
        <GlassPanel style={{ padding: "28px 40px" }} radius={36}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: theme.inkSoft, fontWeight: 500, letterSpacing: 2 }}>
                ALGORITHM · O(n log n)
              </div>
              <div style={{ fontSize: 56, fontWeight: 800, color: theme.ink, letterSpacing: -1.5, marginTop: 4 }}>
                Heap Sort
              </div>
            </div>
            <div style={{
              width: 72, height: 72, borderRadius: 24,
              background: `linear-gradient(135deg, ${theme.bar.locked[0]}, ${theme.bar.locked[1]})`,
              boxShadow: "0 12px 30px rgba(88,199,163,0.45), inset 0 2px 0 rgba(255,255,255,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, fontWeight: 800, color: "white",
            }}>♛</div>
          </div>
        </GlassPanel>
      </div>

      {/* Tree panel background */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 400, height: 700 }}>
        <GlassPanel style={{ width: "100%", height: "100%" }} radius={40}>
          <div style={{ position: "absolute", top: 22, left: 30, fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: theme.inkSoft, fontWeight: 500, letterSpacing: 1 }}>
            BINARY HEAP · MAX
          </div>
        </GlassPanel>
      </div>

      {/* Tree graph */}
      <div style={{ position: "absolute", top: 0, left: 0, width, height }}>
        <HeapTree
          step={displayStep}
          progress={displayProgress}
          n={N}
          centerX={treeCenterX}
          topY={treeTopY}
          levelH={treeLevelH}
          spanX={treeSpanX}
          radius={nodeRadius}
        />

        {/* array rail */}
        <div style={{
          position: "absolute", left: originX - 10, top: arrayY - 10, width: stageWidth + 20, height: cellH + 40,
          borderRadius: 24, background: "rgba(255,255,255,0.35)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 20px rgba(120,130,180,0.15)",
        }} />
        <BarsStageHeap
          step={displayStep}
          progress={displayProgress}
          n={N}
          originX={originX}
          originY={arrayY}
          slotW={slotW}
          cellW={cellW}
          cellH={cellH}
        />

        {inSort && (
          <VfxLayerHeap
            step={displayStep}
            progress={displayProgress}
            finalFlashActive={finalFlashActive}
          />
        )}
      </div>

      {/* Step label */}
      {inSort && (
        <StepLabelHeap step={displayStep} stepIndex={idx} progress={displayProgress} x={60} y={340} width={width - 120} />
      )}

      {/* Code panel */}
      <CodePanelHeap step={displayStep} progress={displayProgress} x={60} y={1370} width={width - 120} height={500} />

      {/* Outro */}
      {frame >= OUTRO_START - 6 && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 320, left: 60, right: 60, transform: `translateY(${(1 - outroEnter) * 40}px)`, opacity: outroEnter }}>
            <GlassPanel style={{ padding: "40px 48px" }} radius={40}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, color: theme.inkSoft, fontWeight: 500, letterSpacing: 2 }}>
                COMPLETE
              </div>
              <div style={{
                fontSize: 96, fontWeight: 800, color: theme.ink, letterSpacing: -3, marginTop: 8,
                background: `linear-gradient(135deg, ${theme.bar.locked[0]}, ${theme.bar.locked[1]})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Sorted.</div>
              <div style={{ fontSize: 26, color: theme.inkSoft, marginTop: 8, fontWeight: 500 }}>
                {steps.length} steps · {N} nodes · in-place heap sort
              </div>
            </GlassPanel>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};