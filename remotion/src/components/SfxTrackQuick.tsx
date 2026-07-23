import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { SortStep, StepKind } from "../lib/sort-quick";

// Reuses existing sfx files from the insertion-sort short.
const SFX: Partial<Record<StepKind, { file: string; volume: number }>> = {
  pickPivot: { file: "sfx/pick.wav", volume: 0.55 },
  setBounds: { file: "sfx/pick.wav", volume: 0.25 },
  scanStart: { file: "sfx/compare.wav", volume: 0.25 },
  compare: { file: "sfx/compare.wav", volume: 0.35 },
  swap: { file: "sfx/shift.wav", volume: 0.55 },
  pivotSwap: { file: "sfx/insert.wav", volume: 0.75 },
  recurseLeft: { file: "sfx/pick.wav", volume: 0.4 },
  recurseRight: { file: "sfx/pick.wav", volume: 0.4 },
  done: { file: "sfx/lock.wav", volume: 0.5 },
};

export const SfxTrackQuick: React.FC<{
  steps: SortStep[];
  starts: number[];
  sortStartFrame: number;
  introFrame: number;
  outroFrame: number;
  totalFrames: number;
}> = ({ steps, starts, sortStartFrame, introFrame, outroFrame, totalFrames }) => {
  return (
    <>
      <Audio src={staticFile("sfx/ambient.wav")} volume={0.28} />

      <Sequence from={introFrame} durationInFrames={30}>
        <Audio src={staticFile("sfx/whoosh_intro.wav")} volume={0.55} />
      </Sequence>

      {steps.map((s, i) => {
        const cue = SFX[s.kind];
        if (!cue) return null;
        const at = sortStartFrame + Math.round(starts[i]);
        if (at >= totalFrames) return null;
        // Fade compare volume down as steps accelerate to avoid clutter.
        const vol =
          s.kind === "compare" && i > 30 ? cue.volume * 0.5 : cue.volume;
        return (
          <Sequence key={i} from={at} durationInFrames={Math.max(1, totalFrames - at)}>
            <Audio src={staticFile(cue.file)} volume={vol} />
          </Sequence>
        );
      })}

      <Sequence from={outroFrame} durationInFrames={Math.max(1, totalFrames - outroFrame)}>
        <Audio src={staticFile("sfx/sparkle_outro.wav")} volume={0.6} />
      </Sequence>
    </>
  );
};