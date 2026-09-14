import { TOUCH_EVENTS } from '../../enums/Commons/touch.enum'
import type { ITouchData, ITouchHandlers } from '../../interfaces/Commons/touch.interface'

export type TTouchWrapper = ITouchHandlers & ITouchData

export type TTouchEvent = `${TOUCH_EVENTS}`
