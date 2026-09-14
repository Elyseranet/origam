import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * OrigamExpansionPanels — runtime assertions per story Variant.
 *
 * Story URL: /story/components-stories-expansionpanel-origamexpansionpanels-story-vue
 *
 * Story realignment (canonical Design/Functional/Events/Slots structure):
 * NO `data-cy` attribute exists anywhere in OrigamExpansionPanels.story.vue
 * nor in OrigamExpansionPanels.vue / OrigamExpansionPanel.vue /
 * OrigamExpansionPanelHeader.vue (verified via grep) — every locator here
 * is class-based. Old side-by-side "Prop — …" Variants folded into the
 * "Design"/"Functional" Variants' controls, driven via `selectHstOption`.
 *
 * DS BUG STATUS UPDATE (2026-08): the previously-documented "useElevation
 * not imported" bug that made every test in this file `test.fixme` is
 * FIXED — verified empirically: `useElevation` is properly imported in
 * OrigamExpansionPanels.vue (named import list + call site), and a probe
 * navigation to the "Design" Variant mounts cleanly with 3 panels and zero
 * console/page errors. All tests below are un-fixme'd and now run for
 * real.
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto('/stories/story/components-stories-expansionpanel-origamexpansionpanels-story-vue')
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

// ─── Color ────────────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Color', () => {
    test('color variant renders without errors', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Color', 'Success')
        const root = sandbox.locator('.origam-expansion-panels').first()
        await expect(root).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('.origam-expansion-panel')).toHaveCount(3, { timeout: 8000 })
    })
})

// ─── Density ──────────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Density', () => {
    test('density class lands on child panels', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Density', 'Compact')
        const panels = sandbox.locator('.origam-expansion-panel')
        await expect(panels).toHaveCount(3, { timeout: 8000 })
        const childClasses = await panels.evaluateAll(els => els.map(el => el.className))
        for (const cls of childClasses) {
            expect(cls).toMatch(/origam-expansion-panel--density-(default|compact|comfortable)/)
        }
    })
})

// ─── Rounded ──────────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Rounded', () => {
    test('rounded class is applied to the wrapper', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Rounded', 'small (radius.sm / 4px)')
        const wrapper = sandbox.locator('.origam-expansion-panels').first()
        await expect(wrapper).toBeVisible({ timeout: 8000 })
        const cls = await wrapper.evaluate(el => el.className)
        expect(cls).toMatch(/origam-expansion-panels--rounded|origam--rounded/)
    })
})

// ─── Border ───────────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Border', () => {
    test('border modifier class is applied', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Border', 'Border (legacy boolean → thin)')
        const wrapper = sandbox.locator('.origam-expansion-panels').first()
        await expect(wrapper).toBeVisible({ timeout: 8000 })
        const cls = await wrapper.evaluate(el => el.className)
        expect(cls).toMatch(/origam-expansion-panels--border|origam--border/)
    })
})

// ─── Elevation ────────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Elevation', () => {
    test('elevation variant renders without errors', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Elevation', 'MD (8)')
        await expect(sandbox.locator('.origam-expansion-panels').first()).toBeVisible({ timeout: 8000 })
    })
})

// ─── Icons ────────────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Icons', () => {
    test('panels render with icon variant controls', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Expand Icon', 'Star')
        await selectHstOption(page, 'Collapse Icon', 'Heart')
        await expect(sandbox.locator('.origam-expansion-panels').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('.origam-expansion-panel')).toHaveCount(3, { timeout: 8000 })
    })
})

// ─── Selection ────────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Selection', () => {
    test('selection variant renders panels', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-expansion-panels').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('.origam-expansion-panel')).toHaveCount(3, { timeout: 8000 })
    })
})

// ─── Items prop ───────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Items prop', () => {
    // Story realignment: no bare "items renders panels" Variant survives —
    // every Variant using `:items="panelItems"` (3 items) pairs it with a
    // slot override. "Slots - Append" is a non-destructive one (the append
    // slot only adds content, it doesn't replace panel rendering), so it's
    // a faithful re-target for "items drives panel count".
    test('renders one panel per items entry (3)', async ({ page }) => {
        await openVariant(page, 'Slots - Append')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-expansion-panels').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('.origam-expansion-panel')).toHaveCount(3, { timeout: 8000 })
    })
})

// ─── Slot: default ────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Slot: default', () => {
    test('renders explicit OrigamExpansionPanel children with slot-based title', async ({ page }) => {
        await openVariant(page, 'Slots - Default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-expansion-panels').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('.origam-expansion-panel')).toHaveCount(2, { timeout: 8000 })
        await expect(sandbox.getByText('Custom title one')).toBeVisible()
        await expect(sandbox.getByText('Custom title two')).toBeVisible()
    })
})

// ─── Slot: item ───────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Slot: item', () => {
    test('custom item slot renders 3 panels', async ({ page }) => {
        await openVariant(page, 'Slots - Item')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-expansion-panels').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('.origam-expansion-panel')).toHaveCount(3, { timeout: 8000 })
    })
})

// ─── Slot: header ─────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Slot: header', () => {
    test('custom header slot renders', async ({ page }) => {
        await openVariant(page, 'Slots - Header')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-expansion-panels').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.getByText('Custom header slot')).toBeVisible({ timeout: 8000 })
    })
})

// ─── Slot: title ──────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Slot: title', () => {
    test('custom title slot renders', async ({ page }) => {
        await openVariant(page, 'Slots - Title')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-expansion-panels').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.getByText('Custom title slot')).toBeVisible({ timeout: 8000 })
    })
})

// ─── Emit: update:modelValue ──────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Emit: update:modelValue', () => {
    test('emit variant renders clickable panels', async ({ page }) => {
        await openVariant(page, 'Events - update:modelValue')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-expansion-panels').first()).toBeVisible({ timeout: 8000 })
        const headers = sandbox.locator('.origam-expansion-panel-header')
        await expect(headers).not.toHaveCount(0, { timeout: 8000 })
    })
})

// ─── Emit: group:selected ─────────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Emit: group:selected', () => {
    test('emit variant renders panels that can fire group:selected', async ({ page }) => {
        await openVariant(page, 'Events - group:selected')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-expansion-panels').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.getByText('Select me')).toBeVisible()
        await expect(sandbox.getByText('Or me')).toBeVisible()
    })
})

// ─── Playground ───────────────────────────────────────────────────────────────

test.describe('OrigamExpansionPanels — Default', () => {
    test('renders without errors', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-expansion-panels').first()).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('.origam-expansion-panel')).toHaveCount(3, { timeout: 8000 })
    })
})
