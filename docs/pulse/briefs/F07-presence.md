# F07 — Présence

## Objectif

Envoyer au back la page consultée et l'activité, et afficher « Qui est connecté ».

## Références

`api-contract.md` §8 ; prototype `Dashboard.dc.html`, tableau « Astreinte baie B », widget « Qui est connecté ».

## À faire

1. Dans `usePresenceSocket` (ou le composable de F02) :
   - `socket.emit('user:ping', { route: to.fullPath, title })` à chaque `router.afterEach` et toutes les 30 s ;
   - `title` = `to.meta.title` traduit, sinon `document.title` ;
   - `visibilitychange` → `hidden` : ping `{ active: false }` (reste en ligne, ne compte pas comme activité) ; retour au premier plan : ping normal immédiat.
2. Store `usePresenceStore` : `GET /presence` au démarrage, puis `presence:update`.
3. Widget `presence` (F04) : avatar avec pastille (vert = active, ambre = idle), nom, page consultée (`title`) ou « Inactif depuis N min » ; `route`/`title` `null` (pas le droit) → nom seul.
4. Ajouter `meta.title` (clé i18n) aux routes qui n'en ont pas.

## Tests

- `presence-ping.spec.ts` : changement de route → ping avec `route` et `title` ; onglet caché → `{ active: false }`.
- `PresenceWidget.spec.ts` : `idle` → libellé d'inactivité ; `route: null` → pas de page affichée.

## Critères d'acceptation

Deux navigateurs connectés : chacun voit l'autre et la page qu'il consulte ; après 2 min onglet caché, l'autre passe « inactif ».
