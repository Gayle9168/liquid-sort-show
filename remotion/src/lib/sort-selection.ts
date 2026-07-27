// Selection sort keyframe stream.
export type StepKind =
  | "startPass"     // begin outer pass, set min = i
  | "scan"          // compare a[j] with a[min]
  | "newMin"        // update min = j
  | "swap"          // swap a[i] and a[min]
  | "noSwap"        // min == i, no swap needed
  | "lockIn";       // i is now locked in sorted region

export interface SortStep {
  kind: StepKind;
  arr: number[];
  i: number;
  j: number;
  min: number;
  active: number[];
  locked: number[];
  pass: number;
  codeLine: number;
}

export function buildSteps(input: number[]): SortStep[] {
  const a = [...input];
  const steps: SortStep[] = [];
  const push = (s: Omit<SortStep, "arr">) => steps.push({ ...s, arr: [...a] });
  const n = a.length;

  for (let i = 0; i < n - 1; i++) {
    const pass = i + 1;
    const lockedBefore = Array.from({ length: i }, (_, k) => k);
    let min = i;
    push({
      kind: "startPass",
      i,
      j: i,
      min,
      active: [i],
      locked: lockedBefore,
      pass,
      codeLine: 0,
    });
    for (let j = i + 1; j < n; j++) {
      push({
        kind: "scan",
        i,
        j,
        min,
        active: [j, min],
        locked: lockedBefore,
        pass,
        codeLine: 2,
      });
      if (a[j] < a[min]) {
        min = j;
        push({
          kind: "newMin",
          i,
          j,
          min,
          active: [min],
          locked: lockedBefore,
          pass,
          codeLine: 3,
        });
      }
    }
    if (min !== i) {
      const tmp = a[i]; a[i] = a[min]; a[min] = tmp;
      push({
        kind: "swap",
        i,
        j: n - 1,
        min,
        active: [i, min],
        locked: lockedBefore,
        pass,
        codeLine: 5,
      });
    } else {
      push({
        kind: "noSwap",
        i,
        j: n - 1,
        min,
        active: [i],
        locked: lockedBefore,
        pass,
        codeLine: 5,
      });
    }
    push({
      kind: "lockIn",
      i,
      j: n - 1,
      min: i,
      active: [],
      locked: Array.from({ length: i + 1 }, (_, k) => k),
      pass,
      codeLine: 6,
    });
  }
  // final lock last element
  push({
    kind: "lockIn",
    i: n - 1,
    j: n - 1,
    min: n - 1,
    active: [],
    locked: Array.from({ length: n }, (_, k) => k),
    pass: n,
    codeLine: 6,
  });
  return steps;
}