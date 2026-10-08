# Storyboard

| t (wall-clock s) | Frame | Shared element forward |
|---|---|---|
| 0.0 | Darkness, caption "A wafer floats in darkness" | - |
| 1.6-4.2 | A laser scan line sweeps left to right, caption "A laser scans across it" | the scan progress value, visually a moving line |
| 4.2 | Caption: "The wafer separates into dies" - the 64-die grid is already present, just dims/separates visually via opacity | the same `Wafer` instanced mesh |
| 5.6 | Caption: "One die is selected" | - |
| 6.2-15.2 | `live.scan` animates 0 to 6: the camera dollies from the wafer distance to the lattice distance, passing through every scale station | `live.scan`/`state.t`, read by `Rig` and every layer's `layerOpacity` |
| 9.0 | Caption: "Interconnects become roads at city scale" | the same `Interconnects` meshes used post-intro |
| 12.0-14.6 | Captions for logic blocks, standard cells, transistors as the camera passes each station | - |
| 15.6 | Light mask expands from the screen-space lattice point, revealing the HUD | the same `--mask` mechanism as every blueprint in this volume |

**Reduced motion** replaces the above with three static captioned frames (Wafer, Die, Lattice).
