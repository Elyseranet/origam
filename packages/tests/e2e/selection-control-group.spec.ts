import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, openEventsTab, selectHstOption, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * OrigamSelectionControlGroup — runtime assertions per story Variant.
 *
 * REALIGNED (2026-08) — the story migrated to the canonical
 * Design/Functional/Events/Slots structure. The migrated story never
 * had `data-cy` hosts to begin with in this component family — tests
 * now locate the group via `.origam-selection-control-group` and its
 * children via `.origam-selection-control` (structural, no data-cy on
 * OrigamSelectionControl / OrigamSelectionControlGroup — verified by
 * source read).
 *
 * Story URL: /story/components-stories-selectioncontrol-origamselectioncontrolgroup-story-vue
 *
 * ⛔ REAL BUG FOUND while realigning (root-caused, not guessed):
 * `OrigamSelectionControl.vue`'s native `<input>` never receives its
 * `type` or `disabled` attribute when those come from the GROUP's
 * defaults injection — which is the documented, story-demonstrated
 * usage pattern (`<OrigamSelectionControlGroup type="checkbox"
 * disabled>` cascading to un-typed `<OrigamSelectionControl
 * value="a" label="…"/>` children via `OrigamDefaultsProvider`).
 *
 * Root cause (read in source, packages/ds/src/components/
 * SelectionControl/OrigamSelectionControl.vue): the component does
 * `const _props = withDefaults(defineProps<...>(), {})` then
 * `const props = useDefaults(_props)` — the SECOND, defaults-merged
 * object. Composable-driven output (density/color classes, via
 * `useDensity(props)` / class computeds that explicitly write
 * `props.disabled`) correctly reads the MERGED `props` and works.
 * But the template's native `<input>` binds bare `:type="type"` /
 * `:disabled="disabled"` / `:aria-disabled="disabled"` — Vue's
 * `<script setup>` compiler auto-exposes every prop KEY declared in
 * `defineProps<T>()` to the template by name, pointing at the RAW
 * `_props` (pre-`useDefaults()`), not the merged `props` — so those
 * two bindings silently read the wrong, undefaulted value. `label`/
 * `name` happen to still work because the story passes them directly
 * on each `<OrigamSelectionControl>` (no merge needed).
 *
 * NOTE: this is not a "no `props.` in the template" convention
 * problem — that convention is fine and stays. The fault is in
 * `useDefaults()`'s integration: it manufactures a SECOND props
 * object in parallel of the first instead of making the merged
 * values consumable under the prop's own name, so the two objects
 * silently diverge for any prop the template reads bare.
 *
 * Verified empirically (2026-08, running Histoire instance):
 *   - `<input>` renders with NO `type` attribute at all — `el.type`
 *     reads back as the browser's implicit default `"text"`.
 *   - `<input aria-disabled="false">` stays `"false"` after toggling
 *     the group's "Disabled" checkbox, even though the WRAPPING
 *     `.origam-selection-control` div correctly gains the
 *     `--disabled` class (composable path, unaffected).
 *   - A user click on the input therefore never toggles `.checked`
 *     (browsers only give `<input>` checkbox semantics when
 *     `type="checkbox"`), so `update:modelValue` never fires — this
 *     is not just a cosmetic issue, checkbox/radio/switch selection
 *     is non-functional for any consumer following the documented
 *     group-level `type` pattern.
 *
 * Flagged as `test.fixme` below with this diagnostic, story/component
 * left untouched per this pass's scope (title-drift realignment).
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto('/stories/story/components-stories-selectioncontrol-origamselectioncontrolgroup-story-vue')
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const group = (sandbox: ReturnType<typeof sandboxOf>) =>
    sandbox.locator('.origam-selection-control-group').first()

