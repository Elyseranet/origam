# `spec-coverage` — recensement et critère de classement (#824)

Ce fichier accompagne `spec-coverage.json`. La baseline ne porte que des noms
de fichiers ; le **critère** qui a servi à les y mettre est ici, pour qu'une
entrée puisse être contestée plutôt que reconduite.

---

## Le recensement — mesuré, pas estimé

`origin/develop` @ `17b0e7eec`, mesuré en interrogeant Playwright lui-même
(`playwright test --list --reporter=json`, une invocation par job de CI, avec
exactement les variables d'environnement de `ci.yml`) :

| | fichiers |
|---|---|
| specs présentes dans `packages/tests/e2e/` | **241** |
| exécutées par le job `test-e2e` (`E2E_GREEN_ONLY=1`) | **61** |
| exécutées par le job `test-e2e-marketing` (`MARKETING_GREEN_ONLY=1`) | **2** |
| **exécutées par AUCUN job de CI** | **178** |

⛔ Le ticket n'avançait aucun chiffre — seules deux occurrences étaient
connues. Il est de **178 sur 241, soit 74 %**.

Après cette PR : **62** gardées par `test-e2e` (`field-border-notch.spec.ts`
promue, voir plus bas), **2** par `test-e2e-marketing`, **177** enregistrées
dans la baseline.

### Remesuré après rebase sur `develop` @ `3e48e873` (#825 / ticket #813)

⚠️ Un recensement est une photographie de l'arbre : il périme à chaque merge.
Celui-ci a été **entièrement rejoué** après le rebase, pas extrapolé.

| | avant rebase | après rebase |
|---|---|---|
| specs sur le disque | 241 | **242** |
| `test-e2e` (`E2E_GREEN_ONLY=1`) | 62 | **63** |
| `test-e2e-marketing` | 2 | **2** |
| **exécutées par AUCUN job** | 177 | **177** |

#825 a ajouté `elevation-rungs.spec.ts` **et l'a inscrite dans
`GREEN_SPECS`** : le disque et le sous-ensemble gardé montent tous deux de 1,
et le nombre de specs orphelines **ne bouge pas**. C'est exactement le
comportement que #824 cherche à rendre normal — une spec neuve arrive avec sa
décision, au lieu de tomber en silence dans les 177.

Le taux reste **177 / 242, soit 73 %**. Le classement par date est inchangé
(**102** antérieures / **75** postérieures), `elevation-rungs.spec.ts` étant
gardée et donc hors baseline.

⚠️ **Les deux specs de #810 / #814 sont bien dans `GREEN_SPECS`** —
vérifié, pas supposé : `rating-field-a11y.spec.ts` et
`checkbox-radio-group-a11y.spec.ts` apparaissent toutes deux dans la sortie
de `playwright test --list` sous `E2E_GREEN_ONLY=1`, c'est-à-dire dans ce que
la CI exécute réellement, et non seulement dans le texte du fichier de
config.

Sur ces 178, **28 appartiennent à la config marketing**
(`MARKETING_SPEC_PATTERNS`) : elles visent le serveur Nuxt `:3000` et sont
inexécutables contre Histoire. Les 150 autres relèvent de la config Histoire.

---

## Le critère voulu / oublié

### Premier tri — la date de naissance du fichier

La liste blanche est née le **2026-06-22** (`bfefb6124`,
*« ci(e2e): gate the e2e job on the migrated green subset »*).

- Une spec **antérieure** appartient au retard de migration que `ROADMAP.md`
  documente explicitement (« faire entrer les specs restantes dans
  `GREEN_SPECS`, vague par vague »). Son auteur n'avait aucun mécanisme
  auquel s'inscrire : **exclusion voulue**, dette connue.
- Une spec **postérieure** a été écrite alors que le mécanisme existait. Son
  auteur devait s'y inscrire et ne l'a pas fait : **candidat oubli**.

Mesuré sur les **178** specs non gardées d'avant cette PR : **102
antérieures**, **76 postérieures** (dont 12 marketing).

⚠️ Après promotion de `field-border-notch.spec.ts` (postérieure, voir plus
bas), la baseline commitée en compte **177** : **102 antérieures**, **75
postérieures** (dont 12 marketing, donc **63** relevant de la config
Histoire). C'est ce second jeu de chiffres qui décrit le fichier
`spec-coverage.json` tel qu'il est versionné — le premier décrit l'état
mesuré avant l'intervention. Les deux ont été reproduits indépendamment en
rejouant le critère de date (`git log --diff-filter=A` par fichier, comparé à
la date de `bfefb6124`).

### Second tri — la spec passe-t-elle aujourd'hui ?

La date seule ne suffit pas : beaucoup de specs récentes sont des **sondes de
diagnostic** écrites pour mesurer un défaut, pas des filets de régression. Le
tri a donc été fait à l'exécution, pas à la lecture.

Les **64 specs postérieures non-marketing** ont été exécutées :
`pnpm -F @origam/stories build` (exit 0 capturé), puis Playwright contre le
Histoire **statique** sur un port isolé (`E2E_STATIC=1 E2E_HISTOIRE_PORT=6074`
— `:6006` appartenait à un autre worktree, vérifié via
`lsof -p <pid> -a -d cwd -Fn`), chromium.

| | fichiers |
|---|---|
| vertes | **63** (≈ 350 tests) |
| rouges | **1** |

➡️ **63 specs écrites après la mise en place de la liste blanche passent
aujourd'hui et ne sont exécutées par aucun job de CI.** Ce sont autant de
filets qui ne retiennent rien.

✅ **Rejoué indépendamment**, une fois `field-border-notch` réparée et
promue, sur les **63** postérieures non-marketing restantes, en une seule
invocation Playwright (`E2E_STATIC=1`, `E2E_HISTOIRE_PORT=6141`, chromium,
build des stories à exit 0 capturé hors pipe) :

```
342 passed · 1 skipped · 0 failed · 2.0 min · exit 0
```

Le chiffre de 63 vertes est donc mesuré deux fois, par deux agents, sur deux
exécutions distinctes. C'est la seule partie du recensement dont la valeur
puisse bouger avec le temps : une spec verte aujourd'hui peut pourrir demain
sans que rien ne le dise — c'est très exactement ce qui est arrivé à
`field-border-notch`, et la raison pour laquelle « hors liste » n'est pas un
état neutre.

⚠️ **« Verte sur une exécution » n'est pas « stable ».** C'est la leçon de
#820, mesurée dans le même lot : un test tombant 1 fois sur 5 est invisible
sur un seul passage. Promouvoir une de ces 63 specs demande le contrôle de
stabilité (`--repeat-each=5`) décrit dans le `fixHint` du garde. Aucune n'a
été promue en masse — la consigne du ticket est de **classer**, pas de
réintégrer.

### La rouge — et ce qu'elle prouve

`field-border-notch.spec.ts` (#726, née le 2026-09-14) : **4 tests sur 4 en
échec**, `locator.click: Test timeout of 60000ms exceeded`. Rejouée seule,
même verdict — ce n'était donc pas une famine de workers.

Cause : la spec cliquait l'option `'Width — thick (utility, 3px)'`.
`#730` / PR #791 (`fd9c5cbca`, 2026-09-16) a corrigé ce libellé en `2px` — la
valeur réellement rendue. `selectHstOption` clique en `exact: true` : l'option
n'existait plus.

⛔ **La spec était donc rouge depuis deux jours, et rien ne l'a dit** —
exactement la thèse de #824, avec une victime de plus que celles connues du
ticket. Libellé recalé, elle repasse **4/4 en 4,5 s** (contre 4 minutes de
timeouts), **20/20** en `--repeat-each=5`. Elle est promue en `GREEN_SPECS`
(vague 10) et ne figure donc PAS dans la baseline.

---

## Ce que la baseline signifie, et ce qu'elle ne signifie pas

`spec-coverage.json` dit : **« au moment où elle a été établie, ces specs
n'étaient exécutées par aucun job de CI, et c'est connu. »**

Elle ne dit ni qu'elles sont bonnes, ni qu'elles passent, ni qu'elles doivent
rester dehors. Elle n'est pas un silencieux : le mécanisme de
`lib/baseline.mjs` ne laisse la liste que **rétrécir**. Une entrée qui
devient gardée, ou dont le fichier disparaît, devient **périmée** et fait
rougir le garde jusqu'à ce qu'on la supprime.

⛔ **Ne jamais ajouter une entrée pour faire passer le garde.** Un diff de
baseline qui grandit est en soi un signal de revue : il veut dire qu'une spec
neuve a été écrite et qu'on a décidé qu'aucune CI ne l'exécuterait. Cette
décision peut être la bonne — elle doit être écrite dans la PR.

---

## Le contrôle positif du garde — vert → rouge → vert

⛔ Sans ce témoin, un garde qui ne détecterait rien afficherait exactement le
même vert. Mesuré, exit codes capturés hors pipe :

Rejoué **intégralement après le rebase** sur `develop` @ `3e48e873` — un
témoin qui a fermé sur l'arbre précédent ne prouve rien sur celui-ci :

| état du dépôt | verdict | exit |
|---|---|---|
| tel quel | `PASS — 177 known, 0 new` · 242 / 63 / 2 | **0** |
| + `zz-…-positive-control.spec.ts` **à plat**, hors liste blanche | `FAIL — 1 NEW` · nomme le fichier | **1** |
| la même spec **ajoutée à `GREEN_SPECS`** (fichier conservé) | `PASS` · 243 / **64** / 2 | **0** |
| + `ac76ctl/nested.spec.ts` **dans un sous-répertoire** | `FAIL — 1 NEW` · `ac76ctl/nested.spec.ts` | **1** |
| témoins retirés | `PASS` · 242 / 63 / 2 | **0** |

La troisième ligne est celle qui discrimine : elle prouve que le garde réagit
à la **liste blanche**, et pas simplement à « un fichier est apparu ». Un
garde qui ne ferait que compter les fichiers neufs serait rouge là aussi.

**Non-vacuité** : le balayage lit 242 fichiers et 63 + 2 gardées à chaque
passage. Un balayage vide est bloquant par construction (`blindnessCheck`,
3 fixtures) — le piège du garde livré dans ce dépôt qui annonçait `PASS`
après avoir lu zéro fichier ne peut pas se reproduire ici.

---

## Un trou trouvé dans le garde lui-même, et bouché

La première version balayait le disque avec un `readdirSync` **à plat**.
Mesuré : les 241 specs sont effectivement à plat aujourd'hui, donc le verdict
était juste — mais une spec rangée dans un sous-répertoire aurait été
**invisible au garde alors que Playwright la collecte**. Témoin :

```
ANCIEN balayage (plat)  : 241 fichiers · voit ac76ctl/nested.spec.ts ? false
Playwright (--list)     : 211 → 212 fichiers · la collecte, elle, la voit
```

Elle n'aurait figuré ni dans les gardées, ni dans les non-gardées, ni dans la
baseline : le silence structurel de #824, reproduit à l'intérieur de l'outil
chargé de le supprimer. Le balayage est désormais **récursif**, en chemins
relatifs au `testDir` plutôt qu'en `basename` (deux specs homonymes dans deux
dossiers restent deux entrées), et saute les répertoires-points pour dire
exactement ce que dit `scratchDirPatterns()` — une divergence dans un sens
produirait un faux rouge sur une sonde jetable, dans l'autre un angle mort.
6 fixtures supplémentaires épinglent cette règle (20 au total).

Le verdict sur l'arbre réel est **inchangé** après ce durcissement
(241 / 62 / 2 / 177), ce qui était l'objectif : boucher le trou sans déplacer
la mesure.

---

## Pourquoi DEUX configs suffisent — vérifié, pas supposé

Le garde n'interroge que deux configs. Si un troisième job de CI exécutait des
specs de `e2e/`, le garde déclarerait « exécutée par AUCUN job » des specs qui
tournent — un faux rouge, et surtout un recensement faux.

`ci.yml` contient **cinq** invocations de Playwright. Leur `testDir` a été
lu :

| ligne | config | `testDir` | concerne `e2e/` ? |
|---|---|---|---|
| 379 | défaut (`E2E_GREEN_ONLY=1`) | `./e2e` | **oui** — modélisée |
| 451 | `playwright.marketing.config.ts` (`MARKETING_GREEN_ONLY=1`) | `./e2e` | **oui** — modélisée |
| 543 | `playwright.a11y.config.ts` | `./a11y` | non |
| 610 | `playwright.a11y.marketing.config.ts` | `./a11y` | non |
| 656 | `playwright.vrt.config.ts` | `./vrt` | non |

Les deux seules configs pointant sur `./e2e` sont donc bien les deux
modélisées.

⚠️ **Et le mécanisme de liste blanche n'existe qu'ici** : `playwright.a11y`
et `playwright.vrt` n'ont **aucune** variable `*_GREEN_ONLY` — seulement un
`testIgnore` d'aires de brouillon. Les 3 specs de `a11y/` et `vrt/`
tournent donc intégralement. Il n'y a pas de second angle mort du même type
ailleurs dans le paquet : la question « depuis quand / où ailleurs »
qu'ouvrait le ticket est close pour la classe de défaut décrite.

---

## Angle mort connu, non levé

`E2E_GREEN_ONLY` n'est posé que par la CI. Un agent qui lance la suite en
local **sans** la variable exécute les **211** specs de la config Histoire
(241 moins les 30 specs marketing écartées par `testIgnore` — mesuré), donc
un périmètre différent de celui de la CI. Ce garde mesure le périmètre **de
la CI** ; il ne dit rien de l'écart entre les deux, qui reste à documenter.

---

# Les 28 marketing baselinées ont enfin été EXÉCUTÉES (#835)

#824 avait classé les 12 specs marketing **sans les exécuter** — il le disait
dans ses non-vérifiés. #835 comble ce trou. Voici ce que ça a donné, et le
critère de classement, pour que chaque ligne puisse être contestée.

## Périmètre réel — mesuré, pas repris

En interrogeant Playwright lui-même (`--list`, config marketing) :

| | |
|---|---|
| fichiers marketing (`MARKETING_SPEC_PATTERNS`) | **31** |
| tests marketing | **469** |

⛔ Le chiffre de **75 échecs** du ticket était un relevé d'un agent sur **14
fichiers**, pas un balayage. Le périmètre réel est plus du double.

## Ce qui a pu être mesuré, et ce qui ne l'a pas été

⚠️ **Le balayage complet n'a PAS abouti : le worker SSR du serveur de dev est
mort en cours de route — #248, connu, hors périmètre de ce ticket.** Signature
sans ambiguïté : à partir du test **#268**, **21 échecs consécutifs**, puis
`curl` sur toute page renvoyant **HTTP 500** sur un process à 42 Mo de RSS et
0 % de CPU, et un journal de dev de **1,2 Go** de dumps de structures
circulaires.

| | |
|---|---|
| tests exécutés avant la mort du worker | **267** |
| dont échecs | **28** |
| tests jamais exécutés | **~202** (13 fichiers) |

**Les 17 fichiers couverts** : `api-docs-generated`, `changelog`, `components`,
`composables`, `home-cta`, `home-features`, `home-hero`, `home-kpis`,
`home-playground`, `home-showcase`, `home-themes`, `installation`,
`marketing-brand-presets`, `marketing-nav-locale`, `marketing-nav-ssr`,
`marketing-no-third-party`, `marketing-primary-nav` — plus
`marketing-theme-builder` **partiellement** (19 tests sur 30, les derniers dans
la zone de crash, donc **non fiables**).

**Les 13 fichiers non exécutés** : `marketing-theme-live-switch`,
`marketing-theming`, `marketing-theming-controls`,
`marketing-theming-isolation`, `marketing-theming-theme-bg-and-triggers`,
`marketing-theming-toggle-vs-split-parity`,
`marketing-theming-viewport-height`, `nav-link-availability` (traitée par
#836), `roadmap`, `theming-feedback-tokens`, `types`, `why-origam`,
`wireframe`.

## Le critère de classement

Une spec rouge est classée **spec périmée** quand le produit a changé
DÉLIBÉRÉMENT et que le commit qui l'a changé est identifiable ; **vrai
défaut** quand le produit ne fait pas ce qu'il déclare faire. Les deux se
tranchent en lisant la source du produit, jamais en regardant lequel des deux
est le plus simple à modifier.

### Vrai défaut produit — 6 échecs, **une seule cause**

Les cinq tests « Sobre — … » de `home-cta` / `home-features` / `home-kpis`
mesuraient des styles calculés sur une page peinte par le **mauvais thème**.
Cause : `data-theme: 'geek'` codé en dur dans `app.head.htmlAttrs`
(`nuxt.config.ts`), réécrit par unhead ~1,36 s après la navigation, par-dessus
ce que le serveur avait rendu. Les deux axes (marque ET clair/sombre) étaient
écrasés, sur toutes les pages, pour tous les visiteurs, depuis le 2026-06-12.

➡️ **Ces specs n'étaient pas périmées : elles attrapaient un vrai défaut**, que
personne ne voyait parce qu'aucun job de CI n'exécute les specs marketing.
Corrigé ; gardé par `marketing-theme-honored.spec.ts`, désormais dans
`MARKETING_GREEN_SPECS`.

Le sixième — `home-showcase.spec.ts:238` (AvatarGroup sous `cartoon`, #263) —
est **resté rouge après ce correctif** et n'a pas été instruit. Voir plus bas.

### Spec périmée — 11 échecs, toutes datables

| spec | ce qu'elle épinglait | ce que le produit fait | depuis |
|---|---|---|---|
| `changelog` ×2 | version par défaut `2.6.0` | `CHANGELOG_VERSIONS` regénéré à chaque release, aujourd'hui `2.17.1` | chaque release |
| `home-cta` ×2 | `/docs`, `/docs/getting-started` | `/components`, `/installation` (`cta.const.ts`) | `ddb07005b`, 2026-06-17 |
| `home-features` | `29 chart primitives` | `26` (`en.json`) | inventaire |
| `home-hero` | `95 components` | `218` (`en.json`) | inventaire |
| `home-kpis` ×2 | `95`, `29` | `218`, `26` (`kpis.const.ts`) | inventaire |
| `home-themes` ×3 | tuiles `brand-a` / `brand-b`, 3 surfaces distinctes | `cartoon` / `apple`, surfaces blanches légitimes | `THEME_PREVIEW_TILES` |

⛔ **Le remède n'est pas de recopier la nouvelle valeur quand la valeur est un
INVENTAIRE.** `29 → 26` a BAISSÉ : même une borne « au moins N » ne tiendrait
pas. Ces assertions portent désormais sur la forme (« un nombre suivi de
`components` ») et non sur le compte. Là où la valeur est une DÉCISION produit
— la cible d'un CTA, le jeu de tuiles de la vitrine — elle reste épinglée, sur
ce qui est réellement servi.

### Non tranché — 11 échecs, **explicitement laissés ouverts**

Ils restent dans la baseline, avec leur motif :

| spec | échecs | motif de l'exclusion |
|---|---|---|
| `marketing-theme-builder` | 7 | durées de 19 s à 2,6 min par test : coût d'accumulation de `waitForLoadState('networkidle')`, qui n'aboutit pas toujours sur un serveur Nuxt de dev (une expiration à 30 s mesurée directement). Le fichier en compte **34 occurrences**. Réparer suppose de remplacer l'attente dans 6 fichiers `/theming` — chantier à part entière, pas une retouche. |
| `marketing-brand-presets` | 1 | même cause (8 occurrences de `networkidle`), même chantier. |
| `components` | 2 | section « Design Tokens » et page de repli 404 ; dépendantes des données servies par PostgreSQL, non instruites. |
| `composables` | 1 | page de repli 404 pour un slug inconnu ; même famille que ci-dessus. |

⚠️ **`home-showcase.spec.ts:238` (#263) est rouge APRÈS le correctif de thème**
et n'a pas été instruit non plus. Mesuré en marge : dans la vitrine, la tuile
`cartoon` rend un bouton à `border-top-width: 1px` et `box-shadow: none`, là où
l'identité cartoon annonce 3 px et une ombre dure. Ça ressemble à un vrai
défaut de theming, pas à une spec périmée — **à instruire, ce n'est pas établi.**

## Ce qui reste explicitement hors de ce lot

- Les **13 fichiers jamais exécutés** (~202 tests) : le compte réel du lot
  marketing n'est donc **pas** établi, et ne le sera pas tant que #248 rendra
  un balayage complet impossible en une passe.
- La famille `networkidle` sur `/theming` (6 fichiers) : identifiée, chiffrée,
  non corrigée.
- Aucune de ces specs n'a été promue en masse dans `MARKETING_GREEN_SPECS` —
  une seule l'a été, neuve, avec son contrôle positif et sa mesure de
  stabilité. C'est la consigne de #771 : une CI rouge en permanence est le
  défaut symétrique de celle qui n'exécute rien.

## Arbitrage rendu — `geek` reste l'apparence, déclarée là où le DS la lit

Décision mainteneur, 2026-09-17 : **`geek` reste ce que le site montre**, mais
via `origam.defaultTheme` (`nuxt.config.ts`) et non via `app.head.htmlAttrs`.

La distinction est tout l'objet du correctif. `defaultTheme` est lu par
`resolveServerTheme()`, qui résout `cookie ?? defaultTheme` : il ne s'applique
**qu'en l'absence de choix du visiteur**. Un attribut de `head` est au contraire
réappliqué par unhead à chaque rendu, **par-dessus** ce choix.

Les deux propriétés tiennent ensemble, mesurées séparément :

```
1. defaut (aucune preference)      -> theme=geek     mode=light   cookie=null
2. apres clic sur le chip cartoon  -> theme=cartoon  mode=light   cookie=cartoon
3. apres rechargement              -> theme=cartoon  mode=light   cookie=cartoon
4. apres navigation vers /roadmap  -> theme=cartoon  mode=light   cookie=cartoon
```

⛔ **Contrôle positif — et il dit quelque chose d'important.** En réintroduisant
`'data-theme': 'geek'` dans `app.head.htmlAttrs`, avec `defaultTheme: 'geek'`
en place :

```
✓ / — rend "geek" par défaut …                     (3 tests VERTS)
✘ le couple marque + mode … survit au rechargement
  « marque choisie "cartoon" perdue à l'hydratation — <html> affiche "geek" »
```

**Les trois tests d'apparence par défaut passent** : la valeur écrite par unhead
et celle rendue par le serveur coïncident alors. Le défaut n'est visible QUE du
point de vue d'un visiteur qui a choisi autre chose. **C'est exactement ainsi
qu'il a vécu trois mois sans être vu : son symptôme est l'apparence normale du
site.** Un test qui ne vérifierait que l'apparence par défaut ne le rattraperait
jamais.

## Conséquence : les tests « Sobre — … » demandent désormais leur thème

Cinq tests de style calculé s'intitulent « Sobre — … » et assertent les valeurs
du thème `sobre`. Aucun ne demandait ce thème : ils chargeaient `/`, à l'époque
où `sobre` était le défaut. Ce défaut a bougé **deux fois** — `sobre` → `origam`
(2026-06-27), puis `origam` → `geek` (2026-09-17) — et ils sont devenus rouges à
chaque fois **sans que leur objet ait changé**.

Ils appellent maintenant `applyBrand(page, 'sobre')`
(`e2e/_support/marketing-theme.ts`) : un test nommé d'après une marque demande
cette marque, et redevient un vrai filet — s'il casse, c'est que la marque a
changé de rendu, pas qu'un réglage sans rapport a bougé.

Le sixième de la famille épinglait `rgb(250, 250, 250)` pour la surface
« raised » de sobre. Mesuré : `--origam-color__surface---raised` vaut `#ffffff`
aujourd'hui, et la carte le consomme correctement — **la valeur appartient au
thème, pas au test**. L'assertion compare désormais le fond rendu au jeton
résolu, ce qui garantit le CÂBLAGE sans réécrire un hex qui bougera encore.

## ⚠️ Une violation a11y préexistante, révélée puis remise au chaud — #842

Restaurer le thème configuré a fait apparaître, sous **`origam`**, une violation
que le `geek` en dur masquait :

```
color-contrast · serious · 9 nœuds
  #737373 sur #f7f7f7  →  4.42:1
  #737373 sur #f5f5f5  →  4.34:1
  seuil WCAG 2 AA : 4.5:1
```

`components.spec.ts:314` passait avant, échouait après — A/B sur la vraie spec.

⛔ **Ce n'est pas une régression du correctif : c'est un défaut du thème
`origam`.** Comme l'arbitrage garde `geek` en thème rendu, il n'est **pas
exposé** par défaut — un visiteur ne le rencontre que s'il choisit `origam`
lui-même. Non corrigé ici : choisir le jeton de remplacement est une décision de
design. **Ticketé en #842**, famille de #789 et #819.
