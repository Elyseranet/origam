import { expect, test } from '@playwright/test'

/**
 * #1454 — OrigamDrawer `temporary` avec voile : modal (aria-modal), piege a focus,
 * Echap, retour du focus au declencheur.
 * Story Drawer, Variant 3 « Events - update:modelValue » (drawer temporary + bouton Toggle).
 */
const STORY_ID = 'components-stories-drawer-origamdrawer-story-vue'
const url = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-3`

test.describe('Drawer temporary — a11y (#1454)', () => {
	test.setTimeout(60000)

	test('aria-modal, piege a focus, Echap et retour du focus', async ({ page }) => {
		await page.goto(url, { waitUntil: 'domcontentloaded' })
		const sb = page.frameLocator('iframe[src*="__sandbox"]')
		const toggle = sb.locator('button[aria-label="Toggle"]')
		const drawer = sb.locator('.origam-drawer--temporary')

		await toggle.click({ timeout: 12000 })
		await expect(drawer).toBeVisible({ timeout: 12000 })
		await expect(drawer).toHaveAttribute('aria-modal', 'true')
		await expect(drawer).toHaveAttribute('role', 'dialog')
		await page.waitForTimeout(300)

		// Tab ne sort jamais du tiroir.
		for (let i = 0; i < 4; i++) {
			await page.keyboard.press('Tab')
			const inside = await drawer.evaluate(el => el.contains(document.activeElement))
			expect(inside, `Tab #${i + 1} reste dans le tiroir`).toBe(true)
		}

		await page.keyboard.press('Escape')
		await expect(drawer).toHaveCount(0, { timeout: 5000 })
		await expect(toggle).toBeFocused()
	})
})
