# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Développeurs Vue 3 tiers** qui installent `origam` depuis npm et en dépendent
dans leurs applications. C'est l'audience qui tranche : origam est une
**bibliothèque publique à part entière**, pas un paquet interne rendu public par
commodité.

Cette réponse a une conséquence directe et coûteuse : **chaque rupture d'API se
paie chez quelqu'un d'autre**. Le semver est un engagement, pas une convention
de nommage, et un retrait de prop demande une période de dépréciation plutôt
qu'un retrait sec — même quand la prop ne produisait rien.

L'auteur consomme lui-même la bibliothèque dans ses propres projets (site
marketing du dépôt, applications tierces à lui). Ce sont de vrais usages, et le
premier terrain où une régression se voit ; ce ne sont pas eux qui arbitrent.

## Product Purpose

Un design system Vue 3 qui rend une interface **thémable sans la réécrire**.

Le paquet livre ~80 familles de composants (216 composants en comptant les
sous-composants), environ 177 symboles de composables, un jeu de tokens de
design en CSS et SCSS, et les types TypeScript correspondants.

La réussite se mesure à ceci : un consommateur change de thème — marque, ou
clair/sombre — sans toucher au balisage de ses écrans, et sans écrire de CSS
d'override.

## Positioning

Quatre mécanismes, confirmés par l'auteur, qu'une bibliothèque voisine ne
pourrait pas revendiquer sans les avoir construits :

1. **Theming PROPS-FIRST.** Un thème est un objet `IOrigamTheme` qui configure
   d'abord les **props** de chaque composant (`variant`, `rounded`, `density`,
   `color`, `elevation`, `size`…), les tokens sémantiques ensuite, et les
   variables CSS brutes en dernier recours seulement. Un thème réduit à des
   `cssVars`, sans bloc `components`, est considéré comme faux dans ce projet.

   ⛔ Ce mécanisme repose sur une pièce invisible, documentée en ADR-005 :
   `createOrigam()` installe un mixin global qui écrit les props nommées par le
   thème directement sur `instance.props`, en `beforeCreate`. Les 216 composants
   sont donc thémables **sans qu'aucun n'ait à s'y inscrire**. Avant cela, 39
   composants sur 217 appelaient `useDefaults()` et les 178 autres ignoraient
   silencieusement le bloc `components` d'un thème.

2. **CSS-first, JS en repli.** Grid, `:has()`, `@container`, `@layer`,
   `@property`, `clamp()`, `color-mix()`, `light-dark()`, `anchor()`,
   `@starting-style`, `animation-timeline`… Le JavaScript n'intervient que
   lorsque `CSS.supports()` répond non, via un unique `useCssSupport()` — un
   composant n'appelle jamais `CSS.supports()` lui-même, pour que la matrice
   reste auditable en un seul endroit.

3. **Deux axes indépendants : `data-theme` × `data-mode`.** La marque et le
   clair/sombre sont orthogonaux, là où la plupart des bibliothèques les
   confondent en un axe unique. Un thème de marque n'a pas à redéclarer sa
   variante sombre.

4. **Sémantique HTML et accessibilité non négociables.** Pas de `<div>` quand un
   élément natif existe, respect du content model du W3C, ARIA en complément et
   jamais en remplacement (« No ARIA is better than bad ARIA »). Audit axe-core
   dans la chaîne de livraison.

## Operating Context

Monorepo pnpm à cinq paquets. Seul `packages/ds/` est publié sur npm ; les
autres sont privés et le servent : `docs` (VitePress), `stories` (Histoire),
`tests` (Vitest + Playwright), `marketing` (Nuxt 4).

Le site marketing a un double rôle : c'est la vitrine, et c'est une **démonstration
du DS**. Le corollaire est une règle de diagnostic, pas un slogan : si une section
du marketing exige beaucoup de CSS d'override, le signal est qu'il **manque
quelque chose au DS** — on corrige le DS, on ne bricole pas le consommateur.

L'inspection en cours de la bibliothèque est pilotée par un classeur externe à
huit critères (C1–C8), appliqué aux 216 composants, 177 composables et 6
directives. Il fait autorité sur ce qui reste à faire.

## Capabilities and Constraints

- **Vue 3.5+** en peer dependency ; `vue-i18n` ^11.1 et `vue-router` ^4.5 || ^5
  sont optionnels (composable de locale, composants de lien).
- **Node >= 22** pour construire le paquet depuis les sources. Les consommateurs
  n'ont besoin que de Vue au runtime. Le développement et la CI tournent sur
  Node 24.
