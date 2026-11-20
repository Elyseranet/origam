import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'

import { addComponent, addComponentsDir, addImports, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
// `NuxtModule` is imported from `@nuxt/schema`, not `@nuxt/kit`: kit uses the
// type internally but does not re-export it. It is needed to ANNOTATE the
// default export below — without the annotation TypeScript infers a type it
// cannot name from a package that is not a direct dependency, and the
// declaration build fails with TS2883. Surfaced by Nuxt 4.5.
import type { Nuxt, NuxtModule } from '@nuxt/schema'

import type { IOrigamNuxtModuleOptions } from '../interfaces/Commons/nuxt-module.interface'
import type { IOrigamTheme } from '../interfaces/Commons/theme.interface'

import { origamTheme } from '../themes/origam.theme'

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
// baseline, scoped to :root). It is the implicit default a Nuxt consumer gets
// when `origam.themes` is left unconfigured — the MODULE supplies it, not
// `createOrigam()` any more (⛔ #360, v3.0.0 harvest: a bare `createOrigam()`
// call installs no theme at all, see `origam.ts`). Baking the fallback in here
// keeps every existing Nuxt consumer (this module's own `plugin.client.ts` /
// `plugin.server.ts` pass `config.themes` straight through) unaffected by that
// change — only DIRECT, non-Nuxt `createOrigam()` callers need to opt in.
//
// Array-valued options are NOT placed in `defineNuxtModule`'s `defaults`
// because Nuxt merges defaults via `defu`, which CONCATENATES arrays. Array
// options follow OVERRIDE semantics instead: a consumer-provided value replaces
// the default entirely. We resolve them manually in `setup`.
const DEFAULT_THEMES: IOrigamTheme[] = origamTheme
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
    prefix: 'Origam',
    locale: {},
    icons: {},
    lite: false,
    include: []
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

/**
 * The base token sheets carry the FULL --origam-* surface (primitive + semantic
 * + component); the per-brand `vars` / default-props blocks are injected on top
 * at runtime by the plugins via `createOrigam({ themes })`.
 */
function registerStyleSheets (nuxt: Nuxt, includeUtilities: boolean): void {
    nuxt.options.css = nuxt.options.css || []
    const sheets = [
        'origam/tokens/css/light',
        'origam/tokens/css/dark',
        ...(includeUtilities ? ['origam/tokens/css/utilities'] : [])
    ]
    if (!nuxt.options.css.includes('origam/tokens/css/primitive')) {
        nuxt.options.css.unshift('origam/tokens/css/primitive')
    }
    for (const sheet of sheets) {
        if (!nuxt.options.css.includes(sheet)) {
            nuxt.options.css.push(sheet)
        }
    }
}

const EXPORT_NAME_REGEX = /export\s+(?:async\s+)?(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/g

function safely<T> (fn: () => T, fallback: T): T {
    try {
        return fn()
    } catch {
        return fallback
    }
}

function exportedNames (file: string): string[] {
    const src = safely(() => readFileSync(file, 'utf-8'), '')
    return [...src.matchAll(EXPORT_NAME_REGEX)]
        .map((m) => m[1])
        .filter((name) => !NUXT_COMPOSABLES_BLOCKLIST.has(name))
}

function collectComposableImports (dir: string, acc: Array<{name: string, from: string}>): void {
    for (const entry of safely(() => readdirSync(dir), [] as string[])) {
        const full = join(dir, entry)
        const stat = safely(() => statSync(full), null)
        if (!stat) continue
        if (stat.isDirectory()) {
            collectComposableImports(full, acc)
        } else if (/\.(?:m?js|ts)$/.test(entry) && !entry.endsWith('.d.ts')) {
            acc.push(...exportedNames(full).map((name) => ({name, from: full})))
        }
    }
}

/**
 * Adds each composable export individually, EXCEPT the ones that conflict with
 * Nuxt's built-ins (see NUXT_COMPOSABLES_BLOCKLIST). `addImportsDir` used to
 * slurp `useRouter` / `useRoute` / `useHydration` too: Nuxt pinned origam's
 * version, which then blew up at SSR with
 * `[Origam] useRouter must be called from inside a setup function`, because
 * origam's wrappers expect a Vue instance and Nuxt calls `useRouter()` from
 * non-setup contexts (router guards, …).
 */
function registerComposableImports (composablesRoot: string): void {
    const imports: Array<{name: string, from: string}> = []
    collectComposableImports(composablesRoot, imports)
    if (imports.length) {
        addImports(imports)
    }
}

function collectVueFiles (dir: string, files: Map<string, string>): void {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) collectVueFiles(full, files)
        else if (entry.name.endsWith('.vue') && !entry.name.endsWith('.story.vue')) files.set(basename(entry.name, '.vue'), full)
    }
}

/**
 * include (#1384): in lite mode only the listed components are known to Nuxt,
 * and bundled when a template uses them.
 */
function registerComponents (componentsRoot: string, lite: boolean, include: string[]): void {
    if (!(lite && include.length)) {
        addComponentsDir({path: componentsRoot, prefix: '', pathPrefix: false, global: false})
        return
    }

    const files = new Map<string, string>()
    collectVueFiles(componentsRoot, files)

    for (const name of include) {
        const filePath = files.get(name)
        if (!filePath) throw new Error(`[origam] \`include\`: unknown component "${name}"`)
        addComponent({name, filePath})
    }
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
        // `DEFAULT_THEMES` (the DS baseline) is what a Nuxt consumer gets when
        // `origam.themes` is left unset — `createOrigam()` itself no longer
        // supplies any fallback (#360).
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
        registerStyleSheets(nuxt, includeUtilities)

        /*********************************************************
         * lite (#1384)
         *
         * @description
         * The plugins build the app through `createOrigamCore` (no `import *` of the components, no MDI stylesheet). Both import `#origam-create`, aliased here to the matching entry.
         ********************************************************/
        const lite = options.lite ?? DEFAULTS.lite
        nuxt.options.alias = nuxt.options.alias || {}
        nuxt.options.alias['#origam-create'] = resolver.resolve(lite ? './create.core' : './create.full')

        addPlugin({
            src: resolver.resolve('./plugin.server'),
            mode: 'server'
        })
        addPlugin({
            src: resolver.resolve('./plugin.client'),
            mode: 'client'
        })

        if (autoImport) {
            registerComposableImports(resolver.resolve('../composables'))
            registerComponents(resolver.resolve('../components'), lite, options.include ?? DEFAULTS.include)
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
            cookieMaxAge,
            locale: options.locale,
            icons: options.icons
        }
    }
})

export default origamNuxtModule

export type { IOrigamNuxtModuleOptions }
