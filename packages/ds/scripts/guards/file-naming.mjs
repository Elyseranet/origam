#!/usr/bin/env node
/**
 * Guard 4 — enum / type file naming must resolve to a real component.
 *
 * RULE: a file under `src/enums/**` or `src/types/**` is named after the
 * component it belongs to, optionally suffixed with a descriptive concept
 * (`-variant`, `-lang`, `-align`, …) — never a bare concept with no
 * component tie at all.
 *
 * WHY NOT "has a hyphen" — THE FALSE-POSITIVE TRAP
 * ---------------------------------------------------
 * A first pass flagging every multi-word (hyphenated) filename in
 * `src/enums/` + `src/types/` counted 166. Most of those are legitimate:
 * `app-bar.type.ts` (component `AppBar`) and `avatar-group.type.ts`
 * (component `AvatarGroup`) are real, correctly-named, multi-word
 * component files — origam has plenty of two-word component names, and
 * kebab-case is the correct filename casing for all of them (per
 * CLAUDE.md's own file-naming table). Counting hyphens proves nothing;
 * only comparing against the REAL component list does.
 *
 * ALGORITHM — greedy longest-prefix match against the real component list
 * ---------------------------------------------------------------------------
 * Split the filename's basename on `-`. Try the full basename first; if it
 * is not itself a real component's kebab name, drop the last segment and
 * try again, down to a single segment. The first (longest) prefix that
 * matches a real component is accepted — everything after it is treated as
 * a descriptive suffix (`variant`, `lang`, `align`, `mode`, …), which this
 * guard does not restrict to a fixed vocabulary (inventing one would just
 * move the false-positive risk elsewhere). If NO prefix — not even the
 * first single segment — matches any real component, the file names a
 * concept with no traceable owner and is a violation.
 *
 * Examples on the real component list:
 *   - `app-bar.type.ts`      -> "app-bar" matches component AppBar        -> OK
 *   - `avatar-group.type.ts` -> "avatar-group" matches AvatarGroup        -> OK
 *   - `tab-variant.enum.ts`  -> "tab-variant" no match; "tab" matches Tab -> OK
 *   - `mask.enum.ts`         -> "mask" matches no component (the real
 *                               component is `TextMask`, not `Mask`)      -> VIOLATION
 *
 * SCOPE EXCLUSIONS (documented, not silent)
 * -------------------------------------------
 * - `src/{enums,types}/Commons/**` — explicitly cross-cutting mixins by
 *   design (`CLAUDE.md`: "packages/ds/src/interfaces/Commons/*.interface.ts
 *   are the single source of truth for cross-cutting prop surfaces"). A
 *   file there is deliberately not tied to one component.
 * - `types/index.ts`, `enums/index.ts`, `types/tokens.type.ts` — barrels
 *   and the Style-Dictionary-generated token type sheet, not hand-authored
 *   component files.
 *
 * Interfaces and consts are OUT OF SCOPE for this guard — the mission that
 * requested it named only "enums et types" file naming; interfaces/consts
 * naming was not audited and this guard makes no claim about them.
 *
 * Run: `node packages/ds/scripts/guards/file-naming.mjs`
 * (or `pnpm -F origam guards:naming`)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getComponentKebabSet } from './lib/components.mjs'
import { report, writeBaseline } from './lib/baseline.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const BASELINE_PATH = path.join(__dirname, 'baseline/file-naming.json')

const TARGETS = [
    { dir: path.join(DS_ROOT, 'src/types'), suffix: '.type.ts' },
    { dir: path.join(DS_ROOT, 'src/enums'), suffix: '.enum.ts' }
]

const EXCLUDED_BASENAMES = new Set(['index.ts', 'tokens.type.ts'])

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

function longestMatchingPrefix (basename, componentKebabSet) {
    const segments = basename.split('-')
    for (let len = segments.length; len >= 1; len--) {
        const candidate = segments.slice(0, len).join('-')
        if (componentKebabSet.has(candidate)) return candidate
    }
    return null
}

function run () {
    const componentKebabSet = getComponentKebabSet()
    const violations = new Map()

    for (const { dir, suffix } of TARGETS) {
        const files = walk(dir, f => f.endsWith(suffix) && !f.includes(`${path.sep}Commons${path.sep}`))
        for (const file of files) {
            if (EXCLUDED_BASENAMES.has(path.basename(file))) continue
            const base = path.basename(file, suffix)
            const match = longestMatchingPrefix(base, componentKebabSet)
            if (!match) {
                const relFile = path.relative(REPO_ROOT, file)
                violations.set(relFile, `\`${base}\` does not resolve (by longest-prefix match) to any real component name.`)
            }
        }
    }

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, violations.keys())
        console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
        process.exit(0)
    }

    const exitCode = report({
        guardName: 'file-naming (enum/type filenames must resolve to a real component)',
        baselinePath: BASELINE_PATH,
        currentIds: violations.keys(),
        detailsById: violations,
        fixHint: 'Rename the file so its basename is (or is prefixed by) a real component\'s kebab-case name, or move the concept into the owning component\'s existing file if one already exists.'
    })
    process.exit(exitCode)
}

run()
