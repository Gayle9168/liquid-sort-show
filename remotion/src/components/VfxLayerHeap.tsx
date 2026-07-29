import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { SortStep } from "../lib/sort-heap";

export const VfxLayerHeap: React.FC<{
  step: SortStep;
  progress: number;
  finalFlashActive: boolean;
}> = ({ step, progress, finalFlashActive }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {step.kind === "swapDown" && (
        <RadialBloom progress={progress} tint="rgba(167,139,250,0.55)" />
      )}
      {step.kind === "extract" && (
        <RadialBloom progress={progress} tint="rgba(255,126,179,0.5)" />
      )}
      {step.kind === "lock" && (
        <LockPulse progress={progress} />
      )}
      {step.kind === "buildDone" && (
        <RadialBloom progress={progress} tint="rgba(88,199,163,0.5)" />
      )}
      {finalFlashActive && <FinalFlash frame={frame} fps={fps} />}
    </>
  );
};

const RadialBloom: React.FC<{ progress: number; tint: string }> = ({ progress, tint }) => {
  const rp = Math.max(0, (progress - 0.15) / 0.7);
  const size = interpolate(rp, [0, 1], [200, 900]);
  const op = interpolate(rp, [0, 0.2, 1], [0, 0.5, 0]);
  return (
    <div style={{
      position: "absolute", left: "50%", top: "42%",
      width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${tint} 0%, rgba(255,255,255,0) 65%)`,
      opacity: op, pointerEvents: "none",
    }} />
  );
};

const LockPulse: React.FC<{ progress: number }> = ({ progress }) => {
  const op = interpolate(progress, [0, 0.2, 0.6, 1], [0, 0.6, 0.4, 0]);
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at 50% 62%, rgba(126,231,199,0.55) 0%, rgba(126,231,199,0) 55%)",
      opacity: op, pointerEvents: "none",
    }} />
  );
};

const FinalFlash: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - 1080;
  const s = spring({ frame: localFrame, fps, config: { damping: 40, stiffness: 60 }, durationInFrames: 30 });
  const opacity = interpolate(s, [0, 0.4, 1], [0, 0.35, 0]);
  return (
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center 50%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%)", opacity, pointerEvents: "none" }} />
  );
};