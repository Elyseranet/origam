import { expect, test, type Page } from '@playwright/test'

/**
 * Regression spec for OrigamWindow runtime issues that ship-blocked the
 * Lot B3 stories (window/slide/virtual). The user reported three bugs:
 *
 *   1. Only "Slide 1" is visible; the rest of the slide area is empty
 *      because every `.origam-window-item` collapsed to ~23px (text
 *      height) — no `flex` / `height` rule existed on the wrapper.
 *
 *   2. Arrows wouldn't render on most variants (Default, Direction,
 *      Continuous, Touch). Vue 3 coerces an unset `Boolean | string`
 *      union prop to `false`, so the template's `v-if="showArrows !== false"`
 *      fell through and collapsed the `__controls` block to a comment.
 *
 *   3. Even when arrows DID render (Show arrows variant), the next-button
 *      icon was `mdi-chevron-left` and prev was `mdi-chevron-right` —
 *      visually inverted vs the navigation direction.
 *
 * These tests pin the post-fix invariants so the bugs don't regress.
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyPath: string, variant: string) => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(900)
}

const WINDOW_PATH = '/stories/story/components-stories-window-origamwindow-story-vue'

// ─── Slide sizing ──────────────────────────────────────────────────────────

test.describe('OrigamWindow — slide sizing', () => {
    test('active slide fills the host height (not the 23px text-collapse)', async ({ page }) => {
        await openVariant(page, WINDOW_PATH, 'Default')
        const sandbox = sandboxOf(page)

        const window = sandbox.locator('.origam-window').first()
        await expect(window).toBeVisible({ timeout: 8000 })

        const hostBox = await window.boundingBox()
        const activeBox = await sandbox.locator('.origam-window-item--active').first().boundingBox()

        expect(hostBox).not.toBeNull()
        expect(activeBox).not.toBeNull()

        // Tolerate the host's 1px border but otherwise the slide must fill.
        const innerHeight = (hostBox!.height) - 2
        expect(activeBox!.height).toBeGreaterThanOrEqual(innerHeight - 4)
        expect(activeBox!.height).toBeLessThanOrEqual(hostBox!.height)
    })

    test('inner slide content (height: 100%) gets a real height to expand into', async ({ page }) => {
        await openVariant(page, WINDOW_PATH, 'Default')
        const sandbox = sandboxOf(page)

        const innerSlide = sandbox.locator('.origam-window-item--active > div').first()
        await expect(innerSlide).toBeVisible({ timeout: 8000 })

        const box = await innerSlide.boundingBox()
        // Pre-fix this was ~23px (line height of "Slide 1"). Anything
        // above 100px proves the wrapper now provides space.
        expect(box!.height).toBeGreaterThan(100)
    })
})

// ─── Arrow rendering ───────────────────────────────────────────────────────

test.describe('OrigamWindow — arrows render by default', () => {
    test('Default variant exposes the __controls block', async ({ page }) => {
        await openVariant(page, WINDOW_PATH, 'Default')
        const sandbox = sandboxOf(page)

        await expect(sandbox.locator('.origam-window').first()).toBeVisible({ timeout: 8000 })
        const controlsCount = await sandbox.locator('.origam-window__controls').count()
        expect(controlsCount).toBe(1)
    })

    test('Default variant exposes the next button (canMoveForward at index 0)', async ({ page }) => {
        await openVariant(page, WINDOW_PATH, 'Default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-window').first()).toBeVisible({ timeout: 8000 })

        const nextCount = await sandbox.locator('.origam-window__next').count()
        expect(nextCount).toBe(1)
    })

    test('next-button uses chevron-right, prev-button uses chevron-left', async ({ page }) => {
        // Show arrows variant has both arrows visible after one navigation.
        await openVariant(page, WINDOW_PATH, 'Show arrows')
        const sandbox = sandboxOf(page)
        const next = sandbox.locator('.origam-window__next').first()
        await expect(next).toBeVisible({ timeout: 8000 })

        // Click next once so canMoveBack becomes true and prev appears.
        await next.click({ force: true })
        await page.waitForTimeout(500)

        const nextIcon = await next.locator('i').first().getAttribute('class') ?? ''
        const prevIcon = await sandbox.locator('.origam-window__prev i').first().getAttribute('class').catch(() => '')

        expect(nextIcon).toContain('mdi-chevron-right')
        expect(prevIcon).toContain('mdi-chevron-left')
    })
})

// ─── Navigation ────────────────────────────────────────────────────────────

test.describe('OrigamWindow — clicking arrows rotates active item', () => {
    test('Default variant: clicking next moves activeIndex 0 → 1 → 2', async ({ page }) => {
        await openVariant(page, WINDOW_PATH, 'Default')
        const sandbox = sandboxOf(page)
        const window = sandbox.locator('.origam-window').first()
        await expect(window).toBeVisible({ timeout: 8000 })

        // Helper: which data-cy is currently the active item?
        const activeCy = async () =>
            sandbox.locator('.origam-window-item--active').first().getAttribute('data-cy')

        expect(await activeCy()).toBe('item-default-1')

        await sandbox.locator('.origam-window__next').first().click({ force: true })
        await page.waitForTimeout(500)
        expect(await activeCy()).toBe('item-default-2')

        await sandbox.locator('.origam-window__next').first().click({ force: true })
        await page.waitForTimeout(500)
        expect(await activeCy()).toBe('item-default-3')
    })

    test('clicking prev rolls activeIndex back', async ({ page }) => {
        await openVariant(page, WINDOW_PATH, 'Default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-window').first()).toBeVisible({ timeout: 8000 })

        // Walk forward two steps.
        await sandbox.locator('.origam-window__next').first().click({ force: true })
        await page.waitForTimeout(450)
        await sandbox.locator('.origam-window__next').first().click({ force: true })
        await page.waitForTimeout(450)

        // Now walk back — prev should be visible since activeIndex > 0.
        await sandbox.locator('.origam-window__prev').first().click({ force: true })
        await page.waitForTimeout(450)
        const cy = await sandbox.locator('.origam-window-item--active').first().getAttribute('data-cy')
        expect(cy).toBe('item-default-2')
    })
})

// ─── Arrow positioning ─────────────────────────────────────────────────────

/**
 * Pre-fix the `__controls` container was rendered at `width: 100%` with
 * `padding: 0 16px` in the default `box-sizing: content-box`, so its actual
 * width was `host + 32px`. The prev button drifted 2px left of the host
 * edge and the next button got clipped 16px past the right edge by the
 * window's `overflow: hidden`. Adding `box-sizing: border-box` brought
 * everything back inside.
 */

