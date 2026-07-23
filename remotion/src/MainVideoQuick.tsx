import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { LiquidBackground } from "./components/LiquidBackground";
import { GlassPanel } from "./components/GlassPanel";
import { BarsStageQuick } from "./components/BarsStageQuick";
import { CodePanelQuick } from "./components/CodePanelQuick";
import { StepLabelQuick } from "./components/StepLabelQuick";
import { VfxLayerQuick } from "./components/VfxLayerQuick";
import { SfxTrackQuick } from "./components/SfxTrackQuick";
import { buildSteps } from "./lib/sort-quick";
import { buildStepClock, locateStep } from "./lib/timing";
import { theme } from "./lib/theme";

loadInter("normal", { weights: ["500", "700", "800"], subsets: ["latin"] });
loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] });

const INITIAL = [7, 3, 5, 8, 2, 6, 4, 1];
const N = INITIAL.length;
const MAX = Math.max(...INITIAL);

const INTRO_END = 90;
const OUTRO_START = 1080;
const SORT_START = INTRO_END;
const SORT_END = OUTRO_START;

export const MainVideoQuick: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  const steps = React.useMemo(() => buildSteps(INITIAL), []);
  const clock = React.useMemo(
    () => buildStepClock(steps.length, SORT_END - SORT_START),
    [steps.length],
  );

  const stageWidth = 940;
  const originX = (width - stageWidth) / 2;
  const slotW = stageWidth / N;
  const barW = slotW - 22;
  const originY = 1160;

  const inSort = frame >= SORT_START && frame < SORT_END;
  const sortFrame = Math.max(0, frame - SORT_START);
  const { idx, local } = locateStep(sortFrame, clock.starts, clock.durations);
  const curr = steps[Math.min(idx, steps.length - 1)];
  const prev = steps[Math.max(0, Math.min(idx - 1, steps.length - 1))];

  const introBars = frame < SORT_START;

  const titleEnter = spring({ frame, fps, config: { damping: 20, stiffness: 140 } });
  const titleExit = interpolate(frame, [INTRO_END - 20, INTRO_END + 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = Math.min(titleEnter, titleExit);

  const outroEnter = spring({
    frame: frame - OUTRO_START,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  const displayStep = inSort
    ? curr
    : frame >= SORT_END
      ? steps[steps.length - 1]
      : {
          kind: "setBounds" as const,
          arr: [...INITIAL],
          lo: 0,
          hi: N - 1,
          pivotIndex: N - 1,
          pivotValue: INITIAL[N - 1],
          i: -1,
          j: 0,
          active: [],
          locked: [],
          rangeStack: [],
          pass: 0,
          codeLine: 0,
        };
  const displayPrev = inSort ? prev : displayStep;
  const displayProgress = inSort ? local : 1;

  const lastPivotIdx = React.useMemo(() => {
    for (let i = steps.length - 1; i >= 0; i--)
      if (steps[i].kind === "pivotSwap") return i;
    return -1;
  }, [steps]);
  const lastPivotFrame =
    lastPivotIdx >= 0 ? SORT_START + clock.starts[lastPivotIdx] : OUTRO_START;
  const finalFlashActive = frame >= lastPivotFrame && frame <= lastPivotFrame + 24;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <LiquidBackground />

      <SfxTrackQuick
        steps={steps}
        starts={clock.starts}
        sortStartFrame={SORT_START}
        introFrame={0}
        outroFrame={OUTRO_START}
        totalFrames={durationInFrames}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 60,
          right: 60,
          opacity: titleOpacity,
          transform: `translateY(${(1 - titleEnter) * 30}px)`,
        }}
      >
        <GlassPanel style={{ padding: "28px 40px" }} radius={36}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 22,
                  color: theme.inkSoft,
                  fontWeight: 500,
                  letterSpacing: 2,
                }}
              >
                ALGORITHM · O(n log n)
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  color: theme.ink,
                  letterSpacing: -1.5,
                  marginTop: 4,
                }}
              >
                Quick Sort
              </div>
            </div>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                background: `linear-gradient(135deg, ${theme.bar.active[0]}, ${theme.bar.active[1]})`,
                boxShadow:
                  "0 12px 30px rgba(255,126,179,0.45), inset 0 2px 0 rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                fontWeight: 800,
                color: "white",
              }}
            >
              ⚡
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Bars stage */}
      <div style={{ position: "absolute", top: 0, left: 0, width, height }}>
        <div
          style={{
            position: "absolute",
            left: originX,
            top: originY - 10,
            width: stageWidth,
            height: 30,
            background:
              "radial-gradient(ellipse at center, rgba(80,90,140,0.22), rgba(80,90,140,0) 70%)",
            filter: "blur(8px)",
          }}
        />

        {introBars ? (
          <IntroBars
            arr={INITIAL}
            n={N}
            originX={originX}
            originY={originY}
            slotW={slotW}
            barW={barW}
            maxValue={MAX}
          />
        ) : (
          <BarsStageQuick
            prev={displayPrev}
            curr={displayStep}
            progress={displayProgress}
            n={N}
            originX={originX}
            originY={originY}
            slotW={slotW}
            barW={barW}
            maxValue={MAX}
            appearBaseFrame={-30}
          />
        )}

        <div
          style={{
            position: "absolute",
            left: originX,
            top: originY,
            width: stageWidth,
            height: 2,
            background:
              "linear-gradient(90deg, rgba(120,130,180,0) 0%, rgba(120,130,180,0.4) 50%, rgba(120,130,180,0) 100%)",
          }}
        />

        {inSort && (
          <VfxLayerQuick
            step={displayStep}
            progress={displayProgress}
            n={N}
            originX={originX}
            originY={originY}
            slotW={slotW}
            maxValue={MAX}
            finalFlashActive={finalFlashActive}
          />
        )}
      </div>

      {inSort && (
        <StepLabelQuick
          step={displayStep}
          stepIndex={idx}
          progress={displayProgress}
          x={40}
          y={340}
          width={width - 80}
        />
      )}

      <CodePanelQuick
        step={displayStep}
        progress={displayProgress}
        x={60}
        y={1230}
        width={width - 120}
        height={640}
      />

      {frame >= OUTRO_START - 6 && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: 300,
              left: 60,
              right: 60,
              transform: `translateY(${(1 - outroEnter) * 40}px)`,
              opacity: outroEnter,
            }}
          >
            <GlassPanel style={{ padding: "40px 48px" }} radius={40}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 24,
                  color: theme.inkSoft,
                  fontWeight: 500,
                  letterSpacing: 2,
                }}
              >
                COMPLETE
              </div>
              <div
                style={{
                  fontSize: 96,
                  fontWeight: 800,
                  color: theme.ink,
                  letterSpacing: -3,
                  marginTop: 8,
                  background: `linear-gradient(135deg, ${theme.bar.locked[0]}, ${theme.bar.locked[1]})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Sorted.
              </div>
              <div
                style={{
                  fontSize: 26,
                  color: theme.inkSoft,
                  marginTop: 8,
                  fontWeight: 500,
                }}
              >
                {steps.length} steps · {N} elements · divide & conquer
              </div>
            </GlassPanel>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const IntroBars: React.FC<{
  arr: number[];
  n: number;
  originX: number;
  originY: number;
  slotW: number;
  barW: number;
  maxValue: number;
}> = ({ arr, originX, originY, slotW, barW, maxValue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {arr.map((v, i) => {
        const appearAt = 20 + i * 5;
        const enter = spring({
          frame: frame - appearAt,
          fps,
          config: { damping: 14, stiffness: 140 },
        });
        const scale = interpolate(enter, [0, 1], [0.3, 1]);
        const opacity = interpolate(enter, [0, 1], [0, 1]);
        const height = (v / maxValue) * 700;
        const float = Math.sin((frame + i * 7) / 22) * 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: originX + i * slotW + slotW / 2 - barW / 2,
              top: originY - height + float,
              width: barW,
              height,
              transform: `scale(${scale})`,
              transformOrigin: "50% 100%",
              opacity,
              borderRadius: 26,
              background: `linear-gradient(180deg, #7AB8FF 0%, #A78BFA 100%)`,
              boxShadow:
                "0 18px 36px rgba(167,139,250,0.28), inset 0 2px 0 rgba(255,255,255,0.55)",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: 0,
                right: 0,
                textAlign: "center",
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: 44,
                color: "white",
                textShadow: "0 2px 6px rgba(30,35,64,0.25)",
              }}
            >
              {v}
            </div>
          </div>
        );
      })}
    </>
  );
};