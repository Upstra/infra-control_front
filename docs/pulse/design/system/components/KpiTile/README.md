A single headline figure with its context: icon and overline label, the value in `metric`, and one line saying whether it is fine.

Layout: `surface`, `border`, `radius-lg`, `shadow-sm`, `space-6` padding, `space-6` between its three rows. Header: 16 px Lucide icon in `primary-text` and an `overline` label. Value: `metric` in `text-strong`, with a secondary part (`/ 151`, `W · 57 %`) in `card-title` `text-muted`, baseline-aligned. Footer: either a state line (state icon + `caption` in the state's `*-text`) or a 6 px progress bar with a soft glow.

Over threshold the tile switches to warning: `warning` border, a radial `warning-surface` tint from the top right, value and footer in `warning-text`. Never more than four tiles in a row; never a red tile here (critical goes to IncidentBanner).

Props to build: `icon`, `label`, `value`, `suffix`, `state`, `note`, optional `progress`.
