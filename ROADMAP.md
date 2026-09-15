# ROADMAP — origam Design System

> Référentiel : `origam@2.17.1` — dernière version publiée sur npm le
> 2026-09-15 (36 versions au registre).
> Stack : Vue 3.5 + TypeScript, distribution ESM via `unbuild`,
> feuilles de tokens CSS/SCSS maintenues à la main — le pipeline DTCG
> (Tokens Studio + Style Dictionary v4) a été **retiré du dépôt** le
> 2026-08-31, cf. §2.3 —,
> 96 familles de composants (218 SFC), 138 composables transversaux.
>
> Cette roadmap mélange deux volets :
> - **Stratégie & adoption** — positionnement, cibles, marketing, KPI, risques.
> - **Technique** — outillage, tests, v3.0, infrastructure.
>
> Tout est négociable. Reprends ce qui te parle, supprime ce qui ne te parle pas.

---

## Où on en est — état mesuré le 2026-09-15 (`origam@2.17.1`)

> Chaque ligne porte la mesure qui la justifie. Les chiffres non reproductibles
> depuis le dépôt portent leur source. Ce qui n'a pas pu être mesuré est rangé
> dans « Non mesuré » plutôt que deviné.

### Livré

- ✅ **Publié sur npm** — `origam@2.17.1`, tarball **1 733 668 o** (≈ 1,73 Mo),
  `unpackedSize` 9 092 234 o, 3 498 fichiers.
  *(`curl https://registry.npmjs.org/origam` + téléchargement du `.tgz`.)*
  Publication automatisée par `release.yml` :
  `npm publish --access public --provenance` (attestation sigstore,
  `id-token: write`), après assertion tag == version.
  À noter : `prepublishOnly` ne lance que le build — ce sont les jobs de
  `ci.yml` qui portent lint, types, gardes, TU et e2e.
- ✅ **Pipeline CI complet** — 5 workflows, **17 jobs**. `ci.yml` en porte 12 :
  `lint`, `architecture-guards`, `type-check`, `test-unit`, `build`,
  `build-embeds`, `build-marketing`, `i18n-check`, `test-e2e`,
  `test-e2e-marketing`, `test-a11y-marketing`, `vrt`. S'y ajoutent
  `release.yml` (2 jobs), `build.yml` (1, SonarQube), `docker.yml` (1),
  `docs-fixtures.yml` (1).
  **Qodana n'existe plus** (`grep -rin qodana .github/` → 0 occurrence) et il
  n'y a plus de workflow `tokens-sync`.
- ✅ **Documentation et stories en ligne** — VitePress v1.6.4 servi sur
  <http://origam.dev.elysera.net/docs> (HTTP 200) et le build Histoire sur
  <http://origam.dev.elysera.net/stories> (HTTP 200). Une route inexistante
  répond 404 sur le même hôte, donc ces 200 sont significatifs. Les images
  `ghcr.io/elyseranet/origam-docs` et `…/origam-stories` sont construites et
  poussées par `docker.yml` (push `main` + tags, multi-arch amd64/arm64).
  ⚠️ En revanche `origam.dev`, `docs.origam.dev` et `stories.origam.dev`
  **ne résolvent pas** (`curl` code 6) : le déploiement public sous le nom de
  domaine du projet reste à faire.
- ✅ **Tests unitaires** — 532 fichiers de specs, **6 953 tests**
  (6 872 passés, 3 *expected fail*, 78 ignorés), suite verte.
  Couverture v8 : **78 % d'instructions, 79,87 % de lignes, 74,49 % de
  fonctions, 64,5 % de branches**.
  *(`pnpm -F @origam/tests run test:coverage`, code de sortie réel 0.)*
- ✅ **Un garde-fou e2e par famille de composants** — **229 fichiers de specs
  Playwright pour 218 stories** et 96 familles. Seules `Icon` et `Slide` n'ont
  pas de spec portant leur nom, et sont couvertes par `icons.spec.ts` et
  `carousel.spec.ts` / `slidegroup-arrows.spec.ts`.
- ✅ **Gardes d'architecture : 21/21**
  (`node packages/ds/scripts/guards/run-all.mjs`, code de sortie réel **0**,
  4,5 s).
- ✅ **Inspection des 216 composants close à 0 défaut** — 8 critères
  (C1 rendu distinct, C2 canal du thème, C3 réactivité, C4 ADR-005,
  C5 emits assertés, C6 sémantique/a11y, C7 story + doc, C8 zéro chaîne en
  dur) : 216 « conforme » sur **chacun** des 8, gravité max « aucun », statut
  « inspecté » partout.
  *(`docs/mesures/classeur-complet-maj-2026-09-01.csv`, 216 lignes de données.)*
- ✅ **SonarQube branché, couverture câblée, gate bloquante** —
  `sonar.javascript.lcov.reportPaths=coverage/lcov.info` dans
  `sonar-project.properties` ; `build.yml` produit le lcov et **échoue s'il est
  vide** ; l'analyse est cadrée sur `packages/ds/src`. La gate est armée
  (`gh variable list` → `ENFORCE_QUALITY_GATE = true`, posée le 2026-06-23) et
  bloque sur la sécurité et la criticité, les odeurs de code passant en
  avertissement.
- ✅ **Automatisation des dépendances** — `.github/dependabot.yml` : écosystèmes
  npm **et** GitHub Actions, hebdomadaire, ciblant `develop`, PR groupées
  (vue / vite+test / lint / types / dev-deps). C'est Dependabot et non
  Renovate, le besoin est couvert.
- ✅ **Consolidation de la suite TU** — **0** spec résiduelle sous
  `src/**/__tests__/` : tout vit sous `packages/tests/TU/{Domain}/`. La cible
  « 70 % de branches sur `src/composables/Commons/` » est **dépassée :
  77,94 %** (1 572 / 2 017 branches, extraites de `coverage/lcov.info`).
- ✅ **Monorepo** — **5** packages pnpm workspace (`ds`, `docs`, `marketing`,
  `stories`, `tests`). `packages/figma-plugin/` a été retiré avec le pipeline
  de tokens (cf. §2.3), le décompte de 6 est périmé. La lib publie toujours
  sous `origam` depuis `packages/ds/`. Voir
  [`MONOREPO_PROPOSAL.md`](./MONOREPO_PROPOSAL.md) pour le rationnel.
