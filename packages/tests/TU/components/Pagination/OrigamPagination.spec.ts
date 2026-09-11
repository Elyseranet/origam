// Unit tests for <OrigamPagination>
//
// Strategy: OrigamPagination renders OrigamBtn children for page buttons
// and navigation controls. We stub OrigamBtn to a clickable <button> so
// we can simulate page selection without the full DS button render chain.
//
// ResizeObserver: vi.clearAllMocks() from the global vitest.setup.ts runs
// before each test and resets mockImplementation to undefined — causing
// `observer.disconnect` to fail on unmount. We re-declare the mock in the
// spec-level beforeEach (which runs AFTER the global beforeEach) so it is
// always fresh.

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'

import OrigamPagination from '@origam/components/Pagination/OrigamPagination.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// ResizeObserver re-mock (vi.clearAllMocks in global setup clears it each test)
// ---------------------------------------------------------------------------
beforeEach(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
    })) as any
})

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------
// OrigamBtn stub: renders a button passing through all props so tests can
// inspect disabled, aria-label, aria-current, active state, and click.
const OrigamBtnStub = defineComponent({
    name: 'OrigamBtn',
    props: {
        text: String,
        icon: [String, Boolean],
        disabled: Boolean,
        active: Boolean,
        ellipsis: Boolean,
        prependIcon: [String, Boolean],
        appendIcon: [String, Boolean]
    },
    emits: ['click'],
    inheritAttrs: false,
    setup(props, { attrs, emit }) {
        return () => h('button', {
            disabled: props.disabled || undefined,
            'aria-label': attrs['aria-label'],
            'aria-current': attrs['aria-current'],
            'aria-disabled': attrs['aria-disabled'],
            'data-active': props.active ? 'true' : undefined,
            'data-text': props.text,
            'data-ellipsis': props.ellipsis ? 'true' : undefined,
            onClick: (e: Event) => emit('click', e)
        }, props.text ?? '')
    }
})

const makeGlobal = () => ({
    plugins: [createOrigam()],
    stubs: {
        OrigamBtn: OrigamBtnStub
    }
})

const mountPagination = (props: Record<string, any> = {}) => {
    return mount(OrigamPagination, {
        props: { modelValue: 1, length: 10, ...props },
        attachTo: document.body,
        global: makeGlobal()
    })
}

