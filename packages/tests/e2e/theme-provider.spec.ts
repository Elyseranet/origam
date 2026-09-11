import { expect, test } from '@playwright/test'

const STORY_PATH = '/stories/story/components-stories-themeprovider-origamthemeprovider-story-vue'

test.describe('OrigamThemeProvider', () => {
    test('Light theme variant — wrapper has data-theme="light"', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — theme (light)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-theme="light"]').first()).toBeAttached({ timeout: 5000 })
    })

    test('Dark theme variant — wrapper has data-theme="dark"', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — theme (dark)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-theme="dark"]').first()).toBeAttached({ timeout: 5000 })
    })

    test('Mode (light) variant — wrapper has data-mode="light"', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — mode (light)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-mode="light"]').first()).toBeAttached({ timeout: 5000 })
    })

    test('Mode (dark) variant — wrapper has data-mode="dark"', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — mode (dark)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-mode="dark"]').first()).toBeAttached({ timeout: 5000 })
    })

    test('theme + mode variant — wrapper carries both data-theme and data-mode', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — theme + mode', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('.origam-theme-provider').first()
        await expect(wrapper).toBeAttached({ timeout: 5000 })
        expect(await wrapper.getAttribute('data-theme')).toBe('brand-a')
        expect(await wrapper.getAttribute('data-mode')).toBe('dark')
    })

    test('Auto (inherits from ancestor) — no data-theme attribute is rendered', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — theme (auto)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // With theme='auto', no data-theme attribute should be emitted
        const wrapper = sandbox.locator('.origam-theme-provider').first()
        await expect(wrapper).toBeAttached({ timeout: 5000 })
        const attr = await wrapper.getAttribute('data-theme')
        expect(attr).toBeNull()
    })

    test('Nested providers — both light and dark data-theme attributes coexist', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — nested providers', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-theme="light"]').first()).toBeAttached({ timeout: 5000 })
        await expect(sandbox.locator('[data-theme="dark"]').first()).toBeAttached({ timeout: 5000 })
    })

    test('Tag variant — wrapper renders as the specified tag', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — tag', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // Default tag in this variant is 'section'
        await expect(sandbox.locator('section.origam-theme-provider').first()).toBeAttached({ timeout: 5000 })
    })

    test('Slot — default renders button from slot', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Slot — default', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.getByRole('button', { name: /From slot/i })).toBeVisible({ timeout: 5000 })
    })

    test('Playground — theme switcher applies correct data-theme', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Default', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // Default is 'light'
        await expect(sandbox.locator('[data-theme="light"]').first()).toBeAttached({ timeout: 5000 })
        await expect(sandbox.getByRole('button', { name: /Themed button/i })).toBeVisible({ timeout: 5000 })
    })
})
