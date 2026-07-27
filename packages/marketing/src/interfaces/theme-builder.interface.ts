/**
 * Theme builder (/theming) — data shapes for the visual theme editor.
 *
 * The editor is DATA-DRIVEN: prop controls are derived from each component's
 * existing `playground.controls` block (consts/components/{slug}.const.ts) and
 * the editable CSS tokens are derived from the live origam theme `cssVars`
 * (filtered by the `--origam-{slug}---` block prefix). Nothing here is
 * hardcoded per component — the only per-slug data is the optional preview
 * adapter below, used for components that render nothing on their own.
 */
import type { TMode } from 'origam/types'

import type { IComponentPlaygroundControl } from '~/interfaces/components-catalog.interface'
import type { TThemeBuilderBoxModelMode, TThemeBuilderColorMode } from '~/types/theme-builder-controls.type'

/** The two concrete edit modes (never 'auto'). */
export type TEditMode = 'light' | 'dark'

/** Minimal prop surface shape returned by `?includePropSurface=1`. */
export interface IComponentThemeSurface {
    slug: string
    name: string
    icon: string
    category: string
    parentSlug?: string | null
    playground?: {
        controls: IComponentPlaygroundControl[]
        defaultSlotContent?: string
    } | null
    props: Array<{
        name: string
        type: { label: string | null; slug: string | null; kind: string | null }
        required?: boolean | null
        defaultValue?: string | null
    }>
}

/**
 * A single editable CSS token row surfaced for a component, derived from the
 * origam theme `cssVars`. `kind` drives which input renders (color picker vs
 * plain text for lengths / shadows / misc).
 */
export interface IThemeBuilderToken {
    /** Full CSS custom property, e.g. `--origam-btn---border-radius`. */
    cssVar: string
    /** Short label (the segment after the `---` block separator). */
    label: string
    /** Default value pulled from the origam light theme. */
    defaultValue: string
    /** Editor control to use. */
    kind: 'color' | 'text'
}

/**
 * Per-slug preview adapter. Optional — only needed for components that don't
 * render a visible surface from props alone (need slot content or child demo
 * markup). When absent, the preview falls back to `playground.defaultSlotContent`.
 */
export interface IThemeBuilderPreviewAdapter {
    /** Static props merged under the user-edited props for the preview only. */
    previewProps?: Record<string, unknown>
    /** Plain-text slot content rendered inside the component. */
    slotText?: string
    /** Whether the component needs the `demo` named recipe (rendered in page). */
    demo?: 'tabs' | 'select' | 'badge' | 'card' | 'avatar'
}

/**
 * The serialisable theme-builder state. Only values the user ACTUALLY changed
 * are stored, so the exported file stays a clean diff against the DS defaults.
 *
 *   - `name` / `label` map to `IOrigamTheme.name` / `IOrigamTheme.label`.
 *   - `mode` is kept for meta (global mode hint on the theme, e.g. 'light').
 *   - `activeMode` is the mode currently being edited in the UI (never persisted,
 *     reset to 'light' on load).
 *   - `defaults` is keyed by the origam component key (`origam-{slug}` or
 *     `global`) → prop name → value. Maps to `IOrigamTheme.component`.
 *     Defaults are GLOBAL (mode-independent).
 *   - `cssVars` is split by mode: each sub-map holds the overridden CSS vars for
 *     that mode only. Maps to `IOrigamTheme.cssVars` per exported entry.
 *   - `preset` is the key of the `THEME_BUILDER_PRESETS` entry currently
 *     applied (`''` when the state holds no preset seed — either fresh, or
 *     entirely hand-edited/imported). Single source of truth for the Preset
 *     dropdown so it never shows a value inconsistent with `defaults`/
 *     `cssVars` — the pre-#25 bug: the dropdown was a page-local ref that
 *     never round-tripped through persistence, so a reload could show
 *     "— none —" while a previously-seeded preset's overrides were still
 *     live in `defaults`/`cssVars`.
 */
export interface IThemeBuilderState {
    name: string
    label: string
    mode: TMode
    activeMode: TEditMode
    preset: string
    defaults: Record<string, Record<string, unknown>>
    cssVars: Record<TEditMode, Record<string, string>>
}

