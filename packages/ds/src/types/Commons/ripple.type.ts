import { ORIGAM_RIPPLE_STOP_KEY } from '../../consts'

export type TRippleEvent = (MouseEvent | TouchEvent | KeyboardEvent) & { [ORIGAM_RIPPLE_STOP_KEY]?: boolean }
