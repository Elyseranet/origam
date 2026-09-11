import type { IColorProps, ICommonsComponentProps, ITypographyProps } from '../../interfaces'

export interface IFileFieldListItemProps extends ICommonsComponentProps, IColorProps, ITypographyProps {
    file: File
    index: number
    progress?: number
    fileIcon?: string
    removeIcon?: string
    disabled?: boolean
    readonly?: boolean
    showSize?: boolean | 1000 | 1024
}

export interface IFileFieldListItemEmits {
    (e: 'click:remove', value: { file: File, index: number }): void
}

export interface IFileFieldListItemSlots {
    default?: () => any
}
