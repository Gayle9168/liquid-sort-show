import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { MzStep, MzKind } from "../lib/move-zeroes";

const SFX: Partial<Record<MzKind, { file: string; volume: number }>> = {
  scan: { file: "sfx/pick.wav", volume: 0.42 },
  skip: { file: "sfx/compare.wav", volume: 0.36 },
  place: { file: "sfx/insert.wav", volume: 0.6 },
  result: { file: "sfx/lock.wav", volume: 0.7 },
};

export const SfxTrackMz: React.FC<{
  steps: MzStep[];
  starts: number[];
  runStartFrame: number;
  outroFrame: number;
  totalFrames: number;
}> = ({ steps, starts, runStartFrame, outroFrame, totalFrames }) => (
  <>
    <Audio src={staticFile("sfx/ambient.wav")} volume={0.26} />
    <Sequence from={0} durationInFrames={30}>
      <Audio src={staticFile("sfx/whoosh_intro.wav")} volume={0.55} />
    </Sequence>
    {steps.map((s, i) => {
      const cue = SFX[s.kind];
      if (!cue) return null;
      const at = runStartFrame + Math.round(starts[i]);
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