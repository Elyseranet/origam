// #1398 (lot 3) — fire-and-forget promises (`void p()`) became `p().catch(warnAsyncRejection)`.
// Each form: no unhandled rejection, a dev warning is emitted (expected
// NotAllowedError / AbortError stay silent), component state is unchanged.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { warnAsyncRejection } from '@origam/utils/Commons/console.util'
import { createOrigam } from '@origam/origam'

const rejectors = vi.hoisted(() => ({ play: false, confirm: false }))

vi.mock('@origam/composables/Audio/use-audio-player.composable', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@origam/composables/Audio/use-audio-player.composable')>()

    return {
        ...actual,
        useAudioPlayer: (...args: Parameters<typeof actual.useAudioPlayer>) => {
            const player = actual.useAudioPlayer(...args)
            const play = player.methods.play

            player.methods.play = () => rejectors.play ? Promise.reject(new Error('play boom')) : play()

            return player
        }
    }
})

vi.mock('@origam/composables/InlineEdit/inline-edit.composable', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@origam/composables/InlineEdit/inline-edit.composable')>()

    return {
        ...actual,
        useInlineEdit: (...args: Parameters<typeof actual.useInlineEdit>) => {
            const state = actual.useInlineEdit(...args)
            const confirm = state.confirm

            return { ...state, confirm: () => rejectors.confirm ? Promise.reject(new Error('confirm boom')) : confirm() }
        }
    }
})

const unhandled: Array<unknown> = []
const onUnhandled = (reason: unknown) => { unhandled.push(reason) }
let warnSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
    unhandled.length = 0
    process.on('unhandledRejection', onUnhandled)
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
    process.off('unhandledRejection', onUnhandled)
    warnSpy.mockRestore()
    rejectors.play = false
    rejectors.confirm = false
})

const settle = async () => {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))
}

const warnings = () => warnSpy.mock.calls.map((c: Array<unknown>) => String(c[0]))

describe('warnAsyncRejection', () => {
    it('stays silent for the expected play() outcomes', () => {
        for (const name of [ 'NotAllowedError', 'AbortError' ]) {
            const err = new Error('x')
            err.name = name
            warnAsyncRejection('Ctx', err)
        }

        expect(warnings()).toEqual([])
    })

    it('warns (dev) for any other error', () => {
        warnAsyncRejection('Ctx', new Error('boom'))
        warnAsyncRejection('Ctx', 'plain string')

        expect(warnings().filter((w) => w.includes('Ctx: unhandled async error'))).toHaveLength(2)
    })
})

describe('OrigamAudio — autoplay play() rejection', () => {
    it('is caught, warned in dev, and leaves the player state untouched', async () => {
        const { OrigamAudio } = await import('@origam/components')
        rejectors.play = true

        const wrapper = mount(OrigamAudio, {
            props: { src: 'x.mp3', autoplay: false } as never,
            global: { plugins: [ createOrigam() ] }
        })
        await settle()
        const before = wrapper.html()

        await wrapper.setProps({ autoplay: true, muted: true } as never)
        await settle()

        expect(unhandled).toEqual([])
        expect(warnings().some((w) => w.includes('OrigamAudio: unhandled async error — play boom'))).toBe(true)
        // Nothing started playing: the control still reads "play".
        expect(wrapper.find('[aria-pressed="true"][data-cy*="play"]').exists()).toBe(false)
        expect(before.length).toBeGreaterThan(0)
    })
})

describe('OrigamInlineEdit — confirm() rejection', () => {
    it('is caught and warned in dev, the field stays in edit mode', async () => {
        const { OrigamInlineEdit } = await import('@origam/components')
        rejectors.confirm = true

        const wrapper = mount(OrigamInlineEdit, {
            props: { modelValue: 'hello', showActions: true } as never,
            attachTo: document.body,
            global: { plugins: [ createOrigam() ] }
        })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await settle()

        const confirmBtn = wrapper.find('[data-cy="origam-inline-edit-action-confirm"]')
        expect(confirmBtn.exists()).toBe(true)
        await confirmBtn.trigger('click')
        await settle()

        expect(unhandled).toEqual([])
        expect(warnings().some((w) => w.includes('OrigamInlineEdit: unhandled async error — confirm boom'))).toBe(true)
        expect(wrapper.emitted('confirm')).toBeUndefined()
        expect(wrapper.find('[data-cy="origam-inline-edit-action-confirm"]').exists()).toBe(true)
        wrapper.unmount()
    })
})

describe('OrigamCode — rebuild()', () => {
    it('never produces an unhandled rejection nor a dev warning on a normal mount', async () => {
        const { OrigamCode } = await import('@origam/components')
        const wrapper = mount(OrigamCode, {
            props: { code: 'const a = 1', lang: 'ts' } as never,
            global: { plugins: [ createOrigam() ] }
        })
        await settle()
        await wrapper.setProps({ code: 'const b = 2' } as never)
        await settle()

        expect(unhandled).toEqual([])
        expect(warnings().filter((w) => w.includes('OrigamCode: unhandled async error'))).toEqual([])
    })
})
