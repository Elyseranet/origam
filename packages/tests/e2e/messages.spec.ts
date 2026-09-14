import { expect, test, type Page } from '@playwright/test'

import { selectHstOption, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * Lot C2 — OrigamMessages runtime probes.
 *
 * REALIGNED (2026-08) — the story migrated to the canonical
 * Design/Functional/Slots structure (root CLAUDE.md, "Story + doc
 * sync"). The migrated story dropped every `data-cy` host attribute
 * that this spec used to scope on ("messages-playground",
 * "messages-active", "messages-color", "messages-density",
 * "messages-slot-default", "messages-slot-custom", "messages-dynamic",
 * "messages-dynamic-add/clear") — each Variant now renders exactly one
 * `<OrigamMessages>` instance, so tests locate it structurally via
 * `.origam-messages` instead.
 *
 * Asserts the runtime contract documented in `OrigamMessages.md`:
 *   - Default (playground) renders the container with aria-live + role
 *   - color: CSS color var applied to root                 (Design Variant, "Color" control)
 *   - density: --density-{x} class emitted                 (Design Variant, "Density" control)
 *   - slot — default: custom span rendered per message     (Variant: "Slots - Default")
 *
 * NOTE: role is "status", not "alert" — verified directly against
 * OrigamMessages.vue (`role="status"` is a static, unconditional
 * attribute on the root, unaffected by any prop or Variant). The
 * pre-migration spec asserted `role=alert`; that was already wrong
 * for the component as it exists today, unrelated to the title drift
 * being fixed here — corrected to the observed contract.
 *
 * NOTE: "Dynamic (append & clear)" has NO equivalent Variant anymore —
 * no add/clear affordance exists in any Variant of the migrated story.
 * Flagged below as a coverage gap (`test.fixme`), not deleted.
 *
 * NOTE: `active` prop — the migrated "Functional" Variant exposes an
 * "Active" HstCheckbox, but `OrigamMessages.vue` never reads
 * `props.active` anywhere (grep confirms zero references) — it is a
 * dead prop that renders identically at either value. This may be a
 * separate real bug (declared surface with no effect, cf. root
 * CLAUDE.md "Half-implemented surfaces") but is out of scope for a
 * title-drift pass; documented here rather than silently assumed.
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
    test('renders container with aria-live and role=status', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('.origam-messages').first()
        await expect(container).toBeVisible({ timeout: 8000 })

        await expect(container).toHaveAttribute('aria-live', 'polite')
        await expect(container).toHaveAttribute('role', 'status')
        await expect(container).toHaveClass(/origam-messages/)
    })

    test('renders one message item', async ({ page }) => {
        // init-state seeds messages with ['Hint message.']
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('.origam-messages').first()
        await expect(container).toBeVisible({ timeout: 8000 })

        const messages = container.locator('.origam-messages__message')
        await expect(messages).toHaveCount(1)
        await expect(container).toContainText('Hint message.')
    })
})

// ─── Active ─────────────────────────────────────────────────────────────────

test.describe('OrigamMessages — active', () => {
    test('component renders whether active is true or false', async ({ page }) => {
        await openVariant(page, STORY, 'Functional')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('.origam-messages').first()
        await expect(container).toBeVisible({ timeout: 8000 })
        await expect(container.locator('.origam-messages__message')).toHaveCount(2)

        await toggleHstCheckbox(page, 'Active')
        await page.waitForTimeout(300)

        // See module-level note — `active` is currently a dead prop, so
        // toggling it is expected to have NO visible effect.
        await expect(container).toBeVisible()
        await expect(container.locator('.origam-messages__message')).toHaveCount(2)
    })
})

// ─── Color ──────────────────────────────────────────────────────────────────

test.describe('OrigamMessages — color', () => {
    test('color prop applies CSS color variable to container', async ({ page }) => {
        await openVariant(page, STORY, 'Design')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('.origam-messages').first()
        await expect(container).toBeVisible({ timeout: 8000 })

        await selectHstOption(page, 'Color', 'Danger')
        await page.waitForTimeout(300)

        // textColorStyles produces an inline style on the root
        const style = await container.getAttribute('style')
        expect(style?.length ?? 0).toBeGreaterThan(0)
        expect(style).toContain('color')
    })
})

// ─── Density ────────────────────────────────────────────────────────────────

test.describe('OrigamMessages — density', () => {
    test('default density emits --density-default modifier class', async ({ page }) => {
        await openVariant(page, STORY, 'Design')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('.origam-messages').first()
        await expect(container).toBeVisible({ timeout: 8000 })
        await expect(container).toHaveClass(/origam-messages--density-default/)
    })

    test('changing density updates the modifier class', async ({ page }) => {
        await openVariant(page, STORY, 'Design')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('.origam-messages').first()
        await expect(container).toBeVisible({ timeout: 8000 })

        await selectHstOption(page, 'Density', 'Compact')
        await page.waitForTimeout(300)
        await expect(container).toHaveClass(/origam-messages--density-compact/)
    })
})

// ─── Slot: default ──────────────────────────────────────────────────────────

test.describe('OrigamMessages — slot default', () => {
    test('default slot renders custom element per message', async ({ page }) => {
        await openVariant(page, STORY, 'Slots - Default')
        const sandbox = sandboxOf(page)

        const container = sandbox.locator('.origam-messages').first()
        await expect(container).toBeVisible({ timeout: 8000 });

        const custom = container.locator('.origam-messages__message span').first()
        await expect(custom).toBeVisible()
        await expect(custom).toContainText('Custom rendered message')
    })
})

// ─── Dynamic [STORY COVERAGE MISSING] ───────────────────────────────────────

test.describe('OrigamMessages — dynamic [STORY COVERAGE MISSING]', () => {
    test.fixme('add button increments message count; clear removes all', async () => {
        // No Variant in the migrated story exposes an add/clear
        // affordance anymore — "Dynamic (append & clear)" was dropped
        // entirely (no data-cy="messages-dynamic-add/clear" exists in
        // OrigamMessages.story.vue). Needs a story fixture to restore
        // this coverage, not a spec-only change.
    })
})
