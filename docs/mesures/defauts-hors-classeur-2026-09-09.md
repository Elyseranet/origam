# Défauts trouvés EN RÉPARANT, absents du classeur — 2026-09-09

Ce document liste ce que les campagnes bloquants (12 lots) et majeurs (6 lots)
ont trouvé **et qui ne figurait dans aucune ligne du classeur**. Il complète le
classeur ; il ne le remplace pas.

Il existe parce que le rapport inverse est le plus frappant de ces deux
campagnes : sur ~60 défauts *annoncés* par le classeur, la très large majorité
était **déjà réparée**, et cinq lots sur douze n'ont touché **aucun** fichier de
`packages/ds/src/`. Pendant ce temps, les défauts réels arrivaient par un autre
canal — celui de la réparation.

---

## A. Défauts produit, invisibles au classeur

| # | défaut | pourquoi le classeur ne pouvait pas le voir |
|---|---|---|
| 1 | **`--origam-row---density: 0` sans unité** → `calc(-4px + 0)` invalide → le navigateur jette la déclaration ENTIÈRE. La gouttière par défaut était morte **pour tous les consommateurs**. | La ligne était notée **« conforme »**. Le test vérifiait que trois valeurs *diffèrent* (0 / -12 / +4) — c'est vrai. La progression voulue était **-12 / -4 / +4**. |
| 2 | **`--origam-btn-group---density: 0`** — même motif, latent (masqué par une classe de densité qui pose toujours `0px`). → **#568** | Aucun critère ne cherchait la déclaration nue dans un `calc()`. |
| 3 | **Row et Col à deux échelons d'écart** : padding `12px` contre marge `-4px`. Chaque grille rentrait de 8px dans son conteneur. | Le classeur mesurait les composants isolément, jamais leur accord. |
| 4 | **`update:loopMode` jamais relayé** (Audio). `v-model:loop-mode` compile en assignation : l'événement de l'enfant est consommé. → **#566** | La garde `unemitted-declarations` reste **verte** — l'emit existe *ailleurs* dans le fichier. |
| 5 | **`update:modelValue` émis mais non déclaré** (Drawer) — relié une seconde fois via `$attrs` sur le `<nav>` racine. | Le critère cherchait l'inverse (déclaré jamais émis). |
| 6 | **Faute de frappe de token rattrapée par son repli**, deux occurrences indépendantes : `--origam-field-input---padding-top` (Field) et `--origam-inline-edit---actions-gap` (InlineEdit). | **Strictement invisible** : le rendu est identique (36px → 36px, mesuré). Aucun test de rendu ne peut l'attraper. |
| 7 | **Variantes `solo`/`filled` de Field sans canal de theming** — littéral `20px` au niveau élément, qui bat `:root`. | Le classeur ne mesurait pas par variante. |
| 8 | **~75 chaînes en dur dans la seule famille Chart** (50 + 25 sur les deux moitiés). | Le classeur en annonce **11 pour le DS entier**. Voir section C. |
| 9 | **`Radar` et `Streamgraph` écrivent le pluriel en dur** : « 1 axes », « 1 time points ». | Aucun critère ne regardait l'accord. |
| 10 | **InlineEdit : le champ n'a aucun libellé** (`hasLabel = !!(props.label \|\| slots.label)`, ni l'un ni l'autre n'est passé). Nom accessible **nul** si `placeholder=""`. | C6 le notait autrement, et 3 de ses 5 constats sur ce composant étaient des **faux positifs**. |
| 11 | **InlineEdit : deux commandes homonymes** — le bouton d'affichage et le crayon produisent la **même** chaîne `Edit {valeur}`. Deux tabulations, une seule action. | — |
| 12 | **FileField : 4 props mortes**, dont `chipProps` **masquée par un `computed` homonyme**. | Le composant est **exclu** de la garde (voir C4), et l'audit statique ne voit pas le masquage : l'identifiant *est* dans le template. |
| 13 | **`bottom-nav.spec.ts` ouvrait une Variant supprimée** → timeout 30 s à chaque exécution, sur du code correct. | — |
| 14 | **Sélecteur Vuetify orphelin** `+ .v-row` dans `OrigamRow.vue:174` — occurrence unique du dépôt. | — |
| 15 | **Dialog : le contenu hors de `.origam-card__content` est inatteignable** — 1219 px sous le viewport, aucun ancêtre défilable. → **#563** | Disjoint de #419 ; la carte *grandit*, elle n'est pas tronquée. |

---

## B. Défauts systémiques, mesurés à l'échelle du catalogue

