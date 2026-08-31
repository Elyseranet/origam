# Audit #391 (volet 2) — classes utilitaires vs sélecteur scopé Vue

⛔ Mesure uniquement. Aucun des composants listés ci-dessous n'a été
modifié dans le cadre de ce ticket — l'arbitrage architectural (quoi
corriger, comment, et dans quel ordre) est réservé à l'utilisateur.

## Le chiffre annoncé était invérifiable

Le ticket #391 annonçait **92 composants** exposés au même problème que
`OrigamBtn`, attribué à « un scanner ad hoc de son auteur, jamais
reproduit ». Aucune trace de ce scanner, de sa méthode ni de sa sortie
n'a été retrouvée dans le dépôt (`git log`, `docs/`, `packages/*/scripts`).
Le chiffre ci-dessous est une **remesure complète, indépendante,
reproductible** — script fourni, méthode documentée, liste nommée.

## Mécanisme mesuré

`useColor` / `useBackgroundColor` / `useTextColor` / `useBorder` /
`useRounded` / `useElevation` / `usePadding` / `useMargin` / `useSize`
(directement, ou groupés via `useStateEffect`) émettent, pour une valeur
de prop **tokenisée**, une classe utilitaire globale
(`packages/ds/src/assets/css/tokens/origam-utilities.css`, 66 classes,
ex. `.origam--color-primary`, `.origam--rounded-lg`) au lieu d'un style
inline — c'est la convention « classes-first » du DS (`CLAUDE.md`,
section *Classes-first conventions*).

Une classe utilitaire simple a une spécificité de **(0,1,0)**. Le
sélecteur racine d'un bloc `<style scoped>` Vue compile, lui, en
`.origam-xxx[data-v-hash]` — **(0,2,0)**. Si le composant déclare
**lui-même, sans condition, sur son propre sélecteur racine**, une
propriété CSS que l'une de ces classes gère aussi, sa propre déclaration
gagne **systématiquement**, quels que soient l'ordre de chargement des
feuilles de style ou la valeur portée par chaque côté — la classe
utilitaire est morte à la naissance pour cette propriété, sur ce
composant. C'est exactement le bug qui a été corrigé sur `OrigamBtn`
pour `border` (volet 1), généralisé.

## Méthode

