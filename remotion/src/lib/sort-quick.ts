// Precomputed quick-sort (Lomuto, pivot=last) keyframe stream.
// One SortStep per atomic UI moment; bars, code panel, VFX, SFX, and label read from it.

export type StepKind =
  | "pickPivot"
  | "setBounds"
  | "scanStart"
  | "compare"
  | "swap"
  | "pivotSwap"
  | "recurseLeft"
  | "recurseRight"
  | "done";

export interface SortStep {
  kind: StepKind;
  arr: number[];
  lo: number;
  hi: number;
  pivotIndex: number;
  pivotValue: number;
  i: number;
  j: number;
  active: number[];
  locked: number[];
  rangeStack: { lo: number; hi: number }[];
  pass: number;
  codeLine: number;
}

export function buildSteps(input: number[]): SortStep[] {
  const a = [...input];
  const steps: SortStep[] = [];
  const locked = new Set<number>();
  let pass = 0;

  // pending recursion frames (visualized as bracket stack)
  const rangeStack: { lo: number; hi: number }[] = [];

  const snap = (
    kind: StepKind,
    ctx: {
      lo: number;
      hi: number;
      pivotIndex: number;
      pivotValue: number;
      i: number;
      j: number;
      active: number[];
      codeLine: number;
    },
  ) => {
    steps.push({
      kind,
      arr: [...a],
      lo: ctx.lo,
      hi: ctx.hi,
      pivotIndex: ctx.pivotIndex,
      pivotValue: ctx.pivotValue,
      i: ctx.i,
      j: ctx.j,
      active: ctx.active,
      locked: Array.from(locked).sort((x, y) => x - y),
      rangeStack: rangeStack.map((r) => ({ ...r })),
      pass,
      codeLine: ctx.codeLine,
    });
  };

  // Initial "here's the array" moment
  snap("setBounds", {
    lo: 0,
    hi: a.length - 1,
    pivotIndex: a.length - 1,
    pivotValue: a[a.length - 1],
    i: -1,
    j: 0,
    active: [],
    codeLine: 0,
  });

  const qs = (lo: number, hi: number) => {
    pass++;
    if (lo > hi) return;
    if (lo === hi) {
      locked.add(lo);
      snap("done", {
        lo,
        hi,
        pivotIndex: lo,
        pivotValue: a[lo],
        i: lo,
        j: lo,
        active: [lo],
        codeLine: 1,
      });
      return;
    }

    // enter subproblem
    snap("setBounds", {
      lo,
      hi,
      pivotIndex: hi,
      pivotValue: a[hi],
      i: lo - 1,
      j: lo,
      active: [],
      codeLine: 2,
    });

    // pick pivot
    const pivot = a[hi];
    snap("pickPivot", {
      lo,
      hi,
      pivotIndex: hi,
      pivotValue: pivot,
      i: lo - 1,
      j: lo,
      active: [hi],
      codeLine: 8,
    });

    // scan start
    let i = lo - 1;
    snap("scanStart", {
      lo,
      hi,
      pivotIndex: hi,
      pivotValue: pivot,
      i,
      j: lo,
      active: [hi],
      codeLine: 9,
    });

    for (let j = lo; j < hi; j++) {
      snap("compare", {
        lo,
        hi,
        pivotIndex: hi,
        pivotValue: pivot,
        i,
        j,
        active: [j, hi],
        codeLine: 10,
      });
      if (a[j] <= pivot) {
        i++;
        if (i !== j) {
          const tmp = a[i];
          a[i] = a[j];
          a[j] = tmp;
        }
        snap("swap", {
          lo,
          hi,
          pivotIndex: hi,
          pivotValue: pivot,
          i,
          j,
          active: [i, j, hi],
          codeLine: 12,
        });
      }
    }

    // final pivot swap
    const pIdx = i + 1;
    if (pIdx !== hi) {
      const tmp = a[pIdx];
      a[pIdx] = a[hi];
      a[hi] = tmp;
    }
    locked.add(pIdx);
    snap("pivotSwap", {
      lo,
      hi,
      pivotIndex: pIdx,
      pivotValue: pivot,
      i: pIdx,
      j: hi,
      active: [pIdx],
      codeLine: 15,
    });

    // recurse left
    if (pIdx - 1 > lo) {
      rangeStack.push({ lo: pIdx + 1, hi }); // remember right for later
      snap("recurseLeft", {
        lo,
        hi: pIdx - 1,
        pivotIndex: pIdx - 1,
        pivotValue: a[pIdx - 1],
        i: pIdx,
        j: pIdx,
        active: [],
        codeLine: 3,
      });
      qs(lo, pIdx - 1);
      rangeStack.pop();
    } else if (pIdx - 1 === lo) {
      // single element left range -> mark done
      locked.add(lo);
      snap("done", {
        lo,
        hi: lo,
        pivotIndex: lo,
        pivotValue: a[lo],
        i: lo,
        j: lo,
        active: [lo],
        codeLine: 3,
      });
    }

    // recurse right
    if (hi - (pIdx + 1) > 0) {
      snap("recurseRight", {
        lo: pIdx + 1,
        hi,
        pivotIndex: hi,
        pivotValue: a[hi],
        i: pIdx + 1,
        j: pIdx + 1,
        active: [],
        codeLine: 4,
      });
      qs(pIdx + 1, hi);
    } else if (hi - (pIdx + 1) === 0) {
      locked.add(hi);
      snap("done", {
        lo: hi,
        hi,
        pivotIndex: hi,
        pivotValue: a[hi],
        i: hi,
        j: hi,
        active: [hi],
        codeLine: 4,
      });
    }
  };

  qs(0, a.length - 1);

  // final "everything sorted" moment
  for (let k = 0; k < a.length; k++) locked.add(k);
  steps.push({
    kind: "done",
    arr: [...a],
    lo: 0,
    hi: a.length - 1,
    pivotIndex: -1,
    pivotValue: 0,
    i: -1,
    j: -1,
    active: [],
    locked: Array.from(locked).sort((x, y) => x - y),
    rangeStack: [],
    pass,
    codeLine: 0,
  });

  return steps;
}