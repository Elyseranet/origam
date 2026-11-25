import { expect, test } from '@playwright/test'

/**
 * #1357 — Echap sur un overlay, vrai clavier.
 * Story Dialog, Variant 21 « Nested overlays - Escape stacking ».
 */
const STORY_ID = 'components-stories-dialog-origamdialog-story-vue'
const NESTED = 21
const url = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-${NESTED}`

test.describe('Overlay — Echap (#1357)', () => {
	test.setTimeout(60000)

	test('overlays empiles : un Echap ferme le haut, le second ferme le parent', async ({ page }) => {
		await page.goto(url, { waitUntil: 'domcontentloaded' })
		const sb = page.frameLocator('iframe[src*="__sandbox"]')
		await sb.locator('[data-cy="nested-outer-open"]').click()
		await sb.locator('[data-cy="nested-inner-open"]').click()
		const content = sb.locator('.origam-overlay__content:visible')
		await expect(content).toHaveCount(2, { timeout: 12000 })
		await page.waitForTimeout(300)
		await page.keyboard.press('Escape')
		await expect(content).toHaveCount(1, { timeout: 5000 })
		await page.waitForTimeout(500)
		await expect(content).toHaveCount(1)
		await page.keyboard.press('Escape')
		await expect(content).toHaveCount(0, { timeout: 5000 })
	})

	test('menu empile dans un dialog : un Echap ferme le menu, pas le dialog', async ({ page }) => {
		await page.goto(url, { waitUntil: 'domcontentloaded' })
		const sb = page.frameLocator('iframe[src*="__sandbox"]')
		await sb.locator('[data-cy="nested-outer-open"]').click()
		await sb.locator('[data-cy="nested-menu-open"]').click()
		const item = sb.getByText('Menu item', { exact: true })
		await expect(item).toBeVisible({ timeout: 12000 })
		await page.waitForTimeout(300)
		await page.keyboard.press('Escape')
		await expect(item).not.toBeVisible({ timeout: 5000 })
		await page.waitForTimeout(500)
		await expect(sb.locator('[data-cy="nested-inner-open"]')).toBeVisible()
	})

	// #1492 — le keydown du select ferme son menu AVANT les ecouteurs window ;
	// le dialog ne doit pas se croire au sommet pour le MEME evenement.
	test('select ouvert dans un dialog : un Echap ferme le menu, pas le dialog (#1492)', async ({ page }) => {
		await page.goto(url, { waitUntil: 'domcontentloaded' })
		const sb = page.frameLocator('iframe[src*="__sandbox"]')
		await sb.locator('[data-cy="nested-outer-open"]').click()
		const select = sb.locator('[data-cy="nested-select"]')
		await select.click()
		const listbox = sb.locator('[role="listbox"]')
		await expect(listbox).toBeVisible({ timeout: 12000 })
		await page.waitForTimeout(300)
		await page.keyboard.press('Escape')
		await expect(listbox).toHaveCount(0, { timeout: 5000 })
		await page.waitForTimeout(800)
		await expect(sb.locator('[data-cy="nested-inner-open"]')).toBeVisible()
		await page.keyboard.press('Escape')
		await expect(sb.locator('[data-cy="nested-inner-open"]')).toHaveCount(0, { timeout: 5000 })
	})
})
