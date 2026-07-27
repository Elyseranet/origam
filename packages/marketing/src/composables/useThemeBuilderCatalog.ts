import { computed } from 'vue'

import { useT } from '~/composables/useT'
import {
    THEME_BUILDER_PREVIEW_ADAPTERS,
    THEME_BUILDER_PREVIEWABLE_SLUGS
} from '~/consts/theme-builder.const'
import {
    THEME_BUILDER_CATEGORY_META,
    THEME_BUILDER_COLOR_TYPE_HINTS,
    THEME_BUILDER_PROP_GROUPS,
    THEME_BUILDER_SKIP_PROPS,
    THEME_BUILDER_SKIP_TYPE_HINTS,
    classifyPropGroup
} from '~/consts/theme-builder-groups.const'
import { THEME_BUILDER_TOKENS } from '~/consts/theme-builder-tokens.const'
import {
    THEME_BUILDER_BORDER_FOLD_PROPS,
    THEME_BUILDER_DENSITY_OPTIONS,
    THEME_BUILDER_INTENT_COLOR_PROPS,
    THEME_BUILDER_ORPHAN_COLOR_PROPS
} from '~/consts/theme-builder-controls.const'
import type {
    IComponentPlaygroundControl,
    IComponentPropRow
} from '~/interfaces/components-catalog.interface'
import type {
    IComponentThemeSurface,
    IThemeBuilderComponentEntry,
    IThemeBuilderNavCategory,
    IThemeBuilderPropControl,
    IThemeBuilderPropGroup,
    IThemeBuilderPropGroupMeta,
    IThemeBuilderToken,
    IThemeBuilderTokenGroup,
    TThemeBuilderGroupId
} from '~/interfaces/theme-builder.interface'

/**
 * useThemeBuilderCatalog — derives the FULL, data-driven catalog that powers the
 * /theming builder, from data served by the API:
 *
 *  - GET /api/reference/component?includePropSurface=1
 *      → the nav (every DS component, by category)
 *      → each component's `props[]` (all prop rows, needed for theme controls)
 *      → each component's `playground` block (hand-curated select options)
 *  - THEME_BUILDER_TOKENS        → the editable CSS custom properties (grouped).
 *
 * The static COMPONENTS_CATALOG const files and the import.meta.glob pattern
 * have been removed; all component data now comes from the DB via the API.
 */

/** A prop type label that references data / callbacks / objects is non-themable. */
function isSkippableType (label: string): boolean {
    return THEME_BUILDER_SKIP_TYPE_HINTS.some(hint => label.includes(hint))
}

/** A prop name that binds data / model / identity is non-themable. */
function isSkippableProp (name: string): boolean {
    return (THEME_BUILDER_SKIP_PROPS as readonly string[]).includes(name)
}

/** Whether a prop type label denotes a colour value → swatch input. */
function isColorType (label: string): boolean {
    return THEME_BUILDER_COLOR_TYPE_HINTS.some(hint => label.includes(hint))
}

/**
 * Parse a union type label into select options when it is a literal union, e.g.
 * `'sm' | 'md' | 'lg'` → [sm, md, lg]. Returns null when the label is not a
 * pure string-literal union (then we fall back to text / number / switch).
 */
function parseUnionOptions (label: string): Array<{ label: string; value: string }> | null {
    if (!label.includes('|')) return null
    const parts = label.split('|').map(p => p.trim())
    const literals: Array<{ label: string; value: string }> = []
    for (const part of parts) {
        const m = part.match(/^'([^']*)'$/) ?? part.match(/^"([^"]*)"$/)
        if (!m || m[1] === undefined) return null
        const literal = m[1]
        literals.push({ label: literal === '' ? '(none)' : literal, value: literal })
    }
    return literals.length ? literals : null
}

