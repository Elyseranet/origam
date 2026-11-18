/**
 * THEME_BUILDER — config for the /theming visual theme builder.
 *
 * `CORE_THEME_SLUGS` is the curated set of components surfaced in the editor.
 * Adding a slug here wires it automatically: its prop controls come from
 * `consts/components/{slug}.const.ts` → `playground.controls`, and its editable
 * CSS tokens are derived from the origam theme `cssVars` (block prefix
 * `--origam-{slug}---`). The preview of every component goes through the
 * playground engine (`usePlaygroundHost`, #1145) — no per-slug list here.
 *
 * Slugs are verified against real const files; preview props/slots use the real
 * component API only (no invented props).
 */
import type {
    TThemeBuilderBorderSide,
    TThemeBuilderBoxModelMode,
    TThemeBuilderCorner
} from "~/types/theme-builder-controls.type";

/**
 * Default theme name pre-filled in the name field and used as the export
 * filename / camelCased export identifier when the user doesn't change it.
 */
export const THEME_BUILDER_DEFAULT_NAME = 'my-theme'

/**
 * Default human-readable label pre-filled in the label field (maps to
 * `IOrigamTheme.label`).
 */
export const THEME_BUILDER_DEFAULT_LABEL = 'My theme'

/**
 * Default color mode for a freshly-started theme (maps to `IOrigamTheme.mode`).
 */
export const THEME_BUILDER_DEFAULT_MODE = 'light'

/**
 * localStorage key under which the builder auto-persists its diff-only state so
 * edits survive a page reload. Reset clears this entry too.
 */
export const THEME_BUILDER_STORAGE_KEY = 'origam_theme_builder_state'

/**
 * Persisted-state schema version, written alongside the state snapshot
 * (`__v`). Bumped whenever a field is added whose ABSENCE would make an
 * older payload ambiguous to replay safely.
 *
 * Bumped to 2 when `preset` was introduced (#25): a v1 payload has NO record
 * of which preset (if any) produced its `defaults`/`cssVars`, so replaying
 * it verbatim would silently resurrect a preset's overrides while the UI's
 * preset selector shows "— none —" — the exact bug this version guard
 * exists to prevent. `loadStorage` drops `defaults`/`cssVars` from any
 * payload whose `__v` doesn't match (identity fields — name/label/mode —
 * are harmless and still restored).
 */
export const THEME_BUILDER_STATE_VERSION = 2

/**
 * Core set kept for backwards compatibility (tests / legacy references). The v2
 * builder lists EVERY component via the catalog; this curated list now only
 * marks the historically-wired components.
 */
export const CORE_THEME_SLUGS = [
    'btn',
    'card',
    'chip',
    'avatar',
    'alert',
    'text-field',
    'select',
    'checkbox',
    'switch',
    'title',
    'icon',
    'badge',
    'divider',
    'progress-linear'
] as const

/**
 * CSS custom-property name fragments that map to a colour input. Everything
 * else (lengths, shadows, easings, …) uses a plain text input.
 */
export const THEME_BUILDER_COLOR_HINTS = ['color', 'bg', 'background', 'fill', 'border'] as const

export const SIDES: Array<{ key: TThemeBuilderBorderSide; labelKey: string; labelFallback: string }> = [
    { key: 'top', labelKey: 'theming.control.border.side_top', labelFallback: 'Top (px)' },
    { key: 'right', labelKey: 'theming.control.border.side_right', labelFallback: 'Right (px)' },
    { key: 'bottom', labelKey: 'theming.control.border.side_bottom', labelFallback: 'Bottom (px)' },
    { key: 'left', labelKey: 'theming.control.border.side_left', labelFallback: 'Left (px)' }
]

export const MODES: Array<{ value: TThemeBuilderBoxModelMode; labelKey: string; labelFallback: string }> = [
    { value: 'linked', labelKey: 'theming.control.box_model.mode_linked', labelFallback: 'All linked' },
    { value: 'axis', labelKey: 'theming.control.box_model.mode_axis', labelFallback: 'Vertical / Horizontal' },
    { value: 'unlinked', labelKey: 'theming.control.box_model.mode_unlinked', labelFallback: 'No link' }
]

export const EDGES: Array<{ key: 'top' | 'left' | 'bottom' | 'right'; labelKey: string; labelFallback: string }> = [
    { key: 'top', labelKey: 'theming.control.box_model.edge_top', labelFallback: 'Top (px)' },
    { key: 'left', labelKey: 'theming.control.box_model.edge_left', labelFallback: 'Left (px)' },
    { key: 'bottom', labelKey: 'theming.control.box_model.edge_bottom', labelFallback: 'Bottom (px)' },
    { key: 'right', labelKey: 'theming.control.box_model.edge_right', labelFallback: 'Right (px)' }
]

export const CORNERS: Array<{ key: TThemeBuilderCorner; labelKey: string; labelFallback: string }> = [
    { key: 'topLeft', labelKey: 'theming.control.rounded.corner_top_left', labelFallback: 'Top-left corner' },
    { key: 'topRight', labelKey: 'theming.control.rounded.corner_top_right', labelFallback: 'Top-right corner' },
    { key: 'bottomLeft', labelKey: 'theming.control.rounded.corner_bottom_left', labelFallback: 'Bottom-left corner' },
    { key: 'bottomRight', labelKey: 'theming.control.rounded.corner_bottom_right', labelFallback: 'Bottom-right corner' }
]
