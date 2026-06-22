import { describe, expect, it } from "vitest";
import { calculateSaw, calculateSmart } from "./ranking";
import type { Alternative, Criteria } from "./types";

const criteria: Criteria[] = [
  { id: "benefit", name: "Benefit", weight: 60, kind: "benefit" },
  { id: "cost", name: "Cost", weight: 40, kind: "cost" }
];
const alternatives: Alternative[] = [
  { id: "a", name: "A", address: "", latitude: 0, longitude: 0, photoUrl: "", values: { benefit: 10, cost: 5 } },
  { id: "b", name: "B", address: "", latitude: 0, longitude: 0, photoUrl: "", values: { benefit: 5, cost: 10 } }
];

describe("ranking", () => {
  it("ranks SMART benefit and cost", () => {
    expect(calculateSmart(criteria, alternatives)[0].alternative.id).toBe("a");
  });

  it("ranks SAW benefit and cost", () => {
    expect(calculateSaw(criteria, alternatives)[0].alternative.id).toBe("a");
  });

  it("handles identical and zero values", () => {
    const same = alternatives.map((item) => ({ ...item, values: { benefit: 0, cost: 0 } }));
    expect(calculateSmart(criteria, same)[0].score).toBe(1);
    expect(Number.isFinite(calculateSaw(criteria, same)[0].score)).toBe(true);
  });

  it("normalizes weights that do not total 100", () => {
    const changed = criteria.map((item) => ({ ...item, weight: 1 }));
    expect(calculateSmart(changed, alternatives)[0].score).toBe(1);
  });
});
