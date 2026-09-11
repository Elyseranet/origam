# ROADMAP — origam Design System

> Référentiel : `origam@2.6.0` (dernière version publiée, Wave 4 incluse).
> Stack : Vue 3.5 + TypeScript, distribution ESM via `unbuild`,
> tokens DTCG (Tokens Studio + Style Dictionary v4),
> 78 familles de composants, 13+ composables transversaux.
>
> Cette roadmap mélange deux volets :
> - **Stratégie & adoption** — positionnement, cibles, marketing, KPI, risques.
> - **Technique** — outillage, tests, v3.0, infrastructure.
>
> Tout est négociable. Reprends ce qui te parle, supprime ce qui ne te parle pas.

---

## Où on en est (post-2.6.0)

- ✅ Sortie publique sur npm, tarball 869 kB, 0 vuln critique.
- ✅ Pre-delivery automatisé via `prepublishOnly` (tokens + build + 220 TU).
- ✅ README correct, CHANGELOG à jour.
- ✅ **Monorepo migration completed (mai 2026)** — 6 packages pnpm workspace
  (`ds`, `marketing`, `stories`, `docs`, `tests`, `figma-plugin`). La lib publie
  toujours sous `origam` depuis `packages/ds/`. Voir
  [`MONOREPO_PROPOSAL.md`](./MONOREPO_PROPOSAL.md) pour le rationnel.
- ❌ Pas de doc en ligne. Pas de stories déployées. Pas de communauté.
- ❌ CI = Qodana scan + tokens-sync seulement. Pas de pipeline lint/test/build/publi.
- ❌ Coverage Playwright partielle (~100 specs pour 161 stories).
- ❌ Pas de bundle-size monitoring. Pas d'audit a11y systématique.

---

# Partie 1 — Stratégie & Adoption

## 1.1 — Positionnement & différenciation

### Tableau comparatif Vue 3 DS

| Critère | **origam** | Vuetify 3 | PrimeVue | Naive UI | shadcn-vue | Radix Vue |
|---|---|---|---|---|---|---|
| Composants | ~80 familles | ~90 | ~100 | ~80 | ~50 | ~30 (primitifs) |
| Tokens Studio natif | ✅ DTCG | ❌ | ❌ | ❌ | ❌ | ❌ |
| Multi-thème runtime | ✅ `data-theme` | Partiel (Material You) | ✅ | Partiel | ❌ | ❌ |
| CSS-first + fallback JS | ✅ `useCssSupport` | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tree-shaking propre | ✅ `sideEffects` | Partiel | ✅ | ✅ | ✅ | ✅ |
| Communauté | ❌ (v0) | Très large | Large | Moyenne | Croissante | Petite |
| Doc en ligne | ❌ pas encore | ✅ | ✅ | ✅ | ✅ | Partielle |
| ARIA / a11y | Partiel | Partiel | Bon | Moyen | Bon | Excellent |
| Figma sync natif | ✅ Tokens Studio | ❌ | ❌ | ❌ | ❌ | ❌ |

### 3 USP concrets

1. **Pipeline Figma → code natif via Tokens Studio.** Seul DS Vue 3 à consommer
   du DTCG directement (Style Dictionary v4 en build step). Une équipe qui
   gère son DS dans Figma synchronise couleurs / espacements / radii sans
   mapping manuel. Aucun concurrent ne propose ça out-of-the-box.
2. **CSS-first avec fallback JS documenté.** `useCssSupport()` centralise la
   feature-detection (container queries, `:has()`, `subgrid`, `color-mix`,
   `view-transition`). Choix d'architecture délibéré, rare dans l'écosystème,
   auditable dans le code.
3. **Thème multi-marque sans rebuild.** `<html data-theme="brand-x">` +
   `<OrigamThemeProvider>` permet plusieurs marques sur la même page. Vuetify
   et PrimeVue offrent le dark mode, pas le multi-tenant en runtime.

### Ce qu'il ne faut pas survendre

- L'a11y n'est pas encore le point fort — Radix Vue est supérieur.
- Pas d'écosystème encore — ne pas prétendre à une communauté.
- Stories Histoire pas déployées en ligne — ne pas renvoyer vers du vide.

### Elevator pitch (1 ligne)

> **origam** — the Vue 3 design system for teams who design in Figma Tokens
> Studio and ship in TypeScript: 80+ components, multi-brand theming at
> runtime, CSS-first with zero config.

## 1.2 — Cibles & cas d'usage

### Public early-adopter

- **A — Équipes design-driven avec Tokens Studio.** Agence / studio 3–15 pers,
  stack Vue 3 + Nuxt. Sentent la valeur dès le premier `tokens:build`.
- **B — Apps internes multi-tenant.** Backoffice, portails clients, SaaS
  white-label. Le multi-thème runtime est leur killer feature.
- **C — Solo devs qui fuient Vuetify.** Vuetify impose Material et pèse lourd.
  origam est plus léger (869 kB tarball), visuellement agnostique.

### À exclure (savoir dire non)

- Projets qui veulent une réponse StackOverflow immédiate → PrimeVue / Vuetify.
- Équipes sans compétences CSS / tokens → shadcn-vue.
- Apps RGAA / WCAG AA strict certifiables → tant que les tests ARIA ne sont
  pas systématiques, ne pas se positionner sur ce marché.
- Vue 2 / Nuxt 2 → pas de compat descendante.

## 1.3 — Adoption — phases temporelles

### Q3 2026 (0–3 mois) — Visibilité initiale

| Action | Priorité | Effort |
|---|---|---|
| Déployer VitePress sur Vercel (`origam.dev`) | P0 | S |
| Déployer Histoire (sous-domaine `stories.origam.dev`) | P0 | S |
| Badge "downloads/week" npm sur le README | P1 | XS |
| Post de lancement dev.to ("Building a CSS-first Vue 3 DS with Tokens Studio") | P1 | M |
| Soumission à Vue.js Newsletter (15 000+ abonnés) | P1 | XS |
| Show HN "origam — Vue 3 DS with Tokens Studio DTCG pipeline" | P1 | S |
| Fil Mastodon / X avec `#VueJS #DesignSystem` | P2 | XS |
| Template starter "Nuxt 4 + origam" sur GitHub | P1 | M |

### Q4 2026 / Q1 2027 (3–6 mois) — Construction communauté

- Ouvrir **GitHub Discussions** (pas de Discord avant 50 utilisateurs actifs —
  Discord vide est pire que rien).
