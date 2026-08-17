// Unit tests for <OrigamMenu> — useDefaults wiring (issue #242)
//
// Strategy: OrigamMenu composes OrigamOverlay (teleported, Floating-UI
// positioning). jsdom has no real layout engine so the real
// `locationStrategy` resolution throws — stub OrigamOverlay the same way
// OrigamDialog.spec.ts does: a transparent pass-through honouring
// modelValue and rendering the default slot. That's enough to render
// OrigamMenu's own `.origam-menu__content` (a BEM child OrigamMenu renders
// itself, not something the overlay owns).
//
// OrigamMenu did not call useDefaults() so any theme config targeting
// `origam-menu` (rounded, border, elevation, …) was a silent no-op — this
// locks the mechanism by asserting the un-passed prop resolves to a
// measurable class on `.origam-menu__content` (never the teleport root,
// per the DS's classes-first convention).

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'

import OrigamMenu from '@origam/components/Menu/OrigamMenu.vue'
import { createOrigam } from '@origam/origam'

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

// Mirrors OrigamDialog.spec.ts's OrigamOverlayStub — transparent pass-through
// so Menu's own `filterProps`/refs calls don't crash.
const OrigamOverlayStub = defineComponent({
    name: 'OrigamOverlay',
    props: {
        modelValue: { type: Boolean, default: false },
        class: [String, Array, Object],
        style: [String, Array, Object]
    },
    emits: ['update:modelValue'],
    setup(props, { slots, expose }) {
        const contentEl = ref<HTMLElement | null>(null)
        const activatorEl = ref<HTMLElement | null>(null)
        const globalTop = ref(true)
        expose({
            filterProps: (_props: unknown, _excludes?: string[]) => ({}),
            contentEl,
            activatorEl,
            globalTop
        })
        return () => h('div', { 'data-stub': 'overlay', class: props.class }, [
            slots.activator?.({ props: {} }),
            props.modelValue ? slots.default?.() : null
        ])
    }
})

const makeGlobal = (plugins: unknown[]) => ({
    plugins,
    stubs: {
        OrigamOverlay: OrigamOverlayStub,
        OrigamTranslateScale: { template: '<div><slot/></div>' }
    }
})

async function mountMenuThemed(componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
    const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-menu': componentDefaults }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
    const wrapper = mount(OrigamMenu, {
        props: { modelValue: true, ...props } as never,
        attachTo: document.body,
        global: makeGlobal([origam])
    })
    await nextTick()
    return wrapper
}

describe('OrigamMenu — useDefaults (theme components wiring)', () => {
    it('resolves rounded="lg" from theme.components[\'origam-menu\'] on the __content BEM-child (not the teleport root)', async () => {
        const wrapper = await mountMenuThemed({ rounded: 'lg' })
        const content = wrapper.find('.origam-menu__content')
        expect(content.exists()).toBe(true)
        expect(content.classes()).toContain('origam--rounded-lg')
    })

    it('resolves border=true from theme.components[\'origam-menu\'] when not passed', async () => {
        const wrapper = await mountMenuThemed({ border: true })
        const content = wrapper.find('.origam-menu__content')
        expect(content.classes()).toContain('origam-menu--border')
    })

    it('an explicitly passed rounded prop overrides the theme default', async () => {
        const wrapper = await mountMenuThemed({ rounded: 'lg' }, { rounded: 'sm' })
        const content = wrapper.find('.origam-menu__content')
        expect(content.classes()).toContain('origam--rounded-sm')
        expect(content.classes()).not.toContain('origam--rounded-lg')
    })
})

// ---------------------------------------------------------------------------
// BUG 4 regression — nested items via `itemChildren`
// ---------------------------------------------------------------------------
//
// `hasChilds(item)` used to hardcode `item?.items`, ignoring
// `props.itemChildren` (defaulted to `'children'`, matching `OrigamList`).
// A row nesting its children under `children` — e.g. `OrigamMediaController`
// 's real `configMenuItems` — was never detected as having children, so no
// nested `<origam-menu>` ever rendered for it; the row behaved like a plain
// leaf item instead.
//
// A second, related defect: spreading the raw item object onto the nested
// `<origam-menu>` / its activator `<origam-list-item>` leaked the resolved
// `itemChildren` key (`children`) as a fallthrough DOM attribute, colliding
// with the browser's own read-only `Element.children` — jsdom enforces the
// same read-only getter as real browsers, so this throws a real
// `TypeError` during mount, not just a console warning.
async function mountMenuWithItems(items: Array<Record<string, unknown>>) {
    const origam = createOrigam()
    const wrapper = mount(OrigamMenu, {
        props: { modelValue: true, items } as never,
        attachTo: document.body,
        global: makeGlobal([origam])
    })
    await nextTick()
    return wrapper
}

