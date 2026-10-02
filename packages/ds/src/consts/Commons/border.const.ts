import { BLOCK, BORDER_LOGICAL_AXIS, BORDER_STYLE, INLINE, START_END } from '../../enums'
import type { TBorderLogicalAxis, TBorderWidthKeyword } from '../../types/Commons/border.type'
import type { TLogicalSide } from '../../types/Commons/anchor.type'

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
 * ✅ LA LIMITE DU REPLI IMBRIQUE EST LEVEE (ADR-005 lot 4, #1027). Le
 * groupe COULEUR acceptait `var\(--[^)]+\)`, qui s'arrete a la premiere
 * parenthese fermante : un repli imbrique ne matchait pas DU TOUT, la
 * valeur entiere etait rejetee et `useBorder` n'emettait RIEN. Le groupe
 * couleur passe donc par `BORDER_PAREN_GROUP`, un groupe parenthese a
 * profondeur BORNEE (voir sa propre entete), et son alternation de
 * fonctions gagne `color-mix` — qu'`isCssColor` et
 * `CUSTOM_BOX_SHADOW_REGEX` reconnaissaient tous deux deja, mais pas
 * celle-ci.
 * @description
 * Ce que ca debloque : le preset `ghost` d'`OrigamBtn` porte
 * `var(--origam-btn---border-color-ghost, color-mix(in srgb, currentColor
 * 24%, transparent))`, et l'occurrence deja presente dans le depot
 * — `1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12))`
 * — peint desormais au lieu d'etre jetee. ⛔ C'est donc un CHANGEMENT DE
 * RENDU pour cette seconde valeur, pas une simple extension : elle ne
 * produisait aucun bord et en produit un. Mesure et table de verite dans
 * `packages/tests/TU/utils/Commons/border.util.spec.ts`.
 * @description
 * ⚠️ LE GROUPE LARGEUR GARDE `[^)]+`, a dessein. Un `var()` y est deja
 * contraint par un lookahead (voir ci-dessous) et aucune largeur du depot
 * n'a de repli imbrique — les presets de variant aplatissent la leur a un
 * seul niveau (`var(--origam-btn---border-width-outlined, 1px)`, fidele :
 * `--origam-border__width---thin` vaut `1px`, declare une seule fois dans
 * `primitive.css` et pose par aucun theme). Elargir les deux groupes a la
 * fois rendrait la desambiguisation largeur/couleur sensiblement plus
 * fragile pour zero valeur reelle.
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

/*********************************************************
 * BORDER_PAREN_MAX_DEPTH
 *
 * @description
 * Niveaux d'IMBRICATION que `BORDER_PAREN_GROUP` sait equilibrer, au-dela
 * du premier. `2` autorise donc trois niveaux de parentheses :
 * `var(--a, var(--b, var(--c)))`.
 *
 * @description
 * ⛔ POURQUOI UNE BORNE ET PAS UN VRAI EQUILIBRAGE. Les regex JavaScript
 * n'ont pas de recursion (ni `(?R)` de PCRE, ni les groupes de balance de
 * .NET) : un equilibrage NON borne n'est pas exprimable. Une borne
 * explicite et testee vaut mieux qu'un `[^)]+` qui echoue des le premier
 * niveau, et mieux qu'un `.*` glouton qui happe tout ce qui suit.
 *
 * @description
 * Mesure du besoin reel : la valeur la plus profonde que le depot passe a
 * une prop de bord est a DEUX niveaux
 * (`var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12))`,
 * `var(--origam-btn---border-color-ghost, color-mix(...))`). Trois laisse
 * donc un niveau de marge sans rendre la chaine ingerable.
 ********************************************************/
const BORDER_PAREN_MAX_DEPTH = 2

/*********************************************************
 * BORDER_PAREN_GROUP
 *
 * @description
 * Un groupe parenthese dont les parentheses sont EQUILIBREES jusqu'a
 * `BORDER_PAREN_MAX_DEPTH` niveaux d'imbrication. Sert le groupe COULEUR
 * de `BORDER_REGEX`, pour `var()` comme pour les fonctions de couleur.
 *
 * @description
 * Construit par deploiement plutot qu'ecrit a la main : la chaine finale
 * fait une centaine de caracteres et trois niveaux de `(?:[^()]|…)*`
 * imbriques ne se relisent pas. La forme deployee est epinglee par un test
 * dans `border.util.spec.ts`, pour qu'un changement de borne ne passe pas
 * inapercu.
 ********************************************************/
const BORDER_PAREN_GROUP = (() => {
    let pattern = '\\([^()]*\\)'

    for (let depth = 0; depth < BORDER_PAREN_MAX_DEPTH; depth += 1) {
        pattern = `\\((?:[^()]|${pattern})*\\)`
    }

    return pattern
})()

/*********************************************************
 * BORDER_COLOR_FUNCTION_ALTERNATION
 *
 * @description
 * Les noms de fonction CSS acceptes en COULEUR. `color-mix` DOIT preceder
 * `color`, sinon `color` matcherait et l'alternation s'arreterait avant le
 * tiret. Meme famille que l'alternation d'`isCssColor`
 * (`utils/Commons/color.util.ts`) et celle de `CUSTOM_BOX_SHADOW_REGEX`
 * (`consts/Commons/elevation.const.ts`), que ce groupe rejoint enfin.
 ********************************************************/
const BORDER_COLOR_FUNCTION_ALTERNATION = 'rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix|color'

const BORDER_COLOR_GROUP = `(?<color>(?: ?(?:(?:(?:#)(?:[a-f0-9]{3}|[a-f0-9]{6}))|(?:var${BORDER_PAREN_GROUP})|(?:(?:${BORDER_COLOR_FUNCTION_ALTERNATION})${BORDER_PAREN_GROUP})|(?:[A-Za-z]+))){0,4})`

export { BORDER_PAREN_GROUP, BORDER_PAREN_MAX_DEPTH }

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
 * No matching `borderBlockColor` / `borderInlineColor` prop exists — the
 * per-side color override is defined PER EDGE, not per axis, so an
 * axis-level color prop would be ambiguous about which of its two edges
 * it paints. Hence, unlike `BORDER_POSITION_MAP` and
 * `BORDER_LOGICAL_SIDE_MAP` (both per-EDGE), there is no `colorProp`
 * here.
 *
 * ⚠️ This note used to read "the per-side color override only applies to
 * the 4 physical corners". That was true until #1013, which added the 4
 * LOGICAL per-side color props — per-edge color is now available on both
 * spellings. The reason this map has no `colorProp` was never the
 * physical/logical distinction; it is the axis/edge one, which #1013 does
 * not change.
 */
export const BORDER_LOGICAL_AXIS_MAP: ReadonlyArray<{ axis: TBorderLogicalAxis, widthProp: 'borderBlock' | 'borderInline' }> = [
    {axis: BORDER_LOGICAL_AXIS.BLOCK, widthProp: 'borderBlock'},
    {axis: BORDER_LOGICAL_AXIS.INLINE, widthProp: 'borderInline'},
] as const

/*********************************************************
 * BORDER_LOGICAL_SIDE_MAP
 *
 * @description
 * Logical-PER-SIDE lookup driving `borderInlineStart` / `borderInlineEnd`
 * / `borderBlockStart` / `borderBlockEnd` and their four `*Color` twins
 * (issue #1013). The third and last of the three directional grids: this
 * map is to `BORDER_LOGICAL_AXIS_MAP` what `BORDER_POSITION_MAP` is to
 * the global `border` shorthand — it narrows an axis to ONE of its two
 * edges.
 *
 * @description
 * ⛔ DELIBERATELY THE SAME SHAPE AS `BORDER_POSITION_MAP`
 * (`{side, widthProp, colorProp}`), because `useBorder` iterates both
 * with the SAME loop body. That body emits
 * `border-${side}-{width,style,color}`, so a `side` of `'inline-start'`
 * produces `border-inline-start-width` / `-style` / `-color` verbatim —
 * the native CSS logical longhands, which the browser maps to the correct
 * physical edge per the active writing mode. This lot is therefore an
 * extension of an existing TABLE, not a new precedence grammar: nothing
 * in the loop body changed to accommodate it.
 *
 * @description
 * WHY LOGICAL PER SIDE AT ALL, given `borderInline` exists. The axis prop
 * paints BOTH edges; there was no way to paint a single writing-mode-
 * relative edge. The only alternative was a PHYSICAL prop
 * (`borderLeft`), which silently breaks RTL — exactly the trap
 * `OrigamBlockquote`'s accent rule avoids by hand-writing
 * `border-inline-start` in its SCSS (#1013's trigger).
 *
 * @description
 * ⚠️ VALUE GRAMMAR IS SHARED WITH THE OTHER TWO GRIDS, LIMITS INCLUDED.
 * String values go through `parseBorderPositionValue` → `BORDER_REGEX`,
 * so these props accept exactly what `borderLeft` / `borderBlock` accept
 * and reject exactly what they reject. Measured 2026-10-01, and NOT
 * introduced by this lot: `"calc(2px + 1px) solid red"` and a FRACTIONAL
 * width such as `"0.5rem solid red"` both fail the regex outright (the
 * width group is `[0-9]+` with no decimal point, and has no `calc()`
 * alternative), so `parseBorderPositionValue` returns `null` and NOTHING
 * is emitted. A tokenised width works only in the `var(--x) <style>`
 * form, and a bare number (`:border-inline-start="4"`) bypasses the regex
 * entirely via `convertToUnit`. Pinned by the "shared grammar limits"
 * tests in `packages/tests/TU/composables/Commons/border-logical-side.spec.ts`
 * so a future regex change has to acknowledge all three grids at once.
 ********************************************************/
export const BORDER_LOGICAL_SIDE_MAP: ReadonlyArray<{
    side: TLogicalSide,
    widthProp: 'borderBlockStart' | 'borderBlockEnd' | 'borderInlineStart' | 'borderInlineEnd',
    colorProp: 'borderBlockStartColor' | 'borderBlockEndColor' | 'borderInlineStartColor' | 'borderInlineEndColor'
}> = [
    {side: `${BORDER_LOGICAL_AXIS.BLOCK}-${START_END.START}`, widthProp: 'borderBlockStart', colorProp: 'borderBlockStartColor'},
    {side: `${BORDER_LOGICAL_AXIS.BLOCK}-${START_END.END}`, widthProp: 'borderBlockEnd', colorProp: 'borderBlockEndColor'},
    {side: `${BORDER_LOGICAL_AXIS.INLINE}-${START_END.START}`, widthProp: 'borderInlineStart', colorProp: 'borderInlineStartColor'},
    {side: `${BORDER_LOGICAL_AXIS.INLINE}-${START_END.END}`, widthProp: 'borderInlineEnd', colorProp: 'borderInlineEndColor'},
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
    'borderBlockStart',
    'borderBlockEnd',
    'borderInlineStart',
    'borderInlineEnd',
    'borderColor',
    'borderStyle',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'borderBlockStartColor',
    'borderBlockEndColor',
    'borderInlineStartColor',
    'borderInlineEndColor',
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
