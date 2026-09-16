# Audit du site vitrine — inventaire mesuré, 2026-09-16

Classeur : [`vitrine-classeur-2026-09-16.tsv`](./vitrine-classeur-2026-09-16.tsv) — 122 lignes,
une par page mesurée, colonnes M1..M8 + gravité + preuve.

⛔ **Aucune correction n'a été faite.** Ce document mesure, il ne répare pas.
⛔ **Aucun ticket n'a été ouvert** — le tri et l'ouverture des tickets reviennent au mainteneur.

---

## 1. Conditions de mesure

| | |
|---|---|
| Base | `origin/develop` @ `e4a338e21` |
| Serveur | `nuxt dev` du worktree, port **3210** (`:3000` appartient au dépôt principal — vérifié `lsof`) |
| Base de données | conteneur `marketing-db-jetable`, `DATABASE_URL` passée **en ligne de commande** — aucun `.env` créé |
| Navigateur | Chromium via Playwright 1.59.1, viewport 1280×900 |
| a11y | axe-core 4.13.0, devtools Nuxt **exclus du contexte** |
| Serveur | redémarré à neuf avant la passe définitive (pas de HMR intermédiaire) |

### Périmètre réellement mesuré — 122 pages

| lot | mesuré | total existant |
|---|---|---|
| pages statiques (`/`, `/why-origam`, `/installation`, `/support`, `/changelog`, `/roadmap`, `/theming`, `/wireframe`) | **8 / 8** | 8 |
| index de catalogue | **8 / 8** | 8 |
| fiches de détail (échantillon : 1 par catégorie, plafonné à 12 par type) | **85 / 2 735** | 2 735 |
| pages `/admin` (toutes redirigées vers la porte de connexion) | **5 / 5** | 5 |
| pages FR (statiques + index) | **16 / 16** | 16 |

Le brief annonçait « 15 pages statiques » : il n'y en a **8**. Les 21 fichiers de pages du
dépôt se répartissent en 8 statiques + 8 index + 8 gabarits `[slug]` + 5 admin.

**Les liens ont été vérifiés plus largement que les pages** : les 2 697 cibles internes
collectées sur les 106 pages EN ont été interrogées **une par une**.

---

## 2. Compte par critère

Sur les 122 lignes du classeur :

| critère | conforme | défaut | non applicable |
|---|---:|---:|---:|
| **M1** Rendu | 98 | 24 | — |
| **M2** Données | 16 | 22 | 84 |
| **M3** Liens | 5 | 117 | — |
| **M4** i18n | 104 | 18 | — |
| **M5** a11y | 56 | 66 | — |
| **M6** Visuel | 5 | 117 | — |
| **M7** Theming | **122** | 0 | — |
| **M8** SEO | 0 | 122 | — |

Gravité de la pire ligne : **15 bloquantes**, **107 majeures**, 0 page sans défaut.

`non applicable` = la page n'affiche aucun chiffre ni liste vérifiable. Ce n'est **pas** un
succès, et ce n'est pas non plus un trou de mesure.

---

## 3. Preuve que les instruments ne sont pas muets

Le mode de panne à écarter est « 0 défaut » indiscernable de « sonde muette ». Une page de
contrôle (`control.html`) porte un défaut **volontaire** par détecteur.

**Résultat : 16 / 16 détecteurs armés**, plus un contrôle négatif.

| détecteur | défaut semé | verdict |
|---|---|---|
| M1 erreur console / `pageerror` / hydratation | `console.error`, `throw`, warning « Hydration » | armé ×3 |
| M3 collecte de liens | `/cette-page-nexiste-pas`, `#ancre-inexistante` | armé |
| M4 clé brute / `{'@'}` littéral | `home.hero.title_line1`, `contact{'@'}example.com` | armé ×2 |
| M5 axe | `<img>` sans alt, `<button>` vide, contraste 1,1:1 | armé ×2 (7 règles, dont 2 critical) |
| M6 taille nulle / débordement / ombre transparente | 4 éléments fabriqués | armé ×4 |
| M7 lecture du thème | `data-theme="control"` | armé |
| M8 title / description / og:title absents | `<head>` vide | armé ×3 |

Contrôles supplémentaires :

- **Contrôle négatif M3** : `/components/ce-slug-nexiste-pas` → **404**, pas 200. Le routeur
  distingue bien une cible morte.
