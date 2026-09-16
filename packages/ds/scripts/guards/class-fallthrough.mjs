#!/usr/bin/env node
/*
 * Guard 22 — class-fallthrough: declaring `class` as a prop KILLS Vue's
 * automatic attribute fallthrough, so the component owes a manual re-bind.
 *
 * BACKGROUND (#620) — full mechanism writeup lives in
 * `lib/class-fallthrough.mjs`. Short form: `ICommonsComponentProps` declares
 * `class`, most of the catalogue inherits it, and a declared attribute is
 * REMOVED from `$attrs` — so `class="…"` written by a consumer lands
 * nowhere unless the component ends its `rootClasses` array with
 * `props.class`. 189 of 192 components did. Three did not
 * (`OrigamChartBullet`, `OrigamChartStreamgraph`,
 * `OrigamDialogConfirmation`), measured at runtime and fixed under #620;
 * `OrigamChartPictorial` was the fourth, fixed earlier in the same ticket.
 *
 * ⛔ WHY A GUARD AND NOT JUST THE FIXES. 189/192 is not an equilibrium a
 * codebase holds on its own. Nothing — not the type system, not the linter,
 * not the test suite — expresses "you inherited this prop, therefore you owe
 * a re-bind". Every NEW component that extends the interface starts broken
 * by default and stays silent about it. The ticket says the guard is worth
 * more than the three fixes, and that is why.
 *
 * SCOPE — static, like every guard here. It proves the value is READ, not
 * that it reaches the rendered root; the runtime verdict lives in
 * `packages/tests/TU/components/Chart/chart-class-style-fallthrough.spec.ts`
 * and `packages/tests/TU/components/Dialog/
 * dialog-confirmation-class-style-620.spec.ts`. It covers `class` only, not
 * `style` — see the lib header for the measured reason.
 *
 * Run: `node packages/ds/scripts/guards/class-fallthrough.mjs`
 *      `node packages/ds/scripts/guards/class-fallthrough.mjs --update-baseline`
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRealComponents } from './lib/components.mjs'
import { report, writeBaseline } from './lib/baseline.mjs'
import { analyseSource } from './lib/class-fallthrough.mjs'
import { declaredPropsFor } from '../audit-unconsumed-props.mjs'
import { runFixtures } from './lib/class-fallthrough.selftest.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const BASELINE_PATH = path.join(__dirname, 'baseline/class-fallthrough.json')

const DEFINE_PROPS = /defineProps\s*<\s*([A-Za-z0-9_]+)\s*>/

/*
 * ⛔ AUTO-TEST D'ABORD. Un detecteur devenu aveugle annonce « 0 violation »
 * avec exactement le meme aplomb qu'un catalogue sain — et ce garde a une
 * baseline VIDE, donc son etat nominal EST « 0 ». Sans ce passage, la seule
 * sortie possible serait indiscernable d'une panne silencieuse. Meme
 * disposition que `prop-shadowing.mjs` et `unconsumed-props.mjs`.
 */
function run () {
    const self = runFixtures({ silent: true })
    if (self.failures) {
        console.log('─'.repeat(70))
        console.log('Guard: class-fallthrough — AUTO-TEST EN ECHEC, balayage non effectue')
        console.log('─'.repeat(70))
        console.log(`⛔ ${self.failures}/${self.total} fixture(s) du detecteur echouent.`)
        console.log('   Son verdict sur le catalogue ne vaut rien tant que ces temoins')
        console.log('   ne repassent pas.')
        console.log('   Detail : node packages/ds/scripts/guards/lib/class-fallthrough.selftest.mjs')
        console.log('─'.repeat(70))
        process.exit(1)
    }

    const violations = new Map()

    for (const { pascalName, file } of getRealComponents()) {
        const raw = readFileSync(file, 'utf8')

        const match = DEFINE_PROPS.exec(raw)
        if (!match) continue

        let declared
        try {
            declared = declaredPropsFor(match[1])
        } catch {
            // An interface the resolver cannot walk is not a violation —
            // `unconsumed-props` already owns reporting resolution gaps.
            continue
        }
        const declaresClass = Boolean(declared && declared.has('class'))

        const { violates } = analyseSource(raw, declaresClass, path.basename(file))
        if (!violates) continue

        violations.set(
            pascalName,
            `Origam${pascalName} (${path.relative(REPO_ROOT, file)}) — ${match[1]} declare \`class\` (transitivement), ce qui la RETIRE de $attrs : le fallthrough automatique de Vue ne s'applique plus. Le composant ne re-binde nulle part props.class, donc un consommateur qui ecrit class="..." ne peint rien.`
        )
    }

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, violations.keys())
        console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
        process.exit(0)
    }

    const exitCode = report({
        guardName: 'class-fallthrough (une `class` declaree en prop doit etre re-bindee)',
        baselinePath: BASELINE_PATH,
        currentIds: violations.keys(),
        detailsById: violations,
        fixHint: 'Terminer le tableau `rootClasses` du composant par `props.class`, comme le font les 189 autres composants du catalogue (ex. OrigamChartGauge, OrigamChartPictorial). Si le composant delegue a un enfant via `filterProps(props, [...])`, retirer `\'class\'` de la liste d\'exclusion NE SUFFIT PAS toujours : cette voie passe par une template ref et ne peint qu\'au SECOND rendu (cf. l\'en-tete de props.composable.ts) — binder :class explicitement sur l\'enfant.'
    })
    process.exit(exitCode)
}

run()
