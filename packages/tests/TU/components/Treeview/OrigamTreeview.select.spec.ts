// Unit tests for <OrigamTreeview> / <OrigamTreeviewNode> — selection matrix
//
// Context: `selectMode` (TTreeviewSelectMode = 'single' | 'multiple' | 'none')
// and `selectableNodes` (TTreeviewSelectableNodes = 'leaf' | 'all') were
// recently re-derived from `TREEVIEW_SELECT_MODE` / `TREEVIEW_SELECTABLE_NODES`
// enums. Neither prop had a dedicated spec before this file. A member-value
// swap inside either enum is invisible to the type-checker ('leaf' and
// TREEVIEW_SELECTABLE_NODES.LEAF are the same TS type) and would not fail
// any existing test — it would only be caught by asserting REAL DOM/emit
// behaviour for each raw prop value, which is what this file does.
//
// Strategy: mount the real (non-stubbed) OrigamTreeview + OrigamTreeviewNode
// tree, click rows by their `data-cy="treeview-row-{id}"` selector, and
// assert on:
//   - `wrapper.emitted('update:modelValue')` payloads
//   - `aria-selected` / `origam-treeview-node__row--selected` in the DOM
//
// Fixture tree:
//   branch-1 (expandable, expanded via expandedValue)
//     leaf-1
//     leaf-2
//   leaf-3

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import OrigamTreeview from '@origam/components/Treeview/OrigamTreeview.vue'
import type { ITreeviewNode } from '@origam/interfaces'
import { createOrigam } from '@origam/origam'

const ITEMS: ITreeviewNode[] = [
    {
        id: 'branch-1',
        label: 'Branch 1',
        children: [
            { id: 'leaf-1', label: 'Leaf 1' },
            { id: 'leaf-2', label: 'Leaf 2' }
        ]
    },
    { id: 'leaf-3', label: 'Leaf 3' }
]

const mountTreeview = (props: Record<string, any> = {}) =>
    mount(OrigamTreeview, {
        props: {
            items: ITEMS,
            expandedValue: ['branch-1'],
            ...props
        },
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })

const row = (wrapper: ReturnType<typeof mountTreeview>, id: string) =>
    wrapper.find(`[data-cy="treeview-row-${id}"]`)

