import type { ICommonsComponentProps, IDimensionProps, IVirtualProps } from '../../interfaces'

export interface IVirtualScrollProps extends ICommonsComponentProps, IDimensionProps, IVirtualProps {
    items?: Array<any>
    renderless?: boolean
}
