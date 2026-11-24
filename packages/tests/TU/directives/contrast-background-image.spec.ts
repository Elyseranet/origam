// v-contrast — a background IMAGE (gradient) paints above background-color and
// cannot be measured from computed style. The directive used to skip it, walk
// up to the page colour, and force the black / white chosen against THAT page:
// black text on a saturated gradient button (marketing geek hero CTA).
// It must abstain instead.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, withDirectives } from 'vue'

import vContrast from '@origam/directives/Contrast/contrast.directive'

describe('v-contrast — background-image', () => {
    let container: HTMLDivElement

    beforeEach(() => {
        vi.useFakeTimers()
        container = document.createElement('div')
        container.style.backgroundColor = 'rgb(246, 240, 255)'
        document.body.appendChild(container)
    })

    afterEach(() => {
        vi.useRealTimers()
        container.remove()
    })

    const mountSpan = (style: Record<string, string>) => {
        const app = createApp({
            render: () => withDirectives(h('span', { style }, 'label'), [[vContrast]])
        })
        app.mount(container)
        vi.runAllTimers()
        const el = container.querySelector('span') as HTMLElement
        return { app, el }
    }

    it('does not force a colour when the element paints a gradient', () => {
        const { app, el } = mountSpan({
            color: 'rgb(255, 255, 255)',
            backgroundImage: 'linear-gradient(110deg, #0e7490, #a21caf)'
        })

        expect(el.dataset.origamContrastFixed).toBeUndefined()
        expect(el.style.getPropertyPriority('color')).toBe('')
        app.unmount()
    })

    it('still forces a colour on a measurable flat surface (control)', () => {
        const { app, el } = mountSpan({ color: 'rgb(255, 255, 255)' })

        expect(el.dataset.origamContrastFixed).toBe('true')
        expect(el.style.getPropertyPriority('color')).toBe('important')
        app.unmount()
    })
})
