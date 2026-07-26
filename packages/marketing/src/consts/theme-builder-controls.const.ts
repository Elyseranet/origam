/**
 * THEME_BUILDER_CONTROLS — data for the 6 rich prop controls validated in
 * `packages/marketing/wireframes/theming-controls/*.html` (round 2) and the
 * high-fidelity demo (Artifact 809a8469).
 *
 * Every literal below was VERIFIED against the real DS source before being
 * copied here (never invented — see the file/line pointers in each comment):
 *  - intents        → `packages/ds/src/types/Commons/intent.type.ts` (TIntent)
 *                      + runtime set `COLOR_INTENTS` (`origam/consts`)
 *  - rounded rungs   → `packages/ds/src/enums/Commons/rounded.enum.ts` (ROUNDED)
 *  - elevation rungs → `packages/ds/src/consts/Commons/elevation.const.ts`
 *                      (ORIGAM_SHADOW_RUNGS) — only the 6 rungs validated in
 *                      the wireframe (none/xs/sm/md/lg/xl) are exposed; `2xl`/
 *                      `3xl` exist in the DS but were never shown to the user.
 *  - border width    → local `UTILITY_BORDER` in
 *                      `packages/ds/src/composables/Commons/border.composable.ts`
 *                      (none/thin/thick) — NOT exported by the DS, mirrored here.
 *  - border style    → `packages/ds/src/enums/Commons/border.enum.ts` (BORDER_STYLE)
 *  - spacing scale    → local `UTILITY_PADDING_SCALE` / `UTILITY_MARGIN_SCALE` in
 *                      `packages/ds/src/composables/Commons/{padding,margin}.composable.ts`
 *                      (0,1,2,3,4,5,6,8,10,12) — NOT exported by the DS, mirrored here.
 *
 * The sentinel `THEME_BUILDER_CUSTOM_VALUE` ('__custom__') never reaches a DS
 * prop — it only selects the "Autre…" branch of a control's local UI state.
 */
import { BORDER_STYLE, DENSITY, ROUNDED } from 'origam/enums'

/** Sentinel select value that reveals a control's custom/"Autre…" editor. */
export const THEME_BUILDER_CUSTOM_VALUE = '__custom__' as const

/**
 * Sentinel value meaning "this prop is NOT defined by the theme" (undefined /
 * unset). Modelled on `THEME_BUILDER_CUSTOM_VALUE`: it only ever lives in a
 * control's local `<select>` state and NEVER reaches `IOrigamTheme.component`
 * — `setProp` recognises it (like a bare `undefined`) and DELETES the prop
 * from `state.defaults`, so the exported theme omits it and the DS component
 * keeps its own default (PROPS-FIRST). Every control kind surfaces it as the
 * "none" option so a theme author can uniformly opt OUT of a prop.
 */
export const THEME_BUILDER_UNSET_VALUE = '__unset__' as const

/**
 * The 8 real `TIntent` values, in the order validated in `color-field.html`
 * (État C) — 2 rows of 4 in the swatch grid.
 */
export const THEME_BUILDER_INTENT_OPTIONS: Array<{ value: string; labelKey: string; labelFallback: string }> = [
    { value: 'primary', labelKey: 'theming.control.color.intent.primary', labelFallback: 'Primary' },
    { value: 'secondary', labelKey: 'theming.control.color.intent.secondary', labelFallback: 'Secondary' },
    { value: 'success', labelKey: 'theming.control.color.intent.success', labelFallback: 'Success' },
    { value: 'warning', labelKey: 'theming.control.color.intent.warning', labelFallback: 'Warning' },
    { value: 'danger', labelKey: 'theming.control.color.intent.danger', labelFallback: 'Danger' },
    { value: 'info', labelKey: 'theming.control.color.intent.info', labelFallback: 'Info' },
    { value: 'neutral', labelKey: 'theming.control.color.intent.neutral', labelFallback: 'Neutral' },
    { value: 'ghost', labelKey: 'theming.control.color.intent.ghost', labelFallback: 'Ghost' }
]

/**
 * Named `rounded` rungs, in the order validated in `rounded-field.html`
 * (État B). The head option `'none'` is the shared "none" (unset) entry:
 * its control composable emits `undefined`, so the prop is omitted from the
 * exported theme and the component keeps its own DS default (PROPS-FIRST) —
 * it is NOT `rounded={false}`. The 8 middle rungs are the real `ROUNDED`
 * enum; `custom` reveals the 4-corner editor.
 */
