# Asset contract

## die-block.glb
Root empty `DieBlock`. `DieBody` (the silicon mass) and `DieTrace` (a copper surface line, illustrative) share one pivot. The browser instances `DieBody` once at the die scale station; `DieTrace` is asset-only, not instanced at runtime.

## lattice-cell.glb
Root empty `LatticeCell`. `LatticeSite` (an iridescent sphere) is instanced in a 6x6x3 grid at the deepest zoom station. `LatticeBond` is present for a future higher-fidelity pass; not instanced at runtime.

Both assets are procedural primitive composition from `model/build.py`.

## A real bug found and fixed here
`THREE.InstancedMesh.instanceColor` is `null` until `setColorAt` is called at least once; a per-frame color-update loop that bails out early when `instanceColor` is still `null` can never reach the call that would create it, so the color never updates (the mesh renders in its default white, tinted only by scene lighting). Fixed by calling `setColorAt` once per instance in the matrix-setup effect (which runs unconditionally), so `instanceColor` exists before the per-frame update loop's guard ever runs. The same bug was found and fixed retroactively in blueprints 01 (RIFT) and 02 (AURELIA); see each repo's git history.
