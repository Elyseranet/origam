# Fragility audit — e2e suite (`packages/tests/e2e/`)

Ticket QA — mesure de l'ampleur réelle du défaut documenté dans
`KNOWN_LIMITATIONS.md` (double exécution du `<script setup>` d'une story
Histoire, synchronisée par un `postMessage` **asynchrone**). Question posée :
**parmi les 175 specs e2e, lesquelles passent aujourd'hui par chance ?**

Ceci est une mesure, pas une remédiation. Aucun fichier de spec ni composant
n'a été modifié. Le seul artefact produit est ce document (la config
Playwright scratch utilisée pour la mesure n'est pas committée — même
convention que `playwright.debug-worktree.config.ts`, déjà non committé,
mentionné dans `KNOWN_LIMITATIONS.md`).

**Convention de lecture** : chaque affirmation ci-dessous est marquée
**[MESURÉ]** (observé en exécutant réellement la suite) ou **[DÉDUIT]**
(établi par lecture directe du code source, sans exécution). Les deux ont
de la valeur ; ne pas les confondre est le point le plus important de ce
document.

---

## État du dépôt au moment de la mesure — **[MESURÉ]**

Worktree dédié `.claude/worktrees/agent-a6b12611950cf3ed7`, branche
`qa/e2e-fragility-audit` créée depuis `origin/develop` au commit :

```
329ec0af1b2b208b4432fb4b97c0f7fc8570c8e9  (2026-08-11 11:22:09 +0200)
Merge branch 'debug/histoire-double-mount' into develop
```

**`origin/develop` a bougé pendant la mesure**, jusqu'à
`63d34d4fc8fa2d56011073d09afdd7be871700c2` (2026-08-11 14:11:43 +0200).
Vérification faite avant de considérer l'audit à jour :

```
git diff --stat 329ec0af..origin/develop -- packages/tests packages/ds
# (aucune sortie — zéro fichier touché)

git diff --stat 329ec0af..origin/develop
# packages/marketing/src/assets/locales/en.json  |  86 +-
# packages/marketing/src/assets/locales/fr.json  |  86 +-
# packages/marketing/src/consts/roadmap.const.ts | 108 +
# packages/marketing/src/pages/roadmap.vue       |  21 +-
```

Les 3 commits qui séparent ma base d'`origin/develop` (`0beeeea3` fix locale
marketing, `30080fdc` badge roadmap, `2c54c677` sync doc roadmap) touchent
exclusivement `packages/marketing/`. **Aucun fichier de `packages/tests/`
ni `packages/ds/` n'a changé dans cet écart** — le périmètre couvert par
cet audit (specs e2e + composants DS) est donc identique entre ma base et
le `develop` actuel. Le pont typographique généralisé et la migration de la
couverture du masque vers Vitest (mentionnés en amont) sont **déjà inclus**
dans mon commit de base (`329ec0af` = le merge de `debug/histoire-double-mount`,
qui a produit `KNOWN_LIMITATIONS.md` et le retrait des 6 tests de masque
e2e — voir plus bas). Cet audit est donc à jour sur son périmètre déclaré,
même s'il ne part pas du tout dernier commit `develop`.

---

## Méthode

### Environnement

- **[MESURÉ]** Un serveur Histoire écoutait déjà sur le port 6006 au
  démarrage. `lsof -p <pid> -a -d cwd` a montré qu'il tournait depuis
  `/Users/arnaudprioul/Projects/origam/packages/stories` — un AUTRE
  checkout, pas ce worktree. Non utilisé. Un serveur dédié a été démarré
  depuis ce worktree (`pnpm -F @origam/stories dev`), positionné
  automatiquement sur le port **6007** (6006 occupé), confirmé par
  `lsof -p <pid> -a -d cwd` → `.../worktrees/agent-a6b12611950cf3ed7/packages/stories`.
  Ce serveur a ensuite été **redémarré une fois en cours d'audit** (voir
  « Confond n°2 » plus bas) ; le second serveur a été vérifié de la même
  façon avant réutilisation.
