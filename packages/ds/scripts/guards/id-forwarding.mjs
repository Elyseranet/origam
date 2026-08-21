#!/usr/bin/env node
/*
 * Guard 15 — id-forwarding: a `useStyle(...)`-generated `id` must not
 * silently shadow the `id` PROP of the same name.
 *
 * BACKGROUND (#381) — full mechanism writeup lives in `lib/id-forwarding.mjs`.
 * 16 components destructured `const {id, ...} = useStyle(xxxStyles)` WITHOUT
 * the `() => props.id` second argument that makes a consumer-supplied id
 * win over the generated one (documented on `useStyle` itself). The
 * template's `:id="id"` then rendered the GENERATED identifier
 * (`origam-xxx-0`) instead of the consumer's — every time, silently, no
 * type error, no runtime warning.
 *
 * SCOPE — this guard catches ONE of the four #381/#421 mechanisms (the
 * majority: 16 of ~20 real occurrences measured). It is a STATIC AST guard,
 * same architecture as every other guard in this suite (fast, no component
 * mounting) — the same split as guard 5 (`unconsumed-props.mjs`, static +
 * `audit:inert-props` runtime sweep in packages/tests). The other three
 * mechanisms — `filterProps` excluding `id` from what reaches a child that
 * needs it, a scoped-slot variable renamed specifically to dodge THIS
 * guard's pattern but still misbound, and a real control with NO `:id`
 * binding at all — have no textual `:id="id"` shape to detect; they were
 * found and fixed by mounting each of `OrigamInput`'s direct consumers and
 * reading the rendered `id` attribute (#421). A component passing this
 * guard is NOT proof its consumer id reaches every real control — only
 * that THIS specific homonym-shadowing shape is absent.
 *
 * Run: `node packages/ds/scripts/guards/id-forwarding.mjs`
 *      `node packages/ds/scripts/guards/id-forwarding.mjs --update-baseline`
 *      (or `pnpm -F origam guards:id-forwarding`)
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRealComponents } from './lib/components.mjs'
import { report, writeBaseline } from './lib/baseline.mjs'
import { analyseSource } from './lib/id-forwarding.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const BASELINE_PATH = path.join(__dirname, 'baseline/id-forwarding.json')

function run () {
    const violations = new Map()

    for (const { pascalName, file } of getRealComponents()) {
        const raw = readFileSync(file, 'utf8')
        const { findings } = analyseSource(raw, path.basename(file))

        for (const f of findings) {
            const id = `${pascalName}:${f.line}`
            violations.set(
                id,
                `Origam${pascalName} (${path.relative(REPO_ROOT, file)}:${f.line}) — :id="id" resout l'id GENERE par useStyle (ligne ${f.useStyleLine}), pas la prop id du consommateur. Corriger : useStyle(xxxStyles, () => props.id).`
            )
        }
    }

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, violations.keys())
        console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
        process.exit(0)
    }

    const exitCode = report({
        guardName: 'id-forwarding (useStyle() ne doit pas masquer la prop id)',
        baselinePath: BASELINE_PATH,
        currentIds: violations.keys(),
        detailsById: violations,
        fixHint: 'Passer () => props.id en second argument de useStyle(...) — cf. le JSDoc de style.composable.ts. Si un `id` local existe deja pour eviter la collision, renommer la destructuration useStyle en `{id: styleId}` (mecanisme A, deja correct sur 8 composants).'
    })
    process.exit(exitCode)
}

run()
