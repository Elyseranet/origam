import type { IIconProps } from '../../interfaces'

import { TStatus, TStatusPosition } from '../../types'

export interface IStatusProps extends IIconProps {
    status?: TStatus
    statusIconPosition?: TStatusPosition
}
