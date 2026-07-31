export type StepKind =
  | "intro"
  | "visit"
  | "complement"
  | "lookup"
  | "store"
  | "found"
  | "result";

export type MapEntry = { value: number; index: number };

export type TwoSumStep = {
  kind: StepKind;
  i: number;
  value: number;
  need: number;
  map: MapEntry[];
  /** slot index being written on `store` */
  slot: number;
  /** slot index of the match on `found` */
  hit: number | null;
  active: number[];
  matched: number[];
  codeLine: number;
  caption: string;
};

export const NUMS = [4, 1, 8, 6, 3, 5];
export const TARGET = 13;

export function buildSteps(nums: number[], target: number): TwoSumStep[] {
  const steps: TwoSumStep[] = [];
  const map: MapEntry[] = [];
  const snap = () => map.map((m) => ({ ...m }));

  steps.push({
    kind: "intro",
    i: -1,
    value: 0,
    need: 0,
    map: [],
    slot: -1,
    hit: null,
    active: [],
    matched: [],
    codeLine: 0,
    caption: `target = ${target} · map is empty`,
  });

  for (let i = 0; i < nums.length; i++) {
    const v = nums[i];
    const need = target - v;
    steps.push({
      kind: "visit",
      i,
      value: v,
      need,
      map: snap(),
      slot: -1,
      hit: null,
      active: [i],
      matched: [],
      codeLine: 1,
      caption: `visit index ${i} → nums[${i}] = ${v}`,
    });
    steps.push({
      kind: "complement",
      i,
      value: v,
      need,
      map: snap(),
      slot: -1,
      hit: null,
      active: [i],
      matched: [],
      codeLine: 2,
      caption: `need = ${target} − ${v} = ${need}`,
    });

    const hitIdx = map.findIndex((m) => m.value === need);
    steps.push({
      kind: "lookup",
      i,
      value: v,
      need,
      map: snap(),
      slot: -1,
      hit: hitIdx >= 0 ? hitIdx : null,
      active: [i],
      matched: [],
      codeLine: 3,
      caption:
        hitIdx >= 0
          ? `is ${need} in the map? yes`
          : `is ${need} in the map? not yet`,
    });

    if (hitIdx >= 0) {
      const partner = map[hitIdx];
      steps.push({
        kind: "found",
        i,
        value: v,
        need,
        map: snap(),
        slot: -1,
        hit: hitIdx,
        active: [i],
        matched: [partner.index, i],
        codeLine: 4,
        caption: `found ${need} → index ${partner.index}`,
      });
      steps.push({
        kind: "result",
        i,
        value: v,
        need,
        map: snap(),
        slot: -1,
        hit: hitIdx,
        active: [],
        matched: [partner.index, i],
        codeLine: 4,
        caption: `answer = [${partner.index}, ${i}]  ·  ${partner.value} + ${v} = ${target}`,
      });
      return steps;
    }

    const slot = map.length;
    map.push({ value: v, index: i });
    steps.push({
      kind: "store",
      i,
      value: v,
      need,
      map: snap(),
      slot,
      hit: null,
      active: [i],
      matched: [],
      codeLine: 6,
      caption: `store ${v} → index ${i}   (map.size = ${map.length})`,
    });
  }

  return steps;
}