- ✅ **README et CHANGELOG à jour.**

### Partiel

- 🟡 **La CI ne barre que 58 des 229 specs e2e.** `test-e2e` tourne avec
  `E2E_GREEN_ONLY=1` : seuls les 58 fichiers listés dans `GREEN_SPECS`
  (`packages/tests/playwright.config.ts`) sont exécutés — sur 4 shards, avec
  `E2E_STATIC=1`. Les 171 autres specs existent au dépôt mais ne gardent rien
  en intégration.
- 🟡 **A11y : le balayage systématique est écrit, pas entièrement branché.**
  `packages/tests/a11y/components.spec.ts` passe axe-core sur le Variant
  Default de chaque composant ayant une story, mais `ci.yml` n'invoque que
  `playwright.a11y.marketing.config.ts` (job `test-a11y-marketing`) : le
  balayage composant ne tourne dans **aucun** job. Son seuil d'échec est par
  ailleurs abaissé au seul `critical` (`IMPACT_FAIL_LEVEL`).
  Côté overlays, les assertions focus-trap / `Escape` / `aria-modal` n'existent
  que dans `dialog.spec.ts`, `select.spec.ts` et `command-palette.spec.ts` —
  Menu, ContextualMenu, Tooltip, Drawer, Sheet et Snackbar n'en ont aucune.
- 🟡 **Régression visuelle amorcée** — le job `vrt` tourne dans le conteneur
  Playwright épinglé (`mcr.microsoft.com/playwright:v1.59.1-jammy`), ce qui
  rend son verdict fiable, mais la suite ne compte **qu'une seule spec**
  (`packages/tests/vrt/btn-variant.spec.ts`).
- 🟡 **Sécurité des dépendances** — `pnpm audit --prod` remonte
  **9 vulnérabilités : 2 modérées, 7 hautes, 0 critique**. Les 17 chemins
  relevés passent **tous** par `packages/marketing` (arbre Nuxt) ; la
  bibliothèque publiée ne déclare que deux dépendances runtime (`@mdi/font`,
  `qrcode-generator`). À traiter côté marketing.

### Pas fait

- ❌ **Aucun monitoring de la taille du bundle** — ni `size-limit`, ni
  `bundlewatch`, ni `bundlesize` dans les `package.json` ou les workflows
  (`grep` → code de sortie 1). Le repère « 869 kB » hérité de la 2.2.0 est
  périmé : le tarball 2.17.1 mesure **1,73 Mo**.
- ❌ **`docs/migration/v2-to-v3.md` n'existe pas** — le dossier
  `docs/migration/` non plus. Bloque le risque **R3** et l'audit d'API pré-v3.
- ❌ **Pas de communauté** — ni Discussions ouvertes, ni contributeur externe.

### Non mesuré

- ❓ **Les notes SonarQube (A sur les 4 axes) et la dette à zéro.** L'API de
  `sonarqube.elysera.net` répond **401** sans jeton, et le jeton est un secret
  de dépôt. Le *branchement* est vérifié ; le *verdict* ne l'est pas.
- ❓ **La disponibilité publique des images GHCR.** Un jeton de pull anonyme sur
  `ghcr.io/elyseranet/origam-docs` est refusé (**403 DENIED**) : les paquets
  sont vraisemblablement privés, mais ce n'est pas confirmé. La doc en ligne,
  elle, est vérifiée par HTTP (voir plus haut).

---

# Partie 1 — Stratégie & Adoption

## 1.1 — Positionnement & différenciation

### Tableau comparatif Vue 3 DS

| Critère | **origam** | Vuetify 3 | PrimeVue | Naive UI | shadcn-vue | Radix Vue |
|---|---|---|---|---|---|---|
| Composants | **96 familles** (218 SFC) | ~90 | ~100 | ~80 | ~50 | ~30 (primitifs) |
| Multi-thème runtime | ✅ `data-theme` | Partiel (Material You) | ✅ | Partiel | ❌ | ❌ |
| Thème par **props de composant** | ✅ `IOrigamTheme.components` | ❌ | ❌ | ❌ | ❌ | ❌ |
| CSS-first + fallback JS | ✅ `useCssSupport` | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tree-shaking propre | ✅ `sideEffects` | Partiel | ✅ | ✅ | ✅ | ✅ |
| Communauté | ❌ (v0) | Très large | Large | Moyenne | Croissante | Petite |
| Doc en ligne | ✅ VitePress déployé *(hôte interne)* | ✅ | ✅ | ✅ | ✅ | Partielle |
| ARIA / a11y | Partiel | Partiel | Bon | Moyen | Bon | Excellent |
| Pipeline Tokens Studio / Figma | ⏸️ **retiré le 2026-08-31** | ❌ | ❌ | ❌ | ❌ | ❌ |

> ⚠️ Les deux lignes « Tokens Studio natif ✅ DTCG » et « Figma sync natif ✅ »
> qui figuraient ici décrivaient un pipeline **supprimé du dépôt le
> 2026-08-31** (cf. §2.3). Les laisser aurait été un argument de vente sans
> code derrière.

### 3 USP concrets

1. **Un thème se configure par les PROPS des composants, pas par du CSS.**
   Un objet `IOrigamTheme` porte un bloc `components`
   (`{ 'origam-btn': { variant, rounded, density, … } }`) résolu pour tout le
   catalogue d'un coup, sans qu'aucun composant n'ait à s'y abonner
   (ADR-005). Les variables CSS restent le dernier recours, pour ce que les
   props ne savent pas exprimer. Aucun concurrent Vue 3 ne propose ce niveau.
2. **CSS-first avec fallback JS documenté.** `useCssSupport()` centralise la
   feature-detection (container queries, `:has()`, `subgrid`, `color-mix`,
   `view-transition`). Choix d'architecture délibéré, rare dans l'écosystème,
   auditable dans le code.
3. **Thème multi-marque sans rebuild.** `<html data-theme="brand-x">` +
   `<OrigamThemeProvider>` permet plusieurs marques sur la même page. Vuetify
   et PrimeVue offrent le dark mode, pas le multi-tenant en runtime.

