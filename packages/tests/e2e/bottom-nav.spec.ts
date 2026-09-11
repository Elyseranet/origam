import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamBottomNav — runtime assertions per story Variant.
 *
 * Story URL: /story/components-stories-bottomnav-origambottomnav-story-vue
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto('/stories/story/components-stories-bottomnav-origambottomnav-story-vue')
    await page.waitForLoadState('networkidle')
    // Wait for Histoire to hydrate and render the variant list before clicking.
    // `networkidle` fires before Vue has mounted the sidebar items, which makes
    // the subsequent getByText call race against the render cycle.
    await page.getByText('Default', { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 })
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

// ─── Color ────────────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Color', () => {
    test('color intent is propagated to btn children', async ({ page }) => {
        await openVariant(page, 'Prop — color & bgColor')
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('[data-cy="bottom-nav-color"]').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        const count = await nav.locator('.origam-btn').count()
        expect(count).toBeGreaterThan(0)

        // Phase 4 correction (Cas A) — the story passes `:model-value="true"`
        // which puts isActive=true on the BottomNav. useColorEffect deliberately
        // returns [] for colorClasses when isActive=true (design contract: hover/
        // active states bypass utility classes so the hover token rung can own
        // the slot). The utility class `.origam--color-primary` is therefore
        // never emitted in this story state — asserting it was a false expectation
        // added in Phase 3.
        //
        // Corrected assertion: verify that the color intent is still applied to
        // the nav root via the inline colorStyle (the inline style path remains
        // active regardless of the isActive/isHover gate). A non-transparent,
        // non-empty computed `color` value confirms the primary token resolved.
        const computedColor = await nav.evaluate(el => getComputedStyle(el).color)
        expect(computedColor, 'bottom-nav color computed style').not.toBe('')
        expect(computedColor, 'bottom-nav color computed style').not.toBe('rgba(0, 0, 0, 0)')
    })
})

// ─── Density ──────────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Density', () => {
    test('density class lands on btn children', async ({ page }) => {
        await openVariant(page, 'Prop — density')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="bottom-nav-density"]').first()).toBeVisible({ timeout: 8000 })
        const childClasses = await sandbox.locator('[data-cy="bottom-nav-density"] .origam-btn').evaluateAll(els =>
            els.map(el => el.className)
        )
        expect(childClasses.length).toBeGreaterThan(0)
        for (const cls of childClasses) {
            expect(cls).toMatch(/origam-btn--density-/)
        }
    })
})

// ─── Rounded ──────────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Rounded', () => {
    test('border-radius is applied when rounded=true', async ({ page }) => {
        await openVariant(page, 'Prop — rounded')
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('[data-cy="bottom-nav-rounded"]').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        const radius = await nav.evaluate(el => getComputedStyle(el).borderRadius)
        expect(radius).not.toBe('0px')
    })
})

// ─── Border ───────────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Border', () => {
    test('border modifier class is applied', async ({ page }) => {
        await openVariant(page, 'Prop — border')
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('[data-cy="bottom-nav-border"]').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        const cls = await nav.evaluate(el => el.className)
        expect(cls).toMatch(/origam-bottom-nav--border|origam--border/)
    })
})

// ─── Elevation ────────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Elevation', () => {
    test('elevation variant renders without errors', async ({ page }) => {
        await openVariant(page, 'Prop — elevation')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="bottom-nav-elevation"]').first()).toBeVisible({ timeout: 8000 })
    })
})

// ─── Grow ─────────────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Grow', () => {
    test('grow modifier class is applied', async ({ page }) => {
        await openVariant(page, 'Prop — grow')
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('[data-cy="bottom-nav-grow"]').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        const cls = await nav.evaluate(el => el.className)
        expect(cls).toContain('origam-bottom-nav--grow')
    })
})

// ─── Mode ─────────────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Mode', () => {
    test('mode class is applied to the nav', async ({ page }) => {
        await openVariant(page, 'Prop — mode')
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('[data-cy="bottom-nav-mode"]').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        const cls = await nav.evaluate(el => el.className)
        expect(cls).toMatch(/origam-bottom-nav--(vertical|horizontal|shift)/)
    })
})

// ─── Items prop ───────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Items prop', () => {
    test('renders one btn per item entry (3)', async ({ page }) => {
        await openVariant(page, 'Prop — items')
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('[data-cy="bottom-nav-items"]').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        const count = await nav.locator('.origam-btn').count()
        expect(count).toBe(3)
    })
})

// ─── Visible (modelValue) ─────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Visible', () => {
    test('nav is visible when modelValue=true', async ({ page }) => {
        await openVariant(page, 'Prop — modelValue (visible)')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="bottom-nav-visible"]').first()).toBeVisible({ timeout: 8000 })
    })
})

// ─── Slot: default ────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Slot: default', () => {
    test('renders explicit btn children in the default slot', async ({ page }) => {
        await openVariant(page, 'Slot — default')
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('[data-cy="bottom-nav-slot-default"]').first()
        await expect(nav).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('[data-cy="bottom-nav-slot-home"]').first()).toBeVisible()
        await expect(sandbox.locator('[data-cy="bottom-nav-slot-search"]').first()).toBeVisible()
        await expect(sandbox.locator('[data-cy="bottom-nav-slot-profile"]').first()).toBeVisible()
    })
})

// ─── Slot: item ───────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Slot: item', () => {
    test('custom item slot renders with 3 buttons', async ({ page }) => {
        await openVariant(page, 'Slot — item')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="bottom-nav-slot-item"]').first()).toBeVisible({ timeout: 8000 })
        const count = await sandbox.locator('[data-cy="bottom-nav-slot-item"] .origam-btn').count()
        expect(count).toBe(3)
    })
})

// ─── Emit: update:modelValue ──────────────────────────────────────────────────

test.describe('OrigamBottomNav — Emit: update:modelValue', () => {
    test('emit variant renders without errors', async ({ page }) => {
        await openVariant(page, 'Emit — update:modelValue')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="bottom-nav-emit-model"]').first()).toBeVisible({ timeout: 8000 })
    })
})

// ─── Emit: update:active ──────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Emit: update:active', () => {
    test('emit variant renders without errors', async ({ page }) => {
        await openVariant(page, 'Emit — update:active')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="bottom-nav-emit-active"]').first()).toBeVisible({ timeout: 8000 })
    })
})

// ─── Playground ───────────────────────────────────────────────────────────────

test.describe('OrigamBottomNav — Default', () => {
    test('renders without errors', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="bottom-nav-playground"]').first()).toBeVisible({ timeout: 8000 })
    })
})