/** Normalise a `_DOC` defaultValue string (e.g. "'elevated'", "false", "0") to a value. */
function parseDefault (raw: string): string | number | boolean {
    const v = raw.trim()
    if (v === 'true') return true
    if (v === 'false') return false
    if (v === 'undefined' || v === 'null' || v === '') return ''
    const quoted = v.match(/^'([^']*)'$/) ?? v.match(/^"([^"]*)"$/)
    if (quoted && quoted[1] !== undefined) return quoted[1]
    if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v)
    return v.replace(/^['"]|['"]$/g, '')
}

/** Humanise a camelCase prop name into a label, e.g. `bgColor` → `Bg color`. */
function humanise (name: string): string {
    const spaced = name.replace(/([A-Z])/g, ' $1').replace(/[-_]+/g, ' ').trim()
    return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/**
 * Build one themable control from a prop row. The playground control (if
 * one exists for this prop) is the AUTHORITATIVE source for select options +
 * default, since it was hand-curated. Otherwise we derive from the prop type.
 * Returns null when the prop is non-themable.
 */
function buildControl (
    row: IComponentPropRow,
    t: (key: string, fallback?: string) => string,
    playground?: IComponentPlaygroundControl
): IThemeBuilderPropControl | null {
    if (isSkippableProp(row.name)) return null

    const group = classifyPropGroup(row.name)
    const typeLabel = row.type.label

    if (playground) {
        return {
            prop: row.name,
            props: [row.name],
            kind: playground.kind === 'select' ? 'select' : playground.kind,
            group,
            label: humanise(row.name),
            options: playground.options,
            defaultValue: playground.defaultValue
        }
    }

    /**
     * `density` (`TDensity`) is a template-literal type (`${DENSITY}`), not an
     * inlined string-literal union, so `parseUnionOptions` below never sees a
     * `'compact' | 'default' | 'comfortable'` label to parse — it fell through
     * to a free-text input (#294). The 3 real `DENSITY` enum values are known
     * and finite, so they get the same treatment as any other themable enum:
     * a `kind: 'select'` control.
     */
    if (row.name === 'density') {
        return {
            prop: row.name,
            props: [row.name],
            kind: 'select',
            group,
            label: humanise(row.name),
            options: THEME_BUILDER_DENSITY_OPTIONS.map(o => ({ label: t(o.labelKey, o.labelFallback), value: o.value })),
            defaultValue: parseDefault(row.defaultValue)
        }
    }

    if (typeLabel === 'boolean') {
        return {
            prop: row.name,
            props: [row.name],
            kind: 'switch',
            group,
            label: humanise(row.name),
            defaultValue: parseDefault(row.defaultValue)
        }
    }

    if (isColorType(typeLabel)) {
        return {
            prop: row.name,
            props: [row.name],
            kind: 'color',
            group,
            label: humanise(row.name),
            defaultValue: parseDefault(row.defaultValue)
        }
    }

    const unionOptions = parseUnionOptions(typeLabel)
    if (unionOptions) {
        return {
            prop: row.name,
            props: [row.name],
            kind: 'select',
            group,
            label: humanise(row.name),
            options: unionOptions,
            defaultValue: parseDefault(row.defaultValue)
        }
    }

    if (typeLabel === 'number') {
        return {
            prop: row.name,
            props: [row.name],
            kind: 'number',
            group,
            label: humanise(row.name),
            defaultValue: parseDefault(row.defaultValue)
        }
    }

    if (typeLabel === 'string' || typeLabel.includes('TSize') || typeLabel.includes('number | string') || typeLabel.includes('string | number')) {
        return {
            prop: row.name,
            props: [row.name],
            kind: 'text',
            group,
            label: humanise(row.name),
            defaultValue: parseDefault(row.defaultValue)
        }
    }

    if (isSkippableType(typeLabel)) return null

    return {
        prop: row.name,
        props: [row.name],
        kind: 'text',
        group,
        label: humanise(row.name),
        defaultValue: parseDefault(row.defaultValue)
    }
}

/**
 * Compose the FLAT per-prop control list into the grouped, RICH-CONTROL
 * sections rendered by the panel (`IThemeBuilderComponentEntry.propGroups`).
 *
 * This is a rendering-only transform — it NEVER mutates or drops entries
 * from the flat `controls` list (still 1 row per real DS prop), which stays
 * the single source of truth for `defaultProp`/`previewProps` lookups in
 * `useThemeBuilder.ts`. Only the grouped/visual bucket is affected:
 *  - `color` / `accentColor` → relabelled `kind: 'color-intent'` (still 1 prop each).
 *  - `rounded` → relabelled `kind: 'rounded'` (still 1 prop — see the
 *    correction documented in `theme-builder-rounded.util.ts`).
 *  - `elevation` → relabelled `kind: 'elevation'` (still 1 prop).
 *  - `padding` / `margin` → relabelled `kind: 'box-model'` (still 1 prop
 *    each, rendered as 2 SEPARATE rows — never merged, per the wireframe).
 *  - `border` + every prop in `BORDER_FOLD_PROPS` the component actually
 *    exposes → MERGED into ONE composite row (`kind: 'border'`). Folded
 *    props are dropped from the GROUPED list (shown inside the composite's
 *    popover) but stay in the flat `controls` list untouched.
 */
function composePropGroups (flatControls: IThemeBuilderPropControl[]): IThemeBuilderPropGroup[] {
    const byProp = new Map(flatControls.map(c => [c.prop, c]))
    const consumed = new Set<string>()
    const composed: IThemeBuilderPropControl[] = []

    for (const ctrl of flatControls) {
        if (consumed.has(ctrl.prop)) continue

        if (THEME_BUILDER_INTENT_COLOR_PROPS.has(ctrl.prop)) {
            composed.push({ ...ctrl, kind: 'color-intent', props: [ctrl.prop] })
            continue
        }

        if (ctrl.prop === 'rounded') {
            composed.push({ ...ctrl, kind: 'rounded', props: ['rounded'] })
            continue
        }

        if (ctrl.prop === 'elevation') {
            composed.push({ ...ctrl, kind: 'elevation', props: ['elevation'] })
            continue
        }

        if (ctrl.prop === 'padding') {
            composed.push({ ...ctrl, kind: 'box-model', props: ['padding'], boxModelAxis: 'padding' })
            continue
        }

        if (ctrl.prop === 'margin') {
            composed.push({ ...ctrl, kind: 'box-model', props: ['margin'], boxModelAxis: 'margin' })
            continue
        }

        if (ctrl.prop === 'border') {
            const props = ['border']
            const defaultValues: Record<string, string | number | boolean> = { border: ctrl.defaultValue }
            for (const foldProp of THEME_BUILDER_BORDER_FOLD_PROPS) {
                const foldCtrl = byProp.get(foldProp)
                if (!foldCtrl) continue
                props.push(foldProp)
                defaultValues[foldProp] = foldCtrl.defaultValue
                consumed.add(foldProp)
            }
            composed.push({ ...ctrl, kind: 'border', props, defaultValues })
            continue
        }

        if ((THEME_BUILDER_BORDER_FOLD_PROPS as readonly string[]).includes(ctrl.prop)) {
            // Folded into the `border` composite above when a `border`
            // control exists for this component (handled by that branch,
            // regardless of iteration order — `consumed` is populated from
            // `byProp` lookups, not from visiting order). Re-added below as
            // a standalone row ONLY when no `border` control exists at all.
            continue
        }

        composed.push(ctrl)
    }

    // Orphan border-family props — a component that exposes one of them
    // without a `border` prop at all (unlikely, but never silently dropped).
    for (const ctrl of flatControls) {
        if ((THEME_BUILDER_BORDER_FOLD_PROPS as readonly string[]).includes(ctrl.prop) && !consumed.has(ctrl.prop) && !byProp.has('border')) {
            composed.push(THEME_BUILDER_ORPHAN_COLOR_PROPS.has(ctrl.prop) ? { ...ctrl, kind: 'color-intent', props: [ctrl.prop] } : ctrl)
        }
    }

    return groupControls(composed)
}

/** Bucket controls into their groups, in the canonical group order. */
function groupControls (controls: IThemeBuilderPropControl[]): IThemeBuilderPropGroup[] {
    const byGroup = new Map<TThemeBuilderGroupId, IThemeBuilderPropControl[]>()
    for (const ctrl of controls) {
        const bucket = byGroup.get(ctrl.group) ?? []
        bucket.push(ctrl)
        byGroup.set(ctrl.group, bucket)
    }
    const out: IThemeBuilderPropGroup[] = []
    for (const meta of THEME_BUILDER_PROP_GROUPS) {
        const bucket = byGroup.get(meta.id)
        if (bucket && bucket.length) out.push({ meta, controls: bucket })
    }
    return out
}

/** Infer a token's group from its CSS-var name (background-color → color, …). */
function classifyToken (cssVar: string): TThemeBuilderGroupId {
    const tail = cssVar.split('---').pop() ?? cssVar
    if (tail.includes('color') || tail.includes('background') || tail.includes('fill')) return 'color'
    if (tail.includes('radius') || tail.includes('rounded')) return 'shape'
    if (tail.includes('border')) return 'border'
    if (tail.includes('shadow') || tail.includes('elevat')) return 'elevation'
    if (tail.includes('padding') || tail.includes('margin') || tail.includes('density')) return 'spacing'
    if (tail.includes('width') || tail.includes('height')) return 'dimension'
    if (tail.includes('font') || tail.includes('letter') || tail.includes('line-height') || tail.includes('text')) return 'content'
    return 'other'
}

/** Bucket CSS tokens into their groups, in the canonical group order. */
function groupTokens (tokens: IThemeBuilderToken[]): IThemeBuilderTokenGroup[] {
    const byGroup = new Map<TThemeBuilderGroupId, IThemeBuilderToken[]>()
    for (const tok of tokens) {
        const id = classifyToken(tok.cssVar)
        const bucket = byGroup.get(id) ?? []
        bucket.push(tok)
        byGroup.set(id, bucket)
    }
    const out: IThemeBuilderTokenGroup[] = []
    const metaById = new Map<TThemeBuilderGroupId, IThemeBuilderPropGroupMeta>(
        THEME_BUILDER_PROP_GROUPS.map(m => [m.id, m])
    )
    for (const meta of THEME_BUILDER_PROP_GROUPS) {
        const bucket = byGroup.get(meta.id)
        if (bucket && bucket.length) out.push({ meta: metaById.get(meta.id) ?? meta, tokens: bucket })
    }
    return out
}

/** Build the full builder entry for one component from its API surface. */
function buildEntry (component: IComponentThemeSurface, t: (key: string, fallback?: string) => string): IThemeBuilderComponentEntry {
    const playgroundControls = component.playground?.controls ?? []
    const playgroundByProp = new Map(playgroundControls.map(c => [c.prop, c]))

    const controls: IThemeBuilderPropControl[] = []
    for (const raw of component.props ?? []) {
        const row: IComponentPropRow = {
            name: raw.name,
            type: {
                label: raw.type.label ?? '',
                slug: raw.type.slug ?? '',
                kind: (raw.type.kind ?? 'primitive') as 'primitive' | 'type' | 'enum',
            },
            defaultValue: raw.defaultValue ?? '',
            descriptionKey: '',
            descriptionFallback: '',
            required: raw.required ?? false,
        }
        const ctrl = buildControl(row, t, playgroundByProp.get(raw.name))
        if (ctrl) controls.push(ctrl)
    }

    const tokens = THEME_BUILDER_TOKENS[component.slug] ?? []

    return {
        slug: component.slug,
        componentKey: `origam-${component.slug}`,
        componentTag: `origam-${component.slug}`,
        name: component.name,
        icon: component.icon,
        category: component.category,
        propGroups: composePropGroups(controls),
        tokenGroups: groupTokens(tokens),
        controls,
        tokens,
        previewAdapter: THEME_BUILDER_PREVIEW_ADAPTERS[component.slug] ?? {},
        previewable: (THEME_BUILDER_PREVIEWABLE_SLUGS as readonly string[]).includes(component.slug)
    }
}

export function useThemeBuilderCatalog () {
    const { t } = useT()

    const { data } = useFetch<IComponentThemeSurface[]>('/api/reference/component', {
        key: 'catalog:component:theme-surface',
        query: { includePropSurface: '1' },
        default: () => [] as IComponentThemeSurface[],
    })

    /**
     * EVERY documented DS component becomes a playground entry — top-level
     * families (btn, card, …) AND their family members (btn-group, btn-toggle,
     * progress-linear, progress-circular, …).
     *
     * Filtering to `!c.parentSlug` (pre-#25) silently dropped ~half the
     * catalog (96 of 194 `doc_entry` rows): several family members are
     * legitimate standalone DS components a theme author needs to configure
     * independently — `origam-progress-linear`/`origam-progress-circular` are
     * used directly in real markup (not only via the `<origam-progress>`
     * dispatcher), same for `origam-btn-group`/`origam-btn-toggle`. The gap
     * was already flagged as unintentional in this file's own history: the
     * curated `THEME_BUILDER_PREVIEWABLE_SLUGS` list (theme-builder.const.ts)
     * already carries `'progress-linear'`, and `THEME_BUILDER_TOKENS` seeds
     * tokens for several other family slugs — both were dead code under the
     * old filter since those slugs could never reach `entries`.
     *
     * Every `doc_entry` of kind `component` (in DB: 0 with a null/missing
     * `category`, verified) carries its own `category`, so no extra grouping
     * logic is needed here — the existing `nav` reducer below just gets more
     * entries per bucket. A family member that isn't independently mountable
     * still surfaces safely: `entry.previewable` (curated allowlist) stays
     * `false` for anything not explicitly vetted, so `ThemeBuilderPreview`
     * falls back to its existing "preview unavailable" message instead of
     * mounting an unactivatable sub-part — the props/tokens stay editable
     * and exportable either way, which is the actual requirement (#25):
     * being configurable does not require a live render.
     */
    const entries = computed<IThemeBuilderComponentEntry[]>(() => {
        return (data.value ?? []).map(c => buildEntry(c, t))
    })

    const nav = computed<IThemeBuilderNavCategory[]>(() => {
        const byCategory = new Map<string, IThemeBuilderComponentEntry[]>()
        for (const entry of entries.value) {
            const bucket = byCategory.get(entry.category) ?? []
            bucket.push(entry)
            byCategory.set(entry.category, bucket)
        }

        const result: IThemeBuilderNavCategory[] = []
        const seen = new Set<string>()
        for (const meta of THEME_BUILDER_CATEGORY_META) {
            const bucket = byCategory.get(meta.id)
            if (bucket && bucket.length) {
                result.push({ meta, components: [...bucket].sort((a, b) => a.name.localeCompare(b.name)) })
                seen.add(meta.id)
            }
        }
        for (const [category, bucket] of byCategory) {
            if (seen.has(category)) continue
            result.push({
                meta: { id: category, labelKey: '', labelFallback: category, icon: 'mdi-shape-outline' },
                components: [...bucket].sort((a, b) => a.name.localeCompare(b.name))
            })
        }
        return result
    })

    return { entries, nav }
}
