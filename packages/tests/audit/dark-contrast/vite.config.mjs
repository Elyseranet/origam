import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

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

export default defineConfig({
    root: HERE,
    base: './',
    plugins: [instrumentContrastDirective(), vue()],
    build: {
        outDir: resolve(HERE, 'dist'),
        emptyOutDir: true,
        sourcemap: false
    },
    logLevel: 'warn'
})
