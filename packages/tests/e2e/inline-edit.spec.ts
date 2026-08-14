import { expect, test, type Page } from '@playwright/test'

import { eventLogItems, openEventsTab, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * OrigamInlineEdit — runtime probes for the edit-in-place state
 * machine, the v-model round-trip, keyboard handling (Enter / Esc)
 * and ARIA wiring (aria-label, aria-invalid, role=alert).
 *
 * REALIGNED (2026-08) — the story was migrated to the canonical
 * Design/Functional/Events/Slots structure (root CLAUDE.md, "Story +
 * doc sync"). The old spec navigated to one dedicated `Prop — X`
 * Variant per fixture; those no longer exist. Where an equivalent
 * control exists on the "Functional" Variant, tests now drive that
 * control via the shared `histoire-controls.ts` helper instead of
 * navigating to a removed Variant. See the bottom of this file for
 * the `rules` / `validate` gap that has NO equivalent left at all.
 *
 * In edit mode the `<input>` / `<textarea>` is rendered inside
 * `<OrigamTextField>` / `<OrigamTextareaField>`. The `data-cy`
 * attribute targets the field root; the actual focusable element is
 * `[data-cy="origam-inline-edit-input"] input` (or `textarea`).
 *
 * When `showActions=true`, Confirm and Cancel buttons are rendered
 * inside the field's `appendInner` slot — NOT as siblings of the field.
 *
 * Variants are reached via their dedicated titles — never via the
 * HstSelect picker dropdown (custom DOM, brittle). Checkbox controls
 * are driven exclusively through `histoire-controls.ts`.
 */

const STORY = '/stories/story/components-stories-inlineedit-origaminlineedit-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string): Promise<void> => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(400)
}

/** Locate the actual <input> inside the OrigamTextField field wrapper, optionally scoped to a consumer-set data-cy host. */
const inputInField = (sandbox: ReturnType<typeof sandboxOf>, hostCy?: string) =>
    (hostCy
        ? sandbox.locator(`[data-cy="${hostCy}"] [data-cy="origam-inline-edit-input"] input`)
        : sandbox.locator('[data-cy="origam-inline-edit-input"] input')
    ).first()

/** Locate the actual <textarea> inside the OrigamTextareaField field wrapper. */
const textareaInField = (sandbox: ReturnType<typeof sandboxOf>) =>
    sandbox.locator('[data-cy="origam-inline-edit-input"] textarea').first()

/** Locate the field root element (OrigamTextField / OrigamTextareaField). */
const fieldRoot = (sandbox: ReturnType<typeof sandboxOf>) =>
    sandbox.locator('[data-cy="origam-inline-edit-input"]').first()

const display = (sandbox: ReturnType<typeof sandboxOf>, hostCy?: string) =>
    (hostCy
        ? sandbox.locator(`[data-cy="${hostCy}"] [data-cy="origam-inline-edit-display"]`)
        : sandbox.locator('[data-cy="origam-inline-edit-display"]')
    ).first()

test.describe('OrigamInlineEdit — Default (display → edit transition)', () => {
    test('mounts with the display affordance visible (not the input)', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        await expect(display(sandbox)).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('[data-cy="origam-inline-edit-input"]')).toHaveCount(0)
    })

    test('clicking the display switches to edit mode (input visible, draft = current value)', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        await display(sandbox).click()

        const input = inputInField(sandbox)
        await expect(input).toBeVisible()
        await expect(input).toHaveValue('Initial title')
    })

    // REAL BUG (story, not this spec) — the "Default" playground Variant
    // binds `v-bind="state"` but never wires `@update:model-value` back to
    // `state.modelValue` (OrigamInlineEdit.story.vue, Default Variant,
    // ~line 259-265). v-bind alone does not create a v-model round-trip in
    // Vue 3 — it needs `v-model="state.modelValue"` or an explicit
    // `@update:model-value` handler. As a result `props.modelValue` (and
    // the `.story-state` output that mirrors it) never changes after a
    // commit, even though the component's internal draft/confirm logic
    // works correctly (verified via the Functional Variant's showActions
    // tests below, which DO observe the display text update). Confirmed
    // by direct DOM inspection: after Enter the output stays "Initial
    // title" instead of the committed value. Needs a story fix, not a
    // spec fix — do not touch the story from this pass (CLAUDE.md rule).
    test.fixme('Enter confirms, the input disappears, the v-model state updates', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        await display(sandbox).click()

        const input = inputInField(sandbox)
        await input.fill('Updated title')
        await input.press('Enter')

        await expect(sandbox.locator('[data-cy="origam-inline-edit-input"]')).toHaveCount(0)
        const state = sandbox.locator('.story-state').first()
        await expect(state).toHaveText('Updated title')
    })

    test('Esc cancels, the value is unchanged', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        await display(sandbox).click()

        const input = inputInField(sandbox)
        await input.fill('Discarded change')
        await input.press('Escape')

        await expect(sandbox.locator('[data-cy="origam-inline-edit-input"]')).toHaveCount(0)
        const state = sandbox.locator('.story-state').first()
        await expect(state).toHaveText('Initial title')
    })

    test('display button carries an `aria-label` that quotes the current value', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        await expect(display(sandbox)).toHaveAttribute('aria-label', /edit initial title/i)
    })
})

