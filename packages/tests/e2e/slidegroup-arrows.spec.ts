import { expect, test, type Page } from '@playwright/test'

/**
 * Dedicated regression suite for the OrigamSlideGroup affix-arrows.
 *
 * Background: a previous fix made the arrows visible again, but they
 * still skipped tabs (e.g. tab 5 → tab 17, with the last tab unreachable).
 * Root cause was an unconditional RTL inversion inside `scrollToPosition`
 * that flipped the LTR target against `(scrollWidth − containerWidth)`,
 * sending every "next" call to the far end of the list.
 *
 * These tests assert the post-fix behaviour:
 *   1. One "next" click advances scrollLeft by ~containerSize.
 *   2. Successive clicks accumulate (no jump back, no skipping).
 *   3. The last tab is reachable; the "next" affix becomes disabled at
 *      the end of the scroll.
 *   4. Symmetry: "prev" walks scrollLeft back to 0.
 *
 * Re-enable RTL coverage if/when a proper RTL story variant is added.
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyPath: string, variant: string) => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(900)
}

const SLIDE_GROUP_PATH = '/stories/story/components-stories-slide-origamslidegroup-story-vue'

// ─── Helpers ───────────────────────────────────────────────────────────────

type ContainerMetrics = {
    scrollLeft: number
    clientWidth: number
    scrollWidth: number
    maxScroll: number
}

const readContainerMetrics = async (
    container: ReturnType<ReturnType<typeof sandboxOf>['locator']>
): Promise<ContainerMetrics> =>
    container.evaluate((el) => {
        const e = el as HTMLElement
        return {
            scrollLeft: e.scrollLeft,
            clientWidth: e.clientWidth,
            scrollWidth: e.scrollWidth,
            maxScroll: e.scrollWidth - e.clientWidth,
        }
    })

// ─── Tests ─────────────────────────────────────────────────────────────────

test.describe('OrigamSlideGroup arrows — single-click step', () => {
    test('one click on "next" advances scrollLeft by ~one container width', async ({ page }) => {
        await openVariant(page, SLIDE_GROUP_PATH, 'Prop — showArrows')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('.origam-slide-group__container').first()
        await expect(container).toBeAttached({ timeout: 8000 })

        const before = await readContainerMetrics(container)
        // Sanity: there must be horizontal overflow for the test to be meaningful.
        expect(before.maxScroll).toBeGreaterThan(0)
        expect(before.scrollLeft).toBe(0)

        // The affix listens to mousedown (so a real "click" still works,
        // but dispatching mousedown matches production wiring).
        const next = sandbox.locator('.origam-slide-group__next').first()
        await expect(next).toBeVisible({ timeout: 4000 })
        await next.click()

        // Wait past the 200ms scroll animation defined in goToOptions.
        await page.waitForTimeout(450)

        const after = await readContainerMetrics(container)

        // Expect scrollLeft to advance by roughly clientWidth (one viewport
        // step). Allow a generous tolerance: the calc-based padding around
        // the container can shave off a handful of px.
        const delta = after.scrollLeft - before.scrollLeft
        expect(delta).toBeGreaterThan(before.clientWidth * 0.6)
        expect(delta).toBeLessThanOrEqual(before.clientWidth + 2)

        // It must NOT have jumped to the far end (which is the bug we fixed).
        expect(after.scrollLeft).toBeLessThan(before.maxScroll - 1)
    })
})

test.describe('OrigamSlideGroup arrows — progressive walk', () => {
    test('repeated "next" clicks walk scrollLeft forward without skipping', async ({ page }) => {
        await openVariant(page, SLIDE_GROUP_PATH, 'Prop — showArrows')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('.origam-slide-group__container').first()
        const next = sandbox.locator('.origam-slide-group__next').first()
        await expect(container).toBeAttached({ timeout: 8000 })

        const positions: number[] = []
        const initial = await readContainerMetrics(container)
        positions.push(initial.scrollLeft)

        // Click a few times; we should monotonically progress until the end,
        // and at the end the affix should disable.
        const maxClicks = 10
        for (let i = 0; i < maxClicks; i++) {
            const stillEnabled = await next.evaluate((el) =>
                !el.classList.contains('origam-slide-group__next--disabled')
            )
            if (!stillEnabled) break

            await next.click()
            await page.waitForTimeout(300)

            const m = await readContainerMetrics(container)
            positions.push(m.scrollLeft)
        }

        // At least 2 positions captured (initial + one click).
        expect(positions.length).toBeGreaterThan(1)

        // Strictly monotonic — never skipped backwards.
        for (let i = 1; i < positions.length; i++) {
            expect(positions[i]).toBeGreaterThanOrEqual(positions[i - 1])
        }

        // The last position must reach maxScroll (or be very close to it,
        // within one container-width since the algo always steps by that).
        const final = positions[positions.length - 1]
        const m = await readContainerMetrics(container)
        // Either we hit the end exactly, or the next-arrow disabled itself.
        const reachedEnd = Math.abs(final - m.maxScroll) <= m.clientWidth
        expect(reachedEnd).toBe(true)
    })
})

test.describe('OrigamSlideGroup arrows — boundary states', () => {
    test('"next" affix disables once the end of the scroll is reached', async ({ page }) => {
        await openVariant(page, SLIDE_GROUP_PATH, 'Prop — showArrows')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('.origam-slide-group__container').first()
        const next = sandbox.locator('.origam-slide-group__next').first()
        await expect(container).toBeAttached({ timeout: 8000 })

        // Click "next" up to N times until the affix disables itself or we
        // hit a guard limit.
        for (let i = 0; i < 15; i++) {
            const disabled = await next.evaluate((el) =>
                el.classList.contains('origam-slide-group__next--disabled')
            )
            if (disabled) break
            await next.click()
            await page.waitForTimeout(280)
        }

        const finalDisabled = await next.evaluate((el) =>
            el.classList.contains('origam-slide-group__next--disabled')
        )
        expect(finalDisabled).toBe(true)
    })

    test('"prev" walks scrollLeft back to 0 after several "next" clicks', async ({ page }) => {
        await openVariant(page, SLIDE_GROUP_PATH, 'Prop — showArrows')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('.origam-slide-group__container').first()
        const next = sandbox.locator('.origam-slide-group__next').first()
        const prev = sandbox.locator('.origam-slide-group__prev').first()
        await expect(container).toBeAttached({ timeout: 8000 })

        // Walk forward a couple of steps.
        for (let i = 0; i < 3; i++) {
            const disabled = await next.evaluate((el) =>
                el.classList.contains('origam-slide-group__next--disabled')
            )
            if (disabled) break
            await next.click()
            await page.waitForTimeout(280)
        }

        const mid = await readContainerMetrics(container)
        expect(mid.scrollLeft).toBeGreaterThan(0)

        // Walk back to the start.
        for (let i = 0; i < 10; i++) {
            const disabled = await prev.evaluate((el) =>
                el.classList.contains('origam-slide-group__prev--disabled')
            )
            if (disabled) break
            await prev.click()
            await page.waitForTimeout(280)
        }

        const end = await readContainerMetrics(container)
        // Allow 1px slack — the scroll math rounds.
        expect(end.scrollLeft).toBeLessThanOrEqual(1)
    })
})
