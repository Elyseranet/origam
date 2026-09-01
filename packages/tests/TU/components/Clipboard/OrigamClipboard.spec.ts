// Unit tests for OrigamClipboard — minimal API surface.
//
// What's covered:
//  - Default trigger renders + flips its label "Copy" → "Copied!" on success.
//  - `@copy(value)` emits with the right payload.
//  - The `copied` flag auto-resets after `feedbackDuration` ms.
//  - The default `#default` scoped slot receives `{ copy, copied, error }`.
//  - `disabled` short-circuits the copy pipeline.
//  - On clipboard failure, `@error(Error)` is emitted instead of `@copy`.

import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { nextTick } from 'vue'

import OrigamClipboard from '@origam/components/Clipboard/OrigamClipboard.vue'
import { createOrigam } from '@origam/origam'

import type { IClipboardProps } from '@origam/interfaces'

type MountOptions = Partial<IClipboardProps> & { slots?: Record<string, any> }

const mountClipboard = (opts: MountOptions = {}): VueWrapper => {
    const { slots, ...props } = opts
    return mount(OrigamClipboard, {
        props: { value: 'hello', ...props },
        slots,
        global: {
            plugins: [createOrigam()]
        }
    })
}

const stubClipboardSuccess = () => {
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
            writeText: vi.fn().mockResolvedValue(undefined)
        }
    })
}

const stubClipboardFailure = () => {
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
            writeText: vi.fn().mockRejectedValue(new Error('Permission denied'))
        }
    })
    // execCommand fallback path: also fail to keep the pipeline negative.
    document.execCommand = (() => false) as unknown as typeof document.execCommand
}

describe('OrigamClipboard', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        stubClipboardSuccess()
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
    })

    it('renders the default trigger button when no slot is provided', () => {
        const wrapper = mountClipboard()
        expect(wrapper.get('[data-cy="origam-clipboard-default-trigger"]').exists()).toBe(true)
    })

    // Le texte d'acquittement ne vit PLUS dans le bouton : il est passe au
    // tooltip (remarque utilisateur sur la ligne L58 du classeur). Le bouton,
    // lui, ne change que son icone et son nom accessible — ce qui evite qu'il
    // s'elargisse en pleine interaction et qu'une region aria-live transitoire
    // se retrouve a l'interieur d'un controle.
    it('hands the feedback text to the tooltip and flips the accessible name', async () => {
        const wrapper = mountClipboard({ feedbackText: 'Done!' })
        const trigger = wrapper.get('[data-cy="origam-clipboard-default-trigger"]')

        expect(trigger.attributes('aria-label')).toBe('Copy to clipboard')

        await trigger.trigger('click')
        await vi.waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello'))
        await nextTick()

        expect(trigger.attributes('aria-label')).toBe('Value copied to clipboard')
        expect(wrapper.findComponent({ name: 'OrigamTooltip' }).props('text')).toBe('Done!')
        expect(wrapper.findComponent({ name: 'OrigamTooltip' }).props('modelValue')).toBe(true)
    })

    it('emits @copy(value) once on success', async () => {
        const wrapper = mountClipboard({ value: 'payload' })
        await wrapper.get('[data-cy="origam-clipboard-default-trigger"]').trigger('click')
        await vi.waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled())
        await nextTick()

        expect(wrapper.emitted('copy')).toBeTruthy()
        expect(wrapper.emitted('copy')![0]).toEqual(['payload'])
    })

    it('resets copied to false after feedbackDuration ms', async () => {
        const wrapper = mountClipboard({ feedbackDuration: 1000, feedbackText: 'OK' })
        await wrapper.get('[data-cy="origam-clipboard-default-trigger"]').trigger('click')
        await vi.waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled())
        await nextTick()
        expect(wrapper.findComponent({ name: 'OrigamTooltip' }).props('modelValue')).toBe(true)

        vi.advanceTimersByTime(1100)
        await nextTick()
        expect(wrapper.findComponent({ name: 'OrigamTooltip' }).props('modelValue')).toBe(false)
    })

    it('passes { copy, copied, error } to the default scoped slot', async () => {
        let slotProps: any = null
        const _wrapper = mountClipboard({
            slots: {
                default: (props: any) => {
                    slotProps = props
                    return null
                }
            }
        })
        await nextTick()
        expect(slotProps).toMatchObject({
            copy: expect.any(Function),
            copied: false,
            error: null
        })
    })

    // Regression for #400 — `IClipboardSlots.feedback` was declared and
    // documented but never rendered (`<slot name="feedback">` was absent
    // from the template). Vue silently drops content passed to an
    // undeclared slot: a consumer following the doc/story got nothing.
    it('renders custom #feedback content instead of feedbackText when copied is true', async () => {
        const wrapper = mountClipboard({
            slots: {
                feedback: (props: any) => `custom:${ props.copied }`
            }
        })

        await wrapper.get('[data-cy="origam-clipboard-default-trigger"]').trigger('click')
        await vi.waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled())
        await nextTick()

        // Le slot #feedback est desormais rendu dans le tooltip, qui est
        // teleporte hors du wrapper — on l'interroge donc dans le document.
        expect(document.body.textContent).toContain('custom:true')
    })

    it('does not render the #feedback slot before a successful copy', () => {
        const wrapper = mountClipboard({
            slots: {
                feedback: () => 'custom feedback'
            }
        })

        expect(wrapper.text()).not.toContain('custom feedback')
    })

    it('short-circuits when disabled — neither writes nor emits @copy', async () => {
        const wrapper = mountClipboard({ disabled: true })
        await wrapper.get('[data-cy="origam-clipboard-default-trigger"]').trigger('click')
        await nextTick()
        expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
        expect(wrapper.emitted('copy')).toBeFalsy()
    })

    it('emits @error(Error) when the clipboard pipeline fails', async () => {
        stubClipboardFailure()
        const wrapper = mountClipboard({ value: 'fails' })
        await wrapper.get('[data-cy="origam-clipboard-default-trigger"]').trigger('click')
        await vi.waitFor(() => expect(wrapper.emitted('error')).toBeTruthy())

        expect(wrapper.emitted('copy')).toBeFalsy()
        const errEvent = wrapper.emitted('error')![0]
        expect(errEvent[0]).toBeInstanceOf(Error)
    })
})

