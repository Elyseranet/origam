# origam — Changelog

This changelog tracks releases of the `origam` package itself.

⛔ It used to point token-value churn at `tokens/CHANGELOG.md`, on the
grounds that "the design moved" should never block a release of "the code
shipped a new component". That file no longer exists: the Style Dictionary
+ Tokens Studio pipeline, and the whole `packages/ds/tokens/` tree with it,
were removed on 2026-08-31. Token values are now hand-maintained directly in
`packages/ds/src/assets/css/tokens/*.css` and their SCSS twins, so a token
change is an ordinary code change and belongs in the sections below like any
other.

Format inspired by [Keep a Changelog](https://keepachangelog.com).
This project follows [Semantic Versioning](https://semver.org).

---

## [Unreleased]

### Fixed — #818 baseline shrink : `aria-allowed-attr`/`aria-prohibited-attr`/`aria-valid-attr-value` (12 des 25 entrées)

Recompté sur `a11y-violations.baseline.json` (pas repris d'un chiffre cité
ailleurs) : la baseline #818 portait **25 clés / 33 violations** sur 24
composants, dont **12 `aria-allowed-attr`** concentrées sur la famille
`OrigamDataTable*`. Cause commune, pas 12 défauts distincts :
`OrigamTextField` ne posait pas `inheritAttrs: false` alors qu'il
redistribue déjà explicitement chaque attr de fall-through
(`filterInputAttrs` → `rootAttrs` sur `<origam-input>`, `inputAttrs` sur le
vrai `<input>`). Sans ce flag, Vue appliquait EN PLUS le `$attrs` brut sur
la racine `<origam-input>`, qui ne s'y soustrayait pas non plus — doublant
`aria-haspopup`/`aria-expanded`/`aria-controls`/`aria-valuenow`/… sur le
`<div>` wrapper, qui ne porte aucun rôle les autorisant. `role` (prop
déclarée sur `OrigamTextField`) n'atteignait par ailleurs que
`<origam-field>`, jamais le vrai `<input>` — c'est ce défaut exact que le
commentaire `KNOWN_FAILURES` documentait déjà pour `OrigamSelect` (test
`fixme`).

**Correctif à la source** (`packages/ds/src/components/TextField/OrigamTextField.vue`) :
`defineOptions({ inheritAttrs: false })` + `role` désormais aussi lié sur le
`<input>` réel. Élimine, mesuré axe-core en navigateur réel (Playwright +
Histoire statique) :
- `OrigamSelect` — sort de `KNOWN_FAILURES` (`components.spec.ts`), test
  `fixme` → vert.
- `OrigamDataTable`, `OrigamDataTableFooter`, `OrigamDataTableHeaderCell`,
  `OrigamDataTableHeaders`, `OrigamDataTableHeadersCell`,
  `OrigamDataTableRow` — `aria-allowed-attr` disparaît, entrée de baseline
  retirée entièrement.
- `OrigamDataTableGroupHeaderRow`, `OrigamDataTableRows`, `OrigamNumberField`
  — `aria-allowed-attr` disparaît, l'entrée reste pour leur AUTRE violation
  (`button-name` / `color-contrast`), non touchée par ce lot.
- `OrigamDataTableHeadersCellMobile` — `aria-allowed-attr` ET
  `aria-prohibited-attr` disparaissent (même fuite, deux règles axe
  différentes), entrée retirée entièrement.

**Deuxième cause, distincte, deux composants** —
`packages/ds/src/components/ColorPickerField/OrigamColorPickerField.vue` et
`.../DatePickerField/OrigamDatePickerField.vue` posaient un
`aria-haspopup` avec une valeur inventée (`'colorpickerbox'` /
`'datepickerbox'`, jamais un token ARIA valide) sur l'élément
`.origam-field` (via `activator="parent"` d'`OrigamMenu`), sans `role` le
justifiant. Remplacé par `aria-haspopup: 'dialog'` (motif WAI-ARIA « Date
Picker Dialog ») + `role: 'combobox'` sur le même élément — même principe
que `comboboxAriaAttrs` d'`OrigamSelect`. `aria-allowed-attr` ET
`aria-valid-attr-value` disparaissent pour les deux ; `OrigamColorPickerField`
est intégralement retiré de la baseline, `OrigamDatePickerField` y reste
pour son `color-contrast` (non touché).

**Bilan mesuré** : baseline #818 25 clés/33 violations → **17 clés/18
violations**. Suite `pnpm -F @origam/tests test:a11y` complète (226 tests,
catalogue 218/218) : **226 passed**, aucune régression sur les 36
composants à baseline vide. Contrôle positif exécuté : réintroduire l'ancien
comportement fait échouer `a11y — OrigamSelect Default Variant` avec
`aria-allowed-attr`/`aria-prohibited-attr` NON baselinés — la porte capte
la régression, pas seulement l'édition du JSON.

**Laissé de côté, délibérément** (17 clés / 18 violations restent dans
`a11y-violations.baseline.json`, cf. #818) : `color-contrast` (8 instances —
plusieurs agents dédiés au contraste travaillent déjà sur ce périmètre),
`button-name` (3, boutons icône sans libellé — famille distincte),
`scrollable-region-focusable` (3), `aria-required-parent`/`aria-required-children`/
`listitem`/`aria-prohibited-attr` (`OrigamChartMap`, sans lien avec ce
correctif) — un défaut chacun, cause non partagée avec ce lot, non
instruit ici.

Récolte de deux dépréciations posées "pour la prochaine majeure" avant que le
`CLAUDE.md` n'acte que `3.0.0` est réservé à la séparation en modules et que
les ruptures, elles, ne le sont pas — voir "Work priorities and versioning"
du `CLAUDE.md`. `origam` n'a aucun consommateur : les deux ruptures
ci-dessous partent en **mineure**, sans shim ni période de grâce.

### ⚠️ BREAKING — `click:prepend` / `click:append` retirés d'`IBtnEmits` (#443, #577)

`<OrigamBtn>` n'émet plus `click:prepend` ni `click:append` — ni au niveau du
type, ni au niveau de l'exécution. `IBtnEmits` n'`extends` plus
`IAdjacentEmits`, et les `<span>` `origam-btn__prepend` / `__append` ne
portent plus de `@click` du tout : un clic souris dessus ne déclenche plus
rien.

**Pourquoi cette paire précisément, et pourquoi une suppression plutôt qu'un
correctif.** Les deux émissions n'ont jamais été atteignables au clavier :
l'événement partait d'un `<span>` descendant, alors qu'une activation clavier
synthétise son clic sur la RACINE du composant — l'écouteur posé sur le
descendant ne le voit jamais. Le correctif générique appliqué aux dix autres
consommateurs d'`useAdjacent` (promouvoir la zone en `role="button"` + arrêt
de tabulation) est **illégal** ici : `<OrigamBtn>` rend un `<button>` ou un
`<a>`, et le modèle de contenu HTML interdit à tous deux un descendant de
contenu interactif *et* tout descendant portant `tabindex`. Un
`<button type="button">` imbriqué y est tout aussi invalide. La forme était
fausse, pas seulement le balisage : un contrôle qui possède déjà une action
ne peut pas en héberger une seconde — deux actions sont deux boutons,
composés via `<origam-btn-group>`.

**Ce qui NE bouge PAS** : les slots `prepend` / `append` (`IBtnSlots extends
IAdjacentSlots`) restent intacts, ainsi que les props `prependIcon` /
`appendIcon` / `prependAvatar` / `appendAvatar` — un contenu décoratif ou
informationnel en prepend/append reste parfaitement légitime, seule
l'émission d'un clic disparaît.

**Preuve du comportement retiré** — A/B contre le commit parent, fonctionnel
et pas seulement typé : `packages/tests/TU/components/Btn/OrigamBtn.adjacent-emit-removed.spec.ts`
monte `<OrigamBtn>` avec un écouteur `onClick:prepend` / `onClick:append` et
déclenche un vrai `click` DOM sur la zone. Sur le commit parent, ce même test
appellerait l'écouteur (l'émission déclarée par `IAdjacentEmits` partait
encore) ; sur ce commit, l'écouteur n'est jamais invoqué — vérifié en
rejouant le fichier de spec avant/après le changement, pas seulement en le
lisant une fois vert.

Nettoyage induit : le helper `warnDeprecatedEmit` (`color.util.ts`) et la
constante `ADJACENT_EMIT_REPLACEMENT` (`consts/Btn/btn.const.ts`) sont
retirés — `<OrigamBtn>` était leur seul appelant, et le fichier `btn.const.ts`
devenu vide est supprimé.

**Migration.** Aucun consommateur interne (DS, marketing, stories, docs,
tests) n'utilisait `click:prepend` / `click:append` sur `<OrigamBtn>` —
balayage exhaustif, zéro résultat. Un consommateur externe qui les écoutait
doit remplacer l'action posée sur la zone prepend/append par un second
`<origam-btn>` dans un `<origam-btn-group>`.

### ⚠️ BREAKING — `createOrigam()` nu n'installe plus le thème par défaut (#360)

`createOrigam()` préfixait inconditionnellement chaque install avec le thème
neutre interne `origamTheme` (`[...origamTheme, ...suppliedThemes]`) : même un
appel nu, ou un `themes: []` explicite, recevait quand même les variables CSS
et — surtout — les **props par défaut par composant** (ADR-005,
`components: { 'origam-avatar': { rounded: 'full' }, … }`) de ce thème. Une
application qui n'en voulait pas ne pouvait pas s'en défaire. Ce préfixage est
retiré : `createOrigam()` installe désormais exactement ce qu'on lui passe,
rien de plus.

**Ce qui change concrètement.** Sans `themes`/`theme` explicite,
`createOrigam()` n'injecte plus aucune variable `--origam-*` et le résolveur
de props par défaut (`installThemePropsResolver`, ADR-005) n'a plus rien à
résoudre — chaque composant retombe uniquement sur ses propres valeurs
`withDefaults()`. Concrètement : un `<origam-avatar>` sans prop `rounded`
explicite n'est plus automatiquement circulaire (`rounded="full"` venait du
thème, pas du composant).

**Le thème par défaut reste disponible, à la demande** — `origamTheme`,
exporté par `origam/themes` (déjà public avant cette rupture, aucun nouvel
export nécessaire) :

```ts
// AVANT (2.x) — enregistrait implicitement le thème origam par défaut
import { createOrigam } from 'origam'
app.use(createOrigam())

// APRÈS — le thème par défaut est un choix explicite
import { createOrigam } from 'origam'
import { origamTheme } from 'origam/themes'
app.use(createOrigam({ themes: origamTheme }))
```

**Rayon de souffle mesuré, corrigé dans le même lot** — quatre consommateurs
directs de `createOrigam()` nu trouvés par balayage exhaustif (DS, marketing,
stories, docs, tests) :
- `packages/ds/src/nuxt/module.ts` — le module Nuxt officiel. **Non cassé** :
  son propre `DEFAULT_THEMES` (utilisé quand l'option `origam.themes` du
  consommateur est omise) passe désormais `origamTheme` explicitement à
  `createOrigam()`, préservant à l'identique le comportement de tout
  consommateur Nuxt existant (marketing compris) qui ne configurait rien.
  Seul un `createOrigam()` direct, hors module Nuxt, doit s'adapter.
- `packages/marketing/nuxt.config.ts` — configure `origam.themes`
  explicitement (7 thèmes de marque + un thème `origam` renommé pour le
  playground `/theming`), ce qui **contourne** le fallback du module. Le vrai
  thème neutre non-nommé (celui que `activeDefaultsFor` fusionne toujours en
  premier, avant la marque active) était fourni jusqu'ici par le préfixage
  implicite de `createOrigam()` — invisible dans la config marketing. Il est
  désormais listé explicitement, en premier, dans le tableau `themes`.
- `packages/stories/histoire.setup.ts` — Histoire (utilisé par les ~208
  stories de composants) appelait `createOrigam()` nu ; sans correction,
  chaque story aurait silencieusement perdu les props par défaut du thème
  (avatars carrés au lieu de circulaires, etc.). Passe désormais
  `{ themes: origamTheme }`.
- `packages/docs/.vitepress/theme/index.ts` — les démos de composants live de
  la doc VitePress appelaient `createOrigam()` nu ; même correction.

Les échantillons de code montrés au consommateur (`installation.const.ts` /
`installation.vue` sur le marketing, `guide/usage.md` côté docs) sont mis à
jour pour montrer la forme correcte — un utilisateur copiant l'ancien
exemple aurait obtenu des composants non stylés selon le thème.

**Tests adaptés** (comptés avant correction, comme demandé) — 3 fichiers /
5 assertions reposaient sur l'enregistrement implicite et ont été corrigés
pour installer `origamTheme` explicitement là où le test vérifie précisément
une valeur par défaut issue du thème, ou réécrits pour pinner le NOUVEAU
contrat plutôt que l'ancien :
- `theme-props-resolver.spec.ts` (2 assertions — `origam-radio`/`origam-text-field`
  vs `origam-input` density) ;
- `installed-themes.composable.spec.ts` (describe block entier renommé
  `origam baseline — explicit opt-in only (#360)`, 2 assertions corrigées et
  2 nouvelles ajoutées pour couvrir explicitement le nouveau contrat) ;
- `OrigamChip.spec.ts` (1 assertion — `components['origam-chip'].size`).

**Preuve fonctionnelle** (pas seulement structurelle) —
`packages/tests/TU/origam/createOrigam-bare-no-theme-360.spec.ts` monte un
vrai `<OrigamAvatar>` : sans thème, la classe `origam--rounded-full` est
absente ; avec `origamTheme` passé explicitement, elle est présente — la
même monteuse prouve donc que le harnais peut actionner la prop avant de
conclure qu'elle ne l'est plus par défaut.

### Fixed

- **#871 — le mode sombre ne peignait qu'à moitié dans un sous-arbre thémé.**
  Les feuilles de tokens portent ~1 761 déclarations **dérivées**
  (`--origam-title---color: var(--origam-color__text---primary)`). Une custom
  property est substituée **sur l'élément qui la déclare** ; ce qu'un
  descendant hérite est la valeur DÉJÀ substituée. Le bloc sombre étant ancré
  à la racine (`:root:not([data-theme])[data-mode="dark"]`), un sous-arbre
  `<OrigamThemeProvider mode="dark">` basculait bien les ~60 tokens
  sémantiques — le bloc runtime, lui, émet `[data-mode="dark"]` — mais laissait
  les 1 761 dérivés **gelés** sur les valeurs claires de la racine. Motif
  dominant mesuré : `rgb(10,10,10)` sur `rgb(10,10,10)`, texte et fond
  identiques.

  Les deux feuilles s'accrochent désormais aussi à l'axe `data-mode` :

  ```css
  :root, [data-theme="light"], [data-mode="light"]      { /* clair */ }
  [data-theme="dark"], [data-mode="dark"]:not([data-theme="light"]) { /* sombre */ }
  ```

  Rejoué sur 30 composants × 8 identités × 2 modes × 2 portées (racine ET
  sous-arbre), soit **1 664 instances**, Chromium, contrôles positif et négatif
  verts : **185 → 7 violations AA**, dont sombre **182 → 4** et clair
  **3 → 3** (aucune régression). Les 7 restantes appartiennent toutes aux
  palettes de marque de `packages/marketing`, aucune au DS, et aucune ne
  descend sous 2:1. Harnais : `pnpm -F @origam/tests audit:dark-contrast`.

  ⚠️ **Ces bornes ont d'abord été publiées à `189 → 11`, et les deux étaient
  fausses de 4.** Le parseur de couleurs du harnais ne connaissait pas
  `color(srgb …)`, que la palette `apple` émet : le fond translucide du
  tooltip était pris pour « pas de fond », la remontée d'ancêtres sautait
  jusqu'à la surface opaque et rapportait du noir sur noir à 1.00 — quatre
  violations **fabriquées**, présentes des DEUX côtés de la mesure. Le
  **delta de 178 n'a jamais été faux** ; seules les bornes l'étaient. Détail
  et garde de non-récidive plus bas.

