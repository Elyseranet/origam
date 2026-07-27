import { computed, reactive, watch } from 'vue'

import {
    THEME_BUILDER_DEFAULT_LABEL,
    THEME_BUILDER_DEFAULT_MODE,
    THEME_BUILDER_DEFAULT_NAME,
    THEME_BUILDER_STATE_VERSION,
    THEME_BUILDER_STORAGE_KEY
} from '~/consts/theme-builder.const'
import { THEME_BUILDER_PRESETS } from '~/consts/theme-builder-presets.const'
import { THEME_BUILDER_UNSET_VALUE } from '~/consts/theme-builder-controls.const'
import { useThemeBuilderCatalog } from '~/composables/useThemeBuilderCatalog'
import type {
    IThemeBuilderPreset,
    IThemeBuilderState,
    TEditMode
} from '~/interfaces/theme-builder.interface'
import type { IOrigamTheme } from 'origam/interfaces'
import type { TMode } from 'origam/types'

/**
 * useThemeBuilder — engine for the /theming visual theme builder.
 *
 * DATA-DRIVEN: prop controls per component come from the existing
 * `playground.controls` block (consts/components/{slug}.const.ts); editable CSS
 * tokens come from `THEME_BUILDER_TOKENS` (extracted from the real origam
 * theme). The composable owns the diff-only state, the live preview props per
 * slug, the serialised TS string, and the client-side download. Components stay
 * thin — they only render what the engine exposes.
 *
 * DUAL-MODE (A4+A5):
 * - `cssVars` is split by mode: `state.cssVars.light` / `state.cssVars.dark`.
 * - `defaults` (component prop overrides) are GLOBAL — not split by mode.
 * - `activeMode` drives which mode is currently edited in the UI.
 * - The export emits an `IOrigamTheme[]` array (one entry per mode), each with
 *   its own `cssVars` at the root, plus the global `component` defaults.
 */

/** `my-theme` / `My Theme` → `myTheme` (export identifier). */
function camelCaseName (raw: string): string {
    const cleaned = raw.trim().replace(/[^a-zA-Z0-9]+/g, ' ').trim()
    if (!cleaned) return 'myTheme'
    const parts = cleaned.split(' ')
    const head = (parts[0] ?? '').toLowerCase()
    const tail = parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    const id = [head, ...tail].join('')
    return /^[a-zA-Z]/.test(id) ? id : `theme${id.charAt(0).toUpperCase()}${id.slice(1)}`
}

/** `my-theme` / `My Theme` → `my-theme` (filename slug). */
function kebabName (raw: string): string {
    const slug = raw
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    return slug || THEME_BUILDER_DEFAULT_NAME
}

function serialiseValue (value: unknown): string {
    if (typeof value === 'string') return JSON.stringify(value)
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    return JSON.stringify(value)
}

/**
 * Parse a theme from either raw JSON or a TS module that exports an
 * `IOrigamTheme` object literal (or an array of them). Returns `null` when
 * nothing parseable is found. Throws are caught by the caller.
 */
function parseThemeSource (text: string): unknown {
    const trimmed = text.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return JSON.parse(trimmed)
    }
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) return null
    const literal = trimmed.slice(start, end + 1)

    const factory = new Function(`"use strict"; return (${literal});`)
    return factory()
}