// ---------------------------------------------------------------------------
// Typography props (ITypographyProps surface via useTypography 'clipboard__feedback')
//
// The BEM-child surface is .origam-clipboard__default-trigger which reads:
//   font-size:   var(--origam-clipboard__feedback---font-size, 0.75rem)
//   font-weight: var(--origam-clipboard__feedback---font-weight, 500)
// typographyStyles is bound on the ROOT: these are custom properties, so they
// INHERIT down to the trigger where the SCSS reads them. They used to sit on the
// raw <button>; the trigger is now an <origam-btn>, and a DS component does not
// necessarily forward a received :style to its rendered root element.
// line-height and font-family are NOT read by the SCSS → not exposed.
// ---------------------------------------------------------------------------
describe('OrigamClipboard — typography props (BEM-child: __feedback trigger)', () => {
    it('emits no font-size override when fontSize is unset', () => {
        const wrapper = mountClipboard()
        const style = wrapper.find('[data-cy="origam-clipboard"]').attributes('style') || ''
        expect(style).not.toContain('--origam-clipboard__feedback---font-size')
    })

    it('fontSize="xl" → --origam-clipboard__feedback---font-size: var(--origam-font__size---xl)', () => {
        const wrapper = mountClipboard({ fontSize: 'xl' })
        const style = wrapper.find('[data-cy="origam-clipboard"]').attributes('style') || ''
        expect(style).toContain('--origam-clipboard__feedback---font-size: var(--origam-font__size---xl)')
    })

    it('fontSize="sm" → --origam-clipboard__feedback---font-size: var(--origam-font__size---sm)', () => {
        const wrapper = mountClipboard({ fontSize: 'sm' })
        const style = wrapper.find('[data-cy="origam-clipboard"]').attributes('style') || ''
        expect(style).toContain('--origam-clipboard__feedback---font-size: var(--origam-font__size---sm)')
    })

    it('emits no font-weight override when fontWeight is unset', () => {
        const wrapper = mountClipboard()
        const style = wrapper.find('[data-cy="origam-clipboard"]').attributes('style') || ''
        expect(style).not.toContain('--origam-clipboard__feedback---font-weight')
    })

    it('fontWeight="bold" → --origam-clipboard__feedback---font-weight: var(--origam-font__weight---bold)', () => {
        const wrapper = mountClipboard({ fontWeight: 'bold' })
        const style = wrapper.find('[data-cy="origam-clipboard"]').attributes('style') || ''
        expect(style).toContain('--origam-clipboard__feedback---font-weight: var(--origam-font__weight---bold)')
    })

    it('fontWeight="semibold" → --origam-clipboard__feedback---font-weight: var(--origam-font__weight---semibold)', () => {
        const wrapper = mountClipboard({ fontWeight: 'semibold' })
        const style = wrapper.find('[data-cy="origam-clipboard"]').attributes('style') || ''
        expect(style).toContain('--origam-clipboard__feedback---font-weight: var(--origam-font__weight---semibold)')
    })
})