- **Licence MIT.** Version courante : 2.16.0.
- **Aucune étape de build de tokens.** Le pipeline Style Dictionary + Tokens
  Studio et l'arbre `packages/ds/tokens/` ont été **supprimés le 2026-08-31**.
  Les feuilles de tokens committées (`src/assets/css/tokens/*.css` et leurs
  jumelles SCSS) **sont** désormais la source de vérité et s'éditent à la main.
  ⛔ Toute documentation renvoyant à `tokens/component/*.json` ou
  `tokens/semantic/*.json` désigne un chemin mort.
- **Grammaire des variables CSS**, stable : `--origam-{composant}---{propriété}`
  (triple tiret), état `--origam-{cmp}--{état}---{prop}`, enfant BEM
  `--origam-{cmp}__{enfant}---{prop}`.
- **Deux faits périmés dans le README**, constatés le 2026-09-07 et non encore
  corrigés : il annonce « ~80 production-ready components » là où la mesure
  donne ~80 *familles* pour 216 composants, et il cite un « companion Figma
  plugin » supprimé le 2026-08-31.
- **Décision ouverte** : aucune politique de dépréciation n'est écrite à ce jour.
  Le statut de bibliothèque publique en appelle une, et le retrait de `label` de
  `IValidationProps` (2026-09-07, marqué *breaking*) est le premier cas qui
  l'aurait utilisée.

## Brand Commitments

Nom : **origam**. Paquet npm : `origam`. Dépôt : `Elyseranet/origam`.
Préfixe de tous les composants : `Origam{PascalCase}` ; en template,
kebab-case (`<origam-btn>`).

Aucun engagement d'identité visuelle n'a été formulé pendant cet entretien.

## Evidence on Hand

- Le paquet est **publié et installable** sur npm (`origam`, 2.16.0, MIT).
- **Aucun consommateur externe connu à ce jour.** L'adoption réelle n'est ni
  mesurée ni constatée.
- Les usages réels sont ceux de l'auteur : le site marketing du dépôt et ses
  propres applications.

⛔ **Rien ne doit être fabriqué à partir de cette absence.** Pas de témoignage,
pas de logo client, pas de chiffre de téléchargement, pas d'étude de cas, pas de
« utilisé par des milliers de développeurs ». S'il faut de la preuve sur une
surface, elle se construit sur ce qui existe — les composants eux-mêmes, la
documentation, les tests — jamais sur une adoption inventée.

## Product Principles

1. **Le thème passe par les props avant le CSS.** Un composant se configure par
   ses props ; on ne descend au CSS que lorsque aucune prop ne couvre le besoin.
2. **Le CSS natif d'abord ; le JS est un repli, pas un raccourci.** Le seul
   critère est de savoir si le code en sort plus simple, jamais si la
   fonctionnalité est récente.
3. **Une rupture se paie chez quelqu'un d'autre.** Bibliothèque publique : le
   contrat de types est un engagement, et une prop qui ne fait rien se retire
   avec un chemin de migration, pas d'un trait.
4. **L'élément natif avant l'attribut ARIA, et le mesuré avant l'affirmé.** Un
   `role` sur un `<div>` est une dette. Une correction n'est annoncée qu'après
   avoir constaté le comportement réel — un type-check qui passe n'est pas une
   vérification.
5. **Ce que la doc affirme doit être vrai.** Une story qui expose un contrôle
   sans effet, ou une doc qui décrit un token supprimé, coûte plus cher qu'une
   documentation absente : elle envoie le lecteur dans le décor avec confiance.

## Accessibility & Inclusion

⛔ **Contrainte réglementaire opposable : European Accessibility Act**
(directive UE 2019/882, applicable depuis juin 2025).

L'EAA vise les produits et services numériques commerciaux — commerce en ligne,
banque, transport, livres numériques. Il ne s'applique donc pas à origam
directement, mais **aux applications construites avec origam**. La conséquence
pour la bibliothèque est nette et engageante : elle doit **permettre à ses
consommateurs de s'y conformer**, et ne jamais être la raison pour laquelle ils
échouent.

La norme harmonisée de référence est **EN 301 549**, qui reprend **WCAG 2.1
niveau AA**.

Ce qui existe aujourd'hui pour le servir :

- audit axe-core automatisé (`npm run test:a11y`) dans la chaîne de livraison ;
- règle de sémantique HTML appliquée à la revue : élément natif avant `role`,
  respect du content model, aucun `<div @click>` ;
- validation du HTML rendu contre le validateur du W3C sur les pages clés.

⛔ **Aucune conformité n'a été mesurée ni déclarée à ce jour.** Ce qui précède
décrit des moyens, pas un résultat vérifié. Aucun document produit à partir de
ce fichier ne doit affirmer qu'origam « est conforme » à l'EAA, à l'EN 301 549
ou à WCAG 2.1 AA tant qu'un audit ne l'a pas établi.
