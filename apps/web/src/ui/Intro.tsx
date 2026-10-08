"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { live, set, state, useStore } from "../store";

// Steps follow blueprint section 2: 0 wafer floats, 1 laser scan, 2 dies separate, 3 dive to one die, 4 interconnects, 5-6 deeper zoom, 7 lattice + nav grid.
export default function Intro({ onDone }: { onDone: () => void }) {
  const s = useStore();
  const [caption, setCaption] = useState(""), [scanPct, setScanPct] = useState(0);
  const mask = useRef<HTMLDivElement>(null), root = useRef<HTMLDivElement>(null), tl = useRef<gsap.core.Timeline | null>(null);

  const finish = (instant: boolean) => {
    tl.current?.kill(); document.documentElement.style.setProperty("--mask", "200%"); live.scan = 6;
    set({ introDone: true, introStep: 99, t: 6 });
    if (instant && root.current) root.current.style.display = "none";
    onDone();
  };

  useEffect(() => {
    if (s.reduced) return;
    gsap.ticker.lagSmoothing(0);
    const t = gsap.timeline({ defaults: { ease: "power1.inOut" }, onComplete: () => finish(false) });
    tl.current = t;
    const scan = { v: 0 }, zoom = { v: 0 };
    t.call(() => { set({ introStep: 0 }); setCaption("A wafer floats in darkness."); }, [], 0)
      .call(() => { set({ introStep: 1 }); setCaption("A laser scans across it."); }, [], 1.6)
      .to(scan, { v: 100, duration: 2.4, onUpdate: () => setScanPct(scan.v) }, 1.6)
      .call(() => { set({ introStep: 2 }); setCaption("The wafer separates into dies."); }, [], 4.2)
      .call(() => { set({ introStep: 3 }); setCaption("One die is selected."); }, [], 5.6)
      .to(zoom, { v: 6, duration: 9, ease: "power2.in", onUpdate: () => { live.scan = zoom.v; } }, 6.2)
      .call(() => { set({ introStep: 4 }); setCaption("Interconnects become roads at city scale."); }, [], 9)
      .call(() => { set({ introStep: 5 }); setCaption("Diving through logic blocks and standard cells."); }, [], 12)
      .call(() => { set({ introStep: 6 }); setCaption("The silicon lattice fills the screen."); }, [], 14.6)
      .call(() => { set({ introStep: 7, t: 6 }); setCaption(""); }, [], 15.6)
      .to({ v: 0 }, { v: 160, duration: 1.8, ease: "power2.inOut", onUpdate: function () { document.documentElement.style.setProperty("--mask", `${this.targets()[0].v}%`); } }, 15.6);
    return () => { t.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.reduced]);

  if (s.introDone && !s.reduced) return null;
  if (s.reduced) {
    const frames = [["Wafer", "A laser scan separates the wafer into 64 dies."], ["Die", "One die is selected; interconnects resolve into city-scale roads."], ["Lattice", "The zoom reaches the atomic lattice, which aligns into the navigation grid."]];
    return (
      <div className="intro intro-static" ref={root} role="dialog" aria-label="Opening story" data-testid="intro">
        <ol>{frames.map(([d, c], i) => <li key={i}><b>{d}</b> {c}</li>)}</ol>
        <button className="btn primary" onClick={() => finish(true)} data-testid="skip-intro">Enter the grid</button>
      </div>
    );
  }
  return (
    <div className="intro" ref={root} data-testid="intro" data-step={s.introStep}>
      <div className="intro-dark" style={{ opacity: s.introStep === 0 ? 1 : 0 }} />
      {s.introStep === 1 && <div className="scan-line" style={{ left: `${scanPct}%` }} aria-hidden />}
      <p className="caption" role="status">{caption}</p>
      <button className="btn skip" onClick={() => { const t = tl.current; if (t && t.time() < 15.6) { live.scan = 6; t.seek(15.6); } else finish(false); }} data-testid="skip-intro" autoFocus>Skip intro</button>
      <div className="light-mask" ref={mask} aria-hidden />
    </div>
  );
}
