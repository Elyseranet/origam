// C7 lot 1 — the two CODE changes made while bringing docs and stories back
// in line with the live API. Both are jsdom-verifiable (slot payload keys,
// emitted classes), so no Playwright is needed here:
//
//  1. <OrigamSwitchTrack> passes `color` in its slot payload at runtime, but
//     `ISwitchTrackSlotsProps` only declared `{ model, isValid }`. The
//     component's own doc comment already ASSERTED the forwarding
//     ("the `color` prop is exposed for slot consumers"), so a TypeScript
//     consumer destructuring `#track.true="{ color }"` got an error on a
//     value that is genuinely there. The interface now declares it — this
//     spec pins the RUNTIME half so the type and the payload cannot drift
//     apart again.
//
//  2. <OrigamRatingFieldItem>'s scoped stylesheet ships a
//     `.origam-rating-field-item__label` rule (cursor: pointer + the star's
//     transform transition), but the template rendered a bare `<label>` with
//     no class at all — the rule matched nothing, in any browser, ever. The
//     class is now emitted.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'

import OrigamRatingFieldItem from '@origam/components/RatingField/OrigamRatingFieldItem.vue'
import OrigamSwitchTrack from '@origam/components/Switch/OrigamSwitchTrack.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}) as never

describe('OrigamSwitchTrack — the track.* slot payload carries `color`', () => {
    it('exposes { color, model, isValid } to track.true', () => {
        let payload: Record<string, unknown> | undefined

        mount(OrigamSwitchTrack, {
            global: { plugins: [createOrigam()] },
            props: { color: 'success', modelValue: true, isValid: true } as never,
            slots: {
                'track.true': (scope: Record<string, unknown>) => {
                    payload = scope

                    return h('span', 'on')
                }
            }
        })

        expect(payload).toBeDefined()
        expect(payload).toMatchObject({ color: 'success', model: true, isValid: true })
    })

    it('exposes the same three keys to track.false', () => {
        let payload: Record<string, unknown> | undefined

        mount(OrigamSwitchTrack, {
            global: { plugins: [createOrigam()] },
            props: { color: 'danger', modelValue: false, isValid: false } as never,
            slots: {
                'track.false': (scope: Record<string, unknown>) => {
                    payload = scope

                    return h('span', 'off')
                }
            }
        })

        expect(payload).toMatchObject({ color: 'danger', model: false, isValid: false })
    })

    it('still forwards `color` when the consumer passes none (undefined, not missing)', () => {
        let payload: Record<string, unknown> | undefined

        mount(OrigamSwitchTrack, {
            global: { plugins: [createOrigam()] },
            props: { modelValue: true } as never,
            slots: {
                'track.true': (scope: Record<string, unknown>) => {
                    payload = scope

                    return h('span', 'on')
                }
            }
        })

        expect(payload).toBeDefined()
        expect('color' in (payload as object)).toBe(true)
    })
})

describe('OrigamRatingFieldItem — the <label> carries its BEM class', () => {
    it('emits origam-rating-field-item__label so the scoped rule can match', () => {
        const wrapper = mount(OrigamRatingFieldItem, {
            global: { plugins: [createOrigam()] },
            props: { name: 'rating', value: 3 } as never
        })

        const label = wrapper.find('label')

        expect(label.exists()).toBe(true)
        expect(label.classes()).toContain('origam-rating-field-item__label')
    })

    it('keeps the label/input pairing intact alongside the class', () => {
        const wrapper = mount(OrigamRatingFieldItem, {
            global: { plugins: [createOrigam()] },
            props: { name: 'rating', value: 2.5 } as never
        })

        const label = wrapper.find('label')
        const input = wrapper.find('input[type="radio"]')

        expect(label.attributes('for')).toBe('rating-2-5')
        expect(input.attributes('id')).toBe('rating-2-5')
    })
})
