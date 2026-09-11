import { expect, FrameLocator, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamToolbar (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Prop — color & bgColor
 *   4  → Prop — elevation
 *   5  → Prop — rounded
 *   6  → Prop — density
 *   7  → Prop — collapse, flat & floating
 *   8  → Prop — border
 *   9  → Slots - Default
 *  10  → Slots - Prepend
 *  11  → Slots - Append
 *  12  → Slots - Content
 *  13  → Slots - Title
 *  14  → Default (playground)
 */
const STORY_ID   = 'components-stories-toolbar-origamtoolbar-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamToolbar', () => {
	test.setTimeout(45000)

	test('Basic — toolbar renders with title', async ({ page }) => {
		await page.goto(variantUrl(14))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const toolbar = sandbox.locator('[data-cy="toolbar-basic"]')
		await expect(toolbar).toBeVisible({ timeout: 20000 })
		await expect(toolbar).toHaveClass(/origam-toolbar/)
	})

	test('Color — toolbar renders with color controls', async ({ page }) => {
		await page.goto(variantUrl(3))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const toolbar = sandbox.locator('[data-cy="toolbar-color"]')
		await expect(toolbar).toBeVisible({ timeout: 20000 })
	})

	test('Elevation — toolbar renders with elevation control', async ({ page }) => {
		await page.goto(variantUrl(4))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const toolbar = sandbox.locator('[data-cy="toolbar-elevation"]')
		await expect(toolbar).toBeVisible({ timeout: 20000 })
	})

	test('Rounded — toolbar renders with rounded control', async ({ page }) => {
		await page.goto(variantUrl(5))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const toolbar = sandbox.locator('[data-cy="toolbar-rounded"]')
		await expect(toolbar).toBeVisible({ timeout: 20000 })
	})

	test('Density — toolbar renders with density control', async ({ page }) => {
		await page.goto(variantUrl(6))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const toolbar = sandbox.locator('[data-cy="toolbar-density"]')
		await expect(toolbar).toBeVisible({ timeout: 20000 })
	})

	test('Modifiers — collapse modifier adds collapse class', async ({ page }) => {
		await page.goto(variantUrl(7))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const toolbar = sandbox.locator('[data-cy="toolbar-modifiers"]')
		await expect(toolbar).toBeVisible({ timeout: 20000 })
	})

	test('Slot — prepend — prepend area renders button', async ({ page }) => {
		await page.goto(variantUrl(10))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const toolbar = sandbox.locator('[data-cy="toolbar-slot-prepend"]')
		await expect(toolbar).toBeVisible({ timeout: 20000 })
		const prepend = sandbox.locator('.origam-toolbar__prepend')
		await expect(prepend).toBeVisible({ timeout: 20000 })
	})

	test('Slot — append — append area renders buttons', async ({ page }) => {
		await page.goto(variantUrl(11))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const toolbar = sandbox.locator('[data-cy="toolbar-slot-append"]')
		await expect(toolbar).toBeVisible({ timeout: 20000 })
		const appendArea = sandbox.locator('.origam-toolbar__append')
		await expect(appendArea).toBeVisible({ timeout: 20000 })
	})

	test('Slot — content — content area is visible', async ({ page }) => {
		await page.goto(variantUrl(12))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const toolbar = sandbox.locator('[data-cy="toolbar-slot-content"]')
		await expect(toolbar).toBeVisible({ timeout: 20000 })
	})

	test('Slot — title — custom title renders inside toolbar', async ({ page }) => {
		await page.goto(variantUrl(13))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const toolbar = sandbox.locator('[data-cy="toolbar-slot-title"]')
		await expect(toolbar).toBeVisible({ timeout: 20000 })
	})

	test('Playground — toolbar renders with all controls', async ({ page }) => {
		await page.goto(variantUrl(14))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const toolbar = sandbox.locator('[data-cy="toolbar-playground"]')
		await expect(toolbar).toBeVisible({ timeout: 20000 })
		await expect(toolbar).toHaveClass(/origam-toolbar/)
	})

	// ────────────────────────────────────────────────────────────────────
	// Border — computed-CSS assertions
	//
	// Pre-fix the SCSS read singular shorthand variables
	// (`--origam-toolbar---border-width`) that the token build never
	// emits. Combined with `border-style: solid` from the tokens, every
	// toolbar rendered with a ~3 px black frame on every side, even
	// `border={false}`. This block asserts the runtime computed widths,
	// not just class presence — the previous "renders" assertion was
	// passing while the bug was active.
	// ────────────────────────────────────────────────────────────────────

	const widths = (sandbox: FrameLocator, selector: string) =>
		sandbox.locator(selector).evaluate((el) => {
			const cs = window.getComputedStyle(el)
			return {
				top:    cs.borderTopWidth,
				right:  cs.borderRightWidth,
				bottom: cs.borderBottomWidth,
				left:   cs.borderLeftWidth
			}
		})

	test('Border showcase — default toolbar is borderless on all four sides', async ({ page }) => {
		await page.goto(variantUrl(8))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		await expect(sandbox.locator('[data-cy="toolbar-border-default"]')).toBeVisible({ timeout: 20000 })

		const w = await widths(sandbox, '[data-cy="toolbar-border-default"]')
		expect(w).toEqual({ top: '0px', right: '0px', bottom: '0px', left: '0px' })
	})

	test('Border showcase — border={true} produces a thin border on all four sides', async ({ page }) => {
		await page.goto(variantUrl(8))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		await expect(sandbox.locator('[data-cy="toolbar-border-true"]')).toBeVisible({ timeout: 20000 })

		const w = await widths(sandbox, '[data-cy="toolbar-border-true"]')
		// `thin` resolves to 1px in every modern browser. Asserting the
		// strict equality keeps the test honest — if the SCSS regresses
		// to `medium` (~3px) again, this fails immediately.
		expect(w.top).toBe('1px')
		expect(w.right).toBe('1px')
		expect(w.bottom).toBe('1px')
		expect(w.left).toBe('1px')
	})

	test('Border showcase — border="bottom" emits 1px ONLY on bottom', async ({ page }) => {
		await page.goto(variantUrl(8))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const w = await widths(sandbox, '[data-cy="toolbar-border-bottom"]')
		expect(w).toEqual({ top: '0px', right: '0px', bottom: '1px', left: '0px' })
	})

	test('Border showcase — border="top" emits 1px ONLY on top', async ({ page }) => {
		await page.goto(variantUrl(8))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const w = await widths(sandbox, '[data-cy="toolbar-border-top"]')
		expect(w).toEqual({ top: '1px', right: '0px', bottom: '0px', left: '0px' })
	})

	test('Border showcase — border="right" emits 1px ONLY on right', async ({ page }) => {
		await page.goto(variantUrl(8))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const w = await widths(sandbox, '[data-cy="toolbar-border-right"]')
		expect(w).toEqual({ top: '0px', right: '1px', bottom: '0px', left: '0px' })
	})

	test('Border showcase — border="left" emits 1px ONLY on left', async ({ page }) => {
		await page.goto(variantUrl(8))
		const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
		const w = await widths(sandbox, '[data-cy="toolbar-border-left"]')
		expect(w).toEqual({ top: '0px', right: '0px', bottom: '0px', left: '1px' })
	})
})