// ─── Type ─────────────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Type', () => {
    test('renders controls in the type Variant regardless of type', async ({ page }) => {
        // "Prop — type" is now the "Functional" Variant's "Type" HstSelect
        // (checkbox/radio/switch), init-state = 'checkbox'.
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await expect(group(sandbox)).toBeVisible({ timeout: 8000 })
        await expect(group(sandbox).locator('.origam-selection-control')).toHaveCount(3)
    })

    test('switching type to radio still renders 3 controls', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Type', 'Radio')
        await page.waitForTimeout(300)
        await expect(group(sandbox).locator('.origam-selection-control')).toHaveCount(3)
    })

    test('the native input actually carries the group type attribute (checkbox)', async ({ page }) => {
        test.fixme(true, 'DS BUG: OrigamSelectionControl never applies the group-injected `type` to its native <input> — see module-level diagnostic. `el.type` reads back "text" instead of "checkbox".')
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const firstInput = group(sandbox).locator('.origam-selection-control__input input').first()
        await expect(firstInput).toBeVisible({ timeout: 8000 })
        await expect(firstInput).toHaveAttribute('type', 'checkbox')
    })
})

// ─── Color ────────────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Color', () => {
    test('color prop applies the color utility class to each control', async ({ page }) => {
        // "Prop — color" is now the "Design" Variant's "Color" HstSelect,
        // init-state = 'primary'.
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await expect(group(sandbox)).toBeVisible({ timeout: 8000 })
        await expect(group(sandbox).locator('.origam-selection-control')).not.toHaveCount(0)
        const wrappers = await group(sandbox).locator('.origam-selection-control__wrapper').evaluateAll(els =>
            els.map(el => el.className)
        )
        for (const cls of wrappers) {
            expect(cls).toContain('origam--color-primary')
        }
    })
})

// ─── Density ──────────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Density', () => {
    test('density class lands on child controls', async ({ page }) => {
        // "Prop — density" is now the "Design" Variant's "Density" HstSelect.
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await expect(group(sandbox)).toBeVisible({ timeout: 8000 })
        const childClasses = await group(sandbox).locator('.origam-selection-control').evaluateAll(els =>
            els.map(el => el.className)
        )
        expect(childClasses.length).toBeGreaterThan(0)
        for (const cls of childClasses) {
            expect(cls).toMatch(/origam-selection-control--density-(default|compact|comfortable)/)
        }
    })

    test('changing density updates the modifier class', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'Density', 'Compact')
        await page.waitForTimeout(300)
        const childClasses = await group(sandbox).locator('.origam-selection-control').evaluateAll(els =>
            els.map(el => el.className)
        )
        for (const cls of childClasses) {
            expect(cls).toContain('origam-selection-control--density-compact')
        }
    })
})

// ─── Selection modifiers (inline / multiple) ───────────────────────────────────

test.describe('OrigamSelectionControlGroup — Selection modifiers', () => {
    // "Prop — inline & multiple" split across two different Variants in the
    // migrated story: `inline` lives on "Design" (Layout group), `multiple`
    // lives on "Functional" (Data group).
    test('toggling inline (Design Variant) still renders 3 controls', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await toggleHstCheckbox(page, 'Inline')
        await page.waitForTimeout(300)
        await expect(group(sandbox).locator('.origam-selection-control')).toHaveCount(3)
    })

    test('toggling multiple (Functional Variant) still renders 3 controls', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await toggleHstCheckbox(page, 'Multiple')
        await page.waitForTimeout(300)
        await expect(group(sandbox).locator('.origam-selection-control')).toHaveCount(3)
    })
})

// ─── Icons ────────────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Icons', () => {
    test('trueIcon/falseIcon Variant renders without errors', async ({ page }) => {
        // "Prop — trueIcon & falseIcon" is now the "Design" Variant's Icons group.
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        await selectHstOption(page, 'True Icon', 'Check')
        await page.waitForTimeout(300)
        await expect(group(sandbox).locator('.origam-selection-control')).toHaveCount(3)
    })
})

// ─── States ───────────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — States', () => {
    test('disabled/readonly/error Variant renders controls without crash', async ({ page }) => {
        // "Prop — disabled, readonly & error" is now the "Functional"
        // Variant's States group. The wrapping element correctly reflects
        // `disabled` via the composable-driven CSS class (see module-level
        // diagnostic) — assert on that, not on the native <input>'s
        // aria-disabled, which is a known-broken separate assertion below.
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await toggleHstCheckbox(page, 'Disabled')
        await toggleHstCheckbox(page, 'Error')
        await page.waitForTimeout(300)
        await expect(group(sandbox).locator('.origam-selection-control')).not.toHaveCount(0)
        const firstControl = group(sandbox).locator('.origam-selection-control').first()
        await expect(firstControl).toHaveClass(/origam-selection-control--disabled/)
    })

    test('the native input actually reflects disabled via aria-disabled', async ({ page }) => {
        test.fixme(true, 'DS BUG: OrigamSelectionControl never applies the group-injected `disabled` to its native <input> — see module-level diagnostic. aria-disabled stays "false" even though the wrapping element correctly gains the --disabled class.')
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        await toggleHstCheckbox(page, 'Disabled')
        await page.waitForTimeout(300)
        const firstInput = group(sandbox).locator('.origam-selection-control__input input').first()
        await expect(firstInput).toHaveAttribute('aria-disabled', 'true')
    })
})

