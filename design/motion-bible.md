# Motion bible

## Easing and durations
- Camera: exponential smoothing (`1 - exp(-dt * 2.4)`) along the zoom axis, so jumping between scale stations on the rail never pops.
- Intro: linear scan-line sweep, `power2.in` for the deep zoom (accelerating as it dives), `power2.inOut` for the final mask reveal.

## Camera rules
- The camera moves along a single axis (distance from origin) for the entire experience, intro included: diving deeper is literally moving the same camera closer, never a different camera rig per scale.
- Each layer's opacity fades in/out as a function of distance from its own scale index (`layerOpacity`), so passing through a station is a cross-fade, not a pop.

## Scroll mapping
- Wheel over the stage steps one scale station per gesture (rate-limited 700ms).
- The Scale slider in the panel is the one continuous drag surface, writing the same `state.t` the wheel and rail write.

## Reduced-motion equivalents
- Intro: three static captioned frames.
- Post-intro: camera lerp becomes an instant snap; layer opacity fades are instant rather than continuous (no visual change needed since there's no per-frame animation to remove beyond the camera).

## Purpose audit
Every animated value maps to the zoom/scale position or a selected mode's data (thermal/current/yield). No decorative-only animation exists; the scan-line in the intro is removed under reduced motion specifically because, once skipped, nothing downstream depends on having seen it.
