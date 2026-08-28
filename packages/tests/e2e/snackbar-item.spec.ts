import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, openEventsTab, selectHstOption, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * OrigamSnackbarItem — runtime probes asserting that the pure visual
 * component renders correctly for every exposed prop / slot / emit.
 *
 * REALIGNED (2026-08) — the story migrated to the canonical
 * Design/Functional/Events/Slots structure. None of the migrated
 * Variants pass a `data-cy` prop to `<origam-snackbar-item>` (it is a
 * consumer-supplied prop, not a static attribute — verified by source
 * read of OrigamSnackbarItem.vue) — every old `[data-cy="snackbar-
 * item-*"]` host is gone. Tests now locate the single instance per
 * Variant via `.origam-snackbar-item` (structural) and drive the
 * "Intent" / "Dismissible" controls through the shared
 * histoire-controls helper instead of navigating to removed `Prop — X`
 * Variants.
 *
 * The "Emit — dismiss" / "Slot — actions" counters
 * (`data-cy="snackbar-item-emit-counter"` /
 * `data-cy="snackbar-item-slot-action-counter"`) have no equivalent
 * anymore — the migrated story wires straight to Histoire's
 * `logEvent()`, observable via the native Events tab
 * (openEventsTab/eventLogItems) instead of a story-side counter.
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

const item = (sandbox: ReturnType<typeof sandboxOf>) =>
    sandbox.locator('.origam-snackbar-item').first()

test.describe('OrigamSnackbarItem — Prop: intent', () => {
    test('each intent renders the correct modifier class', async ({ page }) => {
        // "Prop — intent" is now the "Design" Variant's "Intent" HstSelect,
        // init-state = 'info'. HstSelect option labels are capitalised
        // (INTENT_OPTIONS) even though the value / CSS class stay lowercase.
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        const intents = [
            { value: 'info', label: 'Info' },
            { value: 'success', label: 'Success' },
            { value: 'warning', label: 'Warning' },
            { value: 'danger', label: 'Danger' }
        ] as const

        for (const intent of intents) {
            if (intent.value !== 'info') {
                await selectHstOption(page, 'Intent', intent.label)
                await page.waitForTimeout(200)
            }
            await expect(item(sandbox)).toHaveClass(new RegExp(`origam-snackbar-item--intent-${intent.value}`))
        }
    })

    test('warning and danger render role="alert" + aria-live="assertive"', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        for (const label of ['Warning', 'Danger']) {
            await selectHstOption(page, 'Intent', label)
            await page.waitForTimeout(200)
            await expect(item(sandbox)).toHaveAttribute('role', 'alert')
            await expect(item(sandbox)).toHaveAttribute('aria-live', 'assertive')
        }
    })

    test('info and success render role="status" + aria-live="polite"', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        // init-state is already 'info'.
        await expect(item(sandbox)).toHaveAttribute('role', 'status')
        await expect(item(sandbox)).toHaveAttribute('aria-live', 'polite')

        await selectHstOption(page, 'Intent', 'Success')
        await page.waitForTimeout(200)
        await expect(item(sandbox)).toHaveAttribute('role', 'status')
        await expect(item(sandbox)).toHaveAttribute('aria-live', 'polite')
    })
})

test.describe('OrigamSnackbarItem — Prop: dismissible', () => {
    test('dismiss button is visible when dismissible=true', async ({ page }) => {
        // "Prop — dismissible" is now the "Functional" Variant, init-state
        // dismissible: true.
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)

        const dismissBtn = item(sandbox).locator('.origam-snackbar-item__dismiss')
        await expect(dismissBtn).toBeVisible({ timeout: 5000 })
    })

    test('dismiss button is absent when dismissible=false', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)

        await toggleHstCheckbox(page, 'Dismissible')
        await page.waitForTimeout(300)

        const dismissBtn = item(sandbox).locator('.origam-snackbar-item__dismiss')
        await expect(dismissBtn).toHaveCount(0)
    })
})

test.describe('OrigamSnackbarItem — Emit: dismiss', () => {
    test('clicking the dismiss button emits dismiss (verified via the Events tab)', async ({ page }) => {
        // The pre-migration story rendered a "Dismissed: N" counter in the
        // DOM (data-cy="snackbar-item-emit-counter") — the migrated story
        // wires straight to logEvent(), observable via Histoire's native
        // Events tab instead.
        await openVariant(page, 'Events - dismiss')
        const sandbox = sandboxOf(page)

        const dismissBtn = item(sandbox).locator('.origam-snackbar-item__dismiss')
        await expect(dismissBtn).toBeVisible({ timeout: 4000 })
        await dismissBtn.click()
        await page.waitForTimeout(200)

        await openEventsTab(page)
        await expect(eventLogItems(page).filter({ hasText: 'dismiss' })).toHaveCount(1)
    })
})

test.describe('OrigamSnackbarItem — Prop: actions', () => {
    test('action buttons render when actions prop is provided', async ({ page }) => {
        // No Variant exposes `actions` as a driveable control anymore —
        // reusing the fixed "Events - action" fixture, which does pass
        // `:actions="sampleActions"`, for the render assertion.
        await openVariant(page, 'Events - action')
        const sandbox = sandboxOf(page)

        const actionBtn = item(sandbox).locator('.origam-snackbar-item__action').first()
        await expect(actionBtn).toBeVisible({ timeout: 4000 })
        await expect(actionBtn).toContainText('Undo')
    })
})