### Ce qu'il ne faut pas survendre

- L'a11y n'est pas encore le point fort — Radix Vue est supérieur. Le balayage
  axe par composant existe mais **ne tourne dans aucun job de CI**, et son
  seuil d'échec est abaissé à `critical`.
- Pas d'écosystème encore — ne pas prétendre à une communauté.
- **Aucun pipeline Tokens Studio / Figma** : il a été retiré le 2026-08-31.
  Ne plus l'employer comme argument tant qu'il n'est pas reconstruit.
- La doc et les stories sont en ligne, mais sur un hôte interne
  (`origam.dev.elysera.net`) : `origam.dev` ne résout pas. Ne pas communiquer
  une adresse qui n'existe pas.

### Elevator pitch (1 ligne)

> **origam** — the Vue 3 design system where a brand theme is a set of
> component props, not a stylesheet: 96 component families, multi-brand
> theming at runtime, CSS-first with zero config.

## 1.2 — Cibles & cas d'usage

### Public early-adopter

- **A — Équipes design-driven multi-marques.** Agence / studio 3–15 pers,
  stack Vue 3 + Nuxt. Sentent la valeur dès le premier `IOrigamTheme` écrit
  en props plutôt qu'en CSS.
- **B — Apps internes multi-tenant.** Backoffice, portails clients, SaaS
  white-label. Le multi-thème runtime est leur killer feature.
- **C — Solo devs qui fuient Vuetify.** Vuetify impose Material. origam est
  visuellement agnostique. ⚠️ L'argument « plus léger » demande à être
  remesuré avant d'être employé : le tarball `2.17.1` pèse **1,73 Mo**, pas
  les 869 kB de la 2.2.0, et aucune comparaison à Vuetify n'a été faite ici.

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
| ✅ Déployer VitePress — **fait**, servi sur `origam.dev.elysera.net/docs` (HTTP 200) | P0 | S |
| ✅ Déployer Histoire — **fait**, servi sur `origam.dev.elysera.net/stories` (HTTP 200) | P0 | S |
| ⬜ Basculer les deux sous le domaine du projet (`origam.dev` ne résout pas) | P0 | S |
| Badge "downloads/week" npm sur le README | P1 | XS |
| Post de lancement dev.to ("Theming a Vue 3 DS through component props, not CSS") | P1 | M |
| Soumission à Vue.js Newsletter (15 000+ abonnés) | P1 | XS |
| Show HN "origam — a Vue 3 DS you theme with props" | P1 | S |
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
- **Conférences** — talk "CSS-first design systems, themed by props" pour
  VueJS Paris ou VueConf US. Angle différenciant indépendant de la taille de
  la communauté.
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

