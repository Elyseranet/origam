/*
 * Guard: function-as-value — une FONCTION locale ne doit pas atterrir là où
 * le code attend sa VALEUR DE RETOUR.
 *
 * POURQUOI CE GARDE EXISTE (l'autre moitié de la cause racine #409 / #401)
 * -------------------------------------------------------------------------
 * `dead-handlers` couvre une moitié de la famille : une fonction qui aurait
 * dû être APPELÉE se retrouve en position jetée (`v-on`, instruction
 * `withModifiers(...)` nue). Cinq occurrences trouvées.
 *
 * L'autre moitié est la même erreur en miroir : la fonction est bien en
 * position CONSOMMÉE, mais c'est l'objet fonction qui y arrive, pas son
 * résultat. Rien n'est jeté — une valeur est bien utilisée, elle est
 * simplement toujours fausse, et toujours la même.
 *
 *   OrigamColorPickerSwatches (#401)
 *     v-if="colorHsv && deepEqual(colorHsv, hsva)"
 *
 *   `hsva` est `const hsva = (color) => RGBtoHSV(rgba(color))`. `deepEqual`
 *   comparait donc un objet HSVA à une FONCTION — faux pour chaque nuance,
 *   dans chaque état, depuis toujours. La coche de sélection ne s'est jamais
 *   affichée une seule fois. Aucune exception, aucune erreur de type
 *   (`deepEqual(a: any, b: any)`), aucun lint. C'est parti en production, et
 *   la suite e2e n'avait aucun test de clic pour l'attraper.
 *
 * CE QUI EST DÉTECTÉ — voir `lib/function-as-value.mjs` pour le mécanisme.
 * Trois formes, toutes démontrablement fausses, où `fn` est un nom lié à un
 * LITTÉRAL de fonction dans le `<script setup>` du même composant :
 *
 *   1. `interpolation`  — `{{ fn }}` : rendre une fonction écrit son code
 *      source dans le DOM.
 *   2. `condition`      — `v-if`/`v-else-if`/`v-show` avec `fn` comme
 *      expression entière, opérande de `&&`/`||`/`??`/`!`, ou condition de
 *      ternaire : un objet fonction est toujours vrai, la condition est
 *      constante.
 *   3. `comparison`     — `fn === x`, ou `fn` passé à un comparateur de
 *      VALEURS (`deepEqual`, `isEqual`, `Object.is`, `includes`,
 *      `indexOf`, `lastIndexOf`). C'est la forme #401. Vérifié aussi dans
 *      le `<script setup>`.
 *
 * Ne signale JAMAIS `:prop="fn"` (une prop callback est légitime), ni
 * `@click="fn"` (c'est `dead-handlers` qui possède `v-on`), ni un nom qui
 * n'est pas déclaré comme littéral de fonction dans ce composant.
 *
 * Run: `node packages/ds/scripts/guards/function-as-value.mjs`
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRealComponents } from './lib/components.mjs'
import { report, writeBaseline } from './lib/baseline.mjs'
import { analyseSource } from './lib/function-as-value.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const BASELINE_PATH = path.join(__dirname, 'baseline/function-as-value.json')

// Stable ID — line numbers deliberately excluded (a baseline keyed on a line
// number breaks on the next unrelated edit above it).
function slug (text) {
    return text.replace(/\s+/g, ' ').trim().slice(0, 80)
}

function run () {
    const violations = new Map()

    for (const { pascalName, file } of getRealComponents()) {
        const raw = readFileSync(file, 'utf8')
        const { findings } = analyseSource(raw, path.basename(file))

        for (const f of findings) {
            const id = `${pascalName}:${f.kind}:${f.name}:${slug(f.text)}`
            violations.set(
                id,
                `Origam${pascalName} (${path.relative(REPO_ROOT, file)}:${f.line}) — ${f.context}="${f.text}" utilise \`${f.name}\` (une fonction) comme VALEUR [${f.kind}]`
            )
        }
    }

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, violations.keys())
        console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
        process.exit(0)
    }

    const exitCode = report({
        guardName: 'function-as-value (une fonction locale ne doit pas servir de VALEUR)',
        baselinePath: BASELINE_PATH,
        currentIds: violations.keys(),
        detailsById: violations,
        fixHint: 'Appeler la fonction : `deepEqual(colorHsv, hsva(color))` au lieu de `deepEqual(colorHsv, hsva)`, `v-if="isActive(item)"` au lieu de `v-if="isActive"`, `{{ label() }}` au lieu de `{{ label }}`. Si la valeur ne dépend d\'aucun argument, la déclarer en `computed` et lire `.value` — le template déballe seul.'
    })
    process.exit(exitCode)
}

run()
