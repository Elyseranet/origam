import type { IIconProps } from '../Icon/icon.interface'

import {
    TStatus,
    TStatusPosition
} from '../../types/Commons/status.type'

export interface IStatusProps extends IIconProps {
    status?: TStatus
    statusIconPosition?: TStatusPosition
}
