/*********************************************************
 * #916 — `inheritAttrs: false` on the 12 fragment / teleport-rooted
 * components, WITHOUT losing the attributes they used to forward.
 *
 * @description
 * WHY THIS EXISTS. Vue's `renderComponentRoot()` tries to merge fallthrough
 * attributes onto the component's root vnode, and gives up when that root is
 * neither ELEMENT nor COMPONENT — a fragment, a text node, or a `<teleport>`
 * (Vue treats the TELEPORT shapeFlag like a fragment here; its own message
 * says "renders fragment or text or teleport root nodes"). In dev it then
 * logs "Extraneous non-props attributes", and that warning's component trace
 * SERIALISES every ancestor's props — including Vue Router's `RouteProvider`,
 * whose `vnode` prop is the whole page's reactive graph. ~4.4 MB per
 * occurrence; #853 measured 161 MB of log in 45 min, then
 * `JS heap out of memory` and HTTP 500 on every route.
 *
 * @description
 * WHY IT IS NOT A ONE-LINE FIX, AND WHAT THIS SPEC ACTUALLY GUARDS.
 * `inheritAttrs: false` silences the warning by telling Vue not to try. On a
 * component whose root is ALWAYS a fragment that changes nothing observable —
 * the attributes already went nowhere. But four of the twelve have a MIXED
 * root: one branch of a root `v-if` chain is a fragment, another is a single
 * element where the automatic merge WORKS today. On those, the flag alone
 * silently swallows a consumer's `class` / `style` / `id` / `aria-*` /
 * `data-cy` / listeners — the exact defect of #492 (`OrigamThemeProvider`).
 *
 * So the assertions below are deliberately split in two:
 *   1. NO "Extraneous non-props/non-emits" warning, for all twelve.
 *   2. The attributes still LAND, on the element-branch roots and on the
 *      teleported surfaces — which is what fails the moment someone deletes
 *      a `v-bind="$attrs"` while keeping the flag.
 *
 * ⛔ Point 2 is the control that matters. A spec that only asserted the
 * presence of `inheritAttrs: false` would pass on a component that had lost
 * every attribute. Verified by removing each `v-bind="$attrs"` in turn: every
 * removal turns one of these assertions red.
 ********************************************************/
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { h, ref } from 'vue'

import { createOrigam } from '@origam/origam'
import {
    ORIGAM_DATA_TABLE_EXPAND_KEY,
    ORIGAM_DATA_TABLE_GROUP_KEY,
    ORIGAM_DATA_TABLE_HEADERS_KEY,
    ORIGAM_DATA_TABLE_PAGINATION_KEY,
    ORIGAM_DATA_TABLE_SELECT_KEY,
    ORIGAM_DATA_TABLE_SHOW_SELECT_KEY,
    ORIGAM_DATA_TABLE_SORT_KEY
} from '@origam/consts/DataTable/data-table.const'

import OrigamChartAxis from '@origam/components/Chart/OrigamChartAxis.vue'
import OrigamClientOnly from '@origam/components/ClientOnly/OrigamClientOnly.vue'
import OrigamCommandPalette from '@origam/components/CommandPalette/OrigamCommandPalette.vue'
import OrigamDataTableHeaders from '@origam/components/DataTable/OrigamDataTableHeaders.vue'
import OrigamDataTableHeadersCell from '@origam/components/DataTable/OrigamDataTableHeadersCell.vue'
import OrigamDataTableRows from '@origam/components/DataTable/OrigamDataTableRows.vue'
import OrigamDefaultsProvider from '@origam/components/DefaultsProvider/OrigamDefaultsProvider.vue'
import OrigamDrawer from '@origam/components/Drawer/OrigamDrawer.vue'
import OrigamSkeleton from '@origam/components/Skeleton/OrigamSkeleton.vue'
import OrigamSnackbarGroup from '@origam/components/Snackbar/OrigamSnackbarGroup.vue'
import OrigamVirtualScroll from '@origam/components/VirtualScroll/OrigamVirtualScroll.vue'
import OrigamVirtualScrollItem from '@origam/components/VirtualScroll/OrigamVirtualScrollItem.vue'

