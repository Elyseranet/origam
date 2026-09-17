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

Mesuré : **102 antérieures**, **76 postérieures** (dont 12 marketing).

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

## Angle mort connu, non levé

`E2E_GREEN_ONLY` n'est posé que par la CI. Un agent qui lance la suite en
local **sans** la variable exécute les **211** specs de la config Histoire
(241 moins les 30 specs marketing écartées par `testIgnore` — mesuré), donc
un périmètre différent de celui de la CI. Ce garde mesure le périmètre **de
la CI** ; il ne dit rien de l'écart entre les deux, qui reste à documenter.
