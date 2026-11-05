# F08 — Salles : seuils et environnement

## Objectif

Exposer les nouvelles données de salle. **La page Salles n'a pas encore été redessinée** : ce brief ajoute les données et applique les tokens Pulse, sans inventer une nouvelle mise en page. La refonte visuelle complète viendra avec une maquette dédiée.

## Références

`api-contract.md` §5.2 ; règles visuelles `design/system/README.md` ; composants `Card`, `KpiTile`, `StatusPill`.

## À faire

1. Formulaires de création et de modification de salle : champs optionnels **Seuil d'alerte entrée d'air** (`inletWarnC`) et **Seuil critique** (`inletCritC`), en °C, de 0 à 80, `warn < crit` vérifié côté front, avec l'aide « Sans valeur, Upstra utilise les seuils de l'iLO, sinon 30 / 35 °C ».
2. `RoomDetails.vue` : bloc Environnement en haut avec 3 `KpiTile` :
   - entrée d'air max (`maxInletC`, nom du serveur via `maxInletServerId`, tuile en warning au-dessus de `inletWarnC`) ;
   - conso totale (`totalConsumedW`) ;
   - couverture (« N serveurs sur M remontent leurs capteurs » : `serversReporting` / `serversWithIlo`).
   404 → masquer le bloc. Valeurs `null` → « — ».
3. `RoomListView` : sur chaque salle, une ligne « entrée d'air max · conso », en ambre si au-dessus du seuil.
4. Appliquer les tokens (fonds, bordures, typo) à ces deux vues.

## Tests

- `room-form.spec.ts` : `warn ≥ crit` refusé ; champs vides envoyés en `null`.
- `RoomEnvironment.spec.ts` : au-dessus du seuil → warning ; `maxInletC: null` → « — ».

## Critères d'acceptation

`mock_ilo` avec `inlet?celsius=44` : la salle concernée passe en warning dans la liste et dans le détail.
