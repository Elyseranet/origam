/*
 * Guard: emits-completeness — tout `update:*` ATTEIGNABLE doit être DÉCLARÉ.
 *
 * POURQUOI CE GARDE EXISTE
 * ------------------------
 * `useVModel` n'émet que dans son SETTER (`vModel.composable.ts`). Un
 * composant qui confie ses `props` à un composable RELAIS devient donc
 * émetteur de `update:x` **sans qu'aucun `emit(...)` n'apparaisse dans son
 * `.vue`**. Rien à trouver pour un grep, rien à voir en relisant le fichier.
 *
 * Si l'interface d'emits ne le déclare pas, deux choses cassent :
 *   1. Vue avertit à chaque émission — MAIS SEULEMENT si le composant a une
 *      option `emits`. Sans aucun `defineEmits`, `emitsOptions === null` et
 *      Vue reste TOTALEMENT SILENCIEUX quoi qu'il émette.
 *   2. Le handler `onUpdate:x` reste dans `$attrs`, donc posé par
 *      `inheritAttrs` sur l'élément racine — et, quand le composant étale
 *      ses attrs sur un enfant, rappelé une seconde fois par cet enfant.
 *
 * La campagne `refactor(emits)` (7 commits, close par `e91c9518`) a migré la
 * SYNTAXE — `defineEmits([...])` tuple vers `defineEmits<IXxxEmits>()`. Son
 * critère de clôture, cité littéralement : « ZERO components use the
 * tuple-syntax ». Ce critère est VRAI (0 tuple restant) et vide de sens ici :
 * il est satisfait d'office par un composant qui ne déclare RIEN. 93 des 217
 * composants n'ont aucun `defineEmits` ; aucun garde ne regardait la
 * COMPLÉTUDE de ce qui est déclaré. Ce fichier comble ce trou.
 *
 * CE QUI EST DÉTECTÉ
 * ------------------
 * Pour chaque `Origam*.vue`, l'ensemble des `update:*` atteignables :
 *   - `useVModel(props, 'X')` écrit dans le `.vue`         -> update:X
 *   - `useActive(props)` / `useActive(props, 'Y')`          -> update:active / update:Y
 *   - `useFocus(props)`                                     -> update:focused
 *   - `useValidation(props)` / `useForm(props)`             -> update:modelValue
 * comparé à l'ensemble DÉCLARÉ, résolu en suivant la chaîne d'`extends` des
 * interfaces `I*Emits` à travers tout `src/interfaces/`.
 *
 * ATTEIGNABILITÉ — c'est CE critère qui fait la précision du garde, pas la
 * détection du relais. `useActive` n'écrit que dans `onActive()` : un
 * composant qui déstructure seulement `isActive` / `activeState` ne peut
 * JAMAIS émettre, et ne rien déclarer y est CORRECT. De même un
 * `useVModel(props,'X')` dont la ref n'est ni écrite (`X.value =`) ni liée
 * en `v-model` dans le template. Sans ce filtre, un balayage naïf sort 20
 * candidats pour 7 défauts réels (précision 35 %) — mesuré, pas estimé.
 *
 * ⚠️ NE PAS « déclarer au cas où » pour faire taire ce garde. Déclarer un
 * emit jamais émis RETIRE son handler de `$attrs` et change donc le
 * comportement des attributs hérités. C'est un changement, pas une hygiène
 * neutre. Un composant qu'on n'arrive pas à faire émettre n'est PAS un
 * défaut.
 *
 * Run: `node packages/ds/scripts/guards/emits-completeness.mjs`
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRealComponents } from './lib/components.mjs'
import { report, writeBaseline } from './lib/baseline.mjs'
import { stripComments } from './lib/scss-scan.mjs'
import { buildInterfaceIndex, computeEmittable, resolveDeclared } from './lib/emits.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const BASELINE_PATH = path.join(__dirname, 'baseline/emits-completeness.json')

function run () {
    const index = buildInterfaceIndex()
    const violations = new Map()

    for (const { pascalName, file } of getRealComponents()) {
        const raw = readFileSync(file, 'utf8')
        const src = stripComments(raw)

        // Ensemble ATTEIGNABLE.
        const emittable = computeEmittable(src)
        if (emittable.size === 0) continue

        // Ensemble DÉCLARÉ.
        const decl = src.match(/defineEmits<\s*(I[A-Za-z0-9]*Emits)\s*>/)
        const declared = decl ? resolveDeclared(decl[1], index) : new Set()

        const missing = [...emittable].filter(e => !declared.has(e)).sort()
        if (missing.length) {
            const id = `${pascalName}:${missing.join(',')}`
            violations.set(
                id,
                `Origam${pascalName} (${path.relative(REPO_ROOT, file)}) peut émettre ${missing.map(e => `\`${e}\``).join(', ')} sans le déclarer` +
                (decl ? ` — \`${decl[1]}\` ne le couvre pas` : ' — aucun `defineEmits`, Vue n\'avertira PAS')
            )
        }
    }

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, violations.keys())
        console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
        process.exit(0)
    }

    const exitCode = report({
        guardName: 'emits-completeness (tout update:* atteignable doit être déclaré)',
        baselinePath: BASELINE_PATH,
        currentIds: violations.keys(),
        detailsById: violations,
        fixHint: 'Faire étendre à l\'interface d\'emits la Commons correspondante (ICommonsComponentEmits pour update:modelValue, IActiveEmits pour update:active, IFocusEmits pour update:focused), ou ajouter le defineEmits<IXxxEmits>() manquant. NE PAS déclarer un emit que le composant n\'émet jamais : ça retire son handler de $attrs et change le comportement des attributs hérités.'
    })
    process.exit(exitCode)
}

run()
