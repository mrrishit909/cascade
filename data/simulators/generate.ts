// Synthetic CASCADE wafer, die cells and logbook. Deterministic. Not a real fab record.
import { mkdirSync, writeFileSync } from "node:fs";
import { dieDefective, dieBinYield, cellThermalC, cellCurrentMa, WAFER, DIE } from "../../packages/domain/src/index.ts";
import type { Die, Cell, LogEntry } from "../../packages/schemas/src/index.ts";

const dies: Die[] = [];
for (let col = 0; col < WAFER; col++) for (let row = 0; row < WAFER; row++) dies.push({ id: `die-${col}-${row}`, col, row, defective: dieDefective(col, row), binYield: dieBinYield(col, row) });
const cells: Cell[] = [];
for (let col = 0; col < DIE; col++) for (let row = 0; row < DIE; row++) cells.push({ id: `cell-${col}-${row}`, col, row, thermalC: cellThermalC(col, row), currentMa: cellCurrentMa(col, row) });
const log: LogEntry[] = [
  { id: "log-1", scale: "wafer", text: "Laser scan complete. 64 dies mapped." },
  { id: "log-2", scale: "die", text: "Representative die selected for cross-section." },
  { id: "log-3", scale: "interconnects", text: "Interconnect routing resolved to city-scale roads." },
  { id: "log-4", scale: "logic", text: "Logic block boundary traced; hotspot confirmed near core." },
  { id: "log-5", scale: "cells", text: "Standard cell grid resolved." },
  { id: "log-6", scale: "transistors", text: "Transistor-level detail visible." },
  { id: "log-7", scale: "lattice", text: "Atomic lattice aligned to the navigation grid." },
];
mkdirSync(new URL("../generated", import.meta.url), { recursive: true });
const out = (n: string, v: unknown) => writeFileSync(new URL(`../generated/${n}.json`, import.meta.url), JSON.stringify(v));
out("dies", dies); out("cells", cells); out("log", log);
console.log(`CASCADE seeded: ${dies.length} dies, ${cells.length} cells, ${log.length} log entries`);
