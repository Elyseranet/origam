import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * OrigamChartPyramid — Playwright spec.
 *
 * Asserts:
 *  - N trapezoid `<path>` elements render for N data points.
 *  - `funnel` and `pyramid` variants both produce the expected
 *    number of paths.
 *  - The main OrigamChart shell story dispatches to the pyramid chart
 *    for `type="funnel"` / `type="pyramid"`.
 *  - Clicking a legend item hides the corresponding slice and
 *    applies the `--hidden` modifier on the legend item.
 *  - ARIA attributes (role="figure", role="img", title, desc) are
 *    present for screen-reader support.
 *
 * Story realignment (canonical Design/Functional/Events/Slots structure):
 * the old per-prop `Prop — …` Variants were folded into the `Design`
 * Variant's `Type` control (`HstSelect`). There is no longer a
 * side-by-side funnel/pyramid fixture nor a 3/5/8-slice count control —
 * see the `test.fixme` below for the one scenario with no surviving
 * equivalent.
 */

const PYRAMID_STORY = '/stories/story/components-stories-chart-origamchartpyramid-story-vue'
const CHART_STORY = '/stories/story/components-stories-chart-origamchart-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyUrl: string, title: string) => {
    await page.goto(storyUrl)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test.describe('OrigamChartPyramid — Default (funnel)', () => {
    test('renders figure root with role="figure"', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="origam-chart-pyramid"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="origam-chart-pyramid"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders exactly 5 trapezoid slices (FIXTURE_FUNNEL has 5 data points)', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-pyramid-default.png', fullPage: false })

        const slices = sandbox.locator('[data-cy="origam-chart-pyramid"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(5, { timeout: 6000 })
    })

    test('each slice path has a non-empty d attribute', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const slices = sandbox.locator('[data-cy="origam-chart-pyramid"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(5, { timeout: 6000 })
        const count = await slices.count()
        for (let i = 0; i < count; i++) {
            const d = await slices.nth(i).getAttribute('d')
            expect(d).toBeTruthy()
            expect(d!.startsWith('M')).toBe(true)
        }
    })
})

test.describe('OrigamChartPyramid — Funnel variant', () => {
    // Story realignment: the old dedicated "Prop — type (funnel / pyramid
    // side by side)" Variant rendering two chart instances at once was
    // folded into the single "Design" Variant's Type control (HstSelect).
    // Each type is now exercised as a single instance in sequence instead
    // of a side-by-side comparison.
    test('funnel type renders 5 slices', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Type', 'funnel')
        await page.screenshot({ path: '/tmp/chart-pyramid-funnel.png', fullPage: false })

        const slices = sandbox.locator('[data-cy="origam-chart-pyramid"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(5, { timeout: 6000 })
    })

    test('pyramid type renders 5 slices', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Type', 'pyramid')
        const slices = sandbox.locator('[data-cy="origam-chart-pyramid"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(5, { timeout: 6000 })
    })

    test('funnel slice 0 is wider at the top than slice 4', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Design')
        const sandbox = sandboxOf(page)
        // Type defaults to 'funnel' on the Design Variant's init-state — no
        // control change needed.

        const slice0 = sandbox.locator('[data-cy="origam-chart-pyramid-slice-0"]')
        const slice4 = sandbox.locator('[data-cy="origam-chart-pyramid-slice-4"]')

        const d0 = await slice0.getAttribute('d')
        const d4 = await slice4.getAttribute('d')
        expect(d0).toBeTruthy()
        expect(d4).toBeTruthy()

        // Extract the first M x,y to get the left-edge x of each slice top.
        // Funnel: slice 0 top is widest → its left x (tl) is lower than slice 4's.
        const extractTopLeft = (d: string): number => {
            const m = d.match(/M\s*([\d.]+),/)
            return m ? parseFloat(m[1]) : 0
        }
        const tl0 = extractTopLeft(d0!)
        const tl4 = extractTopLeft(d4!)
        // Slice 0 top-left should be further left (smaller x) than slice 4.
        expect(tl0).toBeLessThan(tl4)
    })
})

