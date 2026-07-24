// Precomputed top-down merge-sort keyframe stream.
// Each SortStep is one atomic UI moment.

export type StepKind =
  | "split"
  | "recurseLeft"
  | "recurseRight"
  | "mergeStart"
  | "compare"
  | "takeLeft"
  | "takeRight"
  | "copyBack"
  | "mergeDone"
  | "done";

export interface SortStep {
  kind: StepKind;
  arr: number[];
  lo: number;
  mid: number;
  hi: number;
  i: number; // left pointer
  j: number; // right pointer
  bufPos: number; // next free slot in buffer (absolute index within arr)
  buffer: (number | null)[];
  source: ("left" | "right" | null)[];
  active: number[];
  locked: number[];
  rangeStack: { lo: number; hi: number; mid: number }[];
  pass: number;
  codeLine: number;
}

export function buildSteps(input: number[]): SortStep[] {
  const a = [...input];
  const n = a.length;
  const buffer: (number | null)[] = Array(n).fill(null);
  const source: ("left" | "right" | null)[] = Array(n).fill(null);
  const locked = new Set<number>();
  const rangeStack: { lo: number; hi: number; mid: number }[] = [];
  const steps: SortStep[] = [];
  let pass = 0;

  const snap = (
    kind: StepKind,
    ctx: {
      lo: number;
      mid: number;
      hi: number;
      i: number;
      j: number;
      bufPos: number;
      active: number[];
      codeLine: number;
    },
  ) => {
    steps.push({
      kind,
      arr: [...a],
      lo: ctx.lo,
      mid: ctx.mid,
      hi: ctx.hi,
      i: ctx.i,
      j: ctx.j,
      bufPos: ctx.bufPos,
      buffer: [...buffer],
      source: [...source],
      active: [...ctx.active],
      locked: Array.from(locked).sort((x, y) => x - y),
      rangeStack: rangeStack.map((r) => ({ ...r })),
      pass,
      codeLine: ctx.codeLine,
    });
  };

  // Initial "here's the array" moment
  snap("split", {
    lo: 0,
    mid: Math.floor((0 + n - 1) / 2),
    hi: n - 1,
    i: 0,
    j: 0,
    bufPos: 0,
    active: [],
    codeLine: 0,
  });

  const clearBufferRange = (lo: number, hi: number) => {
    for (let k = lo; k <= hi; k++) {
      buffer[k] = null;
      source[k] = null;
    }
  };

  const ms = (lo: number, hi: number) => {
    pass++;
    if (lo >= hi) {
      if (lo === hi) {
        locked.add(lo);
        snap("done", {
          lo,
          mid: lo,
          hi,
          i: lo,
          j: lo,
          bufPos: lo,
          active: [lo],
          codeLine: 1,
        });
      }
      return;
    }
    const mid = Math.floor((lo + hi) / 2);
    rangeStack.push({ lo, hi, mid });

    snap("split", {
      lo,
      mid,
      hi,
      i: lo,
      j: mid + 1,
      bufPos: lo,
      active: [],
      codeLine: 2,
    });

    snap("recurseLeft", {
      lo,
      mid,
      hi: mid,
      i: lo,
      j: mid,
      bufPos: lo,
      active: [],
      codeLine: 3,
    });
    ms(lo, mid);

    snap("recurseRight", {
      lo: mid + 1,
      mid,
      hi,
      i: mid + 1,
      j: hi,
      bufPos: mid + 1,
      active: [],
      codeLine: 4,
    });
    ms(mid + 1, hi);

    // MERGE
    let i = lo;
    let j = mid + 1;
    let k = lo;
    clearBufferRange(lo, hi);
    snap("mergeStart", {
      lo,
      mid,
      hi,
      i,
      j,
      bufPos: k,
      active: [i, j],
      codeLine: 5,
    });

    while (i <= mid && j <= hi) {
      snap("compare", {
        lo,
        mid,
        hi,
        i,
        j,
        bufPos: k,
        active: [i, j],
        codeLine: 10,
      });
      if (a[i] <= a[j]) {
        buffer[k] = a[i];
        source[k] = "left";
        snap("takeLeft", {
          lo,
          mid,
          hi,
          i,
          j,
          bufPos: k,
          active: [i, k],
          codeLine: 11,
        });
        i++;
        k++;
      } else {
        buffer[k] = a[j];
        source[k] = "right";
        snap("takeRight", {
          lo,
          mid,
          hi,
          i,
          j,
          bufPos: k,
          active: [j, k],
          codeLine: 12,
        });
        j++;
        k++;
      }
    }

    while (i <= mid) {
      buffer[k] = a[i];
      source[k] = "left";
      snap("copyBack", {
        lo,
        mid,
        hi,
        i,
        j,
        bufPos: k,
        active: [i, k],
        codeLine: 15,
      });
      i++;
      k++;
    }
    while (j <= hi) {
      buffer[k] = a[j];
      source[k] = "right";
      snap("copyBack", {
        lo,
        mid,
        hi,
        i,
        j,
        bufPos: k,
        active: [j, k],
        codeLine: 16,
      });
      j++;
      k++;
    }

    // copy buffer back into a
    for (let m = lo; m <= hi; m++) a[m] = buffer[m] as number;
    for (let m = lo; m <= hi; m++) locked.add(m);
    snap("mergeDone", {
      lo,
      mid,
      hi,
      i,
      j,
      bufPos: k,
      active: Array.from({ length: hi - lo + 1 }, (_, m) => lo + m),
      codeLine: 17,
    });
    // clear visual buffer after merge lands
    clearBufferRange(lo, hi);

    // if this was the root merge, don't unlock; keep locked forever
    rangeStack.pop();
  };

  ms(0, n - 1);

  // final
  for (let k = 0; k < n; k++) locked.add(k);
  steps.push({
    kind: "done",
    arr: [...a],
    lo: 0,
    mid: Math.floor((n - 1) / 2),
    hi: n - 1,
    i: -1,
    j: -1,
    bufPos: -1,
    buffer: [...buffer],
    source: [...source],
    active: [],
    locked: Array.from(locked).sort((x, y) => x - y),
    rangeStack: [],
    pass,
    codeLine: 0,
  });

  return steps;
}