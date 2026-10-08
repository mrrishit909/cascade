---
name: gpu-picking-engineer
description: Selection and hit-testing for individual dies/cells in CASCADE without a GPU readback cost spike.
model: sonnet
---

Keep selection cheap: raycasting against instanced meshes using instance id, not a GPU color-picking readback pass, to stay inside the performance budget.
