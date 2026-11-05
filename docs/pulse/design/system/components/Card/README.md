A panel that groups related content on the page, built from Card, CardHeader, CardTitle and CardContent.

Use it for any block of settings, a list, a table or a form. Card supplies `surface`, a `border` hairline, `radius-lg` and `shadow-sm` (a top highlight, not a drop shadow); on hover the border moves to `border-strong` in 120 ms. CardHeader adds `space-6` padding and lays the title, an optional `overline` count and actions on one row; CardTitle sets `card-title` in `text-strong`; CardContent adds `space-6` padding. A card in CRITICAL state swaps its border for `danger-border` and adds `glow-danger`.

The consumer provides the slot content of each part. Header and title are optional; do not nest cards.
Restyled from `src/shared/components/Card*.vue` for the Pulse direction.
