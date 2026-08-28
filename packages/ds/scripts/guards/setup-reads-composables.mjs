#!/usr/bin/env node
/**
 * Guard 17 — a composable must not read its `props` parameter EAGERLY.
 *
 * THE DEFECT THIS EXISTS FOR
 * --------------------------
 * The ADR-005 theme-props resolver patches `instance.props` from a global
 * mixin's `beforeCreate`, which Vue runs AFTER `setup()`. A prop value read
 * eagerly during setup therefore snapshots the PRE-theme value and never
 * updates: the theme has no effect and nothing warns.
 *
 * A composable is called FROM `setup()`, so everything at function-nesting
 * depth 0 of its body executes during setup. The rule is the component rule,
 * with a different root — see `lib/setup-reads.mjs`, which both share.
 *
 * WHY IT MATTERS MORE HERE THAN IN A COMPONENT
 * --------------------------------------------
 * A composable is shared. `useLink` froze `tag` into a string and `useVModel`
 * seeded its internal ref at setup; between them they broke themed props on
 * 16 components. One eager line in `src/composables/` costs more than one in
 * any single `.vue`.
 *
 * ⛔ WHY THIS GUARD EXISTS AT ALL (#504)
 * -------------------------------------
 * The detector already existed and was already correct — it just never looked
 * here. `getRealComponents()` filters on the `.vue` extension AND the
 * `Origam` prefix, so not one file under `src/composables/` had ever been
 * analysed. The scan was extended under #504; this guard is what stops the
 * blind spot from silently reopening at the next composable written without
 * the rule in mind. A detector that is not a gate is a report nobody runs.
 *
 * Run: `node packages/ds/scripts/guards/setup-reads-composables.mjs`
 *      `node packages/ds/scripts/guards/setup-reads-composables.mjs --update-baseline`
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { report, writeBaseline } from './lib/baseline.mjs'
import { analyseComposables } from './lib/setup-reads.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASELINE_PATH = path.join(__dirname, 'baseline/setup-reads-composables.json')

/*
 * The three baselined entries are NOT anonymous debt, and a reader who finds
 * three unexplained lines will treat them as three oversights. Each is a
 * different situation and each awaits an arbitration, not a patch:
 *
 *   useLink.to
 *     `RouterLink.useLink(props)` MUST be called during setup — Vue's own
 *     composable requires it. Deferring the read means rethinking the call,
 *     not moving a line.
 *
 *   useNested.opened / useNested.selected
 *     Seeds a `ref(new Set(...))`. The comment directly above it (#486) says
 *     the value must track external changes to `props.opened` — i.e. it
 *     states the opposite of what a naive "wrap it in a computed" fix would
 *     do. Read that comment before touching this.
 *
 *   useVirtual.height
 *     Seeds a `shallowRef` that is recomputed later inside functions. Very
 *     likely harmless — but "likely" is not a measurement, and none has been
 *     made.
 *
 * Two others were repaired rather than baselined: `provideExpanded` and
 * `provideSelection` passed `props.x` as `useVModel`'s third argument, which
 * was dead code (`useVModel` seeds with
 * `props[prop] !== undefined ? props[prop] : defaultValue`, so the argument
 * is only consulted when the prop is undefined — the case where it was
 * itself undefined). Proven including the theme path in
 * `packages/tests/TU/composables/Commons/vmodel-default-value.spec.ts`.
 */

const rows = analyseComposables().filter((r) => r.param && r.eager.length)

const currentIds = new Set()
const detailsById = new Map()

for (const row of rows) {
    for (const e of row.eager) {
        const id = `${row.fn}.${e.prop}`
        currentIds.add(id)
        detailsById.set(id, `${row.relative}:${e.line} — ${e.text}`)
    }
}

if (process.argv.includes('--update-baseline')) {
    const written = writeBaseline(BASELINE_PATH, currentIds)
    console.log(`Wrote ${written.length} entries to ${BASELINE_PATH}`)
    process.exit(0)
}

process.exit(report({
    guardName: 'setup-reads-composables — un composable ne doit pas lire son parametre props pendant le setup',
    baselinePath: BASELINE_PATH,
    currentIds,
    detailsById,
    fixHint:
        'Une NOUVELLE entree signifie qu un composable lit `props.x` a profondeur 0 de son corps.\n'
        + 'Il est appele depuis setup(), donc cette lecture precede le resolveur ADR-005 et fige\n'
        + 'une valeur d avant le theme — sans erreur ni avertissement.\n'
        + '  1. Differer la lecture : `computed(() => props.x)`, `watch(() => props.x, …)`,\n'
        + '     `toRef(props, \'x\')`, ou la deplacer dans le gestionnaire qui en a besoin.\n'
        + '  2. Si la valeur sert d amorce a une ref, amorcer PARESSEUSEMENT (voir `useVModel`\n'
        + '     et son sentinelle UNSEEDED) plutot qu au setup.\n'
        + '  3. Si un argument passe la prop a un autre composable, verifier qu il sert :\n'
        + '     deux sites passaient `props.x` a `useVModel` en 3e argument pour rien.\n'
        + 'Verifier au montage, sous un theme qui configure la prop — c est le seul cas qui\n'
        + 'peut refuter : `vmodel-default-value.spec.ts` en donne le patron.'
}))
