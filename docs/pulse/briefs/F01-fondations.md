# F01 — Fondations visuelles

## Objectif

Poser le socle Pulse dans l'app sans encore toucher aux pages : tokens, polices, thème sombre par défaut, Element Plus aligné, réglage de motion, et les primitives partagées.

## Constat dans le code

- `tailwind.config.js` : `darkMode: 'class'`, couleurs `primary`, `neutral`, `success`, `danger`, polices Inter / JetBrains Mono.
- `src/store/theme.ts` : thème par défaut `light`, puis `prefers-color-scheme`. Le back a maintenant `preferences.theme` à `dark` par défaut.
- Aucune feuille dark d'Element Plus importée.
- Composants partagés : `src/shared/components/` (Card, Modal, BaseToast, ToggleSwitch, ErrorAlert…), icônes Heroicons + Lucide.
- Layout : `src/layouts/views/DefaultLayout.vue` + `layouts/components/TreeNavbar.vue`.

## À faire

### 1. Tokens en variables CSS

- `src/styles/tokens.css` : toutes les couleurs de `design/system/tokens.json` en variables, **canaux RGB** pour garder l'opacité Tailwind (`--c-surface: 13 15 19;`). Valeurs `light` sous `:root`, valeurs `dark` sous `.dark`. Ombres et glows en variables complètes (`--shadow-sm`, `--glow-danger`…).
- `tailwind.config.js` : `theme.extend.colors` qui pointe sur ces variables (`surface: 'rgb(var(--c-surface) / <alpha-value>)'`), `fontFamily.sans = Geist`, `fontFamily.mono = DM Mono`, `borderRadius` `sm/md/lg/xl`, `boxShadow` `sm/lg/xl/glow-*`, `fontSize` pour `display`, `title`, `card-title`, `metric`, `metric-lg`, `overline` (avec `lineHeight` et `letterSpacing`).
- **Garder** les anciennes clés (`primary`, `neutral.light/dark/darker`, `success`, `danger`) pour que les pages pas encore migrées ne cassent pas.
- Utilitaire `.tnum { font-variant-numeric: tabular-nums }`.

### 2. Polices

Geist et DM Mono **auto-hébergées** (l'app tourne souvent sur un réseau interne, sans accès à Google Fonts) : paquets `@fontsource` (vérifier le nom exact : `@fontsource/geist-sans` ou `@fontsource-variable/geist`, et `@fontsource/dm-mono` en 300/400/500), importés dans `main.ts`.

### 3. Thème

- `theme.ts` : priorité `localStorage` → `preferences.theme` (back) → **`dark`**. Ne plus partir de `light`.
- Element Plus : importer `element-plus/theme-chalk/dark/css-vars.css` et surcharger les `--el-*` dans `tokens.css` (fonds = `surface`, bordures = `border`, couleur primaire `#2563eb`, `--el-border-radius-base: 10px`, police Geist). Les composants Element Plus restants doivent se fondre dans Pulse.

### 4. Motion

- Composable `src/composables/useMotion.ts` : `enabled = préférence « Animations » && !prefers-reduced-motion`. Pose la classe `no-motion` sur `<html>` quand c'est coupé.
- `tokens.css` : `.no-motion *, .no-motion *::before, .no-motion *::after { animation: none !important; transition: none !important; }` et la même règle sous `@media (prefers-reduced-motion: reduce)`.
- Persistance du réglage : `preferences.display.animations` quand **B07** est livré ; d'ici là, `localStorage` seul.

### 5. Formatage des valeurs

`src/shared/utils/fmt.ts`, fonctions pures :
- `value(v, unit?, { decimals })` → `"—"` si `null`/`undefined`, sinon nombre arrondi + espace fine insécable (` `) en séparateur de milliers + unité (`1 840 W`) ;
- `duration(seconds)`, `minutes(m)`, `percent(p)`, `clock(iso)` (HH:MM:SS), `since(iso)` (« 6 min ») ;
- jamais de fallback à 0.

### 6. Primitives partagées

Dans `src/shared/components/pulse/`, en suivant chaque fiche de `design/system/components/` :

| Composant | Props principales | Fiche |
|---|---|---|
| `StatusGlyph` | `state: 'up'\|'degraded'\|'down'\|'unknown'`, `size` | StatusPill |
| `StatusPill` | `state`, `label`, `detail?`, `bare?` | StatusPill |
| `MetricRing` | `value: number\|null`, `size: 64\|176`, `caption?`, `thresholds?` ; `null` → anneau pointillé + « — » | MetricRing |
| `AnimatedNumber` | `value: number\|null`, `format` ; défile 600 ms depuis la valeur précédente, coupé par `useMotion` | MetricRing |
| `KpiTile` | `icon`, `label`, `value`, `suffix`, `state`, `note?`, `progress?` | KpiTile |
| `Sparkline` | `points: [ms, value][]`, `min`, `max`, `threshold?`, `tone` ; SVG, pas Chart.js | prototypes |
| `SegmentedControl` | `options`, `modelValue` ; boutons `aria-pressed` | prototypes |
| `SideDrawer` | `open`, `title`, slot ; glisse depuis la droite, focus piégé, Échap ferme | prototypes |
| `SideRail` | `items` (`to`, `icon`, `label`, `count?`, `critical?`), `user`, `environment` | SideRail |

Restyler aussi `Card*`, `Modal`, `BaseToast`, `ToggleSwitch`, `ErrorAlert` selon leurs fiches.

### 7. Layout

`DefaultLayout.vue` : remplacer `TreeNavbar` par `SideRail` (76 px, s'ouvre à 248 px par-dessus le contenu au survol et au focus, caché sous 760 px avec un menu mobile simple). Entrées : Tableaux de bord, Serveurs, Salles, Onduleurs, Migration │ Historique, Logs │ Paramètres, compte. Les compteurs et la pastille CRIT viendront en F02/F03 ; prévoir les props.

## Tests

- `fmt.spec.ts` : `null` → « — » ; `1840, 'W'` → `1 840 W` ; `0` reste `0`.
- `MetricRing.spec.ts` : 38 → couleur danger ; `null` → anneau pointillé et « — » ; changement de valeur sans motion → pas de transition.
- `useMotion.spec.ts` : `prefers-reduced-motion` coupe même si le réglage est actif ; classe `no-motion` posée.

## Critères d'acceptation

- L'app démarre en sombre, fond `#07080a`, polices Geist et DM Mono chargées sans réseau externe.
- Les pages existantes s'affichent encore (anciennes classes Tailwind toujours valides).
- Le rail de navigation remplace l'ancienne barre et s'ouvre au survol sans décaler le contenu.
- Couper « Animations » arrête toute transition et toute boucle.
