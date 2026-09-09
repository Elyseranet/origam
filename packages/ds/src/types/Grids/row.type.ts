import OrigamRow from '../../components/Grids/OrigamRow.vue'
import {
    FLEX_DIRECTION,
    ROW_GUTTER
} from '../../enums/Grids/row.enum'

export type TFlexDirection = `${FLEX_DIRECTION}`

/*********************************************************
 * TRowGutterRung
 *
 * @description
 * Un des quatre echelons nommes de la gouttiere.
 ********************************************************/
export type TRowGutterRung = `${ROW_GUTTER}`

/*********************************************************
 * TRowGutter
 *
 * @description
 * Soit un echelon nomme, soit une longueur libre : un nombre (interprete
 * en px par `convertToUnit`) ou toute longueur CSS (`'1.5rem'`, `'2vw'`,
 * `'var(--x)'`). L'echelon passe par une classe utilitaire, la longueur
 * libre par une declaration en ligne — meme partage que `color` /
 * `rounded` ailleurs dans le DS.
 ********************************************************/
export type TRowGutter = TRowGutterRung | string | number

export type TOrigamRow = InstanceType<typeof OrigamRow>
