# CASCADE

Semiconductor chip architecture, thermal and yield intelligence platform (blueprint 03, Advanced Engineering Build Book Vol. VIII). Microscopic cyber-luxury. The public site is static; the Blender asset is scripted.

- Build the asset: `npm run model` (needs Blender 4.5 at ~/Applications). Then `node scripts/copy-assets.ts`.
- Data: `npm run seed` (deterministic, synthetic). Tests: `npm test` (domain + API), `npm run e2e` after `npm run build`.
- Scroll controls scale, not page position: forward zooms from wafer to atomic lattice, reverse zooms back out.
- Multi-agent is the DEVELOPMENT process (see .claude/agents); the product contains no agents.
- Everything in the UI is synthetic die/yield/thermal data. Do not present it as a real wafer survey.