/* The attributes a consumer writes. None is a declared prop on any of the
 * components below, so each one lands in `$attrs`. */
const CONSUMER_ATTRS = {
    'data-cy': 'consumer-cy',
    'aria-label': 'consumer-label',
    class: 'consumer-class'
}

const noop = () => {}

/* `<OrigamDataTableHeaders*>` / `<OrigamDataTableRows>` are internal
 * sub-components: each reads a provide the parent `<OrigamDataTable>` installs.
 * Stubbed here so they can be mounted in isolation. */
const DATA_TABLE_PROVIDE = {
    [ORIGAM_DATA_TABLE_SORT_KEY as unknown as string]: { sortBy: ref([]), toggleSort: noop, isSorted: () => false },
    [ORIGAM_DATA_TABLE_HEADERS_KEY as unknown as string]: { headers: ref([[]]), columns: ref([]) },
    [ORIGAM_DATA_TABLE_SELECT_KEY as unknown as string]: {
        toggleSelect: noop, select: noop, selectAll: noop, allSelected: ref(false),
        someSelected: ref(false), isSelected: () => false, isSomeSelected: () => false, showSelectAll: ref(false)
    },
    [ORIGAM_DATA_TABLE_SHOW_SELECT_KEY as unknown as string]: ref(false),
    [ORIGAM_DATA_TABLE_EXPAND_KEY as unknown as string]: { expand: noop, expanded: ref(new Set()), isExpanded: () => false, toggleExpand: noop },
    [ORIGAM_DATA_TABLE_GROUP_KEY as unknown as string]: { opened: ref(new Set()), toggleGroup: noop, isGroupOpen: () => false, sortByWithGroups: ref([]), extractRows: (x: unknown) => x, groupBy: ref([]) },
    [ORIGAM_DATA_TABLE_PAGINATION_KEY as unknown as string]: { page: ref(1), itemsPerPage: ref(10), startIndex: ref(0), stopIndex: ref(0), pageCount: ref(1), itemsLength: ref(0), nextPage: noop, prevPage: noop, setPage: noop, setItemsPerPage: noop }
}

const mountWithAttrs = (component: unknown, props: Record<string, unknown> = {}) => mount(component as never, {
    props,
    attrs: { ...CONSUMER_ATTRS, onSomethingNobodyEmits: noop },
    slots: { default: () => h('span', 'content'), renderless: () => h('span', 'renderless') },
    global: { plugins: [createOrigam()], provide: DATA_TABLE_PROVIDE }
})

const EXTRANEOUS = /Extraneous non-(props|emits)/

let warnSpy: MockInstance

const extraneousWarnings = () => warnSpy.mock.calls
    .map(call => String(call[0]))
    .filter(message => EXTRANEOUS.test(message))

beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(noop)
})

afterEach(() => {
    warnSpy.mockRestore()
    document.body.innerHTML = ''
})

/*********************************************************
 * 1 — the warning itself, on all twelve.
 *
 * @description
 * Each entry is mounted in the configuration that REACHES its fragment /
 * teleport root. That matters: a component whose root `v-if` chain is mixed
 * warns only in one branch, so a default mount would report a false green.
 * Measured on the parent commit, these same mounts produced 34 occurrences.
 ********************************************************/
