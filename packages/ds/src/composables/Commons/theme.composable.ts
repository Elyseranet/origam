import type { Ref } from 'vue'
import { computed, readonly, ref, watch } from 'vue'

import {
    ORIGAM_MODE_ATTR as MODE_ATTR,
    ORIGAM_MODE_STORAGE_KEY as MODE_STORAGE_KEY,
    ORIGAM_THEME_ATTR as ATTR,
    ORIGAM_THEME_STORAGE_KEY as STORAGE_KEY
} from '../../consts/Commons/theme.const'

import type { TMode, TModeResolved, TTheme, TThemeResolved } from '../../types/Commons/theme.type'
import type { IOrigamThemeSingletonState } from '../../interfaces/Commons/theme.interface'

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

/*********************************************************
 * useTheme
 *
 * @description
 * Handle reactif partage (singleton) sur DEUX axes de theming
 * independants : `theme`/`setTheme`/`resolved`/`toggle` pour la marque
 * (`data-theme`, `'auto'|'light'|'dark'|string`), et `mode`/`setMode`/
 * `resolvedMode`/`toggleMode` pour le clair/sombre (`data-mode`,
 * `'auto'|'light'|'dark'`). Chaque setter persiste dans `localStorage` et
 * applique l'attribut correspondant sur `<html>`. `resolved`/`resolvedMode`
 * ramenent `'auto'` a une valeur concrete via `prefers-color-scheme`.
 *
 * @description
 * Le listener `prefers-color-scheme` est un SINGLETON initialise
 * paresseusement (`ensureSystemPreference`), pas un `onMounted` — donc
 * `resolvedMode` reste correct meme quand `useTheme()` est appele hors
 * d'un composant (ex. un plugin Nuxt, ou aucun cycle de vie n'existe pour
 * driver `onMounted`). `data-mode` ne perd JAMAIS son attribut (retombe
 * toujours sur une valeur concrete) — contrairement a `data-theme`, qui
 * est retire quand `theme === 'auto'`, car la matrice de tokens n'a pas
 * d'equivalent "sans mode".
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

/*********************************************************
 * applyThemeSync
 *
 * @description
 * Aide interne pour plugins SSR / anti-flash : applique une marque
 * (`theme`) au document SYNCHRONEMENT, avant le premier rendu, en
 * court-circuitant la reactivite Vue — utile pour poser `data-theme`
 * avant que l'hydratation ne demarre et eviter un flash de theme au
 * chargement.
 ********************************************************/
export function applyThemeSync (theme: TTheme) {
    applyToDocument(theme)
}

/*********************************************************
 * applyModeSync
 *
 * @description
 * Aide interne pour plugins SSR / anti-flash : applique un mode CONCRET
 * au document synchronement, en court-circuitant la reactivite Vue. Un
 * argument `'auto'` est resolu contre `prefers-color-scheme` courant
 * (repli sur `'light'` si indisponible) — `data-mode` finit toujours
 * concret, jamais `'auto'` litteral, car la matrice de tokens n'a pas de
 * repli sans mode.
 ********************************************************/
export function applyModeSync (mode: TMode) {
    if (mode === 'light' || mode === 'dark') {
        applyModeToDocument(mode)
        return
    }
    const prefersDark = ensureSystemPreference().value
    applyModeToDocument(prefersDark ? 'dark' : 'light')
}

/*********************************************************
 * readPersistedTheme
 *
 * @description
 * Aide interne pour plugins SSR / anti-flash : lit la marque persistee
 * dans `localStorage` SANS instancier `useTheme()` (pas de Ref cree, pas
 * de singleton touche) — retourne `'auto'` si rien n'est persiste ou hors
 * navigateur.
 ********************************************************/
export function readPersistedTheme (): TTheme {
    return readPersisted()
}

/*********************************************************
 * readPersistedMode
 *
 * @description
 * Aide interne pour plugins SSR / anti-flash : lit le mode persiste dans
 * `localStorage` SANS instancier `useTheme()` — retourne `'auto'` si rien
 * n'est persiste ou hors navigateur.
 ********************************************************/
export function readPersistedMode (): TMode {
    return readPersistedModeValue()
}

/*********************************************************
 * _resetThemeForTesting
 *
 * @description
 * Aide de test : vide les singletons module (`theme`, `mode`,
 * `systemPrefersDark`, `mediaInitDone`) pour que chaque spec reparte
 * d'un etat propre. Hors API publique.
 ********************************************************/
export function _resetThemeForTesting () {
    const state = themeSingleton()
    state.theme = null
    state.mode = null
    state.systemPrefersDark = null
    state.mediaInitDone = false
}
