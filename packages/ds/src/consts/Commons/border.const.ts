import { BLOCK, BORDER_LOGICAL_AXIS, BORDER_STYLE, INLINE } from '../../enums'
import type { TBorderLogicalAxis, TBorderWidthKeyword } from '../../types/Commons/border.type'

/*********************************************************
 * BORDER_REGEX
 *
 * @description
 * Decoupe une valeur `border` libre en trois groupes — `width`, `style`,
 * `color`. Sert la prop globale `border` (`useBorder`) ET les six props
 * directionnelles, via `parseBorderPositionValue`.
 *
 * @description
 * Formes acceptees en COULEUR, dans cet ordre d'alternance : `var()` DOIT
 * preceder la branche `[A-Za-z]+`, sinon `var` serait mange comme un mot
 * avant que le groupe parenthese ait sa chance.
 * @description
 * • litteral hex — `#abc` / `#aabbcc`
 * @description
 * • fonction CSS — `rgb(…)` / `rgba(…)` / `hsl(…)` / `hsla(…)`
 * @description
 * • custom property — `var(--origam-color__action--primary---bg)`, repli inclus
 * @description
 * • mot-cle nomme — `red`, `currentColor`, `transparent`, …
 *
 * @description
 * ⛔ UN `var()` EN LARGEUR N'EST ACCEPTE QUE S'IL EST SUIVI D'UN MOT-CLE DE
 * STYLE, et le lookahead qui l'impose est la partie a ne pas simplifier.
 * Les trois groupes sont quantifies `{0,4}` et peuvent TOUS matcher vide :
 * une alternative `var()` NUE dans `width` happerait donc `var(--ma-couleur)`
 * — une couleur SEULE, cas courant — avant que `color` ait sa chance. On
 * reparerait la chaine a trois jetons en cassant celle a un jeton.
 * @description
 * `(?= +(?:<styles>))` leve l'ambiguite : `var(--w) solid var(--c)` donne
 * `width=var(--w)`, tandis que `var(--c)` seul reste une couleur. Mesure —
 * table de verite et CONTROLES NEGATIFS dans
 * `packages/tests/TU/utils/Commons/border.util.spec.ts`.
 * @description
 * Ce que le `var()` en largeur debloque, et pourquoi c'est un defaut de
 * production et pas un confort : avant ce lot, `borderLeft="var(--w) solid
 * var(--c)"` faisait tomber la valeur ENTIERE dans le groupe `color`, donc
 * `useBorder` emettait un `border-left-color` invalide que le navigateur
 * jetait — bord absent, aucun diagnostic. Les deux chaines que la SCSS de
 * Blockquote porte aujourd'hui sont exactement de cette forme.
 * @description
 * Le cas `var(--w) var(--c)` (largeur + couleur, sans style) reste NON
 * resolu, a dessein : il est ambigu par nature et aucune valeur du depot ne
 * l'utilise. Tordre la regex pour lui couterait la garantie ci-dessus.
 *
 * @description
 * ⚠️ LIMITE CONNUE, NON CORRIGEE ICI : `[^)]+` s'arrete a la premiere
 * parenthese fermante, donc un repli imbrique ne matche pas DU TOUT et la
 * valeur entiere est rejetee. Deja vrai avant ce lot, et le depot en porte
 * une occurrence — `1px solid var(--origam-color__border---subtle, rgba(0,
 * 0, 0, 0.12))`.
 *
 * @description
 * ⚠️ UNE LARGEUR `var()` QUI CONTIENT UNE ESPACE NE PASSE QUE PAR LE CHEMIN
 * PAR COTE. Les deux consommateurs ne traitent pas les groupes pareil :
 * `parseBorderPositionValue` (props `borderLeft` / `borderBlock` / …) prend
 * `match.width` EN ENTIER, alors que `useBorder` sur la prop GLOBALE `border`
 * fait `String(match[key]).split(' ')` pour distribuer 1/2/4 valeurs sur les
 * axes — et y coupe donc `var(--x, 4px)` en deux fragments invalides. Mesure
 * et non-regression : voir les trois tests « path » dans
 * `packages/tests/TU/utils/Commons/border.util.spec.ts`.
 * @description
 * Avant ce lot la meme valeur tombait entiere dans `color` et y etait scindee
 * en QUATRE : aucun bord dans les deux cas, donc pas de regression visible —
 * mais ce n'est pas repare pour autant. Un preset de variant portant une
 * largeur tokenisee doit viser une prop PAR COTE ou D'AXE, jamais `border`.
 *
 * @description
 * La liste des mots-cles de style vient de `BORDER_STYLE` plutot que d'etre
 * recopiee : le lookahead et le groupe `style` doivent nommer le MEME
 * ensemble, et deux copies litterales finiraient par deriver.
 ********************************************************/
const BORDER_STYLE_ALTERNATION = Object.values(BORDER_STYLE).join('|')

const BORDER_LENGTH_UNITS = '(?:px|pt|PC|in|cm|mm|em|rem|%|ex|ch|fr)?'

const BORDER_COLOR_GROUP = '(?<color>(?: ?(?:(?:(?:#)(?:[a-f0-9]{3}|[a-f0-9]{6}))|(?:var\\(--[^)]+\\))|(?:(?:rgb|hsl|rgba)a?\\(.*\\))|(?:[A-Za-z]+))){0,4})'

