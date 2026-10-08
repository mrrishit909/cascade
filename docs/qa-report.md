# QA report

Run on Apple M3 Pro, Chrome (stable), Playwright 1.63, WebGL through SwiftShader. Last full run: 18 e2e passed, 11 unit/API tests passed.

| Matrix row | Covered by | Result |
|---|---|---|
| Intro: first load, skip, reduced motion | demo walk, "reduced motion" test | pass |
| Input: click, keyboard | logbook selection, "keyboard-only" nav test | pass |
| Input: range (zoom scrub) | "zoom scrub moves between scale stations", "out-of-range clamps natively" | pass |
| Input: empty/invalid | idempotent notes POST tested in `apps/api/test/api.test.ts` | pass |
| Scroll: wheel changes world state | wheel-to-scale reuses the volume pattern | by design |
| Mode toggles | "yield mode colors dies and reports the aggregate" | pass |
| Responsive | 375 px: HUD and cell table visible | pass (one size) |
| Motion: reduced | static keyframe list, no GSAP timeline mounted | pass |
| Graphics: success | all WebGL e2e tests | pass |
| Graphics: failure | `?gfx=off` swaps to the poster with zero canvas elements | pass |
| Graphics: slow GPU | SwiftShader median frame 16.7 ms | pass as a bound |
| Visual regression | 7 scale stations against the poster fallback | pass |
| Performance | `tests/e2e/performance.spec.ts` | pass |

**A real correctness bug caught during this blueprint's manual visual check, not by the automated suite**: instanced die/cell colors (yield pink/teal, thermal rainbow) were rendering as the material's flat default color because `THREE.InstancedMesh.instanceColor` stayed `null` forever, a chicken-and-egg bug in the per-frame color-update loop's own guard clause. None of the automated e2e tests caught it, because the visual-regression suite runs against the `gfx=off` poster fallback (a static image, immune to this bug) and the interactive tests only checked that a readout *number* changed, not that the 3D color itself was correct. Fixed here and retroactively in blueprints 01 and 02 (RIFT, AURELIA), which had the identical pattern. **Lesson for the rest of the volume**: when a blueprint's modes are expressed primarily through instanced-mesh color (risk, thermal, power, yield, or similar), add at least one e2e assertion that samples an actual rendered pixel color (not just a DOM readout) before calling the mode "working."
