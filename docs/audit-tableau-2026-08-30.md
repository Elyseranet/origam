# Audit du tableau de tickets — 2026-08-30

Audit ticket par ticket des 41 issues GitHub labellisées `bug` et ouvertes,
pour établir un verdict fiable avant fermeture/retriage. Méthode : lecture du
code réel, exécution des outils de mesure (`guards/run-all.mjs`,
`token-var-channels.mjs --why`, `audit:id-forwarding`, `vitest --run`), et
`git log` pour repérer un fix déjà mergé. Aucun fichier de production n'a été
modifié — seul ce document est un livrable.

Baseline outillage (2026-08-30, `develop` @ `f36d0d32`, `pnpm install`
frozen-lockfile) :
- `node packages/ds/scripts/guards/run-all.mjs` → **17/17 PASS** (les
  violations "baselinées" listées ci-dessous sont la population ACTUELLE du
  défaut, pas une preuve d'absence : PASS = rien de nouveau, pas rien à
  corriger).
- `pnpm -F @origam/tests test:unit:run` → **411 fichiers, 5715 tests
  passants, 0 échec, 5 échecs attendus, 77 skip**.
- `pnpm -F @origam/tests audit:id-forwarding` → 192 composants avec prop
  `id`, **0 "lost"** (PASS).
- `cd packages/ds && node scripts/build-tokens.mjs --dry-run --strict` → OK,
  seules alertes = collisions de tokens cross-thème, actées comme non
  bloquantes par CLAUDE.md.

