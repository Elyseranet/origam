// Shared source of truth: the REAL list of DS components, derived from the
// filesystem (Origam*.vue files), never from a guess or a hand-maintained
// list that can drift out of sync.
//
// Every guard that needs to know "is X a real component" imports this
// instead of re-implementing its own component scan.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const DS_ROOT = path.resolve(__dirname, '../../..')
export const COMPONENTS_DIR = path.join(DS_ROOT, 'src/components')

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

// PascalCase -> kebab-case, handling acronym runs (e.g. `QrCode` -> `qr-code`,
// a hypothetical `HTMLEditor` -> `html-editor`).
export function pascalToKebab (name) {
    return name
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        .toLowerCase()
}

// Components that ship as `.vue` but are not part of the public surface (#1249).
// Their single source is `INTERNAL_COMPONENTS` in `src/consts/Commons/commons.const.ts`; a .mjs cannot
// import that file (it pulls `vue` and extensionless TS imports), so the array literal is read as text.
// It throws rather than returning [] so a reformatted constant can never silently re-expose them.
export function getInternalComponentNames () {
    const source = readFileSync(path.join(DS_ROOT, 'src/consts/Commons/commons.const.ts'), 'utf8')
    const match = source.match(/export const INTERNAL_COMPONENTS\s*=\s*\[([^\]]*)\]/)
    if (!match) throw new Error('INTERNAL_COMPONENTS not found in consts/Commons/commons.const.ts')

    return [...match[1].matchAll(/'([^']+)'/g)].map(m => m[1])
}

let cached = null

// Returns [{ pascalName, kebabName, file }] for every `Origam*.vue` under
// packages/ds/src/components — the component's real name is the filename,
// which is the one thing that cannot drift from what actually ships.
export function getRealComponents () {
    if (cached) return cached
    const internal = new Set(getInternalComponentNames())
    const vueFiles = walk(
        COMPONENTS_DIR,
        f => f.endsWith('.vue') && !f.endsWith('.story.vue') && path.basename(f).startsWith('Origam')
            && !internal.has(path.basename(f, '.vue'))
    )
    const seen = new Map()
    for (const file of vueFiles) {
        const pascalName = path.basename(file, '.vue').replace(/^Origam/, '')
        seen.set(pascalName, {
            pascalName,
            kebabName: pascalToKebab(pascalName),
            file
        })
    }
    cached = [...seen.values()]
    return cached
}

export function getComponentKebabSet () {
    return new Set(getRealComponents().map(c => c.kebabName))
}

export function getComponentPascalSet () {
    return new Set(getRealComponents().map(c => c.pascalName))
}