- **Changelog newsletter mensuel** via Buttondown.email (gratuit ≤ 1 000
  abonnés, format texte). Un mail par mois : ce qui a changé / ce qui arrive /
  composant à la une.
- `CONTRIBUTING.md` : setup local en 5 commandes, conventions de nommage,
  process PR, templates d'issue.
- `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1).
- Template starter "Vite + origam" (SPA pure).
- **Première démo prod publique** — petite app (dashboard ou formulaire
  multi-étapes) hébergée, pour prouver que ça marche hors stories.

### H1 2027+ (>6 mois) — Durabilité

- **Open Collective / GitHub Sponsors** si > 500 downloads/sem. Pas avant.
- **Conférences** — talk "CSS-first design systems with Tokens Studio" pour
  VueJS Paris ou VueConf US. Angle différenciant indépendant de la taille
  communauté.
- **Recrutement co-maintainer** via Discussions + réseau Vue. Bus factor = 1
  est le risque existentiel.
- Page "**who uses origam**" alimentée par formulaire Google Form.
- **Audit a11y tiers** (Deque axe) sur les 20 composants les plus utilisés.

## 1.4 — KPI à suivre

| KPI | Source | Fréquence | Seuil alerte |
|---|---|---|---|
| Downloads npm hebdo | npmjs.com/package/origam | Hebdo | < 10/sem = stagnation |
| Étoiles GitHub (delta mensuel) | GitHub API | Mensuel | < 5/mois après 6 mois |
| Ratio issues fermées / totales (30j roll) | GitHub Issues | Mensuel | < 50 % = backlog gonfle |
| Contributors externes | GitHub Insights | Par release | 0 après 6 mois = guide à revoir |
| Abonnés newsletter | Buttondown dashboard | Mensuel | < 20 après 3 mois |
| Mentions qualifiées (X / Mastodon / Reddit) | Alerts F5bot, Google Alerts | Hebdo | 0/mois après Q3 = lancement raté |
| Time-to-first-PR externe | GitHub | One-shot | > 120 j = barrière trop haute |

## 1.5 — Risques & mitigations

### R1 — Concurrence Vuetify 3 / PrimeVue (proba élevée, impact élevé)

Ne pas se battre sur la volumétrie. Niche : **Tokens Studio + multi-brand**.
Un article ciblé ("Why we moved from Vuetify to origam for our white-label
platform") vaut 10 tweets génériques.

### R2 — Bus factor 1 (proba certaine, impact critique)

Documenter l'architecture (CLAUDE.md couvre déjà bien). Chercher un
co-maintainer dès 20 stars. Ouvrir des "good first issue" labelisées dès Q3.
Publier un "maintenance status" honnête dans le README.

### R3 — Breaking change v3.0 perd les early adopters (proba certaine, impact moyen-élevé)

Annoncer dès maintenant la v3.0 dans la doc avec timeline indicative.
Publier `docs/migration/v2-to-v3.md` AVANT de tagger v3.0. Fournir un codemod
`origam-migrate` si la migration est mécanique.

### R4 — Doc insuffisante bloque l'adoption (proba certaine, impact élevé)

Déploiement VitePress + Histoire = P0 absolu avant tout effort marketing.
Chaque composant : props listées, exemple minimal, screenshots 3 thèmes.

### R5 — Pas de track record prod (proba certaine, impact moyen)

Construire et publier une app de démo réelle (pas Storybook — vraie app avec
routes, formulaires, navigation, dark mode). Documenter chaque projet (perso
ou pro) où origam est utilisée — un seul suffit à casser le "zéro référence".

---

# Partie 2 — Technique

## 2.1 — Court terme (Q3 2026)

### 🔴 SonarQube — quality gate « A » partout, zéro dette **(PRIORITÉ, M)**
Le scan SonarQube est déjà branché (`build.yml` → `SonarSource/sonarqube-scan-action@v4`,
`sonar-project.properties` avec `projectKey`/`sources`/`tests`) mais incomplet.
À finir pour atteindre une note **A** sur les 4 axes (Reliability, Security,
Security Review, Maintainability) et **0 dette technique** :

- **Câbler la couverture des TU** : les tests Vitest émettent déjà du `lcov`
  (`packages/tests/vitest.config.ts` → `reporter: ['text','lcov']`), mais
  Sonar ne le lit pas. Générer le rapport en CI (`test:unit:run --coverage`)
  et le déclarer via `sonar.javascript.lcov.reportPaths=…/coverage/lcov.info`
  pour que la **couverture soit prise en compte** dans la quality gate.
- **Activer la quality gate bloquante** : décommenter / ajouter
  `SonarSource/sonarqube-quality-gate-action@v1` dans le workflow pour que le
  build échoue si la gate n'est pas verte (sinon le scan est purement
  informatif).
- **Résorber toute la dette** : traiter les bugs, vulnérabilités, security
  hotspots et code smells remontés jusqu'à **A** sur chaque axe et **0**
  issue ouverte ; régler les éventuels doublons (`Duplications`) et la
  couverture sous le seuil. Exclure proprement le code généré (tokens,
  `.nuxt`, dist) de l'analyse pour ne pas polluer le ratio.
- **Lier au CI principal** : faire tourner le scan sur PR (pas seulement sur
  push `develop`) avec le bon `sonar.pullrequest.*`, et l'ajouter aux
  pre-delivery checks.

### 🔴 CI E2E — job annulé en boucle (timeout 30 min) **(PRIORITÉ, M)**
Le job `E2E tests (Playwright / Chromium)` de `ci.yml` est **cancelled à
chaque run** (les 5 autres jobs passent). Il dépasse systématiquement son
`timeout-minutes: 30`, même réduit au sous-ensemble vert (`E2E_GREEN_ONLY`).
- **Cause** : le `webServer` Playwright lance `pnpm -F @origam/stories dev`
  (Histoire en mode Vite **dev**). Vite **compile chaque story à la demande**
  au premier accès → cold-start mesuré à **19-30 s par story** en local, encore
  pire sur un runner GitHub froid. Cumulé sur les specs, le job explose les
  30 min. Ce n'est pas un bug GitHub mais une incompatibilité dev-server/CI.
- **Décision à trancher** :
  - **Corriger (recommandé)** : faire pointer le `webServer` e2e sur le
    **build statique** de Histoire (déjà produit par `build:embeds` →
    `packages/marketing/public/stories`, servi via un `http-server`/`serve`).
    Plus de cold-start Vite → e2e rapide et déterministe en CI. Réutilise
    l'artefact `marketing-embeds` du job `build-embeds`.
  - **OU retirer/dé-bloquer** : sortir e2e de la CI bloquante (job
    `continue-on-error` ou workflow manuel/nightly séparé) tant que le point
    précédent n'est pas fait, pour ne pas laisser la CI rouge en permanence.
- Lié à la réparation en cours de la suite e2e (migration vers le format de
  story unifié, sous-ensemble vert qui grandit vague par vague).

### CI/CD GitHub Actions complète **(L)**
- Workflow `ci.yml` (lint + `tokens:lint` + `test:unit` + `test:e2e` +
  `server:build`) sur PR/push, matrice Node 22 / 24.
- Workflow `release.yml` (déclenché sur tag `v*` → `npm publish --provenance`
  + GitHub Release auto depuis CHANGELOG).
- Bloque toute confiance dans les releases suivantes.

### Déploiement Histoire + VitePress **(M)**
- `pages.yml` build + déploiement GitHub Pages (`/`=VitePress,
  `/story/`=Histoire). Ou Vercel pour preview-deploy sur chaque PR.
- Bloque l'adoption externe.

### Coverage Playwright complète — test-as-you-build retro **(XL)**
- ~60 composants sans garde-fou e2e (violation explicite CLAUDE.md).
  Consolidation des `*-debug.spec.ts` en suite systématique.
- Cible : 100 % composants publics, un spec par composant avec Variants +
  props exercées.
- Bloque la confiance pour v3 (Strategy B impossible à valider sans baseline).

### Audit & consolidation de la suite TU **(M)**
- Convention `tests/unit/{Domain}/{name}.spec.ts` (actuellement éparpillés
  dans `src/**/__tests__/`). Mock `CSS.supports`, jsdom.
- Cible : 70 % branches sur `src/composables/Commons/`.

### Audit a11y des overlays **(M)**
- Dialog / Menu / ContextualMenu / Tooltip / Drawer / Sheet / Snackbar →
  focus trap, restitution du focus, `aria-modal`, `Esc`.
- `@axe-core/playwright` intégré dans `test:e2e`. Doc d'accessibilité par
  composant.

### Bundle-size monitoring **(S)**
- `size-limit` + `@size-limit/preset-big-lib` sur chaque sous-export.
- `size-limit-action` commente automatiquement les PR.
- Le bond 5.6 MB → 869 kB en 2.2.0 doit rester un acquis.

### API audit pré-v3 **(L)**
- Tableau exhaustif des deprecations dans `docs/migration/v2-to-v3.md`.
- Compléter les `@deprecated` manquants (notamment `color="#hex"`).
- Codemod `origam-codemod` (jscodeshift) pour les renames mécaniques.

### Renovate / Dependabot **(S)**
- `renovate.json` avec policies `groupSlug` (vue-*, vitest+vite, eslint).
- Auto-merge des patch devDeps. PR hebdo groupée pour les minor.
- Surveille `histoire@1.0.0-beta.1` pour la sortie de la stable.

## 2.2 — Moyen terme (Q4 2026 / Q1 2027)

### v3.0.0 — Strategy B applied **(XL)**
- Retire les `*Styles` returns quand la valeur est tokenisée. Classes
  utilitaires deviennent la seule API.
- Refacto des 13 composables transversaux. CHANGELOG BREAKING détaillé.
  Codemod fourni.
- Gain : ~2× moins de calcul reactif, hydratation plus légère.

### Modularisation du DS — entry-points par domaine **(XL, v3+)**

> Demande mainteneur (juin 2026). **Objectif : un bundle de base plus léger** —
> l'app n'importe (et ne paie) que les modules qu'elle utilise.

Découper la lib publiée en **modules / sub-exports tree-shakables** par domaine, au
lieu d'un point d'entrée unique massif :
- **`origam/core`** — fondations : Btn, Card, Icon, Layout/Grid, Divider, tokens,
  thème, directives + composables transversaux (color/size/elevation/rounded/border…).
  Dépendance commune à tous les autres modules.
- **`origam/form`** — champs & formulaires : TextField, Textarea, Select, Checkbox,
  Switch, Radio, Slider, NumberField, PasswordField, OtpInput, RatingField, FileField,
  ColorPicker, DatePicker, Form, validation, **AddMore** (cf. spec ci-dessous).
- **`origam/chart`** — toute la famille `OrigamChart*` (la plus lourde : SVG + maths),
  isolée pour ne JAMAIS peser sur une app sans graphes.

Autres modules candidats (à valider) :
- **`origam/data`** — DataTable, DataList, List, Treeview, Table, Pagination, VirtualScroll.
- **`origam/overlay`** — Dialog, Drawer, Menu, ContextualMenu, Tooltip, Sheet, Picker.
- **`origam/feedback`** — Alert, Snackbar, Badge, Progress, Skeleton, EmptyState.
- **`origam/media`** — Audio, Video, Img, Carousel, Parallax.
- **`origam/nav`** — Breadcrumb, Tabs, Stepper, BottomNav, Toolbar, SystemBar.
- Le module **`origam/nuxt`** reste un sub-export à part (cf. Module Nuxt officiel).

Mise en œuvre : entrées multiples `unbuild` (`build.config.ts`) + `exports` map dans
`package.json` (`origam`, `origam/core`, `origam/form`, `origam/chart`, …), `sideEffects`
propre, CSS scindé par module. Le barrel global `origam` reste exporté (rétro-compatible).
Doc de migration + mesure du gain bundle par module (lien : Bundle-size monitoring).
**Structurant / breaking de packaging → aligné v3.**

### Module Nuxt officiel **(L)**
- `@origam/nuxt` : auto-import composants + composables, plugin theme
  SSR-safe (cookie + `prefers-color-scheme` côté Node), injection auto des
  feuilles `tokens/css/{theme}.css`, option `themes: [...]`.
- Cible adoption A + B.

### Sécurisation SSR de `useCssSupport` **(M)**
- Pendant SSR tous les flags sont `false` → hydration mismatch potentiel.
- Wrapper `<ClientOnly>` automatique OU helper `useCssSupportClient()` avec
  suspense. Test Playwright `--no-js` pour le fallback serveur.

### Multi-thème avancé (a11y media queries) **(M)**
- Tokens semantic `motion.duration.*` (auto `0ms` si `prefers-reduced-motion`),
  `color.contrast.*` (auto ramp high-contrast).
- Génération CSS via `@media (prefers-*) { :root {…} }`.

### Animation system unifié **(M)**
- `tokens/semantic/motion.json` (durations, easings, named transitions).
- `useTransition` retravaillé : tokens + `document.startViewTransition` si
  `css.value.viewTransitions === true`.

### Directive `v-background` — fonds composables **(L)**
- Directive pour poser facilement un (ou plusieurs) **fond** sur n'importe quel
  élément : image (`url(...)`) **ou** dégradé de couleur (réutilise le gradient
  support de Wave 4 : intents tokenisés + valeurs custom).
- Contrôles par couche : **position** (`center`, `top left`, `x% y%`…),
  **taille** (`cover`, `contain`, `auto`, dimensions explicites), **répétition**,
  **attachment**, et un **masque** simple (`mask-image` / `-webkit-mask` :
  fondu, forme, gradient de masque) pour révéler/atténuer le fond sans CSS manuel.
- **Multi-fonds** : accepter un tableau de couches. Chaque couche se matérialise
  soit en **pseudo-élément** (`::before` / `::after`, défaut — zéro nœud DOM en
  plus), soit en **`<div>` injectée** (quand `::before`/`::after` sont déjà pris,
  ou qu'on veut un fond animable/interactif indépendant). Le mode est un réglage
  de la config de la directive (ex. `v-background="{ layers: [...], as: 'pseudo' | 'element' }"`).
- CSS-first (empilement de `background-image` + `mask`), JS uniquement pour
  l'injection de div et l'ordre des couches. SSR-safe. Pense a11y :
  fonds purement décoratifs → `aria-hidden` sur les nœuds injectés.

### TextMask — contour (stroke) et fill colorés **(M)**
- Étendre `OrigamTextMask` (aujourd'hui : texte transparent révélant un fond,
  cf. Wave 4 « Text-mask transparent reveal ») avec un mode **texte ajouré** :
  `color: transparent` + **contour de chaque lettre** coloré via
  `-webkit-text-stroke` (width + color), et/ou un **fill** distinct.
- Permet les effets de titraille « outline only », « fill + stroke contrastés »,
  « stroke dégradé » (combiné au gradient support). Props envisagées :
  `stroke` (largeur), `strokeColor` (intent tokenisé ou custom), `fill`
  (intent / `transparent`). Fallback : si `-webkit-text-stroke` non supporté
  (`useCssSupport`), rendu plein classique.
- A11y : le texte reste du **vrai texte** (sélectionnable, lisible lecteur
  d'écran) — pas de SVG `<text>`, contrairement à la spec « SVG text masque »
  (cf. intent `ghost`, livrable A). Contraste à surveiller via `v-contrast`.

### Compléter le Theme Builder `/theming` (marketing) **(L)**
- La page `/theming` du site marketing (éditeur visuel → export `[name].ts`
  avec `{ defaults, theme: { cssVars } }`) est livrée **en V1 partielle** :
  ~14 composants du set core seulement, tokens plafonnés à 24/composant,
  certains composants non prévisualisables (modals, `tabs` slot-driven).
- **À finir** : couvrir **tous** les composants éditables (pas juste le core),
  gérer les composants slot-driven / overlay (preview avec contenu de démo),
  lever le cap de tokens, et **refondre l'UI** (l'ergonomie actuelle « n'est
  clairement pas bonne » — navigation entre composants, regroupement des
  contrôles, lisibilité de la preview vs panneau, aperçu du fichier généré).
- Reste data-driven (dérivé des métadonnées de composants) pour scaler ;
  DS-first ; i18n complet.

### Waves livrées ✅

**Wave 1 — Nouveaux composants** (livrée — develop)

| Composant | Status | Note |
|---|---|---|
| **Tabs / Tab / TabPanel / TabPanels** | ✅ livré | Réutilise `useGroup`. 3 variants (default/pills/underline), 2 orientations, ARIA WAI-ARIA APG, lazy panel mount. |
| **Combobox / Autocomplete** | ❌ rejeté | `OrigamSelect` couvre déjà. |
| **CommandPalette (⌘K)** | ✅ livré | Fuzzy match maison (zero dep), useCommand singleton registry, useHotkey cross-platform, réutilise `OrigamKbd`. |
| **SnackbarStack (Toast stacked)** | ✅ livré | 8 locations, max stack FIFO, useSnackbarStack({id}) singleton multi-stack, role=status/alert per intent. |
| **Bracket (arbre de tournoi)** | ✅ livré | 3 variants (single-elim, double-elim, round-robin), SVG connectors via nextMatchId, slots match/competitor/round-title. |

**Wave 2 — Enrichissements** (livrée — develop)

| Composant | Action | Status |
|---|---|---|
| **OrigamParallax + Layer** | Multi-layer + direction + easing + emits + CSS-first scroll-driven anim | ✅ livré |
| **OrigamCode** | Shiki syntax highlight (14 langs, 2 thèmes, lazy import) + line numbers + highlightLines + copy + filename | ✅ livré |
| **OrigamTextareaField — mode rich** | Editor in-house contenteditable + sanitizer + html-to-markdown, 9 toolbar commands | ✅ livré |
| **OrigamTextField — mask** | Engine maison + 13 built-in patterns + Luhn + IBAN mod-97 + dates calendar-check | ✅ livré |

**Wave 3 — Infra** (livrée — develop)

| Item | Status |
|---|---|
| Module Nuxt officiel (sub-export `origam/nuxt`) | ✅ livré |
| SSR safety audit + `useCssSupportClient` + `OrigamClientOnly` | ✅ livré |
| **pnpm monorepo (6 packages)** | ✅ livré (mai 2026) |

### Wave 3.5 — Build tooling (à venir)

| Item | Effort | Note |
|---|---|---|
| **Turborepo** | M | Cache local + remote (Vercel ou self-hosted) sur `build`, `test`, `lint`. Critique dès que le pipeline CI dépasse 8 min. À ajouter après 1-2 semaines de stabilisation post-monorepo (cf. MONOREPO_PROPOSAL §5.3). |

### ✅ Wave 4 — Nouveaux composants (livrée en v2.6.0)

Idées maintainer (15 items). Ordre indicatif, à ajuster selon priorité business.

| # | Composant | Effort | Note |
|---|---|---|---|
| 1 | **OrigamGrid** | S | Composant déclaratif CSS Grid (`columns`, `rows`, `areas`, `gap`, `auto-flow`). Compat OK partout (CSS Grid stable depuis 2017). Pas de `subgrid` fallback — feature détectée via `useCssSupport`. |
| 2 | **OrigamMasonry** | M | CSS-first via `grid-template-rows: masonry` (Firefox sous flag, Chrome 134+ via opt-in). JS fallback : algo bucket-fill + ResizeObserver (style à la imagesloaded + masonry.js maison). |
| 3 | **OrigamBlockquote** | S | Typographie : citation + auteur + source + variants (default/elegant/quoted/minimal). Tokens dédiés. |
| 4 | **OrigamEmptyState** | S | Placeholder pour absence de données. Slot illustration + title + description + actions. 5 presets visuels (no-data, no-results, error, offline, locked). |
| 5 | **OrigamClipboard** | S | Mini-action wrapper (`<OrigamClipboard :value="..." />` autour d'un bouton/icône). Émit `@copy` + feedback "Copied!" 2s. Sans dépendance (navigator.clipboard + fallback execCommand). |
| 6 | **OrigamInlineEdit** | M | Pattern edit-in-place. Click sur label → input apparaît avec valeur préremplie, Enter valide, Esc annule. v-model + validators. Slots `#display` et `#edit` customisables. ARIA `aria-live`. |
| 7 | **OrigamNumberFormat** | S | Formatage i18n via `Intl.NumberFormat`. Props : `value`, `format` (`'currency'\|'percent'\|'unit'\|'decimal'\|'compact'`), `locale`, `currency`, `unit`, `notation` (`'compact'` → 1M / 1B), `maximumFractionDigits`, etc. Affichage pur (pas d'input). |
| 8 | **OrigamQRCode** | M | Rendu SVG natif. Algo encode QR maison (basé sur la spec ISO/IEC 18004) OU mini-port de `qrcode-svg` (~3 kB). Props : `value`, `size`, `errorCorrectionLevel` (L/M/Q/H), `foreground`, `background`, `logo` (overlay au centre). |
| 9 | **OrigamWatermark** | S | Overlay diagonal en répétition. Props : `text`, `image?`, `opacity`, `angle`, `gap`, `font-size`. Rendu CSS via `background-image: linear-gradient` + texte SVG OU canvas data-URI. Anti-tamper optionnel via MutationObserver (re-injection si supprimé du DOM). |
| 10 | **OrigamVideo** | M | Player vidéo léger maison. Wrap `<video>` natif + UI custom (play/pause, scrubber, volume, fullscreen, PIP, captions, quality switch optionnel via HLS.js peerDep). Props : `src`, `poster`, `autoplay`, `controls` (custom/native/none), `tracks` (captions). Respect `prefers-reduced-motion` pour autoplay. |
| 11 | **OrigamSound** | M | Player audio analogue (wrap `<audio>` + UI custom). Props : `src`, `cover`, `metadata` (artist/title/album), waveform optionnel (Web Audio API + analyser). Media Session API pour controls lock-screen. |
| 12 | **OrigamCalendar** | XL | Calendar complet : vues mois/semaine/jour/agenda, navigation, events (start/end/color/category), range select, drag-to-create, recurring events (RRULE). 100% maison (pas de FullCalendar). Composable `useCalendar` pour la logique. Tokens dédiés pour grille + cellules + events. |
| 13 | **OrigamChart** | XL | Charts custom inspirés Highcharts mais plus simples. SVG natif. Types : line / area / bar / column / pie / donut / scatter / radar. Animation entrée. Tooltip natif (réutilise `OrigamTooltip`). Légende (réutilise `OrigamChip`). Responsive via `viewBox`. Pas de dep externe (pas de d3, pas de chart.js). |

### ✅ Enrichissements transversaux color/bgColor (Wave 4 — livrés en v2.6.0)

| # | Item | Effort | Note |
|---|---|---|---|
| A | **Gradient support** | M | Étendre `useColor` / `useBackgroundColor` pour accepter `color="gradient(...)"` ou `color={ from: 'primary', to: 'success', direction: 135 }`. Generate `background: linear-gradient(135deg, var(--from), var(--to))`. Compatible avec les tokens (intents) ET les valeurs custom (hex). |
| B | **Text-mask (transparent reveal)** | M | Mode `mask="text"` qui pose `background-clip: text` + `color: transparent` sur le texte, avec un background animé derrière (gradient + animation, ou image, ou video selon prop). Useful pour les headlines marketing. |
| C | **Renommer `bgColor` → `accentColor`** | M | Issu du redesign Blockquote (juin 2026) : quand l'intent colore un **accent** (barre, icône de fond, auteur…) et non un vrai remplissage, `bgColor` est trompeur. Renommer `bgColor` / `hoverBgColor` / `activeBgColor` → `accentColor` / `hoverAccentColor` / `activeAccentColor` (proposé par le mainteneur — « plus logique »). **Portée tranchée (2026-07-10, arbitrage PM aligné sur l'option b) : (b)** — nouveau prop `accentColor` réservé aux composants à accent, `bgColor` conservé pour les fonds pleins (Btn, Card, Chip, Badge, Alert, Pagination…). **Pilote livré : `OrigamBlockquote`** — `IAccentColorProps` (Commons), `accentColor` canonique, `bgColor` alias déprécié (warn once via `warnDeprecatedProp`, réutilise le pattern `warnLegacyColor`), story + doc + TU à jour. Reste à faire : identifier et migrer les autres composants « à accent ». Audit (`grep -rl "accent"` sur `packages/ds/src/components`) : `OrigamAudio`, `OrigamCalendar`, `OrigamCode`, `OrigamMediaController`, `OrigamSliderField(Track)` mentionnent tous « accent » quelque part, mais dans CHAQUE cas leur `bgColor` (quand il existe) peint un vrai fond — Calendar peint la surface toolbar/header (`bgColor` "REGION-AWARE", `OrigamCalendar.vue:1060-1066`), Code passe `bgColor` à `useBothColor` (fond réel du bloc code, `OrigamCode.vue:151`), SliderFieldTrack peint le rail (`OrigamSliderField.vue:842-844`) — et leur éventuelle CSS var `--accent-color` (Audio, Code line-highlight, MediaController) est un token de thème indépendant, jamais alimenté par un prop `bgColor`. **Aucun autre candidat confirmé à ce jour** — audit factuel fait, pas de composant équivalent à Blockquote trouvé dans cette passe ; à revalider si de nouveaux composants « accent-only » sont ajoutés. `hoverBgColor` / `activeBgColor` non couverts par ce pilote (Blockquote n'a pas d'état hover/active codé). |

