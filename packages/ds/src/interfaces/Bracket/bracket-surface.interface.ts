import type {
    TBracketBorder,
    TBracketColor,
    TBracketElevation,
    TBracketRounded
} from '../../types/Bracket/bracket.type'

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
 * vocabulary (see the `TBracket*` aliases in
 * `types/Bracket/bracket.type.ts`), so the two
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

    /*********************************************************
     * LES DEUX ARETES LOGIQUES DE BLOC — ET POURQUOI PAS LES INLINE
     *
     * @description
     * `borderBlockStart` / `borderBlockEnd` (+ `*Color`), issue #1013. Ce
     * sont les SEULES des quatre aretes logiques que cette couche peut
     * honorer, et l'asymetrie est mesuree, pas arbitraire.
     *
     * @description
     * Cette couche peint via des custom properties
     * `--origam-bracket-match---*` que la SCSS d'`OrigamBracketMatch` lit
     * dans des declarations PHYSIQUES. Mapper une arete logique sur une
     * arete physique a l'ecriture de la feuille demande donc de connaitre
     * le mode d'ecriture.
     * @description
     * • AXE DE BLOC — `block-start` vaut `top` et `block-end` vaut `bottom`
     *   en `horizontal-tb`, invariablement. Bracket ne declare jamais
     *   `writing-mode` (verifie : 0 occurrence) et sa feuille fait DEJA
     *   cette hypothese pour `borderBlock`, dont la var alimente
     *   `border-top-width` et `border-bottom-width`. Ces deux aretes
     *   n'ajoutent donc aucune hypothese nouvelle.
     * @description
     * • AXE INLINE — `inline-start` vaut `left` en LTR mais `right` en RTL.
     *   Aucune chaine de repli ne peut exprimer ca : la substitution
     *   `var()` est aveugle au mode d'ecriture alors que le mapping de la
     *   propriete ne l'est pas. Les 4 props inline sont donc RETIREES de la
     *   surface de Bracket par `Omit<>` (`bracket.interface.ts`) plutot que
     *   declarees et ignorees — une prop typee et inerte est pire qu'une
     *   prop absente.
     *
     * @description
     * La completude de Bracket sur l'axe inline part dans son propre
     * ticket ; elle demande de convertir la cascade en longhands logiques,
     * ce qui change le comportement RTL des props physiques existantes.
     ********************************************************/
    borderBlockStart?: TBracketBorder
    borderBlockEnd?: TBracketBorder

    borderBlockStartColor?: TBracketColor
    borderBlockEndColor?: TBracketColor
}