export function useThemeBuilder () {
    const { entries, nav } = useThemeBuilderCatalog()

    const state = reactive<IThemeBuilderState>({
        name: THEME_BUILDER_DEFAULT_NAME,
        label: THEME_BUILDER_DEFAULT_LABEL,
        mode: THEME_BUILDER_DEFAULT_MODE,
        activeMode: 'light',
        preset: '',
        defaults: {},
        cssVars: { light: {}, dark: {} }
    })

    /** Default prop value for a control (used to compute the diff). */
    const defaultProp = (slug: string, prop: string): unknown => {
        const entry = entries.value.find(e => e.slug === slug)
        const ctrl = entry?.controls.find(c => c.prop === prop)
        return ctrl?.defaultValue ?? ''
    }

    /**
     * Default token value for a given mode. Falls back to the light default
     * when no dark-specific default is registered (since most tokens are
     * identical by default in light and dark seeds).
     */
    const defaultToken = (cssVar: string): string => {
        for (const entry of entries.value) {
            const tok = entry.tokens.find(t => t.cssVar === cssVar)
            if (tok) return tok.defaultValue
        }
        return ''
    }

    /** Current value of a prop (edited or default). */
    const propValue = (slug: string, prop: string): unknown => {
        const key = `origam-${slug}`
        const edited = state.defaults[key]?.[prop]
        return edited !== undefined ? edited : defaultProp(slug, prop)
    }

    /**
     * `undefined`/`null`/`''`/`false` are all "nothing set" from a control's
     * point of view — every control's "clear"/"inherit"/"unlink" action
     * writes plain `undefined`, regardless of what the DS default happens
     * to parse to (`parseDefault` in `useThemeBuilderCatalog.ts` turns the
     * literal string `'undefined'` into `''`, a real `false` default stays
     * `false`, …). Without this equivalence, clearing a prop whose default
     * isn't literally `undefined` left a stray `prop: undefined` entry in
     * `state.defaults` — functionally harmless (`propValue` already treats
     * a stored `undefined` as "not edited"), but it polluted the exported
     * theme with dead entries every time a per-side border editor relinked.
     */
    const isUnset = (v: unknown): boolean => v === undefined || v === null || v === '' || v === false

    /** Delete a prop from the diff-only state (prop becomes "not defined"). */
    const unsetProp = (key: string, prop: string): void => {
        if (!state.defaults[key]) return
        delete state.defaults[key][prop]
        if (Object.keys(state.defaults[key]).length === 0) delete state.defaults[key]
    }

    /** Set a prop value, storing only when it differs from the DS default. */
    const setProp = (slug: string, prop: string, value: unknown): void => {
        const key = `origam-${slug}`
        /**
         * "none" sentinel (or a bare `undefined`) means the theme should
         * NOT define this prop at all — remove it so the export omits it and
         * the component keeps its own DS default (PROPS-FIRST). Deleting is
         * unconditional here (independent of the DS default), which also
         * avoids the stray `prop: undefined` entry the previous
         * "equals default" branch left behind when the default wasn't
         * literally `undefined` (it polluted the TS export).
         */
        if (value === THEME_BUILDER_UNSET_VALUE || value === undefined) {
            unsetProp(key, prop)
            return
        }
        const def = defaultProp(slug, prop)
        const isDefault = value === def || (isUnset(value) && isUnset(def))
        if (isDefault) {
            unsetProp(key, prop)
            return
        }
        if (!state.defaults[key]) state.defaults[key] = {}
        state.defaults[key][prop] = value
    }

    /** Current value of a token for a given mode (edited or default). */
    const tokenValue = (mode: TEditMode, cssVar: string): string => {
        const edited = state.cssVars[mode][cssVar]
        return edited !== undefined ? edited : defaultToken(cssVar)
    }

    /** Set a token value for a given mode, storing only when it differs from the theme default. */
    const setToken = (mode: TEditMode, cssVar: string, value: string): void => {
        if (value === defaultToken(cssVar)) {
            delete state.cssVars[mode][cssVar]
            return
        }
        state.cssVars[mode][cssVar] = value
    }

    /** Wipe prop/token overrides + the active preset marker, keep name/label/mode. */
    const clearPreset = (): void => {
        Object.keys(state.defaults).forEach(k => delete state.defaults[k])
        Object.keys(state.cssVars.light).forEach(k => delete state.cssVars.light[k])
        Object.keys(state.cssVars.dark).forEach(k => delete state.cssVars.dark[k])
        state.preset = ''
    }

    /** Reset all edits AND the persisted storage entry. */
    const reset = (): void => {
        clearPreset()
        state.name = THEME_BUILDER_DEFAULT_NAME
        state.label = THEME_BUILDER_DEFAULT_LABEL
        state.mode = THEME_BUILDER_DEFAULT_MODE
        state.activeMode = 'light'
        clearStorage()
    }

    /** Props passed to the live `<component :is>` for a given slug. */
    const previewProps = (slug: string): Record<string, unknown> => {
        const entry = entries.value.find(e => e.slug === slug)
        if (!entry) return {}
        const out: Record<string, unknown> = { ...(entry.previewAdapter.previewProps ?? {}) }
        for (const ctrl of entry.controls) {
            const value = propValue(slug, ctrl.prop)
            if (value === '' || value === false || value === undefined) continue
            out[ctrl.prop] = value
        }
        // Preview-only default: any component exposing a `variant` prop renders
        // with `outlined` so preset/token changes (borders, colours) are visible
        // out of the box — unless the user explicitly picked another variant.
        // Never serialised (previewProps only).
        const variantCtrl = entry.controls.find(
            c => c.prop === 'variant' && c.kind === 'select' && (c.options?.length ?? 0) > 0
        )
        if (variantCtrl && !isPropEdited(slug, 'variant')) {
            const outlined = variantCtrl.options?.find(o => o.value === 'outlined')
            if (outlined) out.variant = outlined.value
        }
        return out
    }

    /**
     * Scoped CSS-var overrides applied to a mode's preview canvas.
     *
     * Returns EVERY seeded/edited cssVar for the mode — not just the ones
     * owned by the currently displayed component. A preset seeds tokens across
     * many components at once; scoping the canvas to a single component's tokens
     * meant picking a preset changed nothing visible when the active component
     * had no preset-specific override. Applying the full mode map keeps the
     * preview honest: every override that the export will emit is also painted.
     * The `slug` argument is kept for API symmetry with the other per-slug
     * helpers and future per-component scoping.
     */
    const previewStyle = (_slug: string, mode: TEditMode): Record<string, string> => {
        const out: Record<string, string> = {}
        for (const [cssVar, value] of Object.entries(state.cssVars[mode])) {
            if (value !== undefined) out[cssVar] = value
        }
        return out
    }

    const slotText = (slug: string): string => {
        const entry = entries.value.find(e => e.slug === slug)
        return entry?.previewAdapter.slotText ?? ''
    }

    /** Number of overridden props across all modes + both cssVars sets. */
    const editCount = computed(() => {
        const propCount = Object.values(state.defaults).reduce((n, m) => n + Object.keys(m).length, 0)
        const lightCount = Object.keys(state.cssVars.light).length
        const darkCount = Object.keys(state.cssVars.dark).length
        return propCount + lightCount + darkCount
    })

    /** Number of overridden tokens for a specific mode only (for tab badges). */
    const editCountByMode = (mode: TEditMode): number => {
        return Object.keys(state.cssVars[mode]).length
    }

    /**
     * Builds one `IOrigamTheme` entry for the given mode. The `component`
     * (defaults) block is shared and injected into both entries.
     */
    const buildThemeEntry = (mode: TEditMode): IOrigamTheme => {
        const baseName = kebabName(state.name)
        const theme: IOrigamTheme = {
            name: `${baseName}-${mode}`,
            mode,
            label: `${state.label.trim() || state.name} (${mode})`
        }
        const cssEntries = Object.entries(state.cssVars[mode])
        if (cssEntries.length) {
            const cssVars: Record<string, string> = {}
            cssEntries.forEach(([k, v]) => { cssVars[k] = v })
            theme.cssVars = cssVars
        }
        const defaultEntries = Object.entries(state.defaults)
        if (defaultEntries.length) {
            const component: Record<string, Record<string, unknown>> = {}
            defaultEntries.forEach(([compKey, props]) => { component[compKey] = { ...props } })
            theme.components = component
        }
        return theme
    }

    /**
     * The diff-only state assembled as an `IOrigamTheme[]` array — one entry
     * per mode (light + dark). Each entry has its own `cssVars` at the root and
     * the shared global `component` defaults. Directly passable to
     * `createOrigam({ themes: [<light>, <dark>] })`.
     */
    const themeObjects = computed<IOrigamTheme[]>(() => [
        buildThemeEntry('light'),
        buildThemeEntry('dark')
    ])

    /** Serialise the diff-only state into a printable `[name].ts` module. */
    const generatedCode = computed(() => {
        const identifier = camelCaseName(state.name)
        const lines: string[] = []
        lines.push('import type { IOrigamTheme } from \'origam/interfaces\'')
        lines.push('')
        lines.push(`export const ${identifier}: IOrigamTheme[] = [`)

        const modes: TEditMode[] = ['light', 'dark']
        modes.forEach((mode, mIdx) => {
            const entry = buildThemeEntry(mode)
            const trailingComma = mIdx < modes.length - 1 ? ',' : ''

            lines.push('    {')
            lines.push(`        name: ${JSON.stringify(entry.name)},`)
            lines.push(`        mode: ${JSON.stringify(entry.mode)},`)
            lines.push(`        label: ${JSON.stringify(entry.label)},`)

            const cssEntries = Object.entries(state.cssVars[mode])
            const defaultEntries = Object.entries(state.defaults)

            if (cssEntries.length) {
                lines.push('        cssVars: {')
                cssEntries.forEach(([k, v], i) => {
                    const comma = i < cssEntries.length - 1 ? ',' : ''
                    lines.push(`            ${JSON.stringify(k)}: ${JSON.stringify(v)}${comma}`)
                })
                lines.push(defaultEntries.length ? '        },' : '        }')
            }

            if (defaultEntries.length) {
                lines.push('        components: {')
                defaultEntries.forEach(([compKey, props], ci) => {
                    lines.push(`            ${JSON.stringify(compKey)}: {`)
                    const propEntries = Object.entries(props)
                    propEntries.forEach(([p, value], pi) => {
                        const comma = pi < propEntries.length - 1 ? ',' : ''
                        lines.push(`                ${p}: ${serialiseValue(value)}${comma}`)
                    })
                    lines.push(`            }${ci < defaultEntries.length - 1 ? ',' : ''}`)
                })
                lines.push('        }')
            }

            lines.push(`    }${trailingComma}`)
        })

        lines.push(']')
        lines.push('')
        return lines.join('\n')
    })

    /** The same `IOrigamTheme[]` array serialised as pretty JSON. */
    const generatedJson = computed(() => `${JSON.stringify(themeObjects.value, null, 4)}\n`)

    const fileName = computed(() => `${kebabName(state.name)}.ts`)
    const jsonFileName = computed(() => `${kebabName(state.name)}.json`)

    /** Generic client-side download of a string payload. */
    const downloadBlob = (contents: string, name: string, mime: string): void => {
        if (typeof window === 'undefined') return
        const blob = new Blob([contents], { type: mime })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = name
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        URL.revokeObjectURL(url)
    }

    /** Download the generated TS module. */
    const download = (): void => downloadBlob(generatedCode.value, fileName.value, 'text/typescript')

    /** Download the generated `IOrigamTheme[]` JSON. */
    const downloadJson = (): void => downloadBlob(generatedJson.value, jsonFileName.value, 'application/json')

    /**
     * Replace the live state from a parsed `IOrigamTheme` or `IOrigamTheme[]`.
     * Accepts the new dual-mode format (array of 2 entries with distinct `mode`)
     * and also the legacy single-object format (migrates into the matching mode).
     */
    const applyTheme = (theme: IOrigamTheme): void => {
        if (typeof theme.name === 'string' && theme.name) state.name = theme.name
        if (typeof theme.label === 'string' && theme.label) state.label = theme.label
        if (theme.mode === 'light' || theme.mode === 'dark' || theme.mode === 'auto') {
            state.mode = theme.mode as TMode
        }
        const mode: TEditMode = theme.mode === 'dark' ? 'dark' : 'light'

        if (theme.cssVars && typeof theme.cssVars === 'object') {
            for (const [k, v] of Object.entries(theme.cssVars)) {
                if (typeof v === 'string' || typeof v === 'number') setToken(mode, k, String(v))
            }
        }

        if (theme.components && typeof theme.components === 'object') {
            for (const [compKey, props] of Object.entries(theme.components as Record<string, unknown>)) {
                if (!props || typeof props !== 'object') continue
                const slug = compKey.replace(/^origam-/, '')
                for (const [prop, value] of Object.entries(props as Record<string, unknown>)) {
                    setProp(slug, prop, value)
                }
            }
        }
    }

    /**
     * Parse a raw string (JSON object or array, or a TS module) and apply it.
     * Accepts both the new IOrigamTheme[] format and the legacy single-object.
     * Returns `true` on success, `false` on a parse error (never throws).
     */
    const importTheme = (raw: string): boolean => {
        const text = raw.trim()
        if (!text) return false
        try {
            const parsed = parseThemeSource(text)
            if (!parsed || typeof parsed !== 'object') return false

            if (Array.isArray(parsed)) {
                clearPreset()
                for (const entry of parsed) {
                    if (!entry || typeof entry !== 'object') continue
                    applyTheme(entry as IOrigamTheme)
                }
                return true
            }

            clearPreset()
            applyTheme(parsed as IOrigamTheme)
            return true
        } catch {
            return false
        }
    }

    /** Seed the builder from a theme preset (applies both light AND dark at once). */
    const seedPreset = (key: string): void => {
        const preset = THEME_BUILDER_PRESETS.find(p => p.key === key)
        if (!preset) return
        clearPreset()
        state.preset = key
        state.mode = 'light'
        state.activeMode = 'light'
        // Write all preset values directly — bypass setToken's "equals default" filter
        // so the full preset config appears in the generated code.
        // setToken would silently drop any token whose value happens to match
        // the registered THEME_BUILDER_TOKENS default, producing an incomplete
        // or empty generated theme (e.g. the origam preset would produce nothing).
        for (const [k, v] of Object.entries(preset.light)) {
            state.cssVars.light[k] = v
        }
        for (const [k, v] of Object.entries(preset.dark)) {
            state.cssVars.dark[k] = v
        }
        // PROPS D'ABORD : applique les props de composant du thème dans
        // state.defaults (ré-émises en `component` à l'export). Clé = `origam-{slug}`
        // ou `global`, comme IOrigamTheme.components.
        for (const [compKey, props] of Object.entries(preset.components ?? {})) {
            state.defaults[compKey] = { ...props }
        }
    }

    const presets: IThemeBuilderPreset[] = THEME_BUILDER_PRESETS

    /**
     * Load the persisted state from localStorage (client-only). Called from the
     * page in `onMounted` so SSR never touches `window`/`localStorage`.
     *
     * Identity fields (name/label/mode) are always restored — they're harmless
     * on their own. Prop/token overrides (`defaults`/`cssVars`) and the active
     * `preset` marker are ONLY restored from a payload stamped with the
     * current `THEME_BUILDER_STATE_VERSION` (see the const's doc comment for
     * why: an older payload can't be replayed without resurrecting a preset's
     * overrides behind a Preset dropdown that shows "— none —", #25).
     */
    const loadStorage = (): void => {
        if (typeof window === 'undefined') return
        try {
            const raw = window.localStorage.getItem(THEME_BUILDER_STORAGE_KEY)
            if (!raw) return
            const saved = JSON.parse(raw) as Partial<IThemeBuilderState & { __v?: number }>
            if (typeof saved.name === 'string') state.name = saved.name
            if (typeof saved.label === 'string') state.label = saved.label
            if (saved.mode === 'light' || saved.mode === 'dark' || saved.mode === 'auto') {
                state.mode = saved.mode
            }

            if (saved.__v !== THEME_BUILDER_STATE_VERSION) return

            if (typeof saved.preset === 'string') state.preset = saved.preset

            if (saved.defaults && typeof saved.defaults === 'object') {
                Object.keys(state.defaults).forEach(k => delete state.defaults[k])
                for (const [k, v] of Object.entries(saved.defaults)) {
                    if (v && typeof v === 'object') state.defaults[k] = { ...v as Record<string, unknown> }
                }
            }
            if (saved.cssVars && typeof saved.cssVars === 'object') {
                const rawVars = saved.cssVars as Record<string, unknown>
                Object.keys(state.cssVars.light).forEach(k => delete state.cssVars.light[k])
                Object.keys(state.cssVars.dark).forEach(k => delete state.cssVars.dark[k])

                if (rawVars.light && typeof rawVars.light === 'object') {
                    for (const [k, v] of Object.entries(rawVars.light as Record<string, unknown>)) {
                        if (typeof v === 'string') state.cssVars.light[k] = v
                    }
                }
                if (rawVars.dark && typeof rawVars.dark === 'object') {
                    for (const [k, v] of Object.entries(rawVars.dark as Record<string, unknown>)) {
                        if (typeof v === 'string') state.cssVars.dark[k] = v
                    }
                }
            }
        } catch {
            /* corrupt entry — ignore and start fresh */
        }
    }

    /** Auto-persist on every state change (client-only). */
    const startAutoPersist = (): void => {
        if (typeof window === 'undefined') return
        watch(
            () => JSON.stringify({ ...state, activeMode: undefined, __v: THEME_BUILDER_STATE_VERSION }),
            (snapshot) => {
                try {
                    window.localStorage.setItem(THEME_BUILDER_STORAGE_KEY, snapshot)
                } catch {
                    /* quota / private mode — non-fatal */
                }
            }
        )
    }

    const clearStorage = (): void => {
        if (typeof window === 'undefined') return
        try {
            window.localStorage.removeItem(THEME_BUILDER_STORAGE_KEY)
        } catch {
            /* non-fatal */
        }
    }

    /** True when a component prop is currently overridden away from its default. */
    const isPropEdited = (slug: string, prop: string): boolean => {
        return state.defaults[`origam-${slug}`]?.[prop] !== undefined
    }

    /** True when a CSS token is currently overridden for the given mode. */
    const isTokenEdited = (mode: TEditMode, cssVar: string): boolean => {
        return state.cssVars[mode][cssVar] !== undefined
    }

    /** Number of overridden props for one component (any mode-agnostic default). */
    const componentEditCount = (slug: string): number => {
        return Object.keys(state.defaults[`origam-${slug}`] ?? {}).length
    }

    /** Number of overridden props within a set of control prop names. */
    const groupEditCount = (slug: string, props: string[]): number => {
        const map = state.defaults[`origam-${slug}`]
        if (!map) return 0
        return props.reduce((n, p) => (map[p] !== undefined ? n + 1 : n), 0)
    }

    /** Number of overridden tokens within a set of cssVars for the active mode. */
    const tokenGroupEditCount = (mode: TEditMode, cssVars: string[]): number => {
        const map = state.cssVars[mode]
        return cssVars.reduce((n, v) => (map[v] !== undefined ? n + 1 : n), 0)
    }

    /** Reset every prop + token override for a single component. */
    const resetComponent = (slug: string): void => {
        delete state.defaults[`origam-${slug}`]
        const entry = entries.value.find(e => e.slug === slug)
        if (!entry) return
        for (const tok of entry.tokens) {
            delete state.cssVars.light[tok.cssVar]
            delete state.cssVars.dark[tok.cssVar]
        }
    }

    return {
        entries,
        nav,
        state,
        editCount,
        editCountByMode,
        generatedCode,
        generatedJson,
        themeObjects,
        fileName,
        jsonFileName,
        presets,
        propValue,
        setProp,
        tokenValue,
        setToken,
        previewProps,
        previewStyle,
        slotText,
        isPropEdited,
        isTokenEdited,
        componentEditCount,
        groupEditCount,
        tokenGroupEditCount,
        resetComponent,
        reset,
        download,
        downloadJson,
        importTheme,
        seedPreset,
        clearPreset,
        loadStorage,
        startAutoPersist
    }
}