test.describe('OrigamInlineEdit — Functional (disabled)', () => {
    test('disabled display does NOT enter edit mode on click', async ({ page }) => {
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Disabled')
        const sandbox = sandboxOf(page)

        await expect(display(sandbox)).toBeDisabled()

        await display(sandbox).click({ force: true }).catch(() => undefined)
        await expect(sandbox.locator('[data-cy="origam-inline-edit-input"]')).toHaveCount(0)
    })
})

test.describe('OrigamInlineEdit — Slots', () => {
    test('#display slot lets the consumer render a custom affordance (h2) that still drives edit mode', async ({ page }) => {
        await openVariant(page, 'Slots - Display')
        const sandbox = sandboxOf(page)

        const trigger = sandbox.locator('[data-cy="inline-edit-slot-display-trigger"]').first()
        await expect(trigger).toBeVisible({ timeout: 8000 })

        // The default button affordance should NOT be in the DOM when
        // the consumer supplies a #display slot.
        const builtIn = await sandbox.locator('[data-cy="inline-edit-slot-display"] [data-cy="origam-inline-edit-display"]').count()
        expect(builtIn).toBe(0)

        await trigger.click()
        await expect(inputInField(sandbox, 'inline-edit-slot-display')).toBeVisible()
    })

    test('#actions slot — clicking the cancel button reverts the draft', async ({ page }) => {
        await openVariant(page, 'Slots - Actions')
        const sandbox = sandboxOf(page)

        await display(sandbox, 'inline-edit-slot-actions').click()

        const input = inputInField(sandbox, 'inline-edit-slot-actions')
        await input.fill('Something else')

        const cancelBtn = sandbox.locator('[data-cy="inline-edit-slot-actions-cancel"]').first()
        await cancelBtn.click()

        await expect(sandbox.locator('[data-cy="inline-edit-slot-actions"] [data-cy="origam-inline-edit-input"]')).toHaveCount(0)
        await expect(sandbox.locator('[data-cy="inline-edit-slot-actions"] [data-cy="origam-inline-edit-display"]')).toContainText('My item')
    })
})

test.describe('OrigamInlineEdit — Functional showActions=false (default, keyboard only)', () => {
    test('no action buttons are rendered when showActions is false', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)

        await expect(display(sandbox)).toBeVisible({ timeout: 8000 })
        await expect(sandbox.locator('[data-cy="origam-inline-edit-actions-display"]')).toHaveCount(0)
    })

    test('keyboard Enter confirms, Escape cancels — showActions=false does not break keyboard', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)

        await display(sandbox).click()

        const input = inputInField(sandbox)
        await input.fill('New keyboard value')
        await input.press('Enter')

        await expect(sandbox.locator('[data-cy="origam-inline-edit-input"]')).toHaveCount(0)
        await expect(display(sandbox)).toContainText('New keyboard value')
    })
})

