// Regression coverage for #372 / #375 — the consumer-supplied `id` prop must
// reach the real DOM node, and no template may read `props.id` when the bare
// `id` binding is available and unambiguous.
//
// #372 measured (via `packages/tests/audit/id-forwarding-sweep.spec.ts`) that
// 10 components declared `id` as a prop and silently dropped it:
//   - OrigamAvatarGroup, OrigamDataList, OrigamDatePickerMonth, OrigamForm,
//     OrigamChartPictorial, OrigamInlineEdit: `useStyle(...)` was called
//     without `() => props.id` (or, for InlineEdit, `:id` was simply never
//     bound), so the root element never carried the consumer's id.
//   - OrigamCommandPalette: id was never bound on the dialog root at all.
//   - OrigamSelect: `id` was explicitly EXCLUDED from the props forwarded to
//     the underlying `<origam-text-field>` (`filterProps(props, [..., 'id',
//     ...])`) and never re-bound explicitly, so it reached nowhere.
//   - OrigamRatingFieldItem: a LOCAL `id` computed (`${name}-${value}`, used
//     for the `<label for>` / `<input id>` pairing) silently shadowed
//     `props.id` — the exact "homonym" blind spot #372 documents.
//
// #375 measured 18 `props.` occurrences inside `<template>` blocks (12
// components) — a lint rule violation. Two of them (`OrigamMessages`,
// `OrigamListItem`) used `:id="props.id"` specifically to dodge a homonym
// collision with a local `id` (respectively from `useStyle` and from the
// nested-item registration key) — those two are covered here too, to prove
// the id still reaches the DOM after the rewrite to a bare, unambiguous
// binding (`:id="id"` / `:id="styleId"`).
//
// OrigamField and OrigamCommandPalette (closed) were also flagged "lost" by
// the isolated-mount sweep, but verified CORRECT by targeted mounts run
// during triage (not committed as specs — see PR description): Field
// delegates the id to whatever real control fills its `default` slot (only
// reachable via TextField/Select/etc., not when Field is mounted bare), and
// CommandPalette's dialog is gated by `v-if="isActive"` — false by default,
// so the sweep's isolated mount (which never opens it) can't see the id
// that *is* bound on that node. Both are exercised here in a REALISTIC
// composition instead of isolation.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamAvatarGroup from '@origam/components/Avatar/OrigamAvatarGroup.vue'
import OrigamChartPictorial from '@origam/components/Chart/OrigamChartPictorial.vue'
import OrigamCommandPalette from '@origam/components/CommandPalette/OrigamCommandPalette.vue'
import OrigamDataList from '@origam/components/DataList/OrigamDataList.vue'
import OrigamDatePickerMonth from '@origam/components/DatePicker/OrigamDatePickerMonth.vue'
import OrigamField from '@origam/components/Field/OrigamField.vue'
import OrigamForm from '@origam/components/Form/OrigamForm.vue'
import OrigamInlineEdit from '@origam/components/InlineEdit/OrigamInlineEdit.vue'
import OrigamListItem from '@origam/components/List/OrigamListItem.vue'
import OrigamMessages from '@origam/components/Messages/OrigamMessages.vue'
import OrigamRatingFieldItem from '@origam/components/RatingField/OrigamRatingFieldItem.vue'
import OrigamSelect from '@origam/components/Select/OrigamSelect.vue'
import OrigamTextField from '@origam/components/TextField/OrigamTextField.vue'

import { createOrigam } from '@origam/origam'

const SENTINEL = 'origam-test-sentinel-id'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = vi.fn()

global.ResizeObserver = vi.fn(class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}) as never
global.IntersectionObserver = vi.fn(class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}) as never

function plugins () {
    return { plugins: [createOrigam()], stubs: { teleport: true, transition: false } }
}

