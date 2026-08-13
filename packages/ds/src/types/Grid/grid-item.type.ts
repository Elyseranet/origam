import { OrigamGridItem } from '../../components'

export type TOrigamGridItem = InstanceType<typeof OrigamGridItem>

/**
 * Place-self (`align-self` + `justify-self`) on a grid item.
 * Same matrix as place-items.
 */
export type TGridPlaceSelf =
    | 'start'
    | 'center'
    | 'end'
    | 'stretch'
