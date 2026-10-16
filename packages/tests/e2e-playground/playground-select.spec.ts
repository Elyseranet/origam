// Playground lot E1 (#1164) — Chart* snippets and selection by click in the
// preview, measured in a REAL browser against the standalone host
// (`playwright.playground.config.ts`).
//
// What this pins, each on the RENDERED DOM:
//
//   1. Every Chart* member that rendered EMPTY without a snippet now loads a
//      default snippet that paints: the plotting families an `<svg>` with
//      marks and no `.origam-chart__empty` state; the three HTML members
//      (Legend, RangeSelector, Tooltip) their own content. Measured before
//      this lot: "No data to display", a 0-px box, or a render error.
//   2. Selection mode OFF (default): the preview never intercepts — a Select
//      opens its menu, a Tab activates. The playground stays usable to test
//      a component's own interaction.
//   3. Selection mode ON: a click selects the innermost instance (inspector +
//      tree follow) and never reaches the component — the Select does NOT
//      open, the Tab does NOT activate. Escape leaves the mode.
//   4. axe-core: zero WCAG A/AA violation with the mode on and an instance
//      outlined. Chart is excluded, as in lot D: #1153 (`nested-interactive`).
//
// A/B: on the parent commit (`7c3f0b1fb`) the host catalogue has none of the
// 25 Chart* members and the top bar has no selection toggle — every test
// below fails (see the PR body for the measured run).

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const openComponent = async (page: Page, name: string) => {
    await page.goto('/')
    await page.locator('[data-cy="playground-catalog-open"]').click()
    await page.locator(`[data-cy="playground-drawer-item-${name}"]`).click()
}

const stage = (page: Page) => page.locator('[data-cy="playground-preview-stage"]')
const inspectorTitle = (page: Page) => page.locator('#pg-inspector-title')
const toggle = (page: Page) => page.locator('[data-cy="playground-select-mode-toggle"]')
const tree = (page: Page) => page.locator('[data-cy="playground-scene-tree-list"]')
const treeItem = (page: Page, label: string) => tree(page).getByRole('treeitem', { name: label, exact: true })

/*
 * The plotting members. Each one's blank render was measured in this lot:
 * `.origam-chart__empty` ("No data to display") or a render error
 * (Cartesian / Polar / Radar dereference the required `series`).
 */
const PLOTTING = [
    'OrigamChartBoxPlot', 'OrigamChartBullet', 'OrigamChartCandlestick', 'OrigamChartCartesian',
    'OrigamChartGauge', 'OrigamChartHeatmap', 'OrigamChartHoneycomb', 'OrigamChartMap',
    'OrigamChartPareto', 'OrigamChartPictorial', 'OrigamChartPolar', 'OrigamChartPolarBar',
    'OrigamChartPyramid', 'OrigamChartRadar', 'OrigamChartSankey', 'OrigamChartSparkline',
    'OrigamChartStreamgraph', 'OrigamChartSunburst', 'OrigamChartTreemap', 'OrigamChartVariwide',
    'OrigamChartWordCloud'
]

test.describe('playground — Chart* snippets (#1164)', () => {
    for (const name of PLOTTING) {
        test(`${name}: the default snippet paints an svg, not the empty state`, async ({ page }) => {
            await openComponent(page, name)

            const instance = stage(page).locator('[data-cy="playground-preview-instance"]').first()

            await expect(instance).toBeVisible()
            await expect(stage(page).locator('[data-cy="playground-preview-error"]')).toHaveCount(0)
            await expect(stage(page).locator('.origam-chart__empty')).toHaveCount(0)

            const measured = await instance.evaluate(root => {
                const svgs = [...root.querySelectorAll('svg')].filter(svg => svg.getBoundingClientRect().width > 0)
                const marks = svgs.reduce((sum, svg) => sum + svg.querySelectorAll('path, rect, circle, line, polyline, polygon, text').length, 0)

                return { svgs: svgs.length, marks }
            })

            expect(measured.svgs, name).toBeGreaterThan(0)
            expect(measured.marks, name).toBeGreaterThan(0)
        })
    }

    test('OrigamChartLegend: renders one entry per series', async ({ page }) => {
        await openComponent(page, 'OrigamChartLegend')

        await expect(stage(page).locator('.origam-chart__legend-item')).toHaveText(['Revenue', 'Costs'])
    })

    test('OrigamChartRangeSelector: renders its preset buttons', async ({ page }) => {
        await openComponent(page, 'OrigamChartRangeSelector')

        await expect(stage(page).getByRole('button')).toHaveText(['3m', '6m', 'All'])
    })

    test('OrigamChartTooltip: renders the hovered point', async ({ page }) => {
        await openComponent(page, 'OrigamChartTooltip')

        await expect(stage(page).locator('.origam-chart__tooltip')).toContainText('Revenue')
        await expect(stage(page).locator('.origam-chart__tooltip')).toContainText('19')
    })

    test('OrigamChartAxis is catalogued but has no snippet — it paints only inside a chart svg', async ({ page }) => {
        await page.goto('/')
        await page.locator('[data-cy="playground-catalog-open"]').click()

        await expect(page.locator('[data-cy="playground-drawer-item-OrigamChartAxis"]')).toBeVisible()
    })
})

