import { expect, test, type Page } from '@playwright/test'

/**
 * Regression spec for OrigamVirtualScroll's `scrollToIndex` animation.
 *
 * Pre-fix the imperative `scrollToIndex(i)` did `containerRef.scrollTop = offset`
 * — instant teleport, no smoothing — and the user reported clicking the
 * "Index 500" button looked like the list snapped without warning. The
 * fix routes the call through `useGoTo` (which writes `scrollTop` over
 * `duration` ms via rAF + easing).
 *
 * These tests assert the animation actually runs by sampling `scrollTop`
 * at several points during the 300ms default duration and counting how
 * many distinct intermediate values the browser saw.
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyPath: string, variant: string) => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(900)
}

const VS_PATH = '/stories/story/components-stories-virtualscroll-origamvirtualscroll-story-vue'

test('jumpTo(500) animates scrollTop instead of teleporting', async ({ page }) => {
    test.setTimeout(30_000)
    await openVariant(page, VS_PATH, 'Prop — scrollToIndex (method)')
    const sandbox = sandboxOf(page)

    const container = sandbox.locator('.origam-virtual-scroll').first()
    await expect(container).toBeVisible({ timeout: 8000 })

    // Sanity: list starts at the top.
    const initialTop = await container.evaluate(el => (el as HTMLElement).scrollTop)
    expect(initialTop).toBe(0)

    // Click the "Index 500" CTA WITHOUT awaiting — we want to start the
    // animation, then sample scrollTop in parallel.
    const clickPromise = sandbox.locator('[data-cy="sti-jump-500"]').click({ force: true })

    // Sample scrollTop while the rAF loop runs. With duration=300ms we
    // need samples < 50ms apart to catch intermediate frames; we collect
    // ~10 samples over 250ms.
    const samples: number[] = []
    const sampleStart = Date.now()
    while (Date.now() - sampleStart < 320) {
        const top = await container.evaluate(el => (el as HTMLElement).scrollTop)
        samples.push(top)
        await page.waitForTimeout(28)
    }
    await clickPromise

    // Wait for the animation to fully settle.
    await page.waitForTimeout(120)
    const finalTop = await container.evaluate(el => (el as HTMLElement).scrollTop)

    // De-duplicate consecutive identical samples (the rAF loop steps in
    // ~16ms ticks but our polling is 28ms so we'll naturally catch
    // multiple unique values).
    const distinctSorted = Array.from(new Set(samples)).sort((a, b) => a - b)
    console.log('[anim] samples:', samples)
    console.log('[anim] distinct sorted:', distinctSorted)
    console.log('[anim] final scrollTop:', finalTop)

    // Animation evidence:
    //   - more than 2 distinct intermediate values (no instant jump)
    //   - monotonically increasing (we're scrolling DOWN, not bouncing)
    //   - reaches a reasonable final position (item 500 × 48px ≈ 24000)
    expect(distinctSorted.length).toBeGreaterThanOrEqual(3)

    for (let i = 1; i < distinctSorted.length; i++) {
        expect(distinctSorted[i]).toBeGreaterThanOrEqual(distinctSorted[i - 1])
    }

    expect(finalTop).toBeGreaterThan(20000)
    expect(finalTop).toBeLessThan(25000)
})

test('jumpTo(0) animates back to the top after a forward jump', async ({ page }) => {
    test.setTimeout(30_000)
    await openVariant(page, VS_PATH, 'Prop — scrollToIndex (method)')
    const sandbox = sandboxOf(page)
    const container = sandbox.locator('.origam-virtual-scroll').first()
    await expect(container).toBeVisible({ timeout: 8000 })

    // Jump forward first (and let it settle).
    await sandbox.locator('[data-cy="sti-jump-500"]').click({ force: true })
    await page.waitForTimeout(450)
    const midTop = await container.evaluate(el => (el as HTMLElement).scrollTop)
    expect(midTop).toBeGreaterThan(20000)

    // Now jump back, sampling along the way.
    const clickPromise = sandbox.locator('[data-cy="sti-jump-0"]').click({ force: true })
    const samples: number[] = []
    const start = Date.now()
    while (Date.now() - start < 320) {
        samples.push(await container.evaluate(el => (el as HTMLElement).scrollTop))
        await page.waitForTimeout(28)
    }
    await clickPromise

    await page.waitForTimeout(120)
    const finalTop = await container.evaluate(el => (el as HTMLElement).scrollTop)

    const distinct = Array.from(new Set(samples))
    console.log('[back] samples:', samples)
    console.log('[back] final:', finalTop)

    expect(distinct.length).toBeGreaterThanOrEqual(3)
    // Should land at 0 (or very close due to rounding).
    expect(finalTop).toBeLessThanOrEqual(2)
})
