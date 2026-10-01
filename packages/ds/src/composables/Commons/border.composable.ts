import { computed, isRef, Ref } from 'vue'
import { DIRECTION_ARRAY } from '../../consts/Commons/anchor.const'
import { BORDER_KEYWORD_WIDTH, BORDER_LOGICAL_AXIS_MAP, BORDER_LOGICAL_SIDE_MAP, BORDER_POSITION_MAP, BORDER_REGEX } from '../../consts/Commons/border.const'

import type { IBorderProps } from '../../interfaces/Commons/border.interface'
import type { TBorderWidthKeyword } from '../../types/Commons/border.type'
import type { TColor } from '../../types/Commons/color.type'
import { TDirectionBoth, TLogicalSide } from '../../types/Commons/anchor.type'

import { formatBorderPositionStylesVar, formatBorderStylesVar, parseBorderPositionValue, resolveBorderSideColor } from '../../utils/Commons/border.util'
import { convertToUnit, isEmpty } from '../../utils/Commons/commons.util'
import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'

/**
 * Set of border values for which a global utility class exists in
 * `src/assets/css/tokens/origam-utilities.css` (Phase 1 manifest):
 * `.origam--border-none`, `.origam--border-thin`, `.origam--border-thick`.
 */
const UTILITY_BORDER: ReadonlySet<TBorderWidthKeyword> = new Set<TBorderWidthKeyword>([
    'none', 'thin', 'thick'
])

/*********************************************************
 * isUtilityBorder / isDirectionBorder
 *
 * @description
 * Membership guards for the two CLASS-channel families `border` accepts.
 *
 * @description
 * ⛔ Both return a NARROW literal union, never `value is string` (#391).
 * A guard typed `value is string` looks harmless but makes TypeScript
 * subtract EVERY string from the `else` branch, so the direction branch
 * and the free-form-string branch both became unreachable in the
 * compiler's model — while still running at runtime. That mismatch is
 * what produced `TS2352` / `TS2367` and tempted a cast; the cast would
 * have silenced the compiler on a union (`number | boolean |
 * TDirectionBoth[] | null | undefined`) that genuinely holds the other
 * shapes `border` accepts. Narrow the guard, don't force the type.
 *
 * @description
 * `DIRECTION_ARRAY` is UPCAST to `ReadonlyArray<string>` before the
 * membership test — a widening conversion, always sound — rather than
 * DOWNCASTING the candidate value to `TDirectionBoth`, which is the
 * unsound direction the compiler was rejecting.
 ********************************************************/
function isUtilityBorder (value: unknown): value is TBorderWidthKeyword {
    return typeof value === 'string' && UTILITY_BORDER.has(value as TBorderWidthKeyword)
}

function isDirectionBorder (value: unknown): value is TDirectionBoth {
    return typeof value === 'string' && (DIRECTION_ARRAY as ReadonlyArray<string>).includes(value)
}

