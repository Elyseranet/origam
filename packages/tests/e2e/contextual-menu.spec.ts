import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId.
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamContextualMenu (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Prop — items (right-click a zone)
 *   3  → Prop — title
 *   4  → Prop — items with icons
 *   5  → Slot — default (custom content)
 *   6  → Emit — update:modelValue
 *   7  → Events - update:modelValue
 *   8  → Events - contextmenu
 *   9  → Slots - Default
 *  10  → Slots - Activator
 *  11  → Default (playground)
 */
const STORY_ID   = 'components-stories-contextualmenu-origamcontextualmenu-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamContextualMenu', () => {
    test.setTimeout(45000)

    test('Default — right-click zone renders', async ({ page }) => {
        await page.goto(variantUrl(2))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const zone = sandbox.locator('[data-cy="contextual-menu-default-zone"]')
        await expect(zone).toBeVisible({ timeout: 20000 })
    })

    test('Default — right-click opens contextual menu', async ({ page }) => {
        await page.goto(variantUrl(2))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const zone = sandbox.locator('[data-cy="contextual-menu-default-zone"]')
        await expect(zone).toBeVisible({ timeout: 20000 })

        await zone.click({ button: 'right' })
        await page.waitForTimeout(500)

        const menu = sandbox.locator('.origam-menu')
        await expect(menu).toBeVisible({ timeout: 5000 })
    })

    test('With title — right-click zone renders', async ({ page }) => {
        await page.goto(variantUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const zone = sandbox.locator('[data-cy="contextual-menu-title-zone"]')
        await expect(zone).toBeVisible({ timeout: 20000 })
    })

    test('Rich items (icons) — right-click zone renders', async ({ page }) => {
        await page.goto(variantUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const zone = sandbox.locator('[data-cy="contextual-menu-icons-zone"]')
        await expect(zone).toBeVisible({ timeout: 20000 })
    })

    test('Slot — default — right-click zone renders for custom content', async ({ page }) => {
        await page.goto(variantUrl(5))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const zone = sandbox.locator('[data-cy="contextual-menu-slot-zone"]')
        await expect(zone).toBeVisible({ timeout: 20000 })
    })

    test('Emit — update:modelValue — right-click zone renders', async ({ page }) => {
        await page.goto(variantUrl(6))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const zone = sandbox.locator('[data-cy="contextual-menu-emit-zone"]')
        await expect(zone).toBeVisible({ timeout: 20000 })
    })

    test('Playground — right-click zone renders', async ({ page }) => {
        await page.goto(variantUrl(11))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const zone = sandbox.locator('[data-cy="contextual-menu-playground-zone"]')
        await expect(zone).toBeVisible({ timeout: 20000 })
    })
})
