# F05 — Page Onduleurs

## Objectif

Remplacer `UpsListView` + `UpsDetailsView` par l'écran liste + fiche du prototype, sans perdre aucune fonction actuelle.

## Références

- Prototype : `Onduleurs.dc.html` (synthèse, liste, fiche à 3 onglets, tiroir d'ajout, encadrés, déplacement de salle).
- Données : `api-contract.md` §1, §6, §2.

## Routes

`/ups` et `/ups/:id` affichent **la même vue**. La sélection suit l'URL (`router.replace` en cliquant dans la liste) ; sans `:id`, sélectionner le plus grave. Les liens existants vers `/ups/:id` continuent de marcher.

## À faire

### 1. Synthèse (bandeau de 6 chiffres)

Onduleurs surveillés · sur batterie (`onBattery === true`) · à surveiller (`overload` ou `replaceBattery`) · injoignables (alerte `ups_unreachable` ouverte ou pas de `batteryStatus`) · autonomie minimale (min de `minutesRemaining` non nuls) · puissance (somme des `realPowerW` non nuls) / capacité (somme des `effectiveNominalPowerW`, « capacité partielle » si un seul est `null`).

### 2. Liste

Recherche (nom, IP, modèle), filtres Tous/Problèmes et par salle, tri par gravité : sur batterie → à surveiller → injoignable → en attente → nominal. Ligne : mini `MetricRing` (pointillé si `null`), nom, salle, libellé d'état court (« SUR BATTERIE · 14 MIN », « SECTEUR · CHARGE 83 % »…), autonomie et charge à droite.

### 3. Fiche — Vue d'ensemble

- **Encadré selon l'état** (textes du prototype, passés en i18n) :
  - sur batterie : depuis quand + heure d'arrêt des serveurs + **compte à rebours** = `début de coupure + grace_period_off − maintenant`. Début de coupure : `onBatterySince` (**B07**), sinon `at` du dernier `battery:status-changed`, sinon `openedAt` de l'alerte `ups_on_battery` ;
  - surcharge, batterie à remplacer (insister : **sur secteur**, ce n'est pas une coupure), injoignable, en attente du premier relevé.
- `MetricRing` 176 + 6 valeurs : autonomie, charge (W sur nominal + barre), température (« Pas de sonde sur ce modèle » si `null` alors que l'onduleur répond), entrée, sortie, dernier relevé (`telemetry.collectedAt`, source, modèle).
- **Historique** : `Sparkline` grand format, mesure Batterie / Charge / Entrée V (`ups_battery_charge`, `ups_load`, `ups_input_voltage`, `scope: 'ups'`), période 1 h / 24 h / 7 j, ligne de seuil (40 % batterie, 80 % charge). 503 → « Historique indisponible ».

### 4. Fiche — Serveurs alimentés

Liste (`/ups/:id/servers`) triée par priorité : ordre, nom (lien vers `/servers/:id`), type, état, conso (`hardware.consumedW`), moment de l'arrêt (« dans m:ss » pendant une coupure, sinon « après m:ss sur batterie »). Phrase d'explication avec `grace_period_off` et `grace_period_on`.

### 5. Fiche — Réglages

Nom, IP (validée), salle, délais de grâce (avec leur explication), `nominalPowerW` (indiquer « valeur lue sur l'équipement : N W » si `nominalPowerSource === 'device'`). **Changement de salle** : encadré + choix « Déplacer aussi les N serveurs » (par défaut) / « Laisser les serveurs », envoyé en `moveServers`. Suppression en deux clics. Enregistrer → toast qui résume (y compris `movedServerIds.length`).

### 6. Actions

Ping (existant, état de chargement), « Ajouter un onduleur » dans un `SideDrawer` (validation IP, doublon refusé, l'onduleur apparaît « En attente du premier relevé »). Le mode d'affichage grille/liste des préférences n'a plus d'objet sur cette page : l'ignorer.

## Tests

- `ups-row.spec.ts` : sur secteur avec 9 min → **pas** « sur batterie » ; `batteryPercentage: null` → anneau pointillé ; tri par gravité.
- `ups-countdown.spec.ts` : début de coupure + délai → compte à rebours ; sans `onBatterySince` → repli sur l'alerte ; délai écoulé → « arrêt en cours ».
- `ups-settings.spec.ts` : changement de salle avec serveurs → `moveServers: true` par défaut ; sans serveur → pas de choix ; IP invalide refusée.

## Critères d'acceptation

- `mock_ups` en coupure : la fiche passe sur batterie, l'anneau baisse, le compte à rebours tourne, sans rechargement.
- `scenario/replace-battery` : l'onduleur reste « sur secteur » avec l'encadré batterie à remplacer.
- Aucune valeur inventée : toute donnée absente s'affiche « — ».
