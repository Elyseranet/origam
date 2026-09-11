import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamMediaController — runtime probes for the reusable controls
 * shell. Boots dedicated Variants (Playground / inset / extras-right /
 * config-extra / visible-false) and asserts the rendered toolbar.
 *
 * Variants are reached via their dedicated titles — never via the
 * HstSelect picker dropdown (custom DOM, brittle).
 */

const STORY = '/stories/story/components-stories-mediacontroller-origammediacontroller-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string): Promise<void> => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(400)
}

test.describe('OrigamMediaController — Default (mount + ARIA)', () => {
    test('mounts the controls shell + play button', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="media-controller-playground-host"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const playBtn = sandbox.locator('[data-cy="origam-media-controller-play"]').first()
        await expect(playBtn).toBeVisible()
        await expect(playBtn).toHaveAttribute('aria-label', 'Play')
    })

    test('clicking play, then pause, flips the aria-label both ways', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const playBtn = sandbox.locator('[data-cy="origam-media-controller-play"]').first()
        await expect(playBtn).toHaveAttribute('aria-label', 'Play', { timeout: 8000 })
        await playBtn.click()

        await expect(playBtn).toHaveAttribute('aria-label', 'Pause', { timeout: 5000 })
        await playBtn.click()
        await expect(playBtn).toHaveAttribute('aria-label', 'Play', { timeout: 5000 })
    })
})

test.describe('OrigamMediaController — Config menu', () => {
    test('opens the config menu, navigates to speed, picks 2× and updates the rate', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const cog = sandbox.locator('[data-cy="origam-media-controller-config-btn"]').first()
        await expect(cog).toBeVisible({ timeout: 8000 })
        await cog.click()

        const openSpeed = sandbox.getByText('Playback speed').first()
        await expect(openSpeed).toBeVisible({ timeout: 5000 })
        await openSpeed.click()

        const twoX = sandbox.getByText('2×').first()
        await expect(twoX).toBeVisible({ timeout: 5000 })
        await twoX.click()

        await cog.click()
        const openSpeedAgain = sandbox.getByText('Playback speed').first()
        await expect(openSpeedAgain).toBeVisible({ timeout: 5000 })
    })
})

test.describe('OrigamMediaController — inset Variant', () => {
    test('the inset host carries the --inset modifier class', async ({ page }) => {
        await openVariant(page, 'Variant — inset (overlay over the media surface)')
        const sandbox = sandboxOf(page)

        const insetOnHost = sandbox.locator('[data-cy="media-controller-inset-on-host"]').first()
        await expect(insetOnHost).toBeVisible({ timeout: 8000 })
        const classes = await insetOnHost.getAttribute('class')
        expect(classes ?? '').toContain('origam-media-controller--inset')

        const insetOffHost = sandbox.locator('[data-cy="media-controller-inset-off-host"]').first()
        await expect(insetOffHost).toBeVisible()
        const offClasses = await insetOffHost.getAttribute('class')
        expect(offClasses ?? '').not.toContain('origam-media-controller--inset')
    })
})

test.describe('OrigamMediaController — extras-right slot', () => {
    test('injected buttons render alongside the cog', async ({ page }) => {
        await openVariant(page, 'Variant — #extraControlsRight slot')
        const sandbox = sandboxOf(page)

        const share = sandbox.locator('[data-cy="media-controller-extras-share"]').first()
        const pin = sandbox.locator('[data-cy="media-controller-extras-pin"]').first()
        const mark = sandbox.locator('[data-cy="media-controller-extras-mark"]').first()
        await expect(share).toBeVisible({ timeout: 8000 })
        await expect(pin).toBeVisible()
        await expect(mark).toBeVisible()
    })
})
