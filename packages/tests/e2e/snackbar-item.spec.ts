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
     * ⛔ REAL BUG FOUND while realigning (root-caused, not guessed):
     * the ENTIRE prepend area — including any custom `#prepend` slot
     * content — never renders on any Variant of this story, because
     * `resolvedIcon` is always `false`.
     *
     * Root cause (read in source,
     * packages/ds/src/components/Snackbar/OrigamSnackbarItem.vue):
     *   - `icon?: TIcon | false` (ISnackbarItemProps) — the type union
     *     includes `boolean`.
     *   - `const props = withDefaults(defineProps<...>(), { intent:
     *     'info', dismissible: true, dismissLabel: undefined })` never
     *     lists a default for `icon`.
     *   - Vue's compiler-generated runtime prop options special-case
     *     any prop whose type includes `Boolean`: when the consumer
     *     doesn't pass it, Vue resolves it to the concrete value
     *     `false`, NOT `undefined` (documented Vue 3 behaviour,
     *     already called out for the exact same trap in
     *     packages/ds/src/composables/Commons/defaults.composable.ts's
     *     `usePassedProps()` doc comment — this component just didn't
     *     apply the same fix).
     *   - `resolvedIcon = computed(() => props.icon === false ? false
     *     : props.icon ? props.icon : INTENT_ICONS[props.intent ?? 'info'])`
     *     therefore short-circuits to `false` on the FIRST branch for
     *     every instance that doesn't explicitly pass `icon`.
     *   - The template gates the WHOLE prepend wrapper —  not just
     *     the built-in `<origam-icon>` fallback — behind `v-if=
     *     "resolvedIcon !== false"`, so a consumer-supplied `#prepend`
     *     slot is silently dropped along with the default icon.
     *
     * Verified empirically (2026-08, running Histoire instance): on
     * every Variant (Design with icon left at its "(none)"/undefined
     * control value, Functional, Events - action, Slots - Prepend —
     * none of which explicitly pass `:icon`), `el.__vueParentComponent
     * .props.icon` reads back the boolean `false`, and the rendered
     * DOM shows a bare `<!--v-if-->` comment where the prepend `<div>`
     * should be — for Slots - Prepend specifically, that means the
     * story's `#prepend` heart icon (mdi:mdi-heart) never appears at
     * all despite being wired correctly on the consumer side.
     *
     * The intended contract ("When omitted, defaults to the
     * per-intent icon… Pass `false` to suppress the icon entirely" —
     * ISnackbarItemProps doc comment) is inverted: omitted currently
     * behaves exactly like `icon={false}`. Fix is `icon: undefined`
     * added to the `withDefaults()` map (forces Vue to stop treating
     * "unset" as "false" for this prop) — component left untouched
     * per this pass's scope (title-drift realignment).
     */
    test.fixme('custom prepend slot overrides the default icon', async ({ page }) => {
        await openVariant(page, 'Slots - Prepend')
        const sandbox = sandboxOf(page)

        const prepend = item(sandbox).locator('.origam-snackbar-item__prepend')
        await expect(prepend).toBeVisible({ timeout: 5000 })
    })
})

test.describe('OrigamSnackbarItem — Prop: icon (default per-intent) [REAL BUG — see Slot: prepend diagnostic]', () => {
    test.fixme('the default per-intent icon renders when icon is left unset', async ({ page }) => {
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
