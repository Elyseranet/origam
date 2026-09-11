// Regression for #402 — OrigamColorPickerPreview's eyedropper button was
// icon-only with no accessible name, and `disabled` stopped at the two
// sliders (never reached the eyedropper button, which stayed clickable
// while the rest of the picker was disabled).
//
// `SUPPORTS_EYE_DROPPER` (packages/ds/src/consts/Commons/commons.const.ts)
// is a plain `const` evaluated once at module load — `'EyeDropper' in
// window`. jsdom never ships `window.EyeDropper`, so the eyedropper
// button's `v-if="SUPPORTS_EYE_DROPPER"` never renders unless
// `window.EyeDropper` exists BEFORE that module is first imported anywhere
// in this file's module graph. The stub below MUST stay the first
// statement in this file, before any `@origam/*` import. The interactive
// `eyeDropper.open()` call itself still can't be driven headlessly (no
// native user gesture) — that is #402's own documented, accepted
// limitation; this spec only proves the button renders, is named, and is
// disabled correctly.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// `vi.hoisted()` runs before ANY import in this file is evaluated — a plain
// top-of-file statement does NOT do this under Vite/esbuild's module
// transform, which hoists `import` bindings above arbitrary statements
// regardless of source order. `SUPPORTS_EYE_DROPPER` is read at module load
// by the first `@origam/*` import that touches `commons.const.ts`, so the
// stub must land here, not as a plain statement.
vi.hoisted(() => {
    (globalThis as unknown as { EyeDropper: unknown }).EyeDropper = class {
        open () {
            return Promise.resolve({ sRGBHex: '#000000' })
        }
    }
})

import OrigamColorPickerPreview from '@origam/components/ColorPicker/OrigamColorPickerPreview.vue'
import { createOrigam } from '@origam/origam'

function mountPreview (props: Record<string, unknown> = {}, locale = 'en') {
    return mount(OrigamColorPickerPreview, {
        props,
        global: {
            plugins: [createOrigam({ locale: { locale } } as never)],
            stubs: {
                OrigamSliderField: { template: '<div />' }
            }
        }
    })
}

describe('OrigamColorPickerPreview — eyedropper button has an accessible name (#402)', () => {
    it('carries an aria-label in English', () => {
        const wrapper = mountPreview()
        const btn = wrapper.find('.origam-color-picker-preview__eye-dropper .origam-btn')

        expect(btn.exists()).toBe(true)
        expect(btn.attributes('aria-label')).toBe('Pick color from screen')
    })

    it('carries the FR-translated aria-label, proving it flows through the real i18n system', () => {
        const wrapper = mountPreview({}, 'fr')
        const btn = wrapper.find('.origam-color-picker-preview__eye-dropper .origam-btn')

        expect(btn.attributes('aria-label')).toBe('Prélever une couleur à l\'écran')
    })

    it('propagates disabled to the eyedropper button (#402 — disabled stopped at the sliders before)', () => {
        const wrapper = mountPreview({ disabled: true })
        const btn = wrapper.find('.origam-color-picker-preview__eye-dropper .origam-btn')

        expect(btn.attributes('disabled')).toBeDefined()
    })
})