- Config Playwright scratch (`playwright.audit.config.ts`, **non
  committée** par choix — même convention que le
  `playwright.debug-worktree.config.ts` déjà non committé mentionné dans
  `KNOWN_LIMITATIONS.md`) : `baseURL` sur le serveur local, aucun bloc
  `webServer` (le serveur est géré manuellement pour ne pas le relancer
  entre les passes, ce qui réintroduirait de la variance de cold-start),
  `retries: 0` **toujours** (un retry masquerait exactement l'instabilité
  recherchée), projet **chromium uniquement** (voir « Ce qui n'a pas été
  mesuré »).
- **[MESURÉ]** Piège reproductible noté au passage : `npx playwright test`
  résolvait un binaire différent et faisait échouer **tout** chargement de
  spec (`Playwright Test did not expect test.describe() to be called
  here`), y compris avec la config d'origine du repo, non modifiée.
  `pnpm exec playwright test` résout la version workspace et fonctionne.

### Angle statique — **[DÉDUIT]**

Inventaire par `grep` (comptage de motifs sur les 175 fichiers) puis
`Read` ciblé des fichiers à fort signal, recherchant : saisie
caractère-par-caractère (`pressSequentially`, `.type(..., {delay})`),
séquences d'interactions rapides (`click`/`keyboard.press`/`fill` en
boucle), assertion sur une valeur finale exacte après plusieurs
événements sans resynchronisation intermédiaire, et l'anti-pattern
`waitForTimeout` comme unique mécanisme de synchronisation.

### Angle dynamique — **[MESURÉ]**, avec un incident méthodologique assumé

Résumé du déroulé réel, dans l'ordre, parce que ce qui a été écarté est
aussi une information utile pour le prochain audit :

1. **Calibrage propre** — `btn.spec.ts` (spec CI-gated, faible risque
   statique) : `--repeat-each=2` à `workers=2` (68 exécutions, 98s) puis
   `--repeat-each=5` à `workers=4` (170 exécutions, 117s, 553 % CPU sur 15
   CPU logiques). **0 échec sur 238 exécutions.** Débit observé : 0,69
   test/s (workers=2) → 1,45 test/s (workers=4).
2. **Tentative de run large** — extrapolation naïve à partir du calibrage :
   Tier B (57 specs `GREEN_SPECS` exactes de `playwright.config.ts`) +
   Tier A (3 specs à risque confirmé hors Tier B) + Tier C (échantillon
   systématique 1/7 du reste, 16 fichiers) = 1797 tests uniques × 5 passes
   = 8985 exécutions visées, lancé à `workers=4` puis relancé à `workers=8`
   pour tenir le budget. **Résultat : écarté, voir « Confond n°1 »
   ci-dessous — non utilisé comme preuve.**
3. **Tentative intermédiaire** (5 fichiers dont `chip-group.spec.ts`,
   `workers=2`) sur le serveur Histoire encore actif depuis la tentative
   #2 : **écartée aussi, voir « Confond n°2 »**.
4. **Run final, propre, complet** — serveur Histoire redémarré à froid,
   3 fichiers du tier CRITIQUE (`textfield-mask.spec.ts`,
   `number-field.spec.ts`, `otp-input-field.spec.ts`), `workers=2`,
   `--repeat-each=5`, **mené jusqu'à sa fin naturelle sans interruption**.
   C'est la donnée dynamique de référence de cet audit.

#### Confond n°1 — le run large à `workers=8` est écarté, pas juste « pas fini »

Le run a été interrompu manuellement après 1h28 (47 % des 8985 exécutions
visées, soit 4140 exécutions réellement journalisées) pour tenir le délai
de restitution. Deux raisons, indépendantes l'une de l'autre, rendent les
données déjà collectées **inexploitables comme preuve de flakiness**, pas
seulement incomplètes :

- **Aucun test n'a atteint ses 5 répétitions.** Avec `fullyParallel` +
  `--repeat-each=5`, Playwright entrelace les répétitions d'un même test
  avec celles des autres fichiers plutôt que de les exécuter à la suite.
  Sur les 4140 exécutions collectées, la distribution réelle des
  répétitions observées par test était : 1015 tests vus 2 fois, 700 vus
  3 fois, 1 vu 9 fois (artefact de parsing, ignoré), **zéro test vu 5
  fois**. Impossible de calculer un taux d'échec sur 5 passes avec ces
  données.
