export const theme = {
  bg: {
    a: "#F6F1FF",
    b: "#EAF3FF",
    c: "#FFF0F6",
  },
  blobs: {
    peach: "#FFD6C2",
    sky: "#BFE0FF",
    lilac: "#E4D4FF",
    mint: "#CFF3E1",
    pink: "#FFD1E3",
  },
  ink: "#1E2340",
  inkSoft: "#4A527A",
  bar: {
    idle: ["#7AB8FF", "#A78BFA"] as const,
    active: ["#FFB199", "#FF7EB3"] as const,
    locked: ["#7EE7C7", "#58C7A3"] as const,
  },
  glass: {
    fill: "rgba(255,255,255,0.55)",
    border: "rgba(255,255,255,0.85)",
    shadow: "0 30px 60px rgba(120,130,180,0.18), 0 6px 18px rgba(120,130,180,0.10)",
  },
};

export const springs = {
  gentle: { damping: 22, stiffness: 180 },
  gel: { damping: 14, stiffness: 140 },
  snap: { damping: 20, stiffness: 260 },
};