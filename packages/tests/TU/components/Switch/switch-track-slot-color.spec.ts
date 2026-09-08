// `<OrigamSwitchTrack>` transmet `color` dans la charge de son slot au
// runtime, alors que `ISwitchTrackSlotsProps` ne declarait que
// `{ model, isValid }`.
//
// ⛔ Le commentaire du composant AFFIRMAIT deja cette transmission — « the
// `color` prop is exposed for slot consumers ». Un consommateur TypeScript
// destructurant `#track.true="{ color }"` recevait donc une erreur sur une
// valeur qui est bel et bien la : la doc disait vrai, le type disait faux.
//
// L'interface le declare desormais ; ce spec epingle la moitie RUNTIME, pour
// que le type et la charge ne puissent plus diverger.

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

