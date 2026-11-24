// v-contrast — #1131: Chromium reports a background-color as oklab(...) mid-transition / at
// hydration. The directive used to skip that layer, measure the page colour and force black/white.
// It must convert the colour (oklab, oklch, color(srgb)) or abstain, never measure the layer below.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, withDirectives } from 'vue'

import vContrast from '@origam/directives/Contrast/contrast.directive'

describe('v-contrast — oklab / oklch / color(srgb) backgrounds (#1131)', () => {
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

    it('measures an opaque oklab() background (white on dark: no override)', () => {
        const { app, el } = mountSpan({ color: 'rgb(255, 255, 255)', backgroundColor: 'oklab(0.3 0 0)' })
        expect(el.dataset.origamContrastFixed).toBeUndefined()
        app.unmount()
    })

    it('measures an opaque oklab() background (dark on dark: forces white, not the page-based black)', () => {
        const { app, el } = mountSpan({ color: 'rgb(20, 20, 20)', backgroundColor: 'oklab(0.3 0 0)' })
        expect(el.dataset.origamContrastFixed).toBe('true')
        expect(el.style.getPropertyValue('color')).toBe('rgb(255, 255, 255)')
        app.unmount()
    })

    it('measures an oklch() background', () => {
        const { app, el } = mountSpan({ color: 'rgb(20, 20, 20)', backgroundColor: 'oklch(0.3 0 0)' })
        expect(el.style.getPropertyValue('color')).toBe('rgb(255, 255, 255)')
        app.unmount()
    })

    it('measures a color(srgb …) background', () => {
        const { app, el } = mountSpan({ color: 'rgb(20, 20, 20)', backgroundColor: 'color(srgb 0.1 0.1 0.1)' })
        expect(el.style.getPropertyValue('color')).toBe('rgb(255, 255, 255)')
        app.unmount()
    })

    it('abstains on a background colour it cannot convert, never measures the page below', () => {
        const { app, el } = mountSpan({ color: 'rgb(255, 255, 255)', backgroundColor: 'oklab(none 0 0)' })
        expect(el.dataset.origamContrastFixed).toBeUndefined()
        expect(el.style.getPropertyPriority('color')).toBe('')
        app.unmount()
    })
})
