import { expect, test, type Page } from '@playwright/test'

import { fillHstText, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * Regression spec — `OrigamItemGroup` + `OrigamItem` are origam's
 * generic, renderless selection primitives (Vuetify `v-item-group` /
 * `v-item` equivalent). The components impose no visual; consumers
 * paint each option however they like (a Card, a Tile, a custom UI)
 * via the `<OrigamItem>` slot scope: `{ isSelected, toggle, select,
 * value, disabled, selectedClass }`.
 *
 * REALIGNED (2026-08) — the story migrated to the canonical
 * Design/Functional/Events/Slots structure. The old spec navigated to
 * one dedicated `Prop — X` Variant per fixture (default / multiple /
 * mandatory / selectedClass); those Variants no longer exist. The
 * "Functional" Variant now covers all four via HstCheckbox/HstText
 * controls on a single instance (fixture cards: Small/Medium/Large,
 * `functionalModel` starts at `'m'` — Medium pre-selected).
 *
 * Each test below verifies one selection-mode contract end-to-end by
 * clicking a card (the consumer-rendered visual that wraps each
 * `<OrigamItem>`) and asserting the v-model + class state shifts.
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const STORY = '/stories/story/components-stories-itemgroup-origamitemgroup-story-vue'

const open = async (page: Page, variant: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const cardByLabel = (sandbox: ReturnType<typeof sandboxOf>, label: string) =>
    sandbox.locator('.ig-card').filter({ hasText: label })

test.describe('OrigamItemGroup — Default (single selection)', () => {
    test('initial selection shows one active card', async ({ page }) => {
        await open(page, 'Default')
        const sandbox = sandboxOf(page)
        const active = sandbox.locator('.ig-card--active')
        await expect(active.first()).toBeVisible({ timeout: 8000 })
        expect(await active.count()).toBe(1)
    })

    test('clicking another card shifts the active state', async ({ page }) => {
        // "Prop — default (single selection)" is now the "Functional"
        // Variant's default state (multiple=false, mandatory=false).
        // Status text lives in `.ig-status` (no dedicated data-cy anymore).
        await open(page, 'Functional')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.ig-card').first()).toBeVisible({ timeout: 8000 })

        // Story init: 'm' (Medium) is selected. Click Large.
        await cardByLabel(sandbox, 'Large').click()
        await page.waitForTimeout(250)

        const status = await sandbox.locator('.ig-status').textContent()
        expect(status).toContain('l')

        // Active class moved.
        const activeCount = await sandbox.locator('.ig-card--active').count()
        expect(activeCount).toBe(1)
    })
})

test.describe('OrigamItemGroup — Multiple', () => {
    test('clicking adds to the array', async ({ page }) => {
        // "Prop — multiple (checkbox-style, many selected)" is now the
        // "Functional" Variant with the "Multiple" checkbox toggled on.
        await open(page, 'Functional')
        await toggleHstCheckbox(page, 'Multiple')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.ig-card').first()).toBeVisible({ timeout: 8000 })

        // Story init: 'm' (Medium) selected. Click Small to add it.
        await cardByLabel(sandbox, 'Small').click()
        await page.waitForTimeout(250)

        const status = await sandbox.locator('.ig-status').textContent()
        expect(status).toContain('m')
        expect(status).toContain('s')

        const activeCount = await sandbox.locator('.ig-card--active').count()
        expect(activeCount).toBe(2)
    })

    test('clicking a selected item removes it from the array', async ({ page }) => {
        await open(page, 'Functional')
        await toggleHstCheckbox(page, 'Multiple')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.ig-card').first()).toBeVisible({ timeout: 8000 })

        // Click 'Medium' (already active, story init) → removed.
        await cardByLabel(sandbox, 'Medium').click()
        await page.waitForTimeout(250)

        const status = await sandbox.locator('.ig-status').textContent()
        expect(status).toContain('[]')
        const activeCount = await sandbox.locator('.ig-card--active').count()
        expect(activeCount).toBe(0)
    })
})

test.describe('OrigamItemGroup — Mandatory', () => {
    test('clicking the active item does NOT deselect it', async ({ page }) => {
        // "Prop — mandatory (always keeps one selected)" is now the
        // "Functional" Variant with the "Mandatory" checkbox toggled on.
        await open(page, 'Functional')
        await toggleHstCheckbox(page, 'Mandatory')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.ig-card').first()).toBeVisible({ timeout: 8000 })

        // Story init: 'm' (Medium) active. Click the SAME Medium card.
        await cardByLabel(sandbox, 'Medium').click()
        await page.waitForTimeout(250)

        // Still exactly one active.
        const activeCount = await sandbox.locator('.ig-card--active').count()
        expect(activeCount).toBe(1)
    })
})

test.describe('OrigamItemGroup — Custom selectedClass', () => {
    test('the custom class lands on active items in addition to the default origam-item--selected', async ({ page }) => {
        // "Prop — selectedClass (custom active class)" is now the
        // "Functional" Variant's "Selected Class" HstText control.
        await open(page, 'Functional')
        await fillHstText(page, 'Selected Class', 'my-custom-active')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.ig-card').first()).toBeVisible({ timeout: 8000 })

        // Story init: 'm' (Medium) active. The custom class lands on the
        // <OrigamItem> root (via `useGroupItem`'s selectedClass, see
        // group.composable.ts) that wraps the active card.
        await page.waitForTimeout(300)
        const activeWithCustom = await sandbox.locator('.my-custom-active').count()
        expect(activeWithCustom).toBeGreaterThanOrEqual(1)
    })
})
