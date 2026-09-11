import type { Ref } from 'vue'
import { computed, readonly, ref, watch } from 'vue'

import {
    ORIGAM_MODE_ATTR as MODE_ATTR,
    ORIGAM_MODE_STORAGE_KEY as MODE_STORAGE_KEY,
    ORIGAM_THEME_ATTR as ATTR,
    ORIGAM_THEME_STORAGE_KEY as STORAGE_KEY
} from '../../consts/Theme/theme.const'

import type { TMode, TModeResolved, TTheme, TThemeResolved } from '../../types/Theme/theme.type'

/**
 * Module-level singletons — every call to `useTheme()` shares the same Refs
 * so components stay in sync without prop drilling. We store them lazily so
 * SSR doesn't touch `window`/`document` until mount.
 *
 * Two orthogonal axes:
 * - `theme` → brand identity, applied as `data-theme`.
 * - `mode`  → light/dark, applied as `data-mode`.
 *
 * `systemPrefersDark` is also a singleton, initialised once in the browser
 * (NOT tied to a component's `onMounted`) so `resolvedMode` is correct even
 * when `useTheme()` is first called from a Nuxt plugin — where no component
 * lifecycle exists to drive `onMounted`.
 *
 * ### Why `globalThis` on the client (#275)
 *
 * A plain module-level `let` is only a TRUE singleton if every consumer
 * resolves this file to the same physical module instance. That's not
 * guaranteed: a consuming app can alias the DS's Nuxt module to *source*
 * (for dev-mode convenience/HMR) while every other import of the DS resolves
 * to the *compiled* package export — two different files on disk, hence two
 * independent module instances, each with its OWN `_theme`/`_mode` ref.
 *
 * Symptom: `setTheme()` called from the instance the app's UI uses (e.g. the
 * header's theme switcher) never notifies the OTHER instance's watchers —
 * concretely, the Nuxt plugin's `[themeApi.theme, themeApi.resolvedMode]`
 * watcher that reassigns `_defaultsRef` (component default PROPS driven by
 * `theme.components`). Result: cssVars (plain CSS cascade, `data-theme`
 * attribute, nothing to do with this module) keep updating live, but any
 * prop resolved through `useDefaults()` freezes on the theme active at
 * initial load until a full page reload re-seeds both instances from the
 * same cookie.
 *
 * `globalThis` is the one true global object every module instance shares
 * within the same JS realm (the browser tab), so anchoring the singleton
 * there survives the duplication regardless of its exact cause.
 *
 * The SERVER intentionally keeps a plain module-level singleton instead:
 * anchoring per-request theme state on `globalThis` would leak it across
 * concurrent requests handled by the same Node process — the opposite of
 * SSR-safe. SSR has no live theme-switch UI to desync in the first place
 * (each request re-seeds from its own cookie), so the failure mode this fix
 * targets doesn't apply there.
 */
interface IOrigamThemeSingletonState {
    theme: Ref<TTheme> | null
    mode: Ref<TMode> | null
    systemPrefersDark: Ref<boolean> | null
    mediaInitDone: boolean
}

const ORIGAM_THEME_SINGLETON_KEY = '__origamThemeSingleton__'

const _serverSingleton: IOrigamThemeSingletonState = {
    theme: null,
    mode: null,
    systemPrefersDark: null,
    mediaInitDone: false
}

function themeSingleton (): IOrigamThemeSingletonState {
    if (typeof window === 'undefined') return _serverSingleton

    const globalScope = globalThis as unknown as Record<string, IOrigamThemeSingletonState | undefined>
    if (!globalScope[ORIGAM_THEME_SINGLETON_KEY]) {
        globalScope[ORIGAM_THEME_SINGLETON_KEY] = {
            theme: null,
            mode: null,
            systemPrefersDark: null,
            mediaInitDone: false
        }
    }
    return globalScope[ORIGAM_THEME_SINGLETON_KEY]
}

/**
 * One-time, lifecycle-independent init of the `prefers-color-scheme` watcher.
 * Safe to call from any context (plugin, component setup); the actual DOM
 * access is guarded and only runs once in the browser.
 */