- **Contrôle négatif M6** : `/support` mesure `scrollWidth − clientWidth = 0`. La sonde de
  débordement ne crie pas partout.
- **Contrôle positif M7 statique** : un thème synthétique nommant `cettePropNexistePas` sur
  `origam-btn` et un composant inexistant sort les deux ; `variant` (prop réelle de Btn) sort
  `conforme`. Ni faux négatif, ni faux positif.

---

## 4. Trois verdicts faux corrigés en cours de route

Ils sont consignés parce qu'ils se reproduiront.

### 4.1 « 1 944 liens internes en HTTP 500 » — c'était ma propre charge

Première passe du vérificateur de liens, concurrence 8 : **1 944 cibles en 500**. Le corps de
la réponse disait :

```
"message": "Worker terminated due to reaching memory limit: JS heap out of memory"
```

J'avais fait tomber le worker Nitro du serveur de dev. Après redémarrage, `/types/color`
répond **200**. Re-mesure **sérielle**, avec lecture du corps de chaque non-200 pour séparer le
défaut de l'artefact : **2 697 cibles vérifiées, 1 967 hors sondage OOM répondent 200**, et il
reste **9 cibles réellement mortes**. Le serveur de dev retombe en OOM autour de la
1 970ᵉ requête — c'est une observation **de mode dev**, non qualifiée en production.

### 4.2 « 32 éléments de taille nulle sur /theming » — angle mort du détecteur

Un élément dans un ancêtre `display:none` (ou dans un `<details>` replié) a un rect 0×0, alors
que `getComputedStyle(el).display` vaut **sa propre** valeur, jamais `none`. Le détecteur ne
regardait que l'élément. Mesure indépendante : `.tb-group__label` fait **244 × 15 px**, pas 0.

Corrigé par `el.checkVisibility({ contentVisibilityAuto: true })`, contrôle négatif ajouté à la
page de contrôle. **Après correction : 0 élément de taille nulle sur les 122 pages.**

### 4.3 « violation axe `region` sur 106 pages » — c'étaient les devtools Nuxt

`nuxt-devtools-frame` est injecté par le serveur de **dev** et n'appartient pas au site. Une
fois exclu du contexte axe, `region` tombe de **106 pages à 5**, et `color-contrast` de
**104 pages / 717 nœuds à 40 pages / 618 nœuds**.

---

## 5. Causes communes — c'est là qu'est la valeur

### C1 — Deux entrées du pied de page n'ont jamais eu de page (117 pages)

`src/consts/nav.const.ts:85-86` déclare `/privacy` et `/contact`. Aucun fichier de page
correspondant. **404 en EN comme en FR.** Une seule cause, 117 pages touchées, et ce sont les
liens *légaux* du pied de page.

### C2 — Les descriptions du catalogue n'existent qu'en anglais (≈ 2 735 pages)

Mesuré en comparant le texte rendu de chaque page FR à son homologue EN :

| page | phrases FR | identiques à l'EN |
|---|---:|---:|
| `/fr/interfaces` | 736 | **732 (99 %)** |
| `/fr/consts` | 390 | **386 (99 %)** |
| `/fr/utils` | 403 | **399 (99 %)** |
| `/fr/components` | 97 | **93 (96 %)** |
| `/fr/composables` | 108 | **104 (96 %)** |
| `/fr/enums` | 110 | **106 (96 %)** |
| `/fr/types` | 112 | **108 (96 %)** |
| `/fr/directives` | 10 | **6 (60 %)** |
| `/fr`, `/fr/why-origam`, `/fr/installation`, `/fr/support`, `/fr/roadmap`, `/fr/theming`, `/fr/wireframe` | 249 | **0 (0 %)** |

Les fiches de détail sont touchées de la même manière (`/fr/composables/use-form` 70 %,
`/fr/utils/arc-path` 59 %, `/fr/enums/code-lang` 40 %).

**La racine est identifiée et documentée** : les descriptions viennent de la colonne
`descriptionFallback` en base, monolingue, et `scripts/i18n-check.mjs` le déclare lui-même
hors périmètre — *« populated from server/db (reference-mappers.ts) at runtime, not from static
literals in src/. Out of scope for static extraction by design. »* Le contrôle passe donc au
vert sur une traduction qui n'existe pas.