### Intent `ghost` — premier-plan transparent transversal **(XL, spec)**

> Spec née d'un besoin produit (juin 2026). Objectif : faire de `ghost` un
> véritable effet **transparent**, côté surface ET côté premier-plan, cohérent
> sur tout le DS — pas un bricolage par composant. **Statut : standby** tant que
> le périmètre n'est pas cadré (cf. livrable n°1).

**Contexte / constat**

- `ghost` est un `TIntent` (`types/Commons/intent.type.ts`) mais **volontairement
  exclu** des utility intents (`COLOR_UTILITY_INTENTS`, `consts/Commons/color.const.ts`) :
  aucune classe `.origam--bg-ghost` / `.origam--color-ghost` n'est shippée →
  résolution par inline-style uniquement.
- Côté **surface** : `bgColor="ghost"` rend déjà **transparent** (`intentBgExpr`
  → `var(--origam-color__action--ghost---bg)` = `rgba(0,0,0,0)`). Comportement
  voulu (« ghost = transparent »).
- Côté **premier-plan** : `color` n'est PAS « le texte d'un bouton ». C'est un
  intent transversal consommé par de **nombreuses** surfaces :
  - texte (Btn, Card, Input, Label…) ;
  - icônes via `currentColor` (`OrigamIcon` : `color: var(--origam-icon---color, currentColor)`, `OrigamSvgIcon` : `fill: currentColor`) ;
  - remplissages de contrôles (barre/jauge du Slider/Progress, Audio…) ;
  - bordures / accents qui suivent `currentColor`.
  → Un `color="ghost"` « transparent / masque » doit s'appliquer de façon
  **cohérente partout** → géré au niveau du **système de couleur**
  (`useColor` / `useColorEffect` / `useTextColor`, `color.composable.ts`) et
  honoré par chaque consommateur.

