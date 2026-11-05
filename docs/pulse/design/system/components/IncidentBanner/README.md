The full-width block that takes the top of the page while a CRITICAL incident is open. At most one per screen; several open incidents stack in it as a list.

Layout: `radius-xl`, `danger-border`, `glow-danger`, background a radial `danger` at 12 % fading into `surface`, `space-10` padding. Left: a `danger-solid` CRITIQUE chip with an `overline` "DEPUIS 20:01:44 · 6 MIN", the headline in `display`, one sentence of impact in `body` `text`, then actions: a destructive primary (the safe remediation), a secondary "Acquitter", a ghost link to the device. Right: a 176 px `MetricRing` and a column of `overline` + value pairs, the most urgent in `metric` `danger-strong`.

Acknowledged state: the glow and the breathing loop stop, the border goes `border-strong`, the chip becomes "ACQUITTÉ PAR <user>" in `text-muted`; the banner stays until the incident resolves.

Motion: the glow breathes on a 3 s loop while unacknowledged; off under reduced motion or the Animations setting. Props to build: `incident`, `acknowledged`, `@acknowledge`, `@remediate`.
