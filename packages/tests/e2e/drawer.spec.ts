import { expect, test } from '@playwright/test'

/**
 * RECIPE — Pattern canonique pour les specs e2e origam / Histoire (réf. btn.spec.ts)
 *
 * ## Variants OrigamDrawer (ordre 0-based dans la story)
 *
 *   0  → Design         (visuels : color, bgColor, elevation, rounded, border, density)
 *   1  → State          (hover / active surface)
 *   2  → Functional     (permanent, temporary, rail, railWidth, floating, scrim, …)
 *   3  → Events - update:modelValue  (temporary drawer + bouton Toggle)
 *   4  → Events - update:rail        (expand-on-hover rail)
 *   5  → Slots - Default
 *   6  → Slots - Prepend
 *   7  → Slots - Append
 *   8  → Slots - Wrapper
 *   9  → Default (playground — data-cy="drawer-playground")
 *
 * ## Notes d'implémentation
 *
 *   - OrigamDrawer utilise <teleport :to="#<layoutId> .origam-layout__wrapper">.
 *     Le drawer n'existe dans le DOM qu'APRÈS que OrigamApp ait créé le layout
 *     wrapper. Toutes les Variants de cette story wrappent dans <origam-app>.
 *   - Le teleport atterrit dans le même iframe sandbox que le reste de la story.
 *     Chercher `.origam-drawer` dans TOUT le sandbox sans restriction de parent.
 *   - Drawer fermé (modelValue=false) → v-if="isActive" → absent du DOM.
 *   - DS BUG: origam-drawer--density-default n'est pas émis (voir fixme ci-dessous).
 *   - DS LIMITATION: button[aria-label="Toggle"] peut ne pas être trouvé si l'AppBar
 *     est montée mais ses slots pas encore hydrés. Timeout de 12s requis.
 */

