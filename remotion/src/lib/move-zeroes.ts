export type MzKind = "intro" | "scan" | "skip" | "place" | "result";

export type MzStep = {
  kind: MzKind;
  /** array state after this step */
  arr: number[];
  /** array state before this step (for swap animation) */
  prev: number[];
  read: number;
  write: number;
  /** indices swapped on `place` */
  swap: [number, number] | null;
  active: number[];
  /** indices already in the packed non-zero prefix */
  packed: number[];
  codeLine: number;
  caption: string;
};

export const NUMS_MZ = [0, 1, 0, 3, 12, 0];

export function buildMzSteps(input: number[]): MzStep[] {
  const arr = [...input];
  const steps: MzStep[] = [];
  let write = 0;
  const snap = () => [...arr];
  const packed = () => Array.from({ length: write }, (_, k) => k);

  steps.push({
    kind: "intro",
    arr: snap(),
    prev: snap(),
    read: -1,
    write: 0,
    swap: null,
    active: [],
    packed: [],
    codeLine: 0,
    caption: "two pointers · keep order · in place",
  });

  for (let read = 0; read < arr.length; read++) {
    const v = arr[read];
    steps.push({
      kind: "scan",
      arr: snap(),
      prev: snap(),
      read,
      write,
      swap: null,
      active: [read],
      packed: packed(),
      codeLine: 1,
      caption: `read index ${read} → nums[${read}] = ${v}`,
    });

    if (v === 0) {
      steps.push({
        kind: "skip",
        arr: snap(),
        prev: snap(),
        read,
        write,
        swap: null,
        active: [read],
        packed: packed(),
        codeLine: 2,
        caption: `it's a zero → leave it, move read on`,
      });
      continue;
    }

    const before = snap();
    const a = read;
    const b = write;
    const t = arr[a];
    arr[a] = arr[b];
    arr[b] = t;
    write++;
    steps.push({
      kind: "place",
      arr: snap(),
      prev: before,
      read,
      write,
      swap: [a, b],
      active: [a, b],
      packed: packed(),
      codeLine: 3,
      caption:
        a === b
          ? `${v} is already in place → write moves to ${write}`
          : `swap ${v} into slot ${b} → write moves to ${write}`,
    });
  }

  steps.push({
    kind: "result",
    arr: snap(),
    prev: snap(),
    read: arr.length,
    write,
    swap: null,
    active: [],
    packed: packed(),
    codeLine: 6,
    caption: `done → [${arr.join(", ")}]  ·  order kept`,
  });

  return steps;
}