import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { SortStep, StepKind } from "../lib/sort-heap";

const SFX: Partial<Record<StepKind, { file: string; volume: number }>> = {
  buildStart: { file: "sfx/whoosh_intro.wav", volume: 0.4 },
  heapifyRoot: { file: "sfx/pick.wav", volume: 0.35 },
  compareChildren: { file: "sfx/compare.wav", volume: 0.28 },
  compareParent: { file: "sfx/compare.wav", volume: 0.3 },
  swapDown: { file: "sfx/shift.wav", volume: 0.5 },
  settle: { file: "sfx/lock.wav", volume: 0.35 },
  buildDone: { file: "sfx/sparkle_outro.wav", volume: 0.4 },
  extract: { file: "sfx/insert.wav", volume: 0.65 },
  lock: { file: "sfx/lock.wav", volume: 0.55 },
};

export const SfxTrackHeap: React.FC<{
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
        // thin dense compares in second half
        if (s.kind === "compareChildren" && i > 40 && i % 2 === 0) return null;
        return (
          <Sequence key={i} from={at} durationInFrames={Math.max(1, totalFrames - at)}>
            <Audio src={staticFile(cue.file)} volume={cue.volume} />
          </Sequence>
        );
      })}
      <Sequence from={outroFrame} durationInFrames={Math.max(1, totalFrames - outroFrame)}>
        <Audio src={staticFile("sfx/sparkle_outro.wav")} volume={0.6} />
      </Sequence>
    </>
  );
};