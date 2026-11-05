# B07 — Compléments back pour le front Pulse

À donner à l'agent **back** (repo `infra-control`, branche `flow`). Trois ajouts petits et additifs, repérés en confrontant `api-contract.md` aux maquettes. Mêmes règles que les briefs 01 à 06 : DDD, 2–3 tests par fichier, pas de commentaires, `null` plutôt qu'une valeur inventée.

## 1. Détail matériel d'un serveur

**Pourquoi** : la fiche serveur affiche les capteurs de température, les ventilateurs, chaque alimentation, le modèle, le n° de série et la génération d'iLO. L'API n'expose que le résumé `hardware` (`inletC`, `consumedW`, `psu.ok/total`, `health`), alors que `IloHealthCacheService` a déjà tout en cache.

**À faire** : `GET /server/:id/hardware` →

```json
{
  "collectedAt": "…",
  "generation": "iLO 5",
  "reachable": true,
  "lastSeenAt": "…",
  "system": { "model": "…", "serial": "…", "powerState": "On", "health": "Warning" },
  "thermal": { "inletC": 31, "inletWarnC": 30, "inletCritC": 35, "inletThresholdSource": "room", "sensors": [ { "name": "01-Inlet Ambient", "readingC": 31, "warnC": 42, "critC": 46, "health": "OK" } ], "fans": [ { "name": "Fan 1", "percent": 34, "health": "OK" } ] },
  "power": { "consumedW": 412, "capacityW": 1600, "supplies": [ { "name": "PSU 2", "state": "Absent", "health": null, "capacityW": null, "outputW": null } ] }
}
```

- Lu depuis le cache uniquement. `404` si le serveur n'existe pas ; `200` avec `null` si pas d'iLO ; `reachable: false` + `lastSeenAt` si l'iLO ne répond plus (on garde le dernier relevé marqué comme tel, le front n'affiche alors que l'état d'injoignabilité).
- `inletWarnC` / `inletCritC` = seuils **effectivement appliqués** (salle, sinon Redfish, sinon 30/35), avec leur source.
- Même garde de permission que `GET /server/:id`.

## 2. Début de la coupure sur l'onduleur

**Pourquoi** : la page Onduleurs et la fiche serveur affichent un compte à rebours jusqu'à l'arrêt des serveurs (`début de coupure + grace_period_off`). Après un rechargement de page, le front n'a pas l'heure de début de coupure (le `battery:status-changed` est passé).

**À faire** : ajouter `onBatterySince: string | null` (ISO) à `BatteryStatusResponseDto`. Valeur posée au passage sur batterie, conservée tant que `onBattery` reste vrai, remise à `null` au retour secteur. Stockée avec le cache batterie (Redis).

## 3. Préférence « Animations »

**Pourquoi** : le réglage utilisateur qui coupe les animations doit suivre l'utilisateur d'un poste à l'autre.

**À faire** : ajouter `animations: boolean` (défaut `true`) dans `preferences.display` (jsonb) : défaut de l'entité, DTO de mise à jour, et migration de données qui ajoute la clé aux lignes existantes.

## Tests

- `get-server-hardware.use-case.spec.ts` : cache présent → détail complet ; pas d'iLO → `null` ; iLO injoignable → `reachable: false`.
- `ups-battery-since.spec.ts` : passage sur batterie → `onBatterySince` posé ; relevé suivant sur batterie → inchangé ; retour secteur → `null`.
- `user-preferences.dto.spec.ts` : `display.animations` accepté ; type non booléen refusé.

## Mettre à jour

`api-contract.md` (§1.3, §5.1, nouvelle section préférences), puis le recopier dans `docs/pulse/` côté front.
