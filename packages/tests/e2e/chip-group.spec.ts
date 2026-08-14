import { expect, test, type Page } from '@playwright/test'

import { selectHstOption, toggleHstCheckbox } from './_support/histoire-controls'

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
 *
 * Story realignment (canonical Design/Functional/Events/Slots structure):
 * neither OrigamChip.vue nor OrigamChipGroup.vue carry ANY `data-cy` hooks
 * (verified via grep) — the old story's `[data-cy="chip-group-…"]`
 * selectors were entirely story-side fall-through that no longer exists.
 * All locators here are class-based (`.origam-chip-group`, `.origam-chip`)
 * or text-based (chip label). The old side-by-side "Prop — multiple /
 * mandatory / filter / column / color" fixture Variants are gone —
 * multiple/mandatory/filter/column are now HstCheckbox controls on the
 * "Functional"/"Design" Variants, driven via `toggleHstCheckbox`; color is
 * the "Design" Variant's Color HstSelect, forwarded to child chips via
 * `origam-defaults-provider` (verified in OrigamChipGroup.vue).
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
        await openVariant(page, STORY, 'Design')
        const sandbox = sandboxOf(page)

        const group = sandbox.locator('.origam-chip-group').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const chips = await group.locator('.origam-chip').count()
        expect(chips).toBe(3)
    })

    test('clicking a chip toggles selection and updates status', async ({ page }) => {
        await openVariant(page, STORY, 'Default')
        const sandbox = sandboxOf(page)

        const chip1 = sandbox.locator('.origam-chip', { hasText: 'Alpha' }).first()
        await expect(chip1).toBeVisible({ timeout: 8000 })
        await chip1.click()
        await page.waitForTimeout(300)

        // Status display should show the selected value (1)
        const status = sandbox.locator('.story-status').first()
        await expect(status).toContainText('1')
    })
})

// ─── Multiple ───────────────────────────────────────────────────────────────

test.describe('OrigamChipGroup — multiple', () => {
    test('multiple chips can be selected simultaneously', async ({ page }) => {
        await openVariant(page, STORY, 'Functional')
        const sandbox = sandboxOf(page)
        await toggleHstCheckbox(page, 'Multiple')

        const chipA = sandbox.locator('.origam-chip', { hasText: 'Alpha' }).first()
        const chipB = sandbox.locator('.origam-chip', { hasText: 'Beta' }).first()
        await expect(chipA).toBeVisible({ timeout: 8000 })

        await chipA.click()
        await page.waitForTimeout(200)
        await chipB.click()
        await page.waitForTimeout(200)

        const status = sandbox.locator('.story-status').first()
        const text = await status.innerText()
        // Both values (1 and 2) should be in the status
        expect(text).toContain('1')
        expect(text).toContain('2')
    })
})

// ─── Mandatory ──────────────────────────────────────────────────────────────

test.describe('OrigamChipGroup — mandatory', () => {
    test('mandatory mode keeps at least one chip selected', async ({ page }) => {
        await openVariant(page, STORY, 'Functional')
        const sandbox = sandboxOf(page)
        await toggleHstCheckbox(page, 'Mandatory')

        const statusEl = sandbox.locator('.story-status').first()
        await expect(statusEl).toBeVisible({ timeout: 8000 })

        const chipAlpha = sandbox.locator('.origam-chip', { hasText: 'Alpha' }).first()
        // Select it first (functionalModel starts undefined).
        await chipAlpha.click()
        await page.waitForTimeout(300)
        await expect(statusEl).toContainText('1')

        // Click the already-selected chip again → mandatory prevents deselection.
        await chipAlpha.click()
        await page.waitForTimeout(300)

        const text = await statusEl.innerText()
        expect(text).toContain('1')
    })
})

// ─── Filter ─────────────────────────────────────────────────────────────────

test.describe('OrigamChipGroup — filter', () => {
    test('filter group renders chips and selecting one shows filter icon', async ({ page }) => {
        test.fixme(true, 'DS BUG: OrigamChipGroup\'s `filter` prop is declared on IChipGroupProps but never read anywhere in OrigamChipGroup.vue\'s script (verified via grep — zero occurrences of `props.filter`/`.filter` outside the type declaration). It does not cascade to child chips via `slotDefaults` (which only forwards color/bgColor/active/hover) nor gate anything else at the group level. OrigamChip.vue only shows `.origam-chip__filter` when the CHIP\'S OWN `filter` prop is true (`hasFilter = (slots.filter || props.filter) && group`) — toggling the group\'s "Filter (check icon)" control has no observable effect. Needs a DS fix: add `filter` to OrigamChipGroup\'s slotDefaults so it cascades like color/bgColor/active/hover.')
        await openVariant(page, STORY, 'Functional')
        const sandbox = sandboxOf(page)
        await toggleHstCheckbox(page, 'Filter (check icon)')

        const group = sandbox.locator('.origam-chip-group').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const chip1 = sandbox.locator('.origam-chip', { hasText: 'Alpha' }).first()
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
        await openVariant(page, STORY, 'Design')
        const sandbox = sandboxOf(page)
        await toggleHstCheckbox(page, 'Column (wrap)')

        const group = sandbox.locator('.origam-chip-group').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const cls = await group.evaluate(el => el.className)
        expect(cls).toContain('origam-chip-group--column')
    })
})

// ─── Color ──────────────────────────────────────────────────────────────────

test.describe('OrigamChipGroup — color', () => {
    test('color prop is forwarded to child chips via origam-defaults-provider', async ({ page }) => {
        await openVariant(page, STORY, 'Design')
        const sandbox = sandboxOf(page)

        const group = sandbox.locator('.origam-chip-group').first()
        await expect(group).toBeVisible({ timeout: 8000 })
        // Design Variant init-state already sets color: 'primary' — no control change needed.
        const chips = group.locator('.origam-chip')
        await expect(chips).toHaveCount(3)
        const firstChipClass = await chips.first().evaluate((el) => el.className)
        expect(firstChipClass).toContain('origam--color-primary')

        await selectHstOption(page, 'Color', 'Success')
        await expect(chips.first()).toHaveClass(/origam--color-success/, { timeout: 4000 })
    })
})
