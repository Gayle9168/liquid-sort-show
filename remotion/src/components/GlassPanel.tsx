import React from "react";
import { theme } from "../lib/theme";

export const GlassPanel: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  radius?: number;
}> = ({ style, children, radius = 44 }) => {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: radius,
        background: theme.glass.fill,
        boxShadow: `${theme.glass.shadow}, inset 0 1px 0 ${theme.glass.border}, inset 0 0 0 1px rgba(255,255,255,0.35)`,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* top specular */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0) 60%)",
          pointerEvents: "none",
        }}
      />
      {/* side glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background:
            "linear-gradient(120deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 40%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", width: "100%", height: "100%" }}>{children}</div>
    </div>
  );
};