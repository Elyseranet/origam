#!/usr/bin/env node
/**
 * Guard 3 — every component exposes its instance type.
 *
 * RULE: for every `packages/ds/src/components/{Name}/Origam{Name}.vue`, a matching
 *   `export type TOrigamXxx = InstanceType<typeof OrigamXxx>`
 * must exist under `packages/ds/src/types/`.
 *
 * The real component list comes from `lib/components.mjs`, which reads the
 * filesystem (`Origam*.vue`) — never a hand-maintained list, which is
 * exactly what let 63 components drift out of sync in the first place.
 *
 * DETECTION: scans every `*.type.ts` under `src/types/` (recursively) for
 * the literal pattern `InstanceType<typeof Origam{Name}>` and records which
 * component names it finds. A component is compliant if that pattern exists
 * ANYWHERE in `src/types/`, regardless of which file/folder it lives in —
 * the rule only asks for the type to exist, not for a specific location.
 *
 * Run: `node packages/ds/scripts/guards/instance-types.mjs`
 * (or `pnpm -F origam guards:instance-types`)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRealComponents } from './lib/components.mjs'
import { report, writeBaseline } from './lib/baseline.mjs'
import { stripComments } from './lib/scss-scan.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const TYPES_DIR = path.join(DS_ROOT, 'src/types')
const BASELINE_PATH = path.join(__dirname, 'baseline/instance-types.json')

function walk (dir, predicate) {
    const out = []
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry)
        const st = statSync(full)
        if (st.isDirectory()) out.push(...walk(full, predicate))
        else if (predicate(full)) out.push(full)
    }
    return out
}

function run () {
    const typeFiles = walk(TYPES_DIR, f => f.endsWith('.type.ts'))
    const declaredInstanceTypes = new Set()
    const INSTANCE_TYPE_RE = /InstanceType<\s*typeof\s+Origam([A-Za-z0-9]+)\s*>/g

    for (const file of typeFiles) {
        // Strip comments first — a commented-out
        // `// export type TOrigamX = InstanceType<typeof OrigamX>` must NOT
        // count as the type existing.
        const content = stripComments(readFileSync(file, 'utf8'))
        let match
        while ((match = INSTANCE_TYPE_RE.exec(content))) {
            declaredInstanceTypes.add(match[1])
        }
    }

    const components = getRealComponents()
    const violations = new Map()
    for (const { pascalName, file } of components) {
        if (!declaredInstanceTypes.has(pascalName)) {
            const relFile = path.relative(REPO_ROOT, file)
            violations.set(pascalName, `Origam${pascalName} (${relFile}) has no matching \`export type TOrigam${pascalName} = InstanceType<typeof Origam${pascalName}>\` under src/types/`)
        }
    }

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, violations.keys())
        console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
        process.exit(0)
    }

    const exitCode = report({
        guardName: 'instance-types (every Origam*.vue must expose TOrigamXxx = InstanceType<typeof OrigamXxx>)',
        baselinePath: BASELINE_PATH,
        currentIds: violations.keys(),
        detailsById: violations,
        fixHint: 'Add `export type TOrigam{Name} = InstanceType<typeof Origam{Name}>` to a file under packages/ds/src/types/{Domain}/{kebab-case}.type.ts, and re-export it from types/index.ts.'
    })
    process.exit(exitCode)
}

run()
