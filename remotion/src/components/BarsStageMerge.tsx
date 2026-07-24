import React from "react";
import { useCurrentFrame, interpolate, useVideoConfig, spring } from "remotion";
import { Bar, BarState } from "./Bar";
import { SortStep } from "../lib/sort-merge";
import { theme } from "../lib/theme";

// Renders source row + auxiliary buffer row below.
export const BarsStageMerge: React.FC<{
  prev: SortStep;
  curr: SortStep;
  progress: number;
  n: number;
  originX: number;
  originY: number;
  slotW: number;
  barW: number;
  maxValue: number;
  bufferY: number;
  appearBaseFrame: number;
}> = ({
  prev,
  curr,
  progress,
  n,
  originX,
  originY,
  slotW,
  barW,
  maxValue,
  bufferY,
  appearBaseFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const e = spring({
    frame: Math.round(progress * 20),
    fps,
    config: { damping: 18, stiffness: 200 },
    durationInFrames: 20,
  });
  const p = Math.max(0, Math.min(1, e));

  const inRange = (idx: number) => idx >= curr.lo && idx <= curr.hi;

  // Source row bars
  const sourceBars = curr.arr.map((v, slot) => {
    const x = originX + slot * slotW + slotW / 2;

    let lift = 0;
    // Split fan-out
    if (curr.kind === "split" && inRange(slot)) {
      const shift = slot <= curr.mid ? -14 : 14;
      lift = -Math.sin(p * Math.PI) * 20;
      // horizontal fan via lift only? Keep vertical lift, use dx via a separate x offset:
      return { slot, v, x: x + shift * p, lift, state: barState(curr, slot), inRange: inRange(slot) };
    }
    // Compare pointer lift
    if (curr.kind === "compare") {
      if (slot === curr.i || slot === curr.j) lift = -50 - Math.sin(p * Math.PI) * 10;
    }
    // Take: source bar arcs down to buffer position
    if (
      (curr.kind === "takeLeft" || curr.kind === "takeRight" || curr.kind === "copyBack")
    ) {
      const takeSrc = curr.active[0];
      if (slot === takeSrc) {
        // arcs downward — handled by flying bar below; hide source bar
        return { slot, v, x, lift: 0, state: barState(curr, slot), hidden: true, inRange: inRange(slot) };
      }
    }
    // Merge done: bars springs up from buffer back into source (already updated in arr)
    if (curr.kind === "mergeDone" && inRange(slot)) {
      lift = interpolate(p, [0, 0.6, 1], [200, 40, 0]);
    }
    return { slot, v, x, lift, state: barState(curr, slot), inRange: inRange(slot) };
  });

  return (
    <>
      {/* Buffer tray */}
      <BufferTray
        originX={originX}
        y={bufferY}
        slotW={slotW}
        n={n}
        lo={curr.lo}
        hi={curr.hi}
        show={
          curr.kind === "mergeStart" ||
          curr.kind === "compare" ||
          curr.kind === "takeLeft" ||
          curr.kind === "takeRight" ||
          curr.kind === "copyBack" ||
          curr.kind === "mergeDone"
        }
        frame={frame}
      />

      {/* Buffer bars (already placed) */}
      {curr.buffer.map((bv, slot) => {
        if (bv == null) return null;
        const x = originX + slot * slotW + slotW / 2;
        // fade out on mergeDone as they fly up
        const opacity = curr.kind === "mergeDone" ? interpolate(p, [0, 0.4, 1], [1, 0.5, 0]) : 1;
        const src = curr.source[slot];
        const state: BarState = "active";
        return (
          <div key={`buf-${slot}`} style={{ position: "absolute", inset: 0, opacity }}>
            <BufferBar
              value={bv}
              maxValue={maxValue}
              slotX={x}
              y={bufferY}
              width={barW}
              side={src}
            />
          </div>
        );
      })}

      {/* Flying bar for takeLeft / takeRight / copyBack */}
      {(curr.kind === "takeLeft" || curr.kind === "takeRight" || curr.kind === "copyBack") &&
        curr.active.length >= 2 &&
        (() => {
          const srcIdx = curr.active[0];
          const dstIdx = curr.active[1];
          const v = curr.arr[srcIdx];
          const startX = originX + srcIdx * slotW + slotW / 2;
          const endX = originX + dstIdx * slotW + slotW / 2;
          const height = (v / maxValue) * 700;
          const startY = originY - height;
          const endY = bufferY;
          const x = startX + (endX - startX) * p;
          const y = interpolate(p, [0, 1], [startY, endY]);
          const arc = -Math.sin(p * Math.PI) * 60;
          const side = curr.kind === "takeRight" ? "right" : curr.kind === "takeLeft" ? "left" : (curr.source[dstIdx] ?? "left");
          return (
            <FlyingBar
              value={v}
              maxValue={maxValue}
              x={x}
              y={y + arc}
              width={barW}
              side={side as "left" | "right"}
            />
          );
        })()}

      {/* Source row */}
      {sourceBars.map((b) =>
        b.hidden ? null : (
          <div
            key={`src-${b.slot}-${b.v}`}
            style={{
              position: "absolute",
              inset: 0,
              opacity: !b.inRange && !curr.locked.includes(b.slot) ? 0.42 : 1,
            }}
          >
            <Bar
              value={b.v}
              maxValue={maxValue}
              slotX={b.x}
              targetY={originY}
              liftY={b.lift}
              width={barW}
              state={b.state}
              index={b.slot}
              appearAt={appearBaseFrame + b.slot * 4}
            />
          </div>
        ),
      )}

      {/* Split line at mid */}
      {(curr.kind === "split" || curr.kind === "recurseLeft" || curr.kind === "recurseRight") &&
        curr.mid >= curr.lo &&
        curr.mid < curr.hi && (
          <SplitLine
            x={originX + (curr.mid + 1) * slotW}
            yTop={originY - 720}
            yBot={originY + 40}
            frame={frame}
          />
        )}

      {/* Range bracket */}
      {curr.lo <= curr.hi && curr.hi - curr.lo < n && curr.kind !== "done" && (
        <RangeBracket
          originX={originX}
          originY={originY}
          slotW={slotW}
          lo={curr.lo}
          hi={curr.hi}
          frame={frame}
        />
      )}
    </>
  );
};

const barState = (curr: SortStep, slot: number): BarState => {
  if (curr.locked.includes(slot)) return "locked";
  if (curr.active.includes(slot)) return "active";
  return "idle";
};

const SplitLine: React.FC<{ x: number; yTop: number; yBot: number; frame: number }> = ({
  x,
  yTop,
  yBot,
  frame,
}) => {
  const pulse = 0.5 + Math.sin(frame / 6) * 0.25;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 2,
        top: yTop,
        width: 4,
        height: yBot - yTop,
        background:
          "linear-gradient(180deg, rgba(122,184,255,0) 0%, rgba(122,184,255,0.9) 30%, rgba(167,139,250,0.9) 100%)",
        borderRadius: 2,
        opacity: pulse,
        boxShadow: `0 0 14px rgba(167,139,250,${pulse})`,
      }}
    />
  );
};

