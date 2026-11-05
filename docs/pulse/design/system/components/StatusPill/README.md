The one way to show a machine state: a glyph, a colour and a word, inside a pill.

Four states, four shapes: `up` filled circle in `success`, `degraded` triangle in `warning`, `down` filled square in `danger`, `unknown` dashed circle in `status-unknown`. The pill fill is the state's `*-surface`, the word is `overline` in the state's `*-text`; `unknown` has no fill. In a dense table drop the pill and keep glyph + word (`caption`, weight 500). A pill may carry a detail after a middle dot: "SUR BATTERIE · 14 MIN".

Props to build: `state: 'up' | 'degraded' | 'down' | 'unknown'`, `label` (the word, translated), optional `detail`, `bare` for the table form. Never use colour without the glyph, and never a glyph without the word.