⛔ E2E complet non lancé (contention avec la passe en cours sur le dépôt
principal, cf. #357).

---

## 1. Tableau de synthèse (mise à jour incrémentale)

| # | Titre court | Verdict | Chiffre remesuré |
|---|---|---|---|
| 320 | 500 au lieu de 404 sur `/<kind>/[slug]` | PARTIEL / INCERTAIN | non remesurable sans serveur+DB |
| 335 | Champ recherche cartoon — artefact visuel | VALIDE | inchangé (cause non prouvée, comme le ticket l'indique lui-même) |
| 357 | Flakes e2e de contention | JE N'Y ARRIVE PAS (remesure) | n/a — e2e complet interdit pendant l'audit |
| 370 | Seed Media pointe vers un fichier de tokens inexistant | VALIDE | inchangé : 1 (baseline `seed-source-paths.json`) |
| 371 | DataTable : closure dans le DOM + ADR-005 + a11y + story manquante | VALIDE (5/5 sous-défauts confirmés) | 5 sous-défauts, tous encore présents |
| 383 | `useLayoutItem` écrase le `width` du consommateur | **RÉSOLU** | PR #464 |
| 387 | Blockquote : `letterSpacing` mort + tiret/virgule orphelins | **RÉSOLU** | PR #460 |
| 388 | Bracket : slot `competitor` perdu, doc/story en retard | **RÉSOLU** | PR #481 (fontFamily/lineHeight retirés par #501, pas un oubli) |
| 389 | 10 fichiers de tokens component non référencés | PARTIEL — **chiffre corrigé, voir note ci-dessous** | **1/10** orphelin restant (`bracket`) — sound/qrcode/watermark n'existent plus du tout dans `tokens/component/` (supprimés par #436-B, commit `651a3a90`), donc ne sont plus "orphelins", ils sont retirés |
| 391 | Stratégie classes-first perdante face au sélecteur scopé (Btn) | VALIDE | cas concret (Btn) confirmé inchangé ; portée "92 composants" non re-mesurée indépendamment |
| 393 | 13 composants déclarent leurs défauts dans un `:root{}` du `.vue` | VALIDE (composition changée) | 11 composants à couverture nulle + 3 partiels (Col/Row/BtnGroup) = **235 vars non couvertes** (contre 215 annoncés) ; Tab/Tabs/SnackbarGroup/Spacer sont désormais à 100 % |
| 394 | Transform Style Dictionary casse le nommage BEM sur les clés enfant à tiret | PARTIEL | mécanisme réparé par #435 (`$child`/`$state`) — vérifié corrigé sur les 2 exemples cités par le ticket (carousel.controls-item, calendar.day-cell) ; Audio reste cassé (migration non faite, encore dans la baseline dead) |
| 405 | 338 déclarations CSS lisent une variable inexistante sans repli | PARTIEL | **34** (guard `--why`, catégorie "sans repli — rendu cassé"), contre 338 annoncés — les 2 exemples nommés du ticket (Avatar, AvatarGroup) sont vérifiés corrigés |
| 436 | Tokens orphelins : 10 non construits + 12 construits sans lecteur | PARTIEL (quasi soldé) | Population A : **1/10** orphelin restant (`bracket`, bloqué sur la migration `$child`). Population B : **0/12** restant. Les 3 divergences que le dernier commentaire du ticket disait encore ouvertes (grids/progress-linear/date-picker) sont désormais réparées — vérifié dans le code |
| 479 | Chiffrer (pas corriger) le masquage local des tokens component-level | VALIDE (non commencé) | 0/4 familles mesurées (List/DataTable/Picker/Field) ; seul Breadcrumb, hors périmètre de CE ticket, a un chiffre (24/26, PR #478) |
| 492 | ThemeProvider : `inheritAttrs:false` sans `v-bind`, attrs perdus | VALIDE | inchangé — sonde `it.fails` toujours "1 expected fail" à l'exécution réelle du jour |
| 514 | Strategy A (colorStyles vide si tokenisé) contredite par le code | ARBITRAGE | confirmé par lecture de code — `fgDecl` est poussé dans `styles` même pour une valeur tokenisée ; CLAUDE.md affirme toujours le contraire aujourd'hui |
| 515 | CLAUDE.md dit l'inverse du resolveur (union vs intersection) | ARBITRAGE / PARTIEL | confirmé par lecture de code — le guard `if (!(key in rawProps)) continue` fait une INTERSECTION ; CLAUDE.md dit toujours "not on what the component opted into" (union). Mesure de l'ampleur non faite |

*(tableau complété au fur et à mesure des lots suivants)*

---

## 2. Détail par ticket

### #320 — 500 au lieu de 404 sur `/<kind>/[slug]` — PARTIEL / INCERTAIN

**Preuve.** `packages/marketing/src/composables/useApiReference.ts` (fonction
`useReferenceDoc`) fait déjà, depuis le commit `ce6172d2` (2026-06-29, soit
**avant** l'ouverture du ticket le 2026-07-28), la distinction 404/500 :
`throw createError({ statusCode: status === 404 ? 404 : 500, fatal: true, ... })`
où `status` vient de `result.error.value.statusCode`. Le endpoint serveur
`packages/marketing/server/api/reference/[kind]/[slug].get.ts` renvoie bien
`createError({ statusCode: 404, ... })` quand l'entrée n'existe pas (ligne 79-81).
Vérification du mécanisme `ofetch` (`node_modules/.pnpm/ofetch@1.5.1`) : la
classe `FetchError` alias bien `.statusCode` sur `ctx.response.status` — la
chaîne de propagation du 404 est donc structurellement correcte sur le papier.

**Ce qui reste ouvert.** Les 8 pages `[slug].vue` appellent toutes
`useReferenceDoc` avec `fatal: true` directement dans le corps du
`<script setup>` (`await useReferenceDoc(...)`) : si ça lève, Nuxt rend sa
page d'erreur GLOBALE (`error.vue`), pas la branche locale
`component-detail-not-found` déjà présente dans le template (`v-if="!catalogEntry"`,
`packages/marketing/src/pages/components/[slug].vue:174-213`). Cette branche
est donc bien **morte pour le cas 404** — ce point du ticket est confirmé par
lecture de code. En revanche, je n'ai **pas pu vérifier empiriquement** que le
statusCode livré au navigateur est réellement 500 : ça nécessiterait un
serveur marketing + PostgreSQL + données seedées, hors périmètre d'un audit
rapide sans copier de secrets. Je n'y arrive pas à confirmer ou infirmer le
symptôme HTTP exact avec les moyens de cet audit.

**Recommandation.** Ne pas fermer sans reproduction serveur réelle. Si
reproduit, le fix le plus probable est de rendre `useReferenceDoc` non-fatal
(`fatal: false`) + `setResponseStatus(event, 404)` côté page pour que la
branche locale s'affiche à la bonne URL avec le bon code HTTP.

---

### #335 — Champ de recherche cartoon, artefact visuel à l'extrémité droite — VALIDE

**Preuve.** Le ticket lui-même indique explicitement "NON établi — la cause
n'est pas prouvée" et demande une mesure par rendu réel. Lecture de
`packages/ds/src/components/Field/OrigamField.vue` (~ligne 927-931) : le
segment `__outline--start` a un `flex-basis` calculé
(`max(padding-start, min(border-radius, height))`) pour absorber le rayon du
coin, alors que `__outline--end` (ligne ~931) est simplement `flex: 1`, sans
traitement symétrique du rayon. L'asymétrie de code existe bel et bien et est
un candidat plausible, exactement comme le ticket le formule — mais aucun
commit n'a touché `OrigamField.vue` depuis l'ouverture (2026-07-30), et je
n'ai pas fait tourner de mesure Playwright réelle (hors périmètre : aurait
demandé Histoire sur un port dédié + thème cartoon monté). Le défaut reste
donc VALIDE, chiffre non applicable (défaut qualitatif), cause toujours non
prouvée comme annoncé par le rapporteur.

---

### #357 — Population de flakes e2e sous contention — JE N'Y ARRIVE PAS (remesure)

Ticket sur la CI elle-même : deux échecs différents (`drawer.spec:149`,
`radio.spec:157`) sur 3 passes complètes, tous deux verts en isolé. Consigne
explicite de la mission : ne pas lancer l'e2e complet pendant cet audit
(contention avec la passe en cours sur le dépôt principal). `git log --all
--grep` ne montre aucun commit de "barrière d'interactivité" proposé par le
ticket comme piste de correctif. Je ne peux donc ni confirmer que le flake
persiste, ni remesurer son taux, sans enfreindre la contrainte anti-e2e. Je
n'y arrive pas pour ce ticket — reste VALIDE par défaut faute de preuve du
contraire, mais non remesuré.

---

### #370 — Seed Media pointe vers un fichier de tokens jamais créé — VALIDE, chiffre inchangé (1)

**Preuve.** Le garde `seed-source-paths` (`node packages/ds/scripts/guards/run-all.mjs`)
donne PASS avec exactement **1** violation baselinée. Le fichier
`packages/ds/scripts/guards/baseline/seed-source-paths.json` contient
exactement `["packages/ds/tokens/component/media.json"]` — ce fichier
n'existe toujours pas sous `packages/ds/tokens/component/` (seuls
`media-controller.json` et `media-scrubber.json` y sont présents). Le défaut
est réel, non corrigé, et le chiffre annoncé par le ticket (1 entrée) est
exact et inchangé. Le ticket décrit lui-même correctement qu'il s'agit d'une
décision de contenu (quel fichier réel doit remplacer la référence), pas
d'une réécriture mécanique — reste donc ouvert tel quel.

---

### #371 — DataTable : closure dans le DOM, ADR-005, a11y, story manquante — VALIDE (5/5 sous-défauts confirmés)

Tous les sous-défauts ont été revérifiés ligne à ligne sur le code actuel :

1. **Closure sérialisée dans le DOM.** `IDataTableGroupHeaderRowProps`
   (`packages/ds/src/interfaces/DataTable/group.interface.ts`) ne déclare pas
   `isGroupOpen` (seulement `toggleGroup`), alors que
   `OrigamDataTableRows.vue:179-180` l'injecte dans les props du slot de
   groupe et que l'interface voisine `IDataTableGroupHeaderSlot` le déclare,
   elle. Confirmé — fallthrough Vue vers l'attribut DOM `isgroupopen="..."`.
2. **ADR-005 — lectures eager.** `OrigamDataTableHeaderCell.vue:111` et
   `OrigamDataTableHeadersCellMobile.vue:238` ont toujours
   `const headerProps = mergeProps(props.headerProps ?? {})` en haut du
   `<script setup>` (pas dans un `computed`) — thème visant `headerProps` sur
   ces deux composants toujours mort.
3. **Sélecteur "Items per page" sans nom accessible.**
   `OrigamDataTableFooter.vue` a toujours `<span>{{ t(itemsPerPageText) }}</span>`
   suivi d'un `<origam-select>` sans `for`/`id`/`aria-labelledby` reliant les
   deux. Confirmé.
4. **`OrigamDataTableRow` — fuite d'attributs.** `IDataTableRowProps` ne
   déclare que `item`/`cellProps` (+ `mobileBreakpoint` via `IDisplayProps`).
   `OrigamDataTableRows.vue` (~ligne 187-206) injecte toujours `index` et
   `mobile` en plus — un commentaire du code montre qu'un bug voisin
   (mobileBreakpoint mal propagé) a déjà été corrigé, mais sans nettoyer ces
   deux clés non déclarées qui continuent à fuir en attributs DOM bruts
   (`index="0" mobile="false"`).
5. **`mobileBreakpoint` sans contrôle de story.**
   `grep -c "mobileBreakpoint" packages/stories/.../OrigamDataTable.story.vue`
   → toujours **0**.

Les 5 sous-défauts sont donc tous VALIDES et inchangés. Le pattern transverse
signalé (props forward par objet construit dynamiquement qui dépasse
l'interface déclarée → fuite DOM, invisible aux 17 gardes actuels) est réel
et mérite effectivement sa propre vérification systématique, mais ce n'est
pas un bug ponctuel — c'est un chantier d'outillage à part (à noter comme
piste pour un futur garde, hors périmètre de fermeture de ce ticket).

---

### #383 — `useLayoutItem` écrase le `width` du consommateur (BottomNav, SystemBar) — RÉSOLU

**Preuve.** `OrigamBottomNav.vue` et `OrigamSystemBar.vue` placent désormais
tous deux `layoutItemStyles.value` **avant** `dimensionStyles.value` dans le
tableau passé à `useStyle()`, avec un commentaire explicite référençant
`#383` expliquant l'ordre correct ("layoutItemStyles MUST come before
dimensionStyles"). Commit `0a1edd00 fix(ds): BottomNav/SystemBar —
useLayoutItem n'ecrase plus le width du consommateur (#383)`, mergé via PR
#464.

**Commentaire de fermeture proposé** :
> Confirmé résolu (PR #464, commit `0a1edd00`). `OrigamBottomNav.vue` et
> `OrigamSystemBar.vue` posent maintenant `layoutItemStyles` avant
> `dimensionStyles` dans `useStyle()`, si bien que le `width` explicite du
> consommateur l'emporte sur le `calc()` du layout. Vérifié par lecture de
> code sur les deux composants (audit du 2026-08-30).

---

### #387 — Blockquote : `letterSpacing` mort + tiret/virgule orphelins — RÉSOLU

**Preuve.** `letter-spacing: var(--origam-blockquote---resolved-letter-spacing);`
est désormais câblé dans le `<style>` scoped, au même niveau que les 4 autres
propriétés typographiques. Le tiret (`v-if="hasAuthor"`) et le séparateur
(`v-if="hasAuthor && hasSource"`) sont maintenant correctement conditionnés
sur la présence de l'auteur. Commit `1a45582c fix(ds): OrigamBlockquote —
wire dead letterSpacing prop, fix orphaned dash/separator (#387)`, PR #460.

**Commentaire de fermeture proposé** :
> Confirmé résolu (PR #460, commit `1a45582c`). `letterSpacing` est câblé en
> SCSS au même titre que les 4 autres axes typographiques, et le tiret /
> séparateur de l'attribution sont désormais conditionnés sur `hasAuthor`.
> Vérifié par lecture de code (audit du 2026-08-30).

---

### #388 — Bracket : slot `competitor` perdu par Round, doc/story en retard — RÉSOLU

**Preuve.** Les 3 sous-défauts sont corrigés :
1. `OrigamBracketRound.vue` relaie désormais `$slots.competitor` vers son
   `<origam-bracket-match>` interne (`v-if="$slots.competitor" #competitor="scope"`).
   Le test e2e `bracket.spec.ts:200` ("competitor slot replaces the default
   row") n'a plus de `test.fail()` — c'est un test vert normal, avec un
   commentaire documentant le fix.
2. La story `OrigamBracketRound.story.vue` a maintenant les 3 Variants
   `Events - match-click / competitor-click / winner-click` et les Variants
   `Slots - Round-title / Match / Competitor`.
3. `OrigamBracket.md` documente désormais `roundedTopLeft`/etc,
   `borderTop`/etc, `tag`, `margin*`/`padding*`, `width`/`height`/`min*`/`max*`,
   et `fontSize`/`fontWeight`/`letterSpacing`, avec une note explicite sur la
   portée réduite de la typographie.

Commit `c912fd37 fix(ds): Bracket family — Round forwards #competitor slot,
story/doc coverage (#388)`, PR #481.

**Point résiduel, non un oubli** : `fontFamily` et `lineHeight` n'ont
toujours aucun contrôle de story — mais la doc explique que ces deux props
ont été **retirées** de `IBracketProps` par le ticket #501 (props typo
inertes), pas oubliées : "`fontFamily` and `lineHeight` were removed from
`IBracketProps` (issue #501)".

**Commentaire de fermeture proposé** :
> Confirmé résolu (PR #481, commit `c912fd37`) : forwarding du slot
> `competitor` par `OrigamBracketRound`, story avec tous les emits/slots de
> Round, doc `.md` mise à jour avec la vingtaine de props manquantes.
> `fontFamily`/`lineHeight` ont été retirés de l'API par #501 (décision
> distincte, documentée), donc leur absence de contrôle story n'est pas un
> oubli. Vérifié par lecture de code + spec e2e (audit du 2026-08-30).

---

### #389 — 10 fichiers de tokens component non référencés dans `$themes.json` — PARTIEL

**Preuve.** Rebuild réel des tokens (`node scripts/build-tokens.mjs`) puis
mesure précise dans `packages/ds/src/assets/css/tokens/light.css` :

| famille | tokens annoncés (ticket) | présents aujourd'hui dans le CSS compilé |
|---|---|---|
| bracket | 63 | **0 — toujours orphelin** |
| calendar | 43 | 43 ✅ |
| sound | 35 | **0 — toujours orphelin** |
| empty-state | 34 | 34 ✅ |
| chart | 33 | 85 ✅ (dépasse le chiffre initial : sous-familles chart-pareto/range-selector/sparkline/variwide/streamgraph enregistrées en plus) |
| watermark | 11 | **0 — toujours orphelin** |
| clipboard | 10 | 10 ✅ |
| qrcode | 8 | **0 — toujours orphelin** |
| text-mask | 5 | 5 ✅ |
| masonry | 2 | 2 ✅ |

6 des 10 fichiers sont maintenant enregistrés dans `$themes.json` et
génèrent bien leurs variables (commit `50abb42d feat(tokens): register the 10
new #503 token files + rebuild`, `f4d4b16d fix(ds): register
clipboard/masonry/qrcode/sound/text-mask/watermark token sets (#436-A)`).
Mais **`bracket`, `sound`, `qrcode`, `watermark` restent absents de
`$themes.json`** — confirmé par `grep` direct (aucune occurrence) et par
l'absence totale de leurs variables dans `light.css` compilé. Fait notable :
un commit `d0464f87 fix(ds): drop qrcode/sound/watermark from #436-A, keep
only wired files` montre que ce n'est pas un oubli mais un **retrait
délibéré** — les enregistrer seuls ne suffisait pas (probablement d'autres
décalages de nommage à régler d'abord, cf. #503 qui porte peut-être
exactement sur ce reste : à recouper, voir section correspondante).

**Chiffre remesuré : 117 tokens sur 4 familles restent orphelins** (63 + 35
+ 11 + 8), contre 244 sur 10 familles annoncées à l'origine. Le ticket doit
rester **ouvert**, reformulé sur ce périmètre réduit.

---

### #391 — Stratégie classes-first perdante face au sélecteur scopé Vue (Btn) — VALIDE

**Preuve.** `OrigamBtn.vue` a toujours, sans garde conditionnelle, à la racine
`.origam-btn` : `border-width: var(--origam-btn-group---border-width);`
(inchangé). Le modificateur `&--border { --origam-btn---border-width: thin; }`
écrit dans une variable (`--origam-btn---border-width`) que cette règle ne lit
**pas** (elle lit `--origam-btn-group---border-width`) — la même divergence de
nom que décrite dans le ticket, non corrigée. `git log --grep="391"` et
l'historique du fichier ne montrent aucun commit de fix depuis l'ouverture.
Le sous-défaut `border="top"/"right"/etc` sur Btn est également confirmé :
aucune règle SCSS pour `.origam-btn--border-top` n'existe dans le fichier.

**Non remesuré** : la portée annoncée de "92 composants" est une mesure
d'exposition obtenue par un outillage ad hoc du rapporteur, que je n'ai pas
reproduit (nécessiterait de récrire le même scanner AST) — je ne peux ni la
confirmer ni l'infirmer indépendamment. Le cas concret documenté (OrigamBtn)
est en revanche confirmé inchangé à 100 %.

**Nature du ticket** : au-delà du bug ponctuel sur Btn, la question de fond
("la stratégie classes-first CLAUDE.md est-elle tenable ?") est un
**arbitrage architectural** à trancher par l'utilisateur (3 options
proposées par le rapporteur lui-même) — à traiter séparément du bug Btn
ponctuel, qui lui est un fix mécanique classique.

### #389 — 10 fichiers de tokens component non référencés — PARTIEL, chiffre corrigé

**⛔ Ce chiffre diverge de celui posté dans le lot 2/9 ci-dessus** ("4/10 encore
orphelins : bracket/sound/qrcode/watermark = 117 tokens"). Remesure indépendante
du jour, méthode différente : au lieu de comparer "tokens annoncés dans le
ticket" vs "présents dans le CSS compilé", j'ai croisé directement
`tokens/$themes.json` (`selectedTokenSets`) avec la liste réelle des fichiers
sous `tokens/component/*.json` :

```
python3 -c "
import json,os
d=json.load(open('tokens/\$themes.json'))
referenced={k.split('/',1)[1] for t in d for k in t.get('selectedTokenSets',{}) if k.startswith('component/')}
files={f[:-5] for f in os.listdir('tokens/component') if f.endswith('.json')}
print(sorted(files - referenced))
"
→ ['bracket']
```

`git log --oneline -- tokens/component/sound.json tokens/component/qrcode.json
tokens/component/watermark.json` montre un seul commit les touchant :
`651a3a90 fix(ds): remove 15 dead token files with zero CSS consumers
(#436-B)` — un **DELETE**. Ces trois fichiers n'existent plus du tout sur le
disque (`ls tokens/component/ | grep -E "sound|qrcode|watermark"` → vide).
Ils ne peuvent donc pas être comptés comme "orphelins" (existants mais non
enregistrés) : ils ont été retirés intentionnellement, documenté dans #436
comme n'ayant aucun consommateur réel (le composant `OrigamSound` lui-même a
été supprimé, porté vers `OrigamAudio`).

Seul `bracket.json` reste réellement orphelin — vérifié en plus par lecture de
son contenu : ses enfants (`round-title`, `match-final`, `match-hover`,
`competitor-winner`) ne sont pas encore migrés vers la grammaire `$child` de
#435, donc l'enregistrer tel quel produirait des variables inatteignables
(confirmé par le commentaire du 2026-08-27 sur #436 : essai + revert documenté).

**Si ce chiffre diffère de celui du lot 2/9, c'est parce que ce lot comptait
sound/qrcode/watermark comme "encore orphelins" alors qu'ils n'existent plus
sur le disque — à trancher par le lead, mais la méthode ci-dessus est
vérifiable en une commande.**

---

### #393 — 13 composants avec `:root{}` en dur au lieu de `tokens/component/` — VALIDE, composition changée

**Preuve.** Script comparant, pour les 18 `.vue` ayant un bloc `:root{}`
définissant des `--origam-*` (même population que le ticket, recomptée à 18),
les variables déclarées dans ce bloc contre celles réellement émises dans
`src/assets/css/tokens/light.css` :

| composant | vars dans `:root{}` | couvertes par le pipeline |
|---|---|---|
| OrigamCardHeader | 78 | 0 |
| OrigamImg | 37 | 0 |
| OrigamCardText | 25 | 0 |
| OrigamContainer | 17 | 0 |
| OrigamCol | 17 | 4 (padding, via col.json #417/#508) |
| OrigamRow | 16 | 4 (idem) |
| OrigamTab | 16 | **16 — désormais 100 %** |
| OrigamBracketCompetitor | 14 | 0 |
| OrigamTabs | 10 | **10 — désormais 100 %** |
| ExpandX / ExpandY | 9 chacun | 0 chacun |
| OrigamBtnGroup | 7 | 4 |
| OrigamSnackbarGroup | 7 | **7 — désormais 100 %** |
| BracketMatch | 6 | 0 |
| BracketRound / Bracket | 5 chacun | 0 chacun |
| OrigamTabPanels | 2 | 0 |
| OrigamSpacer | 1 | **1 — désormais 100 %** |

Total : 281 vars déclarées en dur, **235 non couvertes**. Le ticket original
annonçait 215 vars sur 13 composants ; la population a changé de forme —
Tab/Tabs/SnackbarGroup/Spacer sont sortis du défaut (fichiers de tokens créés
depuis), Img (37 vars, jamais cité dans le ticket) et le cas partiel
Col/Row/BtnGroup sont apparus. Le défaut reste réel et de même ampleur
globale, mais ce n'est plus littéralement "les 13 mêmes composants, 215 vars".

**Pas de commentaire de fermeture** — ticket à garder ouvert avec le chiffre
actualisé (11 composants à 0 %, 3 partiels, 235 vars).

---

### #394 — Transform Style Dictionary casse le nommage BEM sur tiret — PARTIEL

**Preuve que le mécanisme est réparé.** Les deux exemples cités noir sur blanc
dans le corps du ticket sont vérifiés corrigés sur le code actuel :

- `carousel.controls-item.*` : `tokens/component/carousel.json` déclare
  maintenant `"$child": { "controls-item": {...} }` ; le CSS généré émet
  `--origam-carousel__controls-item---margin-inline`, exactement ce que lit
  `OrigamCarousel.vue`.
- `calendar.day-cell.*` : même mécanisme, `tokens/component/calendar.json`
  a `"$child": { "day-cell": {...} }`, lu correctement par
  `OrigamCalendar.vue` (`--origam-calendar__day-cell---height`, etc.).

Le mécanisme livré par `2c961a5c fix(ds): reserved $child / $state token
groups replace the undecidable heuristic (#435)` fonctionne bel et bien.

**Preuve que la migration n'est pas terminée.** `tokens/component/audio.json`
n'a **pas** été migré vers `$child` — `OrigamAudio.vue` lit toujours
`--origam-audio--compact__cover---size` et 10 variables sœurs, et ces 11
entrées figurent encore telles quelles dans
`scripts/guards/baseline/token-var-channels.json` (catégorie dead, non
résolues). Le ticket citait 49 composants / 240 vars comme population
potentiellement affectée — je n'ai vérifié individuellement que Carousel et
Calendar (corrigés) et Audio (encore cassé) ; je n'ai pas eu le temps de
vérifier les 46 autres composants nommés (ChartCartesian,
TextareaFieldRichToolbar, DataTableHeaderCell, ChartPolar, etc.).

**Conclusion** : le ticket tel que formulé ("le transform casse... 49
composants") est partiellement périmé — la cause outillage est réparée, ce
qui reste est une migration fichier par fichier non terminée. Recommandation :
transformer en ticket de suivi de migration plutôt que fermer tel quel.

---

### #405 — 338 déclarations CSS sans repli — PARTIEL

**Preuve.** `node scripts/guards/token-var-channels.mjs --why` donne
aujourd'hui : "sans repli (rendu cassé) : **34**" — contre 338 annoncés. Les
deux cas exemplaires cités dans le corps du ticket sont vérifiés corrigés :

- `OrigamAvatar` lit désormais trois variables séparées
  (`--origam-avatar---transition-property/duration/timing-function`), toutes
  les trois déclarées dans `light.css`. Plus de `--origam-avatar---transition`
  nue sans repli.
- `OrigamAvatarGroup` lit `--origam-avatar-group__item---margin-inline-start`,
  qui EST maintenant déclarée (`light.css:354`) — la divergence `__item` vs
  `__avatar` signalée dans le ticket est réparée.

Ces corrections sont attribuables aux commits `4d8e39d0` / `bea5ec31`
("reconcile N component-token naming mismatches (#433, #417, #508, #503,
#405)"). Le chiffre est tombé de 338 à 34 (~90 % de réduction), mais le défaut
existe toujours pour 34 déclarations — je n'ai pas extrait la liste nommée de
ces 34 (le guard ne l'expose pas en CLI ; il faudrait lire la fonction
`analyseChannels` exportée par `token-var-channels.mjs` pour la produire).

**Pas de commentaire de fermeture** — mettre à jour avec 34 comme nouveau
chiffre de référence.

---

### #436 — Tokens orphelins, mesure complète — PARTIEL, quasi soldé

Ticket le mieux instrumenté du lot : 6 commentaires de l'auteur documentent
déjà chaque étape avec preuve. Ma remesure sur HEAD confirme que le travail
posté APRÈS le dernier commentaire (2026-08-27) a complété ce qui restait :

- **Population A** (10 fichiers non construits) : 1 seul orphelin restant
  (`bracket`), même mesure et même cause que #389 ci-dessus.
- **Population B** (12 fichiers construits sans lecteur) : **0 restant.**
  Les 3 divergences que le dernier commentaire disait explicitement "NON
  supprimées — ce sont des bugs, pas des morts" sont vérifiées réparées dans
  le code :
  - `grids.json` → scindé en `col.json`/`container.json`/`row.json`/
    `spacer.json`, chacun avec un commentaire citant #417/#508 ; `col.json`
    et `row.json` émettent maintenant les bons préfixes plats
    (`--origam-col---*`, pas `--origam-grids__col---*`).
  - `progress-linear.json` → `loader` est désormais déclaré
    (`--origam-progress-linear__loader---color: inherit`) et lu par
    `OrigamProgressLinear.vue` avec repli identique.
  - `date-picker.json` → `OrigamDatePickerMonth.vue` lit
    `--origam-date-picker-month__{day,weekday,weeks}---font-size`, les trois
    sont désormais émises sous ce préfixe exact dans `light.css`.
  - `chart.json.tooltip`, noté "en attente" dans le dernier commentaire, est
    câblé : `--origam-chart__tooltip---background-color/color` sont émises
    et lues par au moins 4 composants Chart vérifiés (BoxPlot, Bullet,
    Cartesian, Candlestick).

Il ne reste que `bracket`, qui a son propre suivi croisé avec #389 — bloqué
sur la même migration `$child`.

**Commentaire de fermeture proposé** (à vérifier par le lead avant tout
usage) :
> Remesuré sur HEAD : les trois divergences laissées ouvertes dans le dernier
> commentaire (grids→col/container/row/spacer, progress-linear, date-picker)
> sont corrigées et vérifiées dans le code (variables alignées
> composant↔pipeline). `chart.tooltip` est câblé. Il ne reste que `bracket`,
> qui a un suivi explicite ailleurs (#389), bloqué sur sa migration vers la
> grammaire `$child` de #435.

---

### #479 — Chiffrer le masquage local des tokens component-level — VALIDE, non commencé

**Preuve.** `git log --all --grep="#479"` et une recherche de PR sur "479" ne
retournent rien. Le ticket n'a aucun commentaire. Une recherche du motif
`--resolved-` (le patron de correction déjà éprouvé, cité en référence par le
ticket) dans `packages/ds/src` ne le trouve que sur Blockquote (#387) et
Breadcrumb (#386/#478) — aucune extension aux 4 familles demandées (List,
DataTable, Picker, Field).

Le ticket est explicitement un ticket de MESURE ("Ce ticket ne code rien. Il
chiffre.") et cette mesure n'a pas été faite. Rien à corriger, rien à trancher
côté diagnostic — le travail décrit reste entièrement à faire.

---

### #492 — `OrigamThemeProvider` : `inheritAttrs:false` sans `v-bind="$attrs"` — VALIDE

**Preuve.** Lecture de `packages/ds/src/components/ThemeProvider/OrigamThemeProvider.vue` :
`defineOptions({ inheritAttrs: false })` (ligne 28) est bien posé, et le seul
rattrapage est `themeProviderClasses = computed(() => ['origam-theme-provider',
attrs.class])` (ligne 48-50), utilisé uniquement pour `:class`. Aucun
`v-bind="$attrs"` nulle part dans le template (lignes 1-9). `id`, `style`,
`data-cy` et tout listener DOM posés sur le composant sont donc bien perdus,
exactement comme décrit.

**Exécution réelle de la sonde du jour** (pas une lecture, un run) :
```
pnpm exec vitest run TU/components/ThemeProvider/OrigamThemeProvider.spec.ts
→ Test Files  1 passed (1)
→ Tests  1 expected fail (1)
```
`it.fails(...)` reste vert — c'est-à-dire que les assertions
(`id`/`style`/`data-cy`/`onClick` atteignent la racine) échouent bien comme
prévu par la sonde. Le bug est donc confirmé **inchangé** aujourd'hui. C'est
le seul vrai bug de composant (pas un token, pas une doc) de tout ce lot : fix
mécanique attendu = ajouter `v-bind="$attrs"` sur `<component :is="tag">` et
fusionner `class` dans le même flux.

⚠️ Rappel du ticket, à respecter si le fix est fait un jour : garder la sonde
dans la suite, retirer seulement le wrapper `it.fails` (pas le test).

---

### #514 — Strategy A (`*Styles` vide si tokenisé) contredite par le code — ARBITRAGE

**Preuve.** `packages/ds/src/composables/Commons/colorEffect.composable.ts`,
branche intention/tokenisée (ligne 235) :
```ts
fgDecl = `color: ${tokenForegroundForIntent(color.value as TIntent)}`
```
puis (lignes 257-259) :
```ts
const styles: string[] = []
if (bgDecl) styles.push(bgDecl)
if (fgDecl) styles.push(fgDecl)   // ← poussé même pour une valeur TOKENISÉE
```
Confirmé : pour `color="primary"` (une intention, donc tokenisée),
`colorStyles` n'est PAS vide — `fgDecl` y est systématiquement poussé. Le
CLAUDE.md du dépôt, section "Strategy A", affirme pourtant toujours
aujourd'hui : *"When the value is tokenised, `*Styles` is empty and the class
does the work"* — vérifié verbatim dans le CLAUDE.md actuel du worktree, la
phrase n'a pas changé depuis l'ouverture du ticket.

**Ce n'est pas un bug de composant à corriger mécaniquement.** Le ticket
lui-même pose la question en ces termes ("à trancher") : soit la doc s'aligne
sur le code (le "retrait de `*Styles` en v3.0.0" annoncé par le CLAUDE.md
tombe), soit le code doit être changé pour vider `fgDecl` sur le chemin
intention — au prix d'une régression à mesurer, puisque la ticket #514
documente que c'est justement la branche `[style*="color:"]` qui peint
aujourd'hui sur Switch (vérifié par mutation dans #512, cité dans le ticket).
Je n'ai pas recompté moi-même le nombre de composants dépendants de la
branche inline (le ticket le liste comme "inconnu", point 2 de sa section "À
trancher") — hors périmètre temps de cet audit.

**Classé ARBITRAGE, pas bug** : décision de doc-vs-code à prendre par
l'utilisateur, comme le ticket le demande lui-même.

---

### #515 — CLAUDE.md dit l'inverse du resolveur (union vs intersection) — ARBITRAGE / PARTIEL

**Preuve.** `packages/ds/src/composables/Commons/theme-props-resolver.composable.ts`,
ligne 557 :
```js
if (!(key in rawProps)) continue
```
Ce guard saute toute clé nommée par un thème que le composant ne déclare pas
dans ses props — confirmé, c'est une **intersection** (thème ∩ props du
composant), pas une union. Le CLAUDE.md du dépôt (section ADR-005) affirme
pourtant toujours : *"Every prop on every component is already reachable by
`theme.components` — the resolver intercepts based on what a theme NAMES,
**not on what the component opted into**"* — vérifié verbatim dans le
CLAUDE.md actuel, phrase inchangée. La contradiction décrite par le ticket
est donc bien réelle et toujours présente.

**Ce qui est un simple fix de doc (pas un arbitrage)** : corriger la phrase
du CLAUDE.md pour dire "intersection", ce n'est pas une décision de design,
c'est corriger une affirmation objectivement fausse — je recommande de la
traiter séparément et rapidement, contrairement au reste du ticket.

**Ce qui reste un arbitrage / une mesure non faite** :
1. Faut-il ajouter un `console.warn` en dev quand une clé de thème ne trouve
   aucune prop cible ? (coût/bruit à trancher, le ticket le pose lui-même).
2. "Combien de clés, dans les thèmes existants du dépôt, nomment une prop non
   déclarée ?" — **non mesuré par moi**. `packages/marketing/src/themes/
   {geek,ecom,glass,editorial,cartoon,origam,apple,material}.theme.ts` et
   `packages/ds/src/themes/origam.theme.ts` existent bien (le chemin
   `app/themes/*.theme.ts` cité littéralement dans le ticket n'existe pas
   tel quel dans ce dépôt — c'est probablement une généralisation du
   rapporteur, à vérifier avec lui). Croiser chaque clé de
   `theme.components['origam-x']` avec l'interface `IXProps` réelle de
   chaque composant nécessite un script dédié que je n'ai pas eu le temps
   d'écrire dans cet audit — je le signale comme travail restant, pas comme
   fait.

**Conséquence sur #496** confirmée en passant : les 2 rouges Radio de #496
sont bien un thème de test mal formé (`activeBgColor` sur un composant qui
ne le déclare pas), pas un défaut produit — cohérent avec le point 1 du
ticket.

---

## 3. Fermetures proposées

- **#383** — voir commentaire de fermeture ci-dessus.
- **#387** — voir commentaire de fermeture ci-dessus.
- **#388** — voir commentaire de fermeture ci-dessus.

## 4. Ce que je n'ai pas pu trancher

- **#320** : chaîne de propagation 404 correcte sur le papier, mais statusCode
  HTTP réel non vérifié empiriquement (nécessite serveur + PostgreSQL +
  données seedées). Confirmé en revanche que la branche locale "not_found" du
  template est morte pour le cas fatal actuel.
- **#357** : remesure explicitement impossible pendant cet audit (interdiction
  de lancer l'e2e complet, contention avec la passe en cours sur le dépôt
  principal).
- **#391** : le chiffre de portée "92 composants" n'a pas été reproduit
  indépendamment (outillage ad hoc non disponible) ; seul le cas concret Btn
  est vérifié avec certitude.
- **#394** : je n'ai vérifié individuellement que 3 des ~49 composants cités
  (Carousel et Calendar corrigés, Audio encore cassé) ; les 46 autres
  composants nommés dans le ticket n'ont pas été revérifiés un par un.
- **#405** : le chiffre agrégé (34) est confirmé par le guard, mais je n'ai
  pas extrait la liste nommée des 34 déclarations restantes.
- **#514** : je n'ai pas recompté le nombre de composants qui dépendent
  aujourd'hui de la branche `[style*="color:"]` plutôt que de la classe
  utilitaire — le ticket le liste lui-même comme inconnu.
- **#515** : la mesure d'ampleur demandée par le ticket (combien de clés de
  thème, dans les fichiers `*.theme.ts` réels du dépôt, nomment une prop non
  déclarée par le composant visé) n'a pas été faite — nécessite un script
  dédié, hors périmètre temps de cet audit.

*(section mise à jour à chaque lot)*
