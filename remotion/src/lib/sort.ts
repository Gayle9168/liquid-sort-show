// Precomputed insertion-sort keyframe stream.
// Each step is one atomic UI moment; bars + code highlight both read from it.

export type StepKind =
  | "pickStart"     // grab a[i]  -> code line "for"
  | "keyGrab"       // set key    -> code line "let key"
  | "compare"       // while cond -> code line "while"
  | "shift"         // a[j+1]=a[j]-> code line "a[j+1]="
  | "decJ"          // j--        -> code line "j--"
  | "insert"        // a[j+1]=key -> code line "a[j+1]=key"
  | "advance";      // next i

export interface SortStep {
  kind: StepKind;
  arr: number[];        // array state AFTER this step
  i: number;
  j: number;
  key: number;
  active: number[];     // bar indices highlighted active
  locked: number[];     // bar indices considered sorted region
  pass: number;         // 1-based outer-loop pass count
  codeLine: number;     // which code line to highlight (0-based)
}

export function buildSteps(input: number[]): SortStep[] {
  const a = [...input];
  const steps: SortStep[] = [];
  const push = (s: Omit<SortStep, "arr"> & { arr?: number[] }) =>
    steps.push({ ...s, arr: [...a] });

  // initial state
  push({
    kind: "pickStart",
    i: 0,
    j: -1,
    key: a[0],
    active: [],
    locked: [0],
    pass: 0,
    codeLine: 0,
  });

  for (let i = 1; i < a.length; i++) {
    const pass = i;
    push({
      kind: "pickStart",
      i,
      j: i - 1,
      key: a[i],
      active: [i],
      locked: Array.from({ length: i }, (_, k) => k),
      pass,
      codeLine: 0,
    });
    const key = a[i];
    push({
      kind: "keyGrab",
      i,
      j: i - 1,
      key,
      active: [i],
      locked: Array.from({ length: i }, (_, k) => k),
      pass,
      codeLine: 1,
    });
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      push({
        kind: "compare",
        i,
        j,
        key,
        active: [i, j],
        locked: Array.from({ length: i }, (_, k) => k).filter((k) => k !== j),
        pass,
        codeLine: 2,
      });
      a[j + 1] = a[j];
      push({
        kind: "shift",
        i,
        j,
        key,
        active: [j, j + 1],
        locked: Array.from({ length: i }, (_, k) => k).filter(
          (k) => k !== j && k !== j + 1,
        ),
        pass,
        codeLine: 3,
      });
      j--;
      push({
        kind: "decJ",
        i,
        j,
        key,
        active: j >= 0 ? [j, j + 1] : [j + 1],
        locked: Array.from({ length: i }, (_, k) => k).filter(
          (k) => k !== j && k !== j + 1,
        ),
        pass,
        codeLine: 4,
      });
    }
    // one final compare that failed (to show why loop stopped) — only if j>=0
    if (j >= 0) {
      push({
        kind: "compare",
        i,
        j,
        key,
        active: [i, j],
        locked: Array.from({ length: i }, (_, k) => k).filter((k) => k !== j),
        pass,
        codeLine: 2,
      });
    }
    a[j + 1] = key;
    push({
      kind: "insert",
      i,
      j,
      key,
      active: [j + 1],
      locked: Array.from({ length: i + 1 }, (_, k) => k),
      pass,
      codeLine: 6,
    });
    push({
      kind: "advance",
      i,
      j,
      key,
      active: [],
      locked: Array.from({ length: i + 1 }, (_, k) => k),
      pass,
      codeLine: 0,
    });
  }
  return steps;
}