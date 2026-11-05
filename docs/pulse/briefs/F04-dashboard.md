# F04 — Tableaux de bord personnalisés

## Objectif

Remplacer le dashboard actuel par celui du prototype : plusieurs tableaux en onglets, édition « ordre + largeur », catalogue de widgets, et les nouveaux widgets branchés sur la vraie API.

## Références

- Prototype : `Dashboard.dc.html` (onglets, barre d'édition, barre d'outils par widget, tiroir catalogue, glisser-déposer, chaque widget).
- Données : `api-contract.md` §7 (layouts, KPI), §2, §3, §4, §6, §8.

## Constat dans le code

`features/dashboard/` : `ModularDashboardView.vue`, `DashboardGrid.vue` (positions x/y/w/h), `LayoutManager.vue`, widgets `Stats`, `ActivityFeed`, `Alerts`, `SystemHealth`, `UpsStatus`, `UserPresence`. `vue-draggable-plus` est déjà en dépendance.

## À faire

### 1. Modèle

- Un widget = `{ id, type, title?, position: { x: rang, y: 0, w: 4|6|8|12, h: 1 }, settings }`. Le back valide `w`, un autre `w` = 400.
- Grille CSS 12 colonnes, `grid-auto-flow: row dense`, `gap` `space-5`. Sous 760 px, chaque widget prend toute la largeur.
- Supprimer `resource-usage` des types du front. Les anciens types déjà migrés en base arrivent avec les nouveaux noms.

### 2. Vue

- **Onglets** des tableaux (`GET /dashboard/layouts`), icône maison sur le tableau par défaut, `+` pour en créer un (crée, passe en édition, ouvre le catalogue).
- **Personnaliser** → mode édition :
  - barre en haut : nom du tableau éditable, « Ajouter un widget », « Supprimer le tableau » (pas pour celui par défaut), Annuler (restaure l'état d'avant), Enregistrer (`PUT` du tableau) ;
  - chaque widget : contour pointillé, poignée, nom, « LARGEUR n/12 », boutons ← → (accessibles au clavier), bouton largeur (cycle parmi les largeurs permises du type), retirer ;
  - glisser-déposer avec `vue-draggable-plus`, cible entourée en bleu ;
  - le widget Incident reste visible en pointillés en édition même sans incident, pour pouvoir le placer.
- **Catalogue** dans un `SideDrawer` : un item par type, grisé « DÉJÀ LÀ » si présent.

### 3. Widgets

| Type | Largeurs | Défaut | Source |
|---|---|---|---|
| `incident` | 12 | 12 | `IncidentBanner` (F03) |
| `kpis` | 6, 12 | 12 | `/dashboard/full` : hôtes, VMs (`vmsByHealth`), `maxInletC` (+ serveur et salle), `totalPowerW` / `totalCapacityW` (`null` → « — ») |
| `ups` | 6, 8, 12 | 8 | `/ups` + `useUpsLiveStore` : carte par onduleur (`MetricRing` 64, pastille d'état, charge, autonomie, température, entrée) |
| `vms` | 6, 8, 12 | 8 | `useVmwareLiveStore` + `/vm?health=issues` ; filtre Problèmes / Toutes ; libellés de cause d'arrêt (§4.1) |
| `hosts` | 4, 6, 8 | 4 | `/server/hosts/metrics` : tuiles CPU, ambre si l'onduleur rattaché est sur batterie |
| `events` | 4, 6, 8 | 4 | `useFeedStore`, 7 derniers, nouvelle entrée qui glisse en tête |
| `power` | 4, 6, 8, 12 | 6 | `useMetricSeries({ metric: 'total_power', scope: 'total', range: '1h' })` + valeur courante ; 503 → « Historique indisponible » |
| `presence` | 4, 6 | 4 | F07 |
| `alerts` | 4, 6, 8 | 6 | liste des alertes ouvertes (ancien widget restylé) |
| `system-health` | 4, 6 | 4 | ancien widget restylé ; `uptime` `null` → « — » |

Chaque widget gère : chargement (squelette), erreur (message + Réessayer), vide, et `stale`.

## Tests

- `layout-edit.spec.ts` : déplacer → rangs réécrits 0..n ; largeur hors liste refusée côté front ; Annuler restaure.
- `KpisWidget.spec.ts` : `totalCapacityW: null` → « — » ; température au-dessus du seuil → tuile en warning.
- `WidgetCatalog.spec.ts` : type présent grisé ; ajout en fin de liste avec la largeur par défaut.

## Critères d'acceptation

- Un nouvel utilisateur voit « Tableau principal » créé par le back.
- Un tableau existant migré s'ouvre dans le même ordre de lecture qu'avant.
- Toute la page fonctionne au clavier en mode édition (flèches ← →).