| # | défaut | portée mesurée |
|---|---|---|
| 16 | **Redéclaration scopée qui écrase le thème** — `.origam-x[data-v-hash]` (0,2,0) bat `:root` (0,1,0). La valeur du thème est calculée **puis écrasée**. → **#607** | **48 composants, 273 tokens.** Plafond, pas compte de défauts : une part est de la dérivation d'instance légitime. |
| 17 | **Bloc `<style>:root{}` non scopé**, injecté **après** les feuilles → les défauts du composant **écrasent les thèmes de marque**. → **#569** | **22 composants.** Mécanisme distinct du précédent (ordre d'injection, pas spécificité) ; les deux se cumulent. |
| 18 | **Fossile du pipeline supprimé** : `--origam-grids__*`, 36 occurrences / 18 noms dans un thème marketing, qu'aucun composant ne lit. | 0 dans `packages/ds`. |

---

## C. ⛔ Les instruments de mesure eux-mêmes — cinq pris en défaut

C'est la conclusion la plus importante de ces deux campagnes, et elle explique
pourquoi le classeur ment **dans les deux sens**.

| # | instrument | défaut mesuré |
|---|---|---|
| 19 | **Détecteur C8** | Aveugle à toute chaîne placée **derrière un opérateur** (`??`, `\|\|`, `?:`, un `return` de branche). Un gabarit n'est vu que s'il est l'**expression de premier niveau**. Balayage : **7 occurrences manquées, 3 vues**. `OrigamAudio` était classé « conforme / 0 » au commit même où il portait deux chaînes anglaises. **Le compte 207/9/11 est un plancher** — la seule famille Chart le dépasse d'un facteur ≥ 7. → **#567** |
| 20 | **Canal C7 « contrôle MENTEUR »** | Déclaré, appelé, rapporté — et **jamais rempli**. Il rendait « aucun » sur les 208 stories. Réparé : **13 composants** en défaut, zéro signalé auparavant. |
| 21 | **Porte a11y** | Construit des URL `stories-components-stories-…` ; le catalogue ne connaît que `components-stories-…`. **0 des 208 stories atteignable.** Verte sans rien regarder. → **#575** |
| 22 | **Garde `unconsumed-props`** | `218 components analysed, 51 skipped`. Son `PASS` ne couvre que **167 composants**, et l'exclusion n'apparaît que derrière `--why`. A causé une fermeture de ticket à tort (#548, corrigée). → **#608** |
| 23 | **Un grep d'agent** | Motif exigeant **six** tirets après le nom du composant : ne pouvait jamais matcher `--origam-col---padding-block-start`. Rendait `0`, lu comme une mesure. Trois chiffres faux propagés. Signalé par l'agent lui-même. |

**Troisième forme d'aveuglement C8, non couverte par #567** : des libellés qui
ne sont dans **aucun sink ARIA** — du texte visible (`Item ${i+1}`, `Slice ${n}`)
rendu dans un `<text>` SVG puis repris dans l'`aria-label`. Le scanner de
l'agent les a manqués aussi ; ils n'ont été trouvés qu'en relisant la doc.

---

## D. Outillage cassé, silencieusement

| # | défaut | conséquence |
|---|---|---|
| 24 | **Build VitePress cassé sur `develop`** — 3 défauts d'un générateur dans `composables/Commons.md` (interpolation `{{ }}` non échappée, 2 exemples sans balise de code, 13 signatures tronquées). → **#605** | Rendait **les 12 PR rouges** sans qu'aucune ne soit en cause. |
| 25 | **`vrt-docker.sh`** appelle `pnpm -F origam tokens:build`, étape **supprimée le 2026-08-31**. → **#606** | Cassé pour quiconque le lance en local ; la CI ne l'utilise pas, **donc personne ne le voit**. |
| 26 | **`pretest:e2e`** bloque Playwright avant le premier spec **en retournant `exit 0`**. → **#574** | Documenté dans le CLAUDE.md depuis des mois avec la mention « ouvrir un ticket ». Personne ne l'avait fait. Le `#46` cité partout est une PR sans rapport. |
| 27 | **Hook pre-commit** : lint tout le dépôt au lieu des fichiers indexés. → **#564** | ⚠️ **Requalifié** : le hook avait **raison** de supprimer la directive `eslint-disable` inutilisée. C'est la consigne du PM de la restaurer qui maintenait le lint rouge. |
| 28 | **Config a11y** ignore `E2E_HISTOIRE_PORT` et tape `:6006`. → **#570** | Mesure le build du worktree voisin. |
| 29 | **Suite a11y** ne balaye **aucun** composant Media. → **#573** | — |
| 30 | **Création de worktrees** : au moins 4 agents ont démarré sur `67fc70fc`, **974 commits** derrière `develop`. Rien ne le signalait. | Une heure perdue à réparer un instantané de la release 2.14.0. |

---

## E. Piège de méthode, à connaître avant de mesurer C8

**Sous `en`, une chaîne anglaise en dur et sa traduction correcte sont
identiques octet pour octet.** Un test qui n'exerce que l'anglais **passe avec
le défaut intact**.

Conséquence directe : **Playwright contre Histoire ne peut pas trancher un
défaut C8**, puisque Histoire tourne sous `en`. Toute assertion doit monter sous
`fr` et épingler la valeur absolue des deux côtés.

Un lot a laissé son port e2e inutilisé pour cette raison, à dessein.