**Vision produit (formulée par le mainteneur)**

- `bgColor="ghost"` → surface transparente (déjà OK).
- `color="ghost"` → premier-plan « masque » : les glyphes / traits laissent voir
  **ce qu'il y a derrière l'élément** (pas le fond de l'élément). Sens plein sur
  un élément à fond opaque (ex. `bgColor="primary" color="ghost"`).

**Contrainte technique établie (POC juin 2026)**

- `mix-blend-mode` **ne peut pas** produire ce knockout : il mélange des
  *couleurs*, il ne **soustrait pas l'alpha** d'un fond opaque. `destination-out`
  **n'existe pas** en CSS (c'est du Canvas `globalCompositeOperation`).
- Un vrai « reveal de la page à travers le texte » sur fond arbitraire exige soit
  **CSS `mask`** (image-masque en forme de texte), soit **SVG `<text>`** en
  masque. Difficulté : aligner le masque sur le texte HTML rendu (police,
  kerning, centrage).

**Approches candidates (à arbitrer)**

| Clé | Approche | Portée | Coût | Tradeoff |
|---|---|---|---|---|
| A | **SVG `<text>` masque** sur le fill | Reveal réel au-dessus de tout (image, motif) | XL | Label devient graphique → a11y (`aria-label` requis), métriques police à gérer, par composant |
| B | **Texte = couleur de surface** (`var(--origam-color__surface---default)`) | Approximation « knockout » sur fonds **unis** (≈ 99 % des cas) | S | Vrai texte (a11y OK), simple ; ne révèle pas une image/motif derrière |
| C | **Token `currentColor` transparent** pour les consommateurs `currentColor` (icônes, traits) | Cohérence icônes / fills | M | À combiner avec A ou B pour le texte |

