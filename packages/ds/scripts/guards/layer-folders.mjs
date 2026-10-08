#!/usr/bin/env node
/**
 * Guard 9 — every layer folder must name a real component, or be transverse.
 *
 * RULE: a sub-folder of `src/{interfaces,types,enums,consts,composables,utils}`
 * is named EXACTLY after a real component (`ExpansionPanel/` for the real
 * component family `OrigamExpansionPanel*`), or it is one of the explicitly
 * listed TRANSVERSE folders — today that list is `Commons` alone. There is
 * no third category. A folder that is neither is a placement bug: whatever
 * lives in it belongs either to a component family or to `Commons/`.
 *
 * The maintainer's rule, verbatim: « Quand c'est transverse, c'est du
 * Commons. Lorsque c'est lié à un composable, c'est transverse aussi, donc
 * Commons. Lorsque c'est lié à un composant ou une famille de composants,
 * c'est dans la famille de composants. »
 *
 * WHY THIS GUARD EXISTS — two bugs no tool could see
 * ---------------------------------------------------
 * Issue #368 found `interfaces/ExpensionPanel/` ("Expension") and
 * `interfaces/DefaultProvider/` (singular; the component is `DefaultsProvider`)
 * sitting in the tree long enough that nobody saw them any more. Both are
 * invisible to every audit that works by matching a layer folder against a
 * component name — the match simply fails, and a failed match reads as
 * "no files for this component" rather than "this folder is misspelled".
 * That is exactly how `ExpansionPanel` once got counted as having 0
 * interfaces while carrying 4.
 *
 * The same blindness hid three whole families: `Textarea/` + `RichToolbar/`
 * were `TextareaField` under two other names, spread over five layers.
 *
 * This guard is the reason those cannot come back. It is deliberately a
 * FOLDER-level check and not a file-level one — `file-naming.mjs` already
 * owns filenames for enums/types/consts, and the two are complementary:
 * a correct filename inside a misspelled folder passes `file-naming` and
 * fails here.
 *
 * SCOPE — what is checked, and what is deliberately not
 * ------------------------------------------------------
 * IN scope: the six declaration layers listed in `LAYERS` below.
 *
 * OUT of scope: `src/directives/`. Its six sub-folders (`ClickOutside`,
 * `Contrast`, `Hover`, `Intersect`, `Ripple`, `Touch`) have no homonymous
 * component and would all be flagged. Moving them to `Commons/` was
 * proposed as part of #368 and **explicitly declined by the maintainer** —
 * directives are their own kind of thing, not a declaration layer. This is
 * a decision, not an oversight: do NOT "fix" the omission by adding
 * `directives` to `LAYERS`.
 *
 * Also out of scope: `src/classes/`, which follows the same `Commons/`
 * convention but is small enough that adding it buys nothing today. Adding
 * it later is a one-line change and should pass as-is.
 *
 * TRANSVERSE — why the list is one entry long
 * ---------------------------------------------
 * Before #368, three sub-systems each had their own per-layer folder
 * (`Theme/`, `Mask/`, `CssSupport/`) and `file-naming.mjs` carried a
 * matching per-directory exemption for each. That list only ever grows: every
 * new sub-system argues for its own folder, and each one costs an exemption
 * in two guards. #368 merged all three into `Commons/`, which is what let
 * BOTH exemption lists collapse to `['Commons']`.
 *
 * So: adding an entry to TRANSVERSE_DIRS is a real architecture decision,
 * not a way to make this guard green. If a new folder needs it, the question
 * to answer first is "why is this not `Commons/`?" — and the honest answer
 * is usually "no reason".
 */

import path from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { report, writeBaseline } from './lib/baseline.mjs'
import { listRepoFiles } from './lib/git-files.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const BASELINE_PATH = path.join(__dirname, 'baseline/layer-folders.json')

const LAYERS = ['interfaces', 'types', 'enums', 'consts', 'composables', 'utils']

const TRANSVERSE_DIRS = new Set(['Commons'])

