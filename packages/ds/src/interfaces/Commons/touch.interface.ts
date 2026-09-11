import type { DirectiveBinding } from 'vue'

export interface ITouchHandlers {
    start?: (wrapperEvent: { originalEvent: TouchEvent } & ITouchData) => void
    end?: (wrapperEvent: { originalEvent: TouchEvent } & ITouchData) => void
    move?: (wrapperEvent: { originalEvent: TouchEvent } & ITouchData) => void
    left?: (wrapper: ITouchData) => void
    right?: (wrapper: ITouchData) => void
    up?: (wrapper: ITouchData) => void
    down?: (wrapper: ITouchData) => void
}

export interface ITouchData {
    touchstartX: number
    touchstartY: number
    touchmoveX: number
    touchmoveY: number
    touchendX: number
    touchendY: number
    offsetX: number
    offsetY: number
}

export interface ITouchValue extends ITouchHandlers {
    parent?: boolean
    options?: AddEventListenerOptions
}

export interface ITouchStoredHandlers {
    touchstart: (e: TouchEvent) => void
    touchend: (e: TouchEvent) => void
    touchmove: (e: TouchEvent) => void
}

export interface ITouchDirectiveBinding extends Omit<DirectiveBinding, 'value'> {
    value?: ITouchValue
}