- **Le taux d'échec observé (496/4140 ≈ 12 %) n'est pas attribuable au
  mécanisme étudié.** Preuve : les échecs touchent en nombre des tests
  purement statiques (rendu + assertion de classe CSS, aucune interaction,
  aucune fenêtre de course possible par construction — ex.
  `card.spec.ts › Design › renders the card root with BEM class`,
  `checkbox.spec.ts › Design › input has aria-disabled="false" by
  default`) répartis sur des dizaines de fichiers sans rapport entre eux
  (breadcrumb, btn, card, checkbox, code, radio, switch, utilities…), et
  ce dès le tout début du run (69 échecs dans les 500 premières lignes du
  log). Un run à `workers=8` sur 15 CPU logiques, cumulé à des composants
  plus lourds que `btn.spec.ts` (12-13s/test contre 2-3s en calibrage),
  est la cause la plus probable — de la contention CPU/mémoire auto-
  infligée, exactement ce que la consigne de méthode demandait d'éviter
  en dosant les workers. Le process a été tué avant que Playwright
  n'imprime son résumé de fin de run (qui contient les stack traces des
  échecs) — **aucun diagnostic d'erreur n'a survécu** pour confirmer ou
  infirmer la cause précise, ce qui achève de rendre ces données
  inutilisables : ni la stabilité ni l'instabilité de ces tests précis
  n'est établie par ce run.

**Décision : ces 4140 exécutions et leur taux d'échec agrégé ne sont
CITÉS NULLE PART dans le classement de stabilité ci-dessous.** Seule
la leçon méthodologique est retenue (voir « Motifs de risque »).

#### Confond n°2 — serveur Histoire dégradé après un run marathon

Après le run large, une tentative sur 5 fichiers ciblés (dont
`chip-group.spec.ts`) a été lancée sur le **même** serveur Histoire,
resté actif ~2h30 sous charge soutenue. Diagnostic effectué en cours de
run : le process Histoire consommait **10,8 Go de RSS** (`ps aux`), et le
système avait quasiment 0 page libre (`vm_stat`). Les 4 premiers tests
(`chip-group.spec.ts`) ont tous échoué, avec des temps de 14,9s à 30,0s
(timeout) contre 2-4s en régime normal. Interprétation : dégradation du
serveur de dev sous charge prolongée (fuite mémoire probable côté
Vite/Histoire en HMR répété), pas le bug étudié. **Écarté, non utilisé
comme preuve.** Le serveur a été redémarré à froid avant le run final.

Ces deux confonds sont eux-mêmes un résultat de l'audit : **un run e2e
répété à haute parallélisation contre un serveur de dev de longue durée
génère sa propre instabilité**, indépendante du bug Histoire étudié. Voir
« Motifs de risque » pour la formulation réutilisable.

---

## Classement statique des specs par niveau de risque — **[DÉDUIT]**

### CRITIQUE — saisie caractère-par-caractère dans un champ à réécriture réactive

Correspond exactement au mécanisme diagnostiqué dans `KNOWN_LIMITATIONS.md`
(watch/nextTick de réécriture du composant en concurrence avec le
postMessage de synchro Histoire).

| Spec | Ligne | Motif | Note |
|---|---|---|---|
| `textfield-mask.spec.ts` | 40 | `input.type('1234', { delay: 10 })` puis assertion `complete = false` | **6 cas sœurs du même motif ont déjà été retirés de ce fichier et migrés vers Vitest** (`packages/tests/TU/components/TextField/OrigamTextField.mask.spec.ts`) précisément à cause de ce bug — voir le commentaire en tête de fichier (lignes 5-21), écrit par l'équipe elle-même. 2 tests avec ce motif restent dans le fichier e2e. |
| `number-field.spec.ts` | 225 | `input.pressSequentially('abc')` dans un champ numérique gardé par `beforeinput` | Le commentaire du test (207-210) explique pourquoi `pressSequentially` a été choisi plutôt que `fill()` : « fill() bypasses the beforeinput event » — nécessaire fonctionnellement, mais réintroduit le risque de course. |
| `otp-input-field.spec.ts` | 473-478 | Boucle `page.keyboard.press(String(i))` × 6 + `waitForTimeout(80)` par frappe, puis assertion unique `toContainText('123456')` sur la valeur accumulée | Aucune resynchronisation par `expect()` entre les frappes ; le `waitForTimeout(80)` fixe est le seul filet. |