/*********************************************************
 * pushEdgeDeclarations
 *
 * @description
 * Emit the `border-{edge}-{width,style,color}` declarations for ONE box
 * edge, from that edge's width prop plus its optional `*Color` override.
 * Shared verbatim by the two per-edge grids `useBorder` iterates — the
 * PHYSICAL one (`BORDER_POSITION_MAP`, issue #215) and the LOGICAL one
 * (`BORDER_LOGICAL_SIDE_MAP`, issue #1013).
 *
 * @description
 * ⛔ EXTRACTED ON PURPOSE, AND NOT TO SAVE TYPING. The two grids need
 * byte-identical emission policy — the boolean→`thin`-token opt-in, the
 * bare-number→solid/currentColor defaulting, the `*Color`-pushed-last
 * rule, the `null` skip on an unparsable string. #1013 would otherwise
 * have copied this body a second time, and the NEXT fix to either copy
 * would have missed the other. That is not hypothetical: a per-side
 * surface drifting from its twin is the exact defect family #215, #216
 * and #1013 were each opened to repair, and the `useStateEffect` getter
 * list in `stateEffect.composable.ts` has now hit it three times.
 *
 * @description
 * `edge` is interpolated straight into the property name, so a PHYSICAL
 * value (`'top'`) yields `border-top-width` and a LOGICAL one
 * (`'inline-start'`) yields `border-inline-start-width`. The browser
 * resolves the logical spelling against the active writing mode; nothing
 * here translates between the two vocabularies.
 *
 * @description
 * LA POLITIQUE D'EMISSION, en trois branches exclusives sur la largeur :
 * @description
 * • NOMBRE NU — emet aussi `solid` + `currentColor`, car une largeur
 *   seule ne peint RIEN (`border-style` vaut `none` par defaut). Meme
 *   defaut que le chemin global numerique.
 * @description
 * • BOOLEEN `true` — opt-in historique. Aucune famille de classes
 *   utilitaires PAR ARETE n'existe (seul le trio global
 *   `.origam--border-*`), donc on retombe sur le token que resout la
 *   classe `thin`.
 * @description
 * • CHAINE — passe par `parseBorderPositionValue`, qui renvoie `null` sur
 *   une valeur inparsable ; on n'emet alors rien plutot qu'une
 *   declaration vide.
 *
 * @description
 * Puis la surcharge `*Color` est poussee EN DERNIER pour cette arete, donc
 * elle bat la couleur embarquee dans la chaine de largeur et celle heritee
 * du `borderColor` / `border` global. Un degrade resout a `null` et est
 * saute silencieusement (documente sur `IBorderProps`).
 ********************************************************/
function pushEdgeDeclarations (
    styles: Array<string>,
    edge: TDirectionBoth | TLogicalSide,
    edgeValue: boolean | number | string | undefined,
    edgeColor: TColor | undefined
): void {
    if (typeof edgeValue === 'number') {
        styles.push(`border-${edge}-width: ${convertToUnit(edgeValue)}`)
        styles.push(`border-${edge}-style: solid`)
        styles.push(`border-${edge}-color: currentColor`)
    } else if (edgeValue === true) {
        styles.push(`border-${edge}-width: var(--origam-border__width---thin)`)
        styles.push(`border-${edge}-style: solid`)
        styles.push(`border-${edge}-color: currentColor`)
    } else if (typeof edgeValue === 'string' && edgeValue !== '') {
        const parsed = parseBorderPositionValue(edgeValue)
        if (parsed) styles.push(...formatBorderPositionStylesVar(edge, parsed))
    }

    const resolvedEdgeColor = resolveBorderSideColor(edgeColor)
    if (resolvedEdgeColor) styles.push(`border-${edge}-color: ${resolvedEdgeColor}`)
}