**Livrables**

1. **Cartographie de propagation de `color`** (préalable bloquant) — matrice
   « composant × surface impactée × mécanisme (classe / inline / `currentColor`) »,
   en partant de : `useColor`, `useColorEffect`, `useTextColor`, `useBothColor` ;
   consommateurs `currentColor` (icônes, SVG, traits) ; composants à fill piloté
   par `color` (Slider, Progress, Audio…) ; texte de conteneurs (Card, Input, Label).
2. Décision A / B / C (ou combinaison) sur la base de la cartographie.
3. Implémentation sur composants pivots (Btn, Card, Input, Icon, Slider/Audio),
   story + doc + e2e + VRT.
4. Généralisation.

**Critères d'acceptation**

- `color="ghost"` produit un rendu **cohérent et documenté** sur les composants
  pivots, démontré sur fond contrasté.
- a11y : approche A → `aria-label` / texte alternatif systématique ; approche B →
  contraste WCAG conservé (la directive `v-contrast` ne doit pas le casser).
- TU + e2e + **VRT** verts ; **zéro régression** sur les autres intents.

**Risques**

- Blast radius : `color` touche le rendu de quasiment tous les composants →
  **VRT obligatoire** avant généralisation (cf. ci-dessous).
- a11y de l'approche SVG (texte non sélectionnable / lecteurs d'écran).
- Divergence inter-thèmes : la « surface » derrière varie selon `data-theme`.

