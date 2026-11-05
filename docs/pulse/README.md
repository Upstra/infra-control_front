# Refonte « Pulse » — dossier front

Tout ce qu'il faut à Claude Code pour implémenter la refonte dans `infra-control_front`. Donner **un brief par session, dans l'ordre**, en commençant chaque session par : « Lis `docs/pulse/README.md`, puis `docs/pulse/briefs/FXX-….md`, et implémente-le. »

## Ce que contient le dossier

| Chemin | Rôle | Source de vérité pour |
|---|---|---|
| `api-contract.md` | Ce que le back (branche `flow`) expose : REST, WebSocket, formats, erreurs | **les données** |
| `design/system/README.md` | Règles du design system Pulse (couleurs, typo, statuts, motion, valeurs nulles) | **les règles visuelles** |
| `design/system/tokens.json` | Tous les tokens (couleurs dark/light, typo, espacements, rayons, ombres) | **les valeurs exactes** |
| `design/system/components/*/` | Fiche + rendu HTML de référence de chaque composant | **les composants** |
| `design/prototypes/*.dc.html` | Les 3 écrans jouables : Dashboard, Onduleurs, Serveurs | **la mise en page et les interactions** |
| `design/README.md` | Comment lire les prototypes, ce qu'il ne faut **pas** reprendre | |
| `briefs/F01…F09` | Le plan de travail front, un brief par session | |
| `back/B07-complements.md` | 3 petits ajouts back à faire avant F06 (pour l'agent back, pas front) | |

En cas de conflit : **le contrat d'API gagne sur les prototypes** pour les données, **le design system gagne sur les prototypes** pour les valeurs visuelles.

## Ordre

| # | Brief | Dépend de |
|---|---|---|
| F01 | [Fondations visuelles](briefs/F01-fondations.md) : tokens, polices, thème sombre par défaut, Element Plus, motion, primitives | — |
| F02 | [Couche données](briefs/F02-donnees.md) : types, API, sockets, stores | F01 |
| F03 | [Alertes globales](briefs/F03-alertes.md) : bandeau d'incident, cloche, pastille CRIT, acquittement | F02 |
| F04 | [Tableaux de bord](briefs/F04-dashboard.md) : widgets, édition ordre + largeur | F03 |
| F05 | [Page Onduleurs](briefs/F05-onduleurs.md) | F02 |
| F06 | [Page Serveurs](briefs/F06-serveurs.md) | F02, **B07** |
| F07 | [Présence](briefs/F07-presence.md) | F02 |
| F08 | [Salles](briefs/F08-salles.md) : seuils et environnement (sans refonte visuelle complète) | F01, F02 |
| F09 | [Harmonisation](briefs/F09-harmonisation.md) : le reste de l'app aux couleurs Pulse, nettoyage | tout |

## Avant de commencer

- Lancer la stack démo du back sur la branche `flow` (`infra-control`, `ups_manager`, `mock_ups`, `mock_ilo`). Swagger : `http://localhost:3000/docs`.
- Scénarios utiles pendant le dev : `api-contract.md` §11 (coupure secteur, surcharge, batterie à remplacer, PSU absente, iLO 4 sans sonde).
- Travailler sur la branche `flow` (basée sur `develop`) : une branche `feature/pulse-*` par brief, fusionnée dans `flow` avec `--no-ff`.

## Règles communes à tous les briefs

1. **`null` s'affiche « — »**, avec une raison courte quand on la connaît (« Pas de sonde sur ce modèle », « iLO injoignable »). Jamais 0, jamais une valeur recalculée ou périmée. Un utilitaire unique (`fmt`, voir F01) fait ce travail partout.
2. **Statut = symbole + couleur + mot**, jamais la couleur seule : cercle plein = up, triangle = dégradé, carré plein = down, cercle pointillé = inconnu. Un seul composant (`StatusGlyph` / `StatusPill`).
3. **Valeurs en DM Mono avec `tabular-nums`**, libellés en Geist. Unités avec espace fine insécable : `14 min`, `1 840 W`, `31 °C`.
4. **Textes via vue-i18n, en `fr` et `en`**. Les titres d'alertes et du fil arrivent déjà rédigés en français par le back : les afficher tels quels.
5. **Motion** : uniquement pour montrer un changement (chiffre, anneau, barre), 600–700 ms. Coupée par `prefers-reduced-motion` et par le réglage utilisateur « Animations ».
6. **Accessibilité** : vrais `<button>` et `<a>`, `aria-label` sur les boutons-icônes, contraste 4,5:1 (les tokens `*-text` le respectent), focus visible.
7. **Tests** (vitest) : 2 à 3 cas par fichier de test, pas plus. Pas de commentaires dans le code.
8. **Ne rien casser** : les routes existantes (`/ups/:id`, `/servers/:id`…) restent valides ; les deep links continuent de marcher.
