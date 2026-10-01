import { TColor } from '../../types/Commons/color.type'
import { TDirectionBoth } from '../../types/Commons/anchor.type'

export interface IBorderProps {
    border?: boolean | number | string | TDirectionBoth | Array<TDirectionBoth>
    borderTop?: boolean | number | string
    borderLeft?: boolean | number | string
    borderBottom?: boolean | number | string
    borderRight?: boolean | number | string
    /**
     * Logical-axis shorthand for the block-start + block-end edges (top +
     * bottom in the default horizontal-tb writing mode). Resolves to the
     * native CSS `border-block-{width,style,color}` properties — same
     * value grammar as `borderTop` / `borderRight` / `borderBottom` /
     * `borderLeft` (boolean opt-in, bare width number, or a free-form
     * `"width style color"` string). Precedence: beats the global `border`
     * shorthand for the edges it targets, but a physical `borderTop` /
     * `borderBottom` still wins over it for that specific edge — see
     * `useBorder` JSDoc for the full precedence table.
     */
    borderBlock?: boolean | number | string
    /**
     * Logical-axis shorthand for the inline-start + inline-end edges (left
     * + right in LTR). Same grammar and precedence rules as `borderBlock`,
     * mapped onto `border-inline-{width,style,color}`.
     */
    borderInline?: boolean | number | string
    /*********************************************************
     * borderInlineStart
     *
     * @description
     * Largeur/style/couleur LOGIQUE PAR COTE pour l'arete inline-start —
     * gauche en LTR, droite en RTL (#1013). Le jumeau relatif au mode
     * d'ecriture de `borderLeft`, resolu vers les longhands natifs
     * `border-inline-start-{width,style,color}`, que le navigateur mappe
     * lui-meme sur la bonne arete physique.
     *
     * @description
     * A preferer a `borderLeft` des que l'intention de design est « l'arete
     * ou le texte commence » (filet d'accent d'une citation, indicateur de
     * nav, guide d'arborescence) : `borderLeft` epingle la peinture a la
     * gauche physique et inverse silencieusement le design en RTL.
     *
     * @description
     * Meme grammaire de valeur que toute autre prop directionnelle de
     * bordure — opt-in booleen (token `thin`), largeur numerique nue, ou
     * chaine libre `"width style color"`.
     *
     * @description
     * Precedence : bat `borderInline` et le `border` global pour cette
     * seule arete, mais un `borderLeft` PHYSIQUE l'emporte encore en LTR
     * (les deux orthographes visent la meme arete a specificite egale,
     * donc le dernier push gagne — voir la table de precedence de
     * `useBorder`).
     *
     * @description
     * ⚠️ Herite des limites partagees de `BORDER_REGEX` : un `calc()` ou
     * une largeur fractionnaire (`"0.5rem solid red"`) ne parse pas et
     * n'emet RIEN — mesure dans `BORDER_LOGICAL_SIDE_MAP`.
     ********************************************************/
    borderInlineStart?: boolean | number | string
    /*********************************************************
     * borderInlineEnd
     *
     * @description
     * Jumeau logique par cote de `borderInlineStart` pour l'arete
     * inline-end — droite en LTR, gauche en RTL. Mappe sur
     * `border-inline-end-{width,style,color}`. Meme grammaire, memes
     * regles de precedence (un `borderRight` physique l'emporte en LTR).
     ********************************************************/
    borderInlineEnd?: boolean | number | string
    /*********************************************************
     * borderBlockStart
     *
     * @description
     * Jumeau logique par cote de `borderInlineStart` pour l'arete
     * block-start — le haut dans le mode d'ecriture `horizontal-tb` par
     * defaut. Mappe sur `border-block-start-{width,style,color}`. Meme
     * grammaire, memes regles de precedence (un `borderTop` physique
     * l'emporte).
     ********************************************************/
    borderBlockStart?: boolean | number | string
    /*********************************************************
     * borderBlockEnd
     *
     * @description
     * Jumeau logique par cote de `borderInlineStart` pour l'arete
     * block-end — le bas dans le mode d'ecriture `horizontal-tb` par
     * defaut. Mappe sur `border-block-end-{width,style,color}`. Meme
     * grammaire, memes regles de precedence (un `borderBottom` physique
     * l'emporte).
     ********************************************************/
    borderBlockEnd?: boolean | number | string
    borderColor?: string
    borderStyle?: string
    /**
     * Per-side color override (issue #215). Additive: absent by default,
     * no behaviour change for existing consumers.
     *
     * Precedence (specific > global): `borderTopColor` wins over any
     * color implied by `borderTop` (e.g. `borderTop="2px dashed red"`),
     * which itself wins over the global `borderColor` / `border` shorthand
     * for the top side. See `useBorder` JSDoc for the full precedence
     * table.
     *
     * Accepts a {@link TColor} (semantic intent, raw CSS color, or falsy
     * to opt out) — same input family as `color` / `bgColor`. Gradients
     * are NOT supported on border colors (CSS `border-color` has no
     * gradient form) and are silently ignored.
     */
    borderTopColor?: TColor
    borderRightColor?: TColor
    borderBottomColor?: TColor
    borderLeftColor?: TColor
    /*********************************************************
     * borderInlineStartColor
     *
     * @description
     * Surcharge de couleur PAR ARETE pour l'arete inline-start (#1013) —
     * le jumeau logique de `borderLeftColor`, emis en
     * `border-inline-start-color`.
     *
     * @description
     * Memes semantiques que la famille `*Color` physique : additive, bat
     * toute couleur impliquee par `borderInlineStart` lui-meme (ex.
     * `borderInlineStart="2px dashed red"`), la couleur d'axe de
     * `borderInline`, et le `borderColor` / `border` global — pour cette
     * arete seulement. Un `borderLeftColor` PHYSIQUE l'emporte encore en
     * LTR, meme sens que pour les props de largeur.
     *
     * @description
     * Accepte un {@link TColor} (intent semantique, couleur CSS brute, ou
     * valeur fausse pour se desengager). Une bordure est un TRAIT, donc un
     * intent se resout via la famille de tokens de PREMIER PLAN (comme la
     * prop `color`), jamais un token de fond.
     *
     * @description
     * Les degrades ne sont PAS supportes — `border-color` en CSS n'a pas de
     * forme degradee — et sont ignores silencieusement.
     ********************************************************/
    borderInlineStartColor?: TColor
    /*********************************************************
     * borderInlineEndColor
     *
     * @description
     * Surcharge de couleur par arete pour l'arete inline-end — jumeau
     * logique de `borderRightColor`, emis en `border-inline-end-color`.
     * Meme grammaire {@link TColor} et meme precedence que
     * `borderInlineStartColor`.
     ********************************************************/
    borderInlineEndColor?: TColor
    /*********************************************************
     * borderBlockStartColor
     *
     * @description
     * Surcharge de couleur par arete pour l'arete block-start — jumeau
     * logique de `borderTopColor`, emis en `border-block-start-color`.
     * Meme grammaire {@link TColor} et meme precedence que
     * `borderInlineStartColor`.
     ********************************************************/
    borderBlockStartColor?: TColor
    /*********************************************************
     * borderBlockEndColor
     *
     * @description
     * Surcharge de couleur par arete pour l'arete block-end — jumeau
     * logique de `borderBottomColor`, emis en `border-block-end-color`.
     * Meme grammaire {@link TColor} et meme precedence que
     * `borderInlineStartColor`.
     ********************************************************/
    borderBlockEndColor?: TColor
}