**Contre-épreuve importante** : les fichiers de locale statiques sont **irréprochables** —
1 366 clés EN, 1 366 clés FR, **0 écart de parité**, **0 clé hors `snake_case`**, **0 `@` non
échappé**, **0 chaîne en dur en template**, et **0 clé brute affichée** sur les 122 pages. Le
travail i18n est fait ; c'est le canal base de données qui n'a jamais été branché.

### C3 — Le changelog affiche la langue de `CHANGELOG.md`, pas celle du lecteur

`scripts/generate-changelog.mjs` extrait les textes de `/CHANGELOG.md` vers
`src/consts/changelog-versions.const.ts` sous forme de paires clé/repli. **99 clés de changelog
n'ont de définition ni en `en.json` ni en `fr.json`** (mesuré par `i18n-check.mjs`) : le repli
s'affiche dans les deux locales. Or l'entrée 2.17.1 de `CHANGELOG.md` est rédigée **en
français** :

```
summaryFallback: 'Hotfix. Quatre correctifs, aucune rupture d\'API. …'
```

Conséquence mesurée : **`/changelog` (EN) affiche du français** pour 2.17.1. Le commentaire du
fichier parle pourtant de « repli **anglais** extrait ici » — l'extraction ne garantit aucune
langue.

### C4 — Le site annonce un pipeline supprimé le 2026-08-31

`CLAUDE.md` acte la suppression de Style Dictionary v4 / Tokens Studio / plugin Figma. Textes
**rendus aujourd'hui** (hors entrées de changelog historiques, qui sont légitimes) :

| affirmation | pages qui l'affichent |
|---|---|
| « Style Dictionary v4 » | `/`, `/why-origam`, `/consts`, **et les 10 fiches de composant** (clé `components.detail.tokens.desc`) + leurs jumelles FR |
| « Tokens Studio » | `/`, `/why-origam` (+ FR) |
| « figma-plugin » | `/roadmap`, `/components/btn` (+ FR) |

`roadmap.waves.wave3.monorepo` annonce **« 6 packages (ds, marketing, stories, docs, tests,
figma-plugin) »** — il y en a **5**, `packages/figma-plugin` n'existe pas.

### C5 — Le compteur de composables se contredit sur la même page

`/composables` affiche **simultanément** « 80+ composables » (badge du héros, clé
`composables.hero.badge`) et **« 142 composables »** (compteur alimenté par la base). Idem sur
`/fr/composables`. `/roadmap` en affiche un troisième : **138** (fichiers `*.composable.ts`),
sous le même libellé « composables ».

Les trois nombres sont chacun exacts pour ce qu'ils comptent — 142 symboles `use*` exportés,
138 fichiers, 80 = valeur périmée — mais le lecteur voit trois chiffres pour une seule notion.

**Les autres compteurs sont justes, mesurés contre la source** : composants 218 ✓, directives
6 ✓, enums 137 ✓, interfaces 966 ✓, types 487 ✓, utils 371 ✓, « 26 chart primitives » ✓
(26 fichiers `OrigamChart*.vue`), version 2.17.1 ✓, « Node ≥ 22 » ✓.

### C6 — Trois défauts a11y du DS, pas du marketing

Les violations `serious`/`critical` viennent presque toutes de composants `origam-*`. Conformément
au principe « on corrige à la source », elles se réparent dans `packages/ds` :

| règle | impact | pages | nœuds | élément |
|---|---|---:|---:|---|
| `aria-allowed-attr` + `aria-prohibited-attr` | **critical** + serious | 14 + 13 | 68 + 34 | `#origam-input-*` — attributs ARIA non autorisés sur `OrigamInput` |
| `aria-command-name` | serious | 22 | 63 | `.origam-card-header__prepend[role="button"]` sans nom accessible |
| `color-contrast` | serious | 40 | 618 | deux couples seulement (§ C7) |
| `nested-interactive` | serious | 7 | 7 | `.origam-chart-sparkline__svg` |
| `label-title-only` | serious | 9 | 14 | champ dont le seul nom est un `title` |
| `label` | **critical** | 1 | 4 | `OrigamAudio` en état d'erreur |
| `scrollable-region-focusable` | serious | 3 | 3 | `.interface-props__table-wrap` |
| `image-redundant-alt` | minor | 101 | 101 | logo du pied de page : `aria-label="origam"` + `alt` identique |

### C7 — Le contraste tient à deux couples de couleurs, pas à 618 endroits

