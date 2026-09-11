import type { IColorProps, ICommonsComponentProps, ITypographyProps } from '../../interfaces'

export interface IFileFieldDragNDropItemProps extends ICommonsComponentProps, IColorProps, ITypographyProps {
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