test.describe('OrigamChartPyramid — series slice count variations', () => {
    // Story realignment: the old "Prop — series (3 / 5 / 8 slices)" Variant
    // is GONE with no surviving equivalent — OrigamChartPyramid.story.vue's
    // Design/Functional/Default Variants all bind a single fixed fixture
    // (FIXTURE_FUNNEL, 5 categories); there is no control anywhere in the
    // story that varies the series length. This is a genuine coverage gap,
    // not a renamed Variant — flagging via test.fixme rather than silently
    // dropping the assertions or inventing a fixture the story doesn't have.
    test('3-slice variant renders exactly 3 paths', async ({ page }) => {
        test.fixme(true, 'No story Variant/control varies series length anymore (fixed FIXTURE_FUNNEL, 5 categories) — needs a story-side decision, see chart-pyramid.spec.ts header note')
        await openVariant(page, PYRAMID_STORY, 'Design')
        const sandbox = sandboxOf(page)
        const slices = sandbox.locator('[data-cy="origam-chart-pyramid"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(3, { timeout: 6000 })
    })

    test('8-slice variant renders exactly 8 paths', async ({ page }) => {
        test.fixme(true, 'No story Variant/control varies series length anymore (fixed FIXTURE_FUNNEL, 5 categories) — needs a story-side decision, see chart-pyramid.spec.ts header note')
        await openVariant(page, PYRAMID_STORY, 'Design')
        const sandbox = sandboxOf(page)
        const slices = sandbox.locator('[data-cy="origam-chart-pyramid"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(8, { timeout: 6000 })
    })
})

test.describe('OrigamChartPyramid — legend toggle', () => {
    test('clicking first legend item hides slice 0 and applies --hidden modifier', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)

        // Verify 5 slices visible before toggle.
        const slices = sandbox.locator('[data-cy="origam-chart-pyramid"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(5, { timeout: 6000 })

        // Click the first legend item.
        const legendItems = sandbox.locator('[data-cy="origam-chart-pyramid"] .origam-chart__legend-item')
        await expect(legendItems.first()).toBeVisible()
        await legendItems.first().click()
        await page.waitForTimeout(300)

        // After toggling the first entry, only 4 slices should remain visible.
        await expect(slices).toHaveCount(4, { timeout: 4000 })

        // The clicked legend item should carry the --hidden modifier.
        await expect(legendItems.first()).toHaveClass(/origam-chart__legend-item--hidden/, { timeout: 4000 })
    })

    test('re-clicking the hidden legend item restores 5 slices', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)

        const slices = sandbox.locator('[data-cy="origam-chart-pyramid"] [data-cy^="origam-chart-pyramid-slice-"]')
        const legendItems = sandbox.locator('[data-cy="origam-chart-pyramid"] .origam-chart__legend-item')

        // Hide first slice.
        await legendItems.first().click()
        await page.waitForTimeout(300)
        await expect(slices).toHaveCount(4)

        // Show it again.
        await legendItems.first().click()
        await page.waitForTimeout(300)
        await expect(slices).toHaveCount(5)
        await expect(legendItems.first()).not.toHaveClass(/origam-chart__legend-item--hidden/)
    })
})

test.describe('OrigamChartPyramid — accessibility', () => {
    test('each slice has role="button" and a non-empty aria-label', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const slices = sandbox.locator('[data-cy="origam-chart-pyramid"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(5, { timeout: 6000 })
        const count = await slices.count()
        for (let i = 0; i < count; i++) {
            await expect(slices.nth(i)).toHaveAttribute('role', 'button')
            const label = await slices.nth(i).getAttribute('aria-label')
            expect(label).toBeTruthy()
        }
    })

    test('each slice is keyboard-focusable (tabindex=0)', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const slices = sandbox.locator('[data-cy="origam-chart-pyramid"] [data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(5, { timeout: 6000 })
        const count = await slices.count()
        for (let i = 0; i < count; i++) {
            await expect(slices.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })
})

test.describe('OrigamChart shell — pyramid / funnel dispatch', () => {
    // Story realignment: the old dedicated "Prop — pyramid / funnel (side by
    // side)" and "Prop — type (29 primitives)" Variants were folded into the
    // single "Design" Variant's Type control (HstSelect, 29 chart type
    // options including funnel/pyramid). The Design Variant's fixture is
    // FIXTURE_SALES_SERIES × FIXTURE_MONTHS (12 categories), not the
    // 5-category pyramid-only fixture — verified empirically against the
    // running story (12 `origam-chart-pyramid-slice-*` nodes render for
    // both funnel and pyramid types).
    test('Design Variant Type=funnel dispatches to OrigamChartPyramid (12 slices)', async ({ page }) => {
        await openVariant(page, CHART_STORY, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Type', 'funnel')

        const root = sandbox.locator('[data-cy~="origam-chart--funnel"]')
        await expect(root).toBeVisible({ timeout: 8000 })
        const slices = sandbox.locator('[data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(12, { timeout: 8000 })
    })

    test('Design Variant Type=pyramid dispatches to OrigamChartPyramid (12 slices)', async ({ page }) => {
        await openVariant(page, CHART_STORY, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Type', 'pyramid')

        const root = sandbox.locator('[data-cy~="origam-chart--pyramid"]')
        await expect(root).toBeVisible({ timeout: 8000 })
        const slices = sandbox.locator('[data-cy^="origam-chart-pyramid-slice-"]')
        await expect(slices).toHaveCount(12, { timeout: 8000 })
    })
})

test.describe('OrigamChartPyramid — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, PYRAMID_STORY, 'Slots - Empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="origam-chart-pyramid-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No pipeline data')
    })
})