function ensureSystemPreference (): Ref<boolean> {
    const state = themeSingleton()
    if (state.systemPrefersDark === null) {
        state.systemPrefersDark = ref(false)
    }
    if (state.mediaInitDone || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return state.systemPrefersDark
    }
    state.mediaInitDone = true
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    state.systemPrefersDark.value = mq.matches
    mq.addEventListener?.('change', (e) => {
        if (state.systemPrefersDark) state.systemPrefersDark.value = e.matches
    })
    return state.systemPrefersDark
}

/*********************************************************
 * Theme (brand) persistence
 ********************************************************/
function readPersisted (): TTheme {
    if (typeof window === 'undefined') return 'auto'
    try {
        const v = window.localStorage?.getItem(STORAGE_KEY)
        if (v === 'auto' || v === 'light' || v === 'dark') return v
        if (v && typeof v === 'string') return v
    } catch { /* localStorage may throw in private mode */ }
    return 'auto'
}

function writePersisted (theme: TTheme) {
    if (typeof window === 'undefined') return
    try {
        window.localStorage?.setItem(STORAGE_KEY, theme)
    } catch { /* ignore */ }
}

function applyToDocument (theme: TTheme) {
    if (typeof document === 'undefined') return
    if (theme === 'auto') {
        document.documentElement.removeAttribute(ATTR)
    } else {
        document.documentElement.setAttribute(ATTR, theme)
    }
}

/*********************************************************
 * Mode (light/dark) persistence
 ********************************************************/
function readPersistedModeValue (): TMode {
    if (typeof window === 'undefined') return 'auto'
    try {
        const v = window.localStorage?.getItem(MODE_STORAGE_KEY)
        if (v === 'auto' || v === 'light' || v === 'dark') return v
    } catch { /* localStorage may throw in private mode */ }
    return 'auto'
}

function writePersistedMode (mode: TMode) {
    if (typeof window === 'undefined') return
    try {
        window.localStorage?.setItem(MODE_STORAGE_KEY, mode)
    } catch { /* ignore */ }
}

/**
 * Apply a CONCRETE mode (`'light'` | `'dark'`) to `<html data-mode>`. The
 * token matrix has no mode-less fallback, so `data-mode` must always carry a
 * concrete value — we never remove the attribute. Callers pass the *resolved*
 * mode (`'auto'` already collapsed to light/dark via `prefers-color-scheme`).
 */
function applyModeToDocument (resolvedMode: TModeResolved) {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute(MODE_ATTR, resolvedMode)
}

/**
 * `useTheme()` returns a shared, reactive handle over the two theming axes.
 *
 * ### Brand axis (`theme` / `data-theme`)
 * - `theme` (read-only ref): the current brand — `'auto' | 'light' | 'dark' | string`.
 * - `setTheme(t)`: imperative setter. Persists to `localStorage` and applies
 *   `data-theme` to `<html>`.
 * - `resolved` (computed): the effective theme after resolving `'auto'`
 *   against `prefers-color-scheme`. Useful for SVG asset switching.
 * - `toggle()`: convenience to flip the brand light ↔ dark (treats `'auto'`
 *   as light). Kept for back-compat with the single-axis API.
 *
 * ### Mode axis (`mode` / `data-mode`)
 * - `mode` (read-only ref): the current color mode — `'auto' | 'light' | 'dark'`.
 * - `setMode(m)`: imperative setter. Persists to `localStorage` and applies
 *   `data-mode` to `<html>`.
 * - `resolvedMode` (computed): the effective mode after resolving `'auto'`
 *   against `prefers-color-scheme`.
 * - `toggleMode()`: flip the color mode light ↔ dark (treats `'auto'` as the
 *   current system preference).
 *
 * The media-query listener is a lazily-initialised SINGLETON (see
 * `ensureSystemPreference`) rather than an `onMounted` hook, so `resolvedMode`
 * is correct even when `useTheme()` is first called outside a component (e.g.
 * a Nuxt plugin). SSR stays safe — the init is a no-op without `window`.
 */

