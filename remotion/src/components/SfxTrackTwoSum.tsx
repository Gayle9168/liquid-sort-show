import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { TwoSumStep, StepKind } from "../lib/two-sum";

const SFX: Partial<Record<StepKind, { file: string; volume: number }>> = {
  visit: { file: "sfx/pick.wav", volume: 0.45 },
  complement: { file: "sfx/compare.wav", volume: 0.35 },
  lookup: { file: "sfx/shift.wav", volume: 0.4 },
  store: { file: "sfx/insert.wav", volume: 0.6 },
  found: { file: "sfx/lock.wav", volume: 0.7 },
  result: { file: "sfx/sparkle_outro.wav", volume: 0.5 },
};

export const SfxTrackTwoSum: React.FC<{
  steps: TwoSumStep[];
  starts: number[];
  sortStartFrame: number;
  outroFrame: number;
  totalFrames: number;
}> = ({ steps, starts, sortStartFrame, outroFrame, totalFrames }) => (
  <>
    <Audio src={staticFile("sfx/ambient.wav")} volume={0.26} />
    <Sequence from={0} durationInFrames={30}>
      <Audio src={staticFile("sfx/whoosh_intro.wav")} volume={0.55} />
    </Sequence>
    {steps.map((s, i) => {
      const cue = SFX[s.kind];
      if (!cue) return null;
      const at = sortStartFrame + Math.round(starts[i]);
      if (at >= totalFrames) return null;
      return (
        <Sequence key={i} from={at} durationInFrames={Math.max(1, totalFrames - at)}>
          <Audio src={staticFile(cue.file)} volume={cue.volume} />
        </Sequence>
      );
    })}
    <Sequence from={outroFrame} durationInFrames={Math.max(1, totalFrames - outroFrame)}>
      <Audio src={staticFile("sfx/sparkle_outro.wav")} volume={0.55} />
    </Sequence>
  </>
);
