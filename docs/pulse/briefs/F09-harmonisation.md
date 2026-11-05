# F09 — Harmonisation et nettoyage

## Objectif

Qu'il n'y ait pas deux apps dans l'app : les pages pas encore redessinées passent aux couleurs Pulse, le réglage Animations trouve sa place, et le code mort part.

## À faire

1. **Restyle sans refonte** (tokens, typo, rayons, `Card`, boutons, champs Element Plus) : Historique, Logs, Migration, Groupes, Utilisateurs, Rôles, Admin, Profil, Changelog, Setup, Connexion et 2FA. Pas de nouvelle mise en page : une maquette viendra pour chacune.
2. **Paramètres** : section Affichage avec
   - thème Sombre / Clair (`preferences.theme`) ;
   - **Animations** (`ToggleSwitch`, `preferences.display.animations` quand B07 est livré, sinon `localStorage`) avec l'aide « Désactive les transitions et les boucles. Ton système peut aussi les réduire. » ;
   - masquer les réglages `defaultUpsView` / `defaultServerView` (plus utilisés depuis F05/F06).
3. **i18n** : toutes les nouvelles chaînes en `fr` et `en`, aucune chaîne en dur dans les composants Pulse.
4. **Code mort** : supprimer `TreeNavbar`, anciens widgets remplacés, `UpsCard`, `ServerCard`, vues de liste en grille, `resource-usage`, et les traductions orphelines. Vérifier avec une recherche d'usages avant chaque suppression.
5. **Icônes** : remplacer Heroicons par `lucide-vue-next` dans les composants touchés.
6. **Passe finale** :
   - recherche de `|| 0`, `?? 0` sur des données matérielles → remplacer par `fmt` ;
   - navigation complète au clavier ;
   - `prefers-reduced-motion` et Animations coupées : rien ne bouge ;
   - thème clair : contrastes OK (les tokens `light` existent).

## Tests

- `settings-display.spec.ts` : bascule Animations → classe `no-motion` posée ; préférence envoyée au back.
- `fmt-usage.spec.ts` (ou règle ESLint) : interdire `?? 0` sur les champs matériels typés `| null`.

## Critères d'acceptation

- Aucune page avec l'ancien fond gris ou l'ancienne police.
- Le build passe, `pnpm lint` propre, couverture des nouveaux composants ≥ 80 %.