/*********************************************************
 * useTheme
 ********************************************************/
export function useTheme () {
    const state = themeSingleton()
    if (state.theme === null) {
        state.theme = ref<TTheme>(readPersisted())
    }
    if (state.mode === null) {
        state.mode = ref<TMode>(readPersistedModeValue())
    }
    const theme = state.theme
    const mode = state.mode

    const systemPrefersDark = ensureSystemPreference()

    const resolved = computed<TThemeResolved>(() => {
        if (theme.value === 'auto') return systemPrefersDark.value ? 'dark' : 'light'
        // Treat any non-light/dark value as opaque (custom theme like brand-x);
        // assume "light-like" for resolved fallback.
        return theme.value === 'dark' ? 'dark' : 'light'
    })

    const resolvedMode = computed<TModeResolved>(() => {
        if (mode.value === 'auto') return systemPrefersDark.value ? 'dark' : 'light'
        return mode.value
    })

    watch(theme, (next) => {
        applyToDocument(next)
        writePersisted(next)
    }, { immediate: true })

    // The brand attribute follows the raw value (`auto` removes it). The mode
    // attribute follows the RESOLVED value and stays concrete at all times —
    // the token matrix has no mode-less fallback.
    watch(resolvedMode, (next) => {
        applyModeToDocument(next)
    }, { immediate: true })

    watch(mode, (next) => {
        writePersistedMode(next)
    })

    function setTheme (next: TTheme) {
        theme.value = next
    }

    function setMode (next: TMode) {
        mode.value = next
    }

    function toggle () {
        const effective = resolved.value
        theme.value = effective === 'dark' ? 'light' : 'dark'
    }

    function toggleMode () {
        const effective = resolvedMode.value
        mode.value = effective === 'dark' ? 'light' : 'dark'
    }

    return {
        theme: readonly(theme),
        resolved: readonly(resolved),
        setTheme,
        toggle,
        mode: readonly(mode),
        resolvedMode: readonly(resolvedMode),
        setMode,
        toggleMode
    }
}

/**
 * Internal helper for SSR / no-flash plugins: apply a theme (brand) to the
 * document synchronously (called BEFORE first render). Bypasses Vue reactivity.
 */

/*********************************************************
 * applyThemeSync
 ********************************************************/
export function applyThemeSync (theme: TTheme) {
    applyToDocument(theme)
}

/**
 * Internal helper for SSR / no-flash plugins: apply a CONCRETE mode to the
 * document synchronously. Bypasses Vue reactivity. An `'auto'` argument is
 * resolved against the current `prefers-color-scheme` (falling back to
 * `'light'` when unavailable) so `data-mode` always ends up concrete — the
 * token matrix has no mode-less fallback.
 */

/*********************************************************
 * applyModeSync
 ********************************************************/
export function applyModeSync (mode: TMode) {
    if (mode === 'light' || mode === 'dark') {
        applyModeToDocument(mode)
        return
    }
    const prefersDark = ensureSystemPreference().value
    applyModeToDocument(prefersDark ? 'dark' : 'light')
}

/**
 * Internal helper for SSR / no-flash plugins: read the persisted theme (brand)
 * from localStorage without instantiating the composable.
 */

/*********************************************************
 * readPersistedTheme
 ********************************************************/
export function readPersistedTheme (): TTheme {
    return readPersisted()
}

/**
 * Internal helper for SSR / no-flash plugins: read the persisted mode from
 * localStorage without instantiating the composable.
 */

/*********************************************************
 * readPersistedMode
 ********************************************************/
export function readPersistedMode (): TMode {
    return readPersistedModeValue()
}

/**
 * Test-only: clear the module-level singletons (theme / mode refs and the
 * `prefers-color-scheme` cache) so each spec starts from a clean slate. Not
 * part of the public API.
 */

/*********************************************************
 * _resetThemeForTesting
 ********************************************************/
export function _resetThemeForTesting () {
    const state = themeSingleton()
    state.theme = null
    state.mode = null
    state.systemPrefersDark = null
    state.mediaInitDone = false
}