export const THEME_BUILDER_ROUNDED_OPTIONS: Array<{ value: string; labelKey: string; labelFallback: string }> = [
    { value: 'none', labelKey: 'theming.control.unset', labelFallback: 'none' },
    { value: ROUNDED.X_SMALL, labelKey: 'theming.control.rounded.x_small', labelFallback: 'X-Small' },
    { value: ROUNDED.SMALL, labelKey: 'theming.control.rounded.small', labelFallback: 'Small' },
    { value: ROUNDED.DEFAULT, labelKey: 'theming.control.rounded.default', labelFallback: 'Default' },
    { value: ROUNDED.MEDIUM, labelKey: 'theming.control.rounded.medium', labelFallback: 'Medium' },
    { value: ROUNDED.LARGE, labelKey: 'theming.control.rounded.large', labelFallback: 'Large' },
    { value: ROUNDED.X_LARGE, labelKey: 'theming.control.rounded.x_large', labelFallback: 'X-Large' },
    { value: ROUNDED.SHAPED, labelKey: 'theming.control.rounded.shaped', labelFallback: 'Shaped' },
    { value: ROUNDED.SHAPED_INVERT, labelKey: 'theming.control.rounded.shaped_invert', labelFallback: 'Shaped invert' },
    { value: THEME_BUILDER_CUSTOM_VALUE, labelKey: 'theming.control.custom', labelFallback: 'Other…' }
]

/**
 * Named shadow rungs, in the order validated in `elevation-field.html`
 * (État B). `md` is displayed "Default" (same naming gap as Rounded,
 * documented in the wireframe — the token name and the display label
 * intentionally differ).
 */
export const THEME_BUILDER_ELEVATION_OPTIONS: Array<{ value: string; labelKey: string; labelFallback: string }> = [
    { value: 'none', labelKey: 'theming.control.unset', labelFallback: 'none' },
    { value: 'xs', labelKey: 'theming.control.elevation.xs', labelFallback: 'XS' },
    { value: 'sm', labelKey: 'theming.control.elevation.sm', labelFallback: 'SM' },
    { value: 'md', labelKey: 'theming.control.elevation.md', labelFallback: 'Default' },
    { value: 'lg', labelKey: 'theming.control.elevation.lg', labelFallback: 'LG' },
    { value: 'xl', labelKey: 'theming.control.elevation.xl', labelFallback: 'XL' },
    { value: THEME_BUILDER_CUSTOM_VALUE, labelKey: 'theming.control.custom', labelFallback: 'Other…' }
]

/** Elevation "Autre" sub-mode: quick depth slider vs full shadow composer. */
export const THEME_BUILDER_ELEVATION_CUSTOM_MODES = ['depth', 'shadow'] as const

/**
 * The 3 real `TDensity` values (`packages/ds/src/types/Commons/density.type.ts`,
 * backed by the `DENSITY` enum), in the order shown for the `density` prop's
 * inline select (#294 — `density` used to fall through to a free-text input
 * since `TDensity` is a template-literal type, not an inlined string union).
 */
export const THEME_BUILDER_DENSITY_OPTIONS: Array<{ value: string; labelKey: string; labelFallback: string }> = [
    { value: DENSITY.COMPACT, labelKey: 'theming.control.density.compact', labelFallback: 'Compact' },
    { value: DENSITY.DEFAULT, labelKey: 'theming.control.density.default', labelFallback: 'Default' },
    { value: DENSITY.COMFORTABLE, labelKey: 'theming.control.density.comfortable', labelFallback: 'Comfortable' }
]

/**
 * Named `border` widths, in the order validated in `border-field.html`
 * (Partie 1, État B). Mirrors the DS-local `UTILITY_BORDER` set (not
 * exported) — `none | thin | thick`, plus "Autre" for a numeric px width.
 */
export const THEME_BUILDER_BORDER_WIDTH_OPTIONS: Array<{ value: string; labelKey: string; labelFallback: string }> = [
    { value: 'none', labelKey: 'theming.control.unset', labelFallback: 'none' },
    { value: 'thin', labelKey: 'theming.control.border.width_thin', labelFallback: 'Thin' },
    { value: 'thick', labelKey: 'theming.control.border.width_thick', labelFallback: 'Thick' },
    { value: THEME_BUILDER_CUSTOM_VALUE, labelKey: 'theming.control.custom', labelFallback: 'Other…' }
]

/**
 * The 10 real `BORDER_STYLE` enum values, in enum declaration order
 * (`packages/ds/src/enums/Commons/border.enum.ts`). No "Autre" branch —
 * `borderStyle` is a closed CSS enum, confirmed functional end-to-end in
 * `useBorder` (pushed verbatim as `border-style: <value>`).
 */
export const THEME_BUILDER_BORDER_STYLE_OPTIONS: Array<{ value: string; labelKey: string; labelFallback: string }> = [
    { value: BORDER_STYLE.SOLID, labelKey: 'theming.control.border.style_solid', labelFallback: 'Solid' },
    { value: BORDER_STYLE.DASHED, labelKey: 'theming.control.border.style_dashed', labelFallback: 'Dashed' },
    { value: BORDER_STYLE.DOTTED, labelKey: 'theming.control.border.style_dotted', labelFallback: 'Dotted' },
    { value: BORDER_STYLE.DOUBLE, labelKey: 'theming.control.border.style_double', labelFallback: 'Double' },
    { value: BORDER_STYLE.NONE, labelKey: 'theming.control.border.style_none', labelFallback: 'None (no line)' },
    { value: BORDER_STYLE.HIDDEN, labelKey: 'theming.control.border.style_hidden', labelFallback: 'Hidden' },
    { value: BORDER_STYLE.GROOVE, labelKey: 'theming.control.border.style_groove', labelFallback: 'Groove' },
    { value: BORDER_STYLE.RIDGE, labelKey: 'theming.control.border.style_ridge', labelFallback: 'Ridge' },
    { value: BORDER_STYLE.INSET, labelKey: 'theming.control.border.style_inset', labelFallback: 'Inset' },
    { value: BORDER_STYLE.OUTSET, labelKey: 'theming.control.border.style_outset', labelFallback: 'Outset' }
]

