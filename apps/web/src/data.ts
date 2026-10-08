import type { Die, Cell, LogEntry } from "@cascade/schemas";
export type Data = { dies: Die[]; yieldPct: number; cells: Cell[]; log: LogEntry[] };
export const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export async function loadData(): Promise<Data> {
  const g = async <T,>(n: string) => (await fetch(`${base}/data/${n}.json`)).json() as Promise<T>;
  const [dies, cells, log] = await Promise.all([g<Die[]>("dies"), g<Cell[]>("cells"), g<LogEntry[]>("log")]);
  const yieldPct = Math.round((dies.filter((d) => !d.defective).length / dies.length) * 1000) / 10;
  return { dies, yieldPct, cells, log };
}