/**
 * A reusable theme seed surfaced in the preset picker.
 * Carries both light AND dark token maps so seeding applies the full theme
 * at once — the user picks a theme identity (e.g. "Cartoon"), not a mode.
 * `light` / `dark` are each a SUBSET of the DS theme cssVars exposed by the
 * builder (see THEME_BUILDER_TOKENS) so seeding never bundles the full theme.
 */
export interface IThemeBuilderPreset {
    key: string
    labelKey: string
    labelFallback: string
    light: Record<string, string>
    dark: Record<string, string>
    /**
     * Per-component DEFAULT PROPS (props-first DS logic). Keyed by `global` or
     * `origam-{slug}` → prop → value. Seeded into `state.defaults` by
     * `seedPreset`, re-emitted as `IOrigamTheme.component` on export.
     */
    components?: Record<string, Record<string, unknown>>
}

/**
 * The id of a themable prop group (Color, Size & density, Shape, …). Drives the
 * group sections in the controls panel. kebab-friendly so it doubles as a DOM
 * id / data-cy suffix.
 */
export type TThemeBuilderGroupId =
    | 'color'
    | 'size'
    | 'shape'
    | 'border'
    | 'elevation'
    | 'dimension'
    | 'spacing'
    | 'state'
    | 'icon'
    | 'link'
    | 'layout'
    | 'content'
    | 'other'

/** Display metadata for one prop group section (order, label, icon). */
export interface IThemeBuilderPropGroupMeta {
    id: TThemeBuilderGroupId
    labelKey: string
    labelFallback: string
    icon: string
}

/** Display metadata for one nav category section (order, label, icon). */
export interface IThemeBuilderCategoryMeta {
    id: string
    labelKey: string
    labelFallback: string
    icon: string
}

/**
 * Input kind for a themable prop control.
 *
 * The first five (`select` | `switch` | `number` | `text` | `color`) are the
 * GENERIC kinds, unchanged since round 1 — derived straight from a prop's
 * type label (see `buildControl` in `useThemeBuilderCatalog.ts`).
 *
 * The last five are the RICH controls validated in
 * `packages/marketing/wireframes/theming-controls/*.html` (round 2):
 *  - `color-intent` — palette of the 8 real `TIntent` values + free color.
 *    Used for `color`, `accentColor` (Blockquote only, #212) and, when it
 *    isn't folded into a `border` composite, `borderColor` alone.
 *  - `rounded`      — named rungs (`ROUNDED` enum) + "Autre" 4-corner editor.
 *  - `elevation`    — named shadow rungs + "Autre" (depth OR full box-shadow
 *    composer, both write straight into `elevation`, PR #210).
 *  - `border`       — COMPOSITE: width (`border`) + style (`borderStyle`) +
 *    color (`borderColor`) in one popover. See `props` below.
 *  - `box-model`    — devtools-style box editor for EITHER `padding` OR
 *    `margin` (see `boxModelAxis`). Always writes the single CSS-string prop,
 *    never the discrete `paddingTop`/`marginLeft`/… props (verified dead —
 *    no composable reads them, see `padding-margin-field.html` Constat 1).
 */
export type TThemeBuilderControlKind =
    | 'select'
    | 'switch'
    | 'number'
    | 'text'
    | 'color'
    | 'color-intent'
    | 'rounded'
    | 'elevation'
    | 'border'
    | 'box-model'

/**
 * A single themable prop control derived from a component's `_DOC.props` row.
 * `kind` drives which input renders. Options are resolved from the playground
 * block when available, otherwise parsed from the prop type's union literals.
 *
 * MULTI-PROP CONTROLS (round 2): a control can drive more than one DS prop
 * at once — today only `kind: 'border'` does (`border` + `borderStyle` +
 * `borderColor`). `prop` stays the PRIMARY/identifying prop (used as the
 * React-key-equivalent and the historic single-prop call sites); `props`
 * lists EVERY prop the control reads/writes and drives edit-count/reset.
 * Simple (single-prop) controls always have `props: [prop]`.
 */