describe('#372 — id forwarding, root-binding fixes', () => {
    it('OrigamAvatarGroup binds the consumer id on its root', () => {
        const wrapper = mount(OrigamAvatarGroup, { props: { id: SENTINEL }, global: plugins() })
        expect(wrapper.element.getAttribute('id')).toBe(SENTINEL)
    })

    it('OrigamDataList binds the consumer id on its root <dl>', () => {
        const wrapper = mount(OrigamDataList, { props: { id: SENTINEL }, global: plugins() })
        expect(wrapper.element.getAttribute('id')).toBe(SENTINEL)
    })

    it('OrigamDatePickerMonth binds the consumer id on its root', () => {
        const wrapper = mount(OrigamDatePickerMonth, { props: { id: SENTINEL }, global: plugins() })
        expect(wrapper.element.getAttribute('id')).toBe(SENTINEL)
    })

    it('OrigamForm binds the consumer id on its <form> root', () => {
        const wrapper = mount(OrigamForm, { props: { id: SENTINEL }, global: plugins() })
        expect(wrapper.element.getAttribute('id')).toBe(SENTINEL)
    })

    it('OrigamChartPictorial binds the consumer id on its root', () => {
        const wrapper = mount(OrigamChartPictorial, { props: { id: SENTINEL, series: [] }, global: plugins() })
        expect(wrapper.element.getAttribute('id')).toBe(SENTINEL)
    })

    it('OrigamInlineEdit binds the consumer id on its root', () => {
        const wrapper = mount(OrigamInlineEdit, { props: { id: SENTINEL, modelValue: '' }, global: plugins() })
        expect(wrapper.element.getAttribute('id')).toBe(SENTINEL)
    })
})

describe('#372 — id forwarding, homonym-shadow fix', () => {
    it('OrigamRatingFieldItem: an explicit id wins over the per-item generated one', () => {
        const wrapper = mount(OrigamRatingFieldItem, {
            props: { id: SENTINEL, name: 'stars', value: 3 },
            global: plugins()
        })
        const input = wrapper.find('input')
        expect(input.attributes('id')).toBe(SENTINEL)
        expect(wrapper.find('label').attributes('for')).toBe(SENTINEL)
    })

    it('OrigamRatingFieldItem: falls back to the generated id when none is passed (no regression)', () => {
        const wrapper = mount(OrigamRatingFieldItem, {
            props: { name: 'stars', value: 3 },
            global: plugins()
        })
        const input = wrapper.find('input')
        expect(input.attributes('id')).toBe('stars-3')
    })
})

describe('#372 — id forwarding, dropped-on-delegation fix', () => {
    it('OrigamSelect eventually forwards the consumer id to the underlying control', async () => {
        const wrapper = mount(OrigamSelect, { props: { id: SENTINEL, items: [] }, global: plugins() })
        await nextTick()
        await nextTick()
        expect(wrapper.html()).toContain(SENTINEL)
    })
})

describe('#372 — id forwarding, verified via realistic composition (audit false positives)', () => {
    it('OrigamField: the id lands on the real control rendered through TextField, not the wrapper', async () => {
        const wrapper = mount(OrigamTextField, { props: { id: SENTINEL }, global: plugins() })
        await nextTick()
        await nextTick()
        const input = wrapper.find('input')
        expect(input.exists()).toBe(true)
        expect(input.attributes('id')).toBe(SENTINEL)
    })

    it('OrigamCommandPalette: the id lands on the dialog root once it is open', async () => {
        const wrapper = mount(OrigamCommandPalette, {
            props: { id: SENTINEL, modelValue: true },
            global: plugins()
        })
        await nextTick()
        await nextTick()
        expect(wrapper.html()).toContain(SENTINEL)
    })
})

describe('#375 — props. removed from templates, id forwarding preserved', () => {
    it('OrigamMessages: still binds id on its root after switching to the bare `id`', () => {
        const wrapper = mount(OrigamMessages, { props: { id: SENTINEL, messages: ['x'] }, global: plugins() })
        expect(wrapper.element.getAttribute('id')).toBe(SENTINEL)
    })

    it('OrigamListItem: still binds id on its root after switching to `styleId` (the nested-item registration key is untouched)', () => {
        const wrapper = mount(OrigamListItem, { props: { id: SENTINEL, title: 'Item' }, global: plugins() })
        expect(wrapper.element.getAttribute('id')).toBe(SENTINEL)
    })
})
