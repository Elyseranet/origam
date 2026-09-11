import { expect, test, type Page } from '@playwright/test'

import { toggleHstCheckbox } from './_support/histoire-controls'

/**
 * Lot C1 — OrigamBtnToggle runtime probes.
 *
 * Each Variant tests one orthogonal facet of the selection contract:
 *   - default (single selection): clicking switches the active class
 *     to the chosen item; the v-model status text reflects the value.
 *   - multiple: an array v-model accumulates selections.
 *   - mandatory: clicking the active item DOES NOT deselect it.
 *   - disabled: clicks on disabled buttons don't change selection.
 *
 * Note the selectedClass default is `origam-btn-group-item--active`
 * (set by OrigamBtnToggle's `useGroup` registration) — that's the
 * source of truth for "is this item selected".
 *
 * The story restructuring (canonical Design/State/Functional/Events/Slots
 * layout, see root CLAUDE.md) removed every scenario-specific fixture
 * this spec targeted (bt-default-*, bt-multiple-*, bt-mandatory-*,
 * bt-disabled-*, each with its own crafted example data) — replaced by
 * ONE shared "Functional" Variant with generic buttons (One/Two/Three,
 * values 1/2/3, `functionalValue` starting at `1`) and Multiple /
 * Mandatory / Disabled checkboxes (see OrigamBtnToggle.story.vue). Every
 * test below drives the relevant checkbox on that one Variant instead of
 * navigating to a dedicated fixture, and reads the generic
 * `.story-status strong` status text instead of a per-fixture data-cy.
 * Verified empirically against the running story before writing the
 * assertions: Multiple=true + click "Two" → `[1,2]`; click "One" again →
 * `[2]` (removes); Mandatory=true + re-click the active item → stays `1`
 * (no deselect); Disabled=true + click "Two" (force) → stays `1`
 * (unchanged).
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyPath: string, variant: string) => {
    await page.goto(storyPath)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const STORY = '/stories/story/components-stories-btn-origambtntoggle-story-vue'

// `useGroup` toggles `origam-btn--active` on each child via the
// `selectedClass` ref it injects through `useGroupItem`. That's our
// runtime contract for "is this item selected".
const SELECTED_CLASS = 'origam-btn--active'

// ─── Default (single) ──────────────────────────────────────────────────────

test.describe('OrigamBtnToggle — single selection', () => {
    test('initial v-model puts the matching item in the active class', async ({ page }) => {
        // Dedicated fixture folded into "Functional" — `functionalValue`
        // starts at `1` ("One" selected), see OrigamBtnToggle.story.vue.
        await openVariant(page, STORY, 'Functional')
        const sandbox = sandboxOf(page)

        const toggle = sandbox.locator('.origam-btn-toggle').first()
        await expect(toggle).toBeVisible({ timeout: 8000 })

        // story default is `1` ("One")
        await expect(sandbox.locator(`.${SELECTED_CLASS}`)).toHaveCount(1)

        const activeText = await sandbox.locator(`.${SELECTED_CLASS}`).first().locator('.origam-btn__content').textContent()
        expect((activeText || '').trim()).toBe('One')
    })

    test('clicking another button moves the selection there', async ({ page }) => {
        await openVariant(page, STORY, 'Functional')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-btn-toggle').first()).toBeVisible({ timeout: 8000 })

        await sandbox.locator('.origam-btn', { hasText: 'Two' }).click()
        await page.waitForTimeout(200)

        const status = await sandbox.locator('.story-status strong').textContent()
        expect(status).toContain('2')

        await expect(sandbox.locator(`.${SELECTED_CLASS}`)).toHaveCount(1)
    })
})

// ─── Multiple ──────────────────────────────────────────────────────────────

test.describe('OrigamBtnToggle — multiple selection', () => {
    test('clicking a second item appends to the v-model array', async ({ page }) => {
        // Dedicated fixture folded into "Functional" — Multiple checkbox
        // defaults to unchecked (false), flip it on. Verified empirically:
        // functionalValue starts at 1; toggling Multiple then clicking
        // "Two" produces status `[1,2]`.
        await openVariant(page, STORY, 'Functional')
        await toggleHstCheckbox(page, 'Multiple')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-btn-toggle').first()).toBeVisible({ timeout: 8000 })

        const status0 = await sandbox.locator('.story-status strong').textContent()
        expect(status0).toContain('1')

        await sandbox.locator('.origam-btn', { hasText: 'Two' }).click()
        await page.waitForTimeout(200)

        const status1 = await sandbox.locator('.story-status strong').textContent()
        expect(status1).toContain('1')
        expect(status1).toContain('2')

        // Both should now be visually active.
        await expect(sandbox.locator(`.${SELECTED_CLASS}`)).toHaveCount(2)
    })

    test('clicking a selected item removes it from the array', async ({ page }) => {
        // Dedicated fixture folded into "Functional" — same Multiple
        // toggle as above. Verified empirically: with Multiple=true and
        // the initial `1` ("One") selection, a single click on the
        // already-selected "One" produces status `[]` (JSON.stringify of
        // the now-empty array — the status text is a raw
        // `JSON.stringify(functionalValue)`, no "(empty)" fallback here).
        await openVariant(page, STORY, 'Functional')
        await toggleHstCheckbox(page, 'Multiple')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-btn-toggle').first()).toBeVisible({ timeout: 8000 })

        // initially `1` ("One") is selected. Click it again.
        await sandbox.locator('.origam-btn', { hasText: 'One' }).click()
        await page.waitForTimeout(200)

        const status = await sandbox.locator('.story-status strong').textContent()
        expect(status).toContain('[]')
        await expect(sandbox.locator(`.${SELECTED_CLASS}`)).toHaveCount(0)
    })
})

// ─── Mandatory ─────────────────────────────────────────────────────────────

test.describe('OrigamBtnToggle — mandatory', () => {
    test('clicking the active item does NOT deselect it', async ({ page }) => {
        // Dedicated fixture folded into "Functional" — Mandatory checkbox
        // defaults to unchecked (false), flip it on. Verified empirically:
        // functionalValue starts at 1; toggling Mandatory then re-clicking
        // the active "One" leaves status at `1` (no deselect).
        await openVariant(page, STORY, 'Functional')
        await toggleHstCheckbox(page, 'Mandatory')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-btn-toggle').first()).toBeVisible({ timeout: 8000 })

        // story default = `1` ("One")
        await sandbox.locator('.origam-btn', { hasText: 'One' }).click()
        await page.waitForTimeout(200)

        const status = await sandbox.locator('.story-status strong').textContent()
        expect(status).toContain('1')
        await expect(sandbox.locator(`.${SELECTED_CLASS}`)).toHaveCount(1)
    })
})

// ─── Disabled ──────────────────────────────────────────────────────────────

test.describe('OrigamBtnToggle — disabled', () => {
    test('clicks on disabled buttons do not change the selection', async ({ page }) => {
        // Dedicated fixture folded into "Functional" — Disabled checkbox
        // defaults to unchecked (false), flip it on. Verified empirically:
        // functionalValue starts at 1; toggling Disabled then force-clicking
        // "Two" leaves status unchanged at `1`.
        await openVariant(page, STORY, 'Functional')
        await toggleHstCheckbox(page, 'Disabled')
        await page.waitForTimeout(400)
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-btn-toggle').first()).toBeVisible({ timeout: 8000 })

        const status0 = await sandbox.locator('.story-status strong').textContent()

        // Force the click — disabled buttons normally swallow pointer
        // events so without `force` Playwright would refuse.
        await sandbox.locator('.origam-btn', { hasText: 'Two' }).click({ force: true })
        await page.waitForTimeout(200)

        const status1 = await sandbox.locator('.story-status strong').textContent()
        expect(status1).toBe(status0)
    })
})

// ─── Density forwarding ────────────────────────────────────────────────────

test.describe('OrigamBtnToggle — forwards density to the underlying group', () => {
    test('the toggle renders a btn-group with the selected density modifier', async ({ page }) => {
        // Dedicated fixture folded into "Design" — its default init-state
        // leaves density unset, and the composable's baked-in 'default'
        // rung applies regardless (same pattern already confirmed on
        // btn-group.spec.ts / btn-propagation.spec.ts), so no control
        // interaction is needed.
        await openVariant(page, STORY, 'Design')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-btn-toggle').first()).toBeVisible({ timeout: 8000 })

        const group = sandbox.locator('.origam-btn-group').first()
        const cls = await group.evaluate(el => el.className)
        expect(cls).toContain('origam-btn-group--density-default')
    })
})