Les 618 nœuds en défaut se réduisent à **deux** couples, tous deux posés sur la surface pâle du
thème `geek` (`#fbf5ff`) :

| avant-plan | arrière-plan | ratio | exigé | où |
|---|---|---:|---:|---|
| `#beafd3` | `#fbf5ff` | **1,91:1** | 4,5:1 | `.origam-field__label--floating` — le libellé flottant des champs |
| `#d73a49` | `#fbf5ff` | **4,27:1** | 4,5:1 | jeton de coloration syntaxique dans `origam-code` |

Le premier est le plus grave : **40 nœuds sur la seule page `/components/btn`**, un libellé de
formulaire quasi invisible. Deux valeurs de jeton à corriger règlent les 618.

### C8 — Aucune carte de partage sur tout le site

`ogImage: { enabled: false }` dans `nuxt.config.ts`, sans repli statique : **0 page sur 122**
porte un `og:image`. Un seul réglage, 100 % du site.

### C9 — La marque apparaît deux fois dans 117 titres sur 122

`titleTemplate: '%s · origam'` s'applique à des titres de page qui contiennent déjà la marque :

```
"Installation · origam design system · origam"
"Components · origam design system · origam"
```

### C10 — 1 026 fiches sur 2 735 n'ont ni description ni og:description

`descriptionFallback` est vide en base pour **37,5 %** du catalogue. Le gabarit ne pose alors
aucune balise.

| type | fiches sans description |
|---|---|
| type | **412 / 487 (85 %)** |
| interface | 316 / 966 (33 %) |
| const | 160 / 408 (39 %) |
| enum | 44 / 137 |
| composable | 38 / 142 |
| component | 30 / 218 |
| util | 26 / 371 |
| directive | 0 / 6 |

### C11 — Références croisées dont la cible n'existe pas

Cinq cibles mortes, chacune produite par une dérivation de *slug* et non par un lien saisi :

