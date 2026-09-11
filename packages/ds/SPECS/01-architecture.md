# 01 — Architecture

> Spec technique du design system **origam**. Cette partie décrit l'architecture macro
> du monorepo et l'architecture interne du package publié `packages/ds`. Toutes les
> affirmations sont tirées de la lecture directe du code et de la configuration réelle
> (`package.json`, `build.config.ts`, `pnpm-workspace.yaml`, `eslint.config.js`,
> `src/origam.ts`, `src/nuxt/module.ts`, `scripts/build-tokens.mjs`, `src/assets/scss/main.scss`,
> composables `Commons`). Lorsqu'une information n'a pas pu être vérifiée dans les sources,
> elle est explicitement signalée par « Je ne sais pas ».

---

## 1. Vue d'ensemble du monorepo pnpm

Le dépôt est un **workspace pnpm**. La déclaration est minimale et sans ambiguïté
(`pnpm-workspace.yaml`) :

```yaml
packages:
  - 'packages/*'
```

Le `package.json` racine est marqué `"private": true` et `"version": "2.5.1"` ; il
n'est **jamais publié**. Sa description l'affirme noir sur blanc : *« Workspace root,
not published. The publishable package lives in packages/ds. »* Il fixe deux contraintes
structurantes :

- `"engines": { "node": ">=22" }` — Node 22 minimum (cf. `.nvmrc`).
- `packageManager: "pnpm@9.15.0"` — la version de pnpm est pinnée via Corepack.
- `pnpm.overrides.vue: "3.5.35"` — une seule version de Vue est forcée pour tout le
  workspace afin d'éviter les duplications d'instances réactives entre packages.

Les scripts racine **délèguent systématiquement** via le filtre pnpm `-F <name>` ; ils
ne font jamais de `cd packages/x`. Exemples lus dans le `package.json` racine :

| Script racine | Délégation réelle |
|---|---|
| `build:lib` | `pnpm -F origam build` |
| `build:all` | `pnpm -r build` |
| `tokens:build` | `pnpm -F origam tokens:build` |
| `dev:stories` / `dev:docs` / `dev:marketing` | `pnpm -F @origam/<pkg> dev` |
| `test:run` | `pnpm -F @origam/tests test:unit:run` |
| `test:e2e` / `test:a11y` | `pnpm -F @origam/tests test:e2e` / `test:a11y` |
| `lint` / `lint:fix` | `eslint .` (racine, config plate partagée) |

Le workspace compte **6 packages** sous `packages/` (vérifié par listing) :

| Package | Nom npm / interne | Publié ? | Rôle |
|---|---|---|---|
| `packages/ds` | `origam` | **OUI** (seul) | La bibliothèque Vue 3 publiée. Composants, composables, tokens, types. C'est l'unique artefact npm. |
| `packages/marketing` | `@origam/marketing` | non (privé) | Site marketing Nuxt 4 (landing + showcase + hub doc). Héberge les 7 thèmes de marque (`sobre`, `glass`, …). |
| `packages/stories` | `@origam/stories` | non (privé) | Stories Histoire (~208 specs). Playground interactif de chaque composant. |
| `packages/docs` | `@origam/docs` | non (privé) | Documentation VitePress (références composants, intégrations). |
| `packages/tests` | `@origam/tests` | non (privé) | Runner de tests centralisé : `TU/` (Vitest, jsdom) + `e2e/` (Playwright e2e + a11y). |
| `packages/figma-plugin` | `@origam/figma-plugin` | non (privé) | Plugin Figma DS Sync (variables Figma ⇄ tokens origam). |

**Stratégie de versioning (décision β, cf. CLAUDE.md).** `packages/ds` suit le semver
historique `origam` (`2.5.x`). Les cinq autres packages sont `private: true` et versionnés
indépendamment (`0.x.y`) ; ils ne publient jamais sur npm. Le `release.yml` asserte
`git tag == packages/ds/package.json version` et publie **exclusivement** depuis
`packages/ds`.

**Frontière de dépendances inter-packages.** Le flux est unidirectionnel : `marketing`,
`stories`, `docs`, `tests` et `figma-plugin` **consomment** `origam` (via
`"origam": "workspace:*"`, protocole réécrit à la publication). `origam` ne dépend
d'aucun package interne — c'est la racine du graphe applicatif.

---

## 2. Structure interne de `packages/ds/src`