// ---------------------------------------------------------------------------
// selectMode = 'none' — nothing is ever selectable, regardless of selectableNodes
// ---------------------------------------------------------------------------
describe('OrigamTreeview — selectMode="none"', () => {
    it('does not select a leaf on click, and does not emit update:modelValue (selectableNodes="leaf")', async () => {
        const wrapper = mountTreeview({ selectMode: 'none', selectableNodes: 'leaf' })
        await row(wrapper, 'leaf-1').trigger('click')

        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
        expect(row(wrapper, 'leaf-1').attributes('aria-selected')).toBeUndefined()
        expect(row(wrapper, 'leaf-1').classes()).not.toContain('origam-treeview-node__row--selected')
        wrapper.unmount()
    })

    it('does not select a branch on click either (selectableNodes="all")', async () => {
        const wrapper = mountTreeview({ selectMode: 'none', selectableNodes: 'all' })
        await row(wrapper, 'branch-1').trigger('click')

        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
        expect(row(wrapper, 'branch-1').attributes('aria-selected')).toBeUndefined()
        wrapper.unmount()
    })

    it('does not set aria-multiselectable on the root', () => {
        const wrapper = mountTreeview({ selectMode: 'none' })
        expect(wrapper.attributes('aria-multiselectable')).toBeUndefined()
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// selectMode = 'single' × selectableNodes = 'leaf'
// ---------------------------------------------------------------------------
describe('OrigamTreeview — selectMode="single", selectableNodes="leaf"', () => {
    it('selects a leaf on click and emits its id as a single string', async () => {
        const wrapper = mountTreeview({ selectMode: 'single', selectableNodes: 'leaf' })
        await row(wrapper, 'leaf-1').trigger('click')

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual(['leaf-1'])
        expect(row(wrapper, 'leaf-1').attributes('aria-selected')).toBe('true')
        expect(row(wrapper, 'leaf-1').classes()).toContain('origam-treeview-node__row--selected')
        wrapper.unmount()
    })

    it('does NOT select a branch node on click (only leaves are selectable)', async () => {
        const wrapper = mountTreeview({ selectMode: 'single', selectableNodes: 'leaf' })
        await row(wrapper, 'branch-1').trigger('click')

        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
        expect(row(wrapper, 'branch-1').attributes('aria-selected')).toBeUndefined()
        wrapper.unmount()
    })

    it('selecting a second leaf replaces the first (single selection)', async () => {
        const wrapper = mountTreeview({ selectMode: 'single', selectableNodes: 'leaf' })
        await row(wrapper, 'leaf-1').trigger('click')
        await row(wrapper, 'leaf-2').trigger('click')

        const emitted = wrapper.emitted('update:modelValue')!
        expect(emitted[emitted.length - 1]).toEqual(['leaf-2'])
        expect(row(wrapper, 'leaf-1').attributes('aria-selected')).toBe('false')
        expect(row(wrapper, 'leaf-2').attributes('aria-selected')).toBe('true')
        wrapper.unmount()
    })

    it('clicking the selected leaf again clears the selection (toggle off)', async () => {
        const wrapper = mountTreeview({ selectMode: 'single', selectableNodes: 'leaf' })
        await row(wrapper, 'leaf-1').trigger('click')
        await row(wrapper, 'leaf-1').trigger('click')

        const emitted = wrapper.emitted('update:modelValue')!
        expect(emitted[emitted.length - 1]).toEqual([''])
        expect(row(wrapper, 'leaf-1').attributes('aria-selected')).toBe('false')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// selectMode = 'single' × selectableNodes = 'all'
// ---------------------------------------------------------------------------
describe('OrigamTreeview — selectMode="single", selectableNodes="all"', () => {
    it('selects a branch node on click (branch nodes are selectable when selectableNodes="all")', async () => {
        const wrapper = mountTreeview({ selectMode: 'single', selectableNodes: 'all' })
        await row(wrapper, 'branch-1').trigger('click')

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual(['branch-1'])
        expect(row(wrapper, 'branch-1').attributes('aria-selected')).toBe('true')
        wrapper.unmount()
    })

    it('selecting a leaf after a branch swaps the selection (still single)', async () => {
        const wrapper = mountTreeview({ selectMode: 'single', selectableNodes: 'all' })
        await row(wrapper, 'branch-1').trigger('click')
        await row(wrapper, 'leaf-1').trigger('click')

        expect(row(wrapper, 'branch-1').attributes('aria-selected')).toBe('false')
        expect(row(wrapper, 'leaf-1').attributes('aria-selected')).toBe('true')
        const emitted = wrapper.emitted('update:modelValue')!
        expect(emitted[emitted.length - 1]).toEqual(['leaf-1'])
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// selectMode = 'multiple' × selectableNodes = 'leaf'
// ---------------------------------------------------------------------------
describe('OrigamTreeview — selectMode="multiple", selectableNodes="leaf"', () => {
    it('sets aria-multiselectable="true" on the root', () => {
        const wrapper = mountTreeview({ selectMode: 'multiple', selectableNodes: 'leaf' })
        expect(wrapper.attributes('aria-multiselectable')).toBe('true')
        wrapper.unmount()
    })

    it('accumulates leaf selections into an array', async () => {
        const wrapper = mountTreeview({ selectMode: 'multiple', selectableNodes: 'leaf' })
        await row(wrapper, 'leaf-1').trigger('click')
        await row(wrapper, 'leaf-3').trigger('click')

        const emitted = wrapper.emitted('update:modelValue')!
        expect(emitted[emitted.length - 1]).toEqual([['leaf-1', 'leaf-3']])
        expect(row(wrapper, 'leaf-1').attributes('aria-selected')).toBe('true')
        expect(row(wrapper, 'leaf-3').attributes('aria-selected')).toBe('true')
        wrapper.unmount()
    })

    it('does NOT select a branch node on click (only leaves are selectable)', async () => {
        const wrapper = mountTreeview({ selectMode: 'multiple', selectableNodes: 'leaf' })
        await row(wrapper, 'branch-1').trigger('click')

        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
        expect(row(wrapper, 'branch-1').attributes('aria-selected')).toBeUndefined()
        wrapper.unmount()
    })

    it('clicking a selected leaf again removes just that leaf from the set', async () => {
        const wrapper = mountTreeview({ selectMode: 'multiple', selectableNodes: 'leaf' })
        await row(wrapper, 'leaf-1').trigger('click')
        await row(wrapper, 'leaf-2').trigger('click')
        await row(wrapper, 'leaf-1').trigger('click')

        const emitted = wrapper.emitted('update:modelValue')!
        expect(emitted[emitted.length - 1]).toEqual([['leaf-2']])
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// selectMode = 'multiple' × selectableNodes = 'all'
// ---------------------------------------------------------------------------
describe('OrigamTreeview — selectMode="multiple", selectableNodes="all"', () => {
    it('selects both a leaf and a branch node into the same array', async () => {
        const wrapper = mountTreeview({ selectMode: 'multiple', selectableNodes: 'all' })
        await row(wrapper, 'branch-1').trigger('click')
        await row(wrapper, 'leaf-1').trigger('click')

        const emitted = wrapper.emitted('update:modelValue')!
        expect(emitted[emitted.length - 1]).toEqual([['branch-1', 'leaf-1']])
        expect(row(wrapper, 'branch-1').attributes('aria-selected')).toBe('true')
        expect(row(wrapper, 'leaf-1').attributes('aria-selected')).toBe('true')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// disabled nodes are never selectable, whatever the mode
// ---------------------------------------------------------------------------
describe('OrigamTreeview — disabled nodes', () => {
    it('a disabled leaf is never selectable, even with selectMode="multiple" / selectableNodes="all"', async () => {
        const wrapper = mountTreeview({
            items: [
                { id: 'branch-1', label: 'Branch 1', children: [{ id: 'leaf-1', label: 'Leaf 1', disabled: true }] }
            ],
            expandedValue: ['branch-1'],
            selectMode: 'multiple',
            selectableNodes: 'all'
        })
        await row(wrapper, 'leaf-1').trigger('click')

        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
        wrapper.unmount()
    })
})
