import type { IOrigamTheme } from '../Theme/origam-theme.interface'

/**
 * Options passed by a consumer in `nuxt.config.ts` under the `origam` key.
 *
 * All fields are optional — the module applies sensible defaults (see
 * `DEFAULTS` in `src/nuxt/module.ts`). Themes are installed as runtime OBJECTS
 * (ADR-004): the module passes the `themes` array straight through to the
 * runtime config and on to `createOrigam` in the plugins, which inject each as
 * a name×mode scoped `--origam-*` block. The theme-invariant `primitive` +
 * `utilities` sheets are still loaded as CSS. Two orthogonal axes are resolved
 * SSR-side to avoid FOUC: the brand `theme` (cookie) and the color `mode`
 * (cookie + `Sec-CH-Prefers-Color-Scheme` hint).
 *
 * ADR-004 (Implemented): the DS ships exactly ONE neutral identity (the origam
 * baseline). Brand themes live in the consuming app (e.g. the marketing
 * package) and are passed here as `IOrigamTheme[]` objects authored in
 * semantic JSON — the DS no longer resolves preset names or ships brand
 * token sheets.
 */
export interface IOrigamNuxtModuleOptions {
    /**
     * Themes to install, as `IOrigamTheme` objects (one per brand×mode). The
     * objects are passed verbatim to `createOrigam`, which injects each as a
     * scoped CSS-var block — no pre-generated per-theme CSS file is loaded.
     * When omitted, `createOrigam` installs the DS built-in baseline (neutral identity).
     */
    themes?: IOrigamTheme[]

    /**
     * Theme (brand) applied when no cookie is set. Use `'auto'` to render no
     * `data-theme` attribute (the default brand).
     *
     * @default 'auto'
     */
    defaultTheme?: string

    /**
     * Color modes supported by the loaded token sheets. Used to validate the
     * resolved mode before applying it.
     *
     * @default ['light', 'dark']
     */
    modes?: string[]

    /**
     * Color mode applied when no cookie is set and no usable
     * `Sec-CH-Prefers-Color-Scheme` hint is sent. Use `'auto'` to let the
     * server fall back to the client hint (or `'light'` if absent).
     *
     * @default 'auto'
     */
    defaultMode?: string

    /**
     * Cookie name used to persist the user's chosen theme (brand) across
     * sessions.
     *
     * @default 'origam-theme'
     */
    cookieName?: string

    /**
     * Cookie name used to persist the user's chosen color mode across
     * sessions.
     *
     * @default 'origam-mode'
     */
    modeCookieName?: string

    /**
     * Cookie `max-age` in seconds (shared by the theme and mode cookies).
     *
     * @default 31_536_000 (1 year)
     */
    cookieMaxAge?: number

    /**
     * Register components and composables as Nuxt auto-imports. Disable if
     * you want to opt-out and import everything explicitly (or namespace
     * the imports to avoid conflicts with another design system).
     *
     * @default true
     */
    autoImport?: boolean

    /**
     * Inject the generated utility classes stylesheet (`origam-utilities.css`).
     * Keep it on unless the consumer ships their own utility layer.
     *
     * @default true
     */
    includeUtilities?: boolean

    /**
     * Prefix applied to auto-imported components. Origam ships components
     * already prefixed `Origam*` so the default is an empty prefix — set
     * this to override if you need a custom namespace.
     *
     * @default 'Origam'
     */
    prefix?: string
}

/**
 * Shape of the public runtime config exposed by the module on
 * `useRuntimeConfig().public.origam`. The plugins read this at boot to install
 * the theme objects, resolve the active theme/mode, and configure the cookies.
 */
export interface IOrigamNuxtRuntimeConfig {
    /**
     * Installed `IOrigamTheme` objects, in install order. The plugins pass
     * these straight to `createOrigam` (no preset-name resolution — ADR-004).
     * A switcher derives its brand list from `useInstalledThemes()` rather than
     * from this payload.
     */
    themes: IOrigamTheme[]
    defaultTheme: string
    modes: string[]
    defaultMode: string
    cookieName: string
    modeCookieName: string
    cookieMaxAge: number
}