Le listing réel de `packages/ds/src` donne les dossiers de premier niveau suivants :

```
src/
  assets/        — feuilles de style + tokens générés (css/, scss/)
  components/    — Origam{PascalCase}.vue (≈ 95 familles + index.ts)
  composables/   — use{CamelCase}.composable.ts, rangés par domaine
  consts/        — *.const.ts (valeurs SCREAMING_SNAKE)
  directives/    — v-{kebab}.directive.ts
  enums/         — *.enum.ts
  interfaces/    — *.interface.ts (préfixe I), rangés par domaine
  nuxt/          — module Nuxt officiel (sous-export)
  services/      — *.service.ts
  themes/        — origam.theme.ts (identité par défaut, ROOT-scoped)
  types/         — *.type.ts (préfixe T)
  utils/         — *.util.ts
  origam.ts      — point d'entrée runtime : createOrigam()
  index.ts       — fichier vide (0 ligne — voir note)
  *.d.ts         — globals.d.ts, shims.d.ts, vite-env.d.ts (déclarations ambiantes)
```

> **Note `index.ts`** : le fichier `src/index.ts` existe mais fait **0 ligne** (vérifié :
> `wc -l` = 0). Le point d'entrée runtime effectif de la bibliothèque est `src/origam.ts`,
> référencé par l'export `.` du `package.json` (`"default": "./dist/src/origam.js"`). Les
> sous-exports (`./components`, `./composables`, …) pointent chacun vers le `index.js`
> généré du dossier correspondant. `index.ts` n'est donc pas le baril principal — c'est
> `origam.ts` qui expose `createOrigam`.

### Rôle de chaque dossier et conventions de nommage réelles

- **`components/`** — un dossier par famille de composant (`Btn/`, `Field/`, `DataTable/`,
  …), fichier `Origam{PascalCase}.vue`. Le listing montre ≈ 95 dossiers (de `Alert` à
  `Window`) plus un `index.ts` baril. Chaque composant a son pendant dans
  `packages/stories` (`Origam{Name}.story.vue`), `packages/docs`
  (`Origam{Name}.md`) et `packages/tests/e2e` (`{component}.spec.ts`).

- **`composables/`** — rangés **par domaine**, pas à plat. Le listing révèle des dossiers
  thématiques : `Commons/` (le socle transversal), `CssSupport/`, `Theme/`, `Form/`,
  `DataTable/`, `Mask/`, `Media/`, `Transition/`, etc. Convention de fichier :
  `{camelCase}.composable.ts` (ex. `border.composable.ts`, `cssSupport.composable.ts`).
  Chaque export est une fonction `use{CamelCase}()`.

