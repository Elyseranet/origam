import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'

/*********************************************************
 * ⛔ NO `import { defineConfig } from 'vite'`, AND NO `vite` DEVDEP — measured
 *
 * @description
 * This harness added `vite` and `sass` to `packages/tests/package.json` in its
 * first version. Both were unnecessary, and the `vite` one broke CI: with
 * `auto-install-peers=true` (see `.npmrc`), pnpm normalises the spec to
 * `@vitejs/plugin-vue`'s PEER range, so a hand-written `"vite": "^8.2.1"`
 * desynchronises the lockfile and every job dies at `Install dependencies`
 * with `ERR_PNPM_OUTDATED_LOCKFILE`. 18/18 red — and when 18/18 go red, it is
 * never the code.
 *
 * Measured after removing both from `package.json` and reinstalling:
 *   - `packages/tests/node_modules/.bin/` still carries `vite` AND `sass`,
 *     pulled in as peers of the already-declared `@vitejs/plugin-vue`;
 *   - the audit runs to completion, `$? = 0`, identical numbers
 *     (11 / 1 664, three controls green).
 *
 * The one thing that did NOT work was importing the `vite` PACKAGE here: an
 * auto-installed peer gets a `.bin` symlink, not a resolvable top-level
 * import, so `defineConfig` threw `ERR_MODULE_NOT_FOUND`. It is a typing
 * helper only — a plain object export is equivalent.
 *
 * ⚠️ The coupling this leaves: the harness needs `auto-install-peers=true` and
 * a declared `@vitejs/plugin-vue`. Both hold today; if either changes, add
 * `vite` back with the spec pnpm itself writes, never a hand-picked range.
 ********************************************************/

const HERE = dirname(fileURLToPath(import.meta.url))
const PROBE = resolve(HERE, 'probe-contrast.directive.ts')

/*********************************************************
 * instrumentContrastDirective
 *
 * @description
 * One resolver does the instrumenting: every import of
 * `…/directives/Contrast/contrast.directive` — the 30 components' LOCAL
 * import (`import vContrast from …` inside `<script setup>`, which no
 * app-level `app.directive()` can override) AND `origam.ts`'s
 * `setContrastConfig` — is redirected to the tagging stub. The DS source is
 * never edited, so the measurement cannot drift from what ships.
 *
 * ⛔ A `resolve.alias` entry is NOT enough: Vite matches a string `find`
 * against the raw specifier, and the components import a RELATIVE path.
 * Rewriting at `resolveId` catches every spelling.
 ********************************************************/
function instrumentContrastDirective () {
    return {
        name: 'origam-probe-contrast-directive',
        enforce: 'pre',
        async resolveId (source, importer, options) {
            if (!/contrast\.directive(\.ts)?$/.test(source)) return null
            if (importer === PROBE) return null
            const resolved = await this.resolve(source, importer, { ...options, skipSelf: true })
            if (!resolved || !resolved.id.includes('/directives/Contrast/')) return null
            return PROBE
        }
    }
}

export default {
    root: HERE,
    base: './',
    plugins: [instrumentContrastDirective(), vue()],
    build: {
        outDir: resolve(HERE, 'dist'),
        emptyOutDir: true,
        sourcemap: false
    },
    logLevel: 'warn'
}
