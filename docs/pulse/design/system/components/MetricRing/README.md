A circular gauge for one percentage (UPS battery, host load), with the value in the middle.

Track in `border`, arc in the state colour: `success` at 60 % and above, `warning` from 40 to 59 %, `danger` under 40 %. In `danger` the arc gets a soft drop-shadow glow. The centre value is DM Mono 300 (`metric` at 176 px, `code` at 64 px) with an `overline` caption under it at the large size.

Motion: the arc eases `stroke-dashoffset` over 700 ms on `cubic-bezier(0.2, 0.8, 0.2, 1)` and the number rolls from its previous value; both stop under `prefers-reduced-motion` or the Animations setting. Sizes: 176 (incident banner), 64 (UPS cards). Props to build: `value`, `size`, `caption`, optional `thresholds`.