**Vérification dynamique de ces 3 fichiers : voir « Résultats dynamiques »
— [MESURÉ] 0 échec sur 415 exécutions propres et complètes.** Le
classement statique identifie correctement le **mécanisme à risque** ;
il ne prédit pas un échec certain — ces instances précises sont
actuellement stables (mitigées par un délai fixe généreux ou une
assertion moins stricte que la valeur finale exacte, selon le cas).

### HAUT — séquence rapide sans resynchronisation, assertion finale cumulée unique

| Spec | Test | Ligne | Motif |
|---|---|---|---|
| `snackbar-group.spec.ts` | `notify renders an item, dismiss-all empties the stack` | 52-58 | `trigger.click()` ×3 d'affilée, **zéro** `expect()` entre les clics, un seul `waitForTimeout(300)` générique, puis **une seule** assertion `expect(items).toHaveCount(3)` censée refléter l'accumulation exacte des 3 clics. |

Non vérifié dynamiquement dans des conditions propres (voir Confond n°2) —
reste au statut **[DÉDUIT] uniquement**.

### MOYEN — séquence rapide mais protégée par une resynchronisation par étape

Ces specs répètent la forme (plusieurs interactions à la suite) mais
chaque étape est suivie d'un `expect()` à auto-retry ou d'un
`waitForTimeout` généreux avant l'étape suivante, ce qui réduit (sans
l'éliminer) le risque de course :

- `chip-group.spec.ts` L60-78 (`multiple chips can be selected`) — clic →
  wait(200) → clic → wait(200). Non vérifié dynamiquement dans des
  conditions propres (Confond n°2).
- `select.spec.ts` L621-665 (`selection is not duplicated after
  re-focus`) — clic → wait → Tab → wait → Shift+Tab → wait ; et
  `pickControl` (L78-97), helper encapsulé dans `expect(...).toPass()`
  avec resync `toHaveText`.
- `treeview.spec.ts` — toutes les séquences chevron/ligne (L117-238,
  316-328) intercalent systématiquement `waitForTimeout(200-300)`.
- `snackbar-group.spec.ts` L86-111 (`spawning at each location`) — 4
  clics en boucle sans wait entre eux, MAIS suivis d'assertions **par
  emplacement** (pas un compteur cumulé unique) et d'un wait(300) avant
  vérification — moins exposé que le cas HAUT du même fichier.
- `inline-edit.spec.ts` L448-475 — 3 blocs `click+fill+press`, chacun
  terminé par son propre `expect()` de resync.
- `list.spec.ts` (navigation clavier ArrowDown/Up/Home/End, L404-484) —
  **bon patron** : chaque `keyboard.press()` est immédiatement suivi d'un
  `expect(items.nth(n)).toBeFocused()` à auto-retry avant l'interaction
  suivante. C'est la resynchronisation la plus solide observée dans la
  suite — cité comme modèle, pas comme risque.

### BAS / hors mécanisme

- Tous les fichiers sans aucune interaction (rendu statique + assertions
  de style/classe) : aucune fenêtre de course possible. Environ 25
  fichiers (ex. `card.spec.ts`, `divider.spec.ts`, `kbd.spec.ts`,
  `qr-code.spec.ts`, `table.spec.ts`, `timeline.spec.ts`, `title.spec.ts`,
  `toolbar.spec.ts`, les 6 `home-*.spec.ts`…).
