// #505 — OrigamSliderField's thumb size no longer hardcoded + shadowed.
//
// `sliderFieldStyles` used to unconditionally write
//   '--origam-slider-field---thumb-size': convertToUnit(20)
// on every render, with NO prop backing it at all — there is no
// `thumbSize`/`thumbProps` on `ISliderFieldProps`. An inline style always
// outranks any CSS rule, so this permanently shadowed BOTH a theme override
// AND the real per-component design token
// (`component.slider-field.thumb.size` = 16px, emitted as
// `--origam-slider-field__thumb---size`) — which the component's SCSS never
// even referenced: it read a DIFFERENT, never-emitted flat name
// (`--origam-slider-field---thumb-size`) whose only two sources were this
// JS write and a hardcoded `20px` CSS fallback. Two bugs stacked: an
// always-on inline override, on top of a dead variable name.
//
// Fix, mirroring the precedent in `breadcrumb-token-namespace.spec.ts`
// (#386 — same bug class): (1) drop the JS override entirely — there is no
// prop to gate it on, so "inline only if the prop is passed" reduces to
// "never inline" here; (2) rename every SCSS/JS reference from the dead flat
// name to the real BEM token name the token pipeline already emits.
//
// SCOPE CAVEAT: this changes the FIELD-variant's unthemed default thumb size
// from 20px (dead, JS-forced) to 16px (the real token value) — a small
// visible delta, not a null-op. TU proves what it *can* prove (see the
// breadcrumb precedent's own caveat: jsdom does not resolve `var(...)` at
// all, so the actual cascade / rendered size cannot be asserted here).

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

import OrigamSliderField from '@origam/components/SliderField/OrigamSliderField.vue'
import { createOrigam } from '@origam/origam'

const DS_ROOT = path.resolve(__dirname, '../../../../ds')
const TOKENS_CSS_DIR = path.join(DS_ROOT, 'src/assets/css/tokens')
const COMPONENT_FILE = path.join(DS_ROOT, 'src/components/SliderField/OrigamSliderField.vue')

function readCss (file: string): string {
    return readFileSync(path.join(TOKENS_CSS_DIR, file), 'utf-8')
}

const OrigamSliderFieldTrackStub = defineComponent({
    name: 'OrigamSliderFieldTrack',
    props: {size: [Number, String]},
    template: '<div class="origam-slider-field-track"/>'
})
const OrigamLabelStub = defineComponent({
    name: 'OrigamLabel',
    props: {text: String},
    template: '<label/>'
})

function mountBareSlider () {
    return mount(OrigamSliderField, {
        attachTo: document.body,
        global: {
            plugins: [createOrigam()],
            stubs: {
                OrigamSliderFieldTrack: OrigamSliderFieldTrackStub,
                OrigamLabel: OrigamLabelStub,
                OrigamIcon: {template: '<i/>'}
            }
        },
        props: {variant: 'timer', modelValue: 0}
    })
}

describe('OrigamSliderField — #505 thumb-size token wiring', () => {
    it.each(['light.css', 'dark.css'])('%s emits --origam-slider-field__thumb---size (the real per-component token, 16px)', (file) => {
        const css = readCss(file)
        expect(css).toContain('--origam-slider-field__thumb---size: 16px;')
    })

    it('OrigamSliderField.vue no longer references the dead flat name --origam-slider-field---thumb-size', () => {
        const src = readFileSync(COMPONENT_FILE, 'utf-8')
        expect(src).not.toContain('--origam-slider-field---thumb-size')
    })

    it('OrigamSliderField.vue reads --origam-slider-field__thumb---size (the exact name now emitted)', () => {
        const src = readFileSync(COMPONENT_FILE, 'utf-8')
        expect(src).toContain('width: var(--origam-slider-field__thumb---size, 20px);')
    })

    it('no longer writes an unconditional JS inline override for thumb-size', () => {
        const src = readFileSync(COMPONENT_FILE, 'utf-8')
        expect(src).not.toMatch(/thumb-size['"]?\s*:\s*convertToUnit\(20\)/)
    })

    it('the rendered root style carries the track-size var (unaffected, prop-driven) but no thumb-size entry at all', () => {
        const wrapper = mountBareSlider()
        const style = wrapper.element.getAttribute('style') ?? ''
        expect(style).toContain('--origam-slider-field---track-size')
        expect(style).not.toContain('thumb-size')
        wrapper.unmount()
    })
})
