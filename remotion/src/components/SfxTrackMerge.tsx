import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { SortStep, StepKind } from "../lib/sort-merge";

const SFX: Partial<Record<StepKind, { file: string; volume: number }>> = {
  split: { file: "sfx/pick.wav", volume: 0.5 },
  recurseLeft: { file: "sfx/pick.wav", volume: 0.28 },
  recurseRight: { file: "sfx/pick.wav", volume: 0.28 },
  mergeStart: { file: "sfx/whoosh_intro.wav", volume: 0.32 },
  compare: { file: "sfx/compare.wav", volume: 0.35 },
  takeLeft: { file: "sfx/shift.wav", volume: 0.5 },
  takeRight: { file: "sfx/shift.wav", volume: 0.5 },
  copyBack: { file: "sfx/shift.wav", volume: 0.4 },
  mergeDone: { file: "sfx/insert.wav", volume: 0.75 },
  done: { file: "sfx/lock.wav", volume: 0.5 },
};

export const SfxTrackMerge: React.FC<{
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
        let vol = cue.volume;
        if (s.kind === "compare" && i > 40) vol *= 0.5;
        if ((s.kind === "recurseLeft" || s.kind === "recurseRight") && i > 30) vol *= 0.5;
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