- Les specs utilisant `fill()` seul (écriture atomique, ne déclenche pas
  d'événements clavier par caractère) suivi d'un `expect().toHaveValue()`
  à auto-retry : protégées par construction — motif dominant dans
  `text-field.spec.ts`, `textarea-field.spec.ts`, `password-field.spec.ts`,
  `form.spec.ts`.
- `marketing-theme-builder.spec.ts` et `marketing-theming-controls.spec.ts`
  reproduisent la forme structurelle « N `fill()` → 1 assertion cumulée »
  mais ciblent l'app Nuxt marketing (port 3000), **pas** une story
  Histoire — aucun `iframe[src*="__sandbox"]` dans ces fichiers, donc le
  double-mount `postMessage` ne s'applique pas structurellement. Risque
  nul pour **ce** mécanisme précis ; noté quand même car la forme
  (batch-then-assert) resterait fragile pour d'autres raisons (debounce,
  réseau) si la topologie changeait.

### Motif systémique transversal — `waitForTimeout`

**120 des 175 fichiers (68,6 %)** utilisent au moins un `waitForTimeout`.
Pas la preuve d'un bug actif en soi, mais un choix de synchronisation par
**délai fixe empirique**, sans garantie de marge — la définition même de
ce que `KNOWN_LIMITATIONS.md` décrit comme insuffisant (« reduces, does
not eliminate, the chance of racing »). Fichiers avec le plus fort recours
(>10 occurrences) : `icons.spec.ts` (35), `media.spec.ts` (31),
`marketing-theme-builder.spec.ts` (27), `treeview.spec.ts` (18),
`snackbar-group.spec.ts` (17), `number-field.spec.ts` /
`date-picker-field.spec.ts` (15), `tabs.spec.ts` (13), `layout.spec.ts` /
`grids.spec.ts` / `field.spec.ts` / `data-table.spec.ts` (11).

---

## Résultats dynamiques — **[MESURÉ]**

### Données propres et complètes (seule preuve retenue)

| Run | Fichiers | Workers | Répétitions/test | Exécutions | Échecs | Durée |
|---|---|---|---|---|---|---|
| Calibrage A | `btn.spec.ts` | 2 | 2 | 68 | **0** | 98s |
| Calibrage B | `btn.spec.ts` | 4 | 5 | 170 | **0** | 117s |
| Tier CRITIQUE | `textfield-mask.spec.ts`, `number-field.spec.ts`, `otp-input-field.spec.ts` (83 tests uniques) | 2 | **5 (confirmé complet)** | 415 | **0** | 8,8 min |

**Total exécutions propres et exploitables : 653, 0 échec.**

Vérification ligne à ligne des 3 tests les plus à risque (motif CRITIQUE,
saisie caractère-par-caractère) dans le run Tier CRITIQUE :

- `number-field.spec.ts` — « non-numeric input is rejected (beforeinput
  guard via key events) » (`pressSequentially`) : **5/5 passés**.
- `otp-input-field.spec.ts` — « typing fills cells and the value display
  shows the typed digits » (boucle `keyboard.press` × 6) : **5/5 passés**.
- `textfield-mask.spec.ts` — « phone:fr — partial value (4 digits) is not
  complete » (`.type(delay:10)`) : **5/5 passés**.

**Aucun test instable identifié dans les données propres et complètes de
cet audit.** C'est un résultat réel, pas une absence de mesure : les 3
specs les plus exposées au mécanisme diagnostiqué dans
`KNOWN_LIMITATIONS.md`, testées avec 5 répétitions complètes confirmées
chacune, se sont montrées déterministes sur cette machine, à ce moment,
avec `workers=2`. Ça ne prouve pas l'absence de fragilité future ou sous
d'autres conditions (charge CI, machine plus lente) — seulement l'absence
observée ici et maintenant.

### Données écartées (non utilisées comme preuve — voir Confonds n°1 et n°2)

Pour mémoire, sans être comptées dans le classement de stabilité :
run large (80 fichiers visés, workers=4→8) : 4140 exécutions journalisées
avant interruption à 47 % de couverture, aucun test à 5 répétitions
complètes, 496 échecs observés (~12 %) dont la cause n'a pas pu être
établie (diagnostics perdus, contention suspectée) ; run intermédiaire
5 fichiers sur serveur dégradé : 4 exécutions, 4 échecs, serveur à 10,8 Go
RSS au moment du test.