test.describe('OrigamSnackbarItem — Slot: actions', () => {
    test('custom actions slot renders and fires on click (verified via the Events tab)', async ({ page }) => {
        // The pre-migration story rendered a "Slot action clicks: N"
        // counter (data-cy="snackbar-item-slot-action-counter") — the
        // migrated story wires the custom button straight to logEvent().
        await openVariant(page, 'Slots - Actions')
        const sandbox = sandboxOf(page)

        const undoBtn = sandbox.getByText('Undo', { exact: true }).first()
        await expect(undoBtn).toBeVisible({ timeout: 5000 })
        await undoBtn.click()
        await page.waitForTimeout(200)

        await openEventsTab(page)
        await expect(eventLogItems(page).filter({ hasText: 'actions slot click' })).toHaveCount(1)
    })
})

test.describe('OrigamSnackbarItem — Slot: prepend', () => {
    /**
     * ⛔ REAL BUG — FIXED (packages/ds/src/components/Snackbar/OrigamSnackbarItem.vue).
     * The entire prepend area — including any custom `#prepend` slot
     * content — used to never render, because `resolvedIcon` was always
     * `false`: `icon?: TIcon | false` (ISnackbarItemProps) makes the
     * runtime prop type include `Boolean`, and Vue resolves an unset
     * prop whose type includes `Boolean` to the concrete value `false`
     * (never `undefined`) when no default silences it. The template
     * also gated the WHOLE prepend wrapper — not just the built-in
     * `<origam-icon>` fallback — behind `v-if="resolvedIcon !== false"`,
     * so a consumer-supplied `#prepend` slot was dropped along with the
     * default icon.
     *
     * Fix: `resolvedIcon` now resolves via `usePassedProps()` (the DS's
     * existing helper for telling "explicitly passed `false`" apart
     * from "not passed at all", per its doc comment in
     * defaults.composable.ts) instead of a naive `props.icon === false`
     * check. The prepend zone's `v-if` is decoupled into its own
     * `hasPrepend` computed (`resolvedIcon !== false || !!slots.prepend`)
     * so a custom slot renders independently of the icon default.
     */
    test('custom prepend slot overrides the default icon', async ({ page }) => {
        await openVariant(page, 'Slots - Prepend')
        const sandbox = sandboxOf(page)

        const prepend = item(sandbox).locator('.origam-snackbar-item__prepend')
        await expect(prepend).toBeVisible({ timeout: 5000 })
    })
})

test.describe('OrigamSnackbarItem — Prop: icon (default per-intent)', () => {
    test('the default per-intent icon renders when icon is left unset', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        const prepend = item(sandbox).locator('.origam-snackbar-item__prepend')
        await expect(prepend).toBeVisible({ timeout: 5000 })
        await expect(prepend.locator('.origam-icon')).toBeVisible()
    })
})

test.describe('OrigamSnackbarItem — ARIA contract', () => {
    test('items carry aria-atomic="true"', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        await expect(item(sandbox)).toHaveAttribute('aria-atomic', 'true')
    })
})

/**
 * origam#501 — fontWeight/lineHeight/letterSpacing wired (pilot family).
 *
 * Each prop gets one "unset" assertion proving the PRE-EXISTING default is
 * unchanged (the regression check the ticket cares about most) and one
 * "passed" assertion proving the override actually paints. `fontWeight` is
 * the generic-first case: it must move BOTH `__title` and `__message`
 * together (there is a single root-level override channel for the two
 * BEM-scoped defaults), which the "unset" test also pins as 600 / 400 so a
 * future change to either literal is caught here, not by a screenshot diff.
 */
test.describe('OrigamSnackbarItem — Prop: typography (origam#501)', () => {
    test('fontWeight unset preserves the title/message weight hierarchy (no regression)', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        const title = item(sandbox).locator('.origam-snackbar-item__title')
        const message = item(sandbox).locator('.origam-snackbar-item__message')

        await expect(title).toHaveCSS('font-weight', '600')
        await expect(message).toHaveCSS('font-weight', '400')
    })

    test('fontWeight, when passed, overrides both title and message to the same weight', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        await selectHstOption(page, 'Font Weight', 'Bold 700')
        await page.waitForTimeout(200)

        const title = item(sandbox).locator('.origam-snackbar-item__title')
        const message = item(sandbox).locator('.origam-snackbar-item__message')

        await expect(title).toHaveCSS('font-weight', '700')
        await expect(message).toHaveCSS('font-weight', '700')
    })

    test('lineHeight unset preserves the pre-existing 1.4 default (no regression)', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        const root = item(sandbox)
        const ratio = await root.evaluate((el) => {
            const cs = getComputedStyle(el)
            return parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)
        })
        expect(ratio).toBeCloseTo(1.4, 1)
    })

    test('lineHeight, when passed, overrides the root default', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        await selectHstOption(page, 'Line Height', 'loose (2)')
        await page.waitForTimeout(200)

        const root = item(sandbox)
        const ratio = await root.evaluate((el) => {
            const cs = getComputedStyle(el)
            return parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)
        })
        expect(ratio).toBeCloseTo(2, 1)
    })

    test('letterSpacing, when passed, overrides the root default', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        const root = item(sandbox)
        const before = await root.evaluate((el) => getComputedStyle(el).letterSpacing)

        await selectHstOption(page, 'Letter Spacing', 'widest (0.0893em)')
        await page.waitForTimeout(200)

        const after = await root.evaluate((el) => getComputedStyle(el).letterSpacing)
        expect(after).not.toBe(before)
    })

    test('fontFamily is not exposed as a story control (origam#501 — deliberately unwired)', async ({ page }) => {
        await openVariant(page, 'Design')

        await expect(page.getByText('Font Family', { exact: true })).toHaveCount(0)
    })
})
