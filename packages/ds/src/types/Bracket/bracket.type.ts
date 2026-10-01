import type { IBracketMatch } from '../../interfaces/Bracket/bracket-match.interface'
import type { IBracketRound } from '../../interfaces/Bracket/bracket-round.interface'
import type { IBorderProps } from '../../interfaces/Commons/border.interface'
import type { IRoundedProps } from '../../interfaces/Commons/rounded.interface'
import type { TColor } from '../Commons/color.type'
import type { TDirection } from '../Commons/direction.type'
import type { TElevation } from '../Commons/elevation.type'
import { BRACKET_VARIANT } from '../../enums/Bracket/bracket.enum'
import OrigamBracket from '../../components/Bracket/OrigamBracket.vue'

/**
 * One measured SVG connector link between two match cards
 * (`<OrigamBracket>`'s `connectorPaths`). Computed from the LIVE DOM rects
 * of the match cards (not a formula) so the link always lands on the
 * exact centre of the card it leaves / enters — see the "Connector
 * measurement" block in `OrigamBracket.vue` for why a formula was not
 * reliable across density / title / score variations.
 */
export type TBracketConnectorPath = {
    key: string
    d: string
    from: { matchId: IBracketMatch['id']; x: number; y: number }
    to: { matchId: IBracketMatch['id']; x: number; y: number }
    winner: boolean
}

/**
 * Layout axis of the bracket tree.
 *
 * - `'horizontal'` — each round is a column, matches stack vertically
 *   within the column, connectors flow left-to-right.
 * - `'vertical'`   — each round is a row, matches lay out horizontally,
 *   connectors flow top-to-bottom.
 *
 * Mirrors the global `TDirection` so the bracket plays nicely with the
 * rest of the design system's direction props.
 */
export type TBracketDirection = TDirection

/**
 * One rendered tree of a double-elimination bracket (`<OrigamBracket>`'s
 * `doubleSections` computed). A double-elimination tournament is really
 * two independent trees — Winner Bracket and Loser Bracket — converging on
 * a single Grand Final, so each section carries its own pre-translated
 * label and the subset of `IBracketRound[]` that belongs to it. Empty
 * sections are filtered out before render.
 */
export type TBracketDoubleSection = {
    key: 'winners' | 'losers' | 'grand-final'
    label: string
    rounds: IBracketRound[]
}

export type TBracketVariant = `${BRACKET_VARIANT}`

export type TOrigamBracket = InstanceType<typeof OrigamBracket>

/**
 * Input vocabularies accepted by the `resolveBracket*` helpers in
 * `src/utils/Bracket/bracket-surface.util.ts`.
 *
 * Each one is DERIVED from the matching Commons surface rather than
 * restated as a literal union. The four started life as four hand-typed
 * unions — three of which (`rounded`, `elevation`, `border`) had
 * collapsed to the byte-identical `string | number | boolean | null |
 * undefined`, so nothing in the type system stopped them drifting apart
 * from the props they are fed by, nor from each other. Deriving them
 * means a widening of `IRoundedProps['rounded']` (or of `TElevation`)
 * reaches the resolver's signature on its own.
 *
 * They are LOOSER than the props they mirror on one axis: the resolvers
 * are called with raw prop bags through a cast (see
 * `bracketSurfaceVars(props as IBracketSurfaceInput)` in
 * `OrigamBracket.vue`), so `null` and a bare `true` opt-in both have to
 * be accepted and are handled explicitly at runtime.
 */

/**
 * Colour input — the string half of {@link TColor}. The bracket
 * resolvers deliberately do NOT accept `IGradient`: they emit
 * `--origam-bracket-match---*` custom properties that feed
 * `background-color` / `border-color`, and neither CSS property has a
 * gradient form.
 */
export type TBracketColor = Extract<TColor, string> | null | undefined

/** Corner-radius input — the exact vocabulary of `IRoundedProps['rounded']`. */
export type TBracketRounded = IRoundedProps['rounded']

/**
 * Elevation input — {@link TElevation} plus the boolean opt-in
 * (`true` → the default `md` rung) and the falsy opt-out.
 */
export type TBracketElevation = TElevation | boolean | null | undefined

/**
 * Border-width input — the per-side vocabulary of
 * `IBorderProps['borderTop']`, plus the falsy opt-out.
 *
 * The per-SIDE prop is the right reference here, not the global
 * `IBorderProps['border']`: the latter also accepts a
 * `TDirectionBoth[]` ("border on these edges only"), which is an edge
 * SELECTOR, not a width. `resolveBracketBorderWidth` resolves a width
 * for one already-chosen edge, so the array form has no meaning at this
 * layer.
 */
export type TBracketBorder = IBorderProps['borderTop'] | null | undefined

