// CASCADE: shared types + runtime validators.
export const SCALES = ["wafer", "die", "interconnects", "logic", "cells", "transistors", "lattice"] as const;
export type Scale = (typeof SCALES)[number];
export type Die = { id: string; col: number; row: number; defective: boolean; binYield: number };
export type Cell = { id: string; col: number; row: number; thermalC: number; currentMa: number };
export type LogEntry = { id: string; scale: Scale; text: string };

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
export function validateDie(r: unknown): r is Die {
  const o = r as Die;
  return !!o && typeof o.id === "string" && [o.col, o.row, o.binYield].every(isNum) && typeof o.defective === "boolean";
}
export function validateCell(r: unknown): r is Cell {
  const o = r as Cell;
  return !!o && typeof o.id === "string" && [o.col, o.row, o.thermalC, o.currentMa].every(isNum);
}
