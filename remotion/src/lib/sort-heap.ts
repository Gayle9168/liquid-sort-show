// Heap sort keyframe stream (max-heap, in-place).
export type StepKind =
  | "buildStart"      // announce build-heap phase
  | "heapifyRoot"     // start sift-down at node i
  | "compareChildren" // pick larger child among left/right
  | "compareParent"   // compare largest child with current node
  | "swapDown"        // swap node with larger child, continue down
  | "settle"          // node satisfies heap property, subtree done
  | "buildDone"       // heap built
  | "extract"         // swap root (max) with last active element
  | "lock"            // last active element locked as sorted
  | "done";           // fully sorted

export interface SortStep {
  kind: StepKind;
  arr: number[];
  i: number;         // current node
  left: number;      // left child index (or -1)
  right: number;     // right child index (or -1)
  largest: number;   // best candidate index
  heapEnd: number;   // exclusive upper bound of the heap portion
  active: number[];
  locked: number[];
  edgeActive: [number, number] | null; // parent-child edge to highlight
  pass: number;
  phase: "build" | "sort";
  codeLine: number;
}

export function buildSteps(input: number[]): SortStep[] {
  const a = [...input];
  const n = a.length;
  const steps: SortStep[] = [];
  const lockedSet: number[] = [];
  let pass = 0;

  const push = (
    kind: StepKind,
    i: number,
    largest: number,
    heapEnd: number,
    active: number[],
    edgeActive: [number, number] | null,
    codeLine: number,
    phase: "build" | "sort",
  ) => {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    steps.push({
      kind, arr: [...a], i,
      left: left < heapEnd ? left : -1,
      right: right < heapEnd ? right : -1,
      largest, heapEnd,
      active, locked: [...lockedSet],
      edgeActive, pass, phase, codeLine,
    });
  };

  const heapify = (start: number, end: number, phase: "build" | "sort") => {
    let i = start;
    push("heapifyRoot", i, i, end, [i], null, 0, phase);
    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let largest = i;
      if (l < end) {
        push("compareChildren", i, l, end, [l, i], [i, l], 2, phase);
        if (a[l] > a[largest]) largest = l;
      }
      if (r < end) {
        push("compareChildren", i, r, end, [r, largest], [i, r], 3, phase);
        if (a[r] > a[largest]) largest = r;
      }
      push("compareParent", i, largest, end, [i, largest], largest !== i ? [i, largest] : null, 4, phase);
      if (largest !== i) {
        const t = a[i]; a[i] = a[largest]; a[largest] = t;
        push("swapDown", i, largest, end, [i, largest], [i, largest], 5, phase);
        i = largest;
      } else {
        push("settle", i, i, end, [i], null, 6, phase);
        break;
      }
    }
  };

  // Phase 1: build max heap
  pass = 1;
  push("buildStart", 0, 0, n, [], null, 0, "build");
  for (let start = Math.floor(n / 2) - 1; start >= 0; start--) {
    heapify(start, n, "build");
    pass++;
  }
  push("buildDone", 0, 0, n, [0], null, 6, "build");

  // Phase 2: repeated extract-max
  pass = 1;
  for (let end = n - 1; end > 0; end--) {
    // swap root with a[end]
    const t = a[0]; a[0] = a[end]; a[end] = t;
    push("extract", 0, end, end + 1, [0, end], [0, end], 8, "sort");
    lockedSet.push(end);
    push("lock", end, end, end, [], null, 9, "sort");
    if (end > 1) heapify(0, end, "sort");
    pass++;
  }
  lockedSet.push(0);
  push("done", 0, 0, 0, [], null, 10, "sort");
  return steps;
}