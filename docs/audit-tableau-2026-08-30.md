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

*(section mise à jour à chaque lot)*
