import type { CSSProperties } from 'vue'
import type { IFeature } from '~/interfaces/feature.interface'

/**
 * Track template forwarded verbatim to <OrigamGrid columns>.
 *
 * `auto-fit` + `minmax` is CSS-first responsive: the 3 feature columns
 * collapse to 2 then 1 on narrow viewports with no media query and no
 * `!important` override of the grid's `--origam-grid---template-columns`.
 */
export const FEATURES_GRID_COLUMNS = 'repeat(3, minmax(0, 1fr))'

/**
 * Per-instance OrigamCard padding override (maquette = 32px on all sides).
 *
 * OrigamCard's `padding` prop (IPaddingProps) only accepts numeric+unit
 * literals (PADDING_REGEX rejects `var(...)`), so it can't carry the
 * `--origam-space---8` token. To keep the value tokenised (project rule:
 * spacing via `var(--origam-…)`, never a raw literal), we drive the card's
 * public per-instance padding custom-props with the space token instead —
 * the documented escape hatch, same pattern as HERO_BTN_VARS.
 */
export const FEATURE_CARD_VARS: CSSProperties = {
    '--origam-card---padding-block-start': 'var(--origam-space---8, 2rem)',
    '--origam-card---padding-block-end': 'var(--origam-space---8, 2rem)',
    '--origam-card---padding-inline-start': 'var(--origam-space---8, 2rem)',
    '--origam-card---padding-inline-end': 'var(--origam-space---8, 2rem)',
    '--origam-card---background': 'var(--origam-color__surface---raised, #fafafa)'
} as CSSProperties

/**
 * Per-instance override for the feature icon tile (OrigamAvatar).
 *
 * Size (44×44) AND radius (card) are pinned in CSS on `.home-features__icon-tile`,
 * NOT via the avatar's `size` / `rounded` props. Reason: those props hydrate
 * non-deterministically on this grid — the SSR markup and the client render
 * disagree, so a subset of avatars keep their SSR shape (base pill / theme
 * `rounded: lg`) while the rest apply the intended value, yielding a random
 * mix of circles and rounded-squares per reload. Forcing size + radius in CSS
 * (with `!important` on the radius, to beat the theme's `origam--rounded-lg`
 * default that survives the mismatch) makes all six tiles identical and stable.
 * `bgColor` expects a TIntent and `action-primary---bgSubtle` is a token, not
 * an intent, so — per the project color policy — we paint the sheet/avatar bg
 * custom-prop directly below.
 */
export const FEATURE_ICON_TILE_VARS: CSSProperties = {
    '--origam-sheet---background': 'var(--origam-color__action--primary---bgSubtle, rgba(124, 58, 237, 0.1))'
} as CSSProperties

/** Icon tint = origam action-primary fgSubtle, via the icon's bg/colour token. */
export const FEATURE_ICON_VARS: CSSProperties = {
    '--origam-icon---color': 'var(--origam-color__action--primary---fgSubtle, #6d28d9)'
} as CSSProperties

export const FEATURES: IFeature[] = [
    {
        titleKey: 'home.features.charts.title',
        descriptionKey: 'home.features.charts.description',
        icon: 'mdi-chart-line'
    },
    {
        titleKey: 'home.features.a11y.title',
        descriptionKey: 'home.features.a11y.description',
        icon: 'mdi-human'
    },
    {
        titleKey: 'home.features.tokens.title',
        descriptionKey: 'home.features.tokens.description',
        icon: 'mdi-palette-outline'
    },
    {
        titleKey: 'home.features.typescript.title',
        descriptionKey: 'home.features.typescript.description',
        icon: 'mdi-language-typescript'
    },
    {
        titleKey: 'home.features.css.title',
        descriptionKey: 'home.features.css.description',
        icon: 'mdi-language-css3'
    },
    {
        titleKey: 'home.features.composition.title',
        descriptionKey: 'home.features.composition.description',
        icon: 'mdi-puzzle-outline'
    }
]
