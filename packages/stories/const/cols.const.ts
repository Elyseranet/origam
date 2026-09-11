import type { IOptions } from '@origam/interfaces'
import type { TCols } from '@origam/types'

/**
 * Grid column counts surfaced in Histoire controls.
 *
 * The grid is 12-column based. `'auto'` and `true` are the two non-numeric
 * sentinel values accepted by `IColProps.cols`.
 */
export const colsList: Array<IOptions<TCols>> = [
    { label: '(none)', value: undefined },
    { label: 'auto', value: 'auto' },
    { label: '1', value: '1' as TCols },
    { label: '2', value: '2' as TCols },
    { label: '3', value: '3' as TCols },
    { label: '4', value: '4' as TCols },
    { label: '5', value: '5' as TCols },
    { label: '6', value: '6' as TCols },
    { label: '7', value: '7' as TCols },
    { label: '8', value: '8' as TCols },
    { label: '9', value: '9' as TCols },
    { label: '10', value: '10' as TCols },
    { label: '11', value: '11' as TCols },
    { label: '12', value: '12' as TCols },
]