describe('#916 — no "Extraneous non-props attributes" on a fragment or teleport root', () => {
    const CASES: Array<[string, unknown, Record<string, unknown>]> = [
        ['OrigamChartAxis', OrigamChartAxis, { plot: { x0: 0, y0: 0, x1: 100, y1: 100, cx: 50, cy: 50 }, ticks: { x: [], y: [] } }],
        ['OrigamClientOnly', OrigamClientOnly, {}],
        ['OrigamCommandPalette', OrigamCommandPalette, { modelValue: true }],
        ['OrigamDataTableHeaders', OrigamDataTableHeaders, {}],
        ['OrigamDataTableHeadersCell', OrigamDataTableHeadersCell, {}],
        ['OrigamDataTableRows (loader fragment)', OrigamDataTableRows, { loading: true }],
        ['OrigamDataTableRows (no-data element)', OrigamDataTableRows, {}],
        ['OrigamDefaultsProvider', OrigamDefaultsProvider, {}],
        ['OrigamDrawer', OrigamDrawer, { modelValue: true }],
        ['OrigamSkeleton (slot fragment)', OrigamSkeleton, { loading: false }],
        ['OrigamSkeleton (element)', OrigamSkeleton, { loading: true }],
        ['OrigamSnackbarGroup', OrigamSnackbarGroup, {}],
        ['OrigamVirtualScroll (renderless fragment)', OrigamVirtualScroll, { items: [1, 2], itemHeight: 10, renderless: true }],
        ['OrigamVirtualScroll (element)', OrigamVirtualScroll, { items: [1, 2], itemHeight: 10 }],
        ['OrigamVirtualScrollItem (renderless fragment)', OrigamVirtualScrollItem, { renderless: true }],
        ['OrigamVirtualScrollItem (element)', OrigamVirtualScrollItem, {}]
    ]

    for (const [name, component, props] of CASES) {
        it(`${ name } stays silent with an undeclared attribute and an unemitted listener`, () => {
            mountWithAttrs(component, props)

            expect(extraneousWarnings()).toStrictEqual([])
        })
    }
})

/*********************************************************
 * 2 — the attributes still land. THE CONTROL.
 *
 * @description
 * Every assertion here fails if the matching `v-bind="$attrs"` is removed
 * while `inheritAttrs: false` stays — which is the regression #916 was at
 * risk of introducing, and the one #492 actually shipped. Each expected
 * value was measured on the parent commit BEFORE the flag was added, so
 * these are preservations, not new behaviour.
 ********************************************************/