// Every package this guard covers, and the `packages/<x>/src` label its ids
// carry. Marketing joined since the marketing-reference-factorisation lot —
// add a new package here, never a second guard file. `playground` joined
// under the lot 2 ticket (the package shipped lot 1 with zero guard
// coverage); its lot-1 `Catalog/`, `Registry/`, `Scene/` layer folders and
// lot 2's own `Components/` are DOMAIN areas, not DS component families —
// see `baseline/layer-folders.json` for why they are grandfathered rather
// than renamed.
const ROOTS = [
    { rootLabel: 'packages/ds/src', srcRoot: path.join(DS_ROOT, 'src') },
    { rootLabel: 'packages/marketing/src', srcRoot: path.join(REPO_ROOT, 'packages/marketing/src') },
    { rootLabel: 'packages/playground/src', srcRoot: path.join(REPO_ROOT, 'packages/playground/src') }
]

/**
 * Pure core, kept free of any filesystem access so the self-test can feed it
 * fixtures and measure precision AND recall. `layers` is
 * `[{ layer, folders: string[] }]`; `componentNames` is the Set of real
 * component folder names in PascalCase.
 */
export function findOrphanFolders ({ layers, componentNames, transverseDirs = TRANSVERSE_DIRS, rootLabel = 'packages/ds/src' }) {
    const orphans = []
    for (const { layer, folders } of layers) {
        for (const folder of folders) {
            if (transverseDirs.has(folder)) continue
            if (componentNames.has(folder)) continue
            orphans.push(`${rootLabel}/${layer}/${folder}`)
        }
    }
    return orphans.sort()
}

// A layer/components folder's immediate sub-folder names, read through the
// GIT INDEX (`listRepoFiles`) rather than `readdirSync` — see
// `lib/git-files.mjs`: a disk walk measures whoever runs the guard, not the
// repository (issue #966). A sub-folder is any first path segment under
// `dir` that a tracked (or about-to-be-tracked) file sits inside.
function firstSegmentDirs (dir, repoRoot) {
    const dirs = new Set()
    for (const abs of listRepoFiles(dir, repoRoot)) {
        const rel = path.relative(dir, abs)
        const sep = rel.indexOf(path.sep)
        if (sep > 0) dirs.add(rel.slice(0, sep))
    }
    return dirs
}

function readLayers (srcRoot, repoRoot) {
    const layers = []
    for (const layer of LAYERS) {
        const dir = path.join(srcRoot, layer)
        if (!existsSync(dir)) continue
        layers.push({ layer, folders: [...firstSegmentDirs(dir, repoRoot)] })
    }
    return layers
}

function run () {
    const orphans = []
    for (const { rootLabel, srcRoot } of ROOTS) {
        if (!existsSync(srcRoot)) continue
        const componentNames = getComponentPascalDirSet(srcRoot, REPO_ROOT)
        const layers = readLayers(srcRoot, REPO_ROOT)
        orphans.push(...findOrphanFolders({ layers, componentNames, rootLabel }))
    }
    orphans.sort()

    const detailsById = new Map(
        orphans.map(id => [
            id,
            `\`${path.basename(id)}\` names no real component. Move its files into the owning component's folder, or into \`${path.dirname(id)}/Commons/\` if they are transverse.`
        ])
    )

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, orphans)
        console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
        process.exit(0)
    }

    const exitCode = report({
        guardName: 'layer-folders (every layer folder names a real component, or is Commons)',
        baselinePath: BASELINE_PATH,
        currentIds: orphans,
        detailsById,
        fixHint: 'A layer folder is either a component family or `Commons/`. If it is neither, its files are misfiled — or the folder name is misspelled (that is how `ExpensionPanel/` and `DefaultProvider/` survived so long).'
    })

    process.exit(exitCode)
}

/**
 * Component folder names, taken from the `components/` directory rather than
 * from `.vue` basenames. A family folder (`ExpansionPanel/`) legitimately
 * holds several components (`OrigamExpansionPanel`, `OrigamExpansionPanels`,
 * `OrigamExpansionPanelHeader`), and a layer folder is named after the
 * FAMILY, not after each member — so the directory listing is the right
 * reference here, unlike in `file-naming.mjs` which checks per-file names
 * and therefore derives its set from `.vue` basenames.
 */
function getComponentPascalDirSet (srcRoot, repoRoot) {
    const dir = path.join(srcRoot, 'components')
    if (!existsSync(dir)) return new Set()
    return firstSegmentDirs(dir, repoRoot)
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    run()
}

export { LAYERS, TRANSVERSE_DIRS, ROOTS }
