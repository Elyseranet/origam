/**
 * THEME_BUILDER — config for the /theming visual theme builder.
 *
 * `CORE_THEME_SLUGS` is the curated set of components surfaced in the editor.
 * Adding a slug here wires it automatically: its prop controls come from
 * `consts/components/{slug}.const.ts` → `playground.controls`, and its editable
 * CSS tokens are derived from the origam theme `cssVars` (block prefix
 * `--origam-{slug}---`). The only per-slug data below is an optional preview
 * adapter for components that need slot/demo content to render visibly.
 *
 * Slugs are verified against real const files; preview props/slots use the real
 * component API only (no invented props).
 */
import { COMPONENT_PREVIEW_ADAPTERS } from '~/consts/component-preview.const'

import type { IThemeBuilderPreviewAdapter } from '~/interfaces/theme-builder.interface'

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
 * Slugs whose component renders a visible, meaningful preview from props alone
 * (plus the slot text / preview props from the adapter below). The builder
 * shows the live `<component :is>` preview for these and a graceful
 * "preview unavailable" note for the rest (overlays, providers, sub-parts that
 * need an activator or parent context). Verified against the real component API.
 */
export const THEME_BUILDER_PREVIEWABLE_SLUGS = [
    'btn',
    'card',
    'chip',
    'avatar',
    'alert',
    'text-field',
    'textarea-field',
    'number-field',
    'password-field',
    'select',
    'checkbox',
    'switch',
    'radio',
    'rating-field',
    'slider-field',
    'title',
    'icon',
    'badge',
    'divider',
    'progress-linear',
    'blockquote',
    'breadcrumb',
    'pagination'
] as const

/**
 * Per-slug preview adapter — ALIAS de la table partagée.
 *
 * La table vivait ici et ne couvrait que les 24 slugs du Theme Builder. Les
 * fiches composants (`/components/{slug}`) ont le même besoin, donc elle a été
 * généralisée dans `consts/component-preview.const.ts` (#728). Ce nom reste
 * exporté pour les consommateurs existants — une seule source de vérité.
 *
 * Statique `previewProps` est fusionné SOUS les props éditées par l'utilisateur
 * (aperçu seulement — jamais sérialisé). `slotText` rend dans le slot par
 * défaut. Les slugs absents retombent sur `playground.defaultSlotContent`.
 *
 * Le Theme Builder ne monte QUE les slugs de `THEME_BUILDER_PREVIEWABLE_SLUGS`,
 * donc les entrées ajoutées pour les fiches composants ne changent rien ici.
 */
export const THEME_BUILDER_PREVIEW_ADAPTERS: Record<string, IThemeBuilderPreviewAdapter> = COMPONENT_PREVIEW_ADAPTERS

/**
 * CSS custom-property name fragments that map to a colour input. Everything
 * else (lengths, shadows, easings, …) uses a plain text input.
 */
export const THEME_BUILDER_COLOR_HINTS = ['color', 'bg', 'background', 'fill', 'border'] as const
