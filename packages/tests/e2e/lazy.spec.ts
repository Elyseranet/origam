import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId.
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamLazy (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Events - update:modelValue
 *   3  → Slots - Default
 *   4  → Prop — height (scroll to reveal)
 *   5  → Prop — modelValue (controlled)
 *   6  → Prop — options (intersection margin)
 *   7  → Slot — default
 *   8  → Emit — update:modelValue
 *   9  → Default (playground)
 */
const STORY_ID   = 'components-stories-lazy-origamlazy-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamLazy', () => {
    test.setTimeout(45000)

    test('Basic — scroll to reveal variant renders wrapper', async ({ page }) => {
        await page.goto(variantUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-lazy').first()).toBeAttached({ timeout: 20000 })
    })

    test('Controlled (v-model) — content hidden initially, shown after toggle', async ({ page }) => {
        await page.goto(variantUrl(5))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-lazy').first()).toBeAttached({ timeout: 20000 })

        // Click toggle button to reveal content
        await sandbox.getByRole('button', { name: /toggle/i }).click()
        await expect(sandbox.getByText(/Content is visible: true/)).toBeVisible({ timeout: 5000 })
    })

    test('With intersection options variant — wrapper renders', async ({ page }) => {
        await page.goto(variantUrl(6))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-lazy').first()).toBeAttached({ timeout: 20000 })
    })

    test('Slot — default renders custom slot content when revealed', async ({ page }) => {
        await page.goto(variantUrl(7))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // Click "Reveal" button to show content
        await sandbox.getByRole('button', { name: /reveal/i }).click()
        await expect(sandbox.locator('.origam-lazy').first()).toBeAttached({ timeout: 20000 })
    })

    test('Emit — update:modelValue variant renders lazy wrapper', async ({ page }) => {
        await page.goto(variantUrl(8))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-lazy').first()).toBeAttached({ timeout: 20000 })
    })

    test('Playground — lazy wrapper renders with configurable height', async ({ page }) => {
        await page.goto(variantUrl(9))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-lazy').first()).toBeAttached({ timeout: 20000 })
    })
})
