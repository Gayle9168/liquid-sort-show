import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { theme } from "../lib/theme";

export const LiquidBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const blob = (
    color: string,
    baseX: number,
    baseY: number,
    size: number,
    speed: number,
    phase: number,
  ) => {
    const angle = t * Math.PI * 2 * speed + phase;
    const x = baseX + Math.cos(angle) * 80;
    const y = baseY + Math.sin(angle * 0.8) * 100;
    return (
      <div
        style={{
          position: "absolute",
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          filter: "blur(80px)",
          opacity: 0.85,
        }}
      />
    );
  };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${theme.bg.a} 0%, ${theme.bg.b} 55%, ${theme.bg.c} 100%)`,
        overflow: "hidden",
      }}
    >
      {blob(theme.blobs.lilac, 200, 350, 620, 0.6, 0)}
      {blob(theme.blobs.sky, 900, 700, 700, 0.5, 1.2)}
      {blob(theme.blobs.peach, 300, 1500, 560, 0.7, 2.4)}
      {blob(theme.blobs.pink, 850, 1650, 520, 0.55, 3.1)}
      {blob(theme.blobs.mint, 540, 1050, 480, 0.65, 4.0)}
      {/* subtle vignette to keep edges soft */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0) 55%, rgba(255,255,255,0.35) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// small helper to keep TS happy about unused var
export const __t = interpolate;