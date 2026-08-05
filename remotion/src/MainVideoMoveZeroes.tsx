import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { FlatBackground } from "./components/FlatBackground";
import { GlassPanel } from "./components/GlassPanel";
import { ArrayRowMz } from "./components/ArrayRowMz";
import { PointerTrackMz } from "./components/PointerTrackMz";
import { StepLabelMz } from "./components/StepLabelMz";
import { CodePanelMz } from "./components/CodePanelMz";
import { VfxLayerMz } from "./components/VfxLayerMz";
import { SfxTrackMz } from "./components/SfxTrackMz";
import { ComplexityGraphMz } from "./components/ComplexityGraphMz";
import { buildMzSteps, NUMS_MZ } from "./lib/move-zeroes";
import { buildStepClock, locateStep } from "./lib/timing";
import { theme } from "./lib/theme";

loadInter("normal", { weights: ["500", "700", "800"], subsets: ["latin"] });
loadMono("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });

const INTRO_END = 78;
const OUTRO_START = 750; // last 5s (150 frames) = complexity graph

const ROW_X = 60;
const ROW_Y = 470;
const GAP = 16;
const CELL_W = (960 - GAP * 5) / 6;
const CELL_H = 190;

export const MainVideoMoveZeroes: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, durationInFrames, fps } = useVideoConfig();

  const steps = React.useMemo(() => buildMzSteps(NUMS_MZ), []);
  const clock = React.useMemo(
    () => buildStepClock(steps.length, OUTRO_START - INTRO_END),
    [steps.length],
  );

  const inRun = frame >= INTRO_END && frame < OUTRO_START;
  const runFrame = Math.max(0, frame - INTRO_END);
  const { idx, local } = locateStep(runFrame, clock.starts, clock.durations);
  const stepIdx = inRun ? Math.min(idx, steps.length - 1) : frame >= OUTRO_START ? steps.length - 1 : 0;
  const step = steps[stepIdx];
  const progress = inRun ? local : 1;
  const stepStartFrame = INTRO_END + Math.round(clock.starts[stepIdx] ?? 0);

  const titleEnter = spring({ frame, fps, config: { damping: 20, stiffness: 140 } });
  const titleExit = interpolate(frame, [INTRO_END - 22, INTRO_END + 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = Math.min(titleEnter, titleExit);

  const cellCenter = (i: number) => ({
    x: ROW_X + Math.max(0, Math.min(5, i)) * (CELL_W + GAP) + CELL_W / 2,
    y: ROW_Y + CELL_H / 2,
  });

  const stageFade = interpolate(frame, [OUTRO_START - 4, OUTRO_START + 22], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <FlatBackground />
      <SfxTrackMz
        steps={steps}
        starts={clock.starts}
        runStartFrame={INTRO_END}
        outroFrame={OUTRO_START}
        totalFrames={durationInFrames}
      />

      {/* title */}
      {titleOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: 96,
            left: 60,
            right: 60,
            opacity: titleOpacity,
            transform: `translateY(${(1 - titleEnter) * 26}px)`,
          }}
        >
          <GlassPanel style={{ padding: "28px 40px" }} radius={34}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
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
                  ARRAY · TWO POINTERS · O(n)
                </div>
                <div style={{ fontSize: 58, fontWeight: 800, color: theme.ink, letterSpacing: -1.6, marginTop: 4 }}>
                  Move Zeroes
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
                  fontSize: 26,
                  textAlign: "center",
                }}
              >
                in place
              </div>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* running stage */}
      <div style={{ opacity: stageFade }}>
        {frame >= INTRO_END - 12 && (
          <StepLabelMz step={step} stepIndex={stepIdx} progress={progress} x={60} y={130} width={width - 120} />
        )}

        <div
          style={{
            position: "absolute",
            top: 300,
            left: 60,
            right: 60,
            textAlign: "center",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 30,
            fontWeight: 600,
            color: theme.inkSoft,
            opacity: frame >= INTRO_END - 12 ? 1 : 0,
          }}
        >
          push every 0 to the end · keep non-zero order
        </div>

        <ArrayRowMz
          step={step}
          progress={progress}
          x={ROW_X}
          y={ROW_Y}
          cellW={CELL_W}
          cellH={CELL_H}
          gap={GAP}
          intro={frame < INTRO_END}
        />

        <VfxLayerMz step={step} progress={progress} cellCenter={cellCenter} />

        {frame >= INTRO_END - 12 && (
          <PointerTrackMz
            read={step.read}
            write={step.write}
            x={ROW_X}
            y={ROW_Y + CELL_H + 60}
            cellW={CELL_W}
            gap={GAP}
            count={6}
            stepStartFrame={stepStartFrame}
          />
        )}

        {/* caption */}
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 1010,
            width: width - 120,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              padding: "16px 32px",
              borderRadius: 24,
              background: "rgba(255,255,255,0.72)",
              boxShadow: "0 14px 30px rgba(120,130,180,0.16), inset 0 0 0 1.5px rgba(255,255,255,0.9)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 27,
              fontWeight: 600,
              color: theme.ink,
              textAlign: "center",
            }}
          >
            {step.caption}
          </div>
        </div>

        <CodePanelMz step={step} progress={progress} x={60} y={1130} width={width - 120} height={470} />

        {/* array state readout */}
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 1640,
            width: width - 120,
            display: "flex",
            justifyContent: "center",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 34,
            fontWeight: 700,
            color: theme.ink,
            letterSpacing: 1,
          }}
        >
          [{step.arr.join(", ")}]
        </div>
      </div>

      {/* outro: complexity graph */}
      {frame >= OUTRO_START - 10 && (
        <>
          <ComplexityGraphMz x={60} y={470} appearFrame={OUTRO_START} />
          <div
            style={{
              position: "absolute",
              left: 60,
              top: 240,
              width: width - 120,
              display: "flex",
              justifyContent: "center",
              opacity: interpolate(frame, [OUTRO_START, OUTRO_START + 16], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                padding: "20px 44px",
                borderRadius: 999,
                background: "linear-gradient(135deg,#7EE7C7,#4CC0A0)",
                boxShadow: "0 22px 46px rgba(76,192,160,0.40), inset 0 2px 0 rgba(255,255,255,0.55)",
                color: "white",
                fontWeight: 800,
                fontSize: 44,
                letterSpacing: -1,
              }}
            >
              [{steps[steps.length - 1].arr.join(", ")}]
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 60,
              top: 1400,
              width: width - 120,
              textAlign: "center",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 28,
              fontWeight: 600,
              color: theme.inkSoft,
              opacity: interpolate(frame, [OUTRO_START + 60, OUTRO_START + 90], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            n elements · one scan · zero extra memory
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};