Ne pas se battre sur la volumétrie. Niche : **thème multi-marque piloté par
les props de composant**, en runtime. Un article ciblé ("Why we moved from
Vuetify to origam for our white-label platform") vaut 10 tweets génériques.

### R2 — Bus factor 1 (proba certaine, impact critique)

Documenter l'architecture (CLAUDE.md couvre déjà bien). Chercher un
co-maintainer dès 20 stars. Ouvrir des "good first issue" labelisées dès Q3.
Publier un "maintenance status" honnête dans le README.

### R3 — Breaking change v3.0 perd les early adopters (proba certaine, impact moyen-élevé)

**Non levé.** Vérifié le 2026-09-15 : `docs/migration/v2-to-v3.md` **n'existe
pas**, et le dossier `docs/migration/` non plus.

Annoncer dès maintenant la v3.0 dans la doc avec une échéance indicative.
Publier `docs/migration/v2-to-v3.md` **AVANT** de tagger v3.0 — c'est une
condition bloquante, pas une bonne pratique. Fournir un codemod
`origam-migrate` si la migration est mécanique.

### R4 — Doc insuffisante bloque l'adoption (proba certaine, impact élevé)

**Partiellement levé.** VitePress et Histoire **sont déployés** et répondent en
HTTP 200 (`origam.dev.elysera.net/docs` et `/stories`), et 210 fichiers de doc
composant existent sous `packages/docs/components/`.

Ce qui reste du risque : l'adresse est un hôte interne, `origam.dev` ne résout
pas. Tant que la doc n'est pas publiée sous le nom du projet, l'effort
marketing n'a nulle part où envoyer les gens. Cible inchangée pour chaque
composant : props listées, exemple minimal, captures sur 3 thèmes.

### R5 — Pas de track record prod (proba certaine, impact moyen)

Construire et publier une app de démo réelle (pas Storybook — vraie app avec
routes, formulaires, navigation, dark mode). Documenter chaque projet (perso
ou pro) où origam est utilisée — un seul suffit à casser le "zéro référence".

---

# Partie 2 — Technique

## 2.1 — Court terme (Q3 2026)

### SonarQube — outillage en place, verdict non mesurable d'ici **(M)**

**Fait et vérifié (2026-09-15) :**
- ✅ **Couverture câblée.** `sonar-project.properties` déclare
  `sonar.javascript.lcov.reportPaths=coverage/lcov.info` ; `build.yml` lance
  `pnpm -F @origam/tests run test:coverage` puis **échoue si le lcov est vide**
  (`test -s coverage/lcov.info`). L'analyse est cadrée sur `packages/ds/src`
  avec `sonar.tests=packages/tests/TU`, et exclut `*.spec.ts`, `*.d.ts` et
  `assets/**` — le code généré ne pollue plus le ratio.
- ✅ **Gate bloquante armée.** La variable de dépôt `ENFORCE_QUALITY_GATE` vaut
  `true` (`gh variable list`, posée le 2026-06-23). Le blocage est trié **par
  gravité** : vulnérabilité ou criticité `BLOCKER`/`CRITICAL` → job rouge ;
  odeur de code → avertissement. Ce tri est délibéré (cf. l'incident 2.14.0,
  bloquée par deux odeurs mineures alors que tout le fonctionnel était vert).
- ⏹️ **Scan sur PR : abandonné, pas en retard.** SonarQube Community Edition
  n'analyse qu'**une seule branche** et rejette l'analyse de pull request.
  `build.yml` scanne donc `develop` et le documente. À rouvrir seulement si le
  projet passe en Developer Edition.

**Reste ouvert :**
- ❓ **Note A sur les 4 axes et dette à zéro : non mesuré.** L'API
  `sonarqube.elysera.net` répond **401** sans jeton, et le jeton est un secret
  de dépôt. Il faut consulter le tableau de bord pour trancher — ne pas cocher
  cet item sans cette lecture.

### ✅ CI E2E — le job ne s'annule plus **(corrigé)**

Le job `E2E tests (Playwright / Chromium)` dépassait systématiquement son
`timeout-minutes: 30` parce que le `webServer` Playwright lançait Histoire en
mode Vite **dev** : chaque story payait une compilation à froid.

**Ce qui a été appliqué, lu dans `ci.yml` le 2026-09-15 :**
- `E2E_STATIC: '1'` — le job construit d'abord le Histoire statique
  (`pnpm -F @origam/stories build`) et le sert via `histoire preview`. Plus de
  compilation à froid par story. C'est l'option « corriger » de l'arbitrage
  ci-dessous, retenue.
- **Sharding sur 4 runners** (`matrix.shard: [1,2,3,4]`,
  `--shard=${{ matrix.shard }}/4`, `fail-fast: false`), ce qui divise le temps
  mural par autant.
- `NODE_OPTIONS: --max-old-space-size=6144` pour le build Histoire, navigateurs
  Playwright mis en cache, rapport téléversé en artefact à chaque issue.

**Ce qui reste :** le job tourne avec `E2E_GREEN_ONLY: '1'`, donc **58 specs
sur 229** (liste `GREEN_SPECS` dans `packages/tests/playwright.config.ts`).
Élargir cette liste est le vrai travail restant — voir l'item suivant.

### ✅ CI/CD GitHub Actions complète **(livré)**

Mesuré le 2026-09-15 : **5 workflows, 17 jobs**.
- `ci.yml` — 12 jobs sur PR et push : `lint`, `architecture-guards`,
  `type-check`, `test-unit`, `build`, `build-embeds`, `build-marketing`,
  `i18n-check`, `test-e2e`, `test-e2e-marketing`, `test-a11y-marketing`, `vrt`.
- `release.yml` — sur tag `v*` ou `X.Y.Z` : assertion tag == version, puis
  `npm publish --access public --provenance` (sigstore) et GitHub Release.
  Un job `npm-auth-check` manuel vérifie le jeton sans publier.
- `build.yml` (SonarQube), `docker.yml` (images docs + stories vers GHCR,
  multi-arch), `docs-fixtures.yml`.

Le `tokens:lint` mentionné à l'origine n'existe plus : le pipeline de tokens a
été retiré le 2026-08-31 (cf. §2.3).

**Reste ouvert :** la matrice **Node 22 / 24** n'est pas en place — tous les
jobs lisent `node-version-file: .nvmrc`, donc une seule version. À décider :
matrice réelle, ou renoncer explicitement et s'en tenir au `engines.node >= 22`
du contrat consommateur.

### ✅ Déploiement Histoire + VitePress **(livré, hors GitHub Pages)**

Mesuré par HTTP le 2026-09-15 :
- <http://origam.dev.elysera.net/docs> → **200**, VitePress v1.6.4.
- <http://origam.dev.elysera.net/stories> → **200**, build Histoire.
- Une route inexistante sur le même hôte → **404**, donc ces 200 sont
  significatifs et non un *catch-all* de SPA.

La chaîne n'est ni GitHub Pages ni Vercel : `docker.yml` construit et pousse
`ghcr.io/elyseranet/origam-docs` et `…/origam-stories` (multi-arch, sur `main`
et sur tag), et `docker/docker-compose.yml` sert de référence de déploiement.

**Reste ouvert — et c'est ce qui bloque l'adoption externe :** `origam.dev`,
`docs.origam.dev` et `stories.origam.dev` **ne résolvent pas** (`curl` code 6).
La doc est en ligne sur un hôte interne, pas encore sous le nom du projet.

### 🟡 Coverage Playwright — écrite, mais pas entièrement barrée en CI **(M)**

**Fait :** le dépôt porte **229 fichiers de specs e2e pour 218 stories** et
96 familles de composants. En croisant le nom des familles avec celui des
specs, seules `Icon` et `Slide` n'ont pas de spec homonyme, et toutes deux sont
couvertes par des specs voisines (`icons.spec.ts`, `carousel.spec.ts`,
`slidegroup-arrows.spec.ts`). Le « ~60 composants sans garde-fou » n'est plus
d'actualité.

**Reste :** `ci.yml` lance `test-e2e` avec `E2E_GREEN_ONLY: '1'`, donc
**58 specs sur 229** — celles listées dans `GREEN_SPECS`
(`packages/tests/playwright.config.ts`). Les 171 autres existent mais ne
bloquent aucune PR : une régression qu'elles couvrent peut être mergée sans une
seule coche rouge.
- Travail restant : faire entrer les specs restantes dans `GREEN_SPECS`, vague
  par vague, en traitant les instabilités au lieu de les contourner.
- Bloque toujours la confiance pour v3 : sans cette barrière, Strategy B
  n'a pas de référence.

### ✅ Audit & consolidation de la suite TU **(livré)**

- **Convention appliquée** : **0** spec résiduelle sous `src/**/__tests__/`
  (`find` → 0). Tout vit sous `packages/tests/TU/{Domain}/` (components,
  composables, directives, marketing, nuxt, origam, probe, stories, utils).
- **Cible de branches dépassée** : la cible était 70 % sur
  `src/composables/Commons/`, la mesure donne **77,94 %**
  (1 572 / 2 017 branches, agrégées depuis `coverage/lcov.info`).
- **Volume** : 532 fichiers, **6 953 tests** (6 872 passés, 3 *expected fail*,
  78 ignorés), suite verte en 80 s.
  *(`pnpm -F @origam/tests run test:coverage`, code de sortie réel 0,
  2026-09-15.)*
- Couverture globale du périmètre analysé : 78 % d'instructions, 79,87 % de
  lignes, 74,49 % de fonctions, 64,5 % de branches.

### 🟡 Audit a11y des overlays **(M — partiellement fait)**

**Fait :** `@axe-core/playwright` est installé et utilisé.
`packages/tests/a11y/components.spec.ts` balaie le Variant Default de **chaque**
composant ayant une story, et `test-a11y-marketing` passe axe sur les pages du
site à chaque PR (landmarks, skip link, navigation sans JS).

**Reste, et c'est précis :**
- Le balayage composant **ne tourne dans aucun job** : `ci.yml` n'invoque que
  `playwright.a11y.marketing.config.ts`. Le brancher (ou expliquer pourquoi
  non) est le premier geste.
- Son seuil d'échec est abaissé au seul `critical` (`IMPACT_FAIL_LEVEL`) ;
  `serious` ne fait que s'afficher. À remonter une fois l'arriéré purgé.
- **Les overlays n'ont pas leurs assertions dédiées.** Focus trap /
  restitution du focus / `aria-modal` / `Escape` ne sont assertés que dans
  `dialog.spec.ts`, `select.spec.ts` et `command-palette.spec.ts`. Menu,
  ContextualMenu, Tooltip, Drawer, Sheet et Snackbar n'en ont aucune.
- Doc d'accessibilité par composant : non vérifiée ici.

### ❌ Bundle-size monitoring **(S — toujours à faire)**

Aucun outillage : ni `size-limit`, ni `bundlewatch`, ni `bundlesize` dans les
`package.json` ni dans les workflows (`grep` → code de sortie 1).

- `size-limit` + `@size-limit/preset-big-lib` sur chaque sous-export.
- `size-limit-action` pour commenter automatiquement les PR.
- **Repère à réviser** : le « 869 kB » de la 2.2.0 est périmé. Mesuré le
  2026-09-15 sur le registre, le tarball `origam@2.17.1` pèse **1 733 668 o**
  (≈ 1,73 Mo) pour un `unpackedSize` de 9 092 234 o et 3 498 fichiers. Fixer
  le seuil sur cette valeur, pas sur l'ancienne.

### ❌ API audit pré-v3 **(L — toujours à faire)**

**Vérifié le 2026-09-15 : `docs/migration/v2-to-v3.md` n'existe pas, et le
dossier `docs/migration/` non plus.** C'est la condition d'entrée du risque
**R3** — ne pas cocher cet item tant que le fichier n'est pas écrit.

- Tableau exhaustif des dépréciations dans `docs/migration/v2-to-v3.md`.
- Compléter les `@deprecated` manquants (notamment `color="#hex"`).
- Codemod `origam-codemod` (jscodeshift) pour les renommages mécaniques.

### ✅ Automatisation des dépendances **(livré — Dependabot, pas Renovate)**

`.github/dependabot.yml` couvre le besoin :
- Écosystèmes **npm** et **GitHub Actions**, hebdomadaire (lundi 06:00
  Europe/Paris), ciblant `develop`.
- PR **groupées** : `vue` (vue-*, @vue/*, vue-tsc…), `vite-and-test`
  (vite, vitest, vitepress, playwright, cypress), `lint`, `types`, `dev-deps`
  (le reste des devDeps).
- Plafonds : 10 PR npm ouvertes, 5 côté Actions ; préfixe de commit `chore`.

`renovate.json` n'existe pas et n'est pas nécessaire : le besoin décrit est
servi. **Reste ouvert** : l'auto-merge des patchs de devDeps n'est pas
configuré.

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
  ColorPicker, DatePicker, Form, validation, **AddMore** et **TimePicker /
  TimePickerField** (cf. specs ci-dessous).
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

### ✅ Module Nuxt officiel **(livré)**

Lu dans `packages/ds/src/nuxt/module.ts` le 2026-09-15 : le module appelle
`addComponentsDir` (auto-import des composants), `addImports` (composables,
liste explicite pour ne pas écraser les auto-imports natifs de Nuxt),
`addPlugin` **deux fois** (`plugin.client.ts` et `plugin.server.ts`), pousse les
feuilles `origam/tokens/css/*` dans `nuxt.options.css` et expose bien l'option
`themes` (avec un `DEFAULT_THEMES`). Couvert par
`packages/tests/TU/nuxt/module.spec.ts`.

### ✅ Sécurisation SSR de `useCssSupport` **(livré)**

Le helper existe :
`packages/ds/src/composables/Commons/cssSupportClient.composable.ts`
(`useCssSupportClient`), aux côtés de `cssSupport.composable.ts` et
`utils/Commons/css-support.util.ts`.

**Nuance mesurée :** le seul test qui coupe réellement JavaScript
(`test.use({ javaScriptEnabled: false })`) est
`packages/tests/a11y/marketing-a11y.spec.ts` — il valide le rendu sans JS des
pages marketing, pas spécifiquement le repli serveur de `useCssSupport`. Un
test dédié reste à écrire si l'on veut barrer cette surface.

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

### `OrigamWizardForm` — formulaire multi-étapes **(M, spec)**

> Demande mainteneur (août 2026). **Statut : planifié, non implémenté.** Module `form`.

**Constat** : le DS a déjà tout ce qu'il faut pour un formulaire à étapes —
`OrigamForm` (284 lignes : validation, `v-model`, gestion des erreurs) et
`OrigamStepper` (288 lignes : navigation par étapes, orientation, statut par
step). Aucun composant ne les **compose** aujourd'hui pour offrir le pattern
« formulaire wizard » clé en main. Règle anti-duplication du dépôt oblige
(`CLAUDE.md` — réutiliser avant d'écrire) : `OrigamWizardForm` **ne
réimplémente ni la validation ni la navigation par étapes**, il assemble les
deux composants existants.

**Principe cible** : chaque step du wizard est un groupe de champs rendu par
`OrigamForm` (scoping de la validation à l'étape active) ; la progression et
la navigation (Précédent / Suivant / Terminer) sont rendues par
`OrigamStepper`. La validation d'un step bloque le passage au suivant tant
qu'elle échoue.

**API cible (esquisse — à affiner)** :
- `steps: IWizardFormStep[]` (titre + slot de contenu + validators par step)
  OU slots nommés `#step-{n}` — à trancher au lancement.
- `v-model` global agrégeant les valeurs de tous les steps.
- props reprises de `OrigamStepper` pour l'orientation / l'apparence de la
  progression (horizontale / verticale, linéaire ou non) et de `OrigamForm`
  pour le comportement de validation.
- Livrable : composant + interface (`IWizardFormProps`) + story (format
  unifié) + doc + e2e (navigation avant/arrière, blocage sur step invalide,
  soumission finale) — **test-as-you-build**.

### Système de validation intégré — rendre Vuelidate optionnel **(L, spec)**

> Demande mainteneur (août 2026). **Statut : planifié, non implémenté.** Module `form`.

**Constat, mesuré avant d'écrire cette spec** : `vuelidate` n'apparaît nulle
part dans le dépôt — ni dépendance, ni `peerDependency`, ni import. La demande
porte donc sur une intention, pas sur un retrait.

⚠️ **Interprétation retenue, à confirmer** : le DS doit offrir une validation
assez complète pour qu'une application n'ait *pas besoin* d'ajouter Vuelidate,
tout en restant compatible avec elle si le consommateur en veut une. Si
l'intention était autre — par exemple intégrer Vuelidate comme peer optionnel —
cette entrée est à réécrire.

**Ce qui existe déjà.** `useValidation` (`composables/Commons`, 217 lignes)
couvre le cycle de vie complet : `isPristine`, `isDirty`, `isValid`,
`isValidating`, `errorMessages`, `maxErrors`, `validateOn`
(`input | blur | submit | lazy`), `reset`, `resetValidation`,
`validationClasses`, et l'enregistrement auprès d'un `<OrigamForm>` parent via
`ORIGAM_FORM_KEY`. La mécanique n'est pas le manque.

**Ce qui manque vraiment : la bibliothèque de validateurs.** Une règle s'écrit
aujourd'hui à la main — `rules: [(v) => v.length >= 3 || 'Min 3 chars']`. C'est
exactement ce que Vuelidate apporte et que le DS n'a pas : `required`,
`minLength`, `email`, `between`, `sameAs`, `url`…

Et le dépôt en a déjà, **éparpillés et non exposés comme règles** :
`isIbanValid`, `isLuhnValid`, `isFrDateValid`, `isUsDateValid`,
`isIsoDateValid`, `validatePattern` (dans `utils/Mask/`), `isEmpty`,
`isAfter`/`isBefore`/`isWithinRange`/`isWeekend` (dates). Ils existent comme
prédicats utilitaires, pas comme validateurs composables retournant
`true | string`.

**API cible (esquisse — à affiner)** :
- un module de validateurs, chacun retournant `true | string`, paramétrable :
  `minLength(3)`, `between(1, 10)`, `matches(/…/)` ;
- **messages traduisibles** — un validateur ne renvoie pas une chaîne finale
  mais une clé i18n et ses paramètres, sinon la règle « zéro texte en dur »
  est violée dès la première règle ;
- **validateurs asynchrones** de première classe : `useValidation.validate` est
  déjà `async` et attend chaque règle, le socle est là ;
- **réutiliser les prédicats existants** plutôt que les réécrire — un
  `iban()` s'adosse à `isIbanValid`. Règle anti-duplication du dépôt.

**Point d'attention repéré** : `useInlineEdit` réimplémente sa propre
évaluation de règles (`runRules`), avec une sémantique **différente** de
`useValidation` — il s'arrête à la première erreur là où `useValidation`
accumule jusqu'à `maxErrors`, et il ignore silencieusement un retour de règle
malformé là où `useValidation` avertit. Son commentaire l'assume
(*« mirrors the evaluation logic of useValidation without the form-provider
coupling »*). Mutualiser le noyau ne se fait donc **pas sans trancher** laquelle
des deux sémantiques fait foi — ce n'est pas une extraction neutre.

**Livrable** : module de validateurs + interfaces + types + clés i18n + doc
avec un tableau des validateurs + TU par validateur + e2e sur un formulaire
réel — **test-as-you-build**.

### `OrigamTimePicker` + `OrigamTimePickerField` — sélection d'heure **(M, spec)**

> Demande mainteneur (août 2026). **Statut : planifié, non implémenté.** Module `form`.

**Constat** : le catalogue couvre la date (`OrigamDatePicker` + ses 5
sous-composants, `OrigamDatePickerField`) mais **rien ne couvre l'heure** —
vérifié, aucun fichier `*Time*` hors la famille `Timeline`, qui est un
composant d'affichage chronologique sans rapport. C'est le trou le plus
visible de la famille de saisie : un formulaire de rendez-vous ne peut pas
être construit avec origam seul aujourd'hui.

**Deux composants, comme pour la date** — la surface de sélection et son
habillage en champ sont deux besoins distincts (la surface sert aussi
inline, dans un panneau ou une Card, sans champ) :
- `OrigamTimePicker` — la surface de sélection seule.
- `OrigamTimePickerField` — le champ qui l'ouvre dans un overlay.

**Ce qui existe déjà et DOIT être réutilisé** (règle anti-duplication du
dépôt — audit fait avant d'écrire cette spec) :
- `CALENDAR_TIME_FORMAT` (`enums/Calendar`, valeurs `'12h'` / `'24h'`) et le
  type dérivé `TCalendarTimeFormat` couvrent déjà le format d'horloge.
  **Ne pas en créer un second.** Comme il devient partagé entre deux
  familles, il rejoint `Commons` conformément à la règle « cible
  d'unification = TOUJOURS Commons » — le renommage fait partie du ticket.
- Le patron du champ est **exactement** celui de
  `OrigamDatePickerField.vue` : `origam-text-field` (l.2) + `origam-menu`
  (l.62) + le picker en contenu (l.76), avec `v-bind="{ ...textFieldProps }"`
  pour le passe-plat. `OrigamTimePickerField` mirroite cette structure ; il
  ne réinvente ni le champ, ni l'overlay, ni le placement.
- Les props transversales passent par les interfaces `Commons`
  (`IValidationProps`, `IDensityProps`, `ISizeProps`, `IRoundedProps`…),
  jamais redéclarées inline.

**⚠️ Ce qui N'EST PAS réutilisable, malgré son nom** :
`formatMediaTime` (`utils/Media/format-time.util.ts`) formate une **durée**
en `mm:ss` / `h:mm:ss` avec un repli `--:--`. C'est un autre domaine qu'une
**heure de la journée** (pas de 12h/24h, pas de méridien, pas de fuseau).
La réutiliser produirait un affichage faux. Le formatage horaire est à
écrire, dans `utils/` et non inline.

**API cible (esquisse — à affiner au lancement)** :
- `v-model` — à trancher entre une `Date`, une chaîne `HH:mm`, ou un objet
  `{ hours, minutes, seconds }`. Contrainte : rester cohérent avec ce que
  `OrigamDatePicker` émet déjà, pour qu'un couple date + heure se compose
  sans conversion côté application.
- `format?: TTimeFormat` — 12h / 24h, réutilisant l'enum ci-dessus.
- `min` / `max` — bornes horaires ; `step` (minutes) pour contraindre la
  granularité ; `allowedTimes` pour les cas non réguliers (créneaux).
- `useSeconds?: boolean` — masqué par défaut, la majorité des usages
  s'arrêtent à la minute.
- Mode de saisie : **liste de créneaux scrollable** (heures / minutes en
  colonnes) plutôt qu'un cadran analogique en première version — le cadran
  est joli mais coûteux en a11y et en tests, il peut venir en second temps
  derrière une prop de variante.
- `OrigamTimePickerField` ajoute : `placeholder`, `clearable`, saisie
  clavier directe dans le champ (pas seulement via l'overlay), et la
  validation `IValidationProps` héritée de la chaîne de champs.

**a11y — le point dur, à traiter dès la conception** : un sélecteur d'heure
est un piège classique. Les colonnes de créneaux sont des `listbox`
navigables au clavier (flèches, Home/End, saisie du premier chiffre), pas
des `div` cliquables ; l'heure sélectionnée est annoncée en toutes lettres
et non lue comme deux nombres isolés ; la saisie clavier directe dans le
champ doit rester possible sans jamais ouvrir l'overlay. Suivre la règle
HTML sémantique du dépôt : élément natif d'abord, ARIA seulement là où
aucun natif ne convient.

**Livrable** : 2 composants + interfaces (`ITimePickerProps`,
`ITimePickerFieldProps`) + types + util de formatage + 2 stories (format
canonique : Design / State / Functional / Emits / Slots / Playground) +
2 docs + e2e (sélection à la souris, navigation clavier complète, bornes
min/max, step, 12h vs 24h, saisie directe au clavier dans le champ) —
**test-as-you-build**, spec Playwright livrée dans la même PR que
l'implémentation.

### `OrigamPage` — wrapper de page (header / content / footer) **(S, spec)**

> Demande mainteneur (août 2026). **Statut : planifié, non implémenté.**

Composant volontairement simple : un wrapper structurel pour une page
applicative, avec trois zones — header, content, footer — sans logique
métier imposée. Objectif : un squelette de page sémantique et cohérent avec
les tokens du DS (spacing) sans que chaque application ne réinvente son
propre wrapper générique.

**API cible (esquisse)** :
- slots `#header`, `#default` (content), `#footer` — tous optionnels, layout
  en colonne (header / content flexible / footer collé en bas).
- rendu sémantique natif (`header` / `main` / `footer` — pas de conteneur
  générique, cf. règle HTML sémantique du dépôt).
- props minimales : dimension (`extends IDimensionProps`), spacing
  (`extends IMarginProps` / `IPaddingProps`) — pas de logique de scroll ou
  de sticky imposée dans cette première version.
- Livrable : composant + interface (`IPageProps`) + story + doc + e2e
  (présence des 3 zones, rendu sans certaines zones) — **test-as-you-build**.

### `OrigamSection` — création + schémas de section **(M, spec)**

> Demande mainteneur (août 2026). **Statut : composant supprimé du dépôt le
> 2026-08-26 (coquille vide, aucune valeur livrée) — à recréer entièrement
> quand ce jalon sera pris en charge.**

**Constat** : le stub `packages/ds/src/components/Section/OrigamSection.vue`
(14 lignes, `TODO - WIP`, aucune prop/slot/style) a été retiré du dépôt en
attendant qu'on sache quelle fonctionnalité lui donner — en attendant,
`CLAUDE.md` recommande d'utiliser l'élément `section` natif. Ce jalon **crée**
le composant, il ne l'achève plus.

**Principe cible** : réutiliser le pattern de « schémas » déjà validé par
`OrigamSkeleton` (`TSkeletonVariant` : `text` / `rectangular` / `circular` /
`card` / `list-item` — des variants composites qui préconfigurent structure
ET props). `OrigamSection` exposerait de la même façon des **schémas de
section** prédéfinis (ex. `hero`, `split`, `centered`, `full-bleed`) : chaque
schéma est un preset de props (spacing vertical, `bgColor`, alignement de
contenu) sur le vrai élément `section` sémantique — **props d'abord**, pas de
CSS bespoke par instance (cf. règle DS « props-first »).

**API cible (esquisse)** :
- prop `variant?: TSectionVariant` (nommage aligné sur le pattern Skeleton)
  pilotant un preset de props internes.
- `extends IDimensionProps` / `IMarginProps` / `IPaddingProps` / `IColorProps`
  / `IBgColorProps` (Commons) pour l'override — le schéma reste un **bundle
  de défauts** overridable, jamais un mur opaque.
- tag racine `section` natif (jamais de conteneur générique — cf. règle HTML
  sémantique du dépôt).
- Livrable : composant + interface (`ISectionProps`) + types
  (`TSectionVariant`) + story + doc + e2e (un schéma par Variant, props
  overridées testées) — **test-as-you-build**.

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

### 🟡 Visual regression testing **(M — amorcé)**

**Fait :** le job `vrt` tourne à chaque PR, **dans le conteneur Playwright
épinglé** `mcr.microsoft.com/playwright:v1.59.1-jammy` — c'est ce qui rend le
verdict exploitable, les empreintes visuelles étant sensibles aux polices et à
l'anticrénelage (cf. `packages/tests/vrt/VRT.md`). Configuration dédiée
`playwright.vrt.config.ts`, rapport téléversé en artefact.

**Reste :** la suite ne contient **qu'une seule spec**,
`packages/tests/vrt/btn-variant.spec.ts` (variants d'`OrigamBtn`). Strategy B
touche le rendu de **tous** les composants — tant que la baseline se limite à un
composant, la VRT ne couvre pas le risque qui la justifie. Étendre Variant par
Variant, en gardant l'exécution en conteneur.

## 2.3 — Long terme (>6 mois)

### ⏸️ GELÉ — Design tokens & Figma : à reprendre à zéro, DS stabilisé d'abord **(XL)**

**Décision du 2026-08-31.** Le pipeline de tokens (sources Tokens Studio DTCG +
Style Dictionary) et le plugin Figma sont **retirés du dépôt**. Ils seront
repris **proprement**, plus tard, et la condition d'entrée est explicite :
**quand le DS sera stable et sans bug.** Pas avant.

**Pourquoi.** Le sujet consommait une part disproportionnée du temps d'ingénierie
pour un bénéfice qui ne se voyait pas à l'écran. Mesuré le 2026-08-31 :
**18 des 83 tickets ouverts** mentionnent les tokens ou Figma dans leur titre
(`gh issue list --state open`), pour une couche que l'utilisateur final ne
touche jamais directement. On arrête d'y investir tant que le socle composant
n'est pas sain.

**Ce qui a été retiré**
- `packages/ds/tokens/` — sources DTCG (primitive, semantic, component).
- `packages/ds/scripts/build-tokens.mjs`, `tokens.config.mjs`, et les scripts
  `tokens:build` / `tokens:watch` / `tokens:lint`.
- Les dépendances `style-dictionary` / `@tokens-studio/sd-transforms`.
- `packages/figma-plugin/` en entier.
- La surface Figma du site vitrine (page `/figma-plugin`, `HomeFigma`, le `.zip`).

**Ce qui RESTE, et pourquoi c'est sûr**
Les 4 feuilles générées — `packages/ds/src/assets/css/tokens/{primitive,light,
dark,origam-utilities}.css` — étaient **déjà versionnées dans git**. Elles
restent en place et deviennent du **source maintenu à la main**. C'est ce qui
rend l'opération sans risque : **155 des 216 composants lisent
`var(--origam-…)`, 17 882 occurrences dans le DS**, et pas une seule ne change.
Le theming reste pleinement fonctionnel : `data-theme`, `useTheme()`,
`OrigamThemeProvider`, le bloc `IOrigamTheme.components` et le Theme Builder
`/theming` du site vitrine sont **conservés et hors périmètre du gel**.

⛔ **Ce que le gel ne règle PAS — à ne pas se raconter d'histoire.** Les
variables mortes ne disparaissent pas : elles se **figent dans le CSS**. Les
189 variables jamais lues par feuille livrée (#436), les 12 `code.syntax.*`
inatteignables (#399), les ~35 noms morts de `data-table`/`list`/`tabs` (#528)
sont toujours émis — simplement, plus personne ne les régénère. Le nettoyage
de ces feuilles est un chantier **à part entière**, à planifier à la reprise.

**Tickets à geler** — ⛔ **encore OUVERTS au 2026-08-31**, vérifié par
`gh issue view`. La version précédente de cette ligne disait « fermés avec
renvoi ici » : c'était faux, aucun ne l'a été. À fermer avec renvoi ici, puis à
rouvrir à la reprise :
`#334 #370 #389 #393 #394 #399 #436 #479 #503 #510 #525 #528 #530 #531`

**Restent ouverts** — ils contiennent de vrais défauts produit hors tokens, et
seule leur part « tokens » est gelée : `#407` (Counter invisible par défaut,
classe `--error` sans règle SCSS), `#419` (prop `scrollable` morte, 4 docs
trompeuses), `#429` (défauts de thème perdus au montage sur MediaController,
2 props mortes documentées comme actives), `#485` (8 tests `describe.skip` sur
`useCode`, un problème de hoisting pnpm sans rapport avec les tokens).

**Conditions de reprise**
1. Le socle composant est stable : suite e2e verte sur les 3 moteurs, zéro
   défaut produit connu sur les familles principales.
2. La grammaire de nommage est réactée d'abord, **sur le papier**, avant tout
   code — c'est son absence qui a produit les trois populations divergentes de
   #435 / #436 / #503.
3. La reprise repart des feuilles CSS figées comme **source de vérité**, pas
   des anciens JSON : ce sont elles qui décrivent ce qui est réellement livré.

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

Mesuré le 2026-09-15 (voir « Où on en est » en tête de document pour le détail
des commandes) :

- **36 versions publiées** sur npm ; la dernière est **`origam@2.17.1`**
  (2026-09-15T07:35:10Z), un correctif. La `2.17.0` l'a précédée le même jour.
- **6 953 tests unitaires verts** sur 532 fichiers de specs (+ 6 575 vs les
  378 TU de l'annexe précédente).
- **229 specs e2e** et **21/21 gardes d'architecture** au vert.
- **216 composants inspectés, 0 défaut** sur les 8 critères du classeur.

Prochain bump : à décider selon le contenu. La **v3.0** reste conditionnée à
l'écriture de `docs/migration/v2-to-v3.md`, qui **n'existe pas** (risque R3).

## Annexe — Priorités P0 immédiates

Les deux P0 de la version précédente de cette annexe — **CI GitHub Actions** et
**déploiement VitePress + Histoire** — sont **faits et vérifiés** (17 jobs sur
5 workflows ; doc et stories servies en HTTP 200). Ils sortent de la liste.

Les trois P0 qui les remplacent, dans cet ordre :

1. **Élargir `GREEN_SPECS`.** 58 specs e2e sur 229 gardent réellement une PR.
   Les 171 autres sont écrites et ne bloquent rien : c'est le plus gros écart
   entre ce que le dépôt teste et ce que l'intégration vérifie.
2. **Écrire `docs/migration/v2-to-v3.md`.** Le fichier n'existe pas, et c'est
   la condition d'entrée explicite du risque **R3** comme de l'audit d'API
   pré-v3. Sans lui, la v3 ne peut pas être taguée.
3. **Publier la doc sous le domaine du projet.** Elle est en ligne, mais sur
   un hôte interne : `origam.dev`, `docs.origam.dev` et `stories.origam.dev`
   ne résolvent pas. Tant que c'est le cas, l'effort marketing n'a pas d'adresse
   où envoyer les gens.
