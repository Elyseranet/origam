import * as fs from "node:fs"
import * as path from "node:path"
import { defineBuildConfig } from "unbuild"
import { writeDarkSheets } from "./scripts/lib/split-dark-sheet.mjs"

export default defineBuildConfig({
    // If entries is not provided, will be automatically inferred from package.json
    entries: [
        {
            builder: 'mkdist',
            input: './src',
            pattern: ['**/*.vue', '!**/*.story.vue'],
            loaders: ['vue']
        },
        {
            builder: 'mkdist',
            input: './src',
            format: 'cjs',
            pattern: [
                '**/*.ts',
                '!**/*.story.ts',
                '!**/*.spec.ts',
                '!**/*.d.ts',
                '!**/__tests__/**',
                '!**/*.cy.ts'
            ],
            loaders: ['js'],
            ext: 'cjs'
        },
        {
            builder: 'mkdist',
            input: './src',
            format: 'esm',
            pattern: [
                '**/*.ts',
                '!**/*.story.ts',
                '!**/*.spec.ts',
                '!**/*.d.ts',
                '!**/__tests__/**',
                '!**/*.cy.ts'
            ],
            loaders: ['js'],
            ext: 'js'
        }
    ],

    // Change outDir, default is 'dist'
    outDir: 'dist/src',

    // Generates *.d.ts declaration file
    declaration: true,
    sourcemap: true,
    clean: true,
    failOnWarn: false,

    hooks: {
        'build:done': () => {
            fs.cpSync('./src/assets', './dist/src/assets', {recursive: true})
            writeDarkSheets('./dist/src/assets/css/tokens')
            if (fs.existsSync('./src/nuxt/module.d.ts')) {
                fs.mkdirSync('./dist/src/nuxt', {recursive: true})
                fs.cpSync('./src/nuxt/module.d.ts', './dist/src/nuxt/module.d.ts')
            }

            // ----------------------------------------------------------
            // Restore `lang="ts"` on dist SFC <script setup> tags.
            //
            // mkdist's vue loader transpiles the script body to plain JS
            // and drops the `lang="ts"` attribute. The TEMPLATE block is
            // left untouched, so any TS-shaped expression that lived in
            // a template binding (`items!.length`, `(node as any).key`,
            // `d.geo!.x`, …) becomes a plain-JS parse error the moment
            // a downstream Vite/Rollup pipeline tries to parse the file.
            //
            // Restoring `lang="ts"` is a no-op for the JS body (TS is a
            // superset of JS) but re-enables TS-aware template parsing
            // in the consumer's `@vitejs/plugin-vue`. The non-null `!`
            // and `as` operators in template expressions then resolve
            // correctly without us having to rewrite the source files.
            //
            // This MUST run after mkdist finishes its own pass — hence
            // the hook lives here in `build:done`.
            // ----------------------------------------------------------
            const componentsRoot = path.resolve('./dist/src/components')
            if (fs.existsSync(componentsRoot)) {
                let patched = 0
                const walk = (dir: string): void => {
                    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
                        const full = path.join(dir, entry.name)
                        if (entry.isDirectory()) {
                            walk(full)
                            continue
                        }
                        if (!entry.name.endsWith('.vue')) continue
                        const src = fs.readFileSync(full, 'utf-8')
                        // Match `<script setup>` exactly (mkdist's output
                        // form). Avoid touching tags that already declare
                        // a language to stay idempotent.
                        const next = src.replace(/<script setup>/g, '<script lang="ts" setup>')
                        if (next !== src) {
                            fs.writeFileSync(full, next, 'utf-8')
                            patched++
                        }
                    }
                }
                walk(componentsRoot)

                console.log(`[origam build] restored lang="ts" on ${patched} SFC script tag(s) in dist`)
            }
        }
    },

    externals: ['vue', 'vue-i18n', 'vue-router', '@mdi/font', '@nuxt/kit', '#app', 'nuxt', 'nuxt/app']
})
