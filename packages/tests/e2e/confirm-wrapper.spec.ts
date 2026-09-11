import { expect, test } from '@playwright/test'

const STORY_PATH = '/stories/story/components-stories-confirmwrapper-origamconfirmwrapper-story-vue'

test.describe('OrigamConfirmWrapper', () => {
	test('Default (field shorthand) — wrapper renders with two inputs', async ({ page }) => {
		await page.goto(STORY_PATH)
		await page.waitForLoadState('networkidle')
		await page.getByText('Prop — field (shorthand)', { exact: true }).first().click()
		await page.waitForTimeout(800)

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		// `confirm-wrapper-default` is the OUTER fixture <div> with
		// padding/max-width — the OrigamConfirmWrapper sits inside it
		// and carries the data-cy `confirm-wrapper-default-input`. Assert
		// the wrapper class on the actual component, not on the styling
		// container (which has no class). Pre-fix the test asserted the
		// class on the outer div and only ever passed by mistake when
		// the suite was first written.
		const fixture = sandbox.locator('[data-cy="confirm-wrapper-default"]')
		await expect(fixture).toBeVisible({ timeout: 5000 })
		const wrapper = sandbox.locator('[data-cy="confirm-wrapper-default-input"]')
		await expect(wrapper).toHaveClass(/origam-confirm-wrapper/, { timeout: 3000 })
	})

	test('Direction — wrapper renders with direction variant', async ({ page }) => {
		await page.goto(STORY_PATH)
		await page.waitForLoadState('networkidle')
		await page.getByText('Prop — direction', { exact: true }).first().click()
		await page.waitForTimeout(800)

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const wrapper = sandbox.locator('[data-cy="confirm-wrapper-direction"]')
		await expect(wrapper).toBeVisible({ timeout: 5000 })
	})

	test('Label and prepend icon — wrapper with label renders', async ({ page }) => {
		await page.goto(STORY_PATH)
		await page.waitForLoadState('networkidle')
		await page.getByText('Prop — label & prependIcon', { exact: true }).first().click()
		await page.waitForTimeout(800)

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const wrapper = sandbox.locator('[data-cy="confirm-wrapper-label"]')
		await expect(wrapper).toBeVisible({ timeout: 5000 })
	})

	test('States — wrapper renders with state controls', async ({ page }) => {
		await page.goto(STORY_PATH)
		await page.waitForLoadState('networkidle')
		await page.getByText('Prop — disabled, readonly & error', { exact: true }).first().click()
		await page.waitForTimeout(800)

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const wrapper = sandbox.locator('[data-cy="confirm-wrapper-states"]')
		await expect(wrapper).toBeVisible({ timeout: 5000 })
	})

	test('Validation — wrapper renders with validation status', async ({ page }) => {
		await page.goto(STORY_PATH)
		await page.waitForLoadState('networkidle')
		await page.getByText('Prop — confirm (mismatch validation)', { exact: true }).first().click()
		await page.waitForTimeout(800)

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const wrapper = sandbox.locator('[data-cy="confirm-wrapper-validation"]')
		await expect(wrapper).toBeVisible({ timeout: 5000 })
		const status = sandbox.locator('[data-cy="confirm-wrapper-validation-status"]')
		await expect(status).toBeVisible({ timeout: 5000 })
	})

	test('Slot — header — custom header renders inside wrapper', async ({ page }) => {
		await page.goto(STORY_PATH)
		await page.waitForLoadState('networkidle')
		await page.getByText('Slot — header', { exact: true }).first().click()
		await page.waitForTimeout(800)

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const wrapper = sandbox.locator('[data-cy="confirm-wrapper-slot-header"]')
		await expect(wrapper).toBeVisible({ timeout: 5000 })
	})

	test('Slot — default + confirm — custom fields render', async ({ page }) => {
		await page.goto(STORY_PATH)
		await page.waitForLoadState('networkidle')
		await page.getByText('Slot — default & confirm', { exact: true }).first().click()
		await page.waitForTimeout(800)

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const field = sandbox.locator('[data-cy="confirm-wrapper-custom-field"]')
		await expect(field).toBeVisible({ timeout: 5000 })
		const confirmField = sandbox.locator('[data-cy="confirm-wrapper-confirm-field"]')
		await expect(confirmField).toBeVisible({ timeout: 5000 })
	})

	test('Emit — update:modelValue — wrapper renders for emit test', async ({ page }) => {
		await page.goto(STORY_PATH)
		await page.waitForLoadState('networkidle')
		await page.getByText('Emit — update:modelValue & update:confirm', { exact: true }).first().click()
		await page.waitForTimeout(800)

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const wrapper = sandbox.locator('[data-cy="confirm-wrapper-emit"]')
		await expect(wrapper).toBeVisible({ timeout: 5000 })
	})

	test('Playground — wrapper renders with all controls', async ({ page }) => {
		await page.goto(STORY_PATH)
		await page.waitForLoadState('networkidle')
		await page.getByText('Default', { exact: true }).first().click()
		await page.waitForTimeout(800)

		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const fixture = sandbox.locator('[data-cy="confirm-wrapper-playground"]')
		await expect(fixture).toBeVisible({ timeout: 5000 })
		// Assert the class on the actual OrigamConfirmWrapper, not on
		// the outer fixture <div>. See note in `Default` test above.
		const wrapper = sandbox.locator('[data-cy="confirm-wrapper-playground-input"]')
		await expect(wrapper).toHaveClass(/origam-confirm-wrapper/, { timeout: 3000 })
	})
})
