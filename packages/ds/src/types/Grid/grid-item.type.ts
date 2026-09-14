import OrigamGridItem from '../../components/Grid/OrigamGridItem.vue'

import type { TGridPlaceItems } from './grid.type'

export type TOrigamGridItem = InstanceType<typeof OrigamGridItem>

/**
 * Place-self (`align-self` + `justify-self`) on a grid item.
 * Same matrix as place-items — aliased rather than restated so the two
 * cannot drift.
 */
export type TGridPlaceSelf = TGridPlaceItems
