import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { FlatBackground } from "./components/FlatBackground";
import { GlassPanel } from "./components/GlassPanel";
import { ArrayRowTwoSum } from "./components/ArrayRowTwoSum";
import { ComplementChip } from "./components/ComplementChip";
import { HashMapContainer, MAP_W, MAP_H, slotCenter } from "./components/HashMapContainer";
import { CodePanelTwoSum } from "./components/CodePanelTwoSum";
import { ComplexityPanel } from "./components/ComplexityPanel";
import { StepLabelTwoSum } from "./components/StepLabelTwoSum";
import { VfxLayerTwoSum } from "./components/VfxLayerTwoSum";
import { SfxTrackTwoSum } from "./components/SfxTrackTwoSum";
import { buildSteps, NUMS, TARGET } from "./lib/two-sum";
import { buildStepClock, locateStep } from "./lib/timing";
import { theme } from "./lib/theme";

loadInter("normal", { weights: ["500", "700", "800"], subsets: ["latin"] });
loadMono("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });

const INTRO_END = 96;
const OUTRO_START = 1075;

const ROW_X = 60;
const ROW_Y = 330;
const GAP = 16;
const CELL_W = (960 - GAP * 5) / 6;
const CELL_H = 150;

const MAP_X = (1080 - MAP_W) / 2;
const MAP_Y = 700;

export const MainVideoTwoSum: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, durationInFrames, fps } = useVideoConfig();

  const steps = React.useMemo(() => buildSteps(NUMS, TARGET), []);
  const clock = React.useMemo(
    () => buildStepClock(steps.length, OUTRO_START - INTRO_END),
    [steps.length],
  );

  const inRun = frame >= INTRO_END && frame < OUTRO_START;
  const runFrame = Math.max(0, frame - INTRO_END);
  const { idx, local } = locateStep(runFrame, clock.starts, clock.durations);
  const step = inRun ? steps[Math.min(idx, steps.length - 1)] : frame >= OUTRO_START ? steps[steps.length - 1] : steps[0];
  const progress = inRun ? local : 1;

  const titleEnter = spring({ frame, fps, config: { damping: 20, stiffness: 140 } });
  const titleExit = interpolate(frame, [INTRO_END - 24, INTRO_END + 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = Math.min(titleEnter, titleExit);

  const cellCenter = (i: number) => ({
    x: ROW_X + i * (CELL_W + GAP) + CELL_W / 2,
    y: ROW_Y + CELL_H / 2,
  });
  const slotPos = (i: number) => {
    const c = slotCenter(Math.max(0, Math.min(5, i)));
    return { x: MAP_X + c.x, y: MAP_Y + c.y };
  };

  const outroEnter = spring({ frame: frame - OUTRO_START, fps, config: { damping: 20, stiffness: 150 } });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <FlatBackground />
      <SfxTrackTwoSum
        steps={steps}
        starts={clock.starts}
        sortStartFrame={INTRO_END}
        outroFrame={OUTRO_START}
        totalFrames={durationInFrames}
      />

      {/* title (intro) */}
      {titleOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: 88,
            left: 60,
            right: 60,
            opacity: titleOpacity,
            transform: `translateY(${(1 - titleEnter) * 26}px)`,
          }}
        >
          <GlassPanel style={{ padding: "26px 38px" }} radius={34}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 21,
                    color: theme.inkSoft,
                    fontWeight: 600,
                    letterSpacing: 2,
                  }}
                >
                  ARRAY · HASH MAP · O(n)
                </div>
                <div style={{ fontSize: 56, fontWeight: 800, color: theme.ink, letterSpacing: -1.5, marginTop: 4 }}>
                  Two Sum
                </div>
              </div>
              <div
                style={{
                  padding: "14px 24px",
                  borderRadius: 22,
                  background: "linear-gradient(135deg,#8FC3FF,#A78BFA)",
                  boxShadow: "0 12px 28px rgba(122,150,245,0.42), inset 0 2px 0 rgba(255,255,255,0.6)",
                  color: "white",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  fontSize: 30,
                }}
              >
                target = {TARGET}
              </div>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* step label */}
      {inRun && (
        <StepLabelTwoSum step={step} stepIndex={idx} progress={progress} x={60} y={120} width={width - 120} />
      )}

      {/* outro answer badge */}
      {frame >= OUTRO_START - 10 && (
        <div
          style={{
            position: "absolute",
            top: 110,
            left: 60,
            right: 60,
            display: "flex",
            justifyContent: "center",
            opacity: outroEnter,
            transform: `translateY(${(1 - outroEnter) * 20}px)`,
          }}
        >
          <div
            style={{
              padding: "18px 40px",
              borderRadius: 999,
              background: "linear-gradient(135deg,#7EE7C7,#4CC0A0)",
              boxShadow: "0 20px 44px rgba(76,192,160,0.40), inset 0 2px 0 rgba(255,255,255,0.55)",
              color: "white",
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: 44,
              letterSpacing: -1,
            }}
          >
            answer = [{step.matched[0]}, {step.matched[1]}] · one pass
          </div>
        </div>
      )}

      {/* target strip while running */}
      {frame >= INTRO_END - 10 && (
        <div
          style={{
            position: "absolute",
            top: 248,
            left: 60,
            right: 60,
            display: "flex",
            justifyContent: "center",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 26,
            fontWeight: 600,
            color: theme.inkSoft,
          }}
        >
          nums · target = {TARGET}
        </div>
      )}

      <ArrayRowTwoSum
        nums={NUMS}
        step={step}
        progress={progress}
        x={ROW_X}
        y={ROW_Y}
        cellW={CELL_W}
        cellH={CELL_H}
        gap={GAP}
        intro={!inRun && frame < INTRO_END}
      />

      <ComplementChip step={step} progress={progress} target={TARGET} x={60} y={560} width={width - 120} />

      <HashMapContainer step={step} progress={progress} x={MAP_X} y={MAP_Y} />

      <VfxLayerTwoSum step={step} progress={progress} cellCenter={cellCenter} slotPos={slotPos} />

      <CodePanelTwoSum step={step} progress={progress} x={60} y={MAP_Y + MAP_H + 34} width={width - 120} height={470} />

      <ComplexityPanel x={60} y={MAP_Y + MAP_H + 34 + 470 + 24} width={width - 120} height={158} appearFrame={44} />
    </AbsoluteFill>
  );
};
