import { ORIGAM_HOVER_STOP_KEY } from '../../consts'

export type THoverEvent = (MouseEvent | TouchEvent) & { [ORIGAM_HOVER_STOP_KEY]?: boolean }
