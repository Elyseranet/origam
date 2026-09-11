// Regression test for issue #477 — the 5 remaining hardcoded aria-label
// strings NOT already covered by #450 / #451 / #462 (see
// `aria-label-i18n.spec.ts` for that trio):
//
//   OrigamChartRangeSelector  aria-label="Chart range selector"
//   OrigamChartPolar          aria-label="Drilldown navigation"
//   OrigamChartCartesian      aria-label="Drilldown navigation" (same key)
//   OrigamChartCartesian      aria-label="Reset zoom"
//   OrigamDialog              aria-label="Close dialog"
//
// Same trap as the #450/#451/#462 trio: under EN, a hardcoded English
// string and its correctly-resolved translation are byte-identical, so a
// test that only exercises EN passes WITH the bug. Every accessible-name
// assertion below therefore runs under `fr` as well as the default `en`,
// and reads the rendered DOM attribute — never the template source.

import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { vi } from 'vitest'

import OrigamChartRangeSelector from '@origam/components/Chart/OrigamChartRangeSelector.vue'
import OrigamChartPolar from '@origam/components/Chart/OrigamChartPolar.vue'
import OrigamChartCartesian from '@origam/components/Chart/OrigamChartCartesian.vue'
import OrigamDialog from '@origam/components/Dialog/OrigamDialog.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})

class ObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
}
vi.stubGlobal('ResizeObserver', ObserverMock)
vi.stubGlobal('IntersectionObserver', ObserverMock)

// Every mount below uses `attachTo: document.body` (required to reach
// Dialog's teleported content). Without resetting between tests, leftover
// nodes from an earlier test (e.g. a chart breadcrumb's "← Back" button)
// stay in the DOM and a later `.origam-btn` lookup can silently match the
// wrong element instead of the one the current test just mounted.
afterEach(() => {
    document.body.innerHTML = ''
})

/** Mount with the DS installed, optionally under a non-default locale. */
function mountWith (component: any, props: Record<string, unknown>, locale?: string) {
    return mount(component, {
        props: props as never,
        global: {plugins: [createOrigam(locale ? {locale: {locale}} : undefined)]},
        attachTo: document.body
    })
}

