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

## 3. Fermetures proposées

Aucune fermeture proposée dans ce lot — les 5 tickets traités sont soit
encore VALIDES (335, 370, 371), soit non tranchables avec les moyens de cet
audit (320 partiellement, 357 entièrement).

## 4. Ce que je n'ai pas pu trancher

- **#320** : chaîne de propagation 404 correcte sur le papier, mais statusCode
  HTTP réel non vérifié empiriquement (nécessite serveur + PostgreSQL +
  données seedées). Confirmé en revanche que la branche locale "not_found" du
  template est morte pour le cas fatal actuel.
- **#357** : remesure explicitement impossible pendant cet audit (interdiction
  de lancer l'e2e complet, contention avec la passe en cours sur le dépôt
  principal).

*(section mise à jour à chaque lot)*