**Dépendances** : Visual regression testing (ci-dessous) ; idéalement après
l'**API audit pré-v3** pour figer la sémantique `color` vs `bgColor`. Même
famille technique que l'item B « Text-mask (transparent reveal) » ci-dessus,
besoin distinct.

### Composants : `variant` = preconfig de props **(L, spec)**

> Spec née du redesign Blockquote (juin 2026). **Statut : planifié, non
> implémenté** (demande explicite : prévoir, pas coder maintenant).

**Constat**
- Les `variant` (Blockquote : default / elegant / quoted / minimal / pull) sont
  aujourd'hui des traitements visuels **hardcodés en SCSS** (typo, padding, et
  surtout la barre d'accent gauche / les règles `pull`).
- Le mainteneur veut que **chaque `variant` soit un preset des vrais props**
  (transparent, overridable), et que les décorations (barre, règles) passent par
  les **props configurables appliqués SUR LE BLOC** — **PAS** par des
  pseudo-éléments `::before`/`::after` (approche essayée puis **rejetée/revertée**
  en juin 2026 : les bordures doivent être de vraies bordures sur le bloc).

**Principe cible**
- Un const `{COMPONENT}_VARIANT_PRESETS` : `variant → Partial<IProps>` (`border`,
  `padding`, `rounded`, `color`, `bgColor`, `elevation`, tokens typo…).
- Résolution : `prop explicite` > `preset du variant` > défaut de base. Le
  `variant` n'est qu'un **bundle de défauts** que l'utilisateur peut écraser.