---

## Motifs de risque — formulation réutilisable

Pour le prochain qui écrit ou relit une spec e2e Histoire dans ce dépôt :

1. **Saisie caractère-par-caractère** (`pressSequentially`,
   `.type(..., {delay})`) dans un champ qui réécrit sa propre valeur
   (masque, formattage, validation `beforeinput`) est le motif le plus
   exposé au double-mount Histoire (`KNOWN_LIMITATIONS.md`). Toujours
   valide même si non observé instable ici : préférer `fill()` quand la
   sémantique du test le permet, ou déplacer le cas vers un test Vitest
   + `@vue/test-utils` (topologie mono-instance, sans confond) — c'est
   exactement ce qui a déjà été fait pour 6 cas de `textfield-mask.spec.ts`.
2. **Séquence d'interactions rapides sans resynchronisation intermédiaire,
   assertion finale unique sur une valeur cumulée** (ex. 3 clics → 1
   `toHaveCount`) : ajouter un `expect()` à auto-retry (ou au minimum un
   `waitForTimeout` généreux) **entre chaque étape**, pas seulement à la
   fin. `list.spec.ts` (navigation clavier, resync par
   `toBeFocused()` après chaque touche) est le patron à copier.
3. **`waitForTimeout` comme unique mécanisme de synchronisation** est un
   code smell à justifier, pas un défaut : un délai fixe choisi
   empiriquement sur une machine de dev calme n'a aucune garantie de
   marge sur un runner CI chargé. Préférer un `expect()` Playwright à
   auto-retry sur une condition observable du DOM (classe, texte,
   attribut, focus) partout où c'est possible.
4. **Un serveur Histoire de longue durée sous charge de test répétée peut
   se dégrader lui-même** (fuite mémoire observée : 10,8 Go RSS après
   ~2h30 de sollicitation soutenue) et produire des échecs/timeouts qui
   n'ont rien à voir avec le bug applicatif étudié. Redémarrer le serveur
   à froid avant toute campagne de mesure de flakiness prolongée ; ne
   jamais enchaîner des heures de run sans un redémarrage.
5. **Doser le parallélisme des workers Playwright en connaissance de
   cause.** Un `workers` trop élevé par rapport aux CPU logiques
   disponibles ET au poids réel des specs (certaines montent à 12-13s/test
   contre 2-3s pour un composant simple) introduit sa propre variance —
   observée ici avec des échecs répartis sur des dizaines de fichiers
   sans rapport, y compris des assertions statiques sans aucune fenêtre
   de course possible. Calibrer le débit sur un échantillon représentatif
   AVANT de lancer un run complet, et privilégier un run plus lent mais
   qui va au bout plutôt qu'un run rapide qu'on doit interrompre sans ses
   diagnostics d'échec.
6. **`page.keyboard.press()` en boucle avec un cumul attendu en fin de
   séquence** (OTP, saisie de code) est un cas particulier du motif n°1 :
   même sans caractère « tapé » via `type()`, chaque frappe déclenche un
   cycle réactif complet côté composant, potentiellement concurrent au
   postMessage. Le `waitForTimeout` entre chaque frappe (80ms dans
   `otp-input-field.spec.ts`) est la mitigation actuelle — fonctionnelle
   ici (5/5 mesuré) mais reste un délai empirique, pas une garantie.
7. **Argument positionnel Playwright = sous-chaîne, pas nom de fichier
   exact.** `pnpm exec playwright test table.spec.ts` capte aussi
   `data-table.spec.ts`. Sans effet sur `GREEN_SPECS` (comparaison de
   tableau exacte dans `playwright.config.ts`), mais un piège pour
   quiconque filtre par nom de fichier en CLI local.

---

## Ce qui n'a pas été mesuré, et pourquoi

