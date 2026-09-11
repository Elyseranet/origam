import type { ITouchDirectiveBinding } from '../../interfaces'
import type { TTouchEvent } from '../../types'

import { createHandlers } from '../../utils'

export const Touch = {
    mounted: (el: HTMLElement, binding: ITouchDirectiveBinding) => {
        const value = binding.value
        const target = value?.parent ? el.parentElement : el
        const options = value?.options ?? {passive: true}
        const uid = binding.instance?.$.uid // TODO: use custom uid generator

        if (!target || !uid) return

        const handlers = createHandlers(binding.value)

        target._touchHandlers = target._touchHandlers ?? Object.create(null)
        target._touchHandlers![uid] = handlers

        Object.keys(handlers).forEach((eventName) => {
            target.addEventListener(eventName as TTouchEvent, handlers[eventName as TTouchEvent], options)
        })
    },
    unmounted: (el: HTMLElement, binding: ITouchDirectiveBinding) => {
        const target = binding.value?.parent ? el.parentElement : el
        const uid = binding.instance?.$.uid

        if (!target?._touchHandlers || !uid) return

        const handlers = target._touchHandlers[uid]

        Object.keys(handlers).forEach((eventName) => {
            target.removeEventListener(eventName, handlers[eventName])
        })

        delete target._touchHandlers[uid]
    }
}

export default Touch
