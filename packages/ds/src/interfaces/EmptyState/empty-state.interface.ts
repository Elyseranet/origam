import type {
    ICommonsComponentProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

import type {
    TEmptyStateAlign,
    TEmptyStatePreset,
    TEmptyStateSize,
    TIcon,
    TIntent
} from '../../types'

/**
 * Props for `<OrigamEmptyState>` — placeholder shown when a list, table
 * or collection has nothing to render.
 *
 * Five visual presets (`no-data`, `no-results`, `error`, `offline`,
 * `locked`) cover the most common cases: each preset bundles an icon
 * and an intent so callers do not have to wire those by hand. Both
 * sides can be overridden via the `icon` and `iconColor` props for the
 * 5% case. Slots are provided to replace the icon (with an SVG / img),
 * title, description, or the entire layout for custom illustrations.
 *
 * Typography (`ITypographyProps`): `fontFamily` / `fontSize` / `fontWeight`
 * / `lineHeight` apply to BOTH text surfaces (title + description) at once,
 * each re-pointing the matching `--origam-empty-state__{title|description}---*`
 * variable. `fontSize` overrides the size-driven font-size (generic-first).
 * `letterSpacing` is inert here — neither text surface reads a
 * `letter-spacing` rule.
 */
export interface IEmptyStateProps extends ICommonsComponentProps, ITagProps, ITypographyProps {
    /**
     * Visual preset. Bundles a default icon and intent — see
     * `EMPTY_STATE_PRESET_CONFIG`. The preset is the starting point;
     * `icon` and `iconColor` win when both are passed.
     *
     * @default 'no-data'
     */
    preset?: TEmptyStatePreset
    /**
     * Primary heading. Rendered as a `<h2>`-equivalent element with
     * the chosen `size`. Override entirely via the `#title` slot when
     * richer markup is needed (a link, an icon-prefix, …).
     */
    title?: string
    /**
     * Optional sub-heading rendered below the title. Multiple lines
     * supported; the SCSS layer clamps the readable width via the
     * `--origam-empty-state---max-width` token.
     */
    description?: string
    /**
     * Override the preset icon. Accepts the same `TIcon` shape as
     * `<OrigamIcon>`: a MDI / iconify string, an array of SVG path
     * tuples, or a Vue `Component`. Use the `#icon` slot for full
     * SVG / `<img>` illustrations.
     */
    icon?: TIcon
    /**
     * Override the preset's icon color (the semantic intent that maps
     * to `--origam-color__action--{intent}---bg` /
     * `--origam-color__feedback--{intent}---bg`).
     */
    iconColor?: TIntent
    /**
     * Vertical density. Drives icon size, title / description font
     * sizes, padding and gap.
     *
     * @default 'md'
     */
    size?: TEmptyStateSize
    /**
     * Horizontal alignment of the icon / title / description / actions
     * stack.
     *
     * @default 'center'
     */
    align?: TEmptyStateAlign
}

/**
 * Slot signatures for `<OrigamEmptyState>`. All slots are optional.
 * When the `default` slot is provided, it replaces the entire built-in
 * layout — the parent regains full control over the placeholder
 * markup. Use the targeted slots (`icon`, `title`, `description`,
 * `actions`) to swap one piece at a time.
 */
export interface IEmptyStateSlots {
    /**
     * Replaces the entire built-in layout (icon + title + description
     * + actions). Use this for a fully bespoke layout — e.g. a hero
     * empty page with a custom illustration and a multi-column CTA
     * grid.
     */
    default?: () => any
    /**
     * Replaces the default `<OrigamIcon>` rendering. Use for SVG /
     * `<img>` illustrations. Mark the surface `aria-hidden="true"`
     * when it is purely decorative.
     */
    icon?: () => any
    /**
     * Replaces the rendered title element. Slot wins over the `title`
     * prop when both are provided.
     */
    title?: () => any
    /**
     * Replaces the rendered description element. Slot wins over the
     * `description` prop when both are provided.
     */
    description?: () => any
    /**
     * Actions row rendered below the description (or the title when
     * `description` is absent). Typically holds 1–2 buttons (Create,
     * Retry, Switch to offline mode, Sign in).
     */
    actions?: () => any
}
