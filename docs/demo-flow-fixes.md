# Correctifs du parcours démo (branche `flow`)

_Session des 06–08/11/2026. Bugs relevés en rejouant le parcours complet sur la stack démo, base vide, seed `demo-seed.json` importé dans le wizard._

## Résumé

| Branche (mergée en `--no-ff` dans `flow`) | Contenu |
|---|---|
| `fix/demo-flow` | Setup sauté après reset, ping automatique, IDs de découverte, seuil de salle, dark mode du setup, toasts de préférences |
| `feature/servers-discovery` | Widget santé traduit, découverte des VMs depuis la page serveurs, vrais totaux Releases |
| `fix/demo-walkthrough` | Message d'erreur de l'inscription, boutons morts des Paramètres, encadré clair de l'écran Bienvenue |

Commits signés `James ABIB`, sans co-auteur. Le détail back est dans `infra-control/docs/demo-flow-fixes.md`.

## Correctifs

### Le setup était sauté après un reset de la base
- **Cause** : `setup_completed` est stocké dans le `localStorage` et survit à une base vidée ; le router le croyait sans demander au backend.
- **Correctif** (`router/index.ts`) : si le flag est présent, on interroge `/setup/status/authenticated`. Si le backend dit que le setup n'est pas fini, on efface le flag **et** les restes du wizard précédent.

### Ping automatique des ressources
- `setupStore.refreshConnectivity()` envoie toutes les ressources à `/setup/validate` avec `checkConnectivity: true` et pose sur chacune `connected` / `error` (iLO compris pour un ESXi).
- Appelé à l'arrivée sur les étapes Onduleurs et Serveurs, après un ajout, une modification ou un import. Un appel plus récent annule le résultat du précédent.
- Le badge est traduit (« Connecté », « Test en cours… », « Injoignable ») au lieu d'afficher `connected`.

### État initial des serveurs
- Le champ « État » disparaît du dialogue serveur : il n'était pas fiable et enregistrait `active`/`inactive` (illisible pour le reste de l'app). Le ping fixe `UP` / `DOWN` ; la télémétrie VMware/iLO prend le relais une fois le setup appliqué.

### Identifiants de découverte
- `startDiscovery(serverIds: string[])` partout (API, store, composable, composant). Plus de `parseInt` sur un UUID : le bouton « Réessayer » relance enfin la bonne machine.

### Le bloc « Seuils d'entrée d'air » disparaissait
- **Cause** : `v-model` sur un `<input type="number">` renvoie un **nombre** ; `parseThreshold` faisait `.trim()` dessus → TypeError au rendu → le composant disparaissait et l'enregistrement était impossible.
- **Correctif** : `parseThreshold` accepte `string | number` ; test ajouté dans `room-form.spec.ts`.

### Dark mode
- Écran final du setup, encadré de l'écran Bienvenue, cartes Releases : dégradés pastel codés en dur remplacés par les tokens (`bg-page`, `bg-surface-raised`, `border-border`…).
- Quatre titres étaient **invisibles** (Bienvenue, Terminé, Releases, Équipe) : `bg-page bg-clip-text text-transparent` donnait du texte transparent posé sur la couleur du fond. Remplacé par `text-text-strong`.

### Préférences
- Plus de toast « Préférences enregistrées avec succès » à chaque changement (le changement lui-même sert de retour). Un appelant peut encore le demander avec `{ silent: false }`.
- Les boutons « Enregistrer » / « Annuler » de `SettingsLayout` n'avaient aucun handler ; ils sont remplacés par la mention « Les changements sont enregistrés automatiquement ».

### Inscription
- Un email de confirmation différent affichait « Les mots de passe ne correspondent pas » ; nouvelle clé `auth.form.email_mismatch`.

## Nouveautés

### Widget « Santé du système »
- Les composants arrivent avec une `key` stable traduite via `widgets.system_health.components.*` (PostgreSQL, Redis, Hôte Upstra, Bridge Python, Télémétrie vCenter, Télémétrie onduleurs, Prometheus). Un ancien backend sans `key` retombe sur le nom envoyé.
- La ligne « Disponibilité » (toujours vide) est remplacée par le `detail` du backend quand un composant demande de l'attention (ex. « Last vCenter snapshot 420s ago »), suivi du temps de réponse.

### Découverte des VMs depuis la page serveurs
- Bouton « Découvrir les VMs » dans l'en-tête (désactivé sans vCenter ni ESXi).
- Ouvre `ServerDiscoveryDrawer` qui réutilise `VmwareDiscoveryProgress` (nouvelle prop `embedded`) ; à la fin, l'inventaire serveurs et les données VMware live sont rechargés.

### Vrais totaux sur la page Releases
- Les cartes affichent `stats.releases / features / fixes` calculés par le backend sur toutes les notes de version (« — » tant que rien n'est chargé), au lieu de « 100+ / 500+ » inventés.

## Tests

- Nouveaux : `SystemHealthWidget.spec.ts`, cas « nombres » dans `room-form.spec.ts`.
- 91 tests verts sur `dashboard`, `changelog`, `servers`, `vmware`, `setup`, `rooms`, `settings`.

## Vérifié dans la démo

Flag `setup_completed` périmé posé à la main → le wizard s'ouvre quand même · import du seed → onduleur et 4 serveurs « Connecté » sans clic · découverte à 100 % (19 VMs) · écran final lisible en dark · widget santé en français, 7 composants opérationnels · « Découvrir les VMs » depuis la page serveurs : 19 VMs « En ligne » · seuil d'entrée d'air saisi au clavier puis enregistré · page Releases : 40 releases, 49 nouveautés, 7 correctifs · aucun toast en changeant une préférence.

## Reste à faire

- Thème et animations à déplacer dans les préférences personnelles, avec la refonte de la page profil (Subframe).
- Page migration : « Aucune salle » affiché au lieu de la salle de l'hôte.
- Workflow : chantier à part.