const STORY_ID   = 'components-stories-drawer-origamdrawer-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamDrawer', () => {
	test.setTimeout(45000)

	// ------------------------------------------------------------------ //
	// DESIGN (index 0)                                                     //
	// init: permanent=true → drawer toujours visible                       //
	// ------------------------------------------------------------------ //

	test.describe('Design', () => {
		test('renders the drawer root with BEM class', async ({ page }) => {
			await page.goto(variantUrl(0))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await expect(sandbox.locator('.origam-drawer').first()).toBeVisible({ timeout: 12000 })
		})

		test('default location class is origam-drawer--left', async ({ page }) => {
			await page.goto(variantUrl(0))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 12000 })
			await expect(drawer).toHaveClass(/origam-drawer--left/)
		})

		test('active class is present on permanent drawer', async ({ page }) => {
			await page.goto(variantUrl(0))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 12000 })
			await expect(drawer).toHaveClass(/origam-drawer--active/)
		})

		// DS BUG: useDensity(props) is called in OrigamDrawer and densityClasses is
		// bound in drawerClasses, but the class origam-drawer--density-default is NOT
		// emitted on the root element at runtime. Rendered class list observed:
		// "origam-drawer origam-drawer--left origam-drawer--active" — density absent.
		// Reproduced: variantUrl(0), init-state density=undefined (falls back to 'default').
		// Expected: origam-drawer--density-default. Severity: medium.
		// Kept as fixme for non-regression tracking until the DS bug is fixed.
		test.fixme('default density class is applied', async ({ page }) => {
			await page.goto(variantUrl(0))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 12000 })
			await expect(drawer).toHaveClass(/origam-drawer--density-default/)
		})

		test('drawer content is visible inside the panel', async ({ page }) => {
			await page.goto(variantUrl(0))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 12000 })
			await expect(sandbox.locator('.origam-drawer__content').first()).toBeVisible({ timeout: 8000 })
		})
	})

	// ------------------------------------------------------------------ //
	// STATE (index 1)                                                      //
	// init: { bgColor: undefined } — permanent → drawer visible           //
	// ------------------------------------------------------------------ //

	test.describe('State', () => {
		test('renders the drawer in state variant', async ({ page }) => {
			await page.goto(variantUrl(1))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await expect(sandbox.locator('.origam-drawer').first()).toBeVisible({ timeout: 12000 })
		})
	})

	// ------------------------------------------------------------------ //
	// FUNCTIONAL (index 2)                                                 //
	// init: { open: true, permanent: true, … } → drawer visible           //
	// ------------------------------------------------------------------ //

	test.describe('Functional', () => {
		test('renders the drawer root', async ({ page }) => {
			await page.goto(variantUrl(2))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await expect(sandbox.locator('.origam-drawer').first()).toBeVisible({ timeout: 12000 })
		})

		test('Toggle button is present in the AppBar', async ({ page }) => {
			await page.goto(variantUrl(2))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			// origam-btn has inheritAttrs=true (default) → aria-label lands on root <button>.
			const toggleBtn = sandbox.locator('button[aria-label="Toggle"]').first()
			await expect(toggleBtn).toBeVisible({ timeout: 12000 })
		})

		test('rail mode: class absent at init (rail=false)', async ({ page }) => {
			await page.goto(variantUrl(2))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 12000 })
			// At init rail=false → origam-drawer--rail must NOT be present
			await expect(drawer).not.toHaveClass(/origam-drawer--rail/)
		})

		test('location prop produces origam-drawer--left class (default)', async ({ page }) => {
			await page.goto(variantUrl(2))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 12000 })
			await expect(drawer).toHaveClass(/origam-drawer--left/)
		})
	})

	// ------------------------------------------------------------------ //
	// EVENTS — update:modelValue (index 3)                                //
	// init: { open: false } + temporary → drawer ABSENT au départ        //
	// ------------------------------------------------------------------ //

	test.describe('Events - update:modelValue', () => {
		test('drawer is absent when open=false (temporary, v-if)', async ({ page }) => {
			await page.goto(variantUrl(3))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			// Wait for the AppBar (not teleported) to confirm the sandbox is mounted,
			// then assert the drawer is not in the DOM (v-if="isActive", starts false).
			await expect(sandbox.locator('.origam-toolbar').first()).toBeVisible({ timeout: 12000 })
			await expect(sandbox.locator('.origam-drawer')).toHaveCount(0, { timeout: 5000 })
		})

		test('clicking Toggle opens the temporary drawer', async ({ page }) => {
			await page.goto(variantUrl(3))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			// Wait for the toolbar first, then locate the Toggle button
			await expect(sandbox.locator('.origam-toolbar').first()).toBeVisible({ timeout: 12000 })
			const toggleBtn = sandbox.locator('button[aria-label="Toggle"]').first()
			await expect(toggleBtn).toBeVisible({ timeout: 8000 })
			await toggleBtn.click()
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 8000 })
			await expect(drawer).toHaveClass(/origam-drawer--temporary/)
		})

		test('temporary drawer shows origam-drawer--temporary class when open', async ({ page }) => {
			await page.goto(variantUrl(3))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await expect(sandbox.locator('.origam-toolbar').first()).toBeVisible({ timeout: 12000 })
			const toggleBtn = sandbox.locator('button[aria-label="Toggle"]').first()
			await expect(toggleBtn).toBeVisible({ timeout: 8000 })
			await toggleBtn.click()
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 8000 })
			await expect(drawer).toHaveClass(/origam-drawer--temporary/)
		})

		test('closing the drawer via close button removes it from DOM', async ({ page }) => {
			await page.goto(variantUrl(3))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await expect(sandbox.locator('.origam-toolbar').first()).toBeVisible({ timeout: 12000 })
			const toggleBtn = sandbox.locator('button[aria-label="Toggle"]').first()
			await expect(toggleBtn).toBeVisible({ timeout: 8000 })
			await toggleBtn.click()
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 8000 })
			// Close button inside the drawer (text="Close", first origam-btn in drawer)
			const closeBtn = sandbox.locator('.origam-drawer .origam-btn').first()
			await expect(closeBtn).toBeVisible({ timeout: 8000 })
			await closeBtn.click()
			// Drawer disappears (v-if=false after update:modelValue)
			await expect(sandbox.locator('.origam-drawer')).toHaveCount(0, { timeout: 8000 })
		})
	})

	// ------------------------------------------------------------------ //
	// EVENTS — update:rail (index 4)                                       //
	// init: rail=true, permanent, expand-on-hover                          //
	// ------------------------------------------------------------------ //

	test.describe('Events - update:rail', () => {
		test('rail drawer is visible (rail=true, permanent, expand-on-hover)', async ({ page }) => {
			await page.goto(variantUrl(4))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 12000 })
			// init: rail=true
			await expect(drawer).toHaveClass(/origam-drawer--rail/)
		})

		test('expand-on-hover class is present when expandOnHover=true', async ({ page }) => {
			await page.goto(variantUrl(4))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 12000 })
			await expect(drawer).toHaveClass(/origam-drawer--expand-on-hover/)
		})

		// NOTE: testing mouseenter → update:rail emit is unreliable headless because
		// the drawer is teleported and hover events on teleported elements are not
		// consistently dispatched by Playwright headless Chromium.
		// Marked fixme until a reliable approach (e.g. page.evaluate injection) is found.
		test.fixme('hovering the drawer triggers update:rail=false emit', async ({ page }) => {
			await page.goto(variantUrl(4))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 12000 })
			await drawer.hover()
			// After hover expand-on-hover removes --rail class (rail becomes false)
			await expect(drawer).not.toHaveClass(/origam-drawer--rail/, { timeout: 5000 })
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS — Default (index 5)                                            //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Default', () => {
		test('default slot content is rendered inside the drawer', async ({ page }) => {
			await page.goto(variantUrl(5))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 12000 })
			await expect(sandbox.locator('.origam-drawer__content').first()).toBeVisible({ timeout: 8000 })
			await expect(sandbox.locator('.origam-drawer__content').first()).toContainText('Inbox')
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS — Prepend (index 6)                                            //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Prepend', () => {
		test('prepend slot renders .origam-drawer__prepend', async ({ page }) => {
			await page.goto(variantUrl(6))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await expect(sandbox.locator('.origam-drawer').first()).toBeVisible({ timeout: 12000 })
			await expect(sandbox.locator('.origam-drawer__prepend').first()).toBeVisible({ timeout: 8000 })
		})

		test('prepend slot contains the App Logo text', async ({ page }) => {
			await page.goto(variantUrl(6))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await expect(sandbox.locator('.origam-drawer').first()).toBeVisible({ timeout: 12000 })
			await expect(sandbox.locator('.origam-drawer__prepend').first()).toContainText('App Logo')
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS — Append (index 7)                                             //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Append', () => {
		test('append slot renders .origam-drawer__append', async ({ page }) => {
			await page.goto(variantUrl(7))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await expect(sandbox.locator('.origam-drawer').first()).toBeVisible({ timeout: 12000 })
			await expect(sandbox.locator('.origam-drawer__append').first()).toBeVisible({ timeout: 8000 })
		})

		test('append slot contains version text', async ({ page }) => {
			await page.goto(variantUrl(7))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			// Slightly longer initial timeout: consecutive navigations to the same
			// variantUrl within a single Playwright session can take longer because
			// the Histoire sandbox needs to re-evaluate the Variant's init-state.
			await expect(sandbox.locator('.origam-drawer').first()).toBeVisible({ timeout: 15000 })
			await expect(sandbox.locator('.origam-drawer__append').first()).toContainText('v1.0.0')
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS — Wrapper (index 8)                                            //
	// wrapper slot replaces the prepend/content/append skeleton entirely   //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Wrapper', () => {
		test('wrapper slot renders inside .origam-drawer__wrapper', async ({ page }) => {
			await page.goto(variantUrl(8))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await expect(sandbox.locator('.origam-drawer').first()).toBeVisible({ timeout: 12000 })
			await expect(sandbox.locator('.origam-drawer__wrapper').first()).toBeVisible({ timeout: 8000 })
		})

		test('wrapper slot content is present (Custom wrapper text)', async ({ page }) => {
			await page.goto(variantUrl(8))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await expect(sandbox.locator('.origam-drawer').first()).toBeVisible({ timeout: 12000 })
			await expect(sandbox.locator('.origam-drawer__wrapper').first()).toContainText('Custom wrapper')
		})

		test('wrapper slot replaces default skeleton: no __prepend nor __content', async ({ page }) => {
			await page.goto(variantUrl(8))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await expect(sandbox.locator('.origam-drawer').first()).toBeVisible({ timeout: 12000 })
			// wrapper slot is used → __prepend and __content are NOT rendered
			// (they are inside the default slot of <slot name="wrapper">)
			await expect(sandbox.locator('.origam-drawer__prepend')).toHaveCount(0)
			await expect(sandbox.locator('.origam-drawer__content')).toHaveCount(0)
		})
	})

	// ------------------------------------------------------------------ //
	// DEFAULT / PLAYGROUND (index 9)                                       //
	// init: { open: true, permanent: true, … }                            //
	// ------------------------------------------------------------------ //

	test.describe('Default (Playground)', () => {
		test('playground wrapper is visible (data-cy="drawer-playground")', async ({ page }) => {
			await page.goto(variantUrl(9))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			// data-cy is on the outer div (not teleported) wrapping <origam-app>
			await expect(sandbox.locator('[data-cy="drawer-playground"]')).toBeVisible({ timeout: 12000 })
		})

		test('drawer is visible in playground at init (open=true, permanent=true)', async ({ page }) => {
			await page.goto(variantUrl(9))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 12000 })
			await expect(drawer).toHaveClass(/origam-drawer/)
		})

		test('playground drawer has left location by default', async ({ page }) => {
			await page.goto(variantUrl(9))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const drawer = sandbox.locator('.origam-drawer').first()
			await expect(drawer).toBeVisible({ timeout: 12000 })
			await expect(drawer).toHaveClass(/origam-drawer--left/)
		})

		test('Menu button is present in the playground AppBar', async ({ page }) => {
			await page.goto(variantUrl(9))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			// Menu button has aria-label="Menu" (distinct from Toggle in Functional)
			await expect(sandbox.locator('button[aria-label="Menu"]').first()).toBeVisible({ timeout: 12000 })
		})
	})
})
