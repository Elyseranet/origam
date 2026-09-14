import { ROW_GUTTER } from '../../enums/Grids/row.enum'

import type { TRowGutterRung } from '../../types/Grids/row.type'

/*********************************************************
 * ROW_GUTTER_RUNGS
 *
 * @description
 * Les echelons nommes de la gouttiere, sous forme de liste — ce que la
 * prop `gutters` d'`<origam-row>` reconnait comme un ECHELON plutot que
 * comme une longueur libre.
 *
 * @description
 * Derivee de l'enum, jamais reecrite a la main : ajouter un echelon a
 * `ROW_GUTTER` suffit a le rendre reconnu par le composant, et le
 * `Object.values` garde les deux en phase par construction.
 ********************************************************/
export const ROW_GUTTER_RUNGS = Object.values(ROW_GUTTER) as ReadonlyArray<TRowGutterRung>