export const BORDER_REGEX = new RegExp(
    '^'
    + `(?<width>(?: ?var\\(--[^)]+\\)(?= +(?:${BORDER_STYLE_ALTERNATION}))| ?(?:[0-9]+)${BORDER_LENGTH_UNITS}){0,4})`
    + ' {0,1}'
    + `(?<style>(?:(?: ?(?:${BORDER_STYLE_ALTERNATION}))+){0,4})`
    + ' ?'
    + BORDER_COLOR_GROUP
    + '$'
)

/**
 * Physical-side lookup driving the per-side border wiring (issue #215).
 *
 * `IBorderProps` names its discrete side props PHYSICALLY
 * (`borderTop`/`borderRight`/`borderBottom`/`borderLeft`), unlike the
 * global `border` shorthand's 4-value mode which distributes across
 * LOGICAL axes (`block-start`/`inline-start`/…, see `formatBorderStylesVar`
 * / issue #216). `useBorder` reads this map to emit matching PHYSICAL CSS
 * declarations (`border-top-width`, …) — no logical/physical mismatch for
 * the consumer to mentally translate.
 */
export const BORDER_POSITION_MAP = [
    {side: BLOCK.TOP, widthProp: 'borderTop', colorProp: 'borderTopColor'},
    {side: INLINE.RIGHT, widthProp: 'borderRight', colorProp: 'borderRightColor'},
    {side: BLOCK.BOTTOM, widthProp: 'borderBottom', colorProp: 'borderBottomColor'},
    {side: INLINE.LEFT, widthProp: 'borderLeft', colorProp: 'borderLeftColor'},
] as const

/**
 * Logical-axis lookup driving `borderBlock` / `borderInline` wiring.
 *
 * Unlike `BORDER_POSITION_MAP` (physical sides, issue #215), these two
 * props are already named LOGICALLY on `IBorderProps` and map straight
 * onto the native CSS logical properties `border-block-{width,style,color}`
 * / `border-inline-{width,style,color}` — no physical translation table
 * needed, the browser resolves start/end per the active writing mode.
 * No matching `borderBlockColor` / `borderInlineColor` prop exists (the
 * per-side color override only applies to the 4 physical corners), so
 * unlike `BORDER_POSITION_MAP` there is no `colorProp` here.
 */
export const BORDER_LOGICAL_AXIS_MAP: ReadonlyArray<{ axis: TBorderLogicalAxis, widthProp: 'borderBlock' | 'borderInline' }> = [
    {axis: BORDER_LOGICAL_AXIS.BLOCK, widthProp: 'borderBlock'},
    {axis: BORDER_LOGICAL_AXIS.INLINE, widthProp: 'borderInline'},
] as const

/*********************************************************
 * BORDER_PROP_KEYS
 *
 * @description
 * Every key `IBorderProps` declares — the complete prop surface `useBorder`
 * consumes, in one place.
 *
 * @description
 * Issue #726. The four components that wrap an `<origam-field>` inside an
 * `<origam-input>` (TextField, TextareaField, PasswordField, FileField) must
 * hand this surface to the FIELD and withhold it from the INPUT. The input is
 * the outer box and has no notch, so a border painted there crosses the
 * floating label; the field owns the notched outline that opens around it.
 * Both children resolve their bindings through `filterProps(props, excludes)`,
 * so the split is expressed as this exclude list — named once here rather than
 * retyped in four templates, where one forgotten key (`borderBlock`,
 * `borderTopColor`, …) would silently restore the defect for that one value.
 */
export const BORDER_PROP_KEYS = [
    'border',
    'borderTop',
    'borderRight',
    'borderBottom',
    'borderLeft',
    'borderBlock',
    'borderInline',
    'borderColor',
    'borderStyle',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
] as const

/*********************************************************
 * BORDER_KEYWORD_WIDTH
 *
 * @description
 * The CSS width each `border="none|thin|thick"` keyword resolves to —
 * the SAME token the matching `.origam--border-{kw}` utility declares in
 * `assets/css/tokens/origam-utilities.css`. Single source of truth for
 * the pair: the utility paints where nothing competes, `useBorder` emits
 * these inline where a component's own scoped rule would otherwise win.
 *
 * @description
 * ⛔ #391 — why the inline copy exists at all. A component that paints
 * its border from `border-width: var(--origam-{cmp}---border-width, …)`
 * inside a Vue scoped rule outranks the utility: `.class[data-v-hash]` is
 * specificity (0,2,0), `.origam--border-thick` is (0,1,0), so the utility
 * loses whatever the sheet order — that is specificity, not order.
 * Measured across the catalogue: 10 of the 43 `useBorder` consumers carry
 * such a rule, and on those `border="thick"` painted `thin` and
 * `border="none"` painted `thin` instead of nothing. Emitting the width
 * inline (exactly as the numeric `:border="4"` path already does, which
 * is why THAT case always worked) fixes all 10 from one place instead of
 * replicating three SCSS rules per component.
 ********************************************************/
export const BORDER_KEYWORD_WIDTH: Readonly<Record<TBorderWidthKeyword, string>> = {
    none: 'var(--origam-border__width---0)',
    thin: 'var(--origam-border__width---thin)',
    thick: 'var(--origam-border__width---2)'
} as const