- **54 des 57 `GREEN_SPECS` (CI-gated)** — seuls `number-field.spec.ts`
  et `otp-input-field.spec.ts` ont une vérification dynamique propre et
  complète (via le tier CRITIQUE, qui les recoupe). Les 55 autres
  reposent uniquement sur le classement **[DÉDUIT]** ci-dessus. C'est la
  lacune la plus importante de cet audit : la question « lesquelles des
  specs CI-gated passent par chance » n'a de réponse dynamique fiable que
  pour 2 d'entre elles (stables, mesuré) — pas pour les 55 autres.
- **`snackbar-group.spec.ts` et `chip-group.spec.ts`** (Tier HAUT/MOYEN
  identifiés en statique) — toutes les tentatives de vérification
  dynamique ont été écartées (Confonds n°1 et n°2). Candidats
  prioritaires pour un prochain run ciblé et propre.
- **L'échantillon Tier C** (13-20 fichiers hors GREEN_SPECS) — collecté
  partiellement dans le run large écarté ; aucune donnée exploitable.
- **Firefox et WebKit** — l'audit n'a tourné que sur `chromium`. Le
  mécanisme du double-mount est décrit comme indépendant du moteur de
  rendu dans `KNOWN_LIMITATIONS.md` (c'est un comportement JS de
  Histoire, pas un comportement CSS/rendu), donc l'extrapolation
  chromium → autres moteurs est raisonnable pour ce mécanisme précis,
  mais reste **non vérifiée**.
- **14 fichiers dépendant du serveur marketing Nuxt (port 3000)**
  (`home-*.spec.ts`, `composables.spec.ts`, `marketing-theming*.spec.ts`,
  `types.spec.ts`, `wireframe.spec.ts`, `theming-feedback-tokens.spec.ts`)
  — hors périmètre : cet audit n'a démarré qu'un serveur Histoire. 3 de
  ces fichiers avaient été inclus par erreur dans l'échantillon Tier C
  initial (`home-hero.spec.ts`, `composables.spec.ts`,
  `marketing-theming-toggle-vs-split-parity.spec.ts`) et retirés avant le
  run large après avoir constaté leur échec déterministe (mauvaise
  `baseURL`, pas de la flakiness).
- **Le taux d'échec du run large (496/4140, ~12 %)** — des exécutions
  réelles ont eu lieu et le chiffre est vrai en tant que tel, mais sa
  cause n'est pas établie (voir Confond n°1) : ni confirmé comme
  flakiness produit, ni comme pur artefact de contention. Nécessiterait
  une reprise à `workers` plus bas (2 ou 3), sur serveur frais, avec
  `reporter` conservé jusqu'à la fin naturelle du run (pas d'interruption)
  pour récupérer les diagnostics d'échec par test.
- **Reprise recommandée, si le budget le permet** : le même protocole que
  le run Tier CRITIQUE (serveur frais, `workers=2`, `--repeat-each=5`, run
  mené à sa fin), appliqué fichier par fichier ou par petits lots de 5-10
  fichiers, en commençant par `snackbar-group.spec.ts` et
  `chip-group.spec.ts` (Tier HAUT/MOYEN non vérifiés), puis le reste de
  `GREEN_SPECS` par vagues.

---

## Temps passé — **[MESURÉ]**

Session complète : environ 3h40 (worktree + install ~11h20 → rédaction
finale ~14h58). Répartition approximative :
- Mise en place environnement (worktree, install, serveur Histoire,
  vérification propriétaire du port, config scratch) : ~25 min.
- Analyse statique (grep + lecture ciblée des fichiers à fort signal) :
  ~45 min.
- Calibrage dynamique propre (`btn.spec.ts`) : ~5 min.
- Run large tenté puis écarté (deux passes, workers=4 puis workers=8,
  interrompu) : ~1h35 consommées, **0 donnée exploitable produite** — le
  coût principal de cette session, et la leçon méthodologique n°5
  ci-dessus.
- Diagnostic de la dégradation serveur + redémarrage : ~10 min.
- Run final propre (Tier CRITIQUE, mené à terme) : ~9 min.
- Rédaction du document : ~35 min.
