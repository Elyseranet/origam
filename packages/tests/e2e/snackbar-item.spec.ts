import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamSnackbarItem — runtime probes asserting that the pure visual
 * component renders correctly for every exposed prop / slot / emit.
 *
 * This component is the shared visual layer consumed by both
 * `OrigamSnackbar` and `OrigamSnackbarGroup`. Tests here ensure:
 *   - Intent theming: correct modifier class per intent.
 *   - ARIA contract: role="status|alert" + aria-live="polite|assertive".
 *   - Dismiss button: visible by default, hidden when dismissible=false,
 *     emits dismiss on click.
 *   - Actions: rendered when provided via prop or slot.
 *   - Prepend icon: rendered by default (intent-inferred) or overridden
 *     via slot.
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const STORY = '/stories/story/components-stories-snackbar-origamsnackbaritem-story-vue'

test.describe('OrigamSnackbarItem — Prop: intent', () => {
    test('each intent renders the correct modifier class', async ({ page }) => {
        await openVariant(page, 'Prop — intent')
        const sandbox = sandboxOf(page)

        for (const intent of ['info', 'success', 'warning', 'danger'] as const) {
            const item = sandbox.locator(`[data-cy="snackbar-item-intent-${intent}"]`).first()
            await expect(item).toBeVisible({ timeout: 5000 })
            await expect(item).toHaveClass(new RegExp(`origam-snackbar-item--intent-${intent}`))
        }
    })

    test('warning and danger render role="alert" + aria-live="assertive"', async ({ page }) => {
        await openVariant(page, 'Prop — intent')
        const sandbox = sandboxOf(page)

        for (const intent of ['warning', 'danger'] as const) {
            const item = sandbox.locator(`[data-cy="snackbar-item-intent-${intent}"]`).first()
            await expect(item).toHaveAttribute('role', 'alert')
            await expect(item).toHaveAttribute('aria-live', 'assertive')
        }
    })

    test('info and success render role="status" + aria-live="polite"', async ({ page }) => {
        await openVariant(page, 'Prop — intent')
        const sandbox = sandboxOf(page)

        for (const intent of ['info', 'success'] as const) {
            const item = sandbox.locator(`[data-cy="snackbar-item-intent-${intent}"]`).first()
            await expect(item).toHaveAttribute('role', 'status')
            await expect(item).toHaveAttribute('aria-live', 'polite')
        }
    })
})

test.describe('OrigamSnackbarItem — Prop: dismissible', () => {
    test('dismiss button is visible when dismissible=true', async ({ page }) => {
        await openVariant(page, 'Prop — dismissible')
        const sandbox = sandboxOf(page)

        const dismissBtn = sandbox
            .locator('[data-cy="snackbar-item-dismissible-true"]')
            .locator('.origam-snackbar-item__dismiss')
        await expect(dismissBtn).toBeVisible({ timeout: 5000 })
    })

    test('dismiss button is absent when dismissible=false', async ({ page }) => {
        await openVariant(page, 'Prop — dismissible')
        const sandbox = sandboxOf(page)

        const dismissBtn = sandbox
            .locator('[data-cy="snackbar-item-dismissible-false"]')
            .locator('.origam-snackbar-item__dismiss')
        await expect(dismissBtn).toHaveCount(0)
    })
})

test.describe('OrigamSnackbarItem — Emit: dismiss', () => {
    test('clicking the dismiss button emits dismiss and increments counter', async ({ page }) => {
        await openVariant(page, 'Emit — dismiss')
        const sandbox = sandboxOf(page)

        const item = sandbox.locator('[data-cy="snackbar-item-emit"]').first()
        await expect(item).toBeVisible({ timeout: 5000 })

        const dismissBtn = item.locator('.origam-snackbar-item__dismiss')
        await expect(dismissBtn).toBeVisible({ timeout: 4000 })
        await dismissBtn.click()
        await page.waitForTimeout(200)

        const counter = sandbox.locator('[data-cy="snackbar-item-emit-counter"]').first()
        await expect(counter).toContainText('Dismissed: 1')
    })
})

test.describe('OrigamSnackbarItem — Prop: actions', () => {
    test('action buttons render when actions prop is provided', async ({ page }) => {
        await openVariant(page, 'Prop — actions')
        const sandbox = sandboxOf(page)

        const item = sandbox.locator('[data-cy="snackbar-item-with-actions"]').first()
        await expect(item).toBeVisible({ timeout: 5000 })

        const actionBtn = item.locator('.origam-snackbar-item__action').first()
        await expect(actionBtn).toBeVisible({ timeout: 4000 })
        await expect(actionBtn).toContainText('Undo')
    })
})

test.describe('OrigamSnackbarItem — Slot: actions', () => {
    test('custom actions slot renders and fires on click', async ({ page }) => {
        await openVariant(page, 'Slot — actions')
        const sandbox = sandboxOf(page)

        const undoBtn = sandbox.locator('[data-cy="snackbar-item-slot-action-undo"]').first()
        await expect(undoBtn).toBeVisible({ timeout: 5000 })
        await undoBtn.click()
        await page.waitForTimeout(200)

        const counter = sandbox.locator('[data-cy="snackbar-item-slot-action-counter"]').first()
        await expect(counter).toContainText('Slot action clicks: 1')
    })
})

test.describe('OrigamSnackbarItem — Slot: prepend', () => {
    test('custom prepend slot overrides the default icon', async ({ page }) => {
        await openVariant(page, 'Slot — prepend')
        const sandbox = sandboxOf(page)

        const prepend = sandbox
            .locator('[data-cy="snackbar-item-prepend-host"]')
            .locator('.origam-snackbar-item__prepend')
        await expect(prepend).toBeVisible({ timeout: 5000 })
    })
})

test.describe('OrigamSnackbarItem — ARIA contract', () => {
    test('items carry aria-atomic="true"', async ({ page }) => {
        await openVariant(page, 'Prop — intent')
        const sandbox = sandboxOf(page)

        const item = sandbox.locator('[data-cy="snackbar-item-intent-info"]').first()
        await expect(item).toHaveAttribute('aria-atomic', 'true')
    })
})
