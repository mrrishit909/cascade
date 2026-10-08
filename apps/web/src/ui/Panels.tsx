"use client";
import { useEffect, useRef } from "react";
import type { Data } from "../data";
import { set, state, SCALES, scaleIndex, useStore, type Mode } from "../store";

const LABELS: Record<string, string> = { wafer: "Wafer", die: "Die", interconnects: "Interconnects", logic: "Logic", cells: "Standard Cells", transistors: "Transistors", lattice: "Lattice" };
const MODES: { id: Mode; label: string }[] = [{ id: "normal", label: "Normal" }, { id: "thermal", label: "Thermal" }, { id: "power", label: "Power" }, { id: "yield", label: "Yield" }];
const go = (t: number) => set({ t });

function Wafer({ data }: { data: Data }) {
  return (
    <section aria-labelledby="h-wafer"><h2 id="h-wafer">Wafer Yield</h2>
      <p className="lede">64 dies, laser-scanned and binned.</p>
      <dl className="readout"><div><dt>Yield</dt><dd data-testid="yield-pct">{data.yieldPct}%</dd></div><div><dt>Good dies</dt><dd>{data.dies.filter((d) => !d.defective).length} / {data.dies.length}</dd></div></dl>
    </section>
  );
}

function Cells({ data }: { data: Data }) {
  const rows = [...data.cells].sort((a, b) => b.thermalC - a.thermalC).slice(0, 8);
  return (
    <section aria-labelledby="h-cells"><h2 id="h-cells">Standard Cells</h2>
      <p className="lede">Hottest cells on the representative die.</p>
      <table className="obs" data-testid="cell-table"><thead><tr><th>Cell</th><th>Thermal</th><th>Current</th></tr></thead>
        <tbody>{rows.map((c) => <tr key={c.id}><td>{c.id}</td><td>{c.thermalC.toFixed(1)}&deg;C</td><td>{c.currentMa.toFixed(0)} mA</td></tr>)}</tbody></table>
    </section>
  );
}

function Logbook({ data }: { data: Data }) {
  const s = useStore(), sel = data.log.find((l) => l.id === s.selLog);
  return (
    <section aria-labelledby="h-log"><h2 id="h-log">Fab Log</h2>
      <ul>{data.log.map((l) => <li key={l.id}><button className={`row ${l.id === s.selLog ? "on" : ""}`} onClick={() => set({ selLog: l.id })} data-testid={`log-${l.id}`}>{l.text}</button></li>)}</ul>
      {sel && <aside className="note" data-testid="log-detail"><h3>{LABELS[sel.scale]}</h3><p>{sel.text}</p></aside>}
    </section>
  );
}

export default function Panels({ data }: { data: Data }) {
  const s = useStore(), scale = SCALES[Math.round(s.t)];
  const lock = useRef(0);
  useEffect(() => {
    const onWheel = (e: WheelEvent) => { if ((e.target as Element).closest(".panel,.rail,.intro")) return; const n = performance.now(); if (n - lock.current < 700 || Math.abs(e.deltaY) < 20 || !state.introDone) return; lock.current = n; const i = scaleIndex(SCALES[Math.round(state.t)]) + (e.deltaY > 0 ? 1 : -1); if (SCALES[i]) go(i); };
    addEventListener("wheel", onWheel, { passive: true }); return () => removeEventListener("wheel", onWheel);
  }, []);
  return (
    <div className="hud" data-testid="hud">
      <header className="top"><span className="brand">CASCADE</span><span className="gauge" data-testid="gauge">{LABELS[scale]}</span>
        <button className="btn ghost" aria-pressed={s.pauseMotion} onClick={() => set({ pauseMotion: !s.pauseMotion })} data-testid="pause-motion">{s.pauseMotion ? "Resume motion" : "Pause motion"}</button></header>
      <nav className="rail" aria-label="Scale">{SCALES.map((sc, i) => <button key={sc} className={sc === scale ? "on" : ""} aria-current={sc === scale ? "page" : undefined} onClick={() => go(i)} data-testid={`nav-${sc}`}><b>{LABELS[sc]}</b></button>)}</nav>
      <main className="panel" key={scale} tabIndex={-1}>
        <div className="transport">{MODES.map((m) => <button key={m.id} className={`btn ${s.mode === m.id ? "primary" : "ghost"}`} aria-pressed={s.mode === m.id} onClick={() => set({ mode: m.id })} data-testid={`mode-${m.id}`}>{m.label}</button>)}</div>
        <label className="scrub">Scale <input type="range" min={0} max={6} step={0.05} value={s.t} onChange={(e) => go(Number(e.target.value))} aria-valuetext={LABELS[scale]} data-testid="zoom-scrub" /><output>{LABELS[scale]}</output></label>
        <Wafer data={data} />
        <Cells data={data} />
        <Logbook data={data} />
      </main>
    </div>
  );
}
