import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

/**
 * Shared by the `v-contrast` specs: compiles the REAL
 * `contrast.directive.ts` into a dependency-free CLASSIC script that a real
 * Chromium page can run over `file://` (ES modules are blocked by CORS there,
 * and the file has no runtime import: both of its `import` lines are
 * `import type`, which `transpileModule` erases from the syntax alone).
 *
 * The two remaining `export` keywords are stripped (invalid outside a module)
 * and every symbol a spec needs is exposed on `window`; production's actual
 * export surface (`setContrastConfig` + default `vContrast`) is untouched.
 *
 * `import.meta.env?.DEV` is a SYNTAX ERROR in a classic script, and in a real
 * build the consumer's bundler replaces it statically. This harness does the
 * same replacement, so a spec picks the build it wants to observe:
 * `dev: true` (the warning is compiled in) or `dev: false` (a production
 * bundle, where the whole branch is dead code).
 */
const HERE = dirname(fileURLToPath(import.meta.url))
const DIRECTIVE_SRC_PATH = resolve(HERE, '..', '..', '..', 'ds', 'src', 'directives', 'Contrast', 'contrast.directive.ts')

export function buildContrastHarnessScript (dev: boolean): string {
    const source = readFileSync(DIRECTIVE_SRC_PATH, 'utf8')
    const { outputText } = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2020,
            removeComments: true
        }
    })

    const withoutDefaultExport = outputText.replace(/^export default vContrast;\s*$/m, '')
    const withoutNamedExport = withoutDefaultExport.replace(/^export function setContrastConfig\(/m, 'function setContrastConfig(')
    const withEnv = withoutNamedExport.replaceAll('import.meta.env?.DEV', String(dev))

    // Guard against a silent no-op: if the source's shape changes (renamed
    // symbol, reformatted export), these checks must be updated — not left
    // to fail with a confusing "vContrast is not defined" browser error.
    if (withoutDefaultExport === outputText) {
        throw new Error('contrast.directive.ts: `export default vContrast;` not found — update contrast-harness.ts')
    }
    if (withoutNamedExport === withoutDefaultExport) {
        throw new Error('contrast.directive.ts: `export function setContrastConfig(` not found — update contrast-harness.ts')
    }
    if (withEnv.includes('import.meta')) {
        throw new Error('contrast.directive.ts: an `import.meta` other than `import.meta.env?.DEV` remains — update contrast-harness.ts')
    }

    return `${withEnv}
window.__origamContrast = { vContrast, setContrastConfig };
window.__origamContrastInternal = { toRgb, channelsOf, hexToRgb, resolvePaintedBackground, enforceContrast };
`
}

/** Write the harness page to a scratch directory and return its path. */
export function writeContrastHarnessPage (dev: boolean, prefix = 'origam-contrast-'): string {
    const file = join(mkdtempSync(join(tmpdir(), prefix)), 'harness.html')

    writeFileSync(file, `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><title>v-contrast harness</title></head>
<body>
<script>${buildContrastHarnessScript(dev)}</script>
</body>
</html>`)

    return file
}