/*********************************************************
 * useBorder
 *
 * @description
 * Precedence rule (issue #215) — SPECIFIC beats GLOBAL, always in this
 * order, enforced purely by PUSH ORDER onto the `styles` array (later
 * declarations win within the same inline `style` attribute — this holds
 * even across logical vs physical property syntax for the same box edge):
 *
 *   1. global `border` shorthand (1/2/4-value, logical properties)
 *   2. global standalone `borderColor` / `borderStyle`
 *   3. logical-AXIS `borderBlock` / `borderInline` (width, and
 *      style/color when a full string like `"2px dashed red"` is given)
 *   4. logical-PER-SIDE `borderInlineStart` / `borderInlineEnd` /
 *      `borderBlockStart` / `borderBlockEnd` — plus their
 *      `borderInlineStartColor` / … twins, each pushed immediately after
 *      its own edge's width/style (issue #1013). More specific than the
 *      axis rung above: `borderInlineStart` overrides whatever
 *      `borderInline` set for that one edge.
 *   5. physical-PER-SIDE `borderTop` / `borderRight` / `borderBottom` /
 *      `borderLeft` — plus their `borderTopColor` / … twins, same
 *      per-edge pairing (issue #215).
 *
 * So `borderBlock` beats `border` for the top+bottom edges,
 * `borderBlockStart` beats both for the top edge specifically,
 * `borderTop` beats all three for that same edge, and each `*Color`
 * beats the color embedded in its own edge's width string, the
 * axis-level color, and the global `borderColor` — each rung only
 * overrides the edge(s)/axis it actually targets, everything else keeps
 * cascading from the rung below.
 *
 * @description
 * ⛔ WHY PHYSICAL BEATS LOGICAL FOR THE SAME EDGE (rungs 4 vs 5, #1013).
 * `borderLeft` and `borderInlineStart` are two SPELLINGS of one edge in
 * LTR, not two edges, and CSS gives them equal specificity — so neither
 * wins on its own merits and declaration order is the entire mechanism.
 * The tie is broken in favour of PHYSICAL to match the repo's only
 * pre-existing physical-vs-logical tiebreak, recorded on
 * `ROUNDED_CORNER_MAP` (`consts/Commons/spacing.const.ts:85-88`), where
 * the per-corner PHYSICAL declarations are pushed last for exactly this
 * reason. Settling it the same way across all four directional grids —
 * border here, padding/margin/rounded in the other half of #1013 — is
 * the point: a user who learns the rule once should not have to relearn
 * it per prop family. Passing BOTH spellings for the same edge is
 * nonetheless a code smell; pick the vocabulary that matches the intent
 * (logical when the design follows the reading direction).
 *
 * @description
 * WIDTH KEYWORDS AND DIRECTIONS ARE EMITTED INLINE (#391). 'none' | 'thin'
 * | 'thick' and 'top' | 'right' | 'bottom' | 'left' resolve to a WIDTH, so
 * they take the same inline path the numeric `:border="4"` form already
 * took — which is precisely why the numeric case always worked while the
 * keywords did not. The global `.origam--border-{kw}` utility is still
 * emitted and still paints wherever nothing competes, but it CANNOT be the
 * mechanism on its own: a utility is specificity (0,1,0) while a Vue scoped
 * rule is `.class[data-v-hash]` = (0,2,0), so a component painting from
 * `border-width: var(--origam-{cmp}---border-width, …)` outranks it
 * whatever the sheet order. Measured: 10 of the 43 `useBorder` consumers
 * carry such a rule (Btn, List, Kbd, Code, Card*, Audio, Calendar, …) and
 * on every one of them `thick` painted `thin` and `none` painted `thin`.
 * Widths come from `BORDER_KEYWORD_WIDTH`, the same tokens the utility
 * declares, so the two channels cannot drift.
 *
 * @description
 * A DIRECTION ISOLATES ITS EDGE. `border="top"` emits all four physical
 * widths — `thin` on the named side, `0` on the other three — because the
 * components that paint from a single `border-width` shorthand have no
 * per-side custom property a class could target. Emitting the four
 * declarations is what makes a direction mean the same thing everywhere
 * instead of only on the two components that happen to declare per-side
 * variables.
 *
 * @description
 * ⛔ LA FORME TABLEAU (`:border="['top', 'bottom']"`) N'EST QU'A MOITIE
 * IMPLEMENTEE. Elle est portee par le type du parametre `Ref` et traversee
 * par `borderClasses`, mais `borderStyles` ne la teste nulle part : ni
 * `isUtilityBorder`, ni `isDirectionBorder`, ni `typeof === 'string'`, ni
 * `typeof === 'number'` ne matchent un tableau. Mesure —
 * `useBorder({border: ['top','bottom']})` rend
 * `classes: ['{name}--border', '{name}--border-top,bottom']` et
 * `styles: []` : la classe est interpolee depuis le tableau, donc porte la
 * VIRGULE du `Array.prototype.toString`, et aucune feuille ne la declare.
 * Aucune largeur n'est emise. Documente ici, non corrige : voir le lot de
 * doc #600.
 *
 * @description
 * WHEN #514 IS SETTLED, THIS INLINE PATH IS THE THING TO REMOVE. If the DS
 * adopts `@layer` (measured in `packages/tests/e2e/btn-cascade-layer-probe.spec.ts`),
 * the utility wins on its own and these `styles.push` calls become dead.
 * Until then the inline copy is the only channel that can actually paint.
 ********************************************************/
