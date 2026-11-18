import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { h } from 'vue'
import { OrigamCode, OrigamCodeGroup } from '@origam/components'
import { createOrigam } from '@origam/origam'

/*********************************************************
 * OrigamCodeGroup — tabs, shared copy, distinct scroller names
 *
 * @description
 * Attributes and classes only (`attributes()`, `classes()`, emitted events):
 * no `getComputedStyle` on a `var()`-driven property, which jsdom cannot
 * resolve. The painted result (one visible border, no repeated header) is
 * measured in a real browser by `e2e/code-group.spec.ts`.
 ********************************************************/

const ITEMS = [
    { label: 'npm', lang: 'bash', code: 'npm install origam' },
    { label: 'pnpm', lang: 'bash', code: 'pnpm add origam' },
    { label: 'yarn', lang: 'bash', code: 'yarn add origam' }
]

const mountGroup = (props: Record<string, unknown> = {}, slots?: Record<string, () => unknown>) =>
    mount(OrigamCodeGroup, {
        props: { items: ITEMS, ...props } as never,
        slots: slots as never,
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })

describe('OrigamCodeGroup — items form', () => {
    it('renders one tab per item and selects the first by default', async () => {
        const wrapper = mountGroup()
        await flushPromises()

        const tabs = wrapper.findAll('[role="tab"]')
        expect(tabs.map((tab) => tab.text())).toEqual(['npm', 'pnpm', 'yarn'])
        expect(tabs[0].attributes('aria-selected')).toBe('true')
        expect(tabs[1].attributes('aria-selected')).toBe('false')

        wrapper.unmount()
    })

    it('names the tab list', async () => {
        const wrapper = mountGroup({ label: 'Package manager' })
        await flushPromises()

        expect(wrapper.find('[role="tablist"]').attributes('aria-label')).toBe('Package manager')

        wrapper.unmount()
    })

    it('falls back to a localised generic name for the tab list', async () => {
        const wrapper = mountGroup()
        await flushPromises()

        expect(wrapper.find('[role="tablist"]').attributes('aria-label')).toBe('Code variants')

        wrapper.unmount()
    })

    it('emits update:modelValue when another tab is chosen', async () => {
        const wrapper = mountGroup()
        await flushPromises()

        await wrapper.findAll('[role="tab"]')[1].trigger('click')

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['pnpm'])

        wrapper.unmount()
    })

    it('honours v-model: the tab matching modelValue is the selected one', async () => {
        const wrapper = mountGroup({ modelValue: 'yarn' })
        await flushPromises()

        const tabs = wrapper.findAll('[role="tab"]')
        expect(tabs[2].attributes('aria-selected')).toBe('true')
        expect(tabs[0].attributes('aria-selected')).toBe('false')

        wrapper.unmount()
    })

    it('hosts every code block flattened and without its own header or copy button', async () => {
        const wrapper = mountGroup()
        await flushPromises()

        const codes = wrapper.findAll('.origam-code')
        expect(codes.length).toBeGreaterThan(0)
        for (const code of codes) {
            expect(code.classes()).toContain('origam-code--flat')
            expect(code.classes()).not.toContain('origam-code--has-header')
            expect(code.find('.origam-code__header').exists()).toBe(false)
            expect(code.find('.origam-code__copy').exists()).toBe(false)
        }

        wrapper.unmount()
    })

    it('forwards lineNumbers and wrap to the hosted blocks', async () => {
        const wrapper = mountGroup({ lineNumbers: true, wrap: true })
        await flushPromises()

        const code = wrapper.find('.origam-code')
        expect(code.classes()).toContain('origam-code--line-numbers')
        expect(code.classes()).toContain('origam-code--wrap')

        wrapper.unmount()
    })

    it('has exactly one copy button for the whole group', async () => {
        const wrapper = mountGroup()
        await flushPromises()

        expect(wrapper.findAll('[data-cy="origam-code-group-copy"]')).toHaveLength(1)
        expect(wrapper.findAll('.origam-code__copy')).toHaveLength(1)

        wrapper.unmount()
    })

    it('drops the copy button when copyable is false', async () => {
        const wrapper = mountGroup({ copyable: false })
        await flushPromises()

        expect(wrapper.find('[data-cy="origam-code-group-copy"]').exists()).toBe(false)

        wrapper.unmount()
    })

    it('copies the code of the ACTIVE tab and emits it', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined)
        Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

        const wrapper = mountGroup()
        await flushPromises()

        await wrapper.find('[data-cy="origam-code-group-copy"]').trigger('click')
        await flushPromises()
        expect(writeText).toHaveBeenLastCalledWith('npm install origam')
        expect(wrapper.emitted('copy')?.at(-1)).toEqual(['npm install origam'])

        await wrapper.findAll('[role="tab"]')[2].trigger('click')
        await flushPromises()
        await wrapper.find('[data-cy="origam-code-group-copy"]').trigger('click')
        await flushPromises()
        expect(writeText).toHaveBeenLastCalledWith('yarn add origam')
        expect(wrapper.emitted('copy')?.at(-1)).toEqual(['yarn add origam'])

        wrapper.unmount()
    })

    it('gives every scroller a DISTINCT accessible name (label + position)', async () => {
        const wrapper = mountGroup()
        await flushPromises()

        for (const tab of wrapper.findAll('[role="tab"]')) {
            await tab.trigger('click')
            await flushPromises()
        }

        const names = wrapper.findAll('.origam-code__scroller').map((scroller) => scroller.attributes('aria-label'))
        expect(names).toHaveLength(3)
        expect(new Set(names).size).toBe(3)
        expect(names).toContain('npm, code block 1 of 3, scrollable region')
        expect(names).toContain('yarn, code block 3 of 3, scrollable region')

        wrapper.unmount()
    })

    it('puts the group label in the scroller names, so two groups do not collide', async () => {
        const first = mountGroup({ label: 'Install origam' })
        const second = mountGroup({ label: 'Install shiki' })
        await flushPromises()

        const nameOf = (wrapper: ReturnType<typeof mountGroup>) => wrapper.find('.origam-code__scroller').attributes('aria-label')

        expect(nameOf(first)).toBe('Install origam, npm, code block 1 of 3, scrollable region')
        expect(nameOf(first)).not.toBe(nameOf(second))

        first.unmount()
        second.unmount()
    })

    it('puts the group surface classes on the root, not on the blocks', async () => {
        const wrapper = mountGroup({ border: 'thin', rounded: 'lg' })
        await flushPromises()

        expect(wrapper.classes()).toContain('origam-code-group')
        for (const code of wrapper.findAll('.origam-code')) {
            expect(code.classes().some((name) => name.startsWith('origam--border'))).toBe(false)
            expect(code.classes().some((name) => name.startsWith('origam--rounded'))).toBe(false)
        }

        wrapper.unmount()
    })
})

