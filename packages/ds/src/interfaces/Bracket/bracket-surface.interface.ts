import type {
    TBracketBorder,
    TBracketColor,
    TBracketElevation,
    TBracketRounded
} from '../../types'

/**
 * Prop bag consumed by `bracketSurfaceVars` to paint one match card.
 *
 * Mirrors the `IBgColorProps` / `IRoundedProps` / `IElevationProps` /
 * `IBorderProps` surfaces that `IBracketProps` and
 * `IBracketMatchProps` already extend — but it is a SEPARATE shape on
 * purpose, and does not `extends` them.
 *
 * The reason is the target element. `IBorderProps.border` accepts a
 * `TDirectionBoth[]` edge selector, which `useBorder` resolves onto the
 * component ROOT. The bracket resolves its surface props onto the match
 * CARD instead (each card is what the user sees shaped and bordered),
 * through `--origam-bracket-match---*` custom properties, and a custom
 * property cannot express "these edges only" the way `useBorder`'s
 * class output can. Extending `IBorderProps` here would therefore
 * declare a prop form this layer silently drops — the exact
 * typed-but-inert failure the surrounding audit exists to remove.
 *
 * Every property type is nonetheless DERIVED from the matching Commons
 * vocabulary (see `types/Bracket/bracket-surface.type.ts`), so the two
 * cannot drift on the value grammar they share.
 */
export interface IBracketSurfaceInput {
    bgColor?: TBracketColor
    rounded?: TBracketRounded
    elevation?: TBracketElevation
    border?: TBracketBorder
    borderColor?: TBracketColor
    borderStyle?: string | null

    /**
     * Per-corner radius and per-side border overrides.
     *
     * The bracket resolves `rounded` / `border` onto the MATCH CARD rather
     * than its own root (each card is what the user sees shaped and
     * bordered), so the directional rungs of `IRoundedProps` /
     * `IBorderProps` have to follow the same target — otherwise
     * `roundedTopLeft` is typed, editable in Histoire, and inert, which is
     * exactly the class of bug this surface is being audited for.
     */
    roundedTopLeft?: TBracketRounded
    roundedTopRight?: TBracketRounded
    roundedBottomLeft?: TBracketRounded
    roundedBottomRight?: TBracketRounded

    borderTop?: TBracketBorder
    borderRight?: TBracketBorder
    borderBottom?: TBracketBorder
    borderLeft?: TBracketBorder
    borderBlock?: TBracketBorder
    borderInline?: TBracketBorder

    borderTopColor?: TBracketColor
    borderRightColor?: TBracketColor
    borderBottomColor?: TBracketColor
    borderLeftColor?: TBracketColor
}