test.describe('OrigamInlineEdit — Functional showActions=true', () => {
    test('Edit button is visible in display mode', async ({ page }) => {
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Show Actions')
        const sandbox = sandboxOf(page)

        const editBtn = sandbox.locator('[data-cy="origam-inline-edit-action-edit"]').first()
        await expect(editBtn).toBeVisible({ timeout: 8000 })
    })

    test('Confirm and Cancel buttons are NOT visible in display mode', async ({ page }) => {
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Show Actions')
        const sandbox = sandboxOf(page)

        await expect(sandbox.locator('[data-cy="origam-inline-edit-action-confirm"]')).toHaveCount(0)
        await expect(sandbox.locator('[data-cy="origam-inline-edit-action-cancel"]')).toHaveCount(0)
    })

    test('clicking Edit button enters edit mode (OrigamTextField visible with input inside)', async ({ page }) => {
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Show Actions')
        const sandbox = sandboxOf(page)

        const editBtn = sandbox.locator('[data-cy="origam-inline-edit-action-edit"]').first()
        await editBtn.click()

        const input = inputInField(sandbox)
        await expect(input).toBeVisible()
    })

    test('Confirm and Cancel buttons are inside the field (appendInner), Edit button is hidden', async ({ page }) => {
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Show Actions')
        const sandbox = sandboxOf(page)

        const editBtn = sandbox.locator('[data-cy="origam-inline-edit-action-edit"]').first()
        await editBtn.click()

        const fieldEl = fieldRoot(sandbox)
        await expect(fieldEl.locator('[data-cy="origam-inline-edit-action-confirm"]').first()).toBeVisible()
        await expect(fieldEl.locator('[data-cy="origam-inline-edit-action-cancel"]').first()).toBeVisible()

        // Edit button is gone while editing (single instance in this Variant).
        await expect(sandbox.locator('[data-cy="origam-inline-edit-action-edit"]')).toHaveCount(0)
    })

    test('clicking Confirm commits the new value and exits edit mode', async ({ page }) => {
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Show Actions')
        const sandbox = sandboxOf(page)

        const editBtn = sandbox.locator('[data-cy="origam-inline-edit-action-edit"]').first()
        await editBtn.click()

        const input = inputInField(sandbox)
        await input.fill('Saved via button')

        const confirmBtn = sandbox.locator('[data-cy="origam-inline-edit-action-confirm"]').first()
        await confirmBtn.click()

        await expect(sandbox.locator('[data-cy="origam-inline-edit-input"]')).toHaveCount(0)
        await expect(display(sandbox)).toContainText('Saved via button')
    })

    test('clicking Cancel exits edit mode WITHOUT updating the value', async ({ page }) => {
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Show Actions')
        const sandbox = sandboxOf(page)

        const editBtn = sandbox.locator('[data-cy="origam-inline-edit-action-edit"]').first()
        await editBtn.click()

        const input = inputInField(sandbox)
        await input.fill('Discarded change')

        const cancelBtn = sandbox.locator('[data-cy="origam-inline-edit-action-cancel"]').first()
        await cancelBtn.click()

        await expect(sandbox.locator('[data-cy="origam-inline-edit-input"]')).toHaveCount(0)
        // Functional variant's init-state modelValue is "Editable value".
        await expect(display(sandbox)).toContainText('Editable value')
    })

    test('keyboard shortcuts still work in parallel with showActions=true (Enter confirms)', async ({ page }) => {
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Show Actions')
        const sandbox = sandboxOf(page)

        const editBtn = sandbox.locator('[data-cy="origam-inline-edit-action-edit"]').first()
        await editBtn.click()

        const input = inputInField(sandbox)
        await input.fill('Saved via Enter')
        await input.press('Enter')

        await expect(sandbox.locator('[data-cy="origam-inline-edit-input"]')).toHaveCount(0)
        await expect(display(sandbox)).toContainText('Saved via Enter')
    })
})

