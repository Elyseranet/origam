/**
 * generate-origam-reset.mjs — regenerate the FULL component-var reset for the
 * `origam` playground theme (`src/themes/origam-reset.generated.ts`).
 *
 * Why (playground isolation bug, 2026-07-10): the /theming preview is wrapped
 * in `<origam-theme-provider theme="origam">`. A `[data-theme="origam"]`
 * sub-tree only re-declares the vars the theme LISTS — any component var the
 * AMBIENT brand defines at the document root (e.g. cartoon's
 * `--origam-btn---background-color-tonal: #fff3d6`) INHERITS through and leaks
 * into the preview. The previous hand-curated 57-var residue could never keep
 * up (1200+ component vars exist). This script derives the COMPLETE reset from
 * the DS baseline sheets — the single source of truth:
 *
 *   packages/ds/src/assets/css/tokens/light.css  → `[data-theme="light"]` block
 *   packages/ds/src/assets/css/tokens/dark.css   → `[data-theme="dark"]` block
 *
 * Everything in those blocks is component-tier except the semantic color scale
 * (`--origam-color__*`), which the origam theme already re-emits via its
 * reused baseline `vars` — so it is excluded here.
 *
 * Run after any DS token rebuild that changes the baseline:
 *   pnpm -F @origam/marketing theme:reset:generate
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const MARKETING_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DS_TOKENS = path.resolve(MARKETING_DIR, '..', 'ds', 'src', 'assets', 'css', 'tokens')
const OUT = path.join(MARKETING_DIR, 'src', 'themes', 'origam-reset.generated.ts')

/**
 * Extract `--origam-*` declarations from the first `selector { … }` block.
 *
 * ⛔ The selector is matched ANCHORED TO THE START OF A LINE, on a source with
 * its `/* … *\/` comments stripped. A plain `indexOf` found the FIRST textual
 * occurrence anywhere — and both sheets mention their own selector in their
 * header comment. On `light.css` the real rule (l. 65) happens to come before
 * the mention (l. 81) and it worked by luck; on `dark.css` the mention sits at
 * l. 16, sixteen lines above the rule, so `indexOf` anchored on prose, the
 * brace walk ran off, and the generator emitted **`dark: 0 vars`** — a silent
 * amputation of the whole dark reset, which nobody read because the script
 * still exits 0.
 *
 * Stripping comments also stops the declaration loop below from harvesting a
 * commented-out `--origam-…: …;` line as if it were live.
 */
function extractBlock (cssPath, selectorStart) {
    const raw = fs.readFileSync(cssPath, 'utf8')
    // Replace each comment by the same number of newlines, so line-anchored
    // matching still works and reported positions stay meaningful.
    const css = raw.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))

    const anchored = new RegExp('^[ \\t]*' + selectorStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'm')
    const found = anchored.exec(css)
    if (!found) throw new Error(`${path.basename(cssPath)}: selector "${selectorStart}" not found at the start of any line`)
    const start = found.index

    const open = css.indexOf('{', start)
    let depth = 1
    let i = open + 1
    while (i < css.length && depth > 0) {
        if (css[i] === '{') depth++
        else if (css[i] === '}') depth--
        i++
    }
    const body = css.slice(open + 1, i - 1)
    const vars = {}
    for (const line of body.split('\n')) {
        const match = /^\s*(--origam-[a-z0-9_-]+)\s*:\s*(.+?);?\s*$/.exec(line)
        if (!match) continue
        const [, name, value] = match
        // Semantic color scale: already reset by the origam theme's own `vars`
        // (reused DS baseline) — re-declaring it here would be redundant noise.
        if (name.startsWith('--origam-color__') || name.startsWith('--origam-color--')) continue
        vars[name] = value.trim()
    }
    return vars
}

const light = extractBlock(path.join(DS_TOKENS, 'light.css'), '[data-theme="light"]')
const dark = extractBlock(path.join(DS_TOKENS, 'dark.css'), '[data-theme="dark"]')

/*
 * ⛔ Refuse to write an amputated reset. The previous version of this script
 * printed `dark: 0 vars` and exited 0 — a generator that silently empties half
 * its output is indistinguishable from one that is merely up to date. Same
 * failure family as #903 (`presets:generate`, 804 lines amputated).
 * The threshold is deliberately loose: it catches "the block was not found",
 * not "a few tokens were removed".
 */
const MIN_VARS = 500
for (const [label, block] of [['light', light], ['dark', dark]]) {
    const n = Object.keys(block).length
    if (n < MIN_VARS) {
        throw new Error(
            `${label}: only ${n} var(s) extracted (< ${MIN_VARS}). The selector block was probably not found — ` +
            'refusing to overwrite the reset with an amputated one.'
        )
    }
}

const stringify = (obj) => Object.keys(obj).sort()
    .map(key => `    ${JSON.stringify(key)}: ${JSON.stringify(obj[key])}`)
    .join(',\n')

fs.writeFileSync(OUT, `// AUTO-GENERATED by scripts/generate-origam-reset.mjs — DO NOT EDIT.
// Full component-var reset for the \`origam\` playground theme, derived from
// the DS baseline sheets (light.css / dark.css). Regenerate after a DS token
// rebuild: \`pnpm -F @origam/marketing theme:reset:generate\`.

export const ORIGAM_COMPONENT_RESET_LIGHT: Record<string, string> = {
${stringify(light)}
}

export const ORIGAM_COMPONENT_RESET_DARK: Record<string, string> = {
${stringify(dark)}
}
`)

console.log(`origam-reset.generated.ts — light: ${Object.keys(light).length} vars, dark: ${Object.keys(dark).length} vars`)
