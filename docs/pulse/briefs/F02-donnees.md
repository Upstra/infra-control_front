# F02 — Couche données : types, API, sockets, stores

## Objectif

Brancher toute la nouvelle API (`api-contract.md`) une seule fois, proprement, pour que les pages (F03 à F08) ne fassent que lire des stores.

## Constat dans le code

- Axios singleton `src/services/api.ts` (JWT + refresh).
- Sockets créés au cas par cas : `features/presence/composables/usePresenceSocket.ts`, `features/vmware/store.ts`, `features/migration/store.ts`.
- Types par feature dans `features/<x>/types.ts`.

## À faire

### 1. Types

Dans les `types.ts` des features concernées, exactement selon `api-contract.md` :
`UpsTelemetry`, `BatteryStatus` (étendu : `onBattery`, `batteryPercentage`, `loadPercent`, `telemetry`), champs `nominalPowerW` / `effectiveNominalPowerW` / `nominalPowerSource` / `movedServerIds` sur `Ups` ; `Alert`, `AlertTransition`, `AlertSummary` ; `FeedItem`, `FeedPage` ; `VmHealth`, `PowerOff`, `VmTelemetry` ; `HostMetrics` ; `ServerHardware` ; `RoomEnvironment` + `inletWarnC` / `inletCritC` ; `MetricSeries` ; `PresenceView` ; nouveaux `WidgetType`. **Tous les champs matériels typés `| null`.**

### 2. API

Un module par domaine, dans le `api.ts` de chaque feature :
- `alerts` : `list(params)`, `summary()`, `get(id)`, `acknowledge(id)`, `unacknowledge(id)` ;
- `events` (nouvelle feature `features/events/`) : `feed({ limit, cursor, from, to })` ;
- `metrics` (nouvelle feature `features/metrics/`) : `series({ metric, scope, id, range })` ;
- `ups` : `get(id)` avec `batteryStatus`, `update(id, { …, nominalPowerW, roomId, moveServers })` ;
- `vms` : `list({ serverId, includeMetrics: true, health })` ;
- `servers` : `hostsMetrics()` ;
- `rooms` : `environment(id)`.

### 3. Sockets

`src/composables/useNamespaceSocket.ts` : un socket **partagé par namespace** (`/ups`, `/alerts`, `/vmware`, défaut pour la présence), token dans `auth: { token }`, reconnexion avec le token rafraîchi (réutiliser `onTokenChange`), fermeture au logout. Remplacer les créations ad hoc existantes par ce composable quand c'est sans risque.

### 4. Stores Pinia

| Store | État | Sources | Sockets |
|---|---|---|---|
| `useAlertsStore` (`features/alerts/`) | `summary`, `open[]` (triées sévérité puis date), `byId` | `/alerts/summary`, `/alerts?status=open&limit=100` | `/alerts` : `alert:*` met à jour `open`, `alerts:summary` met à jour `summary` |
| `useUpsLiveStore` (`features/ups/`) | `statusById` | `/ups` (cache) | `/ups` : `battery:status` remplace, `battery:status-changed` mémorise `at` (début de coupure) |
| `useVmwareLiveStore` (`features/vmware/`) | `vmsByMoid`, `hostsByMoid` | `/vm?includeMetrics=true`, `/server/hosts/metrics` | `/vmware` : `vmware:metrics` **fusionne par `moid`** (diff), `vmware:vm-powered-off` met à jour `powerOff` |
| `useFeedStore` (`features/events/`) | `items`, `nextCursor`, `loading` | `/events/feed` | se recharge en tête sur `alert:*` |

Chaque store expose un état de chargement et d'erreur ; une erreur réseau n'efface jamais les dernières valeurs **mais** les marque comme périmées (`stale: true`) pour que l'UI puisse le signaler.

### 5. Séries temporelles

Composable `useMetricSeries(params)` : appel `/metrics/series`, cache mémoire 15 s par combinaison, état `unavailable` sur **503 `HISTORY_UNAVAILABLE`** (l'UI affiche « Historique indisponible » à la place de la courbe seulement), erreur distincte sur 400.

## Tests

- `alerts.store.spec.ts` : `alert:opened` ajoute ; `alert:resolved` retire ; `alerts:summary` remplace le compteur.
- `vmware-live.store.spec.ts` : un diff ne modifie que les VMs reçues ; clé `moid` ; `powerOff` appliqué.
- `useMetricSeries.spec.ts` : 503 → `unavailable` ; deuxième appel < 15 s → cache ; 400 → erreur.

## Critères d'acceptation

- Avec la stack démo en scénario coupure : les stores alertes et onduleurs se mettent à jour **sans recharger la page**.
- Un seul socket par namespace dans l'onglet Réseau.
- Aucune page ne fait d'appel direct à axios pour ces données : elles passent par les stores.
