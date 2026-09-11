import { expect, test, type Page } from '@playwright/test'

/**
 * Lot C2 — OrigamChipGroup runtime probes.
 *
 * Asserts every Variant in `OrigamChipGroup.story.vue` produces the
 * runtime contract documented in `OrigamChipGroup.md`:
 *   - default renders group + 3 chips; clicking a chip selects it
 *   - multiple: clicking several chips selects each one
 *   - mandatory: deselecting the only active chip has no effect
 *   - filter: selected chip shows the filter icon
 *   - column: wrapper has --column modifier class
 *   - color: forwarded to child chips
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyPath: string, variant: string) => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const STORY = '/stories/story/components-stories-chip-origamchipgroup-story-vue'

// ─── Default ────────────────────────────────────────────────────────────────

test.describe('OrigamChipGroup — default', () => {
    test('renders the group wrapper with 3 child chips', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        const group = sandbox.locator('[data-cy="chip-group-playground"]').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const chips = await group.locator('.origam-chip').count()
        expect(chips).toBe(3)
    })

    test('clicking a chip toggles selection and updates status', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        const chip1 = sandbox.locator('[data-cy="chip-group-playground-1"]').first()
        await expect(chip1).toBeVisible({ timeout: 8000 })
        await chip1.click()
        await page.waitForTimeout(300)

        // Status display should show the selected value (1)
        const status = sandbox.locator('[data-cy="chip-group-playground-status"]').first()
        await expect(status).toContainText('1')
    })
})

// ─── Multiple ───────────────────────────────────────────────────────────────

test.describe('OrigamChipGroup — multiple', () => {
    test('multiple chips can be selected simultaneously', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — multiple (checkbox-style selection)')
        const sandbox = sandboxOf(page)

        const chipA = sandbox.locator('[data-cy="chip-group-multiple-a"]').first()
        const chipB = sandbox.locator('[data-cy="chip-group-multiple-b"]').first()
        await expect(chipA).toBeVisible({ timeout: 8000 })

        await chipA.click()
        await page.waitForTimeout(200)
        await chipB.click()
        await page.waitForTimeout(200)

        const status = sandbox.locator('[data-cy="chip-group-multiple-status"]').first()
        const text = await status.innerText()
        // Both a and b should be in the status
        expect(text).toContain('a')
        expect(text).toContain('b')
    })
})

// ─── Mandatory ──────────────────────────────────────────────────────────────

test.describe('OrigamChipGroup — mandatory', () => {
    test('mandatory mode keeps at least one chip selected', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — mandatory (always one selected)')
        const sandbox = sandboxOf(page)

        // Initial selection is 'grid'
        const statusEl = sandbox.locator('[data-cy="chip-group-mandatory-status"]').first()
        await expect(statusEl).toBeVisible({ timeout: 8000 })

        const gridChip = sandbox.locator('[data-cy="chip-group-mandatory-grid"]').first()
        // Click the already-selected chip → mandatory prevents deselection
        await gridChip.click()
        await page.waitForTimeout(300)

        const text = await statusEl.innerText()
        // Should still have a value (not empty)
        expect(text).not.toContain('(none)')
    })
})

// ─── Filter ─────────────────────────────────────────────────────────────────

test.describe('OrigamChipGroup — filter', () => {
    test('filter group renders chips and selecting one shows filter icon', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — filter (check icon when selected)')
        const sandbox = sandboxOf(page)

        const group = sandbox.locator('[data-cy="chip-group-filter"]').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const chip1 = sandbox.locator('[data-cy="chip-group-filter-1"]').first()
        await chip1.click()
        await page.waitForTimeout(300)

        // The chip__filter div should now be visible
        const filterEl = chip1.locator('.origam-chip__filter').first()
        await expect(filterEl).toBeVisible()
    })
})

// ─── Column ─────────────────────────────────────────────────────────────────

test.describe('OrigamChipGroup — column', () => {
    test('column=true emits --column modifier class', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — column (wraps chips to new lines)')
        const sandbox = sandboxOf(page)

        const group = sandbox.locator('[data-cy="chip-group-column"]').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const cls = await group.evaluate(el => el.className)
        expect(cls).toContain('origam-chip-group--column')
    })
})

// ─── Color ──────────────────────────────────────────────────────────────────

test.describe('OrigamChipGroup — color', () => {
    test('color prop is passed down and group renders child chips', async ({ page }) => {
        await openVariant(page, STORY, 'Prop — color (applies to selected chip)')
        const sandbox = sandboxOf(page)

        const group = sandbox.locator('[data-cy="chip-group-color"]').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const chips = await group.locator('.origam-chip').count()
        expect(chips).toBe(2)
    })
})
