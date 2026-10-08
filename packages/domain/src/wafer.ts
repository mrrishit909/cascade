// CASCADE: deterministic synthetic wafer/die/cell field. Not a real fab yield model.
import { mulberry32 } from "./rng.ts";
import { SCALES, type Scale } from "@cascade/schemas";

const N = 32;
function lattice(seed: number) { const r = mulberry32(seed); return Float64Array.from({ length: N * N }, () => r()); }
const L = lattice(3031);
const sm = (t: number) => t * t * (3 - 2 * t);
function noise(x: number, z: number) {
  const xi = Math.floor(x), zi = Math.floor(z), fx = sm(x - xi), fz = sm(z - zi);
  const g = (i: number, j: number) => L[(((j % N) + N) % N) * N + (((i % N) + N) % N)];
  const a = g(xi, zi) + (g(xi + 1, zi) - g(xi, zi)) * fx, b = g(xi, zi + 1) + (g(xi + 1, zi + 1) - g(xi, zi + 1)) * fx;
  return a + (b - a) * fz;
}
const WAFER_DIM = 8, DIE_DIM = 6;
/** True if the die at (col,row) is defective: a radial defect-density field peaking off-center, like a real wafer's edge/hotspot bias. */
export function dieDefective(col: number, row: number): boolean {
  const cx = col - WAFER_DIM / 2 + 0.5, cy = row - WAFER_DIM / 2 + 0.5, r = Math.hypot(cx, cy) / (WAFER_DIM / 2);
  const density = 0.08 + 0.3 * Math.max(0, r - 0.55) + 0.15 * Math.max(0, noise(col * 1.7, row * 1.7) - 0.6);
  return noise(col * 3.1 + 0.5, row * 3.1 + 0.5) < density;
}
export function dieBinYield(col: number, row: number): number {
  return dieDefective(col, row) ? 0 : Math.round((70 + noise(col * 2.3, row * 2.3) * 30) * 10) / 10;
}
export function waferYieldPct(): number {
  let good = 0, total = WAFER_DIM * WAFER_DIM;
  for (let c = 0; c < WAFER_DIM; c++) for (let r = 0; r < WAFER_DIM; r++) if (!dieDefective(c, r)) good++;
  return Math.round((good / total) * 1000) / 10;
}
/** Thermal field across one representative die: a hotspot near the logic core, cooler toward the edges. */
export function cellThermalC(col: number, row: number): number {
  const cx = col - DIE_DIM / 2 + 0.5, cy = row - DIE_DIM / 2 + 0.5, d = Math.hypot(cx, cy);
  return Math.round((45 + 55 * Math.exp(-d * d * 0.18) + noise(col * 4.1, row * 4.1) * 8) * 10) / 10;
}
/** Current draw per cell: correlated with but not identical to thermal (interconnect routing matters more than raw heat). */
export function cellCurrentMa(col: number, row: number): number {
  return Math.round((20 + 180 * Math.max(0, noise(col * 5.3 + 2, row * 5.3 + 2))) * 10) / 10;
}
export function scaleAt(i: number): Scale { return SCALES[Math.max(0, Math.min(SCALES.length - 1, Math.round(i)))]; }
export const WAFER = WAFER_DIM, DIE = DIE_DIM;