// ─── Items prop ───────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Items prop', () => {
    test('renders one control per items entry (3)', async ({ page }) => {
        // "Prop — items" has no standalone fixture anymore — the migrated
        // story only exercises `:items` combined with a custom #item slot
        // ("Slots - Item" Variant). Coverage for "one control per entry"
        // still holds on that Variant.
        await openVariant(page, 'Slots - Item')
        const sandbox = sandboxOf(page)
        await expect(group(sandbox)).toBeVisible({ timeout: 8000 })
        await expect(group(sandbox).locator('.origam-selection-control')).toHaveCount(3)
    })
})

// ─── Slot: default ────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Slot: default', () => {
    test('renders explicit OrigamSelectionControl children', async ({ page }) => {
        await openVariant(page, 'Slots - Default')
        const sandbox = sandboxOf(page)
        await expect(group(sandbox)).toBeVisible({ timeout: 8000 })
        await expect(group(sandbox).locator('input[aria-label="Choice X"]')).toBeVisible()
        await expect(group(sandbox).locator('input[aria-label="Choice Y"]')).toBeVisible()
        await expect(group(sandbox).locator('input[aria-label="Choice Z"]')).toBeVisible()
    })
})

// ─── Slot: item ───────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Slot: item', () => {
    test('custom item slot renders controls with the consumer-provided markup', async ({ page }) => {
        await openVariant(page, 'Slots - Item')
        const sandbox = sandboxOf(page)
        await expect(group(sandbox)).toBeVisible({ timeout: 8000 })
        await expect(group(sandbox).locator('.origam-selection-control')).not.toHaveCount(0)
        // The custom #item template prefixes each label with its 1-based index.
        await expect(group(sandbox)).toContainText('1. Alpha')
        await expect(group(sandbox)).toContainText('2. Beta')
        await expect(group(sandbox)).toContainText('3. Gamma')
    })
})

// ─── Emit: update:modelValue ──────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Emit: update:modelValue', () => {
    test('emit variant renders controls ready to fire', async ({ page }) => {
        await openVariant(page, 'Events - update:modelValue')
        const sandbox = sandboxOf(page)
        await expect(group(sandbox)).toBeVisible({ timeout: 8000 })
        await expect(group(sandbox).locator('.origam-selection-control')).toHaveCount(2)
    })

    test('checking a control fires update:modelValue (verified via the Events tab)', async ({ page }) => {
        test.fixme(true, 'DS BUG (downstream of the type-attribute bug, see module-level diagnostic): the native <input> never gets type="checkbox", so a click never toggles `.checked`, `handleInput` never sees a truthy change, and update:modelValue never fires. Confirmed empirically: Events tab stays empty after a click that visibly does nothing.')
        await openVariant(page, 'Events - update:modelValue')
        const sandbox = sandboxOf(page)
        const inputA = group(sandbox).locator('input[aria-label="Option A"]').first()
        await expect(inputA).toBeVisible({ timeout: 8000 })
        await inputA.click()
        await page.waitForTimeout(300)
        // Verify the control is still rendered (no crash).
        await expect(inputA).toBeVisible()

        await openEventsTab(page)
        await expect(eventLogItems(page).filter({ hasText: 'update:modelValue' })).toHaveCount(1)
    })
})

// ─── Playground ───────────────────────────────────────────────────────────────

test.describe('OrigamSelectionControlGroup — Default', () => {
    test('renders without errors', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)
        await expect(group(sandbox)).toBeVisible({ timeout: 8000 })
        await expect(group(sandbox).locator('.origam-selection-control')).toHaveCount(3)
    })
})