- La barre / les règles d'un variant = le prop **`border`** (directionnel) preset,
  rendu sur le bloc et coloré par `bgColor`. Aucun pseudo.

**Décision ouverte (à trancher au lancement)**
- **A** — la barre d'accent EST le `border` (un seul border par bloc ; l'override
  reshape/supprime la barre). Le plus simple, colle à « configurable ».
- **B** — barre d'accent et `border` (box) **indépendants** → prop dédié
  (`accent` / `bar`) configurable, séparé de `border`.

**Portée** : Blockquote en pilote ; si concluant, généraliser le pattern
« variant = preset » aux autres composants à variants (Btn, Tabs, Card…).

**Pré-requis / liens** : s'appuie sur le fix border numérique (juin 2026) et le
modèle couleur deux-axes (`color` = texte + source, `bgColor` = accent). La story
devra exposer le preset résolu ET permettre l'override (tester les deux). **VRT
obligatoire** (touche le rendu de toutes les variantes).

**État intermédiaire (en attendant)** : la barre d'accent reste en
`border-inline-start` (SCSS, sur le bloc) ; conflit connu avec le prop `border`
(box) assumé temporairement, résolu par cette évolution.

### `OrigamList` — variants de liste sémantiques **(M, spec)**

> Demande mainteneur (juin 2026). **Statut : planifié, non implémenté.**

**Constat** : `OrigamList` et `OrigamListItem` rendent par défaut `tag: 'div'`
avec `role="listbox"` hardcodé, et exposent une prop booléenne `nav`. Résultat :
ce ne sont PAS de vraies listes sémantiques (`<ul>/<ol>/<li>`) — c'est la raison
pour laquelle le marketing utilise `OrigamGrid tag="ul"` / `OrigamGridItem
tag="li"` en attendant, au lieu d'`OrigamList`. Régression d'accessibilité / SEO
(W3C : préférer l'élément natif).

**Principe cible** : remplacer la prop booléenne `nav` par une prop `variant`
qui pilote À LA FOIS le tag rendu ET le rôle ARIA :
- `unordered` → `<ul>` + `<li>` (pas de `role` redondant) ;
- `ordered` → `<ol>` + `<li>` ;
- `nav` → `<nav><ul>…` (navigation) ;
- `listbox` → conserve `<div role="listbox">` actuel (widget interactif sélectionnable).
Le défaut bascule vers une vraie liste sémantique ; `listbox` reste pour les cas
widget (select-like). `OrigamListItem` aligne son `tag` par défaut sur le variant
du parent (via defaults-provider).

**Portée / liens** : breaking (changement de défaut + suppression de `nav`) →
v3, alias rétro-compatible (`nav` déprécié → `variant="nav"`, warn once) +
codemod. Story + doc + e2e + audit a11y (axe) dans la même PR. Une fois livré,
migrer le marketing d'`OrigamGrid tag="ul"` vers `OrigamList variant="unordered"`.

### `OrigamAddMore` — répéteur de champs / groupes **(M, spec)**

> Demande mainteneur (juin 2026). **Statut : planifié, non implémenté.** Module `form`.

Nouveau composant de formulaire « **add more** » : un **slot** contenant un ou
plusieurs champs (ou un groupe de champs), répété N fois, avec un **bouton « Add more »**
pour ajouter une nouvelle occurrence, et la possibilité de **supprimer un groupe**.

**API cible (esquisse — à affiner)** :
- `v-model` = tableau d'items (chaque item = les valeurs d'un groupe). Ajout / suppression
  mute le tableau et émet `update:modelValue`.
- slot `#default="{ index, item, remove }"` — rend le(s) champ(s) du groupe ; `remove()`
  supprime CE groupe ; `index` / `item` pour binder les valeurs du groupe.
- slot `#actions` optionnel pour personnaliser les boutons ; sinon défaut `OrigamBtn`
  « Add more » + bouton de suppression par groupe.
- props : `min` / `max` (bornes du nombre de groupes), `addLabel` / `removeLabel` (i18n
  via `t()`), `disabled`, `itemFactory` (valeur initiale d'un nouveau groupe).
- a11y : chaque groupe dans un conteneur sémantique (`<fieldset>` ou `role="group"` +
  `aria-label`) ; bouton remove avec `aria-label` explicite ; focus géré à l'ajout /
  suppression (focus sur le nouveau groupe / sur le voisin après suppression).
- Livrable : composant + interface (`IAddMoreProps`) + types + story (format unifié) +
  doc + e2e (ajout, suppression, bornes min/max) — **test-as-you-build**.

### `OrigamBtn` — prop `contentJustify` **(S, spec)**

> Identifié lot 4 theming (juillet 2026), pendant le fix du trigger
> `ThemeBuilderControlTrigger.vue`. **Statut : planifié, non implémenté.**

Audit props-first (cf. règle CLAUDE.md) confirmé : `OrigamBtn` n'expose
aujourd'hui aucune prop pour contrôler l'alignement de son contenu interne
dans le grid `__loader` (`prepend | content | append`, `justify-content:
center` par défaut, figé en dur dans la SCSS). `IJustifyProps`/`IAlignProps`
existent bien dans `interfaces/Commons/` mais ne sont consommées que par les
composants de layout grille (`Grids/col`, `Grids/row`, `DataTable/footer`),
jamais par Btn — donc aucun chemin props-first disponible aujourd'hui pour
ce besoin, qui a dû être résolu par un `:deep()` marketing ciblé et documenté
(cf. `ThemeBuilderControlTrigger.vue`) en attendant cette prop.

**Pourquoi pas un simple retrait de `justify-content: center`** : testé et
reverté en amont — retirer le centrage par défaut casse le groupement
visuel icône+texte des boutons `block` qui utilisent les slots `prepend`/
`append` (l'icône reste collée à un bord, le texte-`auto` s'étire loin
d'elle). Le comportement par défaut actuel reste correct pour l'immense
majorité des usages réels (CTA icône+texte). Le besoin n'existe que pour
les consommateurs qui n'utilisent PAS prepend/append (tout le contenu dans
le slot par défaut) et veulent que ce contenu occupe toute la largeur
disponible plutôt que de rester centré en cluster compact.

**API cible (esquisse)** :
- prop `contentJustify?: 'center' | 'start' | 'end' | 'stretch' | 'normal'`
  (défaut `'center'` pour préserver le comportement actuel, zéro breaking
  change), mappée directement sur `justify-content` du grid `__loader`.
- Documenter clairement dans la story/doc que cette prop n'affecte QUE les
  boutons sans prepend/append (sinon comportement inchangé par design —
  ou lever un warning dev si les deux sont combinés, à trancher).
- Livrable : prop + interface + story (nouvelle partie du groupe Design) +
  doc + e2e couvrant bouton block avec/sans icône, sous les deux valeurs
  extrêmes (`center` vs `stretch`) — **test-as-you-build**.

### Visual regression testing **(M)**
- Playwright `expect(page).toHaveScreenshot()` par Variant. OU Chromatic /
  Lost-Pixel. Baseline sur main, diff bloquant sur PR.
- Strategy B touche le rendu de TOUS les composants — sans VRT, c'est des
  journées de test manuel.

## 2.3 — Long terme (>6 mois)

### v4.0 — Vue Vapor mode **(XL, exploratoire)**
- Vapor (compilation no-virtual-DOM) → -40 % overhead runtime.
- POC sur 5 composants pivots (Btn, Input, Card, Menu, Dialog), benchmarks,
  décision conditionnée à la stabilité Vapor (annoncé Vue 3.7+).

### Export Web Components **(L)**
- Vue 3.5 a `defineCustomElement` mature. Sous-export `origam/elements` (CE),
  build séparé via unbuild, démo cross-framework.
- Élargit la cible à React / Svelte / Angular / legacy.

### Theme Builder UI **(XL)**
- App standalone (`apps/theme-builder/`) consommant origam elle-même : édition
  tokens primitive → preview composants en temps réel, export
  `tokens/semantic/brand-{name}.json`.

### Marketing — base de données + sync DS automatique **(XL)**
- Aujourd'hui le site marketing dérive tout son contenu de fichiers statiques
  (`consts/{components,composables,types,enums,interfaces,utils,consts}/*.ts`
  via `import.meta.glob`). Cible : **persister ce référentiel en base de
  données** (Nitro + Knex sur PostgreSQL, conformément au stack projet) pour le
  rendre gérable, versionnable et requêtable.
- **Alimentation automatique par l'évolution du DS** : un job de sync lit le
  code source d'origam (composants, props, composables, types, enums,
  interfaces, utils, consts) et **upsert** la BDD à chaque release / CI. La
  doc référentielle ne se met plus à jour à la main — elle suit le DS.