/**
 * Padding/margin scale steps — mirrors the DS-local `UTILITY_PADDING_SCALE` /
 * `UTILITY_MARGIN_SCALE` sets (identical values, not exported by the DS).
 * Each chip writes the utility-class opt-in STRING form (`padding="4"`),
 * never a raw px number, per `usePadding`/`useMargin`.
 */
export const THEME_BUILDER_SPACING_SCALE: readonly string[] = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12']

/**
 * Scale step → px, verified against `packages/ds/tokens/primitive.json`
 * (`space.*`, DTCG source of `--origam-space---N`). Used ONLY to seed the
 * box-model editor with a sane px starting point when the user switches
 * from a scale chip into "Autre" — never written back as a scale token.
 */
export const THEME_BUILDER_SPACING_SCALE_PX: Record<string, number> = {
    '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '5': 20, '6': 24, '8': 32, '10': 40, '12': 48
}

/** Box-model link mode: one value for all 4 edges / 2 axis values / 4 independent values. */
export const THEME_BUILDER_BOX_MODEL_MODES = ['linked', 'axis', 'unlinked'] as const

/** Named `rounded` rungs (excluding the "Autre" sentinel) — the Set a raw value is tested against. */
export const THEME_BUILDER_ROUNDED_NAMED_RUNGS = new Set(
    THEME_BUILDER_ROUNDED_OPTIONS.map(o => o.value).filter(v => v !== THEME_BUILDER_CUSTOM_VALUE)
)

/** Named `elevation` rungs (excluding the "Autre" sentinel) — the Set a raw value is tested against. */
export const THEME_BUILDER_ELEVATION_NAMED_RUNGS = new Set(
    THEME_BUILDER_ELEVATION_OPTIONS.map(o => o.value).filter(v => v !== THEME_BUILDER_CUSTOM_VALUE)
)

/** Named `border` widths (excluding the "Autre" sentinel) — the Set a raw value is tested against. */
export const THEME_BUILDER_BORDER_NAMED_WIDTHS = new Set(
    THEME_BUILDER_BORDER_WIDTH_OPTIONS.map(o => o.value).filter(v => v !== THEME_BUILDER_CUSTOM_VALUE)
)

/** The 8 real `TIntent` values as a Set, for O(1) membership checks. */
export const THEME_BUILDER_INTENT_VALUES = new Set(THEME_BUILDER_INTENT_OPTIONS.map(o => o.value))

/**
 * Session-scoped "recent custom colors" list max length — matches the
 * wireframe's open question ("persistance par session ou globale") resolved
 * as IN-MEMORY/session only, reset on reload.
 */
export const THEME_BUILDER_COLOR_MAX_RECENT = 4

/**
 * Prop names that resolve to the rich `color-intent` control when a control
 * for them exists — `color` / `accentColor` (both, see #212) always; `bgColor`
 * too (#294 — `bgColor` accepts a real `TIntent` string, same as `color`, so it
 * now renders the EXACT same select+reveal control, see `ThemeBuilderColorField`);
 * a standalone `borderColor` too, but ONLY when there's no `border` control to
 * fold it into (see `composePropGroups` in `useThemeBuilderCatalog.ts`).
 */
export const THEME_BUILDER_INTENT_COLOR_PROPS = new Set(['color', 'accentColor', 'bgColor'])

/**
 * Every prop the `border` composite can fold in, beyond `border` itself —
 * global `borderStyle`/`borderColor` (round 2) plus the 8 per-side props
 * wired by DS issue #215 (PR #227): `borderTop`/`Right`/`Bottom`/`Left`
 * (width, `boolean | number | string`) and `borderTopColor`/`RightColor`/
 * `BottomColor`/`LeftColor` (`TColor`). Order matters for tab order in the
 * popover — width facets first, colours last, matching the wireframe.
 */
export const THEME_BUILDER_BORDER_FOLD_PROPS = [
    'borderStyle', 'borderColor',
    'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
    'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'
] as const

/**
 * Orphan border-family props — a component that exposes one of them without
 * a `border` prop at all (unlikely, but never silently dropped) still gets
 * relabelled `color-intent` (see `composePropGroups`).
 */
export const THEME_BUILDER_ORPHAN_COLOR_PROPS = new Set([
    'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'
])

/**
 * Rich control kinds rendered via a dedicated `theme-builder-*-field`
 * component instead of a generic `origam-select`/`origam-text-field` input
 * (`ThemeBuilderControls.vue`).
 */
export const THEME_BUILDER_RICH_CONTROL_KINDS = new Set(['color-intent', 'rounded', 'elevation', 'border', 'box-model'])
