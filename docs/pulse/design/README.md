# Lire les prototypes

Les trois fichiers `prototypes/*.dc.html` sont les écrans jouables conçus dans Claude Design. Ils ne s'ouvrent pas seuls dans un navigateur (il leur manque le runtime de l'éditeur) : **ils se lisent comme du code source**.

## Structure d'un fichier

- `<helmet><style>` : les classes d'interaction (hover, transitions, keyframes, `.nomo` pour couper la motion, media queries). C'est la référence pour les états et les animations.
- Le balisage entre `<x-dc>` et `</x-dc>` : la mise en page exacte, avec les styles en ligne. `{{ … }}` est une valeur calculée ; `<sc-for list>` une boucle (`v-for`) ; `<sc-if value>` une condition (`v-if`).
- `<script type="text/x-dc">` : une classe `Component` dont `renderVals()` calcule tout ce qu'affiche l'écran. C'est la référence pour **les règles d'affichage** : tri des listes, choix des couleurs selon l'état, textes des encadrés, cas `null`.

## Correspondance styles en ligne → tokens

Les prototypes écrivent les couleurs en dur. Dans l'app, **toujours passer par les tokens** (F01) :

| Valeur dans le prototype | Token |
|---|---|
| `#07080a` | `page` |
| `#0d0f13` | `surface` |
| `#13161c` | `surface-raised` |
| `#1c2029` | `border` |
| `#2a2f3a` | `border-strong` |
| `#ffffff` (texte) | `text-strong` |
| `#c7cdd8` | `text` |
| `#7a8294` | `text-muted` |
| `#4b5261` | `text-faint` |
| `#2563eb` / `#3b82f6` / `#60a5fa` | `primary` / `primary-hover` / `primary-text` |
| `#22c55e` / `#86efac` | `success` / `success-text` |
| `#f59e0b` / `#fcd34d` | `warning` / `warning-text` |
| `#ef4444` / `#dc2626` / `#fca5a5` / `#f87171` | `danger` / `danger-solid` / `danger-text` / `danger-strong` |
| `#7f1d1d` | `danger-border` |
| `#14532d` | `success-border` |
| `rgba(…,.1x)` sur fond d'état | `*-surface` |

Rayons : 6 / 10 / 16 / 24 / 999 = `radius-sm/md/lg/xl/full`. Espacements : 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 = `space-1…10`.

## Ce qu'il ne faut PAS reprendre

- **Les données en dur** (onduleurs, serveurs, VMs, événements) : tout vient de l'API.
- **La simulation** : `tick()`, `setInterval`, la décharge de batterie, l'horloge qui avance, `series()` qui fabrique des courbes. Dans l'app, ce sont les sockets et `/metrics/series`.
- **Le sélecteur « Incident / Nominal »** de l'en-tête du Dashboard : c'est un outil de démo.
- **L'interrupteur « Animations » dans l'en-tête** : dans l'app, il vit dans Paramètres (F01, F09).
- **Le `localStorage` des tableaux** : les tableaux sont sauvegardés par `/dashboard/layouts`.
- **Les identifiants affichés en clair** dans l'onglet Réglages des serveurs : ce sont des faux ; l'app reprend son mécanisme existant (`ServerCredentials.vue`).

## Écrans

| Prototype | Route(s) de l'app | Brief |
|---|---|---|
| `Dashboard.dc.html` | `/dashboard` | F03, F04 |
| `Onduleurs.dc.html` | `/ups`, `/ups/:id` | F05 |
| `Serveurs.dc.html` | `/servers`, `/servers/:id` | F06 |

Le canvas Claude Design d'origine reste jouable pour voir les animations en vrai (demander le lien à James).
