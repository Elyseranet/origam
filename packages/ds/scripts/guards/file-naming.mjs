#!/usr/bin/env node
/**
 * Guard 4 — enum / type / const file naming must resolve to a real component.
 *
 * RULE (tightened — see "History" below): a file under `src/enums/**`,
 * `src/types/**` or `src/consts/**` is named EXACTLY after the real
 * component it belongs to — `chart-honeycomb.enum.ts` for the real
 * component `ChartHoneycomb`, never `chart-honeycomb-color-mode.enum.ts`
 * with a descriptive concept tacked on. ONE file per real component,
 * gathering every enum/type/const that component owns. The concept
 * (`variant`, `lang`, `align`, `mode`, …) lives in the SYMBOL name inside
 * the file (`AUDIO_LOOP_MODE`, `TBlockquoteAlign`, …), never in the
 * filename — that's the whole point of the rule: `grep`-ing for a
 * component's surface means listing ONE file, not chasing N differently
 * -suffixed ones scattered across the directory.
 *
 * ALGORITHM — exact match against the real component list
 * ----------------------------------------------------------
 * The file's basename (suffix stripped) must be a member of
 * `getComponentKebabSet()` — no prefix trick, no suffix tolerance.
 *
 * Examples on the real component list:
 *   - `chart-honeycomb.enum.ts` -> "chart-honeycomb" IS component
 *     ChartHoneycomb                                              -> OK
 *   - `chart-honeycomb-color-mode.enum.ts` -> "chart-honeycomb-color-mode"
 *     is NOT a component (the concept belongs INSIDE chart-honeycomb.enum.ts) -> VIOLATION
 *   - `mask.enum.ts` -> "mask" is not a component (the real owner, once
 *     traced, is `TextField` — see the `Mask/`->`TextField/` merge) -> VIOLATION unless exempted
 *
 * HISTORY — why this got stricter
 * ----------------------------------
 * The guard originally accepted "component name, optionally suffixed with
 * a descriptive concept" (greedy longest-prefix match), which is why
 * `chart-honeycomb-color-mode.enum.ts` used to pass: "chart-honeycomb" is
 * a real component, so the guard stopped looking and let the
 * "-color-mode" suffix ride. That laxity is exactly what let the
 * one-file-per-concept sprawl happen in the first place — the guard
 * matched the CONVENTION EVERYONE WAS ALREADY VIOLATING. Once the mission
 * "un fichier par composant reel" swept enums/types/consts into one file
 * per component (Blockquote, Bracket, Chart's ~23 sub-components, Code,
 * CommandPalette, DataTable, InlineEdit, Masonry, NumberFormat, Parallax,
 * PasswordField, QrCode, Sheet, SliderField, Snackbar, Tabs, TextField
 * (absorbing the misfiled `Mask/`), TextareaField, RichToolbar, Theme's
 * `mdi` catalogue -> Commons, …), the exact-match rule became reachable —
 * every file that convention touched now equals its owning component's
 * kebab name with zero suffix. Loosening back to prefix-matching would
 * let the next component silently re-introduce
 * `some-component-some-concept.enum.ts` and drift right back.
 *
 * SCOPE EXTENSION — consts joined enums/types
 * ----------------------------------------------
 * Previously "Interfaces and consts are OUT OF SCOPE for this guard".
 * Consts are now IN SCOPE (interfaces remain out — a separate, unaudited
 * surface). The DataTable false-positive this caught: `pagination.const.ts`
 * / `select.const.ts` looked like they belonged to the real `Pagination` /
 * `Select` components by bare name, but both export
 * `ORIGAM_DATA_TABLE_*_KEY` injection keys consumed exclusively by
 * `OrigamDataTable` — verified via `grep` before merging, not assumed from
 * the filename. They're folded into `data-table.const.ts` now.
 *
 * SCOPE EXCLUSIONS (documented, not silent)
 * -------------------------------------------
 * - `src/{enums,types,consts}/Commons/**` — explicitly cross-cutting
 *   mixins by design (`CLAUDE.md`: "packages/ds/src/interfaces/Commons/
 *   *.interface.ts are the single source of truth for cross-cutting prop
 *   surfaces"). A file there is deliberately not tied to one component.
 *   `enums/Commons/mdi.enum.ts` + `consts/Commons/mdi.const.ts` (the
 *   generated MDI icon catalogue, ~44 consumers, zero of them the Icon
 *   components themselves) live here for the same reason — not a
 *   component's props, a transverse data catalogue.
 *   The theming ENGINE (`TTheme`, `TMode`, `TModeResolved`, the
 *   semantic/token/installed-theme trees, `theme.const.ts`'s defaults) and
 *   the `useCssSupport()` feature-detection matrix (`FEATURE_QUERIES`) both
 *   live here too, for exactly that reason: they are subsystems, not prop
 *   surfaces. They used to sit in their own `Theme/` and `CssSupport/`
 *   folders under a per-directory exemption; issue #368 merged them into
 *   `Commons/` so that ONE name means "transverse" across every layer,
 *   which is what let this guard's exemption list shrink to `Commons` alone.
 *   `OrigamThemeProvider` is a real (and separately named) component, but
 *   none of those files are scoped to it — that was verified before the
 *   merge, not assumed.
 * - `types/Media/quality-option.type.ts` + `consts/Media/media.const.ts`
 *   (single-file exemptions, not a whole-directory one — `Media/` files
 *   are otherwise in scope) — both consumed by more than one component
 *   (`quality-option.type.ts`: `OrigamVideo` + `OrigamMediaController`;
 *   `media.const.ts`: `useMediaPlayer`, `OrigamAudio` via
 *   `consts/Video/video.const.ts` re-export, `OrigamVideo`), so neither
 *   deliberately lives under any single component's folder. `Media` has
 *   no single owning component (no `OrigamMedia.vue`) to match against,
 *   unlike e.g. `Bracket`. Same rationale as the Commons exclusion
 *   above, scoped to one file at a time instead of the whole directory
 *   because the rest of `Media/` (`MediaController`, `MediaScrubber`,
 *   `MediaVolumeControl`) genuinely does have real single owners.
 * - `types/index.ts`, `enums/index.ts`, `consts/index.ts`,
 *   `types/tokens.type.ts` — barrels and the Style-Dictionary-generated
 *   token type sheet, not hand-authored component files.
 *
 * Interfaces remain OUT OF SCOPE for this guard — not yet audited.
 *
 * Run: `node packages/ds/scripts/guards/file-naming.mjs`
 * (or `pnpm -F origam guards:naming`)
 */