// Retrieve all page buttons: items in .origam-pagination__item
const getPageButtons = (wrapper: ReturnType<typeof mount>) => {
    return wrapper.findAll('.origam-pagination__item button')
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('OrigamPagination — rendering', () => {
    it('has origam-pagination base class', () => {
        const wrapper = mountPagination()
        expect(wrapper.classes()).toContain('origam-pagination')
        wrapper.unmount()
    })

    it('renders a page list', () => {
        const wrapper = mountPagination({ length: 5, totalVisible: 5 })
        expect(wrapper.find('.origam-pagination__list').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders prev and next navigation buttons', () => {
        const wrapper = mountPagination()
        expect(wrapper.find('.origam-pagination__prev').exists()).toBe(true)
        expect(wrapper.find('.origam-pagination__next').exists()).toBe(true)
        wrapper.unmount()
    })
})

describe('OrigamPagination — page selection', () => {
    it('marks the current page button as active', () => {
        const wrapper = mountPagination({ modelValue: 3, length: 5, totalVisible: 5 })
        const pageButtons = getPageButtons(wrapper)
        // Page 3 is at index 2 (zero-indexed)
        expect(pageButtons[2].attributes('data-active')).toBe('true')
        wrapper.unmount()
    })

    it('emits update:modelValue when a page button is clicked', async () => {
        const wrapper = mountPagination({ modelValue: 1, length: 5, totalVisible: 5 })
        const pageButtons = getPageButtons(wrapper)
        // Click on page 3 (index 2)
        await pageButtons[2].trigger('click')
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual([3])
        wrapper.unmount()
    })

    it('active page item has --is-active class', () => {
        const wrapper = mountPagination({ modelValue: 2, length: 5, totalVisible: 5 })
        const items = wrapper.findAll('.origam-pagination__item')
        expect(items[1].classes()).toContain('origam-pagination__item--is-active')
        wrapper.unmount()
    })
})

describe('OrigamPagination — navigation controls', () => {
    it('prev button is disabled when on the first page', () => {
        const wrapper = mountPagination({ modelValue: 1 })
        const prevBtn = wrapper.find('.origam-pagination__prev button')
        expect(prevBtn.attributes('disabled')).toBeDefined()
        wrapper.unmount()
    })

    it('next button is disabled when on the last page', () => {
        const wrapper = mountPagination({ modelValue: 10, length: 10 })
        const nextBtn = wrapper.find('.origam-pagination__next button')
        expect(nextBtn.attributes('disabled')).toBeDefined()
        wrapper.unmount()
    })

    it('prev button is NOT disabled when not on the first page', () => {
        const wrapper = mountPagination({ modelValue: 5, length: 10 })
        const prevBtn = wrapper.find('.origam-pagination__prev button')
        expect(prevBtn.attributes('disabled')).toBeUndefined()
        wrapper.unmount()
    })

    it('next button is NOT disabled when not on the last page', () => {
        const wrapper = mountPagination({ modelValue: 5, length: 10 })
        const nextBtn = wrapper.find('.origam-pagination__next button')
        expect(nextBtn.attributes('disabled')).toBeUndefined()
        wrapper.unmount()
    })

    it('clicking next emits update:modelValue with page+1 and the "next" named event', async () => {
        const wrapper = mountPagination({ modelValue: 3, length: 10 })
        await wrapper.find('.origam-pagination__next button').trigger('click')
        await nextTick()

        const modelEmit = wrapper.emitted('update:modelValue')
        expect(modelEmit).toBeTruthy()
        expect(modelEmit![0]).toEqual([4])

        const nextEmit = wrapper.emitted('next')
        expect(nextEmit).toBeTruthy()
        expect(nextEmit![0]).toEqual([4])
        wrapper.unmount()
    })

    it('clicking prev emits update:modelValue with page-1 and the "prev" named event', async () => {
        const wrapper = mountPagination({ modelValue: 5, length: 10 })
        await wrapper.find('.origam-pagination__prev button').trigger('click')
        await nextTick()

        const modelEmit = wrapper.emitted('update:modelValue')
        expect(modelEmit).toBeTruthy()
        expect(modelEmit![0]).toEqual([4])

        const prevEmit = wrapper.emitted('prev')
        expect(prevEmit).toBeTruthy()
        expect(prevEmit![0]).toEqual([4])
        wrapper.unmount()
    })
})

describe('OrigamPagination — showFirstLastPage', () => {
    it('does NOT render first/last buttons by default', () => {
        const wrapper = mountPagination()
        expect(wrapper.find('.origam-pagination__first').exists()).toBe(false)
        expect(wrapper.find('.origam-pagination__last').exists()).toBe(false)
        wrapper.unmount()
    })

    it('renders first/last buttons when showFirstLastPage=true', () => {
        const wrapper = mountPagination({ showFirstLastPage: true })
        expect(wrapper.find('.origam-pagination__first').exists()).toBe(true)
        expect(wrapper.find('.origam-pagination__last').exists()).toBe(true)
        wrapper.unmount()
    })

    it('clicking last button emits update:modelValue=length and "last" event', async () => {
        const wrapper = mountPagination({ modelValue: 1, length: 10, showFirstLastPage: true })
        await wrapper.find('.origam-pagination__last button').trigger('click')
        await nextTick()

        const modelEmit = wrapper.emitted('update:modelValue')
        expect(modelEmit).toBeTruthy()
        expect(modelEmit![0]).toEqual([10])

        const lastEmit = wrapper.emitted('last')
        expect(lastEmit).toBeTruthy()
        wrapper.unmount()
    })

    it('clicking first button emits update:modelValue=start and "first" event', async () => {
        const wrapper = mountPagination({ modelValue: 8, length: 10, showFirstLastPage: true })
        await wrapper.find('.origam-pagination__first button').trigger('click')
        await nextTick()

        const modelEmit = wrapper.emitted('update:modelValue')
        expect(modelEmit).toBeTruthy()
        expect(modelEmit![0]).toEqual([1])

        const firstEmit = wrapper.emitted('first')
        expect(firstEmit).toBeTruthy()
        wrapper.unmount()
    })
})

describe('OrigamPagination — keyboard navigation', () => {
    it('ArrowRight advances to the next page', async () => {
        const wrapper = mountPagination({ modelValue: 3, length: 10 })
        await wrapper.trigger('keydown', { key: 'ArrowRight' })
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual([4])
        wrapper.unmount()
    })

    it('ArrowLeft goes to the previous page', async () => {
        const wrapper = mountPagination({ modelValue: 5, length: 10 })
        await wrapper.trigger('keydown', { key: 'ArrowLeft' })
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual([4])
        wrapper.unmount()
    })

    it('ArrowRight does nothing when on the last page', async () => {
        const wrapper = mountPagination({ modelValue: 10, length: 10 })
        await wrapper.trigger('keydown', { key: 'ArrowRight' })
        await nextTick()

        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
        wrapper.unmount()
    })

    it('ArrowLeft does nothing when on the first page', async () => {
        const wrapper = mountPagination({ modelValue: 1, length: 10 })
        await wrapper.trigger('keydown', { key: 'ArrowLeft' })
        await nextTick()

        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
        wrapper.unmount()
    })

    it('arrow keys do nothing when disabled', async () => {
        const wrapper = mountPagination({ modelValue: 5, length: 10, disabled: true })
        await wrapper.trigger('keydown', { key: 'ArrowRight' })
        await nextTick()
        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
        wrapper.unmount()
    })
})

describe('OrigamPagination — ellipsis', () => {
    it('renders ellipsis buttons when totalVisible is small relative to length', () => {
        // 10 pages, only 7 visible — should produce ellipsis
        const wrapper = mountPagination({ modelValue: 5, length: 10, totalVisible: 7 })
        const ellipsisItems = wrapper.findAll('[data-ellipsis="true"]')
        expect(ellipsisItems.length).toBeGreaterThan(0)
        wrapper.unmount()
    })

    it('ellipsis buttons are disabled', () => {
        const wrapper = mountPagination({ modelValue: 5, length: 10, totalVisible: 7 })
        const ellipsisItems = wrapper.findAll('[data-ellipsis="true"]')
        ellipsisItems.forEach(el => {
            expect(el.attributes('disabled')).toBeDefined()
        })
        wrapper.unmount()
    })
})

describe('OrigamPagination — compact mode', () => {
    it('renders compact list instead of full page list when compact=true', () => {
        const wrapper = mountPagination({ compact: true })
        expect(wrapper.find('.origam-pagination__list--compact').exists()).toBe(true)
        expect(wrapper.find('.origam-pagination__item').exists()).toBe(false)
        wrapper.unmount()
    })

    it('adds origam-pagination--compact class when compact=true', () => {
        const wrapper = mountPagination({ compact: true })
        expect(wrapper.classes()).toContain('origam-pagination--compact')
        wrapper.unmount()
    })

    it('renders a number input in compact mode', () => {
        const wrapper = mountPagination({ compact: true })
        expect(wrapper.find('input[type="number"]').exists()).toBe(true)
        wrapper.unmount()
    })

    it('compact input is disabled when disabled=true', () => {
        const wrapper = mountPagination({ compact: true, disabled: true })
        const input = wrapper.find('input[type="number"]')
        expect(input.attributes('disabled')).toBeDefined()
        wrapper.unmount()
    })

    it('compact input change updates the page within bounds', async () => {
        const wrapper = mountPagination({ compact: true, modelValue: 1, length: 10 })
        const input = wrapper.find('input[type="number"]') as any
        await input.setValue('5')
        await input.trigger('change')
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual([5])
        wrapper.unmount()
    })

    it('compact input clamps value above max to length', async () => {
        const wrapper = mountPagination({ compact: true, modelValue: 1, length: 10 })
        const input = wrapper.find('input[type="number"]') as any
        await input.setValue('999')
        await input.trigger('change')
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual([10])
        wrapper.unmount()
    })

    it('compact input clamps value below min to start', async () => {
        const wrapper = mountPagination({ compact: true, modelValue: 5, length: 10 })
        const input = wrapper.find('input[type="number"]') as any
        await input.setValue('-5')
        await input.trigger('change')
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual([1])
        wrapper.unmount()
    })
})

describe('OrigamPagination — withInfo mode', () => {
    it('adds origam-pagination--with-info class when withInfo=true', () => {
        const wrapper = mountPagination({ withInfo: true, total: 100, perPage: 10 })
        expect(wrapper.classes()).toContain('origam-pagination--with-info')
        wrapper.unmount()
    })

    it('renders the info span when withInfo=true', () => {
        const wrapper = mountPagination({ withInfo: true, total: 100, perPage: 10 })
        expect(wrapper.find('.origam-pagination__info').exists()).toBe(true)
        wrapper.unmount()
    })

    it('does NOT render .origam-pagination__info when withInfo=false (default)', () => {
        const wrapper = mountPagination()
        expect(wrapper.find('.origam-pagination__info').exists()).toBe(false)
        wrapper.unmount()
    })
})

describe('OrigamPagination — colored mode', () => {
    it('adds origam-pagination--colored when color prop is set', () => {
        const wrapper = mountPagination({ color: 'primary' })
        expect(wrapper.classes()).toContain('origam-pagination--colored')
        wrapper.unmount()
    })

    it('adds origam-pagination--colored when bgColor prop is set', () => {
        const wrapper = mountPagination({ bgColor: 'primary' })
        expect(wrapper.classes()).toContain('origam-pagination--colored')
        wrapper.unmount()
    })

    it('does NOT have origam-pagination--colored when no color', () => {
        const wrapper = mountPagination()
        expect(wrapper.classes()).not.toContain('origam-pagination--colored')
        wrapper.unmount()
    })
})

describe('OrigamPagination — disabled state', () => {
    it('all page buttons are disabled when disabled=true', () => {
        const wrapper = mountPagination({ disabled: true, modelValue: 1, length: 5, totalVisible: 5 })
        const pageButtons = getPageButtons(wrapper)
        pageButtons.forEach(btn => {
            expect(btn.attributes('disabled')).toBeDefined()
        })
        wrapper.unmount()
    })
})

describe('OrigamPagination — typography (withInfo info surface)', () => {
    it('sets --origam-pagination--info---font-size when fontSize prop is passed', () => {
        const wrapper = mountPagination({ withInfo: true, total: 100, fontSize: 'xl' })
        const info = wrapper.find('.origam-pagination__info')
        expect(info.exists()).toBe(true)
        expect((info.element as HTMLElement).style.getPropertyValue('--origam-pagination--info---font-size'))
            .toBe('var(--origam-font__size---xl)')
        wrapper.unmount()
    })

    it('sets --origam-pagination--info---font-weight when fontWeight prop is passed', () => {
        const wrapper = mountPagination({ withInfo: true, total: 100, fontWeight: 'bold' })
        const info = wrapper.find('.origam-pagination__info')
        expect(info.exists()).toBe(true)
        expect((info.element as HTMLElement).style.getPropertyValue('--origam-pagination--info---font-weight'))
            .toBe('var(--origam-font__weight---bold)')
        wrapper.unmount()
    })
})

describe('OrigamPagination — withInfo range computation', () => {
    it('shows correct start=1 end=10 for page 1 with perPage=10', () => {
        let slotProps: any = null
        const wrapper = mount(OrigamPagination, {
            props: { modelValue: 1, length: 5, withInfo: true, total: 43, perPage: 10 },
            slots: {
                info: (props: any) => {
                    slotProps = props
                    return h('span')
                }
            },
            attachTo: document.body,
            global: makeGlobal()
        })

        expect(slotProps).not.toBeNull()
        expect(slotProps.start).toBe(1)
        expect(slotProps.end).toBe(10)
        expect(slotProps.total).toBe(43)
        wrapper.unmount()
    })

    it('clamps end to total on the last page', () => {
        let slotProps: any = null
        const wrapper = mount(OrigamPagination, {
            props: { modelValue: 5, length: 5, withInfo: true, total: 43, perPage: 10 },
            slots: {
                info: (props: any) => {
                    slotProps = props
                    return h('span')
                }
            },
            attachTo: document.body,
            global: makeGlobal()
        })

        expect(slotProps.start).toBe(41)
        expect(slotProps.end).toBe(43) // clamped to total, not 50
        wrapper.unmount()
    })
})
