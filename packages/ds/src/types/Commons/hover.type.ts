import { ORIGAM_HOVER_STOP_KEY } from '../../consts/Commons/hover.const'

export type THoverEvent = (MouseEvent | TouchEvent) & { [ORIGAM_HOVER_STOP_KEY]?: boolean }