describe('#916 — a consumer\'s attributes still reach the element-branch root', () => {
    it('OrigamSkeleton — element branch keeps class, data-cy and aria-label', () => {
        const wrapper = mountWithAttrs(OrigamSkeleton, { loading: true })
        const html = wrapper.html()

        expect(html).toContain('consumer-cy')
        expect(html).toContain('consumer-class')
        expect(html).toContain('consumer-label')
    })

    it('OrigamSkeleton — element branch: consumer aria-label WINS over the component default', () => {
        const wrapper = mountWithAttrs(OrigamSkeleton, { loading: true })

        expect(wrapper.attributes('aria-label')).toBe('consumer-label')
    })

    it('OrigamSkeleton — the component\'s own class survives alongside the consumer\'s', () => {
        const wrapper = mountWithAttrs(OrigamSkeleton, { loading: true })
        const classes = wrapper.classes()

        expect(classes).toContain('consumer-class')
        expect(classes.some(name => name.startsWith('origam-skeleton'))).toBe(true)
    })

    it('OrigamVirtualScroll — non-renderless container keeps the consumer attributes', () => {
        const html = mountWithAttrs(OrigamVirtualScroll, { items: [1, 2], itemHeight: 10 }).html()

        expect(html).toContain('consumer-cy')
        expect(html).toContain('consumer-class')
        expect(html).toContain('consumer-label')
    })

    it('OrigamVirtualScrollItem — non-renderless wrapper keeps the consumer attributes', () => {
        const html = mountWithAttrs(OrigamVirtualScrollItem, {}).html()

        expect(html).toContain('consumer-cy')
        expect(html).toContain('consumer-class')
        expect(html).toContain('consumer-label')
    })

    it('OrigamDataTableRows — the no-data row (the only element root) keeps them', () => {
        const html = mountWithAttrs(OrigamDataTableRows, {}).html()

        expect(html).toContain('consumer-cy')
        expect(html).toContain('consumer-class')
        expect(html).toContain('consumer-label')
    })

    it('OrigamSnackbarGroup — the teleported stack root receives them', () => {
        mountWithAttrs(OrigamSnackbarGroup, {})
        const stack = document.body.querySelector('[data-cy="consumer-cy"]')

        expect(stack).not.toBeNull()
        expect(stack!.classList.contains('consumer-class')).toBe(true)
        expect(stack!.getAttribute('aria-label')).toBe('consumer-label')
        // the component's own surface class is still there
        expect(stack!.className).toMatch(/origam-snackbar-group/)
    })

    it('OrigamCommandPalette — the teleported backdrop receives them, and the consumer data-cy WINS over the hardcoded one', () => {
        mountWithAttrs(OrigamCommandPalette, { modelValue: true })
        const backdrop = document.body.querySelector('[data-cy="consumer-cy"]')

        expect(backdrop).not.toBeNull()
        expect(backdrop!.classList.contains('consumer-class')).toBe(true)
        /*
         * The component hardcodes `dataCy = 'origam-command-palette'`. #916's
         * report is that `packages/marketing`'s
         * `data-cy="global-command-palette"` must not be masked by it — so the
         * internal default must NOT survive as the rendered value.
         */
        expect(document.body.querySelector('[data-cy="origam-command-palette"]')).toBeNull()
    })

    it('OrigamDrawer — the open drawer root receives them', async () => {
        /*
         * `permanent` is required, and the reason is the same mechanism this
         * spec is about. `isActive` is a `useVModel`, but an `onMounted` watch
         * on `isTemporary` resets it (`!props.permanent && … isActive = !val`),
         * and with no real viewport jsdom resolves `isTemporary` to true — so a
         * plain `modelValue: true` mount renders a CLOSED drawer whose
         * `v-if="isActive"` subtree, and therefore whose `v-bind="$attrs"`,
         * never runs. That is exactly why `inheritAttrs: false` was needed here
         * even though the template already forwards `$attrs`: Vue only
         * suppresses the warning when `$attrs` is read through the public proxy
         * DURING the render that would warn, and on a closed drawer it is not.
         */
        const wrapper = mountWithAttrs(OrigamDrawer, { modelValue: true, permanent: true })
        await wrapper.vm.$nextTick()

        const rendered = wrapper.html() + document.body.innerHTML

        expect(rendered).toContain('consumer-cy')
        expect(rendered).toContain('consumer-label')
        expect(rendered).toContain('consumer-class')
    })
})

/*********************************************************
 * 3 — the components that forward NOTHING, asserted as such.
 *
 * @description
 * These five are fragment-rooted in EVERY branch, so there is no single home
 * for an attribute and none is invented. Pinning the current behaviour keeps
 * the next reader from "completing" the fix by forwarding somewhere arbitrary
 * — and makes the change visible in review if they decide to anyway.
 ********************************************************/
describe('#916 — structurally transparent components forward nothing, by design', () => {
    const NOWHERE: Array<[string, unknown, Record<string, unknown>]> = [
        ['OrigamChartAxis', OrigamChartAxis, { plot: { x0: 0, y0: 0, x1: 100, y1: 100, cx: 50, cy: 50 }, ticks: { x: [], y: [] } }],
        ['OrigamClientOnly', OrigamClientOnly, {}],
        ['OrigamDefaultsProvider', OrigamDefaultsProvider, {}],
        ['OrigamDataTableHeaders', OrigamDataTableHeaders, {}],
        ['OrigamDataTableHeadersCell', OrigamDataTableHeadersCell, {}]
    ]

    for (const [name, component, props] of NOWHERE) {
        it(`${ name } renders no consumer attribute — and no warning either`, () => {
            const html = mountWithAttrs(component, props).html()

            expect(html).not.toContain('consumer-cy')
            expect(html).not.toContain('consumer-label')
            expect(extraneousWarnings()).toStrictEqual([])
        })
    }
})