- Le contenu **éditorial** (pages, sections, textes marketing) vit dans les
  mêmes tables et reste éditable (cf. backend ci-dessous), avec un flag
  « source : DS auto » vs « édité » pour ne pas écraser les corrections
  manuelles au prochain sync.

### Marketing — backend d'administration (CMS) **(XL)**
- Un **back-office** pour gérer tout le contenu du site quand l'auto-génération
  est imparfaite : corriger une description, réordonner, masquer/publier,
  éditer **toutes les pages** (référentiel ET pages éditoriales) sans toucher
  au code.
- **Entièrement traduisible** : chaque champ texte porte ses traductions
  (i18n piloté depuis la BDD, plus seulement les fichiers `en.json`/`fr.json`),
  édition par langue avec état de complétude par locale.
- **Construit avec origam lui-même** — le back-office est une démo grandeur
  nature du DS (tables, formulaires, éditeurs, OrigamDataTable, OrigamForm…),
  cohérent avec le principe « le marketing est une vitrine du DS ».
- Auth + rôles (admin / éditeur), audit des modifications, et garde-fou
  pré-publication. Stack : Nitro (API) + Knex/PostgreSQL + Redis (sessions),
  aligné sur le reste du projet.

### Server Components Vue **(M, dépend du compiler Vue)**
- Aligner sur React Server Components quand l'écosystème Vue rattrapera.

### Génération AI-assistée (Figma → code) **(L, R&D)**
- `figma-plugin/` existe — le rendre bidirectionnel (Figma → composants
  origam) capte la valeur du DS pour les nouveaux composants.

### Maintenance & EOL **(continu)**
- Politique LTS sur la branche `v2.x` pendant 6 mois après la sortie de v3.0
  (sécurité + bugfix critiques seulement). Formalisée dans `SECURITY.md`.

## 2.4 — Hygiène continue

Industrialiser à chaque sprint, indépendamment des phases.

- **Dépendances** — Renovate hebdo, `npm audit --omit=dev` zéro `high`/`critical` au merge.
- **Doc** — un composant sans `{Component}.md` ne passe pas la review.
  Audit trimestriel des liens VitePress.
- **Performance** — `size-limit` bloque les PR qui dépassent le budget,
  profiling `vue-devtools` performance tab sur les composants modifiés.
- **Refacto opportuniste** — règle "boy-scout" : toute PR qui touche un
  composant avec anciens patterns (`*Styles` inline, hex hardcodés, strings
  hardcodées) migre avant merge.
- **Code-quality gate** — Qodana (déjà actif) + ESLint strict + `vue-tsc
  --noEmit` dans la CI. Pas de `any`, pas de `@ts-ignore` sans commentaire
  `// reason: …`.
- **CHANGELOG** — tenu à jour à chaque PR (Keep a Changelog), pas seulement à
  la release. Facilite la `release.yml`.
- **Test-as-you-build** — règle CLAUDE.md non négociable. Check CI qui
  compare `tests/e2e/*.spec.ts` au listing `src/components/index.ts`.
- **Sécurité** — `gitleaks` dans la CI sur chaque PR. `/security-review` sur
  toute modif `src/server/`, `src/services/` ou config build.

---

## Annexe — État actuel post-publication

Releases livrées :
- `2.2.1` sur npm — premier publish public (publié)
- `develop` (HEAD) — +10 features mergées via git flow depuis 2.2.1 :
  - W1 : Tabs, SnackbarStack, Bracket, CommandPalette
  - W2 : Parallax enrichi, Code (shiki), Textarea richtext, TextField mask
  - W3 : Module Nuxt officiel, SSR safety audit
- 378 TU verts (+158 vs 2.2.1), 0 dette lint.

Prochain bump version : `2.3.0` minor (toutes les additions sont rétrocompat).

## Annexe — Priorités P0 immédiates

Si tu ne fais qu'une seule chose dans les 7 prochains jours :

1. **CI GitHub Actions** (`ci.yml` + `release.yml`) — sans elle, la prochaine
   release reproduit la galère v2.2.0 / 2.2.1 manuelle.
2. **Déploiement VitePress + Histoire** — sans doc en ligne, le marketing
   ultérieur tombe à plat.

Le reste peut attendre. Ces deux items débloquent tout le reste.
