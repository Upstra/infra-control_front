# F06 — Page Serveurs

## Objectif

Remplacer `ServerListView` + `ServerDetailsView` (+ `ServerCreateView` en tiroir) par l'écran liste + fiche du prototype, en gardant toutes les fonctions actuelles : actions iLO, ping, console SSH, identifiants, VMs et leurs actions, historique, modification, suppression avec contrôle des dépendances.

## Prérequis

**B07** livré (endpoint de détail matériel). Sans lui, l'onglet Matériel se limite au résumé `hardware` (voir §4).

## Références

- Prototype : `Serveurs.dc.html`.
- Données : `api-contract.md` §4, §5, §2 ; endpoints existants pour l'alimentation iLO, ping, SSH, VMs, historique (`/history?entity=server&entityId=`).

## Routes

`/servers` et `/servers/:id` affichent la même vue, sélection synchronisée avec l'URL (comme F05). `/servers/new` (si la route existe) ouvre le tiroir d'ajout.

## À faire

### 1. Synthèse

Serveurs (ESXi / vCenter) · allumés et joignables · à surveiller · éteints ou injoignables · conso iLO totale (+ « N sans mesure ») · entrée d'air max (+ nom du serveur).

### 2. Liste

Recherche (nom, IP, salle, onduleur), filtres état / type / salle, tri par gravité. Ligne : symbole d'état, nom en mono, type, **raison de l'état** (« Sur UPS-B2 en batterie », « PSU 2 absente · entrée d'air 31 °C », « Injoignable depuis … »), CPU + barre.

**Santé d'un serveur** (fonction pure, testée) :
- `down` : hôte `connectionState` ≠ connected, ou éteint ;
- `busy` : action d'alimentation en cours (état local) ;
- `degraded` : onduleur rattaché `onBattery`, `hardware.psu.ok < total`, `hardware.inletC` au-dessus du seuil de la salle, `hardware.health` Warning/Critical, CPU > 90 % ;
- `unknown` : pas encore de métriques ;
- `up` sinon.

### 3. Fiche — en-tête et actions

Pastille d'état, IP · type · salle · onduleur. Boutons : Ping, **Console SSH** (réutiliser `SshAuthModal` + `SshTerminal` dans un `SideDrawer`), **alimentation iLO** (Démarrer si éteint, sinon Redémarrer / Arrêter). Avant Arrêter ou Redémarrer un ESXi qui a des VMs allumées : encadré « esx-03 héberge N VMs allumées… » avec « Migrer les VMs d'abord » (vers Migration) et « Arrêter quand même ». Pas d'iLO ou iLO injoignable → boutons désactivés, avec la raison au survol.

### 4. Onglets

- **Vue d'ensemble** : encadrés (onduleur sur batterie avec compte à rebours d'arrêt, PSU absente, entrée d'air haute, iLO injoignable, serveur injoignable **en signalant si son onduleur l'est aussi**, VM dégradée) ; 6 valeurs (CPU, mémoire, VMs allumées/total, uptime, conso, entrée d'air, chacune avec sa raison si `null`) ; courbe CPU 1 h (`host_cpu`, `scope: 'host'`, `id` = moid) ; liens Salle, Onduleur (avec son état en direct), vCenter, Groupe · priorité.
- **Machines virtuelles** : `/vm?serverId=&includeMetrics=true`, mises à jour par `vmware:metrics`. Démarrer / Redémarrer / Arrêter (endpoints existants), **Arrêter = second clic dans les 3 s**, état transitoire « Arrêt… ». Libellés de cause selon `powerOff.cause`.
- **Matériel** : avec B07, modèle, n° de série, génération d'iLO, santé, conso, ventilateurs, températures en barres avec le trait de seuil, cartes d'alimentation. Sans B07 : entrée d'air, conso, « PSU ok / total », santé, et la mention « Détail des capteurs disponible prochainement ». vCenter sans iLO : expliquer que c'est une appliance virtuelle.
- **Historique** : `/history?entity=server&entityId=` + alertes de la ressource (`/alerts?resourceType=server`, filtrées côté front par `resourceId` si le back n'a pas de filtre par id).
- **Réglages** : nom, IP, priorité d'arrêt (« 1 s'arrête en premier »), salle, onduleur (ceux de la salle + « Aucun », avertissement si autre salle ou aucun), identifiants (`ServerCredentials.vue` existant, masqués par défaut). **Retirer d'Upstra** : bloqué avec message si des VMs sont rattachées (le back renvoie déjà l'erreur de dépendances), sinon deux clics.

### 5. Ajout

`SideDrawer` reprenant les champs de `ServerCreateView` : type, nom, IP, salle, onduleur, priorité, section iLO facultative (IP, identifiant, mot de passe). Doublons nom/IP refusés.

## Tests

- `server-health.spec.ts` : onduleur sur batterie → degraded ; `hardware: null` sans iLO → pas d'alerte matériel ; hôte déconnecté → down.
- `vm-actions.spec.ts` : premier clic Arrêter arme, second dans les 3 s exécute ; après 3 s, désarmé ; état transitoire affiché.
- `power-confirm.spec.ts` : VMs allumées → encadré d'avertissement ; aucune VM → confirmation simple ; pas d'iLO → bouton désactivé.

## Critères d'acceptation

- `mock_ilo` scénario `maquette` : le serveur concerné affiche « PSU 2 absente » et l'entrée d'air en ambre, dans la liste et dans la fiche.
- Scénario `ilo4-no-inlet` : entrée d'air « — » avec « Capteur absent ».
- Toutes les fonctions de l'ancienne fiche sont encore accessibles.
