import type { IColorProps } from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

export interface IFileFieldDragNDropItemProps extends ICommonsComponentProps, IColorProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight'> {
    file: File
    index: number
    progress?: number
    fileIcon?: string
    removeIcon?: string
    disabled?: boolean
    readonly?: boolean
    showSize?: boolean | 1000 | 1024
}

export interface IFileFieldDragNDropItemEmits {
    (e: 'click:remove', value: { file: File, index: number }): void
}

export interface IFileFieldDragNDropItemSlots {
    default?: () => any
}
