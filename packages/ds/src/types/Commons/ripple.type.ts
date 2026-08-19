import { ORIGAM_RIPPLE_STOP_KEY } from '../../consts/Commons/ripple.const'

export type TRippleEvent = (MouseEvent | TouchEvent | KeyboardEvent) & { [ORIGAM_RIPPLE_STOP_KEY]?: boolean }