describe('OrigamCodeGroup — slot form', () => {
    const slotCodes = () => [
        h(OrigamCode, { label: 'npm', lang: 'bash', code: 'npm i a' }),
        h(OrigamCode, { label: 'pnpm', lang: 'bash', code: 'pnpm add a' }),
        h(OrigamCode, { filename: 'yarn.sh', lang: 'bash' }, { default: () => 'yarn add a' })
    ]

    it('takes the tab label from label, then filename', async () => {
        const wrapper = mountGroup({ items: [] }, { default: slotCodes })
        await flushPromises()

        expect(wrapper.findAll('[role="tab"]').map((tab) => tab.text())).toEqual(['npm', 'pnpm', 'yarn.sh'])

        wrapper.unmount()
    })

    it('does not leak label/value as DOM attributes of the blocks', async () => {
        const wrapper = mountGroup({ items: [] }, { default: slotCodes })
        await flushPromises()

        expect(wrapper.find('.origam-code[label]').exists()).toBe(false)

        wrapper.unmount()
    })

    it('copies the code of the active child, whether from the prop or the slot text', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined)
        Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

        const wrapper = mountGroup({ items: [] }, { default: slotCodes })
        await flushPromises()

        await wrapper.find('[data-cy="origam-code-group-copy"]').trigger('click')
        await flushPromises()
        expect(writeText).toHaveBeenLastCalledWith('npm i a')

        await wrapper.findAll('[role="tab"]')[2].trigger('click')
        await flushPromises()
        await wrapper.find('[data-cy="origam-code-group-copy"]').trigger('click')
        await flushPromises()
        expect(writeText).toHaveBeenLastCalledWith('yarn add a')

        wrapper.unmount()
    })

    it('flattens and renames the scrollers of slotted blocks too', async () => {
        const wrapper = mountGroup({ items: [] }, { default: slotCodes })
        await flushPromises()

        const first = wrapper.find('.origam-code')
        expect(first.classes()).toContain('origam-code--flat')
        expect(first.find('.origam-code__scroller').attributes('aria-label')).toBe('npm, code block 1 of 3, scrollable region')

        wrapper.unmount()
    })
})

describe('OrigamCode — embedding props', () => {
    const mountCode = (props: Record<string, unknown>) =>
        mount(OrigamCode, {
            props: { code: 'const a = 1', filename: 'a.ts', ...props } as never,
            global: { plugins: [createOrigam()] }
        })

    it('hideHeader removes the header although a filename is set', () => {
        expect(mountCode({}).find('.origam-code__header').exists()).toBe(true)
        expect(mountCode({ hideHeader: true }).find('.origam-code__header').exists()).toBe(false)
    })

    it('scrollerAriaLabel wins over filename and lang', () => {
        const wrapper = mountCode({ scrollerAriaLabel: 'Custom name' })

        expect(wrapper.find('.origam-code__scroller').attributes('aria-label')).toBe('Custom name')
    })

    it('flat adds the flat class and withholds the surface utility classes', () => {
        const flat = mountCode({ flat: true, border: 'thin', rounded: 'lg' })
        const plain = mountCode({ border: 'thin', rounded: 'lg' })

        expect(flat.classes()).toContain('origam-code--flat')
        expect(flat.classes().some((name) => name.startsWith('origam--border'))).toBe(false)
        expect(plain.classes().some((name) => name.startsWith('origam--border'))).toBe(true)
    })
})
