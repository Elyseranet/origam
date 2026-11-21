// #1386 — splits tokens/dark.css into its two independent halves so a page that
// pins its mode (data-mode on <html>) does not ship the system-preference copy,
// and the reverse. Generated into dist at build time, never committed: the
// source `dark.css` stays the single hand-maintained file (token-twins guard).
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SYSTEM_BLOCK = /^@media \(prefers-color-scheme: dark\) \{$/m

export function splitDarkSheet (css) {
    const at = css.search(SYSTEM_BLOCK)
    if (at < 0) throw new Error('dark.css: bloc @media (prefers-color-scheme: dark) introuvable')
    return { pinned: css.slice(0, at), system: css.slice(at) }
}

export function writeDarkSheets (tokensDir) {
    const { pinned, system } = splitDarkSheet(readFileSync(join(tokensDir, 'dark.css'), 'utf8'))
    writeFileSync(join(tokensDir, 'dark-pinned.css'), pinned)
    writeFileSync(join(tokensDir, 'dark-system.css'), system)
}
