import type {
    IAccentColorProps,
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

import type {
    TBlockquoteAlign,
    TBlockquoteLang,
    TBlockquoteVariant
} from '../../types'

/**
 * Props for `<OrigamBlockquote>` — typographic citation component.
 *
 * A thin layer on top of the native `<blockquote>` element. Adds five
 * visual variants, optional author/source attribution and locale-aware
 * decorative quote marks (for `variant="quoted"`).
 *
 * ## Colour model (two independent axes)
 *
 * - **`color`** drives the **citation text** itself (the body). Defaults
 *   to `text-primary`. An intent resolves to its readable-on-light shade
 *   (`fgSubtle`); a custom value is applied verbatim.
 * - **`accentColor`** drives the **accent**: the decorative bar / pull
 *   rules (the "borders"), the big background quote glyph and the author
 *   label. Defaults to `primary`. It does NOT paint a surface fill — the
 *   blockquote stays transparent.
 *
 * The two axes are meant to contrast: a dark body (`color`) reads against
 * a coloured accent (`accentColor`).
 *
 * @deprecated `bgColor` — renamed to `accentColor` (see ROADMAP.md,
 * "Renommer `bgColor` → `accentColor`"). `bgColor` keeps working as an
 * alias (`accentColor ?? bgColor`, `accentColor` wins) and warns once via
 * `warnDeprecatedProp`. Removal targeted for v3.0.0. Only Blockquote
 * migrates in this pass — `bgColor` stays the canonical, non-deprecated
 * name on surface-fill components (Btn, Card, Chip, Badge, Alert,
 * Pagination, …), where "accent" would misrepresent a full fill.
 *
 * Standard cross-cutting surfaces (`rounded`, `elevation`, `border`,
 * `padding`, `margin`) are inherited from the Commons interfaces and
 * consumed via the matching composables. The component never imposes an
 * outer margin unless `margin` is passed.
 */
export interface IBlockquoteProps extends ICommonsComponentProps, ITagProps, IColorProps, IAccentColorProps, IBgColorProps, IRoundedProps, IElevationProps, IBorderProps, IPaddingProps, IMarginProps, ITypographyProps {
    /**
     * Visual variant. See `TBlockquoteVariant` for the per-variant
     * typographic contract.
     *
     * @default 'default'
     */
    variant?: TBlockquoteVariant
    /**
     * Author of the citation. Rendered after the body as `— Author`.
     * When `source` is also set, the two are joined with a comma.
     * Can be overridden via the `#author` slot for custom rendering
     * (e.g. wrap in a link to a bio page).
     */
    author?: string
    /**
     * Source of the citation (book, publication, URL label, …).
     * Rendered after `author` as `, Source`. Can be overridden via
     * the `#source` slot. When `cite` is also set on the prop, the
     * source label is wrapped in a `<cite>` element pointing at the
     * URL.
     */
    source?: string
    /**
     * URL the citation references. Maps 1:1 to the HTML `cite`
     * attribute on the rendered `<blockquote>` (or `<q>`). Pass a
     * fully-qualified URL — the browser exposes it to assistive tech
     * and to user-agent inspectors but does not render it visually.
     */
    cite?: string
    /**
     * Locale hint that determines which decorative quote glyphs render
     * for `variant="quoted"`. See `TBlockquoteLang`.
     *
     * @default 'auto'
     */
    lang?: TBlockquoteLang
    /**
     * Horizontal alignment of the citation body and attribution. The
     * `pull` variant forces `'center'` when this prop is left empty;
     * other variants default to `'left'`.
     *
     * @default 'left'
     */
    align?: TBlockquoteAlign
}

/**
 * Slot signatures for `<OrigamBlockquote>`. The `default` slot owns the
 * citation body; `author` and `source` are optional overrides for
 * custom rendering (links, badges, locale-formatted dates, …). When
 * an override slot is provided it WINS over the matching prop —
 * priority order is `slot > prop`.
 */
export interface IBlockquoteSlots {
    default?: () => any
    author?: () => any
    source?: () => any
}