test.describe('OrigamInlineEdit — Functional showActions=true + multiline', () => {
    test('Edit button is visible in display mode', async ({ page }) => {
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Show Actions')
        await toggleHstCheckbox(page, 'Multiline')
        const sandbox = sandboxOf(page)

        const editBtn = sandbox.locator('[data-cy="origam-inline-edit-action-edit"]').first()
        await expect(editBtn).toBeVisible({ timeout: 8000 })
    })

    test('clicking Edit enters multiline mode — OrigamTextareaField with textarea visible', async ({ page }) => {
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Show Actions')
        await toggleHstCheckbox(page, 'Multiline')
        const sandbox = sandboxOf(page)

        const editBtn = sandbox.locator('[data-cy="origam-inline-edit-action-edit"]').first()
        await editBtn.click()

        const textarea = textareaInField(sandbox)
        await expect(textarea).toBeVisible()
    })

    test('Confirm and Cancel buttons are inside the OrigamTextareaField (appendInner)', async ({ page }) => {
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Show Actions')
        await toggleHstCheckbox(page, 'Multiline')
        const sandbox = sandboxOf(page)

        const editBtn = sandbox.locator('[data-cy="origam-inline-edit-action-edit"]').first()
        await editBtn.click()

        const fieldEl = fieldRoot(sandbox)
        await expect(fieldEl.locator('[data-cy="origam-inline-edit-action-confirm"]').first()).toBeVisible()
        await expect(fieldEl.locator('[data-cy="origam-inline-edit-action-cancel"]').first()).toBeVisible()
    })

    test('clicking Confirm commits the new value', async ({ page }) => {
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Show Actions')
        await toggleHstCheckbox(page, 'Multiline')
        const sandbox = sandboxOf(page)

        const editBtn = sandbox.locator('[data-cy="origam-inline-edit-action-edit"]').first()
        await editBtn.click()

        const textarea = textareaInField(sandbox)
        await textarea.fill('Saved multiline via button')

        const confirmBtn = sandbox.locator('[data-cy="origam-inline-edit-action-confirm"]').first()
        await confirmBtn.click()

        await expect(sandbox.locator('[data-cy="origam-inline-edit-input"]')).toHaveCount(0)
        await expect(display(sandbox)).toContainText('Saved multiline via button')
    })

    test('clicking Cancel exits without saving', async ({ page }) => {
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Show Actions')
        await toggleHstCheckbox(page, 'Multiline')
        const sandbox = sandboxOf(page)

        const editBtn = sandbox.locator('[data-cy="origam-inline-edit-action-edit"]').first()
        await editBtn.click()

        const textarea = textareaInField(sandbox)
        await textarea.fill('Discarded multiline change')

        const cancelBtn = sandbox.locator('[data-cy="origam-inline-edit-action-cancel"]').first()
        await cancelBtn.click()

        await expect(sandbox.locator('[data-cy="origam-inline-edit-input"]')).toHaveCount(0)
        // Functional variant's init-state modelValue is "Editable value".
        await expect(display(sandbox)).toContainText('Editable value')
    })
})

test.describe('OrigamInlineEdit — Functional showActions=true + disabled', () => {
    test('Edit button is disabled when the component is disabled', async ({ page }) => {
        await openVariant(page, 'Functional')
        await toggleHstCheckbox(page, 'Show Actions')
        await toggleHstCheckbox(page, 'Disabled')
        const sandbox = sandboxOf(page)

        const editBtn = sandbox.locator('[data-cy="origam-inline-edit-action-edit"]').first()
        await expect(editBtn).toBeDisabled({ timeout: 8000 })
    })
})

