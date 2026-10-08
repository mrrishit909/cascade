# Architecture

```
model/build.py ──Blender──> source.blend + exports/{die-block,lattice-cell}.glb + renders/poster.png
model/validate.py ─fresh-scene re-import─> exports/validation.json
data/simulators/generate.ts ──> data/generated/{dies,cells,log}.json (seeded, synthetic)
        │                              │
scripts/copy-assets.ts ──────────> apps/web/public/{data,models,posters}
                                       │
apps/web (Next.js 16 static export) ───┘      apps/api (node:http + ws) serves the same JSON on the book's /v1 contract
   App ─ store (external, useSyncExternalStore) ─ Panels (all DOM) + Scene (R3F canvas) + Intro (GSAP)
packages/domain: wafer (die defect field, die yield, cell thermal/current) - pure, tested
packages/schemas: shared types + runtime validators
```

**Scroll controls scale, not page position.** `state.t` (0..6, one unit per scale station: wafer, die, interconnects, logic, cells, transistors, lattice) drives a single camera dolly along the zoom axis; each layer component fades its own opacity in/out as `t` approaches/leaves its index (`layerOpacity`), so crossing a scale boundary never pops geometry in or out.

**Modes.** Normal/Thermal/Power/Yield are overlay color modes applied to whichever layer is currently in view, not separate scenes. Yield coloring is most meaningful at the wafer station and thermal/power at the cells/interconnects stations; the book's text describes yield mode as "pulling back to wafer-level," which this slice simplifies to a color overlay available everywhere rather than forcing a camera jump, documented here as the simplification.

**WebGPU.** Ships WebGL2, same reasoning as the rest of the volume (headless/CI and many real users lack `navigator.gpu`).

**Stack substitutions.** No PostGIS/FastAPI equivalent was needed for this blueprint's data shape (a small deterministic grid); the existing Node API pattern covers it.

**Budgets** (asserted in `tests/e2e/performance.spec.ts`): die-block GLB < 20 KB, lattice-cell GLB < 20 KB, gzipped JS < 750 KB, draw calls < 40, triangles < 30,000.

**A correctness bug found and fixed in this blueprint, retroactively affecting blueprints 01 and 02 too:** see `docs/asset-contract.md`'s closing note on `THREE.InstancedMesh.instanceColor`.

**Not built.** WebGPU compute, a Python numerical service, Docker services beyond web and api, auth.
