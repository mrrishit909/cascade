import { describe, expect, it } from "vitest";
import { dieDefective, dieBinYield, waferYieldPct, cellThermalC, cellCurrentMa, scaleAt, mulberry32, WAFER, DIE } from "../src/index.ts";
import { validateDie, validateCell, SCALES } from "@cascade/schemas";

describe("wafer", () => {
  it("is deterministic", () => expect(dieDefective(2, 3)).toBe(dieDefective(2, 3)));
  it("defective dies have 0 bin yield, good dies have a positive one", () => {
    for (let c = 0; c < WAFER; c++) for (let r = 0; r < WAFER; r++) {
      const d = dieDefective(c, r), y = dieBinYield(c, r);
      expect(d ? y === 0 : y > 0).toBe(true);
    }
  });
  it("wafer yield is a plausible percentage", () => { const y = waferYieldPct(); expect(y).toBeGreaterThan(0); expect(y).toBeLessThanOrEqual(100); });
});
describe("die thermal/current", () => {
  it("thermal peaks near the die center", () => expect(cellThermalC(DIE / 2, DIE / 2)).toBeGreaterThan(cellThermalC(0, 0)));
  it("current is non-negative and deterministic", () => { expect(cellCurrentMa(2, 2)).toBeGreaterThanOrEqual(0); expect(cellCurrentMa(2, 2)).toBe(cellCurrentMa(2, 2)); });
});
describe("scale ladder", () => {
  it("scaleAt steps through in order and clamps", () => {
    expect(SCALES.map((_, i) => scaleAt(i))).toEqual(SCALES);
    expect(scaleAt(-5)).toBe("wafer"); expect(scaleAt(99)).toBe("lattice");
  });
});
describe("schemas + rng", () => {
  it("validators reject bad records", () => {
    expect(validateDie({ id: "d1", col: 0, row: 0, defective: false, binYield: 90 })).toBe(true);
    expect(validateDie({ id: "d1", col: 0, row: 0, defective: "no", binYield: 90 })).toBe(false);
    expect(validateCell({ id: "c1", col: 0, row: 0, thermalC: 50, currentMa: 10 })).toBe(true);
    expect(validateCell({ id: "c1", col: "x", row: 0, thermalC: 50, currentMa: 10 })).toBe(false);
  });
  it("rng repeats per seed", () => { const a = mulberry32(5), b = mulberry32(5); expect([a(), a()]).toEqual([b(), b()]); });
});