test.describe('playground — selection by click in the preview (#1164)', () => {
    test('mode OFF (default): the Select keeps its own interaction and opens', async ({ page }) => {
        await openComponent(page, 'OrigamSelect')

        await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')

        await stage(page).locator('[data-cy="playground-preview-instance"]').click()

        await expect(stage(page).locator('[aria-expanded]').first()).toHaveAttribute('aria-expanded', 'true')
        await expect(page.getByRole('listbox').filter({ visible: true })).toHaveCount(1)
    })

    test('mode OFF: clicking a Tab activates it, the selection does not move', async ({ page }) => {
        await openComponent(page, 'OrigamTabs')

        await stage(page).getByRole('tab', { name: 'Settings' }).click()

        await expect(stage(page).getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true')
        await expect(inspectorTitle(page)).toHaveText('Tabs')
    })

    test('mode ON: a click selects the instance and does NOT open the Select', async ({ page }) => {
        await openComponent(page, 'OrigamSelect')
        await toggle(page).click()

        await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')

        await stage(page).locator('[data-cy="playground-preview-instance"]').click()

        await expect(inspectorTitle(page)).toHaveText('Select')
        await expect(page.getByRole('listbox').filter({ visible: true })).toHaveCount(0)
        await expect(stage(page).locator('[aria-expanded="true"]')).toHaveCount(0)
    })

    test('mode ON: clicking a Tab selects THAT Tab instance without activating it', async ({ page }) => {
        await openComponent(page, 'OrigamTabs')
        await toggle(page).click()

        const settings = stage(page).getByRole('tab', { name: 'Settings' })

        await expect(settings).toHaveAttribute('aria-selected', 'false')
        await settings.click()

        await expect(inspectorTitle(page)).toHaveText('Tab')
        await expect(treeItem(page, 'Tab — Settings')).toHaveAttribute('aria-selected', 'true')
        await expect(settings).toHaveAttribute('aria-selected', 'false')
        await expect(page.locator('[data-cy="playground-control-input-text"] input')).toHaveValue('Settings')
    })

    test('mode ON: the innermost instance wins — a Btn in a DataTable cell, then the table itself', async ({ page }) => {
        await openComponent(page, 'OrigamDataTable')
        await toggle(page).click()

        await stage(page).locator('tbody tr').first().getByRole('button', { name: 'Edit' }).click()

        await expect(inspectorTitle(page)).toHaveText('Btn')
        await expect(treeItem(page, 'Btn — Edit (#item.actions)')).toHaveAttribute('aria-selected', 'true')
        await expect(stage(page).locator('[data-pg-selected]')).toHaveCount(3)

        await stage(page).locator('tbody tr').first().locator('td').first().click()

        await expect(inspectorTitle(page)).toHaveText('DataTable')
        await expect(treeItem(page, 'DataTable')).toHaveAttribute('aria-selected', 'true')
    })

    test('mode ON: the selection is outlined, and a click reopens a hidden inspector', async ({ page }) => {
        await openComponent(page, 'OrigamBtn')
        await page.locator('[data-cy="playground-inspector-toggle"]').click()
        await expect(page.locator('[data-cy="playground-inspector-slot"]')).toBeHidden()

        await toggle(page).click()
        await stage(page).getByRole('button', { name: 'Button', exact: true }).click()

        await expect(page.locator('[data-cy="playground-inspector-slot"]')).toBeVisible()

        const outline = await stage(page).locator('[data-pg-selected]').evaluate(element => getComputedStyle(element).outlineStyle)

        expect(outline).toBe('solid')
    })

    test('Escape leaves the mode, and the components react again', async ({ page }) => {
        await openComponent(page, 'OrigamTabs')
        await toggle(page).click()
        await page.keyboard.press('Escape')

        await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')

        await stage(page).getByRole('tab', { name: 'Billing' }).click()

        await expect(stage(page).getByRole('tab', { name: 'Billing' })).toHaveAttribute('aria-selected', 'true')
        await expect(inspectorTitle(page)).toHaveText('Tabs')

        // The marker stays on the selected instance; only the mode draws it.
        const outline = await stage(page).locator('[data-pg-selected]').evaluate(element => getComputedStyle(element).outlineStyle)

        expect(outline).toBe('none')
    })

    test('the toggle is a keyboard-operable toggle button', async ({ page }) => {
        await openComponent(page, 'OrigamBtn')

        await toggle(page).focus()
        await page.keyboard.press('Enter')
        await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')

        await page.keyboard.press('Space')
        await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
    })

    test('axe-core: zero WCAG A/AA violation with the mode on and an instance selected', async ({ page }) => {
        test.slow()
        await openComponent(page, 'OrigamDataTable')
        await toggle(page).click()
        await stage(page).locator('tbody tr').first().getByRole('button', { name: 'Edit' }).click()
        await expect(inspectorTitle(page)).toHaveText('Btn')

        const wcag = await new AxeBuilder({ page })
            .include('[data-cy="playground-root"]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze()

        expect(wcag.violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(' | ')}`)).toEqual([])
    })
})
