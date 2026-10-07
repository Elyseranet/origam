/*
 * Enumerates the DS component SFCs the metadata chain has to cover.
 *
 * ⛔ Files come from the GIT INDEX, never from `readdirSync`. A guard that
 * walks the disk measures the machine it runs on, not the repository — the
 * lesson #966 left behind, where 35 MB of untracked build artefacts under
 * `packages/marketing/public/stories/` joined a guard's scan and both
 * inflated its violation count and polluted its emitter set. The same trap
 * applies here with more teeth: an extra `.vue` picked up off a neighbour's
 * build would be reported as a DS component that no checkout contains.
 */

import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))

export const REPO_ROOT = path.resolve(HERE, '../../../..')
export const COMPONENTS_DIR = path.join(REPO_ROOT, 'packages/ds/src/components')

/**
 * Every tracked, non-story component SFC under `packages/ds/src/components`,
 * absolute and sorted. Stories are excluded: they are `packages/stories`
 * fixtures, not part of the published catalogue.
 */
export function listComponentFiles () {
    const stdout = execFileSync(
        'git',
        ['-C', REPO_ROOT, 'ls-files', '--', 'packages/ds/src/components/**/*.vue'],
        { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
    )

    return stdout
        .split('\n')
        .filter(Boolean)
        .filter(rel => !rel.endsWith('.story.vue'))
        .map(rel => path.join(REPO_ROOT, rel))
        .sort()
}

/** `OrigamBtn` from `.../components/Btn/OrigamBtn.vue`. */
export function componentNameOf (absPath) {
    return path.basename(absPath, '.vue')
}

/** `Btn` — the component FAMILY directory, which groups sub-components. */
export function familyOf (absPath) {
    return path.relative(COMPONENTS_DIR, absPath).split(path.sep)[0]
}
