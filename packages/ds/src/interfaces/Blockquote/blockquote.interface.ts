import type {
    IAccentColorProps,
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type {
    TBlockquoteAlign,
    TBlockquoteLang,
    TBlockquoteVariant
} from '../../types/Blockquote/blockquote.type'

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
     * Horizontal alignment of the citation body and attribution.
     *
     * ## ADR-005 D7 — exemption « famille B », documentée ICI et non
     * implicitement
     *
     * `'center'` sur `pull` n'est plus calculé par le composant : c'est
     * `BLOCKQUOTE_VARIANT_PRESETS.pull.align`, résolu au rang PRESET de la
     * chaîne. La sémantique est identique à celle du `computed`
     * `effectiveAlign` qu'il remplace — un `align` écrit au site d'appel
     * gagne, parce que le rang 1 du résolveur (`if (wasPassed) return
     * fallback`) précède le rang preset.
     *
     * ⚠️ **Rupture, assumée.** Le centrage de `pull` dépend désormais du
     * résolveur, que seul `createOrigam()` installe. Un consommateur qui
     * importe le composant sans installer le plugin obtient `'left'` (la
     * valeur `withDefaults`, qui n'existe que comme plancher sans variant).
     * Avant la conversion, le `computed` centrait sans plugin.
     *
     * @default 'left' — plancher `withDefaults`, que le preset de `pull` bat
     */
    align?: TBlockquoteAlign
    /*********************************************************
     * quoteMark
     *
     * @description
     * Monte le glyphe d'ouverture decoratif en filigrane de fond
     * (`<span class="origam-blockquote__mark--bg">`), avec la paire de
     * guillemets que `lang` selectionne.
     *
     * @description
     * ⛔ ADR-005 D7 — EXEMPTION « FAMILLE B », DOCUMENTEE ICI ET NON
     * IMPLICITEMENT. Ce prop existe parce que `quoted` ne se reduit PAS a
     * des props de peinture : il MONTE UN ELEMENT. D7 interdit de laisser
     * cet effet accroche au variant et exige que l'exemption soit ecrite
     * sur la prop — c'est ce paragraphe.
     *
     * @description
     * Le glyphe est donc pilote par `quoteMark`, et
     * `BLOCKQUOTE_VARIANT_PRESETS.quoted` le pose a `true`. Deux
     * consequences voulues : `quoted` reste le raccourci qu'il a toujours
     * ete, et le glyphe devient atteignable sur N'IMPORTE QUEL variant
     * (`<origam-blockquote variant="pull" quote-mark>`), ce que le modele
     * SCSS rendait impossible.
     *
     * @description
     * Les deux regles d'empilement que `quoted` portait (`position:
     * relative; z-index: 1` sur `__body` et `__attribution`, pour que le
     * texte passe devant le glyphe) suivent desormais la PRESENCE DU
     * GLYPHE et non le variant : ce sont des selecteurs de voisinage
     * (`__mark--bg + __body`, `__mark--bg ~ __attribution`), donc ils se
     * declenchent exactement quand il y a quelque chose a surmonter, et
     * laissent zero ecart de style calcule sur les quatre autres variants.
     *
     * @description
     * ⚠️ Le sur-remplissage haut qui laisse de la place au glyphe
     * (`paddingTop`) reste porte par le preset de `quoted`, pas par ce
     * prop. `quote-mark` sur un autre variant rend donc le glyphe sans ce
     * supplement — passer `padding-top` soi-meme le retablit.
     *
     * @default false
     ********************************************************/
    quoteMark?: boolean
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

/*********************************************************
 * IBlockquoteEmits
 *
 * @description
 * Emits fired by `<OrigamBlockquote>` — none. Purely typographic,
 * renders a native `<blockquote>` with no interactive state.
 ********************************************************/
export interface IBlockquoteEmits {}
