import type { IColorProps, ICommonsComponentProps, ITagProps } from '../../interfaces'
import type { TLoadingValue } from '../../types'

export interface ILoaderProps extends ICommonsComponentProps, ITagProps, IColorProps {
    loading?: TLoadingValue
    loadingText?: string
}

/** Slot signatures for `<OrigamLoader>`. */
export interface ILoaderSlots {
    loader?: () => any
    default?: () => any
}
