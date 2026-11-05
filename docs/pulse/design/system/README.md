Upstra is the Vue 3 console of the Infra Control platform: servers, VMs, ESXi hosts, iLO, rooms and UPS events. Its direction is **Pulse**: a near-black console where the state of the infrastructure is carried by light. Calm when everything is up, impossible to miss when something is down.

## Content fundamentals
- Short, literal labels in the operator's language (the app ships `fr` and `en` via vue-i18n). Buttons are verbs: "Acquitter", "Arrêt propre des VMs", never "OK".
- Say what happened, where, and since when: "UPS-B2 est sur batterie · depuis 20:01:44 · 6 min". Error messages say what failed, not who is at fault.
- Numbers keep their unit with a thin space: `14 min`, `1 840 W`, `31 °C`, `0 V`.
- No emoji in the interface and no decorative copy.

## Visual foundations
- **Dark first.** Themes are `dark` (default, the `.dark` class on the root) then `light`. Layers go `page` → `surface` → `surface-raised`; modals sit on `surface-modal`. The page is `#07080a`, near-black, never grey: the glows only read on it.
- **Light instead of borders.** Every card has a `border` hairline plus `shadow-sm`, a one-pixel top highlight. State is shown with light: `glow-danger` on the incident banner and critical cards, `glow-warning` on degraded tiles, `glow-dot` on the LIVE dot. No drop shadows on cards, no glassmorphism, no colour gradients except one dark radial (`danger` at 12 % fading into `surface`) behind the incident banner.
- **Colour has one job each.** `primary` is the only action colour. `success`, `warning`, `danger` and `status-unknown` mark machine state and nothing else. Text uses `text-strong` for names and values, `text` for body, `text-muted` for labels; state text uses the `*-text` tokens, which pass 4.5:1 on `surface`.
- **Status is glyph + colour + word**, never colour alone: filled circle = up, triangle = degraded, filled square = down, dashed circle = unknown. See `StatusPill`.
- **Type.** Geist (`sans`) for every label and sentence; DM Mono (`mono`) for every value an operator compares: hostnames, IPs, %, W, V, °C, durations, timestamps. Mono values use `font-variant-numeric: tabular-nums`. Labels above values are `overline`: mono, 11 px, uppercase, `text-muted`. Both fonts are Google Fonts; the host page loads them.
- **Shape.** `radius-lg` (16) on cards, panels, modals and toasts; `radius-xl` (24) on the incident banner only; `radius-md` (10) on buttons, host tiles and rail items; `radius-full` on pills, the search field and segmented controls.
- **Space.** Page gutter `space-10`, sections `space-8` apart, cards `space-5` apart, `space-6` inside cards, table rows `space-4` vertical (56 px rows). The layout breathes; density comes from the data, not from squeezing it.
- **Hierarchy.** An active incident is a full-width banner above everything else, with the most urgent number in `metric` and its battery in a `MetricRing`. Below it a row of `KpiTile`s; a KPI over threshold gets the warning outline and a radial warning tint.
- **Focus.** A 2 px `primary-text` ring with a 2 px offset.

## Motion
Motion answers "what changed", never decorates an entrance.
- Number changes roll to the new value in 600 ms (odometer or tween), with tabular figures so widths never jump.
- Rings and bars ease their stroke or width over 700 ms on `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- The LIVE dot breathes on a 2 s loop; a critical banner's glow breathes on a 3 s loop. Nothing else loops.
- Hover changes colour or border in 120 ms without moving layout; press scales to 0.98.
- Everything respects `prefers-reduced-motion` and the user's "Animations" setting: values then change in place and loops stop.

## Iconography
Lucide (`lucide-vue-next`) at 1.5–2 px stroke, inheriting `currentColor`; 16 px in labels, 20 px in the rail. Section icons in KPI headers use `primary-text`; state icons use their state colour. Heroicons stay only where existing components already use them.

## Components
- **Cover**, **Card**, **ToggleSwitch**, **ErrorAlert**, **Modal**, **BaseToast**: the five shared primitives of the codebase, restyled for Pulse.
- **StatusPill**, **MetricRing**, **KpiTile**, **IncidentBanner**: the Pulse primitives of the dashboard; the Vue components to build from them are described in each card.
- **SideRail**: the main navigation, shared by every page.
- Every hardware value is nullable: a field the device does not report renders "—" with a short reason ("Pas de sonde sur ce modèle"), never a computed or stale value. An unreachable device shows a dashed ring and empty values, not its last reading.

## Not synced
- Fonts are referenced by name only (Geist, DM Mono from Google Fonts).
- No logo: the mark is a `primary` tile with an activity icon and `glow-brand`.
- Components are Vue single-file components this system cannot run: each has a README and a static HTML rendition.
- The Pulse primitives are not in the codebase yet; their previews are the reference implementation.