export interface IThemeBuilderPropControl {
    /** Prop name (camelCase) as the consumer writes it. Primary/id prop. */
    prop: string
    /**
     * Every prop this control reads/writes. `[prop]` for every simple
     * control; `['border', 'borderStyle', 'borderColor']` for the Border
     * composite. Drives `groupEditCount` (edited-dot) and per-control reset.
     */
    props: string[]
    /** Input kind. `color` renders a swatch + hex; the rest are self-explanatory. */
    kind: TThemeBuilderControlKind
    /** Group this control belongs to. */
    group: TThemeBuilderGroupId
    /** Human label (the prop name is shown as code; this is the long-form label). */
    label: string
    /** Select options (only for kind === 'select'). */
    options?: Array<{ label: string; value: string | number | boolean }>
    /** DS default value for the PRIMARY prop (used to compute the diff and seed the control). */
    defaultValue: string | number | boolean
    /**
     * Per-prop DS defaults for a multi-prop control (`props.length > 1`).
     * Keyed by prop name — e.g. `{ border: 'none', borderStyle: 'solid',
     * borderColor: 'currentColor' }`. Used to reset every facet at once.
     */
    defaultValues?: Record<string, string | number | boolean>
    /** Discriminates the two `box-model` controls (Padding vs Margin). */
    boxModelAxis?: 'padding' | 'margin'
}

/** A prop group section: meta + the controls that fell into it. */
export interface IThemeBuilderPropGroup {
    meta: IThemeBuilderPropGroupMeta
    controls: IThemeBuilderPropControl[]
}

/** A token group section: meta + the editable CSS tokens that fell into it. */
export interface IThemeBuilderTokenGroup {
    meta: IThemeBuilderPropGroupMeta
    tokens: IThemeBuilderToken[]
}

/**
 * One component surfaced in the builder — its identity, the origam defaults key,
 * its grouped prop controls, its grouped CSS tokens, and an optional preview
 * adapter. Built at runtime from the catalog + each component's `_DOC`.
 */
export interface IThemeBuilderComponentEntry {
    slug: string
    /** Origam defaults key, e.g. `origam-btn`. */
    componentKey: string
    /** Global component tag for `<component :is>`, e.g. `origam-btn`. */
    componentTag: string
    name: string
    icon: string
    category: string
    propGroups: IThemeBuilderPropGroup[]
    tokenGroups: IThemeBuilderTokenGroup[]
    /** Flat control list (all groups) — convenience for counts + diff lookups. */
    controls: IThemeBuilderPropControl[]
    /** Flat token list (all groups). */
    tokens: IThemeBuilderToken[]
    previewAdapter: IThemeBuilderPreviewAdapter
    /** True when the component can render a visible preview from props alone. */
    previewable: boolean
}

/** A nav category section: meta + the components that belong to it. */
export interface IThemeBuilderNavCategory {
    meta: IThemeBuilderCategoryMeta
    components: IThemeBuilderComponentEntry[]
}

/** The 4 raw per-side border-width prop values read by `useThemeBuilderBorderControl`. */
export interface IThemeBuilderBorderSideValues {
    top: unknown
    right: unknown
    bottom: unknown
    left: unknown
}

/** Classified state of the Color control (Contrôle 1) — inherit / intent / custom. */
export interface IThemeBuilderColorState {
    mode: TThemeBuilderColorMode
    intent?: string
    custom?: string
}

/** The 4 corners of the Rounded 4-corner editor (Contrôle 3), in px. */
export interface IThemeBuilderRoundedCorners {
    topLeft: number
    topRight: number
    bottomLeft: number
    bottomRight: number
}

/** The 4 edges of the Padding / Margin box-model editor (Contrôle 6), in px. */
export interface IThemeBuilderBoxModelEdges {
    top: number
    left: number
    bottom: number
    right: number
}

/** Full state (link mode + edges) of the Padding / Margin box-model editor. */
export interface IThemeBuilderBoxModelState {
    mode: TThemeBuilderBoxModelMode
    edges: IThemeBuilderBoxModelEdges
}

/** One shadow layer of the Elevation "Autre" full shadow composer (Contrôle 4). */
export interface IThemeBuilderShadowLayer {
    x: number
    y: number
    blur: number
    spread: number
    color: string
    opacity: number
    inset: boolean
}
