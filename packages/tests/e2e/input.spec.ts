import { expect, test } from '@playwright/test'

const STORY_PATH = '/stories/story/components-stories-input-origaminput-story-vue'

test.describe('OrigamInput', () => {
    test('Color variant — renders outer wrapper with label', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — color', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="input-color"]')).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('[data-cy="input-color"] input').first()).toBeVisible({ timeout: 3000 })
    })

    test('Hint — hint text visible when persistentHint=true', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — hint & persistentHint', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="input-hint"]')).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('.origam-messages').first()).toBeVisible({ timeout: 3000 })
    })

    test('Prepend & append — icons visible outside field', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — prependIcon & appendIcon', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="input-adjacent"]')).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('.origam-input__prepend').first()).toBeVisible({ timeout: 3000 })
        await expect(sandbox.locator('.origam-input__append').first()).toBeVisible({ timeout: 3000 })
    })

    test('States — disabled input has disabled attribute', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — disabled, readonly & error', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="input-states"]')).toBeVisible({ timeout: 5000 })
    })

    test('Emit update:modelValue — status updates after typing', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Emit — update:modelValue', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const input = sandbox.locator('[data-cy="input-emit-update"] input').first()
        await expect(input).toBeVisible({ timeout: 5000 })
        await input.fill('typed value')
        const status = sandbox.locator('[data-cy="input-emit-status"]')
        await expect(status).toContainText('typed value', { timeout: 3000 })
    })

    test('Emit click:prepend / click:append — clicking icons fires events', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Emit — click:prepend & click:append', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="input-emit-click"]')).toBeVisible({ timeout: 5000 })
        const prependIcon = sandbox.locator('.origam-input__prepend .origam-icon').first()
        await expect(prependIcon).toBeVisible({ timeout: 3000 })
        await prependIcon.click()
    })

    test('Slot prepend — custom prepend slot renders', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Slot — prepend', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="input-slot-prepend"]')).toBeVisible({ timeout: 5000 })
    })

    test('Playground — renders with all controls', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Default', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="input-playground"]')).toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('[data-cy="input-playground-status"]')).toContainText('value =', { timeout: 3000 })
    })
})