Script : [`packages/ds/scripts/mesures/scan-391-utility-vs-scoped.mjs`](../../packages/ds/scripts/mesures/scan-391-utility-vs-scoped.mjs)
Exécution : `node packages/ds/scripts/mesures/scan-391-utility-vs-scoped.mjs`
(depuis la racine du repo — la résolution de `vue/compiler-sfc` exige
un fichier situé sous `packages/ds/`, `docs/mesures/` n'y a pas accès).

1. **Inventaire des 66 classes utilitaires** — parse
   `origam-utilities.css`, extrait la (les) propriété(s) CSS que chacune
   déclare. 10 familles de propriétés couvertes : `color`,
   `background-color`, `box-shadow`, `border-radius`, `border-width`,
   `border-style`, `padding`, `margin`, `gap`, `font-size`.
2. **Parcours de tous les composants** — 216 fichiers
   `packages/ds/src/components/**/Origam*.vue` (`vue/compiler-sfc` pour
   extraire proprement les blocs `<style scoped>`, le `<script setup>`
   et distinguer les vrais rulesets des `@media`/imbrications SCSS).
3. **Sélecteur racine** — la première règle `.origam-xxx { … }` du
   premier bloc `<style scoped>` (convention constatée sur l'ensemble
   des composants lus : Btn, Card, BtnGroup, Menu, Messages, …).
4. **Déclarations directes** — un marcheur à profondeur de-accolades
   isole les déclarations `propriété: valeur;` posées **directement**
   dans le bloc racine, en excluant tout ce qui est niché derrière un
   modificateur (`&--foo`), un enfant BEM (`&__foo`), un pseudo-état
   (`&:hover`) ou une media query — seules les déclarations
   **inconditionnelles** comptent, car ce sont les seules à toujours
   gagner contre une classe utilitaire quelle que soit la prop passée.
5. **Deux paliers** :
   - **Palier 1 (structurel)** — le sélecteur racine déclare, sans
     condition, l'une des propriétés suivies. Compte aussi les formes
     **longhand** physiques/logiques (`border-top-width`,
     `padding-inline-start`, `margin-block-end`, …) — une longhand
     gagne aussi contre le raccourci (`border-width`,`padding`, `margin`)
     de la classe utilitaire, par les mêmes règles de cascade CSS.
   - **Palier 2 (canal confirmé)** — Palier 1 **et** le
     `<script setup>` du même fichier appelle bien le composable qui
     émettrait la classe utilitaire concurrente (`useStateEffect`, ou
     l'équivalent autonome `useBackgroundColor` / `useTextColor` /
     `useBorder` / `useRounded` / `useElevation` / `usePadding` /
     `useMargin` / `useSize`). Un conflit structurel **sans** prop
     vivante derrière ne peut jamais être déclenché par un consommateur
     — le palier 2 est le compte des **bugs réellement exploitables**.

### Limites assumées (honnêteté de méthode)

- Analyse **statique** (regex + machine à accolades), pas un vrai
  parseur SCSS : robuste sur les ~220 fichiers lus (spot-check manuel
  sur Blockquote / Menu / Messages / Btn — RAS), mais un cas
  syntaxique exotique pourrait échapper au marcheur.
- Le palier 2 vérifie la présence de l'**appel du composable** dans le
  fichier, pas que la classe qu'il retourne atterrisse bien sur
  l'élément racine (variante possible : classe posée sur un enfant BEM
  seulement — dans ce cas le conflit ne s'applique pas à la racine).
  Spot-check manuel sur 3 cas (Blockquote/Menu/Messages) : conforme.
- `gap` n'a **aucun canal utilitaire vivant** trouvé (`origam--gap-*`
  n'est émis par aucun composable observé) — les composants qui
  déclarent `gap` en dur (Bracket, Stepper) sont donc au palier 1 sans
  jamais atteindre le palier 2 pour cette seule propriété (ils y
  figurent via d'autres propriétés).
- Les 18 `OrigamChart*` sont inclus dans la mesure (lecture seule) mais
  **hors périmètre de correction** pour ce ticket — un autre agent y
  travaille.

## Résultat

| Palier | Composants |
|---|---|
| **Palier 1 — structurel** | **115** / 216 fichiers scannés |
| **Palier 2 — canal confirmé (bug réel)** | **71** / 216 fichiers scannés |

Ni 92 (le chiffre du ticket), ni un autre chiffre déjà cité dans cette
campagne, ne correspond exactement à l'une ou l'autre mesure — cohérent
avec le constat de l'utilisateur : les chiffres de tickets ont dérivé
dans les deux sens six fois cette campagne. **71 est le chiffre à
retenir** pour le dimensionnement d'un chantier de correction : c'est
celui où un consommateur passant une prop tokenisée (`color="primary"`,
`rounded="lg"`, `padding="4"`, …) aujourd'hui **silencieusement rien ne
se passe**, sur ce composant précis, pour cette prop précise.

`OrigamBtn` figure dans la liste — pour des propriétés **hors du
périmètre du volet 1** (`padding`, `background-color`, `color`,
`font-size`, `border-radius` étaient déjà des déclarations
inconditionnelles avant ce ticket ; `border-style`/`border-{side}-width`
le sont devenus par le correctif du volet 1 lui-même, qui a dû rendre
la largeur de bordure directionnelle inconditionnelle sur la racine
pour peindre correctement — voir `OrigamBtn.vue`, commentaires `#391`).
Autrement dit : le volet 1 a réparé le rendu du `border`, **pas**
l'architecture sous-jacente que ce volet 2 mesure — Btn reste, comme 60
autres composants non-Chart, un candidat pour le chantier que
l'utilisateur va arbitrer.

## Liste nommée — Palier 2 (71 composants, canal confirmé)

`origam-alert` · `origam-audio` · `origam-avatar` · `origam-avatar-group` ·
`origam-blockquote` · `origam-bottom-nav` · `origam-bracket` ·
`origam-bracket-competitor` · `origam-breadcrumb` ·
`origam-breadcrumb-divider` · `origam-breadcrumb-item` · `origam-btn` ·
`origam-btn-group` · `origam-calendar` · `origam-card` ·
`origam-card-header` · `origam-card-text` ·
`origam-chart-box-plot` · `origam-chart-bullet` · `origam-chart-candlestick` ·
`origam-chart-cartesian` · `origam-chart-gauge` · `origam-chart-heatmap` ·
`origam-chart-honeycomb` · `origam-chart-map` · `origam-chart-pareto` ·
`origam-chart-pictorial` · `origam-chart-polar` · `origam-chart-polar-bar` ·
`origam-chart-pyramid` · `origam-chart-radar` · `origam-chart-sankey` ·
`origam-chart-sparkline` · `origam-chart-streamgraph` · `origam-chart-sunburst` ·
`origam-chart-treemap` · `origam-chart-variwide` · `origam-chart-word-cloud`
(18 `Chart*` — hors périmètre de correction, un autre agent y travaille) ·
`origam-chip` · `origam-container` · `origam-data-list` · `origam-divider` ·
`origam-drawer` · `origam-expansion-panel` · `origam-expansion-panel-header` ·
`origam-expansion-panels` · `origam-field` · `origam-input` · `origam-kbd` ·
`origam-list` · `origam-list-item` · `origam-list-subheader` · `origam-main` ·
`origam-menu` · `origam-messages` · `origam-pagination` · `origam-picker` ·
`origam-row` · `origam-scrim` · `origam-sheet` · `origam-skeleton` ·
`origam-slider-field-track` · `origam-snackbar` · `origam-stepper` ·
`origam-switch-track` · `origam-table` · `origam-tabs` · `origam-title` ·
`origam-toolbar` · `origam-treeview` · `origam-video`

Détail propriété-par-propriété pour chacun : sortie JSON complète du
script (champ `tier2`), reproductible à la demande — non dupliquée ici
pour rester lisible.

## Les options d'arbitrage (dont une 4ᵉ, chiffrée à la demande du chat)

Le ticket #391 en listait trois, toutes des bricolages de spécificité
(élever la spécificité du composant, dupliquer la classe utilitaire en
`!important`, ou réordonner l'injection CSS). Une quatrième a été
signalée en cours de mission : **`@layer`**.

| # | Option | Coût | Casse quoi | Rend obsolète |
|---|---|---|---|---|
| 1 | Spécificité (`:where()` sur le composant, ou monter la classe utilitaire) | Faible par composant, x71 à répéter | Rien en soi, mais `:where()` sur CHAQUE règle racine des 71 est une réécriture fichier par fichier | Rien — patch local, pas d'architecture |
| 2 | `!important` sur les 66 classes utilitaires | Trivial (1 fichier généré) | Casse l'intention documentée en tête d'`origam-utilities.css` (« `.origam-btn--variant-flat` doit pouvoir battre `.origam--bg-primary` par l'ORDRE de cascade ») — un `!important` global bat AUSSI les modificateurs légitimes qui comptaient sur cet ordre | Le mécanisme d'ordre-de-cascade documenté ; risque de régression visuelle sur des composants qui MARCHENT aujourd'hui |
| 3 | Réordonner l'injection (charger les utilitaires APRÈS le CSS composant) | Trivial config bundler | Rien en théorie, mais spécificité (0,2,0) du composant scopé bat quand même (0,1,0) peu importe l'ordre — **ne résout rien** pour les 71 cas mesurés ici (l'ordre ne joue que si les deux côtés ont la MÊME spécificité) | — (option déjà inopérante pour ce bug précis) |
| 4 | **`@layer`** (`@layer utilities, components;` puis charger les 66 classes dans la couche `utilities` et TOUT le CSS composant dans `components`) | Structurant : une seule fois pour l'ensemble du DS (pas x71) — mais touche l'ordre d'import de **tout** le CSS du DS, `main.scss`, `main.css`, et probablement le pipeline `tokens:build` (Style Dictionary) qui génère `origam-utilities.css` | Rend `:where()` (option 1) et le point 3 (réordonnancement) sans objet — une couche déclarée après gagne **quelle que soit la spécificité**, donc plus besoin de neutraliser `[data-v-xxx]` composant par composant. Risque : tout code qui compte AUJOURD'HUI sur `[data-v-xxx]` pour battre une classe utilitaire (aucun cas identifié dans les 71, mais non exhaustivement vérifié pour les 145 composants restants) s'inverserait | Options 1, 2 et 3 d'un coup — c'est la seule des quatre qui résout la classe ENTIÈRE de bug plutôt que composant par composant |

`@layer` est signalée ici **chiffrée**, comme demandé, mais **non
implémentée** — changement de fond sur les 66 classes utilitaires et
tout le pipeline CSS du DS, réservé à l'arbitrage de l'utilisateur.

## Reproduire la mesure

```bash
node packages/ds/scripts/mesures/scan-391-utility-vs-scoped.mjs
```

Sortie JSON sur stdout : `filesScanned`, `tier1Count`, `tier2Count`,
et le détail `tier1`/`tier2` (fichier, classe racine, propriétés en
conflit) pour chaque composant.