- **`consts/`** — `{kebab-case}.const.ts`, valeurs en `SCREAMING_SNAKE_CASE`. Exemple réel
  consommé par le runtime : `BORDER_REGEX`, `DIRECTION_ARRAY` (importés dans
  `border.composable.ts`), `FEATURE_QUERIES` (dans `consts/CssSupport/css-support.const.ts`),
  et tous les `ORIGAM_*_KEY` (clés d'injection Vue) importés par `origam.ts`.

- **`directives/`** — directives Vue (`v-{kebab}.directive.ts`), agrégées dans un baril
  et installées en boucle par `createOrigam` (`for (const key in directives)
  app.directive(...)`).

- **`enums/`** — `{kebab-case}.enum.ts`, membres en `SCREAMING_SNAKE_CASE`.

- **`interfaces/`** — `{kebab-case}.interface.ts`, **préfixe `I`**, rangées par domaine
  miroir des composants (un dossier par composant) **plus** un dossier pivot `Commons/`.
  `Commons/` contient les surfaces de props transversales : `dimension.interface.ts`
  (`IDimensionProps`), `border.interface.ts` (`IBorderProps`), `color.interface.ts`,
  `margin.interface.ts` / `padding.interface.ts`, `rounded.interface.ts`,
  `elevation.interface.ts`, `density.interface.ts`, `size.interface.ts`,
  `location.interface.ts` / `position.interface.ts`, `state-effect.interface.ts`, etc.
  C'est la **single source of truth** des props cross-cutting (cf. §6).

- **`services/`** — `{kebab-case}.service.ts` (couche d'accès, périmètre exact non audité
  ici).

- **`types/`** — `{kebab-case}.type.ts`, **préfixe `T`** (ex. `TDirectionBoth`,
  `TModeResolved`, `TIntent`).

- **`utils/`** — `{kebab-case}.util.ts`. Helpers purs réutilisés partout (ex.
  `convertToUnit`, `mergeDeep`, `applyThemes`, `getUid`, `installedThemesFromList`,
  `formatBorderStylesVar`, `getCurrentInstanceName` — tous importés par `origam.ts` ou
  les composables Commons).

- **`themes/`** — `origam.theme.ts` exporte `origamTheme`, l'identité par défaut
  **ROOT-scoped** (sans `name` : light à `:root`, dark à `[data-mode="dark"]`). Elle est
  **toujours injectée en premier** par `createOrigam` (zéro-config baseline).

- **`nuxt/`** — sous-export module Nuxt officiel (cf. §3).

- **`assets/`** — `css/` (`main.css` + `tokens/` générés) et `scss/`
  (`main.scss`, `_helpers.scss`, `tokens/`). Voir §3 et §5.

---

## 3. Pipeline de build

### 3.1. Tokens d'abord (pré-requis obligatoire)

Le script `build` de `packages/ds` est :

```json
"build": "pnpm run tokens:build && unbuild"
```

Les **tokens sont reconstruits avant** chaque build de la lib. `tokens:build` exécute
`node scripts/build-tokens.mjs`, qui :

1. Câble **Style Dictionary v4** contre les sources Tokens Studio (DTCG) de `tokens/`.
2. Enregistre les transforms `@tokens-studio/sd-transforms` (résolution des alias
   `$value`/`$type`).
3. Enregistre un transform custom `origam/name/css` qui mappe un *path* de token vers le
   nom de variable CSS origam. La grammaire de nommage vit dans `scripts/token-name.mjs`,
   **source unique partagée** avec le util runtime `src/utils/Theme/token-name.util.ts`
   pour que les noms gelés dans les CSS publiés ne dérivent jamais des noms émis à
   l'exécution.
4. Détecte les composants par présence de `/component/` dans le `filePath` du token, et
   parse les IDs composés `<brand>-<mode>` (ex. `sobre-dark` → `{ brand: 'sobre', mode:
   'dark' }`) pour émettre des sélecteurs `[data-theme="<brand>"][data-mode="<mode>"]`.

Sorties (vérifiées par listing de `src/assets/css/tokens/` et les exports du
`package.json`) : un fichier CSS par thème×mode (`primitive.css`, `light.css`, `dark.css`,
`sobre-light.css`, `sobre-dark.css`, `apple-*`, `cartoon-*`, `ecom-*`, `editorial-*`,
`geek-*`, `glass-*`, `material-*`, `themes-all.css`), la feuille `origam-utilities.css`,
les partials SCSS miroir (`_primitive.scss`, `_light.scss`, …) et les types TS
(`dist/src/types/tokens.type.d.ts`).

Modes du script : `--watch` (rebuild sur changement de `tokens/**/*.json`), `--dry-run`
+ `--strict` (validation sans écriture, branché sur `tokens:lint`).

### 3.2. unbuild / mkdist (entrées, sorties)

Le bundling de la lib est piloté par **unbuild** (`build.config.ts`). Il n'utilise PAS le
rollup-stub d'unbuild mais **trois entrées `mkdist`** (transpilation fichier-à-fichier,
préservant l'arborescence) :

1. **SFC Vue** — `input: ./src`, `pattern: ['**/*.vue', '!**/*.story.vue']`, loader `vue`.
2. **TS → CJS** — toutes les `**/*.ts` sauf `*.story.ts`, `*.spec.ts`, `*.d.ts`,
   `__tests__/**`, `*.cy.ts`, `format: 'cjs'`, `ext: 'cjs'`.
3. **TS → ESM** — même filtre, `format: 'esm'`, `ext: 'js'`.

Options : `outDir: 'dist/src'`, `declaration: true` (émission des `*.d.ts`),
`sourcemap: true`, `clean: true`, `failOnWarn: false`.

`externals` : `['vue', 'vue-i18n', 'vue-router', '@mdi/font', '@nuxt/kit', '#app',
'nuxt', 'nuxt/app']` — ces modules ne sont jamais inlinés (cohérent avec les
`peerDependencies` `vue`/`vue-i18n`/`vue-router` du `package.json`, les deux derniers
`optional: true`).

**Hook `build:done`** (post-mkdist) — deux opérations critiques :

- **Copie des assets** : `src/assets` → `dist/src/assets` (récursif), et copie de
  `src/nuxt/module.d.ts` vers `dist/src/nuxt/`.
- **Restauration de `lang="ts"`** sur les SFC du dist : mkdist transpile le `<script
  setup>` en JS pur et **retire l'attribut `lang="ts"`**, mais laisse le `<template>`
  intact. Les expressions TS dans les bindings de template (`items!.length`,
  `(node as any).key`, …) deviendraient alors des erreurs de parse JS chez le consommateur.
  Le hook réécrit donc `<script setup>` en `<script lang="ts" setup>` (no-op pour le corps
  JS, mais réactive le parsing TS-aware du template côté consommateur). Il logge le nombre
  de SFC patchées.

### 3.3. Surface d'export du package

`package.json` → `exports` (carte vérifiée) :

- `.` → `{ scss, style, default }` : `dist/src/assets/scss/main.scss` (entrée SCSS),
  `dist/src/assets/css/main.css` (style), `dist/src/origam.js` (runtime).
- `./styles` → les feuilles CSS/SCSS principales.
- `./tokens/css/*` et `./tokens/scss/*` → feuilles de tokens par thème (primitive, light,
  dark, utilities, sobre-light, sobre-dark) ; `./tokens/types` → types de tokens.
- **Sous-exports par couche** : `./components`, `./components/*`, `./composables`,
  `./directives`, `./enums`, `./consts`, `./types`, `./interfaces`, `./services`,
  `./utils` — chacun vers le `index` généré de la couche, permettant le tree-shaking
  granulaire (`import { useBorder } from 'origam/composables'`).
- `./*` → fallback générique vers `dist/src/*`.

`files` publiés : `dist/src/`, `dist/tokens/`, `LICENSE`, `README.md`, `CHANGELOG.md`.

### 3.4. Sous-export Nuxt

`./nuxt` est exporté avec `types`/`import`/`require`/`default` pointant sur
`dist/src/nuxt/module.{d.ts,js,cjs}`. Le module (`src/nuxt/module.ts`, lu intégralement) :

- est un `defineNuxtModule<IOrigamNuxtModuleOptions>` (`@nuxt/kit`), `configKey: 'origam'`,
  compatible `nuxt: '^3.0.0 || ^4.0.0'` ;
- gère ses options en **deux régimes** : les scalaires (`defaultTheme`, `cookieName`,
  `prefix`, …) passent par `defu` (merge), les **tableaux** (`themes`, `modes`) suivent une
  sémantique **OVERRIDE** résolue manuellement dans `setup` (car `defu` concatène les
  tableaux, ce qui serait incorrect) ;
- injecte uniquement les feuilles **theme-invariantes** (`origam/tokens/css/primitive` en
  tête, `origam/tokens/css/utilities` en queue si `includeUtilities`) ; les blocs par marque
  sont injectés **à l'exécution** par les plugins client/serveur (`createOrigam({ themes })`),
  pas via des CSS pré-générés (ADR-004) ;
- enregistre `plugin.server` (mode server) et `plugin.client` (mode client) ;
- en auto-import : scanne `../composables` et ajoute chaque export nommé **sauf** la
  blocklist `useRoute`, `useRouter`, `useLink`, `useHydration` (qui collisionnent avec les
  composables natifs Nuxt et provoquaient `useRouter must be called from inside a setup
  function` au SSR) ; il évite donc volontairement `addImportsDir` ;
- déclare les composants via `addComponentsDir` (prefix `''`, `pathPrefix: false`).

`src/nuxt/index.ts` réexporte simplement `{ default } from './module'` + les types.

---

## 4. Principe CSS-first / JS-fallback (`useCssSupport`)

Le principe directeur du DS (cf. CLAUDE.md projet) est **CSS-first, JS-fallback** :
toute mise en page / dimensionnement / interaction visuelle s'exprime d'abord en CSS
moderne (`grid-template-areas`, `min()/max()/clamp()`, container queries, `:has()`,
`aspect-ratio`, `color-mix()`, `subgrid`) ; le JS n'est qu'un *fallback* quand le
navigateur cible ne supporte pas la fonctionnalité.

La couche de détection unique est **`useCssSupport()`**
(`src/composables/CssSupport/cssSupport.composable.ts`, lu intégralement). Points clés
vérifiés dans le code :

- **Une seule porte d'entrée** : aucun composant n'appelle `CSS.supports()` directement ;
  tout passe par le composable, ce qui garde la matrice auditable en un point.
- **Matrice centralisée** : `FEATURE_QUERIES` vit dans
  `consts/CssSupport/css-support.const.ts` (un literal `as const`). Le type
  `TCssFeatureName = keyof typeof FEATURE_QUERIES` en dérive ; ajouter une feature =
  éditer cette const.
- **Cache module-level** : `_cache: Map<string, boolean>` mémorise chaque réponse
  (le support navigateur ne change pas à l'exécution). `rawSupports(query)` renvoie `false`
  en SSR/non-browser (`typeof window === 'undefined' || typeof CSS === 'undefined'`),
  sinon `CSS.supports(query)` en try/catch.
- **Sûreté SSR** : `_flags` est un `ref` initialisé tout-à-false ; `ensureInitialized()`
  ne détecte qu'au premier appel **côté navigateur**. Pendant le SSR, tous les flags
  restent `false` (la branche JS-fallback est prise).
- **API publique** (`IUseCssSupport`) : `css` (Ref readonly de la map), `supports(query)`,
  `supportsAny(...)`, `supportsAll(...)`, `has(feature)` (ComputedRef pour template).
- **Variante anti-mismatch** : `useCssSupportClient(feature, { defaultValue })` retourne
  un `Ref<boolean>` qui démarre à `defaultValue` (SSR + 1er render client) puis flippe au
  vrai résultat dans `onMounted`. À utiliser quand le flag pilote du **markup** (`v-if`,
  `<component :is>`) ; `useCssSupport().css.value.X` suffit pour des branches *style-only*.
- Helper de test interne `_resetCssSupportCache()` (hors API publique).

---

## 5. Conventions classes-first (cycle v2.x)

Depuis v2.1, les composables transversaux émettent des **classes utilitaires** quand le
consommateur passe une valeur **tokenisée**, et retombent sur des **styles inline** pour
les valeurs **custom**. Les classes utilitaires (66 à l'origine) vivent dans
`src/assets/css/tokens/origam-utilities.css` (généré par Style Dictionary). Convention de
nommage : `.origam--{group}-{value}` avec **double-tiret** comme séparateur de racine
utilitaire (`.origam--color-primary`, `.origam--shadow-md`, `.origam--rounded-lg`,
`.origam--border-thin`).

### Strategy A — `*Classes` ET `*Styles` en parallèle

Chaque composable transversal refactoré retourne **les deux** canaux. Exemple vérifié
dans `border.composable.ts` :

- `borderClasses` (computed) : pousse `${name}--border`, et si la valeur est un mot-clé
  de largeur tokenisé (`'none' | 'thin' | 'thick'`, défini par le `Set` local
  `UTILITY_BORDER`), ajoute la classe utilitaire `origam--border-${border}`. Le booléen
  legacy `border === true` est mappé sur `origam--border-thin`.
- `borderStyles` (computed) : reste le chemin inline pour les valeurs free-form / custom.

Le contrat est : **valeur tokenisée → classe** (le `*Styles` correspondant est vide) ;
**valeur custom → style inline** (le `*Classes` est vide). Le composant **bind les deux**
(`:class="[..., borderClasses]"` ET `:style="[..., borderStyles]"`) — le canal vide est
inoffensif. Cette dualité permet aux composants de migrer à leur rythme sans casser les
consommateurs externes. La sortie `*Styles` sera retirée en **v3.0.0**.

Règles d'auteur (cf. CLAUDE.md projet) qui découlent de l'ordre de cascade géré dans
`main.scss` :

- Les utilities sont `@forward`-ées **après** les tokens (pour que `var(--origam-…)`
  résolve) et **avant** tout CSS scoped de composant. Vite place le `<style scoped>` après
  la feuille globale, donc à spécificité égale `(0,1,0)` la classe composant
  (`.origam-btn--variant-flat`) gagne sur l'utility (`.origam--bg-primary`) grâce à l'ordre
  source — comportement assumé.
- **Surface BEM enfant, jamais la racine teleportée** pour les composants flottants
  (Menu, Tooltip, Picker, Snackbar, Badge) : la classe utilitaire va sur l'élément qui
  porte la surface visible (`__content`, `__pill`, `__wrapper`).
- **Styling dépendant de l'état → inline** : `useColorEffect` renvoie `colorClasses = []`
  quand `isHover`/`isActive`/`isDisabled` (les utilities sont statiques par design).

---

## 6. Layering & flux de dépendances internes

Le flux de dépendances à l'intérieur de `packages/ds/src` est **strictement
unidirectionnel**, des primitives de typage vers les composants :

```
types/            (T*, valeurs scalaires)
   ↓
interfaces/       (I*, formes de props ; les interfaces composent les types)
   ↓
consts/ enums/    (valeurs SCREAMING_SNAKE consommées par la logique)
   ↓
utils/            (helpers purs, sans dépendance Vue lourde)
   ↓
composables/      (logique métier ; consomment interfaces + consts + utils)
   ↓
components/       (SFC ; consomment composables + interfaces ; templates « wireframe »)
   ↓
origam.ts         (createOrigam : assemble components + directives + thème + providers)
```

Vérifié sur des cas réels : `border.composable.ts` importe ses `consts`
(`BORDER_REGEX`, `DIRECTION_ARRAY`), ses `interfaces` (`IBorderProps`), ses `types`
(`TDirectionBoth`) et ses `utils` (`convertToUnit`, `formatBorderStylesVar`, …) — jamais
l'inverse. `origam.ts` importe `./components`, `./composables`, `./consts`,
`./directives`, `./interfaces`, `./types`, `./utils` et `./themes` pour les agréger.

### Règle de réutilisation des Commons (mandatoire)

Avant de déclarer une prop sur l'interface d'un composant, il faut **auditer
`src/interfaces/Commons/*`** : si la surface existe déjà, on `extends`. Et on consomme
la valeur via le composable Commons correspondant — jamais de parser maison.

| Surface | Interface Commons à `extends` | Composable de consommation |
|---|---|---|
| Dimensions (`height`, `width`, `min/maxHeight`, `min/maxWidth`) | `IDimensionProps` | `useDimension(props).dimensionStyles` |
| Spacing (`margin*`, `padding*`) | `IMarginProps` / `IPaddingProps` | `useMargin` / `usePadding` |
| Couleur | `IColorProps` | `useColor` / `useBackgroundColor` / `useTextColor` / `useColorEffect` |
| Border / rounded / elevation | `IBorderProps` / `IRoundedProps` / `IElevationProps` | `useBorder` / `useRounded` / `useElevation` |
| Density / size | `IDensityProps` / `ISizeProps` | `useDensity` / `useSize` |
| Location / position | `ILocationProps` / `IPositionProps` | `useLocation` / `usePosition` |

`IDimensionProps` (lu) déclare exactement `height`, `maxHeight`, `maxWidth`, `minHeight`,
`minWidth`, `width` (tous `number | string`). Les deux bugs que cette règle prévient :
(1) **surfaces à moitié implémentées** (un composant déclare `height` mais ignore
`maxHeight`, donc `maxHeight="50vh"` est silencieusement ignoré) ; (2) **drift** (un
parser maison qui rate un cas que `convertToUnit` gère — nombre → `Npx`, longueur CSS,
ref de custom-property, raccourci `aspect-ratio`). La même règle vaut pour les
composables : si `useFoo` fait le travail, on l'importe au lieu de recréer `useBar`.

---

## 7. Conventions transverses

### Nommage (fichiers / identifiants)

| Couche | Pattern fichier | Identifiant |
|---|---|---|
| Composants | `Origam{PascalCase}.vue` | nom PascalCase |
| Composables | `{camelCase}.composable.ts` | `use{CamelCase}()` |
| Interfaces | `{kebab-case}.interface.ts` | préfixe **`I`** (`IBorderProps`) |
| Types | `{kebab-case}.type.ts` | préfixe **`T`** (`TIntent`, `TModeResolved`) |
| Enums | `{kebab-case}.enum.ts` | membres `SCREAMING_SNAKE_CASE` |
| Consts | `{kebab-case}.const.ts` | `SCREAMING_SNAKE_CASE` (`FEATURE_QUERIES`, `ORIGAM_*_KEY`) |
| Directives | `v-{kebab}.directive.ts` | — |
| Utils | `{kebab-case}.util.ts` | helpers purs |

CSS variables component-local : `--origam-{component}---{property}` (**triple-tiret** entre
bloc et propriété) ; variantes d'état : `--origam-{component}--{state}---{property}`
(**double-tiret**).

### Règle ESLint structurante (`no-restricted-imports`)

`eslint.config.js` (lu) impose un garde-fou critique sur `src/**` :

- **Interdiction d'utiliser l'alias `@origam` / `@origam/*` dans `src/`.** mkdist garde
  les imports verbatim : une fois publié, `@origam/*` ne peut pas être résolu par les
  consommateurs et la lib casse à l'exécution. Dans `src/`, on n'utilise que des chemins
  **relatifs** (`../../components`, `../utils`). L'alias n'est toléré que dans `stories/`
  et `docs/`.
- Les alias `@stories`, `@docs`, `@cypress` sont **interdits** dans `src/` (outillage dev
  uniquement, fuiraient des chemins externes dans le bundle publié).

Autres réglages notables : `vue/no-template-shadow` en `warn` avec whitelist
(`props`, `id`, `model`, `ref`, `max`, `isActive`, `isSelected`), `no-unused-vars` avec
pattern d'ignore `^_`. Les dossiers `stories/`, `**/dist`, `**/.nuxt/**`,
`figma-plugin/**`, caches VitePress sont ignorés du lint.

### `withDefaults()` — literals inline obligatoires

Le compilateur SFC Vue 3 analyse statiquement
`withDefaults(defineProps<T>(), {…})` à la compilation. Les valeurs de défaut **doivent
être des literals inline** (`'div'`, `42`, `true`, `() => ({})`). Référencer une propriété
d'un objet `as const` importé (`XXX_DEFAULTS.tag`) n'est PAS résoluble statiquement : le
compilateur émet des défauts `undefined` et le proxy `props` devient `undefined` au premier
accès réactif. La const `XXX_DEFAULTS` reste exportée (pour l'itération côté story) mais
n'est **jamais** référencée dans `withDefaults`. La règle s'applique à tout composant
utilisant `withDefaults`.

### Sync story + doc + spec (mandatoire)

Toute PR qui ajoute / renomme / retire une prop / slot / emit doit mettre à jour, **dans
le même commit**, le `.story.vue` (`packages/stories`), le `.md` (`packages/docs`) et le
`.spec.ts` Playwright (`packages/tests/e2e`). Structure canonique de story imposée :
Variant `"Default"` (playground) → Variants de props groupées (`Prop — …`) → Variants de
slots (`Slot — …`) → Variants d'emits (`Emit — …`). Chaque nouvelle story livre un spec
Playwright qui exerce chaque prop et asserte un changement de style/classe runtime.

---

## 8. Graphe de dépendances global (texte)

```
                          ┌─────────────────────────────────────────────┐
                          │  Workspace racine (package.json, private)    │
                          │  pnpm@9.15.0 · Node ≥22 · vue pinned 3.5.35   │
                          │  scripts délèguent via `pnpm -F <pkg>`        │
                          └───────────────────────┬─────────────────────┘
                                                  │ pnpm-workspace.yaml: packages/*
        ┌──────────────┬──────────────┬───────────┼──────────────┬───────────────────┐
        │              │              │           │              │                   │
        ▼              ▼              ▼           ▼              ▼                   ▼
 ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌────────────┐ ┌────────────────┐
 │ packages/  │ │ marketing  │ │  stories   │ │  docs    │ │  tests     │ │ figma-plugin   │
 │   ds       │ │ @origam/…  │ │ @origam/…  │ │ @origam/…│ │ @origam/…  │ │ @origam/…      │
 │ (origam)   │ │ Nuxt 4     │ │ Histoire   │ │ VitePress│ │ Vitest +   │ │ Figma DS Sync  │
 │ PUBLIÉ npm │ │ + 7 brands │ │ ~208 specs │ │          │ │ Playwright │ │                │
 └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └────┬─────┘ └─────┬──────┘ └───────┬────────┘
       │              │              │             │             │                │
       │ publie       └──────────────┴─────────────┴─────────────┴────────────────┘
       │ (npm: origam)        consomment `origam` via "origam": "workspace:*"
       ▼
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ packages/ds — graphe interne (sens des dépendances : haut → bas)                   │
 │                                                                                    │
 │   tokens/ (Tokens Studio JSON, DTCG)                                               │
 │      │  scripts/build-tokens.mjs  (Style Dictionary v4 + sd-transforms)            │
 │      ▼  émet → assets/css/tokens/*.css, assets/scss/tokens/*.scss, types tokens    │
 │   assets/ (main.css, main.scss → @forward primitive→light→dark→utilities→helpers)  │
 │                                                                                    │
 │   types/  ──►  interfaces/  ──►  consts/ enums/  ──►  utils/  ──►  composables/     │
 │                    │ Commons/ = source unique des props transversales              │
 │                    │ (IDimensionProps, IBorderProps, IColorProps, …)               │
 │                    ▼                                                                │
 │   composables/  ── useCssSupport (porte unique CSS.supports) + Commons (useBorder, │
 │                     useDimension, useColor… → *Classes / *Styles, Strategy A)      │
 │                    ▼                                                                │
 │   components/  ── Origam*.vue (templates « wireframe », logique dans composables)  │
 │                    ▼                                                                │
 │   origam.ts ── createOrigam() : install components + directives, applyThemes,      │
 │                providers (ORIGAM_*_KEY), origamTheme ROOT-scoped injecté en 1er    │
 │                    │                                                                │
 │   nuxt/module.ts ── sous-export Nuxt : plugins client/server, auto-import          │
 │                     composables (blocklist Nuxt-core), CSS theme-invariant only    │
 │                                                                                    │
 │   unbuild (build.config.ts) : 3 entrées mkdist (Vue SFC, TS→CJS, TS→ESM)           │
 │                     + hook build:done (copie assets, restaure lang="ts")           │
 │                     → dist/src/  → exports . / ./components / ./composables / …     │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Tableau récapitulatif des couches

| Couche | Emplacement | Convention | Dépend de | Consommée par | Notes |
|---|---|---|---|---|---|
| **Workspace** | racine | `package.json` privé, `pnpm-workspace.yaml` | — | les 6 packages | Node ≥22, pnpm 9.15.0, vue pinné 3.5.35 |
| **Tokens** | `ds/tokens/` + `scripts/` | DTCG JSON, Style Dictionary v4 | — | assets, runtime themes | pré-requis du build (`tokens:build && unbuild`) |
| **Assets** | `ds/src/assets/{css,scss}` | `main.css`/`main.scss`, `tokens/`, `_helpers.scss` | tokens | composants, consommateurs | ordre `@forward` : primitive→light→dark→utilities→helpers |
| **Types** | `ds/src/types/` | `*.type.ts`, préfixe `T` | — | interfaces, composables | scalaires (`TIntent`, `TModeResolved`) |
| **Interfaces** | `ds/src/interfaces/` (+ `Commons/`) | `*.interface.ts`, préfixe `I` | types | composables, composants | `Commons/` = source unique des props transversales |
| **Consts / Enums** | `ds/src/{consts,enums}/` | `SCREAMING_SNAKE_CASE` | types | composables, runtime | `FEATURE_QUERIES`, `ORIGAM_*_KEY` |
| **Utils** | `ds/src/utils/` | `*.util.ts`, helpers purs | types, consts | composables, runtime | `convertToUnit`, `mergeDeep`, `applyThemes` |
| **Composables** | `ds/src/composables/` (par domaine) | `use*()`, `*.composable.ts` | interfaces, consts, utils | composants | `useCssSupport` (CSS-first) ; Commons → `*Classes`/`*Styles` |
| **Directives** | `ds/src/directives/` | `v-{kebab}.directive.ts` | utils | runtime | installées en boucle par `createOrigam` |
| **Composants** | `ds/src/components/` | `Origam{PascalCase}.vue` | composables, interfaces | runtime, consommateurs | ≈ 95 familles ; template « wireframe » |
| **Themes** | `ds/src/themes/` | `origam.theme.ts` | tokens | runtime | identité par défaut ROOT-scoped, injectée en 1er |
| **Runtime** | `ds/src/origam.ts` | `createOrigam()` | toutes les couches ci-dessus | consommateurs | providers, install components/directives |
| **Nuxt** | `ds/src/nuxt/` | `defineNuxtModule`, sous-export `./nuxt` | runtime | apps Nuxt | plugins client/server, auto-import filtré |
| **Build** | `ds/build.config.ts` | unbuild + 3 entrées mkdist | tout `src/` | npm `dist/` | hook `build:done` (assets + `lang="ts"`) |

---

*Source de vérité : lecture directe du code/config au commit courant de la branche
`feature/marketing-v5-phase1`. Tout point non vérifiable a été signalé explicitement.*