describe('OrigamMenu — nested items via itemChildren (BUG 4 regression)', () => {
    const items = [
        {
            title: 'File',
            children: [
                { title: 'New' },
                { title: 'Open' }
            ]
        },
        { title: 'Settings' }
    ]

    it('mounts without throwing (no "children" fallthrough-attribute collision with the DOM)', async () => {
        await expect(mountMenuWithItems(items)).resolves.toBeDefined()
    })

    it('renders a nested overlay/menu structure for the children-bearing row, not just a flat list item', async () => {
        const wrapper = await mountMenuWithItems(items)
        // Outer menu contributes one overlay stub; the "File" row — now
        // correctly detected as having children — contributes a SECOND,
        // nested one for its own <origam-menu>. Pre-fix, only the outer
        // stub existed (count === 1) because `hasChilds()` never matched.
        const overlayStubs = wrapper.findAll('[data-stub="overlay"]')
        expect(overlayStubs.length).toBe(2)
    })

    it('the flat row ("Settings") renders as a plain .origam-menu__item with no nested overlay', async () => {
        const wrapper = await mountMenuWithItems(items)
        const settingsItem = wrapper.findAll('.origam-menu__item')
            .find(item => item.text().includes('Settings'))
        expect(settingsItem).toBeDefined()
        // The flat item itself must not contain a nested overlay stub.
        expect(settingsItem!.findAll('[data-stub="overlay"]')).toHaveLength(0)
    })

    it('the children-bearing row still renders its own title text ("File") as the submenu activator', async () => {
        const wrapper = await mountMenuWithItems(items)
        expect(wrapper.text()).toContain('File')
    })

    it('a row with an empty children array behaves as a flat leaf item (no nested overlay)', async () => {
        const wrapper = await mountMenuWithItems([{ title: 'Empty', children: [] }])
        expect(wrapper.findAll('[data-stub="overlay"]')).toHaveLength(1)
    })

    it('respects a custom itemChildren key when the DS default ("children") is not used', async () => {
        const wrapper = await (async () => {
            const origam = createOrigam()
            const w = mount(OrigamMenu, {
                props: {
                    modelValue: true,
                    itemChildren: 'kids',
                    items: [{ title: 'Parent', kids: [{ title: 'Child' }] }]
                } as never,
                attachTo: document.body,
                global: makeGlobal([origam])
            })
            await nextTick()
            return w
        })()

        expect(wrapper.findAll('[data-stub="overlay"]')).toHaveLength(2)
    })
})

// ---------------------------------------------------------------------------
// `select` emit — the item-picked notification channel
// ---------------------------------------------------------------------------
//
// `<origam-menu :items="…">` renders its rows itself, so the consumer never
// touches the `<origam-list-item>` that receives the click. Without a `select`
// emit the ONLY way to learn which row was picked is to hang an `onClick` on
// every single item object — which `OrigamMediaController` was forced to do
// (see its `configMenuItems` factory) while ALSO carrying a `@select` listener
// that could never fire: `select` was absent from `IMenuEmits`, so Vue routed
// `onSelect` to the overlay root as a plain fallthrough attribute, where it
// only ever answered the native DOM `select` event (text selection).
//
// Each case mounts its own wrapper — no state is shared between them.
describe('OrigamMenu — select emit', () => {
    it('emits `select` when a leaf item row is clicked', async () => {
        const wrapper = await mountMenuWithItems([{ title: 'Leaf', key: 'leaf', value: 1 }])

        await wrapper.find('.origam-menu__item').trigger('click')

        expect(wrapper.emitted('select')).toBeTruthy()
    })

    it('carries the clicked item object as the `select` payload', async () => {
        const item = { title: 'Leaf', key: 'leaf', value: 42 }
        const wrapper = await mountMenuWithItems([item])

        await wrapper.find('.origam-menu__item').trigger('click')

        const payload = wrapper.emitted('select')![0][0] as Record<string, unknown>
        expect(payload.key).toBe('leaf')
        expect(payload.value).toBe(42)
    })

    it('emits `select` for the row that was clicked, not merely the first one', async () => {
        const wrapper = await mountMenuWithItems([
            { title: 'First', key: 'first' },
            { title: 'Second', key: 'second' }
        ])

        const second = wrapper.findAll('.origam-menu__item')
            .find(row => row.text().includes('Second'))
        await second!.trigger('click')

        const payload = wrapper.emitted('select')![0][0] as Record<string, unknown>
        expect(payload.key).toBe('second')
    })

    it('still runs the item\'s own onClick handler alongside the emit', async () => {
        const onClick = vi.fn()
        const wrapper = await mountMenuWithItems([{ title: 'Leaf', key: 'leaf', onClick }])

        await wrapper.find('.origam-menu__item').trigger('click')

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('does not emit `select` for a row that only opens a submenu', async () => {
        const wrapper = await mountMenuWithItems([
            { title: 'Parent', key: 'parent', children: [{ title: 'Child', key: 'child' }] }
        ])

        const parentRow = wrapper.findAll('.origam-menu__item')
            .find(row => row.text().includes('Parent'))
        await parentRow!.trigger('click')

        expect(wrapper.emitted('select')).toBeFalsy()
    })

    // `select` is ALSO a native DOM event (fired on text selection inside an
    // input/textarea). While it was missing from `IMenuEmits`, Vue routed a
    // consumer's `@select` through the fallthrough-attribute path and bound it
    // as a real DOM listener on the menu root — so highlighting text inside
    // the menu invoked the consumer's item-picked handler with a plain
    // `Event`, never an item. Declaring the emit takes the listener off the
    // DOM entirely, which is what this asserts.
    it('does not fire a consumer `@select` handler on the native DOM select event', async () => {
        const onSelect = vi.fn()
        const origam = createOrigam()
        const wrapper = mount(OrigamMenu, {
            props: {
                modelValue: true,
                items: [{ title: 'Leaf', key: 'leaf' }],
                onSelect
            } as never,
            attachTo: document.body,
            global: makeGlobal([origam])
        })
        await nextTick()

        wrapper.element.dispatchEvent(new Event('select', { bubbles: true }))
        await nextTick()

        expect(onSelect).not.toHaveBeenCalled()
    })
})
