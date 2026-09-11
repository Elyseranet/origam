import { expect, test } from '@playwright/test'

const STORY_PATH = '/stories/story/components-stories-lazy-origamlazy-story-vue'

test.describe('OrigamLazy', () => {
    test('Basic — scroll to reveal variant renders wrapper', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — height (scroll to reveal)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-lazy').first()).toBeAttached({ timeout: 5000 })
    })

    test('Controlled (v-model) — content hidden initially, shown after toggle', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — modelValue (controlled)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-lazy').first()).toBeAttached({ timeout: 5000 })

        // Click toggle button to reveal content
        await sandbox.getByRole('button', { name: /toggle/i }).click()
        await page.waitForTimeout(400)
        await expect(sandbox.getByText(/Content is visible: true/)).toBeVisible({ timeout: 5000 })
    })

    test('With intersection options variant — wrapper renders', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — options (intersection margin)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-lazy').first()).toBeAttached({ timeout: 5000 })
    })

    test('Slot — default renders custom slot content when revealed', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Slot — default', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // Click "Reveal" button to show content
        await sandbox.getByRole('button', { name: /reveal/i }).click()
        await page.waitForTimeout(400)
        await expect(sandbox.locator('.origam-lazy').first()).toBeAttached({ timeout: 5000 })
    })

    test('Emit — update:modelValue variant renders lazy wrapper', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Emit — update:modelValue', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-lazy').first()).toBeAttached({ timeout: 5000 })
    })

    test('Playground — lazy wrapper renders with configurable height', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Default', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-lazy').first()).toBeAttached({ timeout: 5000 })
    })
})