/*********************************************************
 * TBracketBorderProps
 *
 * @description
 * `IBorderProps` MOINS les quatre aretes logiques INLINE (#1013). Partage
 * par les interfaces Bracket dont les props de bordure sont resolues par
 * `bracketSurfaceVars` — `IBracketProps` (la racine) et `IBracketMatchProps`
 * (la carte). Declare UNE fois ici plutot que deux `Omit<>` recopies.
 *
 * @description
 * ⛔ `IBracketCompetitorProps` n'utilise PAS ce type, a dessein :
 * `OrigamBracketCompetitor` appelle `useStateEffect` pour de vrai
 * (`OrigamBracketCompetitor.vue:209`), donc ses quatre aretes logiques
 * atteignent `useBorder` et peignent. Restreindre par FAMILLE de composant
 * au lieu de par consommation mesuree y retirerait quatre props qui
 * marchent.
 *
 * @description
 * Pourquoi les deux autres sont restreintes : elles ne peignent pas via
 * `useBorder` mais via des custom properties `--origam-bracket-match---*`
 * lues dans des declarations PHYSIQUES. Mapper une arete logique sur une
 * arete physique au moment d'ecrire la feuille exige de connaitre le mode
 * d'ecriture, et `inline-start` vaut `left` en LTR mais `right` en RTL.
 * Aucune chaine de repli `var()` ne peut l'exprimer : la substitution est
 * AVEUGLE au mode d'ecriture alors que le mapping de la propriete ne l'est
 * pas.
 *
 * @description
 * Les deux aretes de BLOC restent declarees et sont honorees :
 * `block-start`/`block-end` valent invariablement `top`/`bottom` en
 * `horizontal-tb`, hypothese que la feuille faisait deja pour `borderBlock`.
 * Confirme par sonde navigateur sur l'axe logique (Chromium, LTR vs RTL) :
 * les noms porteurs d'une composante INLINE changent d'arete, le controle
 * negatif `padding-block-start` ne bouge pas.
 *
 * @description
 * ⛔ Retirer plutot que declarer-et-ignorer est la regle que
 * `bracket-surface.interface.ts` enonce deja pour cette couche : une prop
 * typee, editable dans Histoire, et inerte est pire qu'une prop absente.
 * Arbitre par le proprietaire le 2026-10-01. La completude de l'axe inline
 * part dans son propre ticket (elle demande de convertir la cascade en
 * longhands logiques, ce qui change le comportement RTL des props physiques
 * existantes).
 ********************************************************/
export type TBracketBorderProps = Omit<IBorderProps,
    'borderInlineStart' | 'borderInlineEnd' | 'borderInlineStartColor' | 'borderInlineEndColor'
>

/*********************************************************
 * TBracketRoundedProps — le pendant « coins » de {@link TBracketBorderProps}
 *
 * @description
 * Même couche, même cause, même arbitrage (#1013, tranché par le
 * propriétaire le 2026-10-01) : `OrigamBracket` n'appelle pas `useRounded`,
 * il passe `props` en bloc à `utils/Bracket/bracket-surface.util.ts`, qui
 * émet des custom properties relues par le SCSS d'`OrigamBracketMatch` dans
 * des déclarations PHYSIQUES par coin. La substitution `var()` est AVEUGLE
 * au mode d'écriture alors que le mapping de la propriété ne l'est pas,
 * donc aucune chaîne de repli ne peut encoder « le physique gagne » ET « le
 * logique se retourne en RTL » simultanément.
 *
 * @description
 * ⛔ MAIS LES QUATRE SORTENT, là où le côté border n'en retire que deux. Le
 * sursis des arêtes de BLOC ne s'applique pas à un coin : tout nom de coin
 * logique est `{bloc}-{inline}` et porte donc une composante inline. Mesuré
 * dans Chromium (sonde Playwright, LTR vs RTL) plutôt que déduit —
 * `start-start` top-left -> top-RIGHT, `start-end` top-right -> top-LEFT,
 * `end-start` bottom-left -> bottom-RIGHT, `end-end` bottom-right ->
 * bottom-LEFT. Contrôle négatif `padding-block-start` -> `padding-top` :
 * 40px dans les deux sens, il ne bouge pas, ce qui prouve que la sonde sait
 * distinguer l'immobilité et que les quatre déplacements sont réels.
 *
 * @description
 * PORTÉE VÉRIFIÉE — seul `IBracketProps` est restreint. Les deux autres
 * interfaces Bracket qui étendent `IRoundedProps` consomment réellement
 * leurs coins : `OrigamBracketMatch` et `OrigamBracketCompetitor` appellent
 * `useRounded` / `useStateEffect`, et gardent donc la surface complète.
 * `OrigamBracket` est le seul à n'avoir aucun de ces appels.
 *
 * @description
 * Retirer plutôt que déclarer-et-ignorer, même règle que ci-dessus. La
 * complétude de l'axe inline pour les coins suit le même ticket que pour
 * les arêtes : il faut convertir la cascade en longhands logiques.
 ********************************************************/
export type TBracketRoundedProps = Omit<IRoundedProps,
    'roundedStartStart' | 'roundedStartEnd' | 'roundedEndStart' | 'roundedEndEnd'
>

