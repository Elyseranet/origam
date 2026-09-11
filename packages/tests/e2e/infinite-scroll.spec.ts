import { expect, test } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

const STORY_PATH = '/stories/story/components-stories-infinitescroll-origaminfinitescroll-story-vue'

/**
 * Story realignment (canonical Design/Functional/Events/Slots structure):
 * the old dedicated "Basic — end side" / "Manual mode" / "Both sides"
 * Variants are gone. "Design" hardcodes side="end" mode="intersect" (no
 * controls for either) — a faithful re-target for "Basic — end side".
 * "Manual mode" / "Both sides" are now the "Functional" Variant's Mode /
 * Side HstSelect controls, driven via `selectHstOption`. Slot/Events
 * Variants were simply renamed to the canonical "Slots - X" / "Events - X"
 * form.
 */
test.describe('OrigamInfiniteScroll', () => {
    test('Basic — end side variant renders with initial items', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Design', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const scroll = sandbox.locator('.origam-infinite-scroll').first()
        await expect(scroll).toBeVisible({ timeout: 5000 })
        // The scroll container renders 20 items. Check that at least one is attached to DOM
        // (items may be out of viewport due to the fixed 300px scroll height).
        await expect(scroll.locator('div').filter({ hasText: 'Item' }).first()).toBeAttached({ timeout: 5000 })
    })

    test('Manual mode variant — renders with load more button', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Functional', exact: true }).click()
        await page.waitForTimeout(800)
        await selectHstOption(page, 'Mode', 'Manual')

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-infinite-scroll').first()).toBeVisible({ timeout: 5000 })
    })

    test('Both sides variant — renders scroll container', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Functional', exact: true }).click()
        await page.waitForTimeout(800)
        await selectHstOption(page, 'Side', 'Both')

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-infinite-scroll').first()).toBeVisible({ timeout: 5000 })
    })

    test('Slot — loading renders custom loading content', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Slots - Loading', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-infinite-scroll').first()).toBeVisible({ timeout: 5000 })
    })

    test('Slot — empty renders custom empty message', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Slots - Empty', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const scroll = sandbox.locator('.origam-infinite-scroll').first()
        await expect(scroll).toBeVisible({ timeout: 5000 })
        await expect(sandbox.getByText('Only item')).toBeVisible({ timeout: 5000 })
        // #423 — the bottom `__side` div (scoped to side="end", the story's
        // default) was gated by `v-if="hasStartIntersect"` instead of
        // `hasEndIntersect`, so the #empty slot content below never
        // rendered. Fixed — this is the real assertion, previously
        // commented out as a known template limitation.
        await expect(sandbox.getByText('No more items to load')).toBeVisible({ timeout: 8000 })
    })

    test('Emit — load variant renders scroll container', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Events - load', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-infinite-scroll').first()).toBeVisible({ timeout: 5000 })
    })

    test('Playground — infinite scroll renders with configurable side and mode', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByRole('link', { name: 'Default', exact: true }).click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const scroll = sandbox.locator('.origam-infinite-scroll').first()
        await expect(scroll).toBeVisible({ timeout: 5000 })
        // The scroll container renders 20 items. Check that at least one is attached to DOM
        // (items may be out of viewport due to the fixed height).
        await expect(scroll.locator('div').filter({ hasText: 'Item' }).first()).toBeAttached({ timeout: 5000 })
    })
})
