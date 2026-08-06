import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { addComponentsDir, addImports, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
// `NuxtModule` is imported from `@nuxt/schema`, not `@nuxt/kit`: kit uses the
// type internally but does not re-export it. It is needed to ANNOTATE the
// default export below — without the annotation TypeScript infers a type it
// cannot name from a package that is not a direct dependency, and the
// declaration build fails with TS2883. Surfaced by Nuxt 4.5.
import type { NuxtModule } from '@nuxt/schema'

import type { IOrigamNuxtModuleOptions, IOrigamTheme } from '../interfaces'

const MODULE_NAME = 'origam-nuxt'
const CONFIG_KEY = 'origam'

/**
 * Composable names exported by origam that ALSO exist in Nuxt 3/4 core
 * (`#app/composables/router`, `#app/composables/hydrate`, …). Auto-
 * importing them via `addImportsDir` would override Nuxt's built-ins,
 * which leads to `useRouter must be called from inside a setup function`
 * at SSR time — origam's wrappers assume a Vue runtime instance, Nuxt's
 * versions are pure functions that work from anywhere. We skip them
 * during auto-import; consumers who want the origam variants can still
 * import them explicitly via `import { useRouter } from 'origam/composables'`.
 */
const NUXT_COMPOSABLES_BLOCKLIST = new Set([
    'useRoute',
    'useRouter',
    'useLink',
    'useHydration'
])

// ADR-004 (Implemented): the DS ships exactly ONE neutral identity (the origam
// baseline, scoped to :root). It is the implicit default when no themes are
// supplied. A bare install therefore needs no default `themes` array here —
// an empty list lets `createOrigam` fall back to its built-in baseline.
//
// Array-valued options are NOT placed in `defineNuxtModule`'s `defaults`
// because Nuxt merges defaults via `defu`, which CONCATENATES arrays. Array
// options follow OVERRIDE semantics instead: a consumer-provided value replaces
// the default entirely. We resolve them manually in `setup`.
const DEFAULT_THEMES: IOrigamTheme[] = []
const DEFAULT_MODES: string[] = ['light', 'dark']

// Only scalar defaults go through `defu` (safe to merge). The full
// `IOrigamNuxtModuleOptions` defaults (incl. arrays) are still documented via
// `DEFAULTS` for type-checking and the unit specs.
const DEFAULTS: Required<IOrigamNuxtModuleOptions> = {
    themes: DEFAULT_THEMES,
    defaultTheme: 'auto',
    modes: DEFAULT_MODES,
    defaultMode: 'auto',
    cookieName: 'origam-theme',
    modeCookieName: 'origam-mode',
    cookieMaxAge: 60 * 60 * 24 * 365,
    autoImport: true,
    includeUtilities: true,
    prefix: 'Origam'
}

const SCALAR_DEFAULTS = {
    defaultTheme: DEFAULTS.defaultTheme,
    defaultMode: DEFAULTS.defaultMode,
    cookieName: DEFAULTS.cookieName,
    modeCookieName: DEFAULTS.modeCookieName,
    cookieMaxAge: DEFAULTS.cookieMaxAge,
    autoImport: DEFAULTS.autoImport,
    includeUtilities: DEFAULTS.includeUtilities,
    prefix: DEFAULTS.prefix
}

const origamNuxtModule: NuxtModule<IOrigamNuxtModuleOptions, IOrigamNuxtModuleOptions, false> = defineNuxtModule<IOrigamNuxtModuleOptions>({
    meta: {
        name: MODULE_NAME,
        configKey: CONFIG_KEY,
        compatibility: {
            nuxt: '^3.0.0 || ^4.0.0'
        }
    },
    defaults: SCALAR_DEFAULTS,
    setup (options, nuxt) {
        const resolver = createResolver(import.meta.url)

        // Array options use OVERRIDE semantics (see DEFAULT_THEMES note): the
        // consumer's value replaces the default — never merged/concatenated.
        // An empty default lets `createOrigam` install its built-in baseline.
        const themes = options.themes ?? DEFAULT_THEMES
        const defaultTheme = options.defaultTheme ?? DEFAULTS.defaultTheme
        const modes = options.modes ?? DEFAULT_MODES
        const defaultMode = options.defaultMode ?? DEFAULTS.defaultMode
        const cookieName = options.cookieName ?? DEFAULTS.cookieName
        const modeCookieName = options.modeCookieName ?? DEFAULTS.modeCookieName
        const cookieMaxAge = options.cookieMaxAge ?? DEFAULTS.cookieMaxAge
        const autoImport = options.autoImport ?? DEFAULTS.autoImport
        const includeUtilities = options.includeUtilities ?? DEFAULTS.includeUtilities

        // The base token sheets carry the FULL --origam-* surface (primitive +
        // semantic + component). Component variables reference the semantic tier
        // (`var(--origam-color__…)`), so a runtime brand theme that overrides a
        // semantic/scale token via `vars` cascades to every component. Load them
        // as CSS here; the per-brand `vars` / default-props blocks are injected
        // on top at runtime by the plugins via `createOrigam({ themes })`.
        nuxt.options.css = nuxt.options.css || []
        if (!nuxt.options.css.includes('origam/tokens/css/primitive')) {
            nuxt.options.css.unshift('origam/tokens/css/primitive')
        }
        for (const sheet of ['origam/tokens/css/light', 'origam/tokens/css/dark']) {
            if (!nuxt.options.css.includes(sheet)) {
                nuxt.options.css.push(sheet)
            }
        }
        if (includeUtilities && !nuxt.options.css.includes('origam/tokens/css/utilities')) {
            nuxt.options.css.push('origam/tokens/css/utilities')
        }

        addPlugin({
            src: resolver.resolve('./plugin.server'),
            mode: 'server'
        })
        addPlugin({
            src: resolver.resolve('./plugin.client'),
            mode: 'client'
        })

        if (autoImport) {
            // Scan the composables directory and add each named export
            // individually, EXCEPT the ones that conflict with Nuxt's
            // built-in composables (see NUXT_COMPOSABLES_BLOCKLIST).
            //
            // We used to call `addImportsDir(resolver.resolve('../composables'))`
            // which slurps every named export from every file in that
            // tree, including `useRouter` / `useRoute` / `useHydration` —
            // names also provided by Nuxt core. Nuxt emitted a build-time
            // warning ("Duplicated imports …") but went ahead and pinned
            // origam's version, which then blew up at SSR with:
            //   `[Origam] useRouter must be called from inside a setup function`
            // because origam's wrappers expect a Vue instance and Nuxt
            // calls `useRouter()` from non-setup contexts (router guards,
            // i18n middleware, …).
            const composablesRoot = resolver.resolve('../composables')
            const exportNameRegex = /export\s+(?:async\s+)?(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/g

            const collect = (dir: string, acc: Array<{name: string, from: string}>): void => {
                let entries: string[]
                try {
                    entries = readdirSync(dir)
                } catch {
                    return
                }
                for (const entry of entries) {
                    const full = join(dir, entry)
                    let s
                    try {
                        s = statSync(full)
                    } catch {
                        continue
                    }
                    if (s.isDirectory()) {
                        collect(full, acc)
                        continue
                    }
                    if (!/\.(?:m?js|ts)$/.test(entry)) continue
                    if (entry.endsWith('.d.ts')) continue
                    let src = ''
                    try {
                        src = readFileSync(full, 'utf-8')
                    } catch {
                        continue
                    }
                    let m: RegExpExecArray | null
                    exportNameRegex.lastIndex = 0
                    while ((m = exportNameRegex.exec(src))) {
                        const name = m[1]
                        if (NUXT_COMPOSABLES_BLOCKLIST.has(name)) continue
                        acc.push({name, from: full})
                    }
                }
            }

            const imports: Array<{name: string, from: string}> = []
            collect(composablesRoot, imports)
            if (imports.length) {
                addImports(imports)
            }

            addComponentsDir({
                path: resolver.resolve('../components'),
                prefix: '',
                pathPrefix: false,
                global: false
            })
        }

        nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {}
        ;(nuxt.options.runtimeConfig.public as Record<string, unknown>).origam = {
            // Installed theme OBJECTS, passed straight to createOrigam in the
            // plugins (ADR-004 — no preset-name resolution).
            themes,
            defaultTheme,
            modes,
            defaultMode,
            cookieName,
            modeCookieName,
            cookieMaxAge
        }
    }
})

export default origamNuxtModule

export type { IOrigamNuxtModuleOptions }