test.describe('OrigamInlineEdit — Events', () => {
    // Histoire's native "Events" tab surfaces logEvent() calls as
    // [data-test-id="event-item"] rows (openEventsTab/eventLogItems,
    // packages/tests/e2e/_support/histoire-controls.ts) — asserted here
    // for the actual emit, in addition to the visible state transition
    // the event correlates with.
    test('Events - confirm: emits confirm and updates the display text', async ({ page }) => {
        await openVariant(page, 'Events - confirm')
        const sandbox = sandboxOf(page)

        await display(sandbox, 'inline-edit-event-confirm').click()
        const input = inputInField(sandbox, 'inline-edit-event-confirm')
        await input.fill('Confirmed via event test')
        await input.press('Enter')

        await expect(sandbox.locator('[data-cy="origam-inline-edit-input"]')).toHaveCount(0)
        await expect(display(sandbox, 'inline-edit-event-confirm')).toContainText('Confirmed via event test')

        await openEventsTab(page)
        await expect(eventLogItems(page).filter({ hasText: 'confirm' })).toHaveCount(1)
    })

    test('Events - cancel: emits cancel and reverts the draft', async ({ page }) => {
        await openVariant(page, 'Events - cancel')
        const sandbox = sandboxOf(page)

        await display(sandbox, 'inline-edit-event-cancel').click()
        const input = inputInField(sandbox, 'inline-edit-event-cancel')
        await input.fill('zzz')
        await input.press('Escape')

        await expect(sandbox.locator('[data-cy="origam-inline-edit-input"]')).toHaveCount(0)
        await expect(display(sandbox, 'inline-edit-event-cancel')).toContainText('Edit then press Escape')

        await openEventsTab(page)
        await expect(eventLogItems(page).filter({ hasText: 'cancel' })).toHaveCount(1)
    })

    test('Events - validate-error: emits validate-error, keeps the editor open and surfaces role=alert', async ({ page }) => {
        await openVariant(page, 'Events - validate-error')
        const sandbox = sandboxOf(page)

        await display(sandbox, 'inline-edit-event-validate-error').click()
        const input = inputInField(sandbox, 'inline-edit-event-validate-error')
        await input.fill('ab')
        await input.press('Enter')

        await expect(input).toBeVisible()
        const error = sandbox.locator('[data-cy="inline-edit-event-validate-error"] [data-cy="origam-inline-edit-error"]').first()
        await expect(error).toBeVisible()
        await expect(error).toHaveAttribute('role', 'alert')

        await openEventsTab(page)
        await expect(eventLogItems(page).filter({ hasText: 'validate-error' })).toHaveCount(1)
    })
})

/**
 * MISSING STORY COVERAGE — `rules` and `validate` props.
 *
 * The pre-migration story had dedicated fixture instances exercising
 * `validate` (sync min-length, async 30%-fail) and `rules`
 * (sequential rule evaluation, rules-before-validate ordering). The
 * migrated story (Design / Functional / Events - * / Slots - *)
 * exposes NEITHER prop as a Variant OR as a Functional control —
 * `IInlineEditProps.validate` / `.rules` are function-typed props that
 * cannot be driven by HstSelect/HstText/HstNumber/HstCheckbox, and no
 * Variant wires a fixture for them anymore.
 *
 * This is a real coverage gap, not a title-rename: there is no
 * Variant to navigate to. Flagged here rather than silently deleted —
 * fixing it means adding fixtures back to
 * packages/stories/components/stories/InlineEdit/OrigamInlineEdit.story.vue
 * (e.g. dedicated `Events - validate-error` / a rules fixture), not a
 * spec-only change.
 */
test.describe('OrigamInlineEdit — Validator (sync) [STORY COVERAGE MISSING]', () => {
    test.fixme('a sync validator returning a string surfaces in role=alert AND keeps the editor open', async () => {
        // No Variant in the current story exercises props.validate at all.
    })

    test.fixme('a valid sync value commits and clears the error', async () => {
        // No Variant in the current story exercises props.validate at all.
    })
})

test.describe('OrigamInlineEdit — Validator (async) [STORY COVERAGE MISSING]', () => {
    test.fixme('async Promise.reject path: validator returning a string keeps the editor open and shows the error', async () => {
        // No Variant in the current story exercises an async props.validate at all.
    })
})

test.describe('OrigamInlineEdit — Prop rules [STORY COVERAGE MISSING]', () => {
    test.fixme('a failing rule surfaces its message in role=alert and keeps the editor open', async () => {
        // No Variant in the current story exercises props.rules at all.
    })

    test.fixme('the first failing rule message is displayed (rules are evaluated sequentially)', async () => {
        // No Variant in the current story exercises props.rules at all.
    })

    test.fixme('the error disappears when the user types a valid value and confirms', async () => {
        // No Variant in the current story exercises props.rules at all.
    })

    test.fixme('validate is skipped when a rule fails (rules evaluated before validate)', async () => {
        // No Variant in the current story exercises props.rules at all.
    })

    test.fixme('validate runs when rules pass — its error blocks the commit', async () => {
        // No Variant in the current story exercises props.rules (combined with validate) at all.
    })
})