| lien | code | référencé depuis | fait mesuré |
|---|---|---|---|
| `/types/-t-not-a-union` | **500** | `/types` (l'index lui-même) | `_TNotAUnion`, symbole **privé**, publié au catalogue ; son slug commence par `-` |
| `/types/t-color` | 404 | `/components/btn` | le vrai slug est `/types/color` (préfixe `T` retiré d'un côté, pas de l'autre) |
| `/composables/use-contrast` | 404 | `/interfaces/i-contrast-options` | `useContrast` **n'existe nulle part** dans `packages/ds/src` |
| `/composables/use-ripple` | 404 | `/interfaces/i-ripple-html-element-ripple` | `useRipple` **n'existe nulle part** |
| `/composables/activator` | 404 | `/interfaces/i-delay-props` | le vrai slug est `use-activator` |

Deux défauts distincts sur la première ligne : un symbole privé fuite dans le catalogue public,
**et** la fiche de détail transforme une erreur d'API 400 en **500** au lieu d'un 404
(`/components/ce-slug-nexiste-pas` renvoie bien 404 — le contraste prouve que c'est le
traitement d'erreur qui diverge, pas le routeur).

### C12 — Le garde d'orphelins de la base annonce 0 alors qu'il y en a 1

`/consts` affiche **408** entrées ; `server/db/seed/const.json` en contient **407**. L'écart est
`border-prop-keys` : présent en base et servi à `/consts/border-prop-keys` (HTTP 200), absent de
la fixture, **alors que `BORDER_PROP_KEYS` existe toujours dans la source** (5 usages, dont
`OrigamTextField.vue:203`). Le générateur l'a donc lâché et la base l'a gardé. Or :

```
$ docs:seed --check
[const] fixture=407 created=0 updated=0 unchanged=1896 orphaned=0
CHECK summary — created: 0, updated: 0, unchanged: 37217, orphaned: 0
```

Le contrôle est **aveugle à cet orphelin**. Les 7 autres types sont exacts au symbole près
(vérifié fixture ↔ API ↔ source).

### C13 — Hydratation : un même motif sur 23 pages

| page(s) | avertissements | motif |
|---|---:|---|
| `/theming`, `/fr/theming` | **486** chacune | `tb-nav__item--active` : l'onglet actif diffère entre serveur et client |
| `/components/card` | 36 | nœud `<i>` attendu côté client, absent côté serveur (`OrigamContainer`) |
| 6 pages `/enums/*` | 3 à 11 | `OrigamCard.enum-used-by__card` : le serveur rend **moins** d'enfants |
| 6 pages `/interfaces/*` | 3 à 9 | `OrigamChip size="x-small" variant="tonal"` : même motif |
| `/installation`, `/fr/installation` | 4 | `id="origam-tab-155"` côté serveur vs `origam-tab-9` côté client |
| 4 pages `/admin/*` | 2 | `NuxtLayoutProvider` |

Les identifiants générés qui divergent (`origam-tab-*`, `origam-input-v-0-0-0-*`) sont un
compteur de composant non synchronisé entre les deux rendus — c'est un défaut **du DS**.

### C14 — Deux props de thème et de composant sans effet, signalées à chaque page

Trois avertissements `[origam]` sortent sur **101 pages** :

```
<origam-chip> prop "variant" has no effect: theme names this prop but <origam-chip> does not declare it
<OrigamToolbar> prop "modelValue" has no effect on this component
<OrigamMessages> prop "active" has no effect on this component   (26 pages)
```

Audit statique des 8 thèmes contre les props réellement déclarées par les 218 composants
(interfaces résolues avec leurs `extends`) : **552 couples conformes sur 557**. Le seul couple
fantôme est `origam-chip.variant`, nommé par **5 thèmes** (apple, cartoon, ecom, editorial,
material) alors que `IChipProps` ne déclare pas `variant` — donc ignoré en silence par
l'intersection d'`installThemePropsResolver` (ADR-005).

Le thème actif du site étant `geek`, qui ne le déclare pas, **le rendu du site n'est pas
affecté** ; le défaut se manifesterait à l'activation de l'un des cinq autres.

### C15 — Les exemples du catalogue pointent vers 16 fichiers qui n'existent pas

`packages/marketing/public/` ne contient que **deux** fichiers : `favicon.ico` et `logo.svg`.
Or les fixtures du catalogue référencent **16 chemins d'actif local distincts**, tous absents :

```
/audio/sample.mp3   /audio/podcast.mp3   /audio/track1.mp3   /audio/track2.mp3
/audio/ambient.mp3  /audio/track.mp3     /audio/track.ogg
/img/a.jpg  /img/b.jpg  /img/c.jpg  /img/d.jpg
/img/workspace.webp  /img/slide-1.webp  /img/slide-2.webp  /img/album-cover.jpg
/images/card-cover.jpg
```

Constaté au rendu : `/components/audio` émet **trois `404` console** sur `/audio/sample.mp3`, et
c'est la seule page de l'échantillon à porter une vraie erreur console. Toute fiche dont
l'exemple affiche une image ou lit un son est concernée — **les fiches média n'ont jamais été
échantillonnées au-delà de `audio`, donc le nombre de pages touchées n'est pas mesuré.**

Cinq de ces chemins portent une **barre oblique inverse finale** dans la fixture
(`/audio/podcast.mp3\`) : le chemin est doublement faux.

### C16 — `origam.defaultTheme` est une configuration morte

`nuxt.config.ts` déclare `origam: { defaultTheme: 'origam' }` **et**
`app.head.htmlAttrs['data-theme'] = 'geek'`. Mesure : **122 pages sur 122 rendent
`data-theme="geek"`**. L'attribut statique gagne ; `defaultTheme: 'origam'` ne pilote rien
au-delà du reset de sous-arbre du Theme Builder.

---

## 6. M7 — ce qui est mesuré conforme, et comment

Seul critère à **122 / 122 conforme**. Ce n'est pas une colonne vide.

- Le thème rendu est celui voulu sur toutes les pages : `data-theme=geek`, `data-mode=light`.
- `lang` suit la locale — `en-US` sur les 106 pages EN, `fr-FR` sur les 16 FR. Le `lang` figé
  dans `htmlAttrs` est bien surchargé par `@nuxtjs/i18n` (vérifié au DOM, pas déduit).
- **Aucune couche n'écrase les `*.theme.ts`** : sur les 122 pages, **17 201 déclarations inline
  passent par un jeton `--origam-*`** contre **134 couleurs écrites en dur**, dont **122 sont le
  badge des devtools Nuxt** (un par page, injecté par le serveur de dev) et **12 les pastilles
  de prévisualisation du Theme Builder** sur `/theming` — légitimes par nature.

Soit **zéro couleur en dur imputable au site**.

---

## 7. Ce que je n'ai pas pu mesurer

Écrit ici pour ne pas être confondu avec « conforme ».

1. **`/docs/` et `/stories/` (11 cibles + 2 racines).** Ce sont des bundles statiques copiés
   dans `public/` par le `Dockerfile` ; ils n'existent pas en dev, donc leur 404 local ne prouve
   rien. Ce que j'ai pu mesurer : **les 11 sources `.md` visées existent toutes** dans
   `packages/docs/`. Les identifiants de story (`?story=components-chart--design`) ne sont pas
   vérifiables sans build Histoire. **Non mesuré.**
2. **Les 2 650 fiches de détail hors échantillon.** 85 mesurées sur 2 735. L'échantillon couvre
   au moins une catégorie par type, mais 12 catégories sur 154 pour les interfaces et 12 sur 110
   pour les types. **Les liens, eux, ont été vérifiés sur les 2 697 cibles collectées.**
3. **Les pages `/admin` au-delà de la porte.** Les 5 URL redirigent vers la connexion
   (`NUXT_ADMIN_PASSWORD_HASH` vide). Je n'ai mesuré que la porte. Le backoffice authentifié est
   **non mesuré**.
4. **`< 50 kb tree-shakable`** (`/`, `/why-origam`). Vérifier cette affirmation demande une
   mesure de bundle après tree-shaking, pas une lecture de source. **Non mesuré.**
5. **`100% — WCAG 2.1 AA`** (KPI de la page d'accueil). Je ne le déclare ni vrai ni faux : il
   porte sur la suite a11y du DS, pas sur le site. Je note seulement qu'il coexiste avec
   **900 nœuds `serious`/`critical` mesurés sur 66 des 122 pages** de la vitrine.
6. **Les fiches média hors `/components/audio`** (C15). Je sais que 16 actifs sont absents ; je n'ai pas énuméré les fiches qui les affichent. **Non mesuré.**
7. **Les fuites mémoire du serveur.** Le worker Nitro tombe en OOM autour de la 1 970ᵉ requête.
   Observation **de mode dev** ; je n'ai pas mesuré le build de production. **Non qualifié.**
8. **Les ancres internes** (`#section-props`, `#main-content`, …). Collectées (19 distinctes) mais
   leur cible n'a pas été vérifiée dans le DOM. **Non mesuré.**
9. **Le rendu mobile / responsive.** Tout est mesuré à 1280×900. Les débordements horizontaux
   relevés le sont à cette largeur seulement. **Non mesuré aux autres points de rupture.**
10. **Les 83 clés de locale mortes** signalées par `i18n-check.mjs` : comptées, pas listées ni
   qualifiées une par une.

---

## 8. Les 15 pages bloquantes

| page | ce qui bloque |
|---|---|
| `/consts/world-geographic-data` | débordement horizontal de **4 581 px** (`scrollWidth` 5 861 / `clientWidth` 1 280) |
| `/changelog`, `/fr/changelog` | `aria-allowed-attr` **critical** sur `origam-input` + C3 (langue) |
| `/theming`, `/fr/theming` | `aria-allowed-attr` **critical** + 486 divergences d'hydratation |
| `/components/{avatar, chart, alert, btn, app, audio, bottom-nav, dialog, card, blockquote}` | `aria-allowed-attr` **critical** (`origam-input`), et pour `/components/audio` une règle `label` **critical** de plus + `/audio/sample.mp3` en 404 |

---

## 9. Annexe — comment refaire la mesure

```sh
# 1. serveur propre, base jetable, AUCUN .env
DATABASE_URL="postgres://origam:origam_local_jetable@127.0.0.1:7432/origam_marketing" \
NODE_OPTIONS="--max-old-space-size=8192" \
pnpm -F @origam/marketing exec nuxt dev --port 3210

# 2. vérifier À QUI appartient le port avant de mesurer
lsof -ti :3210
lsof -p <pid> -a -d cwd -Fn | grep '^n'

# 3. armer les sondes AVANT de conclure quoi que ce soit
node probe.mjs urls-control.json out-control.json && node check-control.mjs   # doit sortir 16/16

# 4. vérifier les liens EN SÉRIE, et lire le corps de chaque non-200
#    (la concurrence 8 fait tomber le worker Nitro et fabrique 1 944 faux 500)
```

Les scripts de mesure vivent dans le répertoire de travail de la session et ne sont pas versionnés :
seuls l'inventaire et cette note le sont.