const RangeBracket: React.FC<{
  originX: number;
  originY: number;
  slotW: number;
  lo: number;
  hi: number;
  frame: number;
}> = ({ originX, originY, slotW, lo, hi, frame }) => {
  const left = originX + lo * slotW + 6;
  const right = originX + (hi + 1) * slotW - 6;
  const width = right - left;
  const pulse = 0.7 + Math.sin(frame / 8) * 0.15;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: originY + 18,
        width,
        height: 46,
        borderRadius: 22,
        border: "3px solid rgba(122,184,255,0.55)",
        background:
          "linear-gradient(180deg, rgba(122,184,255,0.08), rgba(167,139,250,0.05))",
        boxShadow: `0 0 24px rgba(122,184,255,${0.25 * pulse})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 20,
          fontWeight: 700,
          color: "#4A527A",
          opacity: 0.8,
        }}
      >
        [{lo}…{hi}]
      </div>
    </div>
  );
};

const BufferTray: React.FC<{
  originX: number;
  y: number;
  slotW: number;
  n: number;
  lo: number;
  hi: number;
  show: boolean;
  frame: number;
}> = ({ originX, y, slotW, n, lo, hi, show, frame }) => {
  const width = n * slotW;
  const pulse = 0.6 + Math.sin(frame / 10) * 0.15;
  return (
    <div
      style={{
        position: "absolute",
        left: originX,
        top: y - 100,
        width,
        height: 130,
        borderRadius: 30,
        background: "rgba(255,255,255,0.4)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.7), 0 20px 40px rgba(120,130,180,0.15), inset 0 0 0 1px rgba(255,255,255,0.5)",
        opacity: show ? 1 : 0.35,
      }}
    >
      {/* highlighted active range */}
      {show && (
        <div
          style={{
            position: "absolute",
            left: lo * slotW + 4,
            top: 6,
            width: (hi - lo + 1) * slotW - 8,
            height: 118,
            borderRadius: 24,
            background:
              "linear-gradient(180deg, rgba(255,209,227,0.35), rgba(191,224,255,0.3))",
            boxShadow: `0 0 30px rgba(255,177,153,${0.4 * pulse})`,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 20,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 16,
          fontWeight: 700,
          color: theme.inkSoft,
          letterSpacing: 2,
          opacity: 0.7,
        }}
      >
        MERGE BUFFER
      </div>
    </div>
  );
};

const BufferBar: React.FC<{
  value: number;
  maxValue: number;
  slotX: number;
  y: number;
  width: number;
  side: "left" | "right" | null;
}> = ({ value, maxValue, slotX, y, width, side }) => {
  const height = 92;
  const colors =
    side === "left"
      ? ["#7AB8FF", "#5F9EEE"]
      : side === "right"
        ? ["#C4B0FF", "#A78BFA"]
        : ["#B9C6E8", "#8F9DCB"];
  return (
    <div
      style={{
        position: "absolute",
        left: slotX - width / 2,
        top: y - height,
        width,
        height,
        borderRadius: 20,
        background: `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
        boxShadow:
          "0 14px 26px rgba(120,130,180,0.28), inset 0 2px 0 rgba(255,255,255,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        fontWeight: 800,
        fontSize: 36,
        color: "white",
        textShadow: "0 2px 6px rgba(30,35,64,0.25)",
      }}
    >
      {value}
    </div>
  );
};

const FlyingBar: React.FC<{
  value: number;
  maxValue: number;
  x: number;
  y: number;
  width: number;
  side: "left" | "right";
}> = ({ value, x, y, width, side }) => {
  const height = 92;
  const colors =
    side === "left" ? ["#7AB8FF", "#5F9EEE"] : ["#C4B0FF", "#A78BFA"];
  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height,
        width,
        height,
        borderRadius: 20,
        background: `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
        boxShadow:
          "0 20px 40px rgba(120,130,180,0.4), inset 0 2px 0 rgba(255,255,255,0.6), 0 0 28px rgba(167,139,250,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        fontWeight: 800,
        fontSize: 36,
        color: "white",
        textShadow: "0 2px 6px rgba(30,35,64,0.3)",
      }}
    >
      {value}
    </div>
  );
};