describe('accessible names resolve through the locale layer (#477)', () => {
    describe('OrigamChartRangeSelector', () => {
        const baseProps = {
            buttons: [{label: '1w', count: 7}, {label: 'all', fraction: 1}],
            activeIndex: -1,
            dataLength: 30
        }

        it('falls back to the shared locale key, not a baked English string', () => {
            const wrapper = mountWith(OrigamChartRangeSelector, baseProps)

            expect(wrapper.find('nav').attributes('aria-label')).toBe('Chart range selector')
        })

        it('follows the active locale', () => {
            const wrapper = mountWith(OrigamChartRangeSelector, baseProps, 'fr')

            expect(wrapper.find('nav').attributes('aria-label')).toBe('Sélecteur de plage du graphique')
        })

        it('resolves a consumer-supplied locale key', () => {
            const wrapper = mountWith(OrigamChartRangeSelector, {...baseProps, ariaLabel: 'origam.close'})

            expect(wrapper.find('nav').attributes('aria-label')).toBe('Close')
        })
    })

    describe('OrigamChartPolar — drilldown breadcrumb', () => {
        const drilldownProps = {
            series: [{
                name: 'S',
                data: [
                    {x: 'A', y: 5, drilldown: {id: 'sub', name: 'Sub'}},
                    {x: 'B', y: 3}
                ]
            }],
            categories: ['A', 'B'],
            drilldown: {
                datasets: [
                    {id: 'sub', name: 'Sub', series: [{name: 'S2', data: [1, 2]}], categories: ['X', 'Y']}
                ]
            }
        }

        function drillIn (wrapper: ReturnType<typeof mount>) {
            const point = wrapper.find('[data-cy="origam-chart-slice-0"]')
            expect(point.exists()).toBe(true)
            return point
        }

        it('follows the active locale on the breadcrumb nav', async () => {
            const wrapper = mountWith(OrigamChartPolar, drilldownProps, 'fr')
            const point = drillIn(wrapper)
            await point.trigger('mouseenter')
            await point.trigger('click')

            const nav = wrapper.find('.origam-chart-polar__breadcrumb')
            expect(nav.exists()).toBe(true)
            expect(nav.attributes('aria-label')).toBe("Navigation d'exploration")
        })
    })

    describe('OrigamChartCartesian — drilldown breadcrumb + zoom reset', () => {
        const baseSeries = [{
            name: 'S',
            data: [
                {x: 'A', y: 5, drilldown: {id: 'sub', name: 'Sub'}},
                {x: 'B', y: 3}
            ]
        }]
        const categories = ['A', 'B']
        const drilldownCfg = {
            datasets: [
                {id: 'sub', name: 'Sub', series: [{name: 'S2', data: [1, 2]}], categories: ['X', 'Y']}
            ]
        }

        function drillInBar (wrapper: ReturnType<typeof mount>) {
            const point = wrapper.find('[data-cy="origam-chart-bar-0-0"]')
            expect(point.exists()).toBe(true)
            return point
        }

        it('breadcrumb nav follows the active locale', async () => {
            const wrapper = mountWith(OrigamChartCartesian, {
                type: 'bar', series: baseSeries, categories, drilldown: drilldownCfg
            }, 'fr')
            const point = drillInBar(wrapper)
            await point.trigger('mouseenter')
            await point.trigger('click')

            const nav = wrapper.find('.origam-chart-cartesian__breadcrumb')
            expect(nav.exists()).toBe(true)
            expect(nav.attributes('aria-label')).toBe("Navigation d'exploration")
        })

        it('"Reset zoom" control follows the active locale', async () => {
            const wrapper = mountWith(OrigamChartCartesian, {
                type: 'bar',
                series: baseSeries,
                categories: ['A', 'B', 'C', 'D', 'E'],
                zoomable: true,
                rangeSelector: {enabled: true, buttons: [{label: '2', count: 2}], selected: 0}
            }, 'fr')

            const resetBtn = wrapper.find('[data-cy="origam-chart-zoom-reset-btn"]')
            expect(resetBtn.exists()).toBe(true)
            expect(resetBtn.attributes('aria-label')).toBe('Réinitialiser le zoom')
        })

        it('"Reset zoom" control falls back to the shared locale key under English', () => {
            const wrapper = mountWith(OrigamChartCartesian, {
                type: 'bar',
                series: baseSeries,
                categories: ['A', 'B', 'C', 'D', 'E'],
                zoomable: true,
                rangeSelector: {enabled: true, buttons: [{label: '2', count: 2}], selected: 0}
            })

            const resetBtn = wrapper.find('[data-cy="origam-chart-zoom-reset-btn"]')
            expect(resetBtn.attributes('aria-label')).toBe('Reset zoom')
        })
    })

    // #412 (open, separate, undecided) means `<OrigamDialog>`'s own
    // `#header-append` never reaches `<OrigamCard>` today — Card only reads
    // the DOT-named `header.append`, so the built-in close button is dead
    // code end-to-end regardless of this fix. That mismatch is Card/Dialog
    // wiring, not i18n, and its resolution needs an API decision this
    // ticket has no mandate to make (see #412's "À trancher avant de
    // coder"). To verify Dialog's OWN aria-label logic without that
    // unrelated blocker silently swallowing every assertion, `OrigamCard`
    // is stubbed here with a faithful pass-through of the HYPHEN-named
    // slot Dialog actually provides — i.e. Dialog's contract exactly as
    // authored today. This isolates what THIS ticket changed (the
    // translated label) from what #412 owns (making the slot reach Card).
    describe('OrigamDialog — close button', () => {
        // #412 — the real `<OrigamCard>` reads this slot under the POINT
        // name (`slots['header.append']`) — this stub used to read the DASH
        // name Dialog wrongly provided pre-fix, which made this spec pass
        // for the wrong reason (both sides encoded the same mismatch).
        const CardPassthroughStub = {
            name: 'OrigamCard',
            setup (_: unknown, {slots, expose}: {slots: Record<string, (() => unknown) | undefined>, expose: (exposed: object) => void}) {
                expose({filterProps: () => ({})})
                return () => h('div', {
                    role: 'dialog',
                    'aria-labelledby': 'stub-title'
                }, [slots['header.append']?.()])
            }
        }

        function mountOpenDialog (locale?: string, props: Record<string, unknown> = {}) {
            return mount(OrigamDialog, {
                props: {modelValue: true, ...props} as never,
                global: {
                    plugins: [createOrigam(locale ? {locale: {locale}} : undefined)],
                    stubs: {OrigamCard: CardPassthroughStub}
                },
                attachTo: document.body
            })
        }

        // `<OrigamDialog>` delegates its actual content to `<OrigamOverlay>`,
        // which renders via `<Teleport>` to `document.body` — outside the
        // mounted wrapper's own DOM subtree. `wrapper.find()` only walks the
        // wrapper's root element, so the teleported button is invisible to
        // it; querying `document.body` directly (via a raw `DOMWrapper`) is
        // the reliable path, same as the `attachTo: document.body` mount
        // option already implies.
        it('falls back to the shared origam.close key, not a baked English string', async () => {
            const wrapper = mountOpenDialog()
            await nextTick()
            await nextTick()

            const closeBtn = new DOMWrapper(document.body).find('.origam-btn')
            expect(closeBtn.exists()).toBe(true)
            expect(closeBtn.attributes('aria-label')).toBe('Close')
            wrapper.unmount()
        })

        it('follows the active locale', async () => {
            const wrapper = mountOpenDialog('fr')
            await nextTick()
            await nextTick()

            const closeBtn = new DOMWrapper(document.body).find('.origam-btn')
            expect(closeBtn.exists()).toBe(true)
            expect(closeBtn.attributes('aria-label')).toBe('Fermer')
            wrapper.unmount()
        })

        it('resolves a consumer-supplied locale key', async () => {
            const wrapper = mountOpenDialog(undefined, {closeLabel: 'origam.dismiss'})
            await nextTick()
            await nextTick()

            const closeBtn = new DOMWrapper(document.body).find('.origam-btn')
            expect(closeBtn.attributes('aria-label')).toBe('Dismiss')
            wrapper.unmount()
        })
    })
})
