// Characterization of `useTouch`'s drag path (touchstart -> touchmove -> dragStyles),
// pinned before the #1398 Sonar refactor (S3776 / S3358). The existing spec skips this
// path because jsdom reports clientWidth/clientHeight = 0; here they are stubbed.

import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useTouch } from '@origam/composables/Commons/touch.composable'

type TPosition = 'left' | 'right' | 'top' | 'bottom'

function touchEvent (type: string, clientX: number, clientY: number, cancelable = true) {
    const evt = new Event(type, { bubbles: true, cancelable }) as unknown as TouchEvent
    Object.defineProperty(evt, 'changedTouches', { value: [{ clientX, clientY, identifier: 0 }] })
    Object.defineProperty(evt, 'cancelable', { value: cancelable })
    return evt
}

function setup (position: TPosition, isActive = false) {
    const refs = {
        isActive: ref(isActive),
        isTemporary: ref(false),
        width: ref(300),
        touchless: ref(false),
        position: ref<TPosition>(position)
    }
    let api!: ReturnType<typeof useTouch>
    const wrapper = mount(defineComponent({
        setup () {
            api = useTouch(refs)
            return () => h('div')
        }
    }))
    return { refs, api: () => api, wrapper }
}

const fire = (e: Event) => window.dispatchEvent(e)

describe('useTouch — drag path per position', () => {
    beforeEach(() => {
        Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 1000 })
        Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 800 })
    })
    afterEach(() => {
        delete (document.documentElement as unknown as Record<string, unknown>).clientWidth
        delete (document.documentElement as unknown as Record<string, unknown>).clientHeight
    })

    // [position, start, move, transform at progress 0.5]
    const cases: Array<[TPosition, [number, number], [number, number], string]> = [
        ['left', [10, 100], [160, 100], 'translateX(calc(-100% + 150px))'],
        ['right', [990, 100], [840, 100], 'translateX(calc(100% - 150px))'],
        ['top', [100, 10], [100, 160], 'translateY(calc(-100% + 150px))'],
        ['bottom', [100, 790], [100, 640], 'translateY(calc(100% - 150px))']
    ]

    it.each(cases)('%s: edge touch then move past threshold drags with the expected transform', (position, start, move, transform) => {
        const { api, wrapper } = setup(position)

        fire(touchEvent('touchstart', ...start))
        expect(api().isDragging.value).toBe(false)
        expect(api().dragProgress.value).toBe(0)

        fire(touchEvent('touchmove', ...move))
        expect(api().isDragging.value).toBe(true)
        expect(api().dragProgress.value).toBe(0.5)
        expect(api().dragStyles.value).toEqual({ transform, transition: 'none' })

        fire(touchEvent('touchend', ...move))
        expect(api().isDragging.value).toBe(false)
        wrapper.unmount()
    })

    it('touch away from the edge zone does not start a drag', () => {
        const { api, wrapper } = setup('left')
        fire(touchEvent('touchstart', 500, 100))
        fire(touchEvent('touchmove', 700, 100))
        expect(api().isDragging.value).toBe(false)
        wrapper.unmount()
    })

    it('an open panel is draggable from inside itself (inElement)', () => {
        const { api, wrapper } = setup('left', true)
        fire(touchEvent('touchstart', 200, 100))
        fire(touchEvent('touchmove', 100, 100))
        expect(api().isDragging.value).toBe(true)
        wrapper.unmount()
    })

    it('a non-cancelable move abandons the gesture for good', () => {
        const { api, wrapper } = setup('left')
        fire(touchEvent('touchstart', 10, 100))
        fire(touchEvent('touchmove', 160, 100, false))
        fire(touchEvent('touchmove', 200, 100))
        expect(api().isDragging.value).toBe(false)
        wrapper.unmount()
    })

    it('a mostly-vertical move on a horizontal panel abandons the gesture', () => {
        const { api, wrapper } = setup('left')
        fire(touchEvent('touchstart', 10, 100))
        fire(touchEvent('touchmove', 12, 150))
        fire(touchEvent('touchmove', 200, 150))
        expect(api().isDragging.value).toBe(false)
        wrapper.unmount()
    })
})