- **#871 — le harnais de contraste ne savait pas lire `color(srgb …)`, et
  FABRIQUAIT donc des violations.** Son `parse()` ne reconnaissait que
  `rgb()` / `rgba()`. Un fond qu'il ne sait pas lire n'est pas « ignoré » : il
  est traité comme **non peint**, la remontée d'ancêtres saute l'élément et
  composite contre une couche qui n'est pas celle que voit l'œil. Sur le
  tooltip `apple` — `color(srgb 0.898 0.898 0.906 / 0.94)` sur une surface
  noire — cela donnait du noir sur noir à **1.00** là où le rendu réel est
  ~`rgb(215,215,217)` sur noir. 4 instances (root + sous-arbre × clair +
  sombre), des deux côtés de la mesure.

  `parse()` reconnaît désormais `color(srgb r g b [/ a])`, avec **la même
  expression régulière que `srgbToRgb` dans `contrast.directive.ts`** — la
  vraie directive gérait déjà cette forme, et son commentaire le disait :
  *« design tokens resolve to exactly this form in several themes »*.

  ⛔ **Un quatrième contrôle, parce que le correctif ponctuel ne suffit pas.**
  Le harnais échoue maintenant (`$? = 1`) dès qu'une chaîne de couleur non
  vide lui est illisible, en listant les formes rencontrées. Sans lui, la
  prochaine syntaxe (`oklch()`, `lab()`, résidu de `color-mix()`) décalerait
  le chiffre en silence exactement de la même façon. Contrôle positif du
  garde lui-même : branche `srgb` désactivée → `$? = 1`, 8 formes listées, et
  le compte réaffiche l'ancien **11** ; branche active → `$? = 0`, tout lu,
  **7**.

  ⚠️ #871 listait déjà ce risque sous « non vérifié » — *« les couleurs
  `oklch()` / `color(srgb …)` — aucun token actuel n'en emploie, mais un futur
  thème invaliderait l'instrumentation »*. Un thème le faisait **déjà** au
  moment où la phrase a été écrite. Écart signalé en marge de la **PR #882**
  (#869, `v-contrast`) par l'agent qui rejouait ce harnais avec la vraie
  directive au lieu du stub ; reproduit, remesuré et corrigé ici. Aucun ticket
  propre n'a été ouvert : le défaut est dans l'instrumentation de #871, donc
  il se règle sous #871.

- **#871 — `system-bar` et `tooltip` illisibles en sombre.** Les deux peignent
  une surface sombre dans les DEUX modes (`neutral---700` / `neutral---800`)
  et lisaient `text---inverse`, qui vaut blanc en clair et **encre** en
  sombre : 1.91:1 et 1.31:1. `dark.css` lit maintenant `text---primary` ;
  `light.css` est inchangé.

- **#871 — `bottom-nav` peignait une dalle claire dans une UI sombre.** Son
  fond était épinglé à la primitive `neutral---200` (#e6e6e6) dans les deux
  modes, sous un `text---primary` presque blanc (1.03:1). En sombre il passe
  au token sémantique `surface---overlay`. Le clair est inchangé.

### Changed — ⛔ RUPTURE (documentée, assumée)

- **Les feuilles de tokens ne sont plus ancrées à `:root`.** Un consommateur
  qui avait contourné le gel ci-dessus en re-déclarant lui-même des variables
  de composant dans un sous-arbre `[data-mode]` voit désormais la feuille les
  déclarer aussi, en (0,1,0) côté clair et (0,2,0) côté sombre. Son bloc de
  contournement doit donc être au moins aussi spécifique, ou être retiré.

  Concrètement dans ce dépôt : `packages/marketing` embarque
  `ORIGAM_COMPONENT_RESET_LIGHT/DARK` (`themes/origam-reset.generated.ts`),
  une re-déclaration GÉNÉRÉE de ~2 700 variables de composant, écrite
  exactement pour ce défaut. Elle est maintenant redondante — **elle n'a pas
  été retirée ici**, faute de mesure sur le rendu du site.

  Ce qui NE change pas : `data-theme="light" data-mode="dark"` reste clair
  (l'axe marque gouverne quand les deux se contredisent, règle #807),
  `data-mode="light"` sous un OS sombre reste clair (#794), et une marque
  claire continue de gagner sur la feuille par l'ordre source.

### Documentation

- `CLAUDE.md`, section *Multi-theme* : la note qui affirmait que le bloc
  auto-mode ne porte que **11** déclarations est **fausse** — recompté en
  parsant la feuille le 2026-09-22, les deux blocs en portent **2 731**
  chacun. L'affirmation décrivait un état antérieur à #794 que plus rien ne
  remesurait.

### Fixed

- **#371 (point 3) — le sélecteur « Items per page » du footer
  DataTable n'avait aucun nom accessible**, déjà corrigé par `3f063d727`
  (2026-09-10) — ce commit **citait #371 sans le fermer**, sixième
  occurrence cette semaine du même motif (cf. #570, #682, #537, #371
  point 1, #371 point 2/ADR-005). Re-mesuré ici avant tout travail sur les
  points restants du ticket : le `<span>` visible est désormais associé au
  `<origam-select>` via `aria-labelledby`, et la suite unitaire complète
  reste verte (7120/7120) — aucun code de production retouché sur ce point,
  seule la mesure manquait au tableau.

- **`<OrigamDataTableRow>` ne fuit plus `index` / `mobile` en attributs DOM**
  (#371, point 4). `itemSlotProps()` (`OrigamDataTableRows.vue`) construisait
  la ligne d'item avec deux clés qu'`IDataTableRowProps` ne déclare pas —
  `index`, jamais lu par le composant, et `mobile`, un résidu d'avant
  l'ajout du forwarding de `mobileBreakpoint` (chaque ligne calcule déjà son
  propre `mobile` à partir de ce dernier). Une clé non déclarée tombe dans
  `$attrs`, et le `v-bind="$attrs"` du `<tr>` racine la posait en attribut
  DOM littéral sur **chaque** ligne rendue — `index="0" mobile="false"`.
  Même mécanisme que le point 1 de ce ticket (déjà corrigé, `08c30693a`),
  une famille plus loin. `aria-rowindex`, seul attribut voulu de ce canal,
  continue de passer.

### Added

- **`mobileBreakpoint` a désormais un contrôle de story sur
  `<OrigamDataTable>`** (#371, point 5). La prop — dont le défaut `'xs'`
  corrige un bug de production documenté en commentaire
  (`OrigamDataTable.vue:190-199` : sans lui, `useDisplay` retombait sur le
  seuil global `'lg'` et forçait le rendu mobile empilé sur tout viewport
  sous 1280px) — n'apparaissait dans aucune des 30 Variants de
  `OrigamDataTable.story.vue`. Ajout de la Variant « Prop —
  mobileBreakpoint » (même jeu d'options que celui déjà utilisé par
  `OrigamDataTableRow.story.vue`) et d'une section « Responsive » +
  ligne de table dans `OrigamDataTable.md`.

---

#### `v-contrast` était silencieusement inerte sur fond opaque (#869)

La directive `v-contrast`, câblée sur 30 composants, n'émettait **jamais**
rien — ni classe, ni `color: !important`, ni `console.warn` — dès que fond
**et** texte étaient tous deux OPAQUES, c'est-à-dire la configuration par
défaut du DS. Deux ruptures indépendantes dans le code partagé, corrigeant
l'une ne suffisait pas sans l'autre :

1. **`toRgb()`** faisait **toujours** passer la couleur par un aller-retour
   `canvas.fillStyle`, même quand `getComputedStyle` avait déjà rendu une
   chaîne `rgb()/rgba()` exploitable. Le getter `fillStyle` de Chromium
   sérialise toute couleur OPAQUE en hexadécimal `#rrggbb` (seul l'alpha < 1
   ressort en `rgba(…)`), ce qui transformait une valeur déjà utilisable en
   une valeur morte pour `rgbaParts`/`channelsOf`.
2. **`channelsOf()`** extrayait les canaux via `match(/[\d.]+/g)`, taillé
   pour `rgb(r, g, b)` — une suite de chiffres hexadécimaux SANS séparateur
   (ex. `#777777`, six chiffres) s'agrège en UN seul grand nombre au lieu de
   trois, donc `channelsOf` rend `null` sur exactement la forme hex que la
   rupture 1 pouvait encore produire (couleur nommée, `hsl()`, …
   nécessitant légitimement le détour par le canvas).

**Correctif** : `toRgb()` court-circuite désormais le canvas quand l'entrée
est déjà `rgb()/rgba()` (le cas de la quasi-totalité des appels, puisqu'ils
lisent `getComputedStyle`), et le chemin canvas restant convertit son
résultat hexadécimal en `rgb()/rgba()` via un nouveau `hexToRgb()` avant de
le rendre — `toRgb()` ne rend plus jamais de hex. La mécanique de correction
elle-même (forcer noir/blanc, poser `data-origam-contrast-fixed`, journaliser
le ratio) n'est pas modifiée : elle fonctionnait déjà, elle n'était
simplement jamais atteinte.

**Preuve** — `packages/tests/e2e/contrast-directive.spec.ts` (Playwright,
Chromium réel — jsdom n'a pas de `canvas.getContext('2d')` fonctionnel dans
ce dépôt, donc ne peut ni reproduire ni vérifier ce bug) : contrôle positif
(`#777777` sur blanc, 4.48:1, opaque des deux côtés) déclenche désormais la
correction + le `console.warn` ; contrôle négatif (noir sur blanc, 21:1) ne
déclenche rien ; non-régression du chemin translucide (fond composé via
`resolvePaintedBackground`) inchangée. **A/B contre le commit parent** : 4
des 5 tests rougissent sur le code d'avant (le contrôle négatif reste vert
des deux côtés, comme attendu).

⚠️ **Rayon mesuré séparément, pas hérité de #871 — et le chiffre publié par
#871 contenait un artefact, corrigé depuis par #883.** Le chiffrage initial
du ticket (346 violations en mode sombre) datait d'avant #876. #876 avait
d'abord publié **189 → 11** ; en rejouant `audit/dark-contrast.audit.mjs`
avec la VRAIE directive (redirect du stub désactivé) au lieu de sa
reformulation mathématique, seuls **7 `console.warn` réels** se
déclenchaient sur les 32 configurations (30 composants × 8 identités × 2
modes, portées racine + sous-arbre) — écart signalé à l'auteur de #876, qui
l'a reproduit, creusé et corrigé sous #883 : **les bornes AVANT et APRÈS
étaient toutes les deux fausses (185 → 7, pas 189 → 11)**, la même erreur de
mesure existant déjà dans le comptage "avant". Le delta réel (178) n'a
jamais changé.

L'écart venait d'`origam-tooltip__content` (identité `apple`, root + subtree,
light + dark) et, découvert par #883, également d'`origam-bottom-nav` sur la
même identité. Fond réel : `color(srgb 0.898039 0.898039 0.905882 / 0.94)`
(translucide) ; `toRgb()` le résout correctement en `rgb(215, 215, 217)` une
fois composé sur son ancêtre opaque, contre du texte noir : **ratio 14.61:1,
conforme** — vérifié en appelant directement `toRgb()`/
`resolvePaintedBackground()` de la vraie directive sur cette page. La
fonction `parse()` de `dark-contrast.audit.mjs` (une réimplémentation
distincte, pas la directive) ne reconnaissait que `rgba?\(…\)` — elle
ignorait silencieusement cette couche `color(srgb …)`, sautait jusqu'à
l'ancêtre opaque suivant et rapportait à tort un faux "noir sur noir"
(ratio 1.00). **Ce n'était pas un défaut du DS ni de `v-contrast`** — la
même classe de lacune que ce ticket corrige, mais dans un autre fichier. Les
7 restantes (4 `origam-badge__badge`, 3 `origam-breadcrumb-item`) sont
confirmées identiques entre les deux mesures, et `sous 2:1` passe à **0** une
fois l'artefact retiré : plus rien de ce qui reste n'est proche d'invisible.

Non corrigé ici : `dark-contrast.audit.mjs` appartenait à #871/#876, pas à ce
ticket — signalé, reproduit et corrigé séparément sous #883 (ne pas citer
189 → 11, c'était faux des deux côtés).

**Rupture d'API** : aucune — `toRgb`/`channelsOf`/`hexToRgb` restent des
fonctions privées du module, non exportées ; la surface publique
(`setContrastConfig`, `v-contrast` par défaut) est inchangée.

## [2.18.0] - 2026-09-19

80 commits depuis `v2.17.1`. L'essentiel est du **correctif** : des tokens qui
ne peignaient rien, des props déclarées et inertes, et une famille de défauts
d'accessibilité où le clavier n'actionnait pas ce que la souris actionnait.

> ### ⛔ DÉROGATION, LA DEUXIÈME — cette version MINEURE porte 2 ruptures d'API
>
> Comme la `2.17.0` avant elle, cette version mineure embarque des ruptures :
> `BG_FG_ROLE.DISABLED` et le retrait du sous-chemin `origam/services`, toutes
> deux détaillées ci-dessous. Le versioning sémantique imposerait une
> **majeure**. C'est de nouveau une **décision explicite du mainteneur** —
> le numéro `3.0.0` est réservé à la séparation en modules.
>
> Ce bandeau ne demande aucune permission : **il documente**. Un consommateur
> épinglé en `^2.17` reçoit ces deux ruptures **sans les avoir demandées**, et
> il doit pouvoir le lire ici plutôt que de le découvrir à l'exécution.
>
> Les deux recettes de migration sont dans leurs entrées. Elles sont vides
> toutes les deux — rien ne pouvait peindre, rien ne pouvait résoudre — mais
> l'une resserre un type pour de bon, et l'autre retire une porte déclarée.
>
> Le décompte cumulé est désormais de **10 ruptures entrées par deux versions
> mineures**. La note rétrospective plus bas les énumère une par une.
>
> Suivi de remédiation : **#717** (ouvert, non tranché).

### ⚠️ BREAKING — `BG_FG_ROLE.DISABLED` removed (#823)

`BG_FG_ROLE` is part of the published surface — it is re-exported by
`origam/enums` (and reachable directly as `origam/enums/Commons/color.enum`
through the `./*` catch-all). Verified on the BUILT artefact, not inferred
from the export map: `import { BG_FG_ROLE } from 'origam/enums'` now yields
`['default', 'hover', 'active']`. The derived `TBgFgRole` (`origam/types`)
narrows with it, so a consumer annotating a variable `TBgFgRole` and
assigning `'disabled'` stops compiling.

**No rendering changes.** The member was declared and **never passed**:
`useColorEffect` and `useStateEffect` both derive `bgRole` from `isHover` /
`isActive` alone, and every other call site passes the literal `'default'`.
Measured in Chromium against the prebuilt Histoire — 70 story/variant
captures, 801 computed `background-color` / `color` readings across the ten
component families that consume those composables — the before and after
dumps are byte-identical, with a hover positive control that moves
(`rgb(124,58,237)` → `rgb(109,40,217)`) in both.

**Why remove rather than declare the eight missing tokens.** The `disabled`
rung resolved `--origam-color__feedback--{success,warning,danger,info}---bgDisabled`
and `---fgDisabled` — eight names **no sheet declares**, with **no fallback**.
`docs/integrations/theming-authoring.md` already documents `feedback.*` as
having no `*Disabled` slot; only `action.*` does. A `var()` that fails at
computed-value time does not yield: the declaration has already won the
cascade, becomes `unset`, and **erases** the surface (the #813 / #568
mechanism). The member was therefore an armed trap — the first caller to
pass `'disabled'`, which the `tokenStylesForIntent(intent, role)` signature
openly invited, would have wiped eight surfaces with every guard green.
Disabled is an opacity veil in this DS, never a token swap.

Guard 28 `ts-token-refs` drops from **20** baselined dead-channel entries to
**12**. Negative control run: pre-fix code against the trimmed baseline
reports exactly those 8 as NEW and exits 1.

**Migration.** There is none to write, because nothing could have been
painting: any consumer passing `'disabled'` was already emitting undeclared
`var()` references. Use the disabled opacity veil the components already
apply, or declare the eight `feedback.*` slots in your own theme and pass a
bespoke `bgColor`.

### ⚠️ BREAKING — le sous-chemin `origam/services` est retiré de la map `exports`

**Il ne résolvait déjà plus.** C'est une rupture de *contrat déclaré*, pas de
comportement : la map annonçait une porte qui ne menait nulle part, et elle
cesse de l'annoncer.

`packages/ds/package.json` déclarait
`"./services": "./dist/src/services/index.js"` alors que
`packages/ds/src/services/` n'existe plus. Le répertoire a été **renommé en
`classes/`** par `63120a402` (`refactor(ds)!: services/ -> classes/`, le
2026-08-19) : les trois fichiers sont devenus
`src/classes/Commons/{box,circular-buffer,date-adapter}.class.ts` et
`src/services/index.ts` a été supprimé. **L'entrée `exports`, elle, est
restée** — et a donc été publiée morte dans `2.16.0`, `2.17.0` et `2.17.1`.

Mesuré contre le `dist` construit, avant retrait : `import 'origam/services'`
lève `MODULE_NOT_FOUND` sur `dist/src/services/index.js`. Le `build` le
signalait d'ailleurs à chaque passage, dans un avertissement que personne ne
lisait : `Potential missing package.json files: … dist/src/services/index.js`.
Cet avertissement **disparaît** avec l'entrée — c'est le témoin du retrait,
et il est passé de 1 occurrence à 0 sur le build de cette release.

**Migration.** Aucune, au sens strict : un `import 'origam/services'` échouait
déjà, donc aucun code en état de marche ne peut en dépendre. Vérifié sur le
dépôt entier avant le retrait — `packages/marketing`, `stories`, `docs` et
`tests` compris : **zéro import réel**. La seule référence restante était un
alias Vite inerte dans le `nuxt.config.ts` du site vitrine, qui pointait lui
aussi sur le répertoire disparu ; il est retiré dans le même commit.

⚠️ Et il faut être précis sur ce qui change, parce que l'attente naturelle est
fausse : **le code d'erreur ne change pas**. On pourrait croire qu'un
sous-chemin retiré d'`exports` lève désormais `ERR_PACKAGE_PATH_NOT_EXPORTED` ;
mesuré, ce n'est pas le cas — le catch-all `"./*"` **reprend** le sous-chemin
et le renvoie vers `dist/src/services`. Le consommateur voit donc toujours
`MODULE_NOT_FOUND`, seule la cible résolue change :

| | sous-chemin résolu vers | code |
|---|---|---|
| `2.17.1` | `dist/src/services/index.js` (l'entrée déclarée) | `MODULE_NOT_FOUND` |
| `2.18.0` | `dist/src/services` (le catch-all) | `MODULE_NOT_FOUND` |

C'est exactement le comportement observé sur `themes-all`, retiré en `2.17.0`.
Ce qui est rompu ici est donc le **contrat déclaré**, rien d'autre : le paquet
cesse d'annoncer une porte qu'il n'a pas.

⚠️ **À savoir, et non corrigé ici** : la surface qui a remplacé `services/`
n'est pas exportée non plus. `origam/classes` ne résout pas — le catch-all
l'envoie vers `dist/src/classes`, un **répertoire**, et l'ESM refuse l'import
de répertoire (`ERR_UNSUPPORTED_DIR_IMPORT`). Seul `origam/classes/index.js`,
explicite, fonctionne. Déclarer proprement `"./classes"` est un **ajout** de
surface, pas un retrait : ça ne relève pas de cette release.

### ⛔ NOTE RÉTROSPECTIVE — écrite le 2026-09-19 : les 10 ruptures d'API entrées par des versions MINEURES

Cette note est ajoutée **après coup**, et ne modifie aucune entrée passée.

**Ce qu'il faut dire d'emblée : la `2.17.0` n'aurait pas dû être une mineure.**
Elle a embarqué **8 ruptures d'API**, et la `2.18.0` en ajoute **deux** — la
neuvième et la dixième. Un consommateur épinglé en `^2.16` a reçu les huit
premières **automatiquement, sans action de sa part**, et son build a pu casser
sans avertissement. Les deux dérogations sont documentées et assumées (note en
tête de chaque section, ticket de remédiation **#717**) — mais une dérogation
documentée reste une dérogation, et un `^2.16` qui casse reste un `^2.16` qui
casse.

Le détail complet de chaque rupture, avec ses mesures navigateur, vit dans la
section `[2.17.0]` plus bas. Ce qui suit est l'**index vérifié** : chacune a été
recontrôlée sur le code de cette release (`HEAD` = `2aca4db6d`) avant d'être
écrite ici, parce que plusieurs tickets de ce dépôt portaient des chiffres
périmés.

| # | Rupture | Vérifiée sur le code de 2.18.0 |
|---|---|---|
| 1 | `aspect-ratio` CSS remplace le hack `__sizer` | confirmée |
| 2 | `inline` retirée d'`IResponsiveProps` | confirmée |
| 3 | `label` retirée d'`IValidationProps` | confirmée |
| 4 | échelle `max-width` d'`OrigamContainer` réalignée | confirmée |
| 5 | 88 paires typographiques mortes retirées | confirmée, le 88 se recompte |
| 6 | props plates `hover*` / `active*` retirées | confirmée, **titre d'origine inexact** |
| 7 | `origam/tokens/{css,scss}/themes-all` retirés | confirmée sur le `dist` construit |
| 8 | 206 custom properties retirées des feuilles livrées | confirmée, **octets d'origine faux** |
| 9 | `BG_FG_ROLE.DISABLED` retiré (2.18.0) | confirmée sur le `dist` construit |
| 10 | `origam/services` retiré d'`exports` (2.18.0) | confirmée sur le `dist` construit |

**1. `aspect-ratio` CSS remplace le hack `__sizer`.**
L'enfant `__sizer` (`padding-block-end` en pourcentage) et la marge de rappel
sur `__content` ont disparu de `OrigamResponsive`, `OrigamImg`,
`OrigamCarouselItem` et `OrigamVideo` ; `aspect-ratio` résout désormais l'axe
manquant **dans les deux sens**. *Ce que vous devez faire* : si vous posez une
`height` explicite et que vous vouliez garder la pleine largeur, posez aussi
`width` (`width="100%"`) — sinon la largeur est maintenant contrainte par le
ratio.

**2. `inline` retirée d'`IResponsiveProps`** (donc de `<OrigamResponsive>`,
`<OrigamImg>`, `<OrigamCarouselItem>`). *Ce que vous devez faire* : rien dans le
cas courant. L'attribut résiduel retombe dans `$attrs` et atterrit inerte sur la
racine. La prop réduisait la largeur à `0` : elle ne peignait rien qu'on puisse
regretter.

**3. `label` retirée d'`IValidationProps`** (donc de `<OrigamInput>`).
*Ce que vous devez faire* : rien pour Checkbox, Switch, TextField, RatingField,
SliderField, RadioGroup — ils gardent leur `label`. Si vous passiez `label` à un
`<origam-input>` nu, c'était déjà un no-op (zéro `<label>` rendu) : déplacez-le
sur le contrôle placé dans le slot.

**4. Échelle `max-width` d'`OrigamContainer` réalignée sur les tokens.**
`900/1200/1800/2400px` → `768/992/1280/1440px`, aux mêmes seuils de viewport
(`960/1280/1920/2560px`). *Ce que vous devez faire* : c'est un **changement
visible de largeur**, pas un no-op. Si vos maquettes reposaient sur l'ancienne
échelle, surchargez `--origam-container---max-width-{md,lg,xl,xxl}`.

**5. 88 paires (composant, prop) typographiques mortes retirées sur 40
interfaces.** `fontFamily` / `fontWeight` / `lineHeight` / `letterSpacing` là où
aucune règle CSS ne les relisait. `fontSize` n'a pas été touché.
*Ce que vous devez faire* : le rendu ne bouge pas (ces props ne peignaient rien),
mais **le type se resserre** — un `<origam-btn font-family="…">` cesse de
compiler. Passez par les tokens de typographie, ou par `:style`.
*Recompté pour cette note* : 84 retraits déclarés en direct + 4 hérités par
`IOtpInputFieldProps` (passé à `Omit<…>`) = **88**. Le total de paires
typographiques déclarées passe de **212 à 129**. Rien n'est revenu depuis.

**6. Props plates par état retirées.** ⚠️ **Le titre de l'entrée `[2.17.0]` est
inexact** et cette note le corrige plutôt que de réécrire l'entrée : il liste
`hoverBgColor` **deux fois** et omet `hoverColor`. Les quatre props réellement
retirées sont `hoverColor`, `hoverBgColor`, `activeColor`, `activeBgColor` — le
corps de l'entrée, lui, les cite bien toutes les quatre.
⚠️ Deuxième correction : le corps annonce `Pagination`, `Field`, `DataText`,
`DataTitle` comme « les derniers déclarants » — il y en avait **cinq** :
`ISelectionControlProps` déclarait `activeColor` / `activeBgColor` en `2.16.0`
et n'est pas mentionné. *Ce que vous devez faire* : passez l'override comme clé
des props objet `hover` / `active`.

**7. `origam/tokens/css/themes-all` et `origam/tokens/scss/themes-all`
retirés.** *Ce que vous devez faire* : importez les feuilles nommées
(`origam/tokens/css/light`, `.../dark`, `.../primitive`, `.../utilities`) ou
`origam/styles`, qui les agrège. ⚠️ Le catch-all `"./*"` de la map `exports` ne
rattrape pas ces sous-chemins : il les envoie vers `dist/src/tokens/…`, qui
n'existe pas. Vérifié par résolution réelle contre le `dist` construit de cette
release : les deux lèvent `MODULE_NOT_FOUND` sur
`dist/src/tokens/{css,scss}/themes-all`.

**8. 206 custom properties retirées des feuilles de tokens livrées.**
Ces propriétés venaient de 12 fichiers `tokens/component/*.json` qu'aucun
composant ne lisait. ⚠️ **C'est bien une rupture pour un consommateur**, et non
un remaniement de sources internes : mesuré nom par nom, **206/206 étaient
déclarées dans `light.css` et dans `dark.css` en `2.16.0`, et 0/206 le sont
aujourd'hui** — or ces deux feuilles sont dans le paquet publié. *Ce que vous
devez faire* : si vous surchargiez l'une d'elles, la déclaration n'a plus de
base ; redéclarez-la dans votre propre thème.
⚠️ Troisième correction : les tailles d'octets annoncées dans l'entrée
`[2.17.0]` (`light.css 187293 → 171736`, `dark.css 380189 → 348663`) **ne se
reproduisent pas**. Remesuré : `2.16.0` = 187 468 / 380 549 octets ; aujourd'hui
= 193 455 / 376 376. `light.css` a même **grossi** depuis, d'autres travaux
ayant touché les feuilles entre-temps. Le chiffre qui tient est 206/206 → 0/206,
pas les octets.

**9. `BG_FG_ROLE.DISABLED` retiré** — la neuvième, livrée par cette `2.18.0`.
Détail complet en tête de cette section. *Ce que vous devez faire* : rien au
rendu ; retirez `'disabled'` de toute variable annotée `TBgFgRole`.
⚠️ Le numéro **#823 cité par le commit est indirect** : ce ticket porte sur les
références `var()` assemblées en TypeScript qu'aucune garde ne voyait. Le
retrait de ce membre est une **trouvaille** de la garde livrée sous ce ticket,
pas son objet. Aucun ticket dédié n'existe pour cette rupture.

**10. `origam/services` retiré de la map `exports`** — la dixième, livrée par
cette `2.18.0`. Détail complet en tête de section. *Ce que vous devez faire* :
rien. Le sous-chemin ne résolvait déjà pas, et le dépôt entier a été balayé
avant le retrait — zéro import réel. C'est le contrat déclaré qui est rompu,
pas un comportement.

**Ce que cette note ne fait pas.** Elle ne publie pas de guide de migration
`v2.16 → v2.18` consolidé, ne déprécie pas `2.17.0` sur npm, et ne mesure pas le
nombre de consommateurs externes réellement exposés. Ces trois options sont
listées dans **#717**, qui reste **ouvert** et attend une décision.

### Added

- **Cinq symboles publics redeviennent importables** (#844). `useHotkey` et
  `useAudioPlayer` depuis `origam/composables`, `IMessageProps` depuis
  `origam/interfaces`, `TOrigamAvatarGroup` et `TOrigamSystemBar` depuis
  `origam/types`. Ils existaient dans les sources mais aucun barrel ne les
  réexportait : un `import { useHotkey } from 'origam/composables'` échouait en
  `MISSING_EXPORT` au bundling, et les trois types en `TS2724` / `TS2305`.
  Vérifié par import réel contre le `dist` construit, pas par lecture de la map
  `exports`.
  Le sixième réexport que demandait le ticket, `IHotkeyOptions`, n'a **pas** été
  ajouté : il est atteignable depuis `origam/interfaces` depuis 2025, l'ajouter
  aurait dupliqué un export existant.
  ⚠️ Au passage, le fichier vide `types/Commons/locale.type.ts` (1 octet, zéro
  symbole) a été supprimé : le sous-chemin profond
  `origam/types/Commons/locale.type` ne résout plus. Il n'exportait rien, donc
  aucun symbole ne disparaît.

- **Nouveau type public `TAnyString`** (`origam/types`), qui remplace l'idiome
  `(string & {})` sur 6 unions exportées (`data-table-header`, `theme.type`,
  `sheet.type`, `activator` ×2, `scroll`, `date-picker-month`). Purement
  nominatif : la sémantique de l'union est identique, l'autocomplétion des
  littéraux nommés est préservée.

- **`<OrigamRatingFieldItem>` émet `change` et `keydown`**, deux emits publics
  nouveaux, nécessaires pour que la navigation clavier native atteigne le modèle
  (#812).

- **La référence des composables couvre enfin `Commons`** (#599, #600, #601).
  Trois lots, 80 symboles documentés sur 39 pages : thème / couleur / style,
  dimension / espacement / forme, puis état / interaction / cycle de vie. Chaque
  table est **mesurée** sur les symboles réels, jamais recopiée d'une bannière —
  ce qui a mis au jour des pièges d'API que la documentation annonçait à
  l'envers, et qui valent pour tout consommateur :
  `useRounded` — `rounded-top-left="0"` est un **no-op** (la chaîne `"0"` n'a pas
  d'unité), `rounded="4px 8px"` n'émet rien, et l'ordre à 4 valeurs est
  TL/TR/BL/BR — ni celui de CSS, ni celui de `useMargin` ;
  `useMargin` / `usePadding` — `margin="1.5rem"`, `margin="auto"` et
  `margin="8px 16px 24px"` n'émettent **rien**, en silence, alors que
  `margin-top` accepte les trois ;
  `useBorder` — la forme tableau émet une classe portant la virgule
  d'`Array.toString` et aucune largeur ;
  `useSize` — `useSize(ref(24))` est inerte, `size="zzz"` émet `width: zzz`
  sans avertir.
  Ces comportements ne changent pas dans cette release : ils sont désormais
  **écrits**. La documentation n'est pas livrée dans le paquet npm.

### Fixed

#### Thème et tokens — des déclarations qui ne peignaient rien

- **Le bundle publié n'avait aucun mode sombre automatique** (#794).
  `dark.css` portait bien son bloc `@media (prefers-color-scheme: dark)`, mais
  son jumeau `_dark.scss` ne l'avait pas — or `origam/styles` résout vers
  `main.css`, **compilé depuis le SCSS**. Un consommateur qui importait
  `origam/styles` et n'épinglait rien restait en clair sur un système en
  sombre, pendant que la documentation affirmait le contraire. Le bloc est
  désormais dans les deux sources, et une garde (`token-twins`) échoue
  maintenant sur toute divergence CSS/SCSS. Mesuré sur le `dist` de cette
  release : `main.css` contient
  `@media(prefers-color-scheme: dark){:root:not([data-theme]):not([data-mode]){…}}`,
  et ce bloc porte **2 731 déclarations** — exactement autant que le bloc
  explicite. C'est un thème sombre complet, pas un sous-ensemble.
  Le correctif hérité a été **resserré** en cours de route : `:root:not([data-theme])`
  seul repeignait en sombre une page ayant épinglé le clair sur l'axe
  `data-mode`, c'est-à-dire la forme exacte que produit `useTheme()`. D'où le
  second `:not([data-mode])`.

- **`data-mode="dark"` seul peint désormais le thème sombre** (#807).
  Les feuilles statiques n'émettaient **aucune** règle `[data-mode]` : seule la
  matrice de thème injectée en JS par `createOrigam()` en produisait. Un
  consommateur appelant `useTheme().setMode('dark')` sans thème de marque
  enregistré obtenait `<html data-mode="dark">` et **restait en clair**.
  Le sélecteur du bloc `[data-theme="dark"]` est élargi à
  `:root:not([data-theme])[data-mode="dark"]` — même spécificité, disjoint sur
  l'attribut, donc jamais en concurrence avec le bloc `@media`.
  `data-theme` reste prioritaire dès qu'il est posé : `data-theme="light"` +
  `data-mode="dark"` reste clair. Mesuré en Chromium, `rgb(255,255,255)` →
  `rgb(10,10,10)`. Vérifié à nouveau sur le `dist` de cette release : la règle
  est là, et elle porte **2 731 déclarations** de tokens — le jeu sombre
  complet, obtenu en élargissant la liste de sélecteurs plutôt qu'en dupliquant
  un troisième bloc de 170 Ko.

- **`elevation="2xl"` et `"3xl"` n'effacent plus l'ombre du composant** (#813).
  `ORIGAM_SHADOW_RUNGS` accepte huit échelons, les feuilles n'en déclarent que
  six : ces deux-là émettaient un `var()` **nu** sur un token inexistant. Un
  `var()` qui échoue au calcul ne cède pas la main — la déclaration a déjà gagné
  la cascade, devient `unset`, et **efface** l'ombre du composant. Une prop
  censée renforcer l'ombre détruisait celle qui existait : `none` →
  `rgba(0,0,0,.2) 0 11px 15px -7px…`, `md` et `xl` inchangés comme témoins.
  ⚠️ **Contrat assumé** : `2xl` et `3xl` rendent désormais **exactement comme
  `xl`**. Ils cessent d'effacer, ils ne deviennent pas deux échelons
  supplémentaires. Le repli deviendra inerte de lui-même le jour où ces deux
  tokens seront déclarés.

- **Un `0` sans unité ne jette plus la déclaration qui le contient** (#568,
  #800). `calc(36px + 0)` est **invalide** en CSS — le zéro nu est un `<number>`,
  pas une longueur — et quand la valeur transite par un `var()`, la déclaration
  gagne la cascade puis devient `unset` : elle **écrase** au lieu de céder.
  Mesuré en Chromium, avant → après : hauteur d'`<OrigamBtn>` et
  d'`<OrigamBtnGroup>` `0px` → `36px` ; `max-width` du label de champ `none` →
  `100%` (largeur rendue `1000px` → `300px`) ; `row-gap` du field `normal` →
  `8px`. Le cas du label **n'était pas latent** : son `max-width` était mort
  pour tous les champs du catalogue.
  ⚠️ Le ticket #800 annonçait **trois** champs vivant de cette erreur ; la mesure
  en trouve **un** (`<OrigamOtpInputField>`, `0px` → `4px`). `ColorPickerField`
  et `NumberField` tirent leur `padding` d'une règle sans `max()`, où un zéro nu
  est valide. Le plancher de dégagement des coins devient un canal explicite
  (`--origam-field---corner-clearance`) plutôt qu'un effet de bord.

- **L'en-tête collant de `<OrigamDataTable>` colle** (#840). Le calcul du `top`
  lisait `--origam-table-header-height`, déclaré nulle part et sans repli : le
  `var()` nu **effaçait** le `top`, donc `sticky` n'accrochait rien. La hauteur
  est désormais dérivée du remplissage sensible à la densité — mesuré
  `compact` 32 px, `default` 44 px, `comfortable` 56 px — avec un repli explicite.
  À savoir : `sticky` n'agit que si `<OrigamDataTable>` reçoit sa propre
  `height` ou `maxHeight`, ce qui est désormais documenté.

- **`--origam-color__text---primary` résout la valeur qu'il annonce** (#615).
  Il rendait `#0a0a0a` alors que toutes ses déclarations pointaient
  `neutral-900` (`#171717`) : la déclaration gagnante n'était pas une feuille,
  mais le thème runtime injecté en JS. Ce n'était pas un simple écart de
  documentation — sous `<OrigamThemeProvider theme="light">`, le sous-arbre ne
  matche plus `:root`, et **le même thème peignait deux couleurs de texte**
  (`#0a0a0a` à la racine, `#171717` dans le sous-arbre). Sur les 2 892 tokens
  comparés entre thème runtime et feuilles, 268 divergeaient ; ce seul correctif
  en règle 89.

- **Cinq paires couleur de texte / fond d'intention repassent au-dessus de
  4,5:1** (#789), et dans **les deux sources** — feuilles `origam/styles` **et**
  bloc runtime injecté par `createOrigam()` : n'en corriger qu'une n'aurait rien
  changé pour l'autre moitié des consommateurs. Mesuré, avant → après :
  `success` 2,78 / 3,30 → 5,02 ; `warning` 2,37 / 3,19 → 5,02 ; `info` 3,12 →
  5,17 ; `primary` en sombre 4,23 → 5,70 ; `primary | bgHover` en sombre 2,72 →
  7,10 — cette dernière n'était signalée nulle part.
  ⚠️ L'intention `ghost` (3,69 annoncé) est un **artefact de la sonde**, pas un
  défaut : son fond est `rgba(0,0,0,0)` et une mesure sans composition alpha le
  prend pour du noir opaque. Sa vraie valeur est 5,70, conforme. Elle n'a donc
  **pas** été « corrigée ».
  Contrepartie mesurée et assumée : `primary | bgHover` en sombre descend à 2,79
  en contraste **non textuel** (WCAG 1.4.11), seule paire sous 3:1, sur un état
  transitoire.

- **`<OrigamAvatar>` dérive son texte de son `bgColor` d'intention** (#819).
  `useStateEffect` appliquait une couleur de premier plan fixe, issue du thème,
  sans égard au `bgColor` réel — or `bgColor` est justement la prop qu'un avatar
  fait varier par instance. Mesuré sur 8 marques × 2 modes × 8 intentions :
  **3 combinaisons** tombaient entre 1,25:1 et 1,86:1, c'est-à-dire **texte
  invisible**. Les trois passent AA ; les 91 autres sont **identiques au bit
  près**.
  ⚠️ #819 reste **ouvert** : 4 échecs résiduels sont des paires de tokens sous AA
  indépendamment d'Avatar, hors périmètre de ce correctif.

- **`<OrigamListItem>` : la ligne fait autorité sur sa densité** (#571). Le
  composant émettait des classes `origam-list-item--density-*` qu'aucune règle
  ni token ne lisait : la hauteur ne venait que de la liste, alors que la
  documentation annonçait « hérité de la liste parente **sauf si défini** » —
  la moitié « sauf si défini » était fausse. Matrice mesurée après correctif
  (liste `compact` / liste `comfortable` / hors liste) : ligne sans densité
  48 / 64 / 56 px, ligne `compact` 48 / 48 / 48 px, ligne `comfortable`
  64 / 64 / 64 px. Le défaut `'origam-list-item': { density: 'compact' }` a été
  retiré des deux blocs du thème livré : une fois la ligne prioritaire, un
  défaut posé sur **chaque** ligne battrait le `density` qu'un consommateur pose
  sur sa **liste**.

#### Accessibilité — le clavier actionne enfin ce que la souris actionne

- **`<OrigamRatingField>` est opérable au clavier** (#812). Mesuré avant : huit
  `Tab` d'affilée laissaient `activeElement` sur `<body>` à chaque fois ; ni les
  flèches, ni `Home`/`End`, ni `Espace`, ni `Entrée` ne bougeaient quoi que ce
  soit. Après : un seul arrêt de tabulation pour tout le groupe, entrée sur la
  radio cochée, flèches avec bouclage, `Home`/`End`, `Espace`. Trois causes
  distinctes — un `tabindex="-1"` qui rendait les radios focusables mais hors
  tabulation, un modèle qui n'écoutait que le `click` du `<div>` étoile alors
  que la navigation native émet sur l'`<input>`, et un focus qui n'aurait rien
  éclairé (`height: 0; width: 0; opacity: 0`). L'anneau de focus est peint en
  CSS pur via `:has(:focus-visible)`.
  ⚠️ **Changement de rendu** : la **radio fantôme** `value=0` — sixième radio de
  taille nulle, jamais cochée, atteignable aux flèches et annoncée « Rating 0 of
  5 » comme une option qui n'existe pas — n'est plus rendue. Le composant rend
  **5** radios natives, pas 6.

- **`<OrigamRatingField>` nomme son groupe** (#810) : sur le rendu **par
  défaut**, sans aucun `id` consommateur, le `<label for>` ne résolvait vers
  rien, la racine n'avait pas de rôle, et **aucun groupe n'existait dans l'arbre
  ARIA**. Passage à `role="radiogroup"` + `aria-labelledby`.

- **`<OrigamCheckboxGroup>` et `<OrigamRadioGroup>` nomment leur groupe**
  (#814). Le défaut le plus grave n'était pas celui du ticket : avec le slot
  `#label` surchargé et sans prop `label` — le cas nominal de la variante
  « Slots - Label » livrée dans les deux stories — **le groupe n'avait aucun nom
  accessible du tout**. `aria-labelledby` vise désormais un conteneur dédié en
  `display: contents` (boîtes englobantes identiques au pixel sur les
  4 variantes), et l'`id` dupliqué disparaît.
  ⚠️ Le relevé du ticket annonçait le même `id` sur **trois** éléments ; la mesure
  en trouve **deux**.

- **`<OrigamTabs>` : le focus suit les flèches** (#786). Il suivait en réalité
  **avec un cran de retard** — il refocalisait l'onglet qu'on venait de quitter
  — parce que le gestionnaire relisait la sélection après l'avoir changée, or
  sous `v-model` le getter rend encore l'ancien identifiant.

- **`InlineEdit` : Confirmer et Annuler sont atteignables et actionnables**
  (#614). ⚠️ **Le ticket se trompait de cause** : ce n'est pas un motif
  `nested-interactive`, c'est qu'un seul `Tab` déclenchait le `blur`, lequel
  **démontait** les deux boutons avant que le focus les atteigne. Deux défauts
  voisins corrigés au passage : `Entrée` sur **Annuler** confirmait, et `Espace`
  sur l'un ou l'autre ne faisait rien. Le focus revient désormais sur
  l'affordance d'affichage au lieu de retomber sur `<body>`.

- **Le DS n'émet plus un rôle ARIA qu'il ne peut pas nommer** (#747, #660,
  #653) : 54 nœuds en violation `aria-command-name` (impact `serious`, WCAG
  4.1.2) sur **17 composants**, où le DS posait `role="button"` et un `tabindex`
  sur des éléments dont il n'avait aucun nom. Un nouveau composable arbitre :
  nom disponible → rôle + tabulation + `aria-label` ; pas de nom → **aucun rôle,
  aucun arrêt de tabulation**, plus un avertissement en développement nommant la
  prop à ajouter. Aucun libellé n'est fabriqué, et le `@click` continue de
  partir à la souris. `<OrigamSvgIcon>` était la seule feuille de la famille
  Icon à n'avoir jamais appelé `useIconAccessibility()` : `aria-hidden="true"`
  en dur, à vie.
  ⚠️ **Changement de rendu** : une zone `prepend` / `append` sans nom n'émet plus
  de rôle. Voir la section `Changed`.

- **Trois violations `axe` réelles corrigées sur le catalogue** (#777) :
  le sous-titre de `<OrigamCardHeader>` passe de **1,37:1 à 5,69:1** — il était
  figé sur un neutre absolu pendant que le titre héritait du premier plan résolu
  par la carte, soit du gris sur du violet saturé, pour **tout** consommateur
  passant un `bgColor` d'intention ; la page courante d'un fil d'Ariane passe de
  3,69:1 à 19,79:1 (elle était marquée « désactivée », donc à `opacity: .5`, et
  l'exemption WCAG 1.4.3 ne couvre pas un contenu) ; et la légende de graphique
  redevient une vraie liste. Le niveau `serious` devient bloquant dans la suite
  d'accessibilité.

- **Neuf emplacements d'accessibilité supplémentaires** mesurés un par un
  (#781), dont des `aria-label` construits à partir d'un nom de série absent —
  un graphique radar annonçait littéralement « undefined, x: 1 ». ⚠️ #781 reste
  **ouvert** : c'est un lot partiel d'une famille bien plus large.

- **La prop `id` du consommateur atteint le DOM** sur **2 des 5** composants
  signalés (#790) : `<OrigamOtpInputField>`, dont la racine ne portait aucun
  `:id` — un `getElementById` ou un `aria-describedby` externe était mort — et
  `<OrigamDataTableHeadersCell>`, où chaque ligne recevait un `id` **dérivé**, si
  bien que la valeur exacte demandée n'existait nulle part.
  ⚠️ Contrairement à ce qu'annonçait le titre du ticket, **`<OrigamInput>` n'est
  pas concerné** : mesuré, il remet l'`id` exact à son slot. `<OrigamSnackbarGroup>`
  ne l'est pas non plus — son `id` est une clé logique de pile, pas un `id` DOM.
  Les trois cas ont été mesurés non défectueux ou hors de portée, et c'est dit
  plutôt que corrigé à tort.

#### Comportement des composants

- **La frappe clavier atteint enfin le modèle** sur `<OrigamColorPickerField>`
  et `<OrigamDatePickerField>` (#859). Les deux portaient le même défaut par
  copier-coller : aucun `v-model` ni événement entre le champ texte interne et
  le modèle, un `handleChange` en talon vide, et `modelValue` exclu du
  forwarding. **Seul le popover écrivait le modèle** ; tout ce qui était tapé
  restait dans le DOM. La valeur est validée avant d'être écrite, pour ne jamais
  committer une saisie partielle (`#ab` n'est pas une couleur, `09/1` n'est pas
  une date). Portée volontairement limitée au mode date unique — `range` et
  `multiple` restent pilotés par le popover.
  Défaut latent corrigé au passage : après un `Clear` suivant une saisie
  clavier, le champ couleur affichait **littéralement**
  `{ "h": 0, "s": 0, "v": 0, "a": 1 }`, la constante « pas de couleur » étant un
  objet, donc `truthy`. La constante elle-même reste inchangée — c'est un export
  public.

- **`<OrigamRatingField>` respecte un parent qui contrôle et refuse la valeur**
  (#827). Cliquer une étoile laissait `:checked` avancer dans le DOM pendant que
  le modèle restait en arrière — et la radio correctement cochée se retrouvait
  **décochée par le navigateur**, sans le moindre événement pour le signaler.
  Vue ne re-patche une prop DOM que si sa valeur calculée diffère ; quand le
  parent refuse, elle ne diffère pas. Les radios sont désormais resynchronisées
  sur le modèle après tout `click` / `change`. ⚠️ #827 reste **ouvert**.

- **`<OrigamSelect>` et `<OrigamMenu>` défilent au lieu de déborder** (#742).
  Le plafond de hauteur était sur une boîte et l'`overflow` sur une autre — or
  **une boîte ne défile que si les deux sont sur elle**. Mesuré avant, 30 options,
  molette à fond : les trois boîtes à `scrollTop` 0, 20 options inatteignables.
  Après, la 30ᵉ option est atteignable dans tous les cas.
  ⚠️ Effet de bord assumé : le contenu passe de `inline-block` à `block`, ce qui
  **retire la bande transparente de 5 px** que le descendeur de ligne imposait à
  chaque panneau. A/B géométrique sur 9 panneaux : 8 rectangles identiques au
  pixel, seul le menu long change (`596×580` → `596×310` — le plafond est enfin
  tenu).

- **`<OrigamDialog>` : la boîte qui porte le plafond porte le défilement**
  (#563). Le contenu placé hors de la zone de contenu de la carte était
  inatteignable, aucun ancêtre ne défilant : le pied tombait 1 112 px sous la
  fenêtre. Une seule déclaration ajoutée.
  ⚠️ Deux affirmations du ticket **mesurées fausses** et corrigées dans la
  documentation : la zone de contenu de la carte ne défilait pas non plus, et le
  slot `#asset` n'est pas concerné.

- **Un attribut booléen nu résout à `true`** (#644) — et la portée réelle
  dépasse largement le titre du ticket : **aucun** attribut booléen nu ne
  résolvait à `true` sur **aucune** prop qu'un thème enregistré nomme.
  `<origam-card flat>` ne valait pas `flat="true"`, tandis que `:flat="true"`
  fonctionnait. Le mécanisme : un attribut nu compile en `flat: ''` et c'est
  **Vue** qui le transforme en `true` pendant la normalisation — le résolveur de
  thème rendait l'instantané brut d'avant cette normalisation, et défaisait donc
  le casting de Vue. Ce qui rendait le défaut illisible, c'est qu'il ne frappe
  que les props qu'un thème **nomme**, que la forme attribut nu, et qu'il est
  indépendant du thème actif — il suffit qu'un thème soit enregistré.

- **Déclarer `class` comme prop ne tue plus le fallthrough** (#620) : relevé
  refait au résolveur plutôt qu'au `grep` — 192 composants déclarent `class`
  transitivement, 189 la re-bindent, **3** ne le faisaient pas.
  `<OrigamChartBullet>` et `<OrigamChartStreamgraph>` perdaient la `class`,
  `<OrigamDialogConfirmation>` perdait **la `class` et le `style`**, ce que le
  ticket n'annonçait pas.

- **Aucun travail asynchrone ne survit à son propriétaire** (#719, #753, #779).
  Des `requestAnimationFrame` et `setTimeout` non annulés au démontage, sur une
  vingtaine de sites : `useAudio`, `scrollTo`, `useLocationStrategies`,
  `OtpInputField`, `Menu`, les transitions `ExpandX` / `ExpandY` /
  `TranslateScale`, `clickOutside`, `ripple`, `Carousel`, `parallax`,
  `activator`, `stack`, `InfiniteScroll`, `Select`, `Field`, `useSsrBoot`,
  `useVirtual`, `useMasonry`, `Img`. Une boucle qui se reprogramme ne s'annule
  pas, elle s'**arrête** : d'où le couple systématique drapeau + annulation au
  démontage. Mesuré en A/B contre `develop` : 11 des 24 tests rouges sur le
  parent, verts après ; les 13 autres sont les témoins.
  Sur #779, 6 sites ont été relevés un par un : **4 corrigés, 2 écartés avec la
  mesure qui le justifie**.
  ⚠️ Un lot intermédiaire avait introduit une **coalescence** de frames non
  mesurée ; elle a été retirée dans le même chantier. Chaque portée suit
  désormais l'ensemble de ses frames armées : le correctif ajoute l'annulation
  au démontage et **ne change rien d'autre**.

- **La validation redéclenche ses règles sur un modèle devenu nullish sans
  focus** (#702). Une des trois branches du `watch` était **vide** : les
  messages d'erreur restaient périmés et `isValid` restait `true`. Dans l'autre
  sens, un champ en erreur vidé par le code gardait son message. L'agrégat du
  formulaire parent est touché aussi — il restait valide sur un champ vide. Le
  report au `blur` **quand le champ a le focus** est délibéré et conservé.

- **Quinze chaînes en dur passent par `t()`** (#764), dans 9 composants —
  `<OrigamVideo>` (`Playback error`, mot pour mot le défaut qui avait fait
  naître #567 sur `<OrigamAudio>`, la clé existait déjà dans les deux locales et
  le composant ne la lisait pas), `CommandPalette`, `SliderField`, et cinq
  familles de graphiques. `<OrigamChartCartesian>` portait **déjà** la prop et
  ses deux traductions : seul le texte visible ne les consultait pas, si bien
  qu'en français le bouton affichait « Reset zoom » pendant que son propre
  `aria-label` disait « Réinitialiser le zoom ». La pilule de ce bouton était un
  rectangle de largeur codée en dur, dimensionnée pour l'anglais : mesuré, le
  texte français débordait de 34 px. La boîte a été élargie — **la traduction
  n'a pas été raccourcie**.

- **Quatorze remontées critiques de qualité de code** corrigées dans le DS
  (#771). Aucun changement de comportement attendu, et c'est **prouvé** là où le
  risque était réel : la refonte de `useColorEffect`, qui alimente 101 des 216
  composants, a été comparée à l'ancienne implémentation sur **6 272 cas**
  (28 couleurs × 28 fonds × 8 combinaisons d'état) — **zéro divergence**, avec
  un harnais vérifié par mutation.

- **Deux divergences d'hydratation**, de deux causes distinctes (#741). Un
  compteur d'identifiants vivait **au niveau module**, jamais remis à zéro, sous
  un commentaire affirmant que cet identifiant n'atteignait jamais le DOM — il
  l'atteignait, via `<OrigamTab>` et `<OrigamTabPanel>`. Sur un processus SSR
  persistant, le serveur rendait `id="origam-tab-285"` et le client
  `id="origam-tab-9"`. Mesuré : 1 erreur console / 1 erreur d'hydratation /
  4 avertissements → 0 / 0 / 0.
  ⚠️ **Changement de DOM** : l'attribut `data-origam-tab-id` est supprimé. Il
  portait le même compteur, et un `data-*` échappe à la rectification que Vue
  applique en production — il divergeait donc en silence.

### Changed

⚠️ Aucune de ces entrées n'est une rupture de type — rien ne cesse de compiler.
Toutes changent en revanche ce qui **sort dans le DOM ou à l'écran**, et méritent
d'être relues avant de monter de version.

- **Un repère ARIA anonyme n'est plus annoncé comme un repère.** `<OrigamWindow>`
  et `<origam-carousel>` sans nom accessible cessent d'émettre `role="region"` et
  `aria-roledescription` (#781) ; une zone `prepend` / `append` sans nom cesse
  d'émettre `role="button"` et son arrêt de tabulation (#747, #660, #653). C'est
  volontaire : un repère qu'on ne peut pas nommer n'est pas navigable, et un
  `role` sans nom est une violation `serious`. Si vous comptiez sur l'un de ces
  rôles, passez un nom (`aria-label`, ou la prop que l'avertissement de
  développement vous indique).
  Au passage, `aria-roledescription` était une **chaîne anglaise en dur**, lue
  telle quelle par les lecteurs d'écran ; elle passe par une clé de traduction.

- **`<OrigamRatingField>` rend 5 radios natives et non 6** (#812) — la sixième,
  de taille nulle, était annoncée comme une option inexistante.

- **`elevation="2xl"` et `"3xl"` rendent comme `xl`** (#813), au lieu
  d'effacer l'ombre. Voir `Fixed`.

- **L'attribut `data-origam-tab-id` disparaît du DOM** (#741). Voir `Fixed`.

- **`IGroupProvide.prev()` / `.next()` renvoient l'identifiant retenu**
  (`() => number | undefined`) au lieu de `void` (#786). Additif : les cinq
  autres appelants ignorent la valeur.

- **Montées de dépendances** : `typeorm` 0.3.31 → 1.1.1, `pg` 8.22.0 → 8.23.0,
  et 6 outils de développement (PR #559, #558, #539 — ce sont des numéros de
  *pull request*, pas de tickets).
  ⚠️ **Aucune n'atteint le paquet publié.** Mesuré : entre `v2.17.1` et cette
  release, `packages/ds/package.json` ne change que dans son bloc `scripts` —
  ni `dependencies`, ni `peerDependencies`, ni la map `exports` ne bougent.
  `typeorm` n'est déclaré que par le site vitrine, qui est `private`.

### Security

- **Les 19 avis de `pnpm audit` sont corrigés par montée de version, sans aucun
  waiver** (#718, #796).
  `pnpm audit --prod` : 9 vulnérabilités (2 `moderate`, 7 `high`, 2 ignorées) →
  `No known vulnerabilities found`. `pnpm audit` sur l'arbre **complet** :
  10 vulnérabilités (4 `moderate`, 6 `high`) → idem. Codes de sortie `1` → `0`,
  capturés **hors pipe**. Remesuré sur cette release : les deux répondent encore
  `No known vulnerabilities found`, exit `0`.
  Le bloc `pnpm.auditConfig.ignoreGhsas` est **supprimé**, pas élargi, et la
  dérogation accordée à `image-size` est **révoquée** : son critère de sortie —
  la publication d'un correctif — avait joué, et le waiver avait survécu un mois
  à son propre correctif. Vérifié dans le **code** des paquets et non dans la
  plage `semver`, l'avis annonçant toujours `first_patched_version: null`.
  Aucune montée de majeur. `docs/security-waivers.md` passe à « aucun waiver
  actif ».
  ⚠️ **Le paquet npm `origam` n'était pas concerné.** Ces avis vivaient dans
  l'arbre de **build et de développement** du dépôt, et les 6 paquets de
  production incriminés n'arrivaient que par le site vitrine, qui est `private`.
  Les dépendances déclarées du paquet publié n'ont pas changé depuis `2.17.1` :
  un consommateur n'était pas exposé, et ne gagne ici qu'une chaîne de
  construction propre.

### Internal

**42 des 80 commits ne touchent pas `packages/ds/src/`** et sont invisibles pour
un consommateur du paquet. Quatre thèmes :

- **Site vitrine** — 117 pages sorties du 404 (`/privacy` et `/contact`
  créées), 34 liens de navigation et de pied de page qui suivent enfin la langue
  du visiteur, polices auto-hébergées (plus aucun hôte tiers sur les 19 pages),
  une fuite mémoire du worker SSR de développement (~3,7 Mo par rendu), et une
  garde contre une migration de base destructive.
- **Fiabilité des tests e2e** — la garde de couverture a mesuré que **177 specs
  sur 242 n'étaient exécutées par aucun job de CI**, sans le moindre signal ;
  une spec rouge 5 fois sur 5 était repeinte en vert par les `retries` ; treize
  attentes codées en dur ont été remplacées par des attentes d'état.
- **Gardes d'architecture** — de 17 à **28 gardes**, et **15 auto-tests qui
  s'exécutent enfin** (rien ne les lançait). Parmi les nouveaux : `ts-token-refs`
  (garde 28), qui rejoue chaque gabarit `var()` assemblé en TypeScript un chemin
  d'exécution à la fois — **158 références qu'aucune garde ne regardait**, et
  c'est par là que #813 était passé.
- **Outillage de documentation** — le générateur de référence des composables
  tronquait 56 signatures sur 179, puis aplatissait 20 types de retour objet :
  ces deux défauts sont à zéro.

## [2.17.1] - 2026-09-14

Hotfix. Quatre correctifs, **aucune rupture d'API**. Trois des quatre ont
invalidé le diagnostic du ticket qui les demandait — les causes réelles sont
consignées ci-dessous, parce qu'elles sont plus instructives que les correctifs.

### Fixed

- **`border` / `outlined` sur les champs ne coupe plus le label flottant** (#726).
  La hiérarchie DOM est l'inverse de ce que les noms suggèrent : `origam-input`
  est l'élément EXTÉRIEUR, `origam-field` est à l'intérieur. `useBorder` peignait
  donc un rectangle SANS encoche dont le bord haut traversait le label.
  `IFieldProps` étend désormais `IBorderProps` et route largeur / style / couleur
  vers le canal de tokens que lisent les trois pattes `__outline` — l'encoche
  s'ouvre d'elle-même. Mesure de l'aire d'intersection label × bande de bordure,
  Chromium : TextField `61,41 px² → 0`, Select sans aucune prop `35,59 px² → 0`,
  Select `border="thick"` `71,19 px² → 0`.
  ⚠️ `OrigamSelect` déclare `border: true` dans son propre `withDefaults` : il
  était donc cassé PAR DÉFAUT, sans qu'un consommateur passe quoi que ce soit.
  Les 12 consommateurs d'`OrigamInput` ont été audités : 4 emboîtent un field
  (corrigés), 8 n'en ont aucun et gardent `useBorder` sur leur racine.
  Les valeurs directionnelles (`border="top"`, `borderBlock`…) ne peignent plus
  rien sur les champs à encoche : un trait horizontal y couperait le label.

- **Le track de `OrigamSwitch` a de nouveau une bordure par défaut** (#727).
  Les deux tokens étaient déclarés et LUS PAR PERSONNE — ils figuraient dans la
  baseline `token-var-channels-dormant`. Changer leurs valeurs seules n'aurait
  rien produit ; il fallait ajouter la déclaration qui les lit. Défaut :
  `1px solid var(--origam-color__border---default)`, donc le switch suit le thème
  actif. Mesure : `0px / none → 1px / solid`. La surcharge reste entière
  (`border="thick"` → 2px, `border="top"` ramène les autres côtés à 0).

- **`OrigamMasonry` patche ses enfants au lieu de les reconstruire** (#735).
  `:is="{ render: () => child }"` reconstruisait un objet littéral à CHAQUE passe
  de rendu : Vue voyait un type différent et détruisait / recréait tout le
  sous-arbre. Mesure Chromium sur UN SEUL redimensionnement, 9 enfants :
  117 nœuds ajoutés, 117 retirés, 0 enfant conservant son nœud DOM. Les enfants
  perdaient focus, scroll, lecture média, transitions et état de composant, et
  rejouaient leurs `onMounted`. Corrigé par `:is="child"` — branche `isVNode` de
  `createVNode`. Survivants `0/9 → 9/9`. Présent depuis la naissance du
  composant (2026-05-15), ce n'est pas une régression.

- **`OrigamVirtualScroll` rend de nouveau** (#736).
  L'erreur `$setup.convertToUnit is not a function` désignait la victime, pas le
  coupable : `convertToUnit` était bien importé ET exposé. `items?` était
  optionnelle SANS défaut, `useVirtual` lit `items.value.length` synchroniquement
  dans le `setup()`, le setup tombait, Vue n'assemblait jamais `__returned__`, et
  le template échouait sur le premier symbole rencontré. Corrigé par
  `items: () => []`. La doc annonçait déjà ce défaut — elle dit enfin vrai.
  Balayage : 0 composant sur 218 appelle un symbole absent de son setup ;
  sur la famille réelle (prop optionnelle lue sans garde), 35 → 34, les 34
  restants étant 18 refus délibérés et 16 props `required: true`.


## [2.17.0] - 2026-09-14

> ### ⛔ DÉROGATION ASSUMÉE — cette version MINEURE porte 8 ruptures d'API
>
> Le versioning sémantique, et la règle de ce dépôt (`CLAUDE.md`, « Work
> priorities and versioning »), imposent une **majeure** pour une rupture.
> Les 8 entrées `⚠️ BREAKING` ci-dessous en sont, et elles sortent malgré
> tout en `2.17.0`.
>
> **C'est une décision explicite du mainteneur**, prise le 2026-09-14 après
> que la recommandation inverse (`3.0.0`, ou `3.0.0-rc.1` validée par le
> site marketing) lui ait été présentée avec ses conséquences.
>
> **Ce que ça implique concrètement** : un consommateur épinglé en
> `^2.16.0` reçoit ces 8 ruptures **automatiquement**, sans action de sa
> part, et son build peut casser sans avertissement. Les recettes de
> migration sont dans chaque entrée ci-dessous — il n'y a pas de
> `docs/migration/v2-to-v3.md`, la ROADMAP le prévoyait pour une v3.
>
> Suivi de remédiation : voir le ticket ouvert le jour de cette release.


### ⚠️ BREAKING — aspect ratio now uses CSS `aspect-ratio`; an explicit `height` also constrains the width

`<OrigamResponsive>`, `<OrigamImg>`, `<OrigamCarouselItem>` and `<OrigamVideo>`
held their ratio through a `__sizer` child (`padding-block-end` as a
percentage) paired with a pull-back `margin-block-start: -N%` on `__content`.
That pair is replaced by the native `aspect-ratio` property.

**Why it had to change.** The pull-back margin cancelled the sizer's own
contribution to the container height — but only when the default slot was
filled (`__content` is `v-if="slots.default"`). `<OrigamImg>` renders into
`#additional`, never `#default`, so it never emitted the margin and appeared
healthy. Measured in Chromium, parent `max-width: 480px`:

| case | before | after |
|---|---|---|
| `<OrigamResponsive>` 16/9 | **`480 × 26`** | **`480 × 270`** |
| `<OrigamResponsive>` prop `aspectRatio` 16/9 | aspect **1.473** | aspect **1.778** |
| `<OrigamResponsive>` prop `aspectRatio` 4/3 | aspect **1.070** | aspect **1.334** |
| `<OrigamImg>` (3 cases) | — | **identical to the pixel** |
| `<OrigamCarouselItem>` | `596 × 500` | `596 × 500` |

Both ratios resolved to the **same height** before: the `aspectRatio` prop of
`<OrigamResponsive>` did nothing at all.

**What changes for you.** `aspect-ratio` resolves the *missing* axis in both
directions; the padding hack could only derive height from width. An explicit
`height` therefore now constrains the width too:

```
height: 120px on a 16/9 box    before: 480 × 120    after: 213.33 × 120
```

**Migration** — if you set a height and want the full width (a banner, for
instance), set the width explicitly as well:

```vue
<origam-responsive :aspect-ratio="16 / 9" height="120px" width="100%"/>
```

This was a deliberate decision: the component's job is to hold its ratio, and
honouring it in both axes is the faithful behaviour. Measured:
`height` + `width: 400px` renders `400 × 120`.

**Removed:** the `__sizer` child and its SCSS rule, `contentStyles` (the
pull-back margin), the 4 `__sizer` tokens across the 4 token sheets, and the
dead `.origam-img--booting :deep(.origam-responsive__sizer)` rule with its
local token. The `aspect-ratio-{default,square,portrait}` tokens stay —
already dormant beforehand, separate debt.

`<OrigamVideo>` was a fourth consumer, not listed in the ticket. It carried a
`test.fail` describing this exact fix word for word; removed, the test passes.

### ⚠️ BREAKING — `inline` removed from `IResponsiveProps` (so from `<OrigamResponsive>`, `<OrigamImg>`, `<OrigamCarouselItem>`)

**The prop made the component disappear.** It is not a tuning problem, it is
a design contradiction: `inline` painted `display: inline-flex`, which makes
the root resolve its width *shrink-to-fit*. `<OrigamResponsive>` holds its
aspect ratio through a `__sizer` whose height is a `padding-block-end`
expressed as a **percentage** — and percentages resolve against the **width**.
Width `auto` → `0` → padding `0` → height `0`.

Measured in Chromium against Histoire (one story rendering the three
consumers side by side, `aspect-ratio` 16/9, parent `600px`, **no explicit
width** — the realistic case), bounding box of the rendered content and the
sizer's resolved `padding-block-end`:

| Component | `inline` off | `inline` on |
|---|---|---|
| `<OrigamResponsive>` | `600 × 0`, sizer `337.5px` | **`0 × 0`**, sizer `0px` |
| `<OrigamImg>` | `600 × 338`, sizer `337.5px` | **`0 × 0`**, sizer `0px` |
| `<OrigamCarouselItem>` | `600 × 500`, sizer `1054.69px` | **`0 × 500`**, sizer `0px` |

All three collapse the **width** to `0`. On `<OrigamCarouselItem>` the height
survives only because the carousel imposes it (`height: inherit` on the
slide) — the image is still `0` wide, so still invisible.

The two stories that appeared to demonstrate the prop both passed an explicit
`:width`/`:height` alongside it (`40px`), which is precisely the workaround
the collapse forces. The e2e test that covered it asserted only that
`display` *contained* `"inline"` — a bar a plain `inline` clears too — so it
never measured the consequence.

**Removed:**

- `inline?: boolean` from `IResponsiveProps` (reaches `IImgProps` and
  `ICarouselItemProps` by extension);
- the `.origam-responsive--inline` modifier class and its SCSS rule in
  `OrigamResponsive.vue`;
- the two now-dead tokens `--origam-responsive--inline---display` and
  `--origam-responsive--inline---flex`, in `light.css`, `dark.css` (both the
  `[data-theme="dark"]` block and the `prefers-color-scheme` one),
  `_light.scss`, `_dark.scss`, and the regenerated `main.css`. They were
  never listed in `tokens.type.ts`, so nothing to remove there;
- `'inline'` from the `pick(...)` whitelist `OrigamImg` forwards to
  `<origam-responsive>`;
- the story controls (Img `Functional` + `Default`, Responsive `Functional` +
  `Default`) and the Responsive `Prop — inline` Variant;
- the doc sections and rows (`OrigamResponsive.md` "Inline mode", props
  interface, anatomy, token table; `OrigamCarouselItem.md` props row);
- the marketing API-reference seed entries for `responsive` (prop, anatomy
  class, playground switch, "Inline mode" example).

**Migration:** nothing to do in the common case. A leftover `inline`
attribute is no longer a declared prop, so it falls through to `$attrs` and
lands on the root `<div>` as an inert HTML attribute — measured, mount + one
tick: `<div id="origam-responsive-v-0" class="origam-responsive"
inline="true">`. It paints nothing, and no pixel moves, because the prop
already painted a zero-sized box. The root simply goes back to
`display: flex`, i.e. block-level in the flow instead of an invisible inline
box.

⛔ **Not offered here: a "wrap it in an inline-block" recipe.** It was tried
and **measured wrong**, so it is not documented as a workaround: a bare
`<OrigamResponsive aspect-ratio="1/1">` inside a
`<span style="display:inline-block;width:40px">` renders `40 × 0` — the sizer
resolves correctly (`padding-block-end: 40px`) but the root box does not take
its height. That is a **separate, pre-existing** behaviour of
`<OrigamResponsive>` used standalone, unrelated to `inline` and unchanged by
this removal — measured identically before it, with `inline` off: `Design`
`480 × 26` for a sizer of `480 × 270`, `Slots - Default` idem. `<OrigamImg>`
is unaffected (`600 × 338`), because it sets its own height. Opened as
**#709**, not fixed here.

Tracked as **#703**.

### ⚠️ BREAKING — `label` removed from `IValidationProps` (so from `<OrigamInput>`)

**No rendered output changes.** The prop painted nothing: measured at mount
plus one tick with `label="PROBE_LABEL"`, `<OrigamInput>` produced **zero**
`<label>` elements. What changes is the type — `<origam-input label="…">` is
no longer a declared prop and now falls through to `$attrs`.

A validation mixin has no display surface. `useValidation` never read
`label`, and the one component whose prop set comes from this mixin —
`<OrigamInput>` — is layout chrome: a four-area grid (prepend / control /
append / messages) whose accessible name belongs to the control handed in
through its `#default` slot, not to the wrapper `<div>`.

The two alternatives were tried and **measured wrong**, not argued away:

- **Wiring it** would have given six components a DUPLICATE label. Each
  already renders its own — Checkbox 1, Switch 1, TextField 2 (static +
  floating), RatingField 1, SliderField 1, RadioGroup 1.
- **Warning on it** fired on `<OrigamCheckbox label>`, `<OrigamTextField
  label>` and `<OrigamSwitch label>` — **correct** calls. Each forwards its
  own props into `<origam-input>` through `filterProps`, which carries
  exactly the keys the wrapper declares. Dropping the declaration is what
  stops that forwarding at its source.

**Migration:** none for the six components above — they keep their `label`,
which now lives on the interfaces whose components actually render one:
`IFieldProps`, `ISelectionControlProps`, `ISliderFieldProps`, and
`IRatingFieldProps` (added here, since the mixin was its only source).
A consumer passing `label` to a bare `<origam-input>` was passing a no-op and
should move it to the control inside the slot.

### ⚠️ BREAKING — `<OrigamContainer>` breakpoint `max-width` scale realigned to the design tokens

The component's responsive `max-width` ladder was hardcoded as SCSS literals
(`900/1200/1800/2400px`) that had silently drifted away from
`component/container.json`'s `max-width-{md,lg,xl,xxl}` tokens
(`768/992/1280/1440px`) — the token file even carried its own comment
flagging the gap. The fix makes the component read the tokens (with a
matching literal fallback), which is a **visible breakpoint-value change**
for every consumer, not a null-op:

| Min viewport | Old `max-width` | New `max-width` |
|---|---|---|
| `>= 960px` | `900px` | `768px` |
| `>= 1280px` | `1200px` | `992px` |
| `>= 1920px` | `1800px` | `1280px` |
| `>= 2560px` | `2400px` | `1440px` |

The viewport thresholds themselves (`960/1280/1920/2560px`) are unchanged —
only the resulting `max-width` at each rung. A 5th token,
`max-width-sm` (`576px`), is declared in the same token file but was
**not** wired into the ladder: `OrigamContainer`'s own doc has always
documented `< 960px → 100%` (no cap), never a `576px` tier — the token
stays dormant by design (naming-scale completeness with the Bootstrap-style
`sm/md/lg/xl/xxl` set, not a missing rung).

Any consumer relying on the exact prior pixel values (custom layouts tuned
to `900/1200/1800/2400px` breakpoints) should audit their layout after
upgrading.

### ⚠️ BREAKING — 88 dead typography (component, prop) pairs removed across 40 components

`useTypography(props, prefix)` writes an inline CSS custom property per
typography prop passed (`fontFamily` / `fontSize` / `fontWeight` /
`lineHeight` / `letterSpacing`) — but writing the variable paints nothing
until some stylesheet rule reads it back. Issue #501 measured 94 (component,
prop) pairs across 40 components where no rule ever did: typed, offered by
autocompletion, documented — and completely inert. The arbitrated fix is the
opposite of wiring 94 SCSS rules to force an effect: these props are
**removed** from the components that never painted them. `fontSize` is
untouched everywhere (98 % already painted); it was never part of this cut.

**The real count is 88, not 94** — re-measuring found the ticket's own
scanner had 2 false positives, both from the SAME blind spot: it checks
whether a component's OWN CSS-var prefix is read, but cannot see a prop
value reaching ANOTHER component's prefix through prop-forwarding.
`<OrigamField>` forwards its full prop set to a nested `<OrigamLabel>`
(`useProps().filterProps()`), and `OrigamLabel` has its own
`useTypography(props, 'label')` call that DOES read `fontWeight` /
`lineHeight` / `letterSpacing` — confirmed with `@vue/test-utils` +
`nextTick()` (the forward lands on the second render; `useTypography`'s own
doc explains why that's still what a real paint sees). `<OrigamTextareaField>`
forwards to both `<OrigamInput>` and `<OrigamField>` (which forwards again to
`<OrigamLabel>`), so it inherits the same three, plus `fontSize`, plus a
second live path: `fontWeight` cascades from `<OrigamInput>`'s own painted
root `font-weight` into the `mode="rich"` contenteditable div (an ordinary
CSS-inherited property, unblocked — confirmed via `getComputedStyle` against
a live Histoire render, 400→700 on both elements). Only `fontFamily` is
genuinely dead on every path for both components. `OrigamOtpInputField` was
independently verified NOT to share this leak (it forwards only to
`<origam-field>` with `label` excluded, so no nested `<OrigamLabel>` renders
in the default case) — its 4 dead props stand as measured. See
`packages/ds/scripts/audit-unconsumed-props.mjs` for the parser bug this
also surfaced (a `Pick<X, 'a' | 'b'>` heritage clause was mis-split on its
internal comma, corrupting sibling parents — fixed alongside this removal).

**GLOBAL vs SPECIFIC** — the triage the removal follows:
- **`fontFamily` (37 of the 88) is a project-level setting**: every origam
  app is wrapped in `<OrigamApp>`, so the font family is configured once,
  globally — never per component instance. All 37 dead `fontFamily`
  occurrences are removed without a case-by-case visual-effect argument;
  the architecture argument alone is sufficient. Migration: set the family
  via your theme's `vars.typo.family.*` (see
  `packages/ds/src/themes/origam.theme.ts`), not via a component prop.
- **`fontWeight` (8) / `lineHeight` (20) / `letterSpacing` (23) are
  component-specific** and were judged one at a time: a pair is removed
  only where no stylesheet rule — including through a forwarding chain —
  ever reads the resulting CSS variable. Migration: there is no drop-in
  prop replacement; restyle via the component's own semantic tokens
  (`--origam-{component}---*`) in your theme, or via the component's
  `color`/`variant`/`density` props where the effect is actually themeable.

**Removed, by component:**

| Component | Removed props |
|---|---|
| `OrigamAlert` | `fontFamily` |
| `OrigamAudio` | `fontFamily`, `letterSpacing` |
| `OrigamAvatar` | `fontFamily` |
| `OrigamBadge` | `fontFamily`, `lineHeight`, `letterSpacing` |
| `OrigamBracket` | `fontFamily`, `lineHeight` |
| `OrigamBracketCompetitor` | `fontFamily`, `lineHeight`, `letterSpacing` |
| `OrigamBracketRound` | `fontFamily`, `lineHeight` |
| `OrigamBtn` | `fontFamily` |
| `OrigamCardHeader` | `fontFamily` |
| `OrigamCardText` | `fontFamily`, `lineHeight` |
| `OrigamChip` | `fontFamily`, `lineHeight`, `letterSpacing` |
| `OrigamClipboard` | `fontFamily`, `lineHeight`, `letterSpacing` |
| `OrigamCode` | `fontWeight`, `letterSpacing` |
| `OrigamCommandPalette` | `fontFamily`, `fontWeight`, `lineHeight`, `letterSpacing` |
| `OrigamDataList` | `fontFamily` |
| `OrigamEmptyState` | `letterSpacing` |
| `OrigamExpansionPanelHeader` | `fontFamily`, `fontWeight`, `letterSpacing` |
| `OrigamField` | `fontFamily` |
| `OrigamFileFieldDragNDropItem` | `fontFamily`, `lineHeight`, `letterSpacing` |
| `OrigamFileFieldListItem` | `fontFamily`, `lineHeight`, `letterSpacing` |
| `OrigamForm` | `fontFamily` |
| `OrigamInfiniteScroll` | `fontFamily`, `fontWeight`, `lineHeight`, `letterSpacing` |
| `OrigamInlineEdit` | `fontFamily`, `lineHeight`, `letterSpacing` |
| `OrigamInput` | `fontFamily`, `letterSpacing` |
| `OrigamKbd` | `lineHeight`, `letterSpacing` |
| `OrigamLabel` | `fontFamily` |
| `OrigamListItem` | `fontFamily` |
| `OrigamListSubheader` | `fontFamily`, `letterSpacing` |
| `OrigamMessages` | `fontFamily`, `fontWeight`, `letterSpacing` |
| `OrigamOtpInputField` | `fontFamily`, `fontWeight`, `lineHeight`, `letterSpacing` |
| `OrigamPagination` | `fontFamily`, `lineHeight`, `letterSpacing` |
| `OrigamPickerTitle` | `fontFamily`, `lineHeight` |
| `OrigamSnackbarItem` | `fontFamily`, `fontWeight`, `lineHeight`, `letterSpacing` |
| `OrigamSystemBar` | `fontFamily` |
| `OrigamTab` | `fontFamily`, `lineHeight` |
| `OrigamTable` | `fontFamily`, `lineHeight`, `letterSpacing` |
| `OrigamTextareaField` | `fontFamily` |
| `OrigamToolbar` | `fontFamily` |
| `OrigamTooltip` | `fontFamily`, `letterSpacing` |
| `OrigamVideo` | `fontFamily`, `fontWeight`, `lineHeight`, `letterSpacing` |

**Migration:**

```diff
- <OrigamBtn font-family="mono">Copy</OrigamBtn>
+ <!-- fontFamily is a project-level setting — configure it once via -->
+ <!-- your theme's vars.typo.family, not per component instance. -->
+ <OrigamBtn>Copy</OrigamBtn>
```

```diff
- <OrigamBadge line-height="tight" letter-spacing="wide">3</OrigamBadge>
+ <!-- no drop-in replacement — line-height/letter-spacing on Badge never -->
+ <!-- read a stylesheet rule on any surface. Restyle via a theme override -->
+ <!-- of --origam-badge__badge---line-height / ---letter-spacing directly. -->
+ <OrigamBadge>3</OrigamBadge>
```

**Not affected** — `OrigamCode` (`fontFamily`/`fontSize`/`lineHeight`
kept), `OrigamKbd` (`fontFamily`/`fontSize`/`fontWeight` kept), `OrigamTitle`,
`OrigamBlockquote`, `OrigamTextMask` (fully painted, untouched) all keep
their full typed surface — every prop on those genuinely reaches a
stylesheet rule. `OrigamField` / `OrigamTextareaField` keep `fontSize` /
`fontWeight` / `lineHeight` / `letterSpacing` (see above) — only
`fontFamily` was removed from either.

Ref: issue #501.

### ⚠️ BREAKING — `activeBgColor` / `hoverBgColor` / `activeColor` / `hoverBgColor` removed

The flat per-state color override props — `activeBgColor`, `hoverBgColor`,
`activeColor`, `hoverColor` — no longer exist on any component
(`Pagination`, `Field`, `DataText`, `DataTitle` were the last ones still
declaring them, all marked `@deprecated`). They were folded into the
`hover` / `active` object props during the `useStateFlag` refactor, and
the deprecated flat props were left behind by mistake instead of being
purged in the same pass.

**Migration** — pass the override as a key on the `hover` / `active`
object prop instead of a separate flat prop:

```diff
- <Btn hover-color="success" />
+ <Btn :hover="{ color: 'success' }" />

- <Btn active-color="success" />
+ <Btn :active="{ color: 'success' }" />

- <Card hover-bg-color="success" />
+ <Card :hover="{ bgColor: 'success' }" />

- <Card active-bg-color="success" />
+ <Card :active="{ bgColor: 'success' }" />
```

(See `packages/ds/src/interfaces/Commons/color.interface.ts` for the
canonical documentation of this mapping.)

**No functional regression measured**: every real call site was audited
individually before removal. `Field` was the only component where the
override still painted something live (focus + active state); its
`color` / `bgColor` axis now reads from the `active` object instead of
the removed flat props, with the exact same `isActive && isFocused` gate
preserved. Every other declared instance (`Pagination`, `DataText`,
`DataTitle`) had already gone dead independently of this removal —
either forwarded to a child that no longer read the prop, or gated by an
`isHover` flag that was never actually toggled — so no visible behaviour
changes there. `useColorEffect`'s own flat-prop resolution path is also
removed: its only two real callers (`OrigamAudio`, `OrigamVideo`) never
declared these props and call the composable without `isHover`/`isActive`
refs, so the path was unreachable in practice; the only place it was
still exercised was a unit test using `as any` to bypass the type system.

**Known pre-existing gaps surfaced, not fixed by this change** (tracked
separately): `OrigamRadio` has no prop that colors the checked glyph
per active state (only a static `bgColor`); `OrigamSwitch`'s track never
visually distinguished the active/checked state via the removed props
either, in this DS version or the marketing themes that configured it.

### ⚠️ BREAKING — `origam/tokens/css/themes-all` and `origam/tokens/scss/themes-all` removed

Both export subpaths, their two generated files
(`dist/src/assets/css/tokens/themes-all.css`,
`dist/src/assets/scss/tokens/_themes-all.scss`), and the dead aggregation
step in `build-tokens.mjs` that produced them are gone.

**Why**: `$themes.json` has held only 2 entries (`light`, `dark`) for a
while, with zero `<brand>-<mode>` combos — the generator's aggregation
branch only ran when at least one combo existed, so it had become a
silent no-op. The ~2.1 MB CSS file and ~2.1 MB SCSS file left on disk
were a stale hand-edited snapshot from when brand combos still existed,
not a build output: no `tokens:build` run touched them, and nothing in
the codebase actually loaded them (`grep`'d for `@import` / `href` /
`url()` — zero hits; the two "references" found were comments). Shipping
them cost every install ~4.5 MB of dead weight (`files: ["dist/src/", …]`
embeds the whole directory) for zero runtime benefit.

**Migration** — anyone who imported the aggregate switches to the
per-theme sheets, which are current and still generated on every
`tokens:build`:

```diff
- import 'origam/tokens/css/themes-all'
+ import 'origam/tokens/css/light'
+ import 'origam/tokens/css/dark'
```

```diff
- @use 'origam/tokens/scss/themes-all';
+ @use 'origam/tokens/scss/light';
+ @use 'origam/tokens/scss/dark';
```

Ref: issue #497.

### ⚠️ BREAKING — 12 unused `tokens/component/*.json` files removed (206 CSS custom properties)

`checkbox`, `checkbox-btn`, `radio`, `select`, `contextual-menu`, `img`,
`rating-field`, `dialog-confirmation`, `highlight`, `date-picker-field`,
`lazy` and `transition` are gone from `packages/ds/tokens/component/` and
from `$themes.json`. Also removed: `qrcode` and `watermark` (handed over
from #436-A — registered nowhere, zero lines emitted either way) and
`sound` (same, plus the component itself no longer exists).

**Why**: measured, component by component, that none of the 206 CSS
custom properties these files declared was read by any component under
`packages/ds/src`, under any name — not the declared name, not a
plausible rename, not a nested `var()` fallback. `highlight.json` and
`sound.json` are more extreme still: `OrigamHighlight` and `OrigamSound`
do not exist anywhere in the repo (the same shape as the already-closed
`section.json` precedent). `dialog-confirmation.json`'s target component
(`OrigamDialogConfirmation`) has no `<style>` block at all. Full
per-component investigation, including the 3 files that turned out to be
divergences (real bugs) rather than vestiges and were therefore **not**
removed, is in #436.

Measured effect on the generated stylesheets:

```
light.css   187293 → 171736 bytes  (-15557, -8.3%)
dark.css    380189 → 348663 bytes  (-31526, -8.3%)
```

**This is a breaking change if you overrode any of these variables** —
whether from inside this repo (nothing did, verified) or from an external
consumer we have no visibility into. If you did, the property no longer
exists; there is no fallback to migrate to, because nothing in the DS
ever painted with it. The full list, for anyone auditing a diff against a
previous `origam` version:

<details><summary><code>checkbox.json</code> — 26 variables</summary>

```
--origam-checkbox---flex
--origam-checkbox---min-height
--origam-checkbox---transition-duration
--origam-checkbox---transition-easing
--origam-checkbox__icon---color
--origam-checkbox__icon---color-disabled
--origam-checkbox__icon---color-error
--origam-checkbox__icon---color-unchecked
--origam-checkbox__icon---opacity
--origam-checkbox__input---background-color
--origam-checkbox__input---background-color-checked
--origam-checkbox__input---background-color-disabled
--origam-checkbox__input---background-color-error
--origam-checkbox__input---background-color-indeterminate
--origam-checkbox__input---border-color
--origam-checkbox__input---border-color-checked
--origam-checkbox__input---border-color-disabled
--origam-checkbox__input---border-color-error
--origam-checkbox__input---border-color-focused
--origam-checkbox__input---border-radius
--origam-checkbox__input---border-style
--origam-checkbox__input---border-width
--origam-checkbox__input---opacity-disabled
--origam-checkbox__label---color
--origam-checkbox__label---color-disabled
--origam-checkbox__label---color-error
```
</details>
<details><summary><code>checkbox-btn.json</code> — 20 variables</summary>

```
--origam-checkbox-btn---background-color
--origam-checkbox-btn---background-color-checked
--origam-checkbox-btn---background-color-disabled
--origam-checkbox-btn---background-color-hover
--origam-checkbox-btn---border-color
--origam-checkbox-btn---border-color-checked
--origam-checkbox-btn---border-color-error
--origam-checkbox-btn---border-radius
--origam-checkbox-btn---border-style
--origam-checkbox-btn---border-width
--origam-checkbox-btn---color
--origam-checkbox-btn---color-checked
--origam-checkbox-btn---color-disabled
--origam-checkbox-btn---font-size
--origam-checkbox-btn---font-weight
--origam-checkbox-btn---opacity-disabled
--origam-checkbox-btn---padding-block
--origam-checkbox-btn---padding-inline
--origam-checkbox-btn---transition-duration
--origam-checkbox-btn---transition-easing
```
</details>
<details><summary><code>radio.json</code> — 23 variables</summary>

```
--origam-radio---opacity-disabled
--origam-radio__dot---background-color
--origam-radio__dot---background-color-disabled
--origam-radio__dot---background-color-error
--origam-radio__dot---border-radius
--origam-radio__dot---scale-from
--origam-radio__dot---scale-to
--origam-radio__dot---size
--origam-radio__input---background-color
--origam-radio__input---background-color-disabled
--origam-radio__input---border-color
--origam-radio__input---border-color-checked
--origam-radio__input---border-color-disabled
--origam-radio__input---border-color-error
--origam-radio__input---border-radius
--origam-radio__input---border-width
--origam-radio__input---size
--origam-radio__input---transition-duration
--origam-radio__label---color
--origam-radio__label---color-disabled
--origam-radio__label---color-error
--origam-radio__label---font-size
--origam-radio__label---padding-inline
```
</details>
<details><summary><code>select.json</code> — 39 variables</summary>

```
--origam-select---min-width
--origam-select---no-data-color
--origam-select---no-data-font-size
--origam-select---no-data-padding
--origam-select---no-data-text-align
--origam-select__chevron---color
--origam-select__chevron---color-active
--origam-select__chevron---transition-duration
--origam-select__chevron---transition-timing-function
--origam-select__chip---background-color
--origam-select__chip---border-radius
--origam-select__chip---color
--origam-select__chip---gap
--origam-select__chip---max-width
--origam-select__chip---padding-block
--origam-select__chip---padding-inline
--origam-select__item---background-color
--origam-select__item---background-color-active
--origam-select__item---background-color-hover
--origam-select__item---background-color-selected
--origam-select__item---color
--origam-select__item---color-selected
--origam-select__item---min-height
--origam-select__item---opacity-disabled
--origam-select__item---padding-block
--origam-select__item---padding-inline
--origam-select__item---transition-duration
--origam-select__list---background-color
--origam-select__list---border-radius
--origam-select__list---box-shadow
--origam-select__list---color
--origam-select__list---max-height
--origam-select__list---padding-block
--origam-select__list---padding-inline
--origam-select__list---z-index
--origam-select__search---background-color
--origam-select__search---border-bottom-color
--origam-select__search---padding-block
--origam-select__search---padding-inline
```
</details>
<details><summary><code>contextual-menu.json</code> — 16 variables</summary>

```
--origam-contextual-menu---background
--origam-contextual-menu---border-radius
--origam-contextual-menu---box-shadow
--origam-contextual-menu---color
--origam-contextual-menu---max-height
--origam-contextual-menu---offset-bottom
--origam-contextual-menu---offset-left
--origam-contextual-menu---offset-right
--origam-contextual-menu---offset-top
--origam-contextual-menu---position
--origam-contextual-menu---transition-duration
--origam-contextual-menu---transition-timing-function
--origam-contextual-menu---z-index
--origam-contextual-menu__content---max-width
--origam-contextual-menu__content---overflow
--origam-contextual-menu__content---padding
```
</details>
<details><summary><code>img.json</code> — 14 variables</summary>

```
--origam-img---background-color
--origam-img---border-radius
--origam-img---border-radius-circle
--origam-img---border-radius-rounded
--origam-img---color
--origam-img---opacity-loaded
--origam-img---opacity-loading
--origam-img---transition-duration
--origam-img---transition-timing-function
--origam-img--error---background-color
--origam-img--error---color
--origam-img__placeholder---background-color
--origam-img__placeholder---color
--origam-img__placeholder---font-size
```
</details>
<details><summary><code>rating-field.json</code> — 13 variables</summary>

```
--origam-rating-field---gap
--origam-rating-field---opacity-disabled
--origam-rating-field---transition-duration
--origam-rating-field__item---color
--origam-rating-field__item---color-active
--origam-rating-field__item---color-disabled
--origam-rating-field__item---font-size
--origam-rating-field__item---scale-active
--origam-rating-field__item---scale-hover
--origam-rating-field__item---transition-duration
--origam-rating-field__label---color
--origam-rating-field__label---font-size
--origam-rating-field__label---padding-inline
```
</details>
<details><summary><code>dialog-confirmation.json</code> — 12 variables</summary>

```
--origam-dialog-confirmation---actions-gap
--origam-dialog-confirmation---description-color
--origam-dialog-confirmation---description-font-size
--origam-dialog-confirmation---icon-color-danger
--origam-dialog-confirmation---icon-color-default
--origam-dialog-confirmation---icon-color-info
--origam-dialog-confirmation---icon-color-success
--origam-dialog-confirmation---icon-color-warning
--origam-dialog-confirmation---icon-size
--origam-dialog-confirmation---title-color
--origam-dialog-confirmation---title-font-size
--origam-dialog-confirmation---title-font-weight
```
</details>
<details><summary><code>highlight.json</code> — 12 variables</summary>

```
--origam-highlight---background-color
--origam-highlight---border-radius
--origam-highlight---color
--origam-highlight---font-weight
--origam-highlight---padding-block
--origam-highlight---padding-inline
--origam-highlight--danger---background-color
--origam-highlight--danger---color
--origam-highlight--info---background-color
--origam-highlight--info---color
--origam-highlight--success---background-color
--origam-highlight--success---color
```
</details>
<details><summary><code>date-picker-field.json</code> — 6 variables</summary>

```
--origam-date-picker-field---max-width
--origam-date-picker-field---menu-offset
--origam-date-picker-field---min-width
--origam-date-picker-field__icon---color
--origam-date-picker-field__icon---color-error
--origam-date-picker-field__icon---color-hover
```
</details>
<details><summary><code>lazy.json</code> — 4 variables</summary>

```
--origam-lazy---placeholder-background-color
--origam-lazy---placeholder-min-height
--origam-lazy---transition-duration
--origam-lazy---transition-timing-function
```
</details>
<details><summary><code>transition.json</code> — 21 variables</summary>

```
--origam-transition---dialog-bottom-duration
--origam-transition---dialog-bottom-easing
--origam-transition---dialog-bottom-translate-distance
--origam-transition---slide-x-duration
--origam-transition---slide-x-easing
--origam-transition---slide-x-translate-distance
--origam-transition---slide-y-duration
--origam-transition---slide-y-easing
--origam-transition---slide-y-translate-distance
--origam-transition__default---duration
--origam-transition__default---easing
--origam-transition__dialog---duration
--origam-transition__dialog---easing
--origam-transition__expand---duration
--origam-transition__expand---easing
--origam-transition__expand---max-height-from
--origam-transition__fade---duration
--origam-transition__fade---easing
--origam-transition__scale---duration
--origam-transition__scale---easing
--origam-transition__scale---scale-from
```
</details>

Ref: issue #436.

## [2.16.0] - 2026-08-19

A release about **things that were declared but did nothing**. Seven
components emitted events they never declared; one prop had been inert since
it shipped; another prop had no reason to exist at all. None of it was
visible — that is precisely why it lasted.

### Fixed

- **Seven components emitted `update:*` without declaring it.** `OrigamForm`,
  `OrigamSheet`, `OrigamBracketCompetitor`, `OrigamBracketMatch`,
  `OrigamDialogConfirmation`, `OrigamRadioGroup` and `OrigamSnackbar` write
  through a `useVModel` held by a composable they hand their `props` to — so
  the emit exists without any `emit(...)` appearing in the component. Vue
  warned on every mount, and the `onUpdate:*` handler stayed in `$attrs`,
  where `inheritAttrs` pinned it onto the root element instead of wiring it
  as an event. `v-model` on these components now behaves as documented, with
  no console noise.

- **`density` did nothing on `OrigamCounter`.** `ICounterProps` has extended
  `IDensityProps` since it shipped, but the component never called
  `useDensity` — the story even exposed a control for it. The three density
  classes are now emitted.

  ⚠️ Known limitation, tracked in
  [#356](https://github.com/Elyseranet/origam/issues/356): the counter's font
  size does not currently respond to **any** channel — not a prop, not a
  token, not a theme, not even an inline style. The class is emitted and the
  SCSS rule matches; the rendered size does not follow, and the cause is not
  yet identified. The prop→class link is proven; the visual effect is not
  claimed.

### Removed

- **`disabled` is gone from the whole `Icon` family** — `OrigamIcon`,
  `OrigamClassIcon`, `OrigamComponentIcon`, `OrigamLigatureIcon`,
  `OrigamSvgIcon`.

  **Migration: delete it, nothing else changes.** None of the five components
  ever read it — no class, no attribute, no style — so `<origam-icon
  disabled>` was already a no-op. Your rendering is identical before and
  after; only the TypeScript signature narrows, so a stale `disabled` now
  raises a compile error instead of failing silently.

  An icon renders a glyph; it does not respond to input. Paint the disabled
  state on the control that **owns** the icon — the button, the field, the
  list item — and the icon inherits its opacity and cursor. That is also what
  keeps one control from showing two divergent disabled treatments.

### Tooling

- **New architecture guard: `emits-completeness`.** Any reachable `update:*`
  must be declared. Precision measured at 5/5 with zero false positives —
  every baselined entry was mounted and made to emit. What makes it work is
  the *reachability* filter (is `onActive` actually destructured? is the
  `useVModel` ref written or bound to a `v-model`?), not relay detection: a
  guard without it would push you to declare emits "just in case", which
  changes `$attrs` behaviour rather than being neutral hygiene.

  Five real defects are recorded in its baseline and deliberately **not**
  fixed in this release — `OrigamDrawer`, `OrigamColorPickerField`,
  `OrigamDatePickerField`, `OrigamContextualMenu`, `OrigamSelect`. Tracked in
  [#358](https://github.com/Elyseranet/origam/issues/358).

## [2.15.0] - 2026-08-14

A structural release. Most of it is invisible at runtime — public typing
surface that was missing, and internal files moved to where you would expect
to find them. The visible part is four bugs, one of which had been inert
since the component shipped.

### Added

- **Every component now exposes its instance type.** `TOrigamXxx =
  InstanceType<typeof OrigamXxx>` is what you need to type a template ref
  (`const btnRef = ref<TOrigamBtn>()`). Before this release 63 components had
  none, so you fell back to `any` or rebuilt the type by hand. All 217 have
  one now.

- **Emit and slot interfaces.** 129 components rendered a `<slot>` without a
  `defineSlots<IXxxSlots>()`, so the slot scope was untyped and you wrote
  those templates blind. Six more declared emits with an inline type instead
  of a named `IXxxEmits`. Both are now consistent across the catalogue, with
  the scope actually typed — `OrigamVirtualScroll` needed four distinct scope
  interfaces because its indexed slot and its fallback slot genuinely do not
  expose the same data.

- **`INTENT` enum** (`enums/Commons/intent.enum.ts`). The most-used vocabulary
  of the design system — `neutral | primary | secondary | ghost | success |
  warning | danger | info` — had no enum. It lived in three parallel places,
  one of which was a runtime `Set` carrying a comment asking you to keep it in
  sync by hand. `TIntent` now derives from the enum; the type is character-
  for-character identical, only its source changed.

### Fixed

- **`borderBlock` and `borderInline` did nothing.** Declared on
  `IBorderProps`, never consumed. Passing them produced no border and no
  warning. The fix turned out to have two floors: `useBorder` ignored them,
  and beneath it `useStateEffect` — the path ~32 components take — rebuilt
  its props through a hardcoded getter list that never learned about them. So
  fixing `useBorder` alone would still have left those components inert.

- **`OrigamBadge` dropped its prepend and append content.** The interface
  inherited `IAdjacentProps` but the component never consumed `useAdjacent`,
  reimplementing the detection by hand. A `#prepend` slot passed without an
  icon prop never rendered at all, and no click was ever emitted.

- **`<origam-parallax event="orientation">` never moved.** The guard for the
  orientation branch tested `props.event === 'move'` — a condition that
  cannot hold inside a branch only reached when the event is `orientation`.
  The listener was registered and did fire; the movement was simply never
  applied. Present since the component's first implementation (2025-07-18),
  and just as inert on a real device with a real sensor as in a test.

- **`useSnackbarGroup` ignored a story-level default.** Unrelated to consumer
  code — see *Known issues* below for the remaining half of that one.

### Changed — internal file layout

Enum, type and const files are now named after the **component** that owns
them, one file per component, with the concept living in the symbol name
rather than the filename. `tabs-variant.enum.ts` became `tab.enum.ts`;
`chart-honeycomb-color-mode.enum.ts` and
`chart-honeycomb-orientation.enum.ts` merged into `chart-honeycomb.enum.ts`.
The intent is that finding a component's surface means opening one file, not
hunting several differently-suffixed ones. A CI guard now enforces it.

Ownership was decided by reading which component actually consumes each
symbol, not by the filename. Two cases were counter-intuitive: the `Mask/`
files belong to `OrigamTextField` (input masking) and not to `OrigamTextMask`
(a text-rendering component that consumes none of them); and the toolbar
enums belong to `OrigamRichToolbar`, a component in its own right — there is
no `OrigamTextarea`.

Several transverse symbols moved to `Commons/` — `mdi`, and the duplicated
`horizontal | vertical` declarations that had accumulated under eight
different names. Where a component-specific name was worth keeping, it now
derives from the Commons one (`TStepperOrientation = TDirection`) rather than
redeclaring the same values.

### Deep import paths are not a supported API

`package.json` exposes a `"./*"` wildcard, so `origam/enums/Audio/audio-variant.enum`
resolved in 2.14.1. **74 such paths no longer exist** after the reorganisation
above (48 types, 15 enums, 11 consts).

If you import from `origam` — the path documented everywhere — nothing
changes. If you import a deep path into a source file, it may break. Those
paths are internal structure, not API, and they will keep moving.

**`"./*"` will be removed from the exports map in 3.0.0**, which turns
today's ambiguity into an explicit contract. The declared entry points
(`origam`, `origam/styles`, `origam/tokens/*`, `origam/nuxt`,
`origam/components`, `origam/composables`, …) are unaffected.

The 41 renames git could track:

| Before | After |
|---|---|
| `origam/consts/Chart/pictorial-icons.const` | `origam/consts/Chart/chart-pictorial.const` |
| `origam/consts/Chart/world-geographic.const` | `origam/consts/Chart/chart-map.const` |
| `origam/consts/Icon/mdi.const` | `origam/consts/Commons/mdi.const` |
| `origam/consts/Parallax/parallax-container.const` | `origam/consts/Parallax/parallax.const` |
| `origam/consts/Sheet/sheet-snap-points.const` | `origam/consts/Sheet/sheet.const` |
| `origam/consts/Textarea/textarea.const` | `origam/consts/TextareaField/textarea-field.const` |
| `origam/enums/Blockquote/blockquote-variant.enum` | `origam/enums/Blockquote/blockquote.enum` |
| `origam/enums/Bracket/bracket-match-status.enum` | `origam/enums/Bracket/bracket-match.enum` |
| `origam/enums/Bracket/bracket-variant.enum` | `origam/enums/Bracket/bracket.enum` |
| `origam/enums/Chart/chart-cartesian-kind.enum` | `origam/enums/Chart/chart-cartesian.enum` |
| `origam/enums/Chart/chart-honeycomb-orientation.enum` | `origam/enums/Chart/chart-honeycomb.enum` |
| `origam/enums/Chart/chart-map-mode.enum` | `origam/enums/Chart/chart-map.enum` |
| `origam/enums/Chart/chart-pictorial-mode.enum` | `origam/enums/Chart/chart-pictorial.enum` |
| `origam/enums/Chart/chart-polar-kind.enum` | `origam/enums/Chart/chart-polar.enum` |
| `origam/enums/Chart/chart-pyramid-kind.enum` | `origam/enums/Chart/chart-pyramid.enum` |
| `origam/enums/Chart/chart-sparkline-kind.enum` | `origam/enums/Chart/chart-sparkline.enum` |
| `origam/enums/Chart/chart-streamgraph-offset.enum` | `origam/enums/Chart/chart-streamgraph.enum` |
| `origam/enums/Chart/chart-treemap-algorithm.enum` | `origam/enums/Chart/chart-treemap.enum` |
| `origam/enums/Chart/chart-word-cloud-rotation.enum` | `origam/enums/Chart/chart-word-cloud.enum` |
| `origam/enums/Code/code-lang.enum` | `origam/enums/Code/code.enum` |
| `origam/enums/EmptyState/empty-state-preset.enum` | `origam/enums/EmptyState/empty-state.enum` |
| `origam/enums/Icon/mdi.enum` | `origam/enums/Commons/mdi.enum` |
| `origam/enums/InlineEdit/inline-edit-action.enum` | `origam/enums/InlineEdit/inline-edit.enum` |
| `origam/enums/SliderField/slider-field-variant.enum` | `origam/enums/SliderField/slider-field.enum` |
| `origam/enums/Tabs/tab-variant.enum` | `origam/enums/Tabs/tab.enum` |
| `origam/enums/Textarea/textarea-output.enum` | `origam/enums/TextareaField/textarea-field.enum` |
| `origam/enums/Textarea/textarea-toolbar-command.enum` | `origam/enums/RichToolbar/rich-toolbar.enum` |
| `origam/types/Bracket/bracket-round-side.type` | `origam/types/Bracket/bracket-round.type` |
| `origam/types/Chart/chart-cartesian-kind.type` | `origam/types/Chart/chart-cartesian.type` |
| `origam/types/Chart/chart-legend-position.type` | `origam/types/Chart/chart-legend.type` |
| `origam/types/Chart/chart-map-mode.type` | `origam/types/Chart/chart-map.type` |
| `origam/types/Chart/chart-polar-kind.type` | `origam/types/Chart/chart-polar.type` |
| `origam/types/Chart/chart-pyramid-kind.type` | `origam/types/Chart/chart-pyramid.type` |
| `origam/types/Chart/chart-sparkline-kind.type` | `origam/types/Chart/chart-sparkline.type` |
| `origam/types/Chart/chart-treemap-algorithm.type` | `origam/types/Chart/chart-treemap.type` |
| `origam/types/CommandPalette/command-palette-hotkey.type` | `origam/types/CommandPalette/command-palette.type` |
| `origam/types/Grid/grid-align.type` | `origam/types/Grid/grid.type` |
| `origam/types/InlineEdit/inline-edit-input-type.type` | `origam/types/InlineEdit/inline-edit.type` |
| `origam/types/Masonry/masonry-align.type` | `origam/types/Masonry/masonry.type` |
| `origam/types/NumberFormat/number-format-format.type` | `origam/types/NumberFormat/number-format.type` |
| `origam/types/QrCode/qr-code-error-correction.type` | `origam/types/QrCode/qr-code.type` |

The remaining 33 were merged into an existing file rather than renamed; the
symbols kept their names and are all still exported from `origam`.

### Known issues

Found while repairing the test suite, documented rather than rushed into this
release:

- **Theme-level component defaults reach only part of the catalogue.** The
  `components` block of a theme is delivered through `useDefaults()`, which a
  component must opt into — 173 of 217 do not, so setting a prop there does
  nothing for them, silently. On top of that, a component that does opt in
  reads the merged value in its script but the template sees the raw props,
  so `<origam-selection-control>` inside its group renders an `<input>`
  without a `type` attribute and never emits. Both are being addressed
  together; the 2.14.1 fix to `usePassedProps` was a third failure of the same
  path.

- **`defaultDuration` on `<origam-snackbar-group>` is decorative.** Declared,
  defaulted, never read — `notify()` always uses the built-in 5 000 ms.

- **`<origam-snackbar-item>` never renders its prepend area,** including a
  custom `#prepend` slot. `icon` is typed `TIcon | false` with no explicit
  default, so Vue resolves an unpassed prop to `false` rather than
  `undefined`, and the template hides the whole area.

- **Transitions ignore `group` when it changes after mount.** The tag is a
  flat `shallowRef` read once at setup instead of a computed, so
  `<component :is>` never re-evaluates. Affects the 12 components built on
  `useCssTransition` / `useWindowTransition`. Setting `group` statically works.

## [2.14.1] - 2026-08-13

Two fixes, both found while converting variants to props presets on the v3
line. Neither is caused by that work — they predate it and affect this 2.x
line, so they are shipped here rather than held back for a major.

### Fixed

- **A theme default could be silently ignored.** `usePassedProps` counted a key
  present in `vnode.props` with the value `undefined` as "passed". Vue does not
  drop a dynamically-bound key just because its current value is `undefined`, so
  the most ordinary consumer pattern — `:bg-color="state.bgColor"` — reported
  the prop as declared while it was empty, and the theme default was skipped.

  The symptom was a component that appeared not to follow its theme, with
  nothing logged and no error. Requiring a non-`undefined` value brings this in
  line with Vue's own `withDefaults()`, where an `undefined` prop falls back to
  its default.

- **`color-mix()` was not recognised as a CSS colour.** `isCssColor` matched
  `color(...)` (Color Level 4) but not `color-mix(...)`, which is a full
  `<color>` function and one the design system uses itself. Values passed that
  way fell through silently. Purely additive — no caller could have depended on
  a `color-mix(...)` string being dropped. `useElevation` already listed
  `color-mix` in its equivalent detector; this brings `isCssColor` in line.

### Notes for consumers

No API change, no visual change by default. If a component of yours looked like
it was ignoring a theme default while you bound a possibly-`undefined` value to
one of its props, that is the first fix above.

## [2.14.0] - 2026-08-07

Reported from a real integration, not from a code review. Each item was
reproduced before being fixed, and the fix verified against the running
component.

### ⚠️ BREAKING — `<origam-avatar>` is now a circle by default

The base theme sized avatar corners with `rounded: 'lg'` — a 16px rounded
square. Every avatar that does not set `rounded` explicitly now renders as a
circle (`rounded: 'full'`).

**Why**: an avatar is round in the overwhelming majority of interfaces, and
until now obtaining one required knowing that a second, undocumented radius
scale existed (see the `rounded` fix below). The mismatch showed: a
rounded-square avatar dropped into a circular trigger left a visible ring
around it — reported from the field as *"a square inside a circle"*.

**Migration** — restore the previous shape app-wide in one line, through the
theme layer:

```ts
createOrigam({ theme: { components: { 'origam-avatar': { rounded: 'lg' } } } })
```

or per instance with `<origam-avatar rounded="lg">`.

### Fixed — dead `aria-describedby` on input fields (accessibility)

A screen reader announced **no validation message at all**. The defect was
invisible to the eye: the message rendered correctly.

`<origam-text-field>` filtered `id` out of the props it forwarded, so
`<origam-input>` never received it and invented its own. It then derived
`<id>-messages` and pointed `aria-describedby` at it — but `<origam-messages>`
declared an `id` prop and applied it to **no element**, giving each message a
different id instead. The reference resolved to nothing.

`<origam-messages>` now applies the received `id` to its root, and
`<origam-text-field>` no longer filters `id` out. Verified in a browser:
`aria-describedby` resolves to an element that exists.

**Second effect of the same fix**: an `id` passed to a text field now actually
reaches its `<input>`. `document.getElementById(...)` finds it, and an
external `<label for>` associates correctly — both previously failed silently.

### Fixed — `<origam-avatar size>` ignored outside a flex container

The root element declared no `display`, so with `tag="span"` it inherited the
browser's `inline` — and an inline box ignores `width`/`height`. The avatar
collapsed to its content and `size` did nothing, with no warning.

It appeared to work only when the parent happened to be a flex container,
which blockifies its children. Measured on one real page: the same component
rendered 32×32 under `inline-flex` but **30×30 under `position: relative`**
for a requested size of 72.

The root now declares `display: inline-flex` — `inline-flex` rather than
`block` because `tag="span"` exists so an avatar can sit in phrasing content,
inside a `<button>` whose content model rejects block-level elements. Consumers
who worked around this with `.origam-avatar { display: inline-flex }` can drop
the override; it remains harmless.

### Fixed — `rounded` rejected the token scale, hiding the circular variant

`TRounded` only described the component scale (`x-small` … `x-large`,
`shaped`), none of which produces a circle. The radius rungs — `none`, `xs`,
`sm`, `md`, `lg`, `xl` and **`full`**, the one that yields a circle — were
already honoured at runtime (the brand themes have shipped `rounded: 'md'` for
a while) but failed to type-check and never appeared in autocompletion.

A round avatar was therefore undiscoverable: it required knowing that a second,
undocumented scale existed. Reported from the field as *"a square inside a
circle"* — a rounded-square avatar in a circular trigger leaves a visible ring.

The rungs are now a first-class `ROUNDED_TOKEN` enum and part of `TRounded`.
`rounded="full"` type-checks. The two scales stay separate on purpose: one
names an intent (`shaped`), the other a radius rung — `x-small` and `xs` are
not interchangeable.

### Fixed — the published package shipped no changelog

`files` listed `CHANGELOG.md`, but the file lives at the monorepo root and had
no counterpart in `packages/ds/`, so npm silently packed nothing. Consumers had
no way to tell what a release contained. A `prepack` step now copies it in —
verified: 96 kB of changelog in the tarball.

## [2.13.0] - 2026-08-05

### ⚠️ BREAKING — `<origam-select>` dropdown rows now follow the control

A `<origam-select>` opened a menu whose rows measured 48px whatever the
control was set to. The most common case — a select with **no** `size` prop —
was the worst: a 48px row under a 36px control. Rows now match the control
exactly at every size (36/36 unsized, 28/28 small, 44/44 large, 60/60
x-large + comfortable).

**Why this is breaking**: the fix corrects how `density` is applied to
**every** list, not only dropdowns. Density becomes a coherent ±8px offset
aligned on the field model, where it previously amounted to −24px in
`compact` and did nothing at all in `comfortable`:

| standalone list row, no `size` | before | after |
|---|---|---|
| `default` | 56px | 56px |
| `compact` | 32px | **48px** |
| `comfortable` | 56px | **64px** |

The old 32px came from counting density three times (−8 on `min-height`,
−8 on each block padding). `comfortable` had no rule at all and was a no-op.
Anything relying on `density="compact"` on an `<origam-list>` will render
8–16px taller.

`ISizeProps` is added to `IListProps` (a forwarding prop — the list paints
nothing from it) and to `IListItemProps` (which paints the row height).

### ⚠️ BREAKING — `useStyle()` no longer overwrites a consumer `id`

`useStyle()` generated its own id and the component put it on its root,
silently overwriting an `id` passed as a prop. On `<origam-btn>` this broke
every `<label for>`, `aria-labelledby`, `aria-controls` and
`aria-describedby` pointing at a button. The consumer's `id` now wins and the
generated rule follows it.

**Why this is breaking**: components previously always carried a generated
id. Anything keyed on that generated id (a CSS selector, a test locator)
will no longer match when the consumer supplies an `id`.

### Fixed

- **The generated stylesheet was being discarded entirely.** `StyleValue`
  includes `false`, and Vue resolves an unpassed prop whose declared type
  contains Boolean to `false`, never `undefined` — so every component
  exposing the shared `style` prop emitted `#id {false}`, which is not a
  declaration. Browsers dropped it through error recovery; jsdom dropped the
  **whole** sheet. Nested style arrays were also flattened one level only,
  landing an object in the sheet as `[object Object]`.
- **CSS injection through the `id` prop.** Now that the id comes from the
  consumer and is interpolated verbatim into a `<style>` element, an id such
  as `a { } body { display: none }` appended arbitrary rules to the document.
  A new `escapeCssIdent()` utility delegates to native `CSS.escape`, with a
  spec-conformant fallback for jsdom and SSR, which expose no `CSS` global.
- **Interpolation placeholders silently rendered empty.** `t()` is variadic
  — `t(key, ...params)` — but five call sites passed it an **array**, so the
  array landed in `params[0]` where the template expected the value itself.
  This stayed invisible while `stringifyParam` accepted any value (`[3]`
  stringified to `"3"`); once it was narrowed to primitives, an array began
  rendering as an **empty string** and the placeholder vanished. Visible
  effects: `<origam-file-field display="counter">` displayed `" files"`
  instead of `"3 files"`, and the `max_length` validation message of
  `<origam-text-field>` / `<origam-textarea-field>` showed an empty limit.

### Security

`brace-expansion` overrides were pinned to the **vulnerable** versions
(`^2.1.2` / `^5.0.8`) — set for an earlier advisory and never moved since.
They are raised to the patched floors (`^2.1.4` / `^5.0.9`), which clears
the three `high` DoS advisories (unbounded expansion) that `pnpm audit`
reported through `minimatch`.

Nuxt advisories published during this release cycle are cleared too:
`@nuxt/devtools` (**critical**), and five `high` on `nuxt` itself
(server-side RCE via Runtime, unauthenticated OOM crash, CPU exhaustion
while parsing). `nuxt` moves to `^4.5.1` and `typeorm` to `^0.3.31`,
staying on the `0.3.x` line — the fix landed there, and `1.x` is a
breaking change. Every advisory listed above is cleared as of this release.

Advisories are a moving target, so this is stated as of a date rather than as
a standing guarantee: on 2026-08-11, `pnpm audit --prod` surfaced three new
`high` advisories unrelated to the ones above (`image-size` ICNS and JXL/HEIF
parsers, `nanoid` custom generators). They arrived after this release and are
tracked separately — run `pnpm audit --prod` yourself for the current state.

Scope note for consumers: the published `origam` package depends only on
`@mdi/font` and `qrcode-generator`, with `shiki` / `vue` / `vue-i18n` /
`vue-router` as peers. None of the packages above ship with it — they all
come from `@origam/marketing`, which is `private` and never published. You
were never exposed; the deployed site was.

One change does reach the published package. Nuxt 4.5 made TypeScript
unable to name the type `defineNuxtModule` returns, so the default export
of the `origam/nuxt` sub-export is now explicitly annotated as
`NuxtModule`. Behaviour is unchanged — it is a declaration-emit fix.

### ⚠️ BREAKING — i18n locale keys migrated to `snake_case`

All locale keys shipped by the DS (`packages/ds/src/assets/locales/en.json`,
`fr.json`) now follow the project-wide i18n convention: every key **segment**
is `snake_case` (`a-z`, `0-9`, `_`). Nested structure is unchanged — only the
casing of each segment changes (e.g. `dataTable.ariaLabel.sortBy` →
`data_table.aria_label.sort_by`).

**Why this is breaking**: `createOrigam({ messages })` lets a consumer
override any locale message by key path. Any override keyed on an old
camelCase path (e.g. `'origam.dataTable.sortBy'`) will silently stop applying
— the DS falls back to its own bundled (English) string with **no error**,
which is easy to miss until a French (or other locale) screen renders in
English.

**All 65 `t()` call sites and their indirect prop-default equivalents were
updated in the same commit** — verified with a cross-reference script (every
literal `origam.*` key still referenced in `packages/ds/src` was checked
against both locale files; zero leftover old-casing key strings remain
anywhere in `packages/ds/src`). Fallback strings (the second argument to
`t(key, fallback)`) are unchanged — only the key paths moved.

If you override any DS locale key, update the key path using the table below.

| Old key | New key |
|---|---|
| `origam.bottomNav.ariaLabel` | `origam.bottom_nav.aria_label` |
| `origam.calendar.ariaLabel` | `origam.calendar.aria_label` |
| `origam.calendar.monthGrid` | `origam.calendar.month_grid` |
| `origam.calendar.moreEvents` | `origam.calendar.more_events` |
| `origam.calendar.viewSwitcher` | `origam.calendar.view_switcher` |
| `origam.carousel.ariaLabel.delimiter` | `origam.carousel.aria_label.delimiter` |
| `origam.clipboard.copiedAriaLabel` | `origam.clipboard.copied_aria_label` |
| `origam.clipboard.copyAriaLabel` | `origam.clipboard.copy_aria_label` |
| `origam.code.copiedAriaLabel` | `origam.code.copied_aria_label` |
| `origam.code.copyAriaLabel` | `origam.code.copy_aria_label` |
| `origam.colorPicker.canvas.ariaLabel` | `origam.color_picker.canvas.aria_label` |
| `origam.colorPicker.canvas.value` | `origam.color_picker.canvas.value` |
| `origam.confirmEdit.cancel` | `origam.confirm_edit.cancel` |
| `origam.confirmEdit.ok` | `origam.confirm_edit.ok` |
| `origam.dataFooter.firstPage` | `origam.data_footer.first_page` |
| `origam.dataFooter.itemsPerPageAll` | `origam.data_footer.items_per_page_all` |
| `origam.dataFooter.itemsPerPageText` | `origam.data_footer.items_per_page_text` |
| `origam.dataFooter.lastPage` | `origam.data_footer.last_page` |
| `origam.dataFooter.nextPage` | `origam.data_footer.next_page` |
| `origam.dataFooter.pageText` | `origam.data_footer.page_text` |
| `origam.dataFooter.prevPage` | `origam.data_footer.prev_page` |
| `origam.dataIterator.loadingText` | `origam.data_iterator.loading_text` |
| `origam.dataIterator.noResultsText` | `origam.data_iterator.no_results_text` |
| `origam.dataTable.ariaLabel.activateAscending` | `origam.data_table.aria_label.activate_ascending` |
| `origam.dataTable.ariaLabel.activateDescending` | `origam.data_table.aria_label.activate_descending` |
| `origam.dataTable.ariaLabel.activateNone` | `origam.data_table.aria_label.activate_none` |
| `origam.dataTable.ariaLabel.sortAscending` | `origam.data_table.aria_label.sort_ascending` |
| `origam.dataTable.ariaLabel.sortDescending` | `origam.data_table.aria_label.sort_descending` |
| `origam.dataTable.ariaLabel.sortNone` | `origam.data_table.aria_label.sort_none` |
| `origam.dataTable.itemsPerPageText` | `origam.data_table.items_per_page_text` |
| `origam.dataTable.sortBy` | `origam.data_table.sort_by` |
| `origam.dataTableRow.collapseRow` | `origam.data_table_row.collapse_row` |
| `origam.dataTableRow.expandRow` | `origam.data_table_row.expand_row` |
| `origam.datePicker.header` | `origam.date_picker.header` |
| `origam.datePicker.input.placeholder` | `origam.date_picker.input.placeholder` |
| `origam.datePicker.itemsSelected` | `origam.date_picker.items_selected` |
| `origam.datePicker.range.header` | `origam.date_picker.range.header` |
| `origam.datePicker.range.title` | `origam.date_picker.range.title` |
| `origam.datePicker.title` | `origam.date_picker.title` |
| `origam.datePickerRangeField.text` | `origam.date_picker_range_field.text` |
| `origam.fileField.browse` | `origam.file_field.browse` |
| `origam.fileField.counter` | `origam.file_field.counter` |
| `origam.fileField.counterSize` | `origam.file_field.counter_size` |
| `origam.fileField.dropzoneSubtitle` | `origam.file_field.dropzone_subtitle` |
| `origam.fileField.dropzoneTitle` | `origam.file_field.dropzone_title` |
| `origam.fileInput.counter` | `origam.file_input.counter` |
| `origam.fileInput.counterSize` | `origam.file_input.counter_size` |
| `origam.fileUpload.browse` | `origam.file_upload.browse` |
| `origam.fileUpload.divider` | `origam.file_upload.divider` |
| `origam.fileUpload.title` | `origam.file_upload.title` |
| `origam.infiniteScroll.empty` | `origam.infinite_scroll.empty` |
| `origam.infiniteScroll.loadMore` | `origam.infinite_scroll.load_more` |
| `origam.input.appendAction` | `origam.input.append_action` |
| `origam.input.prependAction` | `origam.input.prepend_action` |
| `origam.media.castToDevice` | `origam.media.cast_to_device` |
| `origam.media.nextTrack` | `origam.media.next_track` |
| `origam.media.normalSpeed` | `origam.media.normal_speed` |
| `origam.media.playbackSpeed` | `origam.media.playback_speed` |
| `origam.media.previousTrack` | `origam.media.previous_track` |
| `origam.media.stopCasting` | `origam.media.stop_casting` |
| `origam.noDataText` | `origam.no_data_text` |
| `origam.pagination.ariaLabel.currentPage` | `origam.pagination.aria_label.current_page` |
| `origam.pagination.ariaLabel.first` | `origam.pagination.aria_label.first` |
| `origam.pagination.ariaLabel.last` | `origam.pagination.aria_label.last` |
| `origam.pagination.ariaLabel.next` | `origam.pagination.aria_label.next` |
| `origam.pagination.ariaLabel.page` | `origam.pagination.aria_label.page` |
| `origam.pagination.ariaLabel.previous` | `origam.pagination.aria_label.previous` |
| `origam.pagination.ariaLabel.root` | `origam.pagination.aria_label.root` |
| `origam.rating.ariaLabel.item` | `origam.rating.aria_label.item` |
| `origam.stepper.progressSteps` | `origam.stepper.progress_steps` |
| `origam.stepper.stepAriaLabel` | `origam.stepper.step_aria_label` |
| `origam.timePicker.am` | `origam.time_picker.am` |
| `origam.timePicker.pm` | `origam.time_picker.pm` |
| `origam.timePicker.title` | `origam.time_picker.title` |
| `origam.video.disableCaptions` | `origam.video.disable_captions` |
| `origam.video.enableCaptions` | `origam.video.enable_captions` |
| `origam.video.enterFullscreen` | `origam.video.enter_fullscreen` |
| `origam.video.enterPip` | `origam.video.enter_pip` |
| `origam.video.exitFullscreen` | `origam.video.exit_fullscreen` |
| `origam.video.exitPip` | `origam.video.exit_pip` |

### ⚠️ BREAKING — `<origam-title>` now defaults to `h2`, not `h1`

Every `<origam-title>` written **without** an explicit `tag` renders an
`<h2>` instead of an `<h1>`. This changes the rendered DOM, the heading
outline, any CSS keyed on `h1`, and the result of automated a11y audits.

**Why**: a document carries exactly one `h1`, so `h1` is the one level a
shared component must never emit by default — two untagged titles on a page
produced two `h1`s and broke both the heading order and the a11y audit. `h2`
is the deepest level that is always valid under a page-owned `h1`, and
repeating it is legal. The correct level depends on document position, which
the component cannot know: pass `tag` explicitly whenever it matters.

**Migration** — restore the old behaviour app-wide in one line, through the
defaults layer:

```ts
createOrigam({ theme: { components: { 'origam-title': { tag: 'h1' } } } })
```

⚠️ **This migration only works from this release onwards.** On any earlier
version it silently does nothing: `OrigamTitle`'s template bound `:is="tag"`,
and in `<script setup>` a bare prop name in the template resolves against the
raw `$props`, never against the `useDefaults()` proxy — so the theme value
was read and then ignored. Fixed here by binding `:is="props.tag"`, the same
correction as the seven components in #250. Do not conclude the snippet is
wrong if you try it on 2.12.x.

### Fixed

- **`useStyle()` no longer overwrites a consumer-supplied `id`.** The
  composable returns the id a component puts on its root element *and* the
  selector of the `#<id> { … }` rule it injects — the two must be the same
  value or the rule stops matching. It now accepts that id from the caller
  (`useStyle(styles, () => props.id)`), reactively, so an `id` that only
  appears on a later render is still picked up. Applied to `OrigamBtn`, where
  the generated id silently replaced the consumer's and broke every
  `<label for>` / `aria-labelledby` / `aria-controls` / `aria-describedby`
  association targeting a button, and to `OrigamTitle`, where element and
  rule had diverged. ⚠️ **138 of the 140 components calling `useStyle` are
  still affected**, in three shapes: 14 swallow a consumer `id` outright
  (same defect as Btn); 114 bind no id to their root at all, so where the
  component also declares an `id` prop — 192 of 217 do — that prop is inert
  and a consumer simply cannot set an id (measured on `OrigamCard` and
  `OrigamKbd`, which render no `id` attribute even when one is passed); and
  10 bind some other id while the rule keeps targeting the generated one,
  the same divergence just fixed on Title. Tracked separately; a blanket
  default was deliberately rejected because `OrigamSnackbarGroup` uses
  `props.id` as a group *name*, not a DOM id.
- **The injected stylesheet is valid CSS again.** Every rule carried a bare
  `false` in its body (`#id {false}`). Vue's `StyleValue` type includes
  `false`, so the shared `style` prop compiles to a runtime type containing
  `Boolean`, and Vue resolves an unpassed boolean-typed prop to the concrete
  value `false` — which was serialised verbatim. 192 of 217 components
  declare that prop. No visual impact: Chromium, Firefox and WebKit all
  discard the invalid declaration by CSS error recovery and apply the rest
  unchanged. The cost was invalid CSS shipped to consumers, and jsdom
  rejecting every generated sheet under test ("Could not parse CSS
  stylesheet"). Numbers are dropped for the same reason, and an object nested
  inside an array is now expanded instead of reaching the sheet as
  `[object Object]`.
- **`<origam-title>` reads its theme defaults.** It never called
  `useDefaults()`, so `theme.components['origam-title']` was inert.

### Added

- **`escapeCssIdent()`** (`origam/utils`) — escapes an arbitrary string for
  interpolation as a CSS ident. Required now that `useStyle()` builds a real
  stylesheet rule out of a consumer-supplied id: without it an id such as
  `a { } body { display: none }` appends attacker- or typo-controlled rules
  to the document, and ids that are legal in HTML but illegal as a CSS ident
  (leading digit, dots, colons) silently kill their own rule. Delegates to
  the native `CSS.escape` when present, with a spec-equivalent fallback for
  jsdom and SSR — the two were compared over 34 inputs in Chromium and are
  byte-identical.

### Changed

- **`useStyle(styles, uniq)`** — `uniq` widened from `string | undefined` to
  `MaybeRefOrGetter<string | undefined>`. Backward compatible: a plain string
  still behaves exactly as before, and an empty value falls back to the
  generated `<name>-<uid>` id rather than emitting the invalid selector `#`.

---

## [2.12.1] — 2026-07-31

**Hotfix — `vue-router` 5 is now accepted.** A consuming project could not
upgrade to Nuxt 4.5.1: Nuxt pulls `vue-router` 5, while origam declared an
optional peer of `vue-router: "^4.5.0"`. The peer range is widened to
`"^4.5.0 || ^5.0.0"`.

Nothing else changed — no runtime code, no public API, no dependency added.
The widening is strictly additive: projects on `vue-router` 4 are unaffected,
projects on 5 stop being blocked.

Vue Router 5 is, in the maintainers' own words, "a *boring* release, it
merges unplugin-vue-router into the core package with no breaking changes",
and the official migration guide states: "If you're using Vue Router 4
without unplugin-vue-router, there are no breaking changes". origam does not
use unplugin-vue-router, nor the iife build (the single documented breaking
change is that the iife bundle no longer ships `@vue/devtools-api`).

Verified on both majors before shipping: every symbol origam imports
(`useLink`, `RouterLink.useLink`, `RouteLocationRaw`, `Router`,
`RouteLocationNormalizedLoaded`, `NavigationGuardNext`, `UseLinkOptions`)
still exists in 5.2.0; type-check of the design system is clean against
4.6.4 and 5.2.0 alike; and the built `dist` was exercised at runtime under
both — href resolution, named routes, click navigation, external hrefs,
`isActive`, and the tag fallback when no `to` is passed all behave
identically.

**Consumer note.** `vue-router` 5 requires `vue` `^3.5.34 || ^4.0.0`, while
origam's peer on `vue` remains `^3.5.0`. A project pinned between Vue 3.5.0
and 3.5.33 that adopts `vue-router` 5 will hit a conflict — between `vue`
and `vue-router` directly, not with origam.

---

## [2.12.0] — 2026-07-29

**Hotfix — `vue-i18n` is optional again.** A consuming project reported that
origam could not be enabled at all: `createOrigam()` reached `createLocale()`,
which imported `vue-i18n` at module level, even though the package declares it
as an **optional** peer. Any project without `vue-i18n` failed at import time.

### Fixed

- **`createLocale()` no longer imports `vue-i18n`.** The default locale is now
  backed by a built-in adapter shipped with the DS. Runtime *and* type
  dependencies are gone — `grep vue-i18n` over the published `dist/` returns
  only a string literal (the vue-i18n adapter's own `name` field) and a
  comment. (Reported by a consumer.)
- The `vue-i18n` **type** imports in `locale.interface.ts` / `locale.util.ts`
  are replaced by locally-declared structural types. An `import type` costs
  nothing at runtime but still breaks `tsc` for a project that does not install
  the package once `skipLibCheck` is `false` — the same class of bug, one step
  further.

### Added

- **`createBuiltinAdapter()`**, exported from `origam/utils`. Resolves dotted
  keys, falls back to the fallback locale then to the key itself, and
  interpolates both positional (`{0}`) and named (`{value}`) params — the only
  two forms used by the DS's own messages.

  It deliberately does **not** reimplement `vue-i18n`: no plurals, no linked
  messages, no date formatting. A consumer needing those keeps `vue-i18n` and
  passes their own adapter.

### Changed — read this if you use `vue-i18n`

**The default adapter is no longer `vue-i18n`.** If you relied on
`createOrigam()` building a `vue-i18n` instance for you, pass it explicitly:

```ts
import { createOrigam } from 'origam'
import { createVueI18nAdapter } from 'origam/utils'
import { createI18n, useI18n } from 'vue-i18n'

const i18n = createI18n({ legacy: false, locale: 'en' })

createOrigam({
    locale: { adapter: createVueI18nAdapter({ i18n, useI18n }) }
})
```

Nothing changes for the DS's own strings — they resolve identically through
either adapter. This is a **minor** rather than a patch precisely because that
default changed.

---

## [2.11.0] — 2026-07-28

Theming-resolution release. Every fix here has the same root cause: a
component **declared** theme-able props but never **consumed** them, so an
`IOrigamTheme.components` block was a silent no-op. Minor rather than patch
because the public prop surface grew (see *Added*), even though every commit
is labelled `fix`.

### Added

- **`ISelectionControlProps` now extends `IBorderProps` / `IRoundedProps` /
  `IElevationProps`**, inherited by `ICheckboxBtnProps` and `IRadioBtnProps`.
  `OrigamSelectionControl` consumes them through the standard
  `useBorder` / `useRounded` / `useElevation` composables, on the
  state-layer box that owns the control's visible surface — same relay point
  as `OrigamSwitchTrack`. Checkbox and Radio therefore accept `border`,
  `rounded` and `elevation`, from a prop or from a theme. (#241)

  ::: warning Known limit — `rounded` alone paints nothing at rest
  The state-layer box has no background and no border by default, so a
  `rounded` passed on its own is measurable in the computed style but
  produces no visible difference at rest. It shows on hover (the state layer
  now follows the radius), or combined with `border` / `elevation` / a
  custom background. The glyph itself (`mdi-checkbox-*`, `mdi-radiobox-*`)
  is an icon-font character and keeps its own shape — reshaping the mark
  would be a rendering change, not a prop. Documented in the Checkbox and
  Radio pages.
  :::

### Fixed

- **`OrigamBtnGroup`** forwarded `density`/`color`/`bgColor`/`size`/`hover`/
  `active` to its children unconditionally, overwriting theme defaults with
  `undefined`. Now filtered through `usePassedProps()` — the helper that
  detects whether the *consumer* actually passed a prop, since Vue coerces an
  unpassed boolean to `false`, never `undefined`. (#274)
- **`:is="tag"` bypassed theme resolution** on 7 components — `OrigamAvatar`,
  `OrigamBtnGroup`, `OrigamExpansionPanel`, `OrigamLabel`, `OrigamMessages`,
  `OrigamTab`, `OrigamTabs`. In `<script setup>` the template binds each prop
  from the *raw* `$props`, independently of the local
  `props = useDefaults(_props)`, so a bare `:is="tag"` never saw the theme's
  value. The audit the ticket asked for widened the scope from 1 file to 7.
  (#250)
- **`OrigamSelectionControl` declared `grid-area: control` unconditionally**,
  assuming it always sits inside a Field/Input named grid. Any consumer
  placing a bare control in its own grid saw every instance collapse onto one
  cell. The declaration was in fact **dead code** on the Field/Input path —
  `.origam-input__control` already owns `grid-area: control` *and* is
  `display: flex`, and a `grid-area` on a flex child has no effect — so it is
  removed rather than scoped. (#247)
- **The Checkbox/Radio hover halo hardcoded `border-radius: 100%`**, staying
  circular even under `rounded="md"` — while being the only surface the prop
  could paint. Now `inherit`. (#241)

### Internal

- Marketing i18n: locale files split one per top-level namespace, an
  `i18n:check` script wired into CI, and 195 missing translation keys filled
  (400 → 205). EN/FR parity reached **0 gap** — the admin backoffice went
  from 0 % to fully translated. No change to the published package.

---

## [2.10.0] — 2026-07-27

Field-rendering release. No new API — no component, prop, emit or slot was
added, and no source file was created. The minor bump is there to flag one
**visible rendering change** for consumers of `origam/styles` (see *Changed*);
everything else is a fix.

### Changed

- **`--origam-field__input---padding-start` / `-end` now resolve to `0`**
  (was `var(--origam-space---4)`, i.e. 16px) for consumers of the bundled
  `origam/styles` (`main.css`). The inline spacing of a field is owned by the
  **root** token `--origam-field---padding-start`, which is unchanged at
  `{space.4}`; the input wrapper sits inside it, so a second inline padding
  doubled it — and it truncated the value text of narrow controls
  (`elevated` → `ele…`). Consumers importing `origam/tokens/css/{light,dark}`
  are **unaffected**: those sheets already emitted `0` since 2026-07-24.
  Fields keep their inline spacing, supplied by the root token. (#295)

### Fixed

- **Tokens** — `field.input.padding-start/end` was `0` in the generated sheets
  but `{space.4}` in the token source, so every `tokens:build` silently
  reverted the fix, and `main.css` (produced by the separate `styles:build`
  step) had drifted to a third value. The source now carries the intent and
  the pipeline is idempotent — a second full build produces no diff. (#295)
- **`OrigamSliderField`** — the `rounded` prop was inert: radii were
  hardcoded instead of going through `useRounded()`. (#283)
- **`OrigamApp`** — did not call `useDefaults()`, so
  `theme.components['origam-app']` (`bgColor`, `fullHeight`) was ignored.
- **`OrigamField`** — inline padding is floored at the corner radius so
  content clears the rounded outline, and the outline's start leg is widened
  to match, the left corner no longer rendering flatter than the right.
  Prepended fields are excluded to avoid a swatch/icon box artifact.
- **`OrigamField`** — the outlined floating label was pinned to the notch
  corner by a hard `margin: 0 4px` while the input text and the resting label
  both sit at `--origam-field__input---padding-start`, leaving the label
  misaligned with its own value — visibly so on large-radius themes.
- **`OrigamColorPickerField`** — the swatch sat inside the field's inline
  padding, so any consumer raising `--origam-field---padding-start` opened a
  gap between the colour and the left border. Also fixed: the field wrapping
  onto two lines when given content, and the swatch's square outer corner.
- **`OrigamColorPicker`** — a class typo on the hue/alpha slider fill
  occluded both gradients.
- **`OrigamDatePickerField`** — wrapped onto two lines when given content in
  `range` mode.

### Internal

- Quality Gate unblocked: the two SonarQube new-code violations that had kept
  the `Build` workflow red on every `develop` push since 2026-07-22 are
  resolved — a nested ternary in `OrigamSliderField` and a duplicate
  `:deep()` selector in `OrigamColorPickerField`. Both were pure
  maintainability findings, no behaviour change. (#296)

---

## [2.9.0] — 2026-07-22

Theming-enablement release. This ships the design-token **hooks** and the
`useDefaults` **wiring** that let a consumer configure a component's
appearance entirely from an `IOrigamTheme` object (props-first), plus the
CSS hooks brand themes need for translucency and separation. No breaking
changes — every addition is opt-in via a new component token with an inert
(`none`) fallback, so existing renders are byte-identical until a theme
sets a value.

### Added

- **`useDefaults()` now resolves per-component theme defaults on 11 more
  components** that declared theme-configurable props but never read
  `theme.components['origam-<name>']` — their theme config was silently
  inert before this. This is the mechanism that makes props-first theming
  actually apply. (#242)
- **Translucency & focus hooks on 7 components.** New component tokens,
  each consumed with an inert fallback (`var(--…, none)`):
  `--origam-chip---backdrop-filter`, `--origam-snackbar-item---backdrop-filter`,
  `--origam-field---backdrop-filter` (+ `--origam-field---focus-ring-*`),
  `--origam-switch__track---backdrop-filter`,
  `--origam-selection-control__input---backdrop-filter`,
  `--origam-tooltip---backdrop-filter`, `--origam-overlay-scrim---backdrop-filter`.
  These give brand themes real `backdrop-filter` translucency (glass, frosted
  surfaces) without per-instance `:style` overrides. (#253)
- **`OrigamAvatarGroup` separation ring.** Overlapping avatars now get a
  legible seam via a dedicated `outline` — a CSS property distinct from
  `box-shadow`, so it coexists with each theme's own avatar shadow with no
  specificity or ordering tricks. Driven by new
  `--origam-avatar-group__item---outline-{color,width,style}` tokens
  (defaults `color.surface.default` / `2px` / `solid`). Only avatars rendered
  inside an `<origam-avatar-group>` get it; a standalone `<origam-avatar>`
  never does. (#263)
- **`usePassedProps()` composable helper.** Reports which props a consumer
  actually passed by reading `vnode.props`, distinguishing a real value from
  Vue 3 coercing an unpassed boolean prop to `false`. Used so a
  theme-provided value is no longer overwritten by an `undefined → false`
  default. (#263)

### Fixed

- **Live theme switching now updates component default *props*, not just CSS
  variables.** The Nuxt module's theme singleton could be duplicated when the
  host app resolved `origam/nuxt` (source) and `origam/composables` (compiled
  `dist`) to two physical module files — two independent `_theme` singletons,
  so the plugin's watcher (which reassigns the resolved per-component
  defaults) listened to a different instance than the one `setTheme()`
  mutated. Props stayed frozen on a live switch while cssVars followed (pure
  CSS cascade). The singleton is now anchored on `globalThis` on the client
  (server stays module-level to avoid leaking state across concurrent SSR
  requests). (#275)
- **`OrigamRadio`, `OrigamTabs` and `OrigamSliderField` now call
  `useDefaults()`.** They declared theme-configurable props (`activeBgColor`,
  `variant`, `color`/`bgColor`) but never resolved
  `theme.components['origam-<name>']`, so that theme config was silently inert.
  (#279)
- **`OrigamDialog` `scrim` now renders.** `scrim` was missing from the
  component's `withDefaults(...)`, so Vue 3 coerced the unpassed boolean to
  `false` and forwarded it to `OrigamOverlay`, overriding the overlay's own
  `scrim: true` default — the backdrop never showed. Anchored `scrim: true` in
  `withDefaults` (same pattern as the existing `openOnClick` default). (#279)
- **`useDefaults` wiring no longer collapses `<origam-code>`'s header zone.**
  The origam base theme carried a `compact: true` default (authored in a bulk
  pass before `useDefaults` was wired, never visually validated); once the
  wiring landed it forced every code block without an explicit `compact` prop
  into the condensed single-line pill layout, dropping the
  header/filename/line-numbers/lang-badge. Removed from the base theme. (#249)
- **`OrigamBtnGroup` renders as a single rounded surface.** The group applies
  its `rounded`/`elevation` on the outer wrapper with `overflow: hidden`
  clipping children to the inner curvature — no forced child heights, no
  inner-radius tokens; group height derives from `OrigamBtn`'s own border-box
  height calc. (#239)
- **`OrigamSwitchTrack.error` widened from `boolean` to `string | boolean`**
  to match the canonical Commons `IValidationProps`, so the parent's
  validation surface is type-assignable again (was `vue-tsc` TS2345, CI red).
  Consumed by truthiness only — behaviour unchanged. (#239)
- **`OrigamLayout` / `OrigamApp` `full-height` no longer clamps content
  taller than one screen.** The full-height wrapper was `height: 100vh`
  (a hard clamp) instead of `min-height: 100vh` ("occupy at least the
  viewport"). Content overflowing past one screen still rendered (nothing
  was clipped — no `overflow: hidden` on that element), but the wrapper's
  own box never grew to match, so any ancestor sizing itself off that box
  (e.g. a themed page background) stopped short of the actual page height.
  `full-height` pages now grow naturally past one screen and the
  background/box always matches the true content height.
- Fixed a handful of pre-existing `$type: "dimension"` component tokens
  with non-numeric values (`auto`, `calc(...)`) that crashed the
  `size/rem` Style Dictionary transform and silently blocked
  `tokens:build` / the full package build (`btn.width`, `dialog.max-width`,
  `dialog.max-height`, `contextual-menu.max-height`, `menu.max-height`,
  `expansion-panel.header.append.margin-inline-start`,
  `expansion-panel.popout.max-width(-active)`,
  `expansion-panel.inset.max-width-active`) — retyped to `"other"`,
  matching the established pattern already used for equivalent tokens
  elsewhere in the same files. No visual/behavioural change; this only
  unblocks the build pipeline.

> The 8 marketing brand themes (glass · cartoon · geek · apple · editorial ·
> material · ecom) that these hooks enable live in the private
> `@origam/marketing` package and are **not** part of the npm `origam`
> release — this changelog tracks the published library only.

---

## [2.8.1] — 2026-07-15

### Fixed

- **The npm tarball now ships `README.md` and `LICENSE`.** The publish runs
  from `packages/ds/` exclusively, but the package dir contained neither
  file — both listed in the `files` array yet silently absent from every
  published version (the npm page showed no readme at all). The new
  npm-facing README covers install, quick start (plugin + token sheets +
  Nuxt module), the theming model and the granular exports, and links to
  the upcoming documentation site (https://origam.dev).

---

## [2.8.0] — 2026-07-15

### Added

- **Border per-side props are now wired** (`useBorder`). The discrete
  `borderTop` / `borderRight` / `borderBottom` / `borderLeft` props on
  `IBorderProps` — declared but never read until now — each accept a
  number (px), a boolean (legacy thin opt-in) or a free-form
  `"width style color"` string (same grammar as the global `border`
  shorthand). New per-side color overrides ship alongside:
  `borderTopColor` / `borderRightColor` / `borderBottomColor` /
  `borderLeftColor` (`TColor` — semantic intent or raw CSS color).
  Precedence is specific-over-global (global `border`, then standalone
  `borderColor` / `borderStyle`, then per-side width/style, then per-side
  color) and documented on `useBorder`. Emitted declarations are physical
  (`border-top-width`, …). `useStateEffect` forwards the 8 new props, so
  Card, Sheet and every other consumer gets them for free. Pilot
  component: Card (story + doc + e2e).
- **`useElevation` accepts a free-form custom `box-shadow` value.**
  `elevation` (new `TElevation` type) still takes a named origam rung or
  a Material 0–24 number, and now also any shadow-like CSS string
  (`var()` / `calc()` / `rgba()` / hex / length / `inset` signals),
  emitted verbatim as `box-shadow`. Previously a custom string silently
  produced NO shadow (`parseInt` read a leading `0` and resolved to the
  `none` rung). Pilot component: Card (story + doc + e2e).

### Changed

- **`OrigamBlockquote`: `bgColor` renamed to `accentColor` (non-breaking).**
  `bgColor` never painted a surface fill on Blockquote — it drove the
  decorative accent (bar, background quote glyph, author label), which the
  `bgColor` name misrepresented. `accentColor` is now the canonical prop;
  `bgColor` keeps working as a deprecated alias (`accentColor` wins when
  both are set) and logs a console warning once per session. Scope: this
  pass only touches Blockquote — `bgColor` stays canonical and
  non-deprecated on surface-fill components (Btn, Card, Chip, Badge,
  Alert, Pagination, …). Removal of the `bgColor` alias on Blockquote is
  targeted for v3.0.0. See `ROADMAP.md` — "Renommer `bgColor` →
  `accentColor`".

### Fixed

- **`useMargin`: 2-value strings work again.** `margin="8px 16px"` silently
  produced no styles (the 2-value case was missing from
  `formatMarginStylesVar`; padding already had it). Both utils now document
  the intentional 4-value order convention: values are grouped by logical
  axis — `block-start`, `inline-start`, `block-end`, `inline-end`
  (top / left / bottom / right) — NOT the native CSS clockwise shorthand.
  RTL-safe by design, arbitrated in #216.

### Internal

- Marketing `/theming` — the Theme Builder ships six rich, validated
  controls built from origam components (color/accentColor with intents +
  custom picker, density, rounded with per-corner link/unlink, elevation
  presets + full custom box-shadow, border with per-side width AND color
  link/unlink, padding/margin devtools-style box-model with axis linking).
- Marketing playground isolation: the `origam` preview theme now carries a
  complete GENERATED reset of every component var (~2700/mode, derived from
  the DS baseline sheets) — ambient brand themes can no longer leak into
  the playground preview.
- Marketing package restructured to the project architecture (`src/`
  srcDir, locales under `src/assets/locales`, wireframes under
  `wireframes/`).

---

## [2.7.3] — 2026-07-10

### Fixed

- **`OrigamField`: the `rounded` prop now drives the whole field chrome.**
  The prop used to round the outer box only (inline `border-radius`), while
  the inner chrome (outline legs, per-corner radii) reads
  `--origam-field---border-radius` — which the prop never touched, so the
  outline corners stayed at the default and mismatched the box (themes had
  to force the var with `!important` hacks). The field now mirrors the
  radius resolved from the `rounded` prop into its component var, keeping
  box and outline in sync for every field type (text, select, textarea,
  number, password, date, file, color). `shaped` / `shaped-invert` are
  unaffected and stay SCSS-owned.

---

## [2.7.2] — 2026-07-09

### Fixed

- **Default text (and every `currentColor` icon) rendered browser-black in
  dark mode.** The semantic text token flips correctly
  (`neutral-900 → neutral-50`) and `app.json` has declared
  `app.color` / `app.background-color` all along — but nothing consumed
  them. `OrigamApp` now paints the base pair
  (`color: var(--origam-app---color)`,
  `background-color: var(--origam-app---background-color)`), and
  `OrigamThemeProvider` (`display: contents`) sets the inherited `color`
  so a local `data-mode="dark"` sub-tree gets readable defaults too.
  Verified in both modes (computed styles) with no light-mode change.

---

## [2.7.1] — 2026-07-09

### Fixed

- **`origam/styles` CSS entry shipped empty.** `src/assets/css/main.css` was
  0 bytes in every published version (2.6.x, 2.7.0), so
  `import 'origam/styles'` (the `style`/`import`/`require` conditions)
  delivered no tokens and no utility classes — only the SCSS path
  (`@use 'origam/styles'`) worked. `main.css` is now compiled from
  `main.scss` at build time (`styles:build`): the full aggregate
  (primitives + light + dark + utilities + reset, ~366 KB) ships in the
  package.

### Internal

- New brand identity: the "cube sonobe" logo (modular origami — identical
  folded units assembling into a structure) replaces the legacy mark across
  the repo (docs/stories/marketing assets; not part of the npm tarball).
- npm publishing is handled by CI again (release workflow auth fixed).

---

## [2.7.0] — 2026-07-08

### Added

- `OrigamThemeProvider` now applies the active theme's **component default
  props** to its sub-tree (props-first theming cascades into sub-trees via
  `provideDefaults`), not just the `data-theme` / `data-mode` attributes. A
  `<origam-theme-provider theme="brand-x">` wrapper therefore gives every
  descendant that brand's per-component defaults.
- Glass theme: `OrigamAlert` glassmorphism (transparency + blur).

### Changed

- **`shiki` is now an OPTIONAL peer dependency** (removed from `dependencies`).
  `OrigamCode` degrades gracefully to plain, un-highlighted code when `shiki`
  is not installed (a one-time console warning is emitted; line numbers,
  highlight-lines and copy keep working). **Migration:** add `shiki` (`^4.3.1`)
  to your app's dependencies to keep syntax highlighting. This drops a heavy
  (~3 MB) hard dependency from apps that don't render code blocks.

### Fixed

- `OrigamPagination` colored mode (`color` / `bgColor`) now fills the page
  buttons. The theme's default `text` btn variant
  (`background-color: transparent !important`) was swallowing the intent fill,
  leaving resting buttons transparent; the row now forces the `flat` variant
  when a colour is set.
- Cartoon dark `/theming`: fields adopt the theme and the primary btn contrast
  is corrected.

### Internal

- Restored the green `vue-tsc` type-check gate under TypeScript 6.
- E2E suite stabilised: sharded CI plus deterministic fixture-drift fixes
  (variant-index / navigation realignment) — the "flaky" bucket was
  deterministic drift, not timing.

---

## [2.6.3] — 2026-07-03

### Changed

- Internal code-quality cleanup to green the SonarQube quality gate
  (`new_violations`): removed redundant type assertions, merged duplicate
  imports, extracted nested template literals, `||` → `??`, dropped a redundant
  `| undefined`, converted a call-signature interface to a function type, and
  removed a leftover CSS comment. **No API or runtime behaviour change** — pure
  refactor (PR #87).
- Marketing site (private, not part of the published `origam` package):
  `@nuxtjs/i18n` 9 → 10 and `@nuxtjs/seo` 2 → 5 (locales moved to `i18n/locales/`;
  v10 config breaking changes handled) — PR #88.

---

## [2.6.2] — 2026-07-03

### Changed

- Dependency maintenance (Dependabot): TypeScript 5.8 → 6.0, ESLint 9 → 10
  (+ `typescript-eslint`, `eslint-plugin-vue`), Style Dictionary 4 → 5
  (+ `@tokens-studio/sd-transforms` 1 → 2), Shiki 3 → 4 (VitePress docs), and a
  dev-tooling batch (`jsdom` 25 → 29, `happy-dom`, `sass`, `@types/node`,
  `unplugin-vue-components`, `lint-staged`, `globals`…). **Vite and Vue stay
  pinned** (`vite ~7.3.6`, `vue 3.5.35`) — their bumps were declined (Vite ≥ 7.3.5
  broke the build; the Vue override neutralises the bump). `react-dom` bump
  closed (not a dependency of a Vue design system).

### Fixed

- CI publish (`release.yml`): the npm publish step failed with **E404** because
  `pnpm publish` did not expand the `${NODE_AUTH_TOKEN}` placeholder from
  setup-node's `.npmrc` → the PUT went out unauthenticated. The resolved token is
  now written to the `.npmrc` pnpm reads before publish (PR #82). 2.5.0/2.5.1/2.6.0
  had failed here; 2.6.1 was published manually as a stop-gap.
- Test robustness: `transition.composable.spec.ts` used an invalid CSS sentinel
  (`transformOrigin: 'original'`) that jsdom 29 now rejects; switched to a valid
  value `top left` (PR #84).

---

## [2.6.1] — 2026-07-02

### Added

- `OrigamCode` — `compact` and `prompt` display modes (commit `5ebc6702`).
  Compact mode collapses the component to a single line (no gutter, no
  filename bar); `prompt` mode renders a shell-style `$` prefix. Two-axis
  theming support: the component now tracks both `data-theme` and
  `data-mode` on the host `<html>` element so it correctly switches in
  dark/light sub-trees (`fix(ds): OrigamCode two-axis theming` — commit
  `e2e716f2`). Scroller fill repaired in the same pass.
- `backdrop-filter` glassmorphism tokens on `Card` / `Sheet` / `Toolbar` /
  `Menu` — new token group `component.{card,sheet,toolbar,menu}.backdrop-filter`
  emitted as `--origam-{cmp}---backdrop-filter` CSS vars. Allows consumers
  to build frosted-glass surfaces without overrides (commit `71647594`).

### Changed

- Brand themes removed from the DS (ADR-004) — the `origam` package now
  ships only the `light` and `dark` base token sets. Consumer themes
  (`sobre`, `geek`, `glass`, `cartoon`, `apple`, `ecom`, `editorial`,
  `material`) are now authored in semantic JSON and installed via
  `createOrigam({ themes: [...] })` rather than bundled into the lib.
  The DS stays unopinionated; themes travel with the consumer
  (commits `fbea1e3f`, `5f1bf51c`, `e0a47050`, `edc30e80`, `f7c56f06`,
  `3b9f8510`).

### Fixed

- `OrigamImg` — `markBooted` `requestAnimationFrame` callback was called
  during SSR, crashing server-render (`fix(ds): guard OrigamImg markBooted
  rAF behind IN_BROWSER` — commit `6b09c5df`).
- Six SSR/theming gaps surfaced by the marketing site refactor: theme cookie
  injection race, `data-mode` missing on first SSR render, component-level
  token var scope, active-theme guard in `useTheme`, Menu/Tooltip token
  resolution under sub-tree providers, Nuxt hydration mismatch on theme
  toggle (commit `b9fe3219`).
- `OrigamSelect` — the chevron icon opened then instantly re-closed the menu
  on the very first click (field not yet focused): the opening `mousedown`
  bubbled to the control handler and double-toggled. The toggle now only
  runs when the field is already focused; otherwise the event bubbles to the
  single control handler that opens + focuses in one pass (PR #70).
- Sass `mixed-decls` deprecation warnings eliminated in `OrigamBtn` and
  `OrigamSwitchTrack` — declarations that followed a nested rule (`@media` /
  `&:focus-visible`) are moved above it. Pure reorder, identical compiled CSS
  (PR #73).
- Layout offset counted twice in SSR / production builds (invisible in dev):
  Vue's hydration-mismatch recovery could abandon a layout item mid-`setup()`
  after it registered, leaving an orphan in `registered` so a 240 px drawer
  reserved 480 px. `useLayoutItem`'s `register()` now evicts stale entries
  occupying the same `(order, position)` slot (PR #76).

---

## [2.6.0] — 2026-06-11

> **The bracket + a11y + theming release.** `OrigamBracket` ships as a
> production-ready e-sport tournament component (double-elimination, Grand
> Final, statuses, full cross-cutting prop surface). `v-contrast` becomes
> the DS-wide WCAG text-legibility guard applied to every colour-bearing
> component. A two-axis theming engine (`data-theme` × `data-mode`) replaces
> the previous single-axis approach and enables brand themes to be installed
> at runtime via `createOrigam()`. Multiple composables and layout components
> also land fixes. 170 commits total in this range (DS-relevant subset
> documented below).

### Added

- `v-contrast` directive — runtime WCAG 2.1 AA text-legibility guard
  (`feat(ds): v-contrast directive` — commit `8a80787a`). Applied
  automatically to every colour-bearing component in the same cycle
  (`feat(ds/a11y): apply v-contrast to all colour-bearing components` —
  commit `4a4d4473`). Two correctness fixes landed before release: correct
  WCAG luminance maths for composite translucent backgrounds (commit
  `96ff45c4`), and `color(srgb …)` token format support + guard against
  clobbering an explicit `color` prop (commits `34786ed5`, `12a3e378`).
- `OrigamBracket` — **major enrichment** on top of the 2.3.0 initial
  component. Full double-elimination layout with two independent trees +
  a Grand Final match (`feat(ds/bracket): real two-tree double-elimination
  layout` — commit `dee1c23d`; Grand Final — commit `560eaf5b`).
  Full cross-cutting prop surface on both `OrigamBracketMatch`
  (`rounded` / `elevation` / `border` / `color` / `bgColor` — commit
  `8998f0e3`) and `OrigamBracketCompetitor` (commit `3088ad31`).
  Distinct status indicators (live, forfeit) + live-link prop (commit
  `4d38c65c`). Connector trait inherits match `border-width` / `style` /
  `color` (commit `94242ab3`). State variant (hover / active) wired
  (commits `0f4d5924`, `5edeca52`, `92edcd1b`). Auto-contrast on match
  text and seed numbers via `v-contrast` (commit `4cd5bc44`).
  `OrigamDivider` used internally for the match divider (commit `c472bb71`).
- `OrigamBlockquote` — **major enrichment** from the initial Wave 4 stub.
  Two-axis colour model: `color` (foreground / accent) and `bgColor`
  (surface / left-bar background) applied on all 5 variants
  (`feat(ds/blockquote): two-axis colour model` — commit `ccfe8c82`).
  `bgColor` accent on every variant including `elegant` and `minimal`
  (commit `b2f5c1f3`). `color` also drives the source label (commit
  `d80e88ca`). Accent pseudo-element decoupled from the `border` prop
  (commit `c5843ee1`, revert + re-land in same release).
- `OrigamBottomNav` — three additions: dimension props (`width`, `height`,
  etc.) now apply (fix — commit `21d44f63`); `position` prop
  (`start | center | end`) controls item distribution (commit `395a797e`);
  `active` state exposed and diffused to the child buttons (commit
  `5bdb3e85`).
- `OrigamAvatarGroup` — three additions: `rounded`, `elevation`, `border`
  propagated to all child avatars (commit `725303bd`); `hover` / `active`
  state fan-out made reactive (commit `e163cfba`); click-outside collapses
  an expanded group (commit `c364aae3`).
- `OrigamAppbar` — `scroll-behavior="active"` engages the active surface
  state on scroll (commit `07feb981`). `hide` and `inverted` scroll
  behaviours repaired; `scrollBehavior` now accepts combined tokens
  (commits `01912f4c`, `b625ea1e`). Removed dead props: `absolute`
  (commit `50c5ea32`), `floating` (commit `3d707ef5`), `width` /
  `minWidth` / `maxWidth` (commit `c5e7a6b9` — layout owns the
  cross-axis).
- Two-axis theming engine — `data-theme` (brand identity) × `data-mode`
  (light/dark) replace the previous single `data-theme` approach. Shadow
  tokens gain per-theme variants (commit `f7c56f06`). `createOrigam()`
  gains a `theme` option to install one or multiple presets at init time,
  SSR no-flash (commits `edc30e80`, `5f1bf51c`, `3b9f8510`). Token
  authoring via semantic JSON (colors, radius, typography, shadow, spacing,
  animation groups) — `feat(ds): semantic JSON theme authoring` (commit
  `e0a47050`).
- Field validation surface extended to 5 additional field components
  (`InlineEdit`, `OtpInputField`, `Clipboard`, `NumberField`,
  `SliderField`) via unified `useValidation` wiring (commit `27977831`).
- `OrigamStatus` — forces its intent onto `color` / `bgColor` (non-
  overridable) so status badges are always correctly painted regardless of
  surrounding theme (commit `8a72740a`).

### Changed

- `OrigamAudio` — dimension props (`width`, `height`) now apply (commit
  `adaf4395`); content fills the available height with controls pushed
  to the bottom (commit `97207e26`); progress row grows when the bar is
  taller (commit `8f8f1c1f`); `rounded="none"` and shaped variants added
  (commit `073d0513`). Compact disc rendering fixed — oversized with
  floating grooves (commit `bef36e20`). Reactive `autoplay` (commit
  `0dc90fea`). Play-button focus tint lingering + playlist active item
  blinking fixed (commit `6e6042bb`).
- `OrigamToolbar` — `hover` / `active` now drive the surface colour
  (state-aware) (commit `c966e9c6`).
- `OrigamAlert` — removed redundant `prominent` prop (commit `f32af0a8`).
- `OrigamAvatar` — `color` prop now applies; `v-contrast` was previously
  overriding an explicit `color` (commit `369e0afa`). Dead `start` / `end`
  props removed (commit `84f324fe`).
- `OrigamApp` — now exposes only `color` / `bgColor` and forwards them to
  the layout (commit `111f6596`).
- DS-wide: `useStateEffect` repaired — runtime prop changes for
  `color` / `bgColor` and similar were silently ignored after initial
  mount (commit `a1a66120`). Reactive-update loops in `AvatarGroup` and
  `RadioGroup` killed (commit `4c5eb18d`).
- Monorepo migration — `packages/ds`, `packages/marketing`,
  `packages/stories`, `packages/docs`, `packages/tests`,
  `packages/figma-plugin` are now first-class pnpm workspace packages
  (commits `4d53558b`, `70f1819f`, `fa0ed997`).

### Fixed

- `OrigamBtn` — `border-color` and `border-style` are now customisable
  props (commit `b44add69`).
- `OrigamField` — themed `border-radius` now resolves via the real
  component token (commit `851b2a2f`).
- `OrigamExpansionPanels` — `useElevation` import missing, causing
  `ReferenceError` at mount (commit `2eef9288`).
- `OrigamDatePicker` — crash guard for empty `daysInMonth` when reading
  `date` prop (commit `896b9eec`).
- `OrigamBorder` — numeric `border-width` values were invisible (missing
  `border-style` and `border-color` defaults) (commit `e9a151ec`).
- `rounded="none"` — did not actually remove the border radius; affected
  `OrigamAudio` and other consumers (commit `073d0513`).
- `fix(ds): /* @vite-ignore */ on shiki dynamic import` — defensive guard
  to silence the Vite bundler warning on the `OrigamCode` lazy highlighter
  import (commit `f6bbc494`).
- DS/marketing integration — MDI class prefix resolution, search hotkey
  double-fire, Menu anchor positioning (commit `d113a245`); lib dist
  missing CSS in first production deploy (commit `62667fbc`).

---

## [2.5.1] — 2026-05-27

> **Patch.** Two housekeeping commits with no public API impact.

### Changed

- Repository structure cleaned up: unit specs moved to `tests/TU/`,
  the dev playground dropped (commit `52f7dc70`).
- `.gitignore` updated to exclude `tests/a11y/.report` and
  `tests/a11y/.results` artefacts (commit `6c2ef153`).

---

## [2.5.0] — 2026-05-24

> **The accessibility release.** WCAG 2.1 AA pass across the entire
> component catalogue, critical backlog items (Select combobox pattern,
> DataTable caption, ColorPicker keyboard), and a VitePress sidebar
> reorganised by UI taxonomy.

### Fixed

- WCAG 2.1 AA pass — 35 targeted fixes across 36 components covering:
  missing `aria-label` on icon-only buttons, incorrect `role` assignments,
  focus management gaps, colour-contrast warnings on default token values,
  and keyboard-navigation holes in Slider / Rating / Switch / Radio
  (commit `1ad0aeaf`).
- Critical a11y backlog:
  - `OrigamSelect` — full combobox ARIA pattern (`role="combobox"` +
    `aria-expanded` + `aria-activedescendant` + `aria-autocomplete`).
  - `OrigamDataTable` — `<caption>` element added so screen readers
    announce the table purpose.
  - `OrigamColorPicker` — keyboard navigation restored; tab order and
    focus ring corrected.
  - A11y test infrastructure wired (commit `b3dd8552`).
- VitePress docs — SSR crash in the build resolved; chart legend guard
  against undefined series data (commit `6cfb0029`).

### Changed

- VitePress component sidebar reorganised by UI taxonomy (layout /
  navigation / data-display / forms / feedback / utility) instead of
  flat alphabetical order (commit `0bd5e2f2`).

---

## [2.4.0] — 2026-05-23

> **The chart engine + media kit + Wave 4 release.** In-house chart
> engine (27 primitives, 19 families, pure SVG, zero external dep),
> atomic media kit (`OrigamAudio` with waveform / vinyl / stem-tracks /
> playlist, `OrigamVideo` YouTube-style player, `OrigamMediaScrubber`
> and `OrigamMediaController` primitives), native `SliderField`, six
> utility / content components (`OrigamGrid`, `OrigamMasonry`,
> `OrigamEmptyState`, `OrigamClipboard`, `OrigamInlineEdit`,
> `OrigamNumberFormat`), `OrigamWatermark`, `OrigamQRCode`,
> `OrigamCalendar`, `OrigamTextMask`, gradient support on color props,
> and a DS-wide reuse-interfaces audit. 149 commits.

### Added

#### Chart engine

- `OrigamChart` + `useChart` — in-house chart component. 8 base types
  (`line` / `area` / `bar` / `column` / `pie` / `donut` / `scatter` /
  `radar`). Pure SVG rendering (no canvas, no `d3`, no `chart.js`, no
  `echarts`). Tooltip inline-positioned via mouse move; legend as
  `<ul role="list">` with click-to-toggle series visibility. Animated
  entrance with `prefers-reduced-motion` respect. Custom slots for
  `tooltip` / `legend-item` / `title` / `empty`. ARIA `role="img"` with
  `<title>` + `<desc>`; every data point is `tabindex="0"` +
  `role="button"` with a descriptive `aria-label`. Pure-function SVG
  path utilities — SSR-safe. `tokens/component/chart.json` (title,
  subtitle, axis, grid, tooltip, legend, point, bar, pie, radar,
  animation groups). (commit `b46541ce`)
- Family split into 9 per-type components (`OrigamChartCartesian`,
  `OrigamChartPolar`, `OrigamChartRadar`, `OrigamChartGauge`, …) sharing
  the engine via `OrigamChartAxis` and `OrigamChartLegend` sub-components
  (commits `4da143c9`, `c950c364`, `ef4ab360`).
- 15 additional chart families extending the base engine:
  - **Honeycomb / Treemap / Sankey / Word-cloud** (commit `94902edc`)
  - **Heatmap / Sunburst / Box-plot / Pictorial** (commit `c1e69d60`)
  - **Candlestick / Streamgraph** (commit `c5edc9b0`)
  - **Pyramid / Funnel** family with outside labels + leader lines on
    narrow bands (commits `445acb05`, `f4af7a27`, `293905bc`)
  - **Polar-bar / Variwide** (commit `26380205`)
  - **Pareto / Bullet** (commit `39f141a3`)
  - **Combination chart** (line + column / area + line) (commit
    `4406e92d` area, `10d012ad` bar-axis swap)
  - **Map / Choropleth / Flight-routes / Plot bands** (commit `c728bd94`,
    `6e72e7f4`)
  - **Stacked percent / Multi-axis Y** (commit `6e72e7f4`)
  - **Drilldown** (commit `8f827e7d`)
  - **Sparkline / Zoom-pan / RangeSelector** (commit `23d97e29`)
  - **Annotations** (arrows, label callouts, circle highlights, brackets)
    (commit `e1e41b89`)
- Chart composables wired to full DS cross-cutting prop surface
  (`IDimensionProps` via `useDimension`, `margin`, `padding`, `rounded`,
  `elevation`, `bgColor`) (commits `7179cd6c`, `e16742e0`).
- Scatter chart: `z` dimension drives bubble radius (commit `2eb6c868`).
- Pie / donut: multi-series concentric rings; per-slice legend toggle
  (commit `ba51275b`).
- DS intent colours and custom CSS colours resolve to the correct token
  namespace in charts (commit `8166cd1e`).
- 7 canonical transverse emit interfaces (`IChartEmits`, etc.) added
  (commit `e1c7b890`).
- DS-wide typed `defineEmits` migration — 7 batches covering 54+
  components (commits `01381e41`, `a03627a8`, `ce40e686`, `2ce1ccd2`,
  `3347bc58`, `279fb2f0`, `e91c9518`).

#### Media kit

- `OrigamAudio` + `useAudioPlayer` + `useWaveform` — in-house audio
  player. Custom UI (play/pause, scrubber, volume, waveform via
  `OfflineAudioContext`). Media Session API for lock-screen controls +
  metadata. Cover image. 3 controls modes. Vinyl disc animation. Stem-
  tracks (multi-channel mute/solo). Playlist with tri-state loop and
  random shuffle. Zero external dep. ARIA: dynamic `aria-label`,
  `role="slider"` on scrubber, `role="img"` on waveform. SSR-safe.
  `tokens/component/sound.json` (commits `293efc06`, `d3781288`,
  `9c12e283`, `f3d3c797`). Waveform + album ported from `OrigamSound`
  (commit `d5a0246b`). `useWaveform` moved to Audio namespace (commit
  `d4822f26`). `<OrigamSound>` namespace retired — superseded by
  `<OrigamAudio>` (commit `a77911bc`).
- `OrigamVideo` + `useVideoPlayer` — in-house video player. YouTube-style
  restructure: custom UI (play/pause, scrubber, volume, fullscreen, PIP,
  captions), 3 controls modes, WebVTT captions with language switcher,
  `aspect-ratio` preset, download prop + quality switcher in cog menu,
  YouTube-style skip ripple (half-disk + chevrons stagger). Zero external
  dep. ARIA: `role="slider"` on scrubber, `role="status"` / `role="alert"`
  on state overlays. SSR-safe. `tokens/component/video.json` (commits
  `8a37102e`, `97420a99`, `31dcfdae`, `f50ccbdb`, `dcccb4dd`, `0208b2f3`,
  `9bbbea96`, `75b0779f`, `80e2a9c0`).
- `OrigamMediaScrubber` — reusable horizontal + vertical media scrubber
  primitive (thin track, buffer indicator, hover thumb + tooltip). Used
  by both `OrigamAudio` and `OrigamVideo` for their respective scrubber
  and volume controls (commits `9f87c917`, `9e050390`, `15d53094`).
- `OrigamMediaController` — shared media-control shell extracted from
  `useVideoPlayer` (commit `2cbb9618`). `useMediaPlayer` base composable
  split out (commit `c2a9f282`).

#### New utility / content components

- `OrigamGrid` + `OrigamGridItem` — declarative CSS Grid wrapper. Props
  for `columns` / `rows` / `areas` / `gap` (token or raw CSS) /
  `autoFlow` / `align*` / `justify*` and item-level `column` / `row` /
  `area` / `*Self` shorthands. Object syntax (`{ start, end }`) or raw
  CSS strings (`'1 / 5'`, `'span 2'`) for span control. Token group
  `--origam-grid---gap-{xs,sm,md,lg,xl}` (commit `0ebb1cd4`).
- `OrigamMasonry` + `useMasonry` — Pinterest-style masonry layout.
  CSS-first via `grid-template-rows: masonry` (detected via `useCssSupport`
  — new `masonry` flag). JS bucket-fill fallback with `ResizeObserver`.
  Responsive columns via container-query breakpoints. `animated` prop.
  `tokens/component/masonry.json` (`animation-duration`,
  `animation-easing`) (commit `2691c4e5`).
- `OrigamEmptyState` — placeholder for absent data. 5 presets
  (`no-data` / `no-results` / `error` / `offline` / `locked`) with auto
  icon + intent mapping. Three sizes, two alignments. ARIA `role="status"`
  + `aria-live="polite"`. `tokens/component/empty-state.json` (commit
  `abaca302`).
- `OrigamClipboard` + `useClipboard` — copy-to-clipboard helper.
  `navigator.clipboard.writeText` + `execCommand` fallback. Scoped
  `#default` slot exposes `{ copy, copied, error }`. Auto-resetting
  feedback state. ARIA `aria-live="polite"`. SSR-safe.
  `tokens/component/clipboard.json` (commit `d93c2957`).
- `OrigamInlineEdit` + `useInlineEdit` — edit-in-place pattern. Click
  display → input prefilled → Enter confirms / Escape cancels. Async
  `validate` callback. Multiline textarea mode. Custom slots
  `#display` / `#edit` / `#actions`. ARIA `aria-invalid` +
  `aria-describedby`. `tokens/component/inline-edit.json` (commit
  `d4a95557`).
- `OrigamNumberFormat` + `useNumberFormat` — i18n number formatting via
  `Intl.NumberFormat`. 7 formats, full locale support with auto-resolution
  chain, LRU-cached `Intl` instances. Scoped `#default` slot exposes
  `{ formatted, parts, value }`. ARIA `aria-label` expansion for compact
  notation (commit `dd8bfe3c`).
- `OrigamWatermark` + `useWatermark` — diagonal repeating overlay. SVG
  data-URL (no canvas). Text or image mode. Anti-tamper MutationObserver.
  `pointer-events: none`. `tokens/component/watermark.json`. SSR-safe
  (commit `cc715c38`).
- `OrigamQRCode` + `useQRCode` — SVG QR code rendering via
  `qrcode-generator` (~5 kB). 4 ECC levels. Optional logo overlay.
  Rounded modules. LRU cache. ARIA `role="img"`. Renamed from
  `OrigamQRCode` → `OrigamQrCode` (Vue style guide — commits `9f5a4eea`,
  `eabb92a3`, `1ee2acf6`, `da34f20d`, multiple QrCode fixes).
- `OrigamCalendar` + `useCalendar` — full calendar. 4 views
  (month / week / day / agenda), navigation, events with
  start / end / color / category, range select with drag-to-create,
  RRULE recurring events (`DAILY | WEEKLY | MONTHLY` + `INTERVAL` /
  `COUNT` / `UNTIL` / `BYDAY`). Toolbar with view switcher. Locale-aware
  via `Intl.DateTimeFormat`. Zero external dep. ARIA
  `application / gridcell / toolbar` + keyboard navigation. SSR-safe
  (commit `8b5d7f0a`).
- `OrigamTextMask` + gradient color props — text reveals an animated
  background via `background-clip: text`. 4 animation types
  (`pan` / `rotate` / `pulse` / `zoom`) with `prefers-reduced-motion`.
  Zero JS (pure CSS keyframes). SSR-safe (commit `31f67d37`).
- Gradient support for `color` / `bgColor` / `textColor` props. Three
  input formats: raw CSS gradient string, `IGradient` structured object
  (`{ from, to, via?, direction?, type? }` or `{ stops: [...] }`), or
  preset name (`color="gradient-sunset"`). 5 built-in semantic presets
  (`sunset`, `ocean`, `forest`, `fire`, `midnight`) with light + dark
  variants. 100 % backward-compatible (commit `c922fbff`).
- `SliderField` — native HTML `<input type="range">` implementation
  (commit `d3781288`).

### Changed

- DS-wide reuse-interfaces audit — 9 batches (commits `d0afd731`,
  `2c6e3aab`, `325c4df1`, `5f1abaf8`, and earlier in the cycle).
  Every component that declared `height` / `width` / `margin` / etc.
  inline now `extends IDimensionProps` / `IMarginProps` / etc. and
  consumes the matching composable. Eliminates half-implemented
  surfaces and drift from the standard `convertToUnit` helper.
- All ~28 inline composable constants extracted to `src/consts/`
  (commits `7cd6ff81`, `de48f7da`).
- Story Playground variants universally renamed to `Default` across all
  177 stories (commits `cfeaa682`, `ace53342`, `f2e89284`).

### Fixed

- `OrigamChart` — area fill previously overridden by the SCSS
  `fill: none` cascade (commit `ed1c4610`); scatter points overflowing
  the plot zone (commit `ba51275b`); horizontal bar — category/value
  axis swapped (commit `f8ec65db`); legend click filtered wrong series
  index (commit `d25eae00`); `legendPosition` not moving the legend
  (commit `082d053b`); column/bar slots overlapping value axis on first
  index (commit `4406e92d`); stepped-line tail cut off (commit
  `ee45357a`); pie/donut legend showing wrong labels (commit `4406e92d`).
- `OrigamVideo` — double-click skip on desktop (`f50ccbdb`); controls bar
  clicks restored after overlay removal (`4fd5f375`); skip ripple sizing
  cascade (`80e2a9c0`, `9bbbea96`, `75b0779f`); cross-origin download
  via blob (`73c2e2a4`, `d84fa9bc`).
- `OrigamCalendar` — Calendar loading shape + active toolbar button
  contrast (`55e58b3d`).
- `OrigamQrCode` — intent-to-paint mapping, SVG host sizing, title
  centring (commits `c1823057`, `dceb4cfe`).
- Link composable — `ComputedRef` for `tag` and `href` unwrapped in
  templates; previously caused a `[object Object]` render (commit
  `9822c47b`, reverted and re-landed as `3f79d0c0`).
- `withDefaults()` inline literal rule enforced — `Grid`, `Masonry`,
  `Blockquote` were referencing `XXX_DEFAULTS` objects statically
  unresolvable by the SFC compiler, causing `undefined` prop crashes
  (commit `276fff1e`).
- `OrigamSnackbar` — `roundedClasses` `ReferenceError` at mount (commit
  `aa86f93c`).

---

## [2.3.0] — 2026-05-15

> **The features release.** Four new components, four major
> enrichments, an official Nuxt module, and a comprehensive SSR
> safety audit. All additions are backward-compatible — drop-in
> upgrade from 2.2.x. 378 unit tests (+158 vs 2.2.1), 0 lint errors.

### Added

- `origam/nuxt` sub-export — official Nuxt 3 / Nuxt 4 module. Auto-imports
  components and composables. SSR-safe theme resolution via cookie +
  `Sec-CH-Prefers-Color-Scheme` header (no FOUC, no hydration mismatch).
  Auto-injects token CSS files (primitive + selected themes + utilities).
  Configurable via `origam: {}` in `nuxt.config.ts`. Resolves through
  `modules: ['origam/nuxt']`. New `IOrigamNuxtModuleOptions` and
  `IOrigamNuxtRuntimeConfig` interfaces; new theme constants
  (`ORIGAM_THEME_AUTO`, `ORIGAM_THEME_LIGHT`, `ORIGAM_THEME_DARK`,
  `ORIGAM_THEME_ATTR`, `ORIGAM_THEME_STORAGE_KEY`). Reference
  documentation at `docs/integrations/nuxt.md`.

### Changed

- `OrigamTextField` — new `mask` prop with built-in patterns
  (`phone:fr`, `phone:us`, `phone:international`, `iban`, `siret`,
  `creditcard`, `date:iso`, `date:fr`, `date:us`, `time`, `time:12h`,
  `postcode:fr`, `postcode:us`) plus a custom pattern syntax
  (`#` = digit, `A` = letter, `*` = any, anything else is a literal).
  In-house mask engine — zero external dependency (no `imask.js` /
  `cleave.js` / `vue-the-mask`). Reactive validation pipeline with
  built-in `luhn` (credit card), `iban` (mod-97) and date parsers
  (`date:iso` / `date:fr` / `date:us`); custom validators accepted as
  `(unmasked) => boolean`. New emits `@valid(boolean)` and
  `@complete({ complete, unmasked })` fire on every value change. The
  v-model exposes the **unmasked** value while the DOM input displays
  the formatted (masked) one — paste handling strips literals and
  reformats, `aria-invalid` toggles on touched fields, and the engine
  auto-promotes phone-shaped patterns to `type="tel"` for mobile
  keyboard hints. New `useMask` composable, `applyMask` / `unmaskValue`
  / `resolveMaskConfig` / `validatePattern` utils, new `IMaskOptions`
  interface and `TMask` / `TBuiltInPattern` / `TPatternValidator`
  types.
- `OrigamTextareaField` — new `mode="rich"` enabling a lightweight
  HTML / Markdown editor based on `contenteditable`. Built in-house
  with zero external dependencies (no TipTap, ProseMirror, Quill).
  9 toolbar commands (`bold`, `italic`, `underline`, `link`,
  `list-bullet`, `list-ordered`, `heading`, `code-inline`,
  `clear-format`), customisable via the new `toolbar` prop (or
  `toolbar: false` to hide). Keyboard shortcuts (Cmd/Ctrl+B/I/U/K/E
  and Cmd/Ctrl+Shift+7/8 for the two list modes). New `output` prop
  switches the v-model serialisation between `'html'` (sanitised) and
  `'markdown'` (CommonMark-flavoured subset). New `toolbarPosition`
  prop (`'top' | 'bottom' | 'floating'`). New `format` emit fired on
  every toolbar click or keyboard shortcut with the command id (and
  the URL for link insertion). New slots `#toolbar` and
  `#toolbar-item` allow replacing the default UI entirely. Internal
  sub-component `OrigamRichToolbar.vue` + composable
  `useTextareaRich` own the contenteditable contract. In-house HTML
  sanitiser with allowlist on tags (`p`, `br`, `strong`, `b`, `em`,
  `i`, `u`, `a`, `ul`, `ol`, `li`, `h1`, `h2`, `h3`, `code`),
  attributes (`href` restricted to `http:` / `https:` / `mailto:` /
  `tel:` plus relative URLs; `class` restricted to the
  `origam-rich--*` prefix), and stripping every `on*` event handler
  before per-tag filtering. External links are auto-hardened with
  `rel="noopener noreferrer nofollow" target="_blank"`. ARIA:
  `role="toolbar" + aria-label` on the toolbar, real `<button>` per
  command with `aria-label` + `aria-pressed`, the editing surface
  carries `role="textbox" + aria-multiline="true"`. New tokens under
  `component/textarea-field/rich-*` (toolbar surface, button states,
  content padding, inline-code colors, link color, heading sizes).
  The plain-mode (`mode="plain"`, default) API is fully
  backward-compatible — passing nothing keeps the previous
  `<textarea>` behaviour.

- `OrigamCode` — major enrichment via shiki integration. Syntax
  highlighting for 13 languages (vue, ts, js, tsx, jsx, scss, css, json,
  bash, html, xml, yaml, md) plus `plaintext`. New props: `lineNumbers`,
  `highlightLines` (accepts both `number[]` and the range syntax
  `'2,5-7'`), `copyable`, `maxHeight`, `theme` (`'auto' | 'light' | 'dark'`),
  `wrap`, `filename`. Copy button with `navigator.clipboard` and an
  `execCommand('copy')` fallback for legacy WebViews. Lazy-init shiki
  highlighter cached as a module-level singleton across instances; an
  LRU (max 64 entries) caches highlighted HTML by `(code, lang, theme)`
  so re-renders never re-tokenise. Theme defaults to `auto` and tracks
  the host `<html data-theme>` attribute. New `useCode` composable
  exposing `{ highlight, prime, isReady, resetCacheForTesting }`. New
  utility `parseHighlightLines()` shared with stories/tests. Pure-CSS
  line-numbers gutter (CSS counter, no JS layout) and line-highlight
  swap (class toggle on already-rendered rows, no re-tokenisation).
  ARIA: `role="region"` on the surface, `aria-live="polite"` on the
  copy feedback, hidden line numbers. `shiki` (`^3.8.1`) promoted from
  `devDependencies` to `dependencies` (it's a runtime dep now); the
  bundle adds ~3 MB to installed `node_modules` for the curated subset.
  New tokens under `component/code` (35 vars: surface, header, filename,
  copy button, line-number gutter, line-highlight, scrollbar). The v2.x
  plain-text `<pre>` API is fully backward-compatible — passing just
  `code` and `lang` keeps the previous behaviour.

- `OrigamParallax` — major enrichment. Multi-layer support via new
  `OrigamParallaxLayer` subcomponent (`speed`, `offsetX`, `offsetY`,
  `zIndex` props; layers register themselves into the host runtime and
  receive direct DOM mutations of `transform` outside Vue reactivity).
  Host gains `direction` (`'vertical' | 'horizontal' | 'both'`),
  `easing` (`'linear' | 'ease-out' | 'spring'`, in addition to the
  legacy raw CSS timing-function string), `disabled`, `speed`,
  `threshold` props. New emits: `@enter`, `@leave`,
  `@scroll-progress(0→1)` driven by `IntersectionObserver` +
  `requestAnimationFrame`. `prefers-reduced-motion: reduce` is honoured
  natively — layers stay at `translate3d(offsetX, offsetY, 0)` and the
  rAF loop short-circuits. CSS-first scroll-driven animations
  (`animation-timeline: view()`) when `view-timeline` is supported
  (Chrome 115+, Edge 115+) AND `easing === 'linear'`; JS fallback
  otherwise. Spring easing implemented as a damped lerp in the JS path.
  Existing single-layer / `<OrigamParallaxElement>` API preserved (the
  two layer kinds use independent injection contexts and can coexist
  inside the same host). New tokens: `parallax.transition-duration-spring`,
  `parallax.transition-easing-default` / `-spring`,
  `parallax.layer.will-change` / `.transform-origin`.

### Added

- `OrigamCommandPalette` — ⌘K command launcher. Built on a teleported
  dialog with focus trap + focus restoration. Custom subsequence-based
  fuzzy-match algorithm (no external dep) ranks results by
  consecutive-run + label-prefix + first-position bonuses. Composable
  `useCommand` exposes a process-wide command registry — entries
  registered inside a Vue effect scope auto-unregister on dispose.
  Reuses `OrigamKbd` for inline shortcut display. Hotkey listener
  built on `useHotkey` (default `⌘+K` on macOS, `Ctrl+K` on
  Windows / Linux, configurable per combination or disabled with
  `:hotkey="null"`). ARIA combobox pattern (`role="combobox"` on the
  input, `role="listbox"` on the result list, `role="option"` per
  item, `aria-activedescendant` tracking the keyboard cursor) +
  `role="dialog"` + `aria-modal="true"` on the surface. Tokens exposed
  under `tokens/component/command-palette.json`
  (`--origam-command-palette---*`,
  `--origam-command-palette__input---*`,
  `--origam-command-palette__item---*`,
  `--origam-command-palette__group-title---*`,
  `--origam-command-palette__empty---*`,
  `--origam-command-palette__footer---*`,
  `--origam-command-palette--backdrop---*`).

- `OrigamBracket` — e-sport tournament tree. Supports single-elimination,
  double-elimination and round-robin variants. SVG connectors
  auto-computed from `nextMatchId` (with positional fallback). Slots for
  custom match / competitor / round-title / connector rendering. ARIA
  `role="region"` with per-round `role="group"` + `aria-labelledby`
  pointing at title headings. Tokens exposed under
  `tokens/component/bracket.json` (`--origam-bracket---*`,
  `--origam-bracket-match---*`, `--origam-bracket-competitor---*`,
  `--origam-bracket-connector---*`, `--origam-bracket-round-robin---*`).

- `OrigamSnackbarStack` — multi-toast notification system. Reuses
  `OrigamSnackbar` styling vocabulary for rendering. Composable
  `useSnackbarStack({ id })` exposes `notify` / `dismiss` /
  `dismissAll`. 8 anchor locations, max stack size with FIFO eviction,
  per-item auto-dismiss (or `0` for sticky), action buttons with
  optional `keepOpen`, ARIA `role="region"` on the stack root +
  `role="status"` / `"alert"` per intent on each item with matching
  `aria-live`. Slide-in / slide-out transitions degrade to a fade under
  `prefers-reduced-motion`. Tokens exposed under
  `tokens/component/snackbar-stack.json`
  (`--origam-snackbar-stack---*`, `--origam-snackbar-stack__item---*`).

- `OrigamTabs` / `OrigamTab` / `OrigamTabPanels` / `OrigamTabPanel` —
  full tab system with horizontal / vertical orientation, three visual
  variants (`default` / `pills` / `underline`), ARIA `role="tablist"` +
  `role="tab"` + `role="tabpanel"` wiring, full keyboard navigation
  (`←`/`→`/`↑`/`↓`/`Home`/`End`/`Enter`/`Space`), lazy or eager panel
  mounting, optional touch-swipeable panels. Reuses the shared
  `useGroup` orchestration so the selection state, mandatory behaviour
  and disabled-tab semantics align with the rest of the system
  (`OrigamBtnToggle`, `OrigamCarousel`, `OrigamBottomNav`). Tokens
  exposed under `tokens/component/tabs.json` (item color, indicator
  color, panel padding, transition duration).

- `OrigamClientOnly` — SSR helper component that renders its default
  slot only after `onMounted`. Optional `#fallback` slot (or
  `placeholder-tag` / `placeholder-class` props) reserves layout space
  during SSR to avoid CLS. Use to wrap fragments whose markup truly must
  differ between server and client (audio, deviceorientation,
  IntersectionObserver-driven features, …) without triggering hydration
  mismatches.

- `useCssSupportClient(feature, { defaultValue })` — hydration-safe
  feature-gate helper. Returns a `Ref<boolean>` that starts at
  `defaultValue` (default `false`) on both SSR and first client render,
  then flips to the real `CSS.supports()` result inside `onMounted`.
  Use to gate **markup** branches (template `v-if`) when the regular
  `useCssSupport().css.value.X` would produce a hydration mismatch
  (class-only branches keep using the existing API — Vue 3 reconciles
  class diffs fine).

### Fixed

- SSR safety — comprehensive audit of all composables and components
  that previously could crash on server render (`window is not defined`,
  `document is not defined`). `useCssSupport` already returned all-false
  flags during SSR; the rest of the surface (`useTheme`, `useCommand`,
  `useSnackbarStack`, `useCode`, `useMask`, `useTouch`, `useHotkey`,
  `useSticky`, `useSheetSwipe`, `useScroll`, `useParallax`, `useStyleTag`,
  `useTeleport`, `useLocationStrategies`, `useScrollStrategies`,
  `useDisplay`) was confirmed safe via the audit and patched where a
  composable's public method or a `computed` could be evaluated during
  SSR. Specifically: `useAspectRatio` no longer dereferences
  `window.innerWidth/Height` when no explicit `aspectRatio` prop is
  given; `useVirtual`'s `viewportHeight` computed guards
  `document.documentElement`; `useSnackbarStack.dismiss()` guards
  `window.clearTimeout`. Overlay components (Dialog, Drawer, Menu,
  Tooltip, Snackbar, ContextualMenu, SnackbarStack, CommandPalette)
  confirmed SSR-safe via `<Teleport>` (Vue defers the mount until the
  client). New guide `docs/guide/ssr.md`. New `src/__tests__/ssr-smoke.spec.ts`
  exercises every refactored composable in a simulated SSR environment
  (window/document/CSS stripped) **and** through `@vue/server-renderer`'s
  real `renderToString()`.

---

## [2.2.1] — 2026-05-14

### Fixed

- Expose `./package.json` explicitly in the `exports` map. The catch-all
  `"./*": "./dist/src/*"` previously intercepted `import 'origam/package.json'`
  and re-routed it to a non-existent file inside `dist/`. Standard
  consumer pattern (reading the version from the package metadata) was
  broken — fixed by adding `"./package.json": "./package.json"` ahead
  of the catch-all so it matches first.
- 2.2.0 was tagged but never published to npm. 2.2.1 is the first
  version that lands on the registry.

---

## [2.2.0] — 2026-05-14

> **The "ready for npm" release.** Package metadata, peer dependencies,
> tree-shaking signals and a real README are all in. Tarball preview
> shrunk from 5.6 MB to **867.9 kB** (2 343 files, zero suspect entry).
> No public API change vs 2.1.0 — every consumer upgrade is a
> drop-in.

### Added — stories, slots, emits coverage

- 525+ missing `Slot` / `Emit` Variants across 113 component stories
  (`feat(stories)`). Every documented slot now has a dedicated Variant
  with a custom-content example, and every emit a Variant that logs
  to a live counter.
- `OrigamSwitchTrack` extracted as a standalone primitive (track-only)
  so consumers can build switch-like compounds without rewriting the
  thumb logic.
- Tooling: `useStateEffect` now reacts to every per-axis composable
  (`useHover` / `useActive` / `useFocus`) in a single call — collapses
  the 14 components that historically wired them axis by axis.

### Fixed

- `useStyle` now instrumented across the 124 components that
  previously inlined `*Styles` arrays — single source of truth for the
  inline-style escape hatch.
- Carousel — `progress` prop renders a real-time progress bar wired to
  the cycle timer (was rendering a static "step / total" bar).
- Carousel — `hideDelimiterBackground` finally has a background to
  hide (default `__controls` bg = `rgba(0, 0, 0, 0.4)`).
- Histoire sandbox/panel sash now resizes the iframe in **both
  directions** (was capped at the 720 px responsive-preset width when
  dragging right).
- `useRounded` — utility variants (`xs|sm|md|lg|xl|none|full`) now
  emit BOTH the `.origam--rounded-*` class AND an inline
  `border-radius` declaration as a specificity escape hatch (Strategy
  A documented in `CLAUDE.md`).
- 130 unused-vars cleared from `src/`, 39 ESLint warnings fixed.

### Changed — package for npm

- `peerDependencies` introduced: `vue ^3.5`, `vue-i18n ^11`,
  `vue-router ^4.5` (last two `optional` via `peerDependenciesMeta`).
  They are no longer auto-installed as `dependencies` — consumers
  bring their own versions.
- `sideEffects: ["**/*.css", "**/*.scss", "**/*.vue"]` for downstream
  tree-shaking.
- `engines.node: ">=22"` (matches `.nvmrc`).
- `prepublishOnly` script chains `tokens:build` → `server:build` →
  unit tests. Every `npm publish` rebuilds from scratch with green
  tests.
- `files` whitelist tightened to `dist/src/`, `dist/tokens/`, LICENSE,
  README, CHANGELOG. The Histoire bundle (`dist/stories/`, ~13 MB) is
  no longer shipped to consumers.
- `build.config.ts` `externals` extended to `['vue', 'vue-i18n',
  'vue-router', '@mdi/font']` so peer deps don't get re-bundled.
- mkdist exclusion patterns expanded: `.spec.ts`, `__tests__/**`,
  `.cy.ts`, `.story.vue` are stripped from `dist/`.
- ESLint config ignores `docs/.vitepress/cache/**` and
  `figma-plugin/**` (these aren't part of the published library).

### Documentation

- Full `README.md` written from scratch (253 lines) — install,
  peer deps, plugin registration, theming (`data-theme` +
  `useTheme()` + `<OrigamThemeProvider>`), token tiers, component
  families, composable table, CSS-first principle.

### Internal

- ESLint rule `no-restricted-imports` blocks `@origam` /
  `@stories` / `@docs` / `@cypress` aliases inside `src/` — once
  published, those aliases can't be resolved by consumers.
- 124 components instrumented with `useStyle` following the
  canonical pattern.
- `.tsbuildinfo` and other transient artefacts removed from the tree.

---

## [2.1.0] — 2026-05-07

> **The classes-first release.** The 13 transversal composables
> (`useColor`, `useBackgroundColor`, `useTextColor`, `useColorEffect`,
> `useElevation`, `useRounded`, `useBorder`, `useMargin`, `usePadding`,
> `useSize`) now emit utility classes (e.g. `.origam--bg-primary`,
> `.origam--shadow-md`) when the consumer passes a tokenised value. The
> existing `*Styles` outputs stay populated only when the value is
> non-tokenisable (legacy hex, custom dimensions) — the inline style
> stack on a typical button drops from ~12 to ~6 declarations.
>
> **Non-breaking.** Every composable keeps its previous return shape;
> the new `*Classes` keys are additive. Components have been migrated
> to read both shapes in parallel (transition strategy A).

### Migrating from v2.0 to v2.1

Nothing is required. The release is additive; existing consumers keep
working unchanged. To start using the new path:

```vue
<!-- v2.0 — still works, still emits inline style -->
<OrigamBtn color="primary">Click</OrigamBtn>

<!-- v2.1 — same code, but the emitted DOM now also carries the
     `.origam--bg-primary` utility class instead of inline
     `background-color: var(...)`. Inspecting the DOM is much cleaner. -->
```

If you write your own components on top of `useColor*` / `useElevation`
/ `useRounded` / etc., you can now destructure the new `*Classes`
return:

```ts
const { colorClasses, colorStyles } = useColorEffect(props, isHover, isActive, isDisabled)
// colorClasses: ['origam--bg-primary']  when intent
// colorStyles : []                       when intent
// colorClasses: []                       when '#7c3aed'
// colorStyles : ['background-color: ...']when '#7c3aed'
```

Bind both — `:class="[..., colorClasses]"` AND `:style="[..., colorStyles]"`.
The hover/active/disabled state still flows through `colorStyles` (utility
classes are static, by design).

### Added

- **66 utility classes** generated by Style Dictionary, exposed at
  `origam/tokens/css/utilities` and forwarded by `origam/styles`:
  - `.origam--color-{primary|secondary|success|warning|danger|info|neutral}`
  - `.origam--bg-{primary|secondary|success|warning|danger|info|neutral}`
  - `.origam--shadow-{none|xs|sm|md|lg|xl}`
  - `.origam--rounded-{none|xs|sm|md|lg|xl|full}`
  - `.origam--border-{none|thin|thick}`
  - `.origam--p-{0..12}`, `.origam--m-{0..12}`, `.origam--gap-{0..12}`
  - `.origam--text-{xs|sm|md|lg|xl|2xl}`
- New return keys on transversal composables:
  `colorClasses`, `backgroundColorClasses`, `textColorClasses`,
  `elevationClasses` (extended), `roundedClasses` (extended),
  `borderClasses` (extended), `marginClasses`, `paddingClasses`,
  `sizeClasses`.
- `tests/e2e/utilities.spec.ts` — 66 Playwright tests, one per
  utility class, asserting both class presence and `getComputedStyle`
  resolution against the CSS var pipeline.
- `tests/e2e/prop-audit-phase4.spec.ts` — DOM audit on representative
  components confirming the inline-style pile reduction.
- 79 new Vitest unit specs in `src/composables/Commons/__tests__/`
  covering the classes-first branch of every refactored composable.

### Changed

- ~54 components migrated to consume `*Classes` in parallel with
  `*Styles`. Notable surface-bearing children: Menu/Tooltip/Picker/
  Snackbar/Badge — utility class lands on the `__content` / `__pill` /
  `__wrapper` BEM child, never on the teleport root.
- `OrigamSelectionControl.__wrapper` now carries
  `useTextColor(color)`'s class + style on its root element. This
  re-instates the Switch thumb tinting (`currentColor`) for tokenised
  intents, which had silently broken when `OrigamSwitchTrack` was
  extracted earlier in the cycle.
- `OrigamSwitch` SCSS — the legacy `[style*="color:"]` selector is
  joined by a class-driven set
  (`.origam-selection-control__wrapper.origam--color-{intent} &__thumb`)
  so both the new tokenised path and the legacy hex path tint the thumb
  via `currentColor`.

### Deprecated

- `*Styles` returns on the 10 refactored composables — prefer the
  matching `*Classes` for tokenised values. Both are kept for one
  major cycle; removal scheduled for v3.0.0.

### Fixed

- `OrigamSwitch` thumb stayed white when `color="primary"` (or any
  tokenised intent) — regression from the `OrigamSwitchTrack`
  extraction. Re-introduced via classes-first.
- `OrigamSnackbar` `__wrapper` no longer duplicates the
  `roundedClasses`/`borderClasses` already applied at the root.

### Known limits — planned for v2.2 (Phase 1.5)

- No utility for margin / padding axes (`mx`, `my`, `mt`, `mb`, `ml`,
  `mr`, `px`, `py`, `pt`, `pb`, `pl`, `pr`). Components passing
  axis-specific values fall back to inline styles for now.
- No `2xl` / `3xl` shadow utilities (the rungs exist as primitives but
  are off the manifest).
- Legacy `ROUNDED` enum (`x-small | small | default | medium | large
  | x-large | shaped | shaped-invert`) does not bridge to the
  `none|xs|sm|md|lg|xl|full` utility taxonomy — components passing a
  legacy value get their existing component-scoped BEM modifier and an
  inline style fallback.
- `useColorEffect` does NOT emit a `*Classes` value when `isHover` /
  `isActive` / `isDisabled` is true (states are inline-only by design).
  Components that bind `useActive(props, 'modelValue')` (Alert, Badge,
  BottomNav) therefore never carry a utility class while visible — the
  inline style still paints them correctly. This is intentional; do not
  rely on the utility class for state-dependent styling.

---

## [2.0.0] — 2026-04-26

> **The design tokens release.** Every component now resolves its colors,
> spacing, typography, and motion through a centralised, theme-aware
> token pipeline (Style Dictionary v4 + Tokens Studio for Figma). 50+
> components migrated; 18 of them also picked up real bug fixes from the
> companion `optimus-design-system` codebase. Multi-theme (light / dark)
> works out of the box; `brand-X` themes are an additive layer.

### Migrating from v0.x to v2.0.0

This is a major bump because three things change:

1. **The CSS variables that components read are now generated.** The old
   `<style>:root{}` blocks that each component shipped have been removed.
   Consumers MUST load the generated token CSS — either:

   ```ts
   import 'origam/styles' // primitive + light + dark + helpers
   ```
   or pick the layers separately:
   ```ts
   import 'origam/tokens/css/primitive'
   import 'origam/tokens/css/light'
   import 'origam/tokens/css/dark' // applied via [data-theme="dark"]
   ```

   If you were overriding origam vars at the document root (e.g.
   `:root { --origam-btn---background-color: red }`), that still works —
   the generated CSS is just a default. But if you depended on the
   per-component `:root{}` block being injected when the component
   mounted, that's gone. The vars are now set once globally.

2. **`useColorEffect` is intent-aware.** The `color` / `bgColor` props on
   `<OrigamBtn>`, `<OrigamChip>`, `<OrigamAvatar>`, etc. now expect a
   semantic intent (`'primary'`, `'success'`, `'danger'`, …) rather than
   a raw hex. Raw hex still works but emits a one-shot `console.warn`
   per `(prop, value)` pair (full removal in v3.0.0).

   ```vue
   <!-- v0.x -->
   <OrigamBtn color="#7c3aed">Click</OrigamBtn>

   <!-- v2.0 -->
   <OrigamBtn color="primary">Click</OrigamBtn>

   <!-- One-off custom color -->
   <OrigamBtn :style="{ '--origam-btn---background-color': '#7c3aed' }">…</OrigamBtn>
   ```

3. **`useElevation` no longer computes shadows in JS.** The `bgColor`
   parameter is accepted for signature compat but ignored. The composable
   now emits `box-shadow: var(--origam-shadow-{rung})` and the rung is
   themed at the token level (different shadow recipes for light vs dark).

   The legacy `formatElevationStyle(level, bgColor)` utility is still
   exported but `@deprecated` — it will be removed in v3.0.0.

### Added

- **Multi-tier design tokens** (`tokens/`):
  - Primitive: 12 color ramps, 12 spacing steps, full font / radius /
    shadow / motion / zIndex / opacity / border ladders.
  - Semantic: `surface`, `text`, `border`, `action.{primary,secondary,
    ghost}`, `feedback.{success,warning,danger,info}`, `overlay`. Per
    theme (light + dark), with hooks for brand-X.
  - Component: ~60 files, one per component, in DTCG / Tokens Studio
    format — editable from the Figma plugin.
- **Pipeline**: Style Dictionary v4 + sd-transforms. Outputs CSS,
  SCSS partials, and TypeScript union types. `npm run tokens:build`,
  `tokens:watch`, `tokens:lint`.
- **GitHub Action** (`.github/workflows/tokens-sync.yml`): consumes
  Figma → Tokens Studio → `tokens-sync` branch, rebuilds artifacts,
  opens a PR to `develop` automatically.
- **Multi-theme runtime**:
  - `useTheme()` composable — singleton ref, persistence, prefers-
    color-scheme fallback, toggle helper.
  - `<OrigamThemeProvider theme="dark">` for sub-tree overrides.
- **CSS-first / JS-fallback principle**:
  - `useCssSupport()` composable — feature detection layer wrapping
    `CSS.supports()` with caching for 20 modern features (subgrid,
    container queries, `:has()`, aspect-ratio, color-mix, anchor
    positioning, view transitions, …). Components now branch via
    this composable instead of calling `CSS.supports()` directly.
- **Defaults system** (ported from optimus):
  - `useDefaults()` composable + `<OrigamDefaultsProvider>` for
    cascading default props (mirrors Vuetify's `<v-defaults-provider>`).
  - `IDefault`, `IDefaultProviderProps`, `IDefaultProviderSlots`.
- **`<OrigamConfirmWrapper>`** — type-it-twice form helper with
  auto-injected validation, two render modes (slot-based / `field=`
  shortcut), and bidirectional defaults forwarding.
- **`SCSS helpers`** (`src/assets/scss/_helpers.scss`): `ds-intent`,
  `ds-elevation`, `ds-text-style`, `ds-space`, `ds-focus-ring`,
  `ds-visually-hidden`.
- **VARIANT / VARIANT_INPUT enums** + `TVariant` / `TVariantInput`
  types.
- Common emit / slot interfaces: `IFieldEmits`, `IFieldSlots`,
  `IFieldDefaultSlotProps`, `IInputEmits`, `IInputSlots`,
  `IAdjacentEmits`, `IAdjacentSlots`, `IAdjacentInnerEmits`,
  `IAdjacentInnerSlots`, `IActiveEmits`, `IFocusEmits`,
  `ICommonsComponentEmits`, `ICommonsComponentSlots`.

### Changed

- **Every component** with chrome (~50) now consumes design tokens
  rather than hardcoded values. The per-component `<style>:root{}`
  blocks are gone.
- **`OrigamPasswordField`** rebuilt from the optimus version (629
  vs 399 lines). New features: strength-requirements popup
  (`requirements` + `need*` flags + `minLength`), auto-injected
  validation rules, show/hide toggle, intersect-driven autofocus,
  click:control / mousedown:control emits.
- **`OrigamFileField`** split into 3 files (FileField + DragNDropItem
  + ListItem) for clearer responsibility boundaries; drag-and-drop
  mode reworked, `maxFileSize` validation added, typed emits.
- **`OrigamForm`** grew form-level validation, `scrollToError`,
  global `messages` rendering through OrigamMessages.
- **`OrigamField`** now exposes the `outline__notch` BEM child for
  the floating-label rendering, slot-based prefix/suffix detection,
  and proper focus↔active synchronisation.
- **Snackbar z-index** normalised from `10000` to `1060` via
  `{zIndex.toast}`. Consumers stacking custom overlays on top must
  verify their stacking context.
- **`color.action.primary.bgSubtle / fgSubtle`** added to the
  semantic layer (was missing — Select selected-item background and
  Slider thumb focus ring needed it).

### Fixed

- **OrigamMessages**: `:id` was bound to the entire messages array
  instead of the current message. Fixed by using a kebab-cased
  per-message key.
- **OrigamNumberField**: `watchEffect` → `watch(props.modelValue)` —
  the eager mode was causing reactive write loops while the user
  typed. Increment / decrement handlers split.
- **OrigamOtpInputField**: undefined-current crash guard;
  `isValidNumber` → `isInvalidValue` (semantic was inverted);
  double `update:focused` emit prevented; handleClear added.
- **OrigamFileField**: `@clik:append` and `@lick:append-inner` typo
  fixes; drag&drop append mode no longer overwrites existing files;
  locale arg shape `t(key, [arg])` corrected.
- **OrigamMenu**: stray `console.log()` removed.
- **OrigamOverlayScrim**: `<style scoped>` block was missing
  entirely — scrim wasn't rendering.
- **OrigamProgressCircular**: `backgroundColorClasses` /
  `loaderColorClasses` were missing on the SVG `<circle>` elements.
- **OrigamProgressLinear**: `useBackgroundColor` → `useTextColor`
  (the bar's color was being applied as background, washing it out).
- **OrigamListSubheader**: vuetify-specific
  `rgba(var(--v-theme-on-surface), …)` references replaced with
  origam-native tokens. Style block converted from `lang="css"` to
  `lang="scss"`.
- **OrigamExpansionPanel**: vuetify shadow var leak
  (`var(--v-shadow-key-umbra-opacity, …)`) removed; selector
  `:not(.v-expansion-panel-title--static)` matched a vuetify class
  that never renders in origam — corrected to the origam class.
- **OrigamSlideGroup**: `<style scoped>` block was missing entirely.
- **OrigamCheckbox / OrigamCheckboxBtn / OrigamSelectionControl**:
  `handleClickLabel` argument typed `MouseEvent` (was `Event` —
  caused TS strict failures).
- **OrigamSelectionControlGroup**: `item` slot now exposes
  `{ item, index }` (was `{ item }` only).

### Deprecated

- `formatElevationStyle(level, bgColor)` — replaced by the
  `--origam-shadow-{rung}` token ladder. Kept exported for one
  major version; full removal in v3.0.0.
- Raw hex / rgb passed to `useColorEffect` color props — pass a
  `TIntent` value or use `:style` for one-off custom colors. Removal
  in v3.0.0.

### Outstanding (deferred to v2.x or v3.0.0)

- Several form components still carry hardcoded hex inside their
  scoped styles (Switch 11, Select 8, DatePickerField 5,
  ColorPickerField 2, Img 2, Highlight 3). The token JSONs are in
  place; the `var(--origam-…)` references need to be wired in a
  follow-up. Fallback-only behaviour ensures consumers see the
  intended design today.
- Outstanding token-naming gaps: `color.surface.chrome` (SystemBar),
  `color.overlay.backdrop` (Drawer / Overlay scrim), `color.surface
  .inverse` (Tooltip), `opacity.20` / `opacity.30`, `radius.xs2: 6px`,
  `font.size.6xl: 45px`, `font.letterSpacing.widish`. Promote at
  next ui-designer review.
- `OrigamMain` uses `--origam-main--{prop}` (double-tiret) instead
  of the canonical `---` convention. Cosmetic, breaks consumer
  overrides. To be aligned at v3.

---

## Pre-2.0 history

The `[WIP]` commits before this release were the foundation work
(audit, Figma integration spike, package layout). The design-token
migration started at commit `2124ab8` (Lot 0) and shipped over
ten incremental commits visible in `git log --oneline main..HEAD`.

