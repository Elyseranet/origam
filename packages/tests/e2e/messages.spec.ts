import { expect, test, type Page } from '@playwright/test'

/**
 * Lot C2 — OrigamMessages runtime probes.
 *
 * Asserts every Variant in `OrigamMessages.story.vue` produces the
 * runtime contract documented in `OrigamMessages.md`:
 *   - default (playground) renders the container with aria-live + role=alert
 *   - active: transition flag does not prevent render  (Variant: "Prop — active")
 *   - color: CSS color var applied to root             (Variant: "Prop — color")
 *   - density: --density-{x} class emitted            (Variant: "Prop — density")
 *   - slot — default: custom span rendered per message (Variant: "Slot — default (custom render)")
 *   - dynamic: add/clear messages updates DOM          (Variant: "Dynamic (append & clear)")
 *
 * NOTE: The "Multiple" variant was removed in the story restructuring (no
 * dedicated Variant with two pre-seeded messages exists any more).
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyPath: string, variant: string) => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const STORY = '/stories/story/components-stories-messages-origammessages-story-vue'

// ─── Default ────────────────────────────────────────────────────────────────

test.describe('OrigamMessages — default', () => {
    test('renders container with aria-live and role=alert', async ({ page }) => {
        // Variant title is "Default" (playground); data-cy is "messages-playground"
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('[data-cy="messages-playground"]').first()
        await expect(container).toBeVisible({ timeout: 8000 })

        const ariaLive = await container.evaluate(el => el.getAttribute('aria-live'))
        expect(ariaLive).toBe('polite')

        const role = await container.evaluate(el => el.getAttribute('role'))
        expect(role).toBe('alert')

        const cls = await container.evaluate(el => el.className)
        expect(cls).toContain('origam-messages')
    })

    test('renders one message item', async ({ page }) => {
        // Variant title is "Default" (playground); data-cy is "messages-playground"
        // init-state seeds messages with ['Hint message.']
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('[data-cy="messages-playground"]').first()
        await expect(container).toBeVisible({ timeout: 8000 })

        const messages = await container.locator('.origam-messages__message').count()
        expect(messages).toBe(1)

        await expect(container).toContainText('Hint message.')
    })
})

// ─── Active ─────────────────────────────────────────────────────────────────

test.describe('OrigamMessages — active', () => {
    test('component renders whether active is true or false', async ({ page }) => {
        // Variant title is "Prop — active"
        await openVariant(page, STORY, 'Prop — active')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('[data-cy="messages-active"]').first()
        await expect(container).toBeVisible({ timeout: 8000 })

        const messages = await container.locator('.origam-messages__message').count()
        expect(messages).toBeGreaterThanOrEqual(1)
    })
})

// ─── Color ──────────────────────────────────────────────────────────────────

test.describe('OrigamMessages — color', () => {
    test('color prop applies CSS color variable to container', async ({ page }) => {
        // Variant title is "Prop — color"
        await openVariant(page, STORY, 'Prop — color')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('[data-cy="messages-color"]').first()
        await expect(container).toBeVisible({ timeout: 8000 })

        // textColorStyles produces an inline style on the root
        const style = await container.evaluate(el => (el as HTMLElement).getAttribute('style') ?? '')
        expect(style.length).toBeGreaterThan(0)
    })
})

// ─── Density ────────────────────────────────────────────────────────────────

test.describe('OrigamMessages — density', () => {
    test('default density emits --density-default modifier class', async ({ page }) => {
        // Variant title is "Prop — density"
        await openVariant(page, STORY, 'Prop — density')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('[data-cy="messages-density"]').first()
        await expect(container).toBeVisible({ timeout: 8000 })

        const cls = await container.evaluate(el => el.className)
        expect(cls).toContain('origam-messages--density-default')
    })
})

// ─── Slot: default ──────────────────────────────────────────────────────────

test.describe('OrigamMessages — slot default', () => {
    test('default slot renders custom element per message', async ({ page }) => {
        // Variant title is "Slot — default (custom render)"
        await openVariant(page, STORY, 'Slot — default (custom render)')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('[data-cy="messages-slot-default"]').first()
        await expect(container).toBeVisible({ timeout: 8000 })

        const custom = container.locator('[data-cy="messages-slot-custom"]').first()
        await expect(custom).toBeVisible()
        await expect(custom).toContainText('Custom rendered message')
    })
})

// ─── Dynamic ────────────────────────────────────────────────────────────────

test.describe('OrigamMessages — dynamic', () => {
    test('add button increments message count; clear removes all', async ({ page }) => {
        // Variant title is "Dynamic (append & clear)"
        await openVariant(page, STORY, 'Dynamic (append & clear)')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('[data-cy="messages-dynamic"]').first()
        await expect(container).toBeVisible({ timeout: 8000 })

        const initialCount = await container.locator('.origam-messages__message').count()

        // Add a message
        const addBtn = sandbox.locator('[data-cy="messages-dynamic-add"]').first()
        await addBtn.click()
        await page.waitForTimeout(300)

        const afterAdd = await container.locator('.origam-messages__message').count()
        expect(afterAdd).toBe(initialCount + 1)

        // Clear all messages
        const clearBtn = sandbox.locator('[data-cy="messages-dynamic-clear"]').first()
        await clearBtn.click()
        await page.waitForTimeout(300)

        const afterClear = await container.locator('.origam-messages__message').count()
        expect(afterClear).toBe(0)
    })
})