export function useBorder (props: IBorderProps | Ref<boolean | number | string | TDirectionBoth | Array<TDirectionBoth> | null | undefined>, name = getCurrentInstanceName()) {
    const borderClasses = computed(() => {
        const border = isRef(props) ? props.value : props.border
        const classes: Array<string> = []

        if (border && typeof border !== 'undefined') {
            classes.push(`${name}--border`)

            if (isDirectionBorder(border) || (Array.isArray(border) && border.some((bord) => DIRECTION_ARRAY.includes(bord)))) {
                classes.push(`${name}--border-${border}`)
            }

            // Classes-first companion: when `border` is a width keyword
            // ('none' | 'thin' | 'thick'), emit the matching utility
            // class. Direction keywords (top/bottom/...) and free-form
            // strings stay on the inline-style path.
            if (isUtilityBorder(border)) {
                classes.push(`origam--border-${border}`)
            } else if (border === true) {
                // Legacy boolean opt-in is treated as the default
                // 'thin' utility — keeps single-state `<x border>` in
                // sync with the global token.
                classes.push('origam--border-thin')
            }
        }

        return classes
    })

    const borderStyles = computed(() => {
        const border = isRef(props) ? props.value : props.border
        const styles: Array<string> = []

        if (isUtilityBorder(border)) {
            styles.push(`border-width: ${BORDER_KEYWORD_WIDTH[border]}`)
            styles.push('border-style: solid')
            styles.push('border-color: currentColor')
        } else if (isDirectionBorder(border)) {
            DIRECTION_ARRAY.forEach((side) => {
                styles.push(`border-${side}-width: ${side === border ? BORDER_KEYWORD_WIDTH.thin : BORDER_KEYWORD_WIDTH.none}`)
            })
            styles.push('border-style: solid')
            styles.push('border-color: currentColor')
        } else if (typeof border === 'string' && border !== '') {
            const match = BORDER_REGEX.exec(border)?.groups
            if (match) {
                Object.keys(match).forEach((key) => {
                    let values = String(match[key]).split(' ')

                    if (key === 'width' && isEmpty(match[key])) return

                    if (key === 'style' && isEmpty(match[key])) values = ['solid']

                    if (key === 'color' && isEmpty(match[key])) values = ['currentColor']

                    styles.push(...formatBorderStylesVar(values, key))
                })
            }
        } else if (typeof border === 'number') {
            // A bare numeric width paints nothing: `border-style` defaults to
            // `none`, so `border-width: 4px` alone is invisible. Mirror the
            // string path's defaults (solid / currentColor) so a numeric border
            // actually renders. The standalone `borderStyle` / `borderColor`
            // props below still override these (pushed after).
            styles.push(`border-width: ${convertToUnit(border)}`)
            styles.push('border-style: solid')
            styles.push('border-color: currentColor')
        }

        // Additive surface for the standalone `borderColor` / `borderStyle`
        // props declared on `IBorderProps`. The Ref overload only carries
        // the `border` shorthand value, so these are only consulted when
        // `props` is the props object (not a Ref). Each is emitted only
        // when the consumer supplied a non-empty value, so components that
        // never pass them keep their existing output untouched.
        if (!isRef(props)) {
            const {borderColor, borderStyle} = props

            if (!isEmpty(borderColor)) styles.push(`border-color: ${borderColor}`)
            if (!isEmpty(borderStyle)) styles.push(`border-style: ${borderStyle}`)

            // Logical-axis width/style (bug: `borderBlock` / `borderInline`
            // were declared on `IBorderProps` but never read here — a
            // "half-implemented surface", same shape as the pre-#215 gap
            // on the physical per-side props). Pushed AFTER the global
            // `border` / `borderColor` / `borderStyle` declarations above,
            // and BEFORE the physical per-side loop below, so a physical
            // `borderTop` still wins over `borderBlock` for the top edge
            // (specific beats general — see the precedence table above).
            BORDER_LOGICAL_AXIS_MAP.forEach(({axis, widthProp}) => {
                const axisValue = props[widthProp]

                if (typeof axisValue === 'number') {
                    // Mirrors the global/per-side numeric defaulting: a bare
                    // width alone paints nothing (`border-style` defaults to
                    // `none`), so default to solid/currentColor.
                    styles.push(`border-${axis}-width: ${convertToUnit(axisValue)}`)
                    styles.push(`border-${axis}-style: solid`)
                    styles.push(`border-${axis}-color: currentColor`)
                } else if (axisValue === true) {
                    // Legacy boolean opt-in — same 'thin' design-token width
                    // as the physical per-side boolean form.
                    styles.push(`border-${axis}-width: var(--origam-border__width---thin)`)
                    styles.push(`border-${axis}-style: solid`)
                    styles.push(`border-${axis}-color: currentColor`)
                } else if (typeof axisValue === 'string' && axisValue !== '') {
                    const parsed = parseBorderPositionValue(axisValue)
                    if (parsed) styles.push(...formatBorderPositionStylesVar(axis, parsed))
                }
            })

            /*********************************************************
             * RUNG 4 — LOGIQUE PAR COTE (#1013)
             *
             * @description
             * `borderInlineStart` / `borderInlineEnd` / `borderBlockStart`
             * / `borderBlockEnd` et leurs 4 jumelles `*Color`. Pousse
             * APRES le rung d'AXE au-dessus (une arete est plus specifique
             * que l'axe qui la contient) et AVANT la boucle physique en
             * dessous, donc un `borderLeft` physique l'emporte encore sur
             * `borderInlineStart` pour l'arete gauche en LTR.
             *
             * @description
             * ⛔ Ce dernier ordre est une DECISION, pas un accident, et
             * c'est la seule question reellement ouverte de ce lot. Un
             * longhand physique et son equivalent logique pour la MEME
             * arete sont deux orthographes d'une seule arete a specificite
             * CSS egale : l'ordre de push est donc tout le mecanisme.
             * @description
             * Tranche en faveur du PHYSIQUE pour s'aligner sur le seul
             * arbitrage physique-vs-logique preexistant du depot, documente
             * sur `ROUNDED_CORNER_MAP` (`consts/Commons/spacing.const.ts`)
             * : « pushing the per-corner declarations LAST makes them win —
             * which is precisely the precedence we want ».
             * @description
             * Accorde avec la moitie padding/margin/rounded de #1013 pour
             * que les quatre grilles repondent identiquement.
             ********************************************************/
            BORDER_LOGICAL_SIDE_MAP.forEach(({side, widthProp, colorProp}) => {
                pushEdgeDeclarations(styles, side, props[widthProp], props[colorProp])
            })

            // Per-side width/style/color (issue #215) — `borderTop` /
            // `borderRight` / `borderBottom` / `borderLeft` were declared
            // on `IBorderProps` but never read here. Pushed AFTER the
            // global `border` / `borderColor` / `borderStyle` declarations
            // above so a side-specific value always wins for that physical
            // side (see the precedence note in the JSDoc above `useBorder`).
            BORDER_POSITION_MAP.forEach(({side, widthProp, colorProp}) => {
                pushEdgeDeclarations(styles, side, props[widthProp], props[colorProp])
            })
        }

        return styles
    })

    return {borderClasses, borderStyles}
}
