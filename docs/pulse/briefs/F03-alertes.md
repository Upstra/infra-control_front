# F03 — Alertes globales

## Objectif

Les éléments qui signalent un incident partout dans l'app : bandeau d'incident, cloche, pastille « N CRIT » du rail, acquittement.

## Références

- Design : `design/system/components/IncidentBanner/`, `SideRail/` ; prototype `Dashboard.dc.html` (bandeau, cloche, rail).
- Données : `api-contract.md` §2 (alertes), §1 (télémétrie pour les chiffres du bandeau), §9 (plan d'arrêt).

## À faire

### 1. `IncidentBanner`

- Affiche **la plus grave des alertes ouvertes** (`useAlertsStore.open[0]`) si sa sévérité est `critical`. Rien sinon.
- Plusieurs critiques ouvertes : la première en grand, les autres en liste compacte dessous (« + 2 autres incidents »), cliquables.
- Contenu : pastille CRITIQUE + « DEPUIS hh:mm:ss · N MIN » (`openedAt`), `title` et `message` **tels quels**, puis à droite les chiffres de la ressource :
  - `resourceType: 'ups'` → `MetricRing` (`batteryPercentage`), autonomie (`minutesRemaining`), charge (`telemetry.load`), entrée (`telemetry.input.voltage`), lus en direct dans `useUpsLiveStore` ;
  - autres types → pas d'anneau, juste les valeurs de `details.latest` disponibles.
- État acquitté (`acknowledged`) : la lueur et l'animation de respiration s'arrêtent, pastille « ACQUITTÉ PAR <user> » (dernière transition `acknowledged`, via `GET /alerts/:id` à l'ouverture).
- Actions :
  - **Acquitter / Rouvrir** : `POST /alerts/:id/acknowledge|unacknowledge`. **403** → bouton masqué pour cet utilisateur (tester une fois, mémoriser). **409** → rafraîchir le store, toast « Alerte déjà résolue ».
  - **Arrêt propre des VMs** (onduleur seulement) : modale de confirmation qui liste les serveurs alimentés, puis le plan d'arrêt existant (`features/migration`). **400 « already running »** → message clair « Un plan d'arrêt ou de migration est déjà en cours ».
  - **Ouvrir <ressource>** : lien vers `/ups/:id`, `/servers/:id`, etc.
- Placement : en haut de la zone de contenu du **Dashboard**. Sur les autres pages, une version réduite d'une ligne (pastille + titre + Acquitter + lien), pour qu'un incident ne soit jamais invisible.

### 2. Cloche

- Bouton dans l'en-tête des pages, compteur = `summary.open.critical + warning` (rouge s'il y a du critique).
- Clic : popover avec les alertes ouvertes (sévérité, titre, ressource, depuis), chacune cliquable, plus un lien « Tout l'historique ».
- `aria-label` « Notifications, N alertes actives ».

### 3. Rail

`SideRail` reçoit `critical` par entrée : Onduleurs = alertes critiques non acquittées de type `ups_*`, Serveurs = `server_*`/`host_*`, etc. Point rouge lumineux sur l'icône (visible replié) + pastille « N CRIT » (visible déplié).

## Tests

- `IncidentBanner.spec.ts` : aucune critique → rien ; alerte acquittée → pas d'animation et pastille « ACQUITTÉ » ; 409 → toast et rafraîchissement.
- `NotificationBell.spec.ts` : compteur depuis le résumé ; popover liste les alertes ouvertes ; lien vers la ressource.

## Critères d'acceptation

- Scénario coupure sur `mock_ups` : en moins de 15 s, le bandeau apparaît sur le Dashboard, la ligne réduite sur les autres pages, la pastille 1 CRIT sur Onduleurs.
- Acquitter arrête la respiration sur **tous les onglets ouverts** (socket).
- Retour secteur : le bandeau disparaît tout seul.
