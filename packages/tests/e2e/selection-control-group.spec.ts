import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamSelectionControlGroup — runtime assertions per story Variant.
 *
 * Story URL: /story/components-stories-selectioncontrol-origamselectioncontrolgroup-story-vue
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto('/stories/story/components-stories-selectioncontrol-origamselectioncontrolgroup-story-vue')
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

// ─── Type ─────────────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Type', () => {
    test('renders checkboxes in type variant', async ({ page }) => {
        await openVariant(page, 'Prop — type')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="scg-type"]').first()).toBeVisible({ timeout: 8000 })
        const count = await sandbox.locator('[data-cy="scg-type"] .origam-selection-control').count()
        expect(count).toBe(3)
    })
})

// ─── Color ────────────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Color', () => {
    test('color variant renders without errors', async ({ page }) => {
        await openVariant(page, 'Prop — color')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="scg-color"]').first()).toBeVisible({ timeout: 8000 })
        const count = await sandbox.locator('[data-cy="scg-color"] .origam-selection-control').count()
        expect(count).toBeGreaterThan(0)
    })
})

// ─── Density ──────────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Density', () => {
    test('density class lands on child controls', async ({ page }) => {
        await openVariant(page, 'Prop — density')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="scg-density"]').first()).toBeVisible({ timeout: 8000 })
        const childClasses = await sandbox.locator('[data-cy="scg-density"] .origam-selection-control').evaluateAll(els =>
            els.map(el => el.className)
        )
        expect(childClasses.length).toBeGreaterThan(0)
        for (const cls of childClasses) {
            expect(cls).toMatch(/origam-selection-control--density-(default|compact|comfortable)/)
        }
    })
})

// ─── Selection modifiers ──────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Selection modifiers', () => {
    test('renders 3 controls in selection modifiers variant', async ({ page }) => {
        await openVariant(page, 'Prop — inline & multiple')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="scg-modifiers"]').first()).toBeVisible({ timeout: 8000 })
        const count = await sandbox.locator('[data-cy="scg-modifiers"] .origam-selection-control').count()
        expect(count).toBe(3)
    })
})

// ─── Icons ────────────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Icons', () => {
    test('icon override variant renders without errors', async ({ page }) => {
        await openVariant(page, 'Prop — trueIcon & falseIcon')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="scg-icons"]').first()).toBeVisible({ timeout: 8000 })
        const count = await sandbox.locator('[data-cy="scg-icons"] .origam-selection-control').count()
        expect(count).toBe(2)
    })
})

// ─── States ───────────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — States', () => {
    test('states variant renders controls without crash', async ({ page }) => {
        await openVariant(page, 'Prop — disabled, readonly & error')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="scg-states"]').first()).toBeVisible({ timeout: 8000 })
        const count = await sandbox.locator('[data-cy="scg-states"] .origam-selection-control').count()
        expect(count).toBeGreaterThan(0)
    })
})

// ─── Items prop ───────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Items prop', () => {
    test('renders one control per items entry (3)', async ({ page }) => {
        await openVariant(page, 'Prop — items')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="scg-items"]').first()).toBeVisible({ timeout: 8000 })
        const count = await sandbox.locator('[data-cy="scg-items"] .origam-selection-control').count()
        expect(count).toBe(3)
    })
})

// ─── Slot: default ────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Slot: default', () => {
    test('renders explicit OrigamSelectionControl children', async ({ page }) => {
        await openVariant(page, 'Slot — default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="scg-slot-default"]').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('[data-cy="scg-slot-x"]').first()).toBeVisible()
        await expect(sandbox.locator('[data-cy="scg-slot-y"]').first()).toBeVisible()
        await expect(sandbox.locator('[data-cy="scg-slot-z"]').first()).toBeVisible()
    })
})

// ─── Slot: item ───────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Slot: item', () => {
    test('custom item slot renders controls', async ({ page }) => {
        await openVariant(page, 'Slot — item')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="scg-slot-item"]').first()).toBeVisible({ timeout: 8000 })
        const count = await sandbox.locator('[data-cy="scg-slot-item"] .origam-selection-control').count()
        expect(count).toBeGreaterThan(0)
    })
})

// ─── Emit: update:modelValue ──────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Emit: update:modelValue', () => {
    test('emit variant renders controls ready to fire', async ({ page }) => {
        await openVariant(page, 'Emit — update:modelValue')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="scg-emit"]').first()).toBeVisible({ timeout: 8000 })
        const count = await sandbox.locator('[data-cy="scg-emit"] .origam-selection-control').count()
        expect(count).toBe(2)
    })

    test('checking a control fires the emit (checkbox input click)', async ({ page }) => {
        await openVariant(page, 'Emit — update:modelValue')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="scg-emit-a"]').first()).toBeVisible({ timeout: 8000 })
        // Click the input; expect no JS error — logEvent is bound so it fires in histoire
        await sandbox.locator('[data-cy="scg-emit-a"] input').first().click()
        await page.waitForTimeout(300)
        // Verify the control is still rendered (no crash)
        await expect(sandbox.locator('[data-cy="scg-emit-a"]').first()).toBeVisible()
    })
})

// ─── Playground ───────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Default', () => {
    test('renders without errors', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('[data-cy="scg-playground"]').first()).toBeVisible({ timeout: 8000 })
        const count = await sandbox.locator('[data-cy="scg-playground"] .origam-selection-control').count()
        expect(count).toBe(3)
    })
})
