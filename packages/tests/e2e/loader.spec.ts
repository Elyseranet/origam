import { expect, test } from '@playwright/test'
import { fillHstText, toggleHstCheckbox } from './_support/histoire-controls'

const STORY_PATH = '/stories/story/components-stories-loader-origamloader-story-vue'

// issue #444 — no dedicated spec existed for <OrigamLoader> at all
// (btn-loader-debug.spec.ts tests OrigamBtn's INTERNAL loader, never
// references .origam-loader or this story). Written alongside the fix per
// the "test-as-you-build" rule.

test.describe('OrigamLoader', () => {
    test('Design — renders the default indeterminate spinner while loading', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Design', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const loader = sandbox.locator('[data-cy="loader-design"]')
        await expect(loader).toBeVisible({ timeout: 5000 })
        await expect(loader.locator('.origam-loader__progress')).toBeVisible({ timeout: 3000 })
        await expect(loader).toHaveAttribute('aria-busy', 'true')
    })

    // #444 — loadingText was declared and documented, read nowhere: the
    // aria-label never changed no matter what a consumer passed.
    test('Functional — loadingText sets the aria-label (default key, then a custom key)', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Functional', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const loader = sandbox.locator('[data-cy="loader-functional"]')
        await expect(loader).toBeVisible({ timeout: 5000 })
        await expect(loader).toHaveAttribute('aria-label', 'Loading...')

        await fillHstText(page, 'Loading Text', 'origam.data_iterator.loading_text')
        await page.waitForTimeout(300)

        await expect(loader).toHaveAttribute('aria-label', 'Loading items...')
    })

    // #444 — the SCSS `&--fullscreen` block (5 tokens) had no prop, no
    // mechanism anywhere to reach it. Now a real, testable toggle.
    test('Functional — fullscreen toggles the origam-loader--fullscreen class', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Functional', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const loader = sandbox.locator('[data-cy="loader-functional"]')
        await expect(loader).toBeVisible({ timeout: 5000 })
        await expect(loader).not.toHaveClass(/origam-loader--fullscreen/)

        await toggleHstCheckbox(page, 'Fullscreen')
        await page.waitForTimeout(300)

        await expect(loader).toHaveClass(/origam-loader--fullscreen/)
    })

    test('Slots - Default — idle content renders when not loading', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Slots - Default', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const loader = sandbox.locator('[data-cy="loader-slot-default"]')
        await expect(loader).toBeVisible({ timeout: 5000 })
        await expect(loader).toContainText('Custom idle content')
        await expect(loader.locator('.origam-loader__progress')).toHaveCount(0)
    })

    test('Slots - Loader — custom loader content replaces the default spinner', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Slots - Loader', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const loader = sandbox.locator('[data-cy="loader-slot-loader"]')
        await expect(loader).toBeVisible({ timeout: 5000 })
        await expect(loader).toContainText('Loading, please wait...')
        await expect(loader.locator('.origam-loader__progress')).toHaveCount(0)
    })

    test('Playground — all controls render', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Default', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="loader-playground"]')).toBeVisible({ timeout: 5000 })
    })
})
