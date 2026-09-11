import type { IColorProps, ICommonsComponentProps, ITagProps } from '../../interfaces'
import type { TLoadingValue } from '../../types'

export interface ILoaderProps extends ICommonsComponentProps, ITagProps, IColorProps {
    loading?: TLoadingValue
    loadingText?: string
}
