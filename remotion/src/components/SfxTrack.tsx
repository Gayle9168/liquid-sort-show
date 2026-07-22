import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { SortStep, StepKind } from "../lib/sort";

const SFX: Partial<Record<StepKind, { file: string; volume: number }>> = {
  pickStart: { file: "sfx/pick.wav", volume: 0.35 },
  keyGrab: { file: "sfx/pick.wav", volume: 0.5 },
  compare: { file: "sfx/compare.wav", volume: 0.35 },
  shift: { file: "sfx/shift.wav", volume: 0.5 },
  insert: { file: "sfx/insert.wav", volume: 0.65 },
  advance: { file: "sfx/lock.wav", volume: 0.5 },
};

export const SfxTrack: React.FC<{
  steps: SortStep[];
  starts: number[];
  sortStartFrame: number;
  introFrame: number;
  outroFrame: number;
  totalFrames: number;
}> = ({ steps, starts, sortStartFrame, introFrame, outroFrame, totalFrames }) => {
  return (
    <>
      {/* ambient bed */}
      <Audio src={staticFile("sfx/ambient.wav")} volume={0.28} />

      {/* intro riser */}
      <Sequence from={introFrame} durationInFrames={30}>
        <Audio src={staticFile("sfx/whoosh_intro.wav")} volume={0.55} />
      </Sequence>

      {/* per-step cues */}
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

      {/* outro sparkle */}
      <Sequence from={outroFrame} durationInFrames={Math.max(1, totalFrames - outroFrame)}>
        <Audio src={staticFile("sfx/sparkle_outro.wav")} volume={0.6} />
      </Sequence>
    </>
  );
};