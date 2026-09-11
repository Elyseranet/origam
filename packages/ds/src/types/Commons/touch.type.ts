import { TOUCH_EVENTS } from '../../enums'
import type { ITouchData, ITouchHandlers } from '../../interfaces'

export type TTouchWrapper = ITouchHandlers & ITouchData

export type TTouchEvent = `${TOUCH_EVENTS}`
