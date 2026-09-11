import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamApp (0-based) :
 *   0  → Design
 *   1  → Functional
 *   2  → Prop — fullHeight
 *   3  → Prop — drawer (with Drawer child)
 *   4  → Slots - Default
 *   5  → Default (playground)
 */

const STORY_ID   = 'components-stories-app-origamapp-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamApp', () => {
	test.setTimeout(45000)

	test('Default — app shell renders with toolbar and main', async ({ page }) => {
		await page.goto(variantUrl(6))

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const app = sandbox.locator('[data-cy="app-playground"]')
		await expect(app).toBeVisible({ timeout: 12000 })
		await expect(app).toHaveClass(/origam-app/)
	})

	test('Default — toolbar renders inside app', async ({ page }) => {
		await page.goto(variantUrl(6))

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const toolbar = sandbox.locator('[data-cy="app-playground-toolbar"]')
		await expect(toolbar).toBeVisible({ timeout: 12000 })
	})

	test('Default — main area renders inside app', async ({ page }) => {
		await page.goto(variantUrl(6))

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const main = sandbox.locator('[data-cy="app-playground-main"]')
		await expect(main).toBeVisible({ timeout: 12000 })
	})

	test('With Drawer — drawer toggle button renders', async ({ page }) => {
		await page.goto(variantUrl(3))

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const toggle = sandbox.locator('[data-cy="app-drawer-toggle"]')
		await expect(toggle).toBeVisible({ timeout: 12000 })
	})

	test('With Drawer — navigation drawer renders inside app', async ({ page }) => {
		await page.goto(variantUrl(3))

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const nav = sandbox.locator('[data-cy="app-drawer-nav"]')
		await expect(nav).toBeVisible({ timeout: 12000 })
	})

	test('Full height — app renders with fullHeight control', async ({ page }) => {
		await page.goto(variantUrl(2))

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const app = sandbox.locator('[data-cy="app-fullheight"]')
		await expect(app).toBeVisible({ timeout: 12000 })
	})

	test('Slot — default — app renders with slot content', async ({ page }) => {
		await page.goto(variantUrl(5))

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const app = sandbox.locator('[data-cy="app-slot-default"]')
		await expect(app).toBeVisible({ timeout: 12000 })
	})

	test('Playground — app renders with playground controls', async ({ page }) => {
		await page.goto(variantUrl(6))

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const app = sandbox.locator('[data-cy="app-playground"]')
		await expect(app).toBeVisible({ timeout: 12000 })
		await expect(app).toHaveClass(/origam-app/)
	})
})