test.describe('OrigamWindow — arrow positioning', () => {
    test('START state: controls fit inside the host, next is ~16px from right', async ({ page }) => {
        await openVariant(page, WINDOW_PATH, 'Default')
        const sandbox = sandboxOf(page)

        const window = sandbox.locator('.origam-window').first()
        await expect(window).toBeVisible({ timeout: 8000 })

        const hostBox = await window.boundingBox()
        const controlsBox = await sandbox.locator('.origam-window__controls').first().boundingBox()
        const nextBox = await sandbox.locator('.origam-window__next').first().boundingBox()

        // Controls must NOT overflow the host (it was 30px wider before fix).
        expect(controlsBox!.width).toBeLessThanOrEqual(hostBox!.width + 1)

        // Next button must sit INSIDE the host (was 16px past the right edge).
        expect(nextBox!.x + nextBox!.width).toBeLessThanOrEqual(hostBox!.x + hostBox!.width + 1)

        const rightGap = (hostBox!.x + hostBox!.width) - (nextBox!.x + nextBox!.width)
        expect(rightGap).toBeGreaterThanOrEqual(15)
        expect(rightGap).toBeLessThanOrEqual(20)
    })

    test('MIDDLE state: prev/next symmetrical (~16px from each host edge)', async ({ page }) => {
        await openVariant(page, WINDOW_PATH, 'Default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-window').first()).toBeVisible({ timeout: 8000 })

        await sandbox.locator('.origam-window__next').first().click({ force: true })
        await page.waitForTimeout(500)

        const hostBox = await sandbox.locator('.origam-window').first().boundingBox()
        const prevBox = await sandbox.locator('.origam-window__prev').first().boundingBox()
        const nextBox = await sandbox.locator('.origam-window__next').first().boundingBox()

        const leftGap = prevBox!.x - hostBox!.x
        const rightGap = (hostBox!.x + hostBox!.width) - (nextBox!.x + nextBox!.width)

        expect(leftGap).toBeGreaterThanOrEqual(15)
        expect(leftGap).toBeLessThanOrEqual(20)
        expect(rightGap).toBeGreaterThanOrEqual(15)
        expect(rightGap).toBeLessThanOrEqual(20)
        // Allow 2px asymmetry — host has a 1px border that adds to one side.
        expect(Math.abs(leftGap - rightGap)).toBeLessThanOrEqual(2)
    })

    test('END state: prev sits ~16px inside the host left edge (not clipped)', async ({ page }) => {
        await openVariant(page, WINDOW_PATH, 'Default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-window').first()).toBeVisible({ timeout: 8000 })

        await sandbox.locator('.origam-window__next').first().click({ force: true })
        await page.waitForTimeout(500)
        await sandbox.locator('.origam-window__next').first().click({ force: true })
        await page.waitForTimeout(500)

        const hostBox = await sandbox.locator('.origam-window').first().boundingBox()
        const prevBox = await sandbox.locator('.origam-window__prev').first().boundingBox()

        const leftGap = prevBox!.x - hostBox!.x
        expect(leftGap).toBeGreaterThanOrEqual(15)
        expect(leftGap).toBeLessThanOrEqual(20)
    })
})
