import type { IHoverHtmlElement, IHoverOptions } from '../../interfaces'

import type { THoverEvent } from '../../types'

export const ORIGAM_HOVER_STOP_KEY = Symbol('origam:hoverStop')

export const HOVER = {
    show (
        _e: THoverEvent,
        el: IHoverHtmlElement,
        value: IHoverOptions
    ) {
        if (!el?._hover?.enabled) {
            return
        }

        el.classList.add(value.class)
    },

    hide (el: IHoverHtmlElement | null, value: IHoverOptions) {
        if (!el?._hover?.enabled) return

        el.classList.remove(value.class)
    }
}