import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getComponentKebabSet } from './lib/components.mjs'
import { report, writeBaseline } from './lib/baseline.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const BASELINE_PATH = path.join(__dirname, 'baseline/file-naming.json')

const TARGETS = [
    { dir: path.join(DS_ROOT, 'src/types'), suffix: '.type.ts', exemptDirs: ['Commons'] },
    { dir: path.join(DS_ROOT, 'src/enums'), suffix: '.enum.ts', exemptDirs: ['Commons'] },
    { dir: path.join(DS_ROOT, 'src/consts'), suffix: '.const.ts', exemptDirs: ['Commons'] }
]

const EXCLUDED_BASENAMES = new Set(['index.ts', 'tokens.type.ts', 'quality-option.type.ts', 'media.const.ts'])

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
    const componentKebabSet = getComponentKebabSet()
    const violations = new Map()

    for (const { dir, suffix, exemptDirs } of TARGETS) {
        const exemptSet = new Set(exemptDirs)
        const files = walk(dir, f => {
            if (!f.endsWith(suffix)) return false
            const domain = path.relative(dir, f).split(path.sep)[0]
            return !exemptSet.has(domain)
        })
        for (const file of files) {
            if (EXCLUDED_BASENAMES.has(path.basename(file))) continue
            const base = path.basename(file, suffix)
            if (!componentKebabSet.has(base)) {
                const relFile = path.relative(REPO_ROOT, file)
                violations.set(relFile, `\`${base}\` is not the exact kebab-case name of any real component.`)
            }
        }
    }

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, violations.keys())
        console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
        process.exit(0)
    }

    const exitCode = report({
        guardName: 'file-naming (enum/type/const filenames must exactly match a real component)',
        baselinePath: BASELINE_PATH,
        currentIds: violations.keys(),
        detailsById: violations,
        fixHint: 'Rename the file to exactly the owning component\'s kebab-case name and fold every enum/type/const it declares into that single file, or move it into the owning component\'s existing file if one already exists.'
    })
    process.exit(exitCode)
}

run()
