# Performance report

Hardware: Apple M3 Pro laptop, Chrome stable, **software WebGL (SwiftShader)**, 1280 x 800. Command: `node scripts/measure.mjs` after `npm run build` and `node scripts/serve.ts`.

| Measure | Value | Budget |
|---|---|---|
| Transfer (19 requests, uncompressed local server) | 252 KB | n/a |
| JS gzipped (all chunks) | 566 KB | 750 KB |
| die-block GLB / lattice-cell GLB | 3.6 KB / 8.6 KB | 20 / 20 KB |
| Draw calls / triangles / geometries | 12 / 144 / 12 | 40 / 30,000 |
| LCP | 2.9 s | none set |
| CLS | 0 | 0.1 |
| Long-task total during load | 1.9 s | none set |
| Median / p95 frame time | 16.7 / 16.7 ms (60 fps, software) | none set |

Measured at the cells scale station with thermal mode on (one instanced mesh of 36 cells, plus the chamber/wafer layers faded to zero opacity and `visible=false`). Draw calls stay low because each scale station is one or two instanced meshes, never a per-object draw call.

Degradation: frame loop pauses when the tab is hidden; `?gfx=off` and WebGL context loss swap to the poster; reduced motion removes the intro timeline and snaps the camera instead of lerping.
