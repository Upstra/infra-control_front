The app's main navigation: a 76 px rail of icons that opens to 248 px with labels on hover or keyboard focus, over the content, never pushing it.

Structure, top to bottom: the brand tile (`primary`, `glow-brand`) with "Upstra" and the environment in `overline`; the operate group (Tableaux de bord, Serveurs, Salles, Onduleurs, Migration); a 1 px `surface-raised` divider; the consult group (Historique, Logs); a flexible spacer; Paramètres; the account button (avatar, username, role).

Items are 44 px tall, `radius-md`, icon 20 px Lucide at 1.75 stroke in `text-muted`; hover and the active page use `surface-raised` and `text-strong`, the active page adds a 2 px `primary-hover` inset bar on the left and `aria-current="page"`. Counts sit right-aligned in `overline`. A section with an open CRITICAL alert shows a `danger` dot with `glow-dot` on its icon (visible collapsed) and a `danger-solid` "N CRIT" pill (visible expanded).

Motion: opening waits 100 ms (no flicker when the pointer crosses it), width eases over 240 ms on `cubic-bezier(0.2, 0.8, 0.2, 1)`, labels fade in 160 ms later; closing is immediate. Opens on `:focus-within` too. Off under reduced motion or the Animations setting. Hidden under 760 px, where a bottom bar or menu takes over.

Props to build: `items` (`to`, `icon`, `label`, `count?`, `critical?`), `user`, `environment`.
