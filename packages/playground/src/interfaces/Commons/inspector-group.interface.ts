import type { IPropDefinition } from '../Catalog/prop-definition.interface'
import type { IPropSideFoldAxis } from './prop-side-fold.interface'
import type { TPropGroupId } from '../../types/Commons/prop-group.type'

/*********************************************************
 * IInspectorPropRow
 *
 * @description
 * One row the read-only inspector renders. `fold` is present only on a ROOT
 * prop that has declinations folded under it (`border`, `rounded`, `padding`,
 * `margin`, `height`, `width`) — see `PROP_SIDE_FOLDS`.
 ********************************************************/
export interface IInspectorPropRow {
    /** The prop this row renders. */
    definition: IPropDefinition
    /** Present only when this row folds declinations of its own name. */
    fold?: {
        axes: IPropSideFoldAxis[]
        /** The declined props' own definitions, in `axes` order. */
        definitions: IPropDefinition[]
    }
}

/*********************************************************
 * IInspectorGroup
 *
 * @description
 * One of the 13 `TPropGroupId` buckets, as rendered for one component:
 * the rows AT REST (folded roots collapsed to one row each) plus the counts
 * a group header needs — "+20 repliées", "21" total.
 ********************************************************/
export interface IInspectorGroup {
    id: TPropGroupId
    rows: IInspectorPropRow[]
    /** How many props this group owns in total, folded ones included. */
    totalCount: number
    /** How many of those are hidden inside a fold right now. */
    foldedCount: number
}
