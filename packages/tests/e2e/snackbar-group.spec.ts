import { expect, test, type Page } from '@playwright/test'

import { fillHstNumber, selectHstOption } from './_support/histoire-controls'

/**
 * OrigamSnackbarGroup — runtime probes for every prop / behaviour
 * exposed by the story.
 *
 * REALIGNED (2026-08) — the story migrated to the canonical
 * Design/Functional structure (this component has no Design/Events/
 * Slots Variants — only "Functional" and "Default"). The pre-migration
 * story had FOUR separate fixtures, each with its own trigger buttons
 * and `data-cy` hosts:
 *   - "Prop — location": 4 simultaneous stacks (one per corner)
 *   - "Prop — max": a dedicated "burst 10 at once" button
 *   - "Prop — intent": 4 simultaneous trigger buttons (one per intent)
 *   - "Emit — onDismiss": a dismiss/action counter rendered in the DOM
 * All four collapsed into the single "Functional" Variant: ONE stack,
 * ONE "Notify" button using whatever `location` / `intent` / `max` /
 * `defaultDuration` the HstSelect/HstNumber controls currently hold.
 * Tests below drive those controls SEQUENTIALLY instead of reading
 * parallel fixtures. The dismiss/action counter has no equivalent
 * anymore (no story-side counter) — the dismiss MECHANIC itself
 * (item removed from the DOM) is still verified; the counter
 * assertion and the action-button coverage are flagged as gaps below.
 *
 * Items are rendered by `<OrigamSnackbarItem>` — selectors use
 * `.origam-snackbar-item` / `.origam-snackbar-item--intent-*` /
 * `.origam-snackbar-item__dismiss` (all static classes on the
 * component itself, unaffected by the story migration).
 *
 * Histoire iframes render the sandbox under `iframe[src*="__sandbox"]`,
 * same convention as every other origam spec. The stack is teleported
 * to `document.body` so we search the whole page (not just the host
 * container) for items; the group root DOM id is `origam-snackbar-
 * group-{id}` (`resolvedDomId`, static in OrigamSnackbarGroup.vue).
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const STORY = '/stories/story/components-stories-snackbar-origamsnackbargroup-story-vue'

const notifyBtn = (sandbox: ReturnType<typeof sandboxOf>) =>
    sandbox.getByText('Notify', { exact: true }).first()

const dismissAllBtn = (sandbox: ReturnType<typeof sandboxOf>) =>
    sandbox.getByText('Dismiss all', { exact: true }).first()

test.describe('OrigamSnackbarGroup — Default', () => {
    test('notify renders an item, dismiss-all empties the stack', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        await expect(notifyBtn(sandbox)).toBeVisible({ timeout: 8000 })

        // 3 notifications.
        await notifyBtn(sandbox).click()
        await notifyBtn(sandbox).click()
        await notifyBtn(sandbox).click()
        await page.waitForTimeout(300)

        const host = sandbox.locator('#origam-snackbar-group-playground').first()
        const items = host.locator('.origam-snackbar-item')
        await expect(items).toHaveCount(3, { timeout: 5000 })

        await dismissAllBtn(sandbox).click()
        await page.waitForTimeout(400)

        await expect(items).toHaveCount(0)
    })

    test('stack renders OrigamSnackbarItem components (not duplicated markup)', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        await expect(notifyBtn(sandbox)).toBeVisible({ timeout: 8000 })
        await notifyBtn(sandbox).click()
        await page.waitForTimeout(300)

        const host = sandbox.locator('#origam-snackbar-group-playground').first()
        const item = host.locator('.origam-snackbar-item').first()
        await expect(item).toBeVisible({ timeout: 5000 })

        // OrigamSnackbarItem structure: content div with prepend + text
        await expect(item.locator('.origam-snackbar-item__content')).toBeVisible()
    })
})

test.describe('OrigamSnackbarGroup — Prop: location', () => {
    test('switching location moves the modifier class and the stack still spawns items', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('#origam-snackbar-group-functional').first()

        const locations = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const

        for (const loc of locations) {
            await selectHstOption(page, 'location', loc)
            await page.waitForTimeout(200)
            await expect(host).toHaveClass(new RegExp(`origam-snackbar-group--${loc}`))

            await notifyBtn(sandbox).click()
            await page.waitForTimeout(200)
            await expect(host.locator('.origam-snackbar-item').first()).toBeVisible({ timeout: 4000 })
        }
    })
})

test.describe('OrigamSnackbarGroup — Prop: max', () => {
    test('sending 10 notifications caps the rendered stack at max (5)', async ({ page }) => {
        // "Prop — max" had a dedicated burst-10 button; the migrated
        // story only exposes a single Notify click — loop it instead.
        // Functional init-state already sets max: 5.
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('#origam-snackbar-group-functional').first()

        for (let i = 0; i < 10; i++) {
            await notifyBtn(sandbox).click()
            await page.waitForTimeout(50)
        }
        await page.waitForTimeout(400)

        await expect(host.locator('.origam-snackbar-item')).toHaveCount(5, { timeout: 5000 })
    })
})

test.describe('OrigamSnackbarGroup — Prop: intent', () => {
    test('renders each intent with the matching modifier class', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('#origam-snackbar-group-functional').first()

        // HstSelect option labels are capitalised (INTENT_OPTIONS,
        // @stories/const/intent.const.ts) even though the underlying
        // value — and the CSS modifier class — stays lowercase.
        const intents = [
            { value: 'success', label: 'Success' },
            { value: 'warning', label: 'Warning' },
            { value: 'danger', label: 'Danger' },
            { value: 'info', label: 'Info' }
        ] as const

        for (const intent of intents) {
            await selectHstOption(page, 'intent', intent.label)
            await page.waitForTimeout(150)
            await notifyBtn(sandbox).click()
            await page.waitForTimeout(150)

            const intentItem = host.locator(`.origam-snackbar-item--intent-${intent.value}`).first()
            await expect(intentItem).toBeVisible({ timeout: 4000 })
        }
    })

    test('warning and danger intents render role="alert" + aria-live="assertive"', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('#origam-snackbar-group-functional').first()

        await selectHstOption(page, 'intent', 'Danger')
        await notifyBtn(sandbox).click()
        await page.waitForTimeout(200)

        const item = host.locator('.origam-snackbar-item--intent-danger').first()
        await expect(item).toHaveAttribute('role', 'alert')
        await expect(item).toHaveAttribute('aria-live', 'assertive')
    })
})

test.describe('OrigamSnackbarGroup — Dismiss', () => {
    test('clicking the X dismiss button removes the item', async ({ page }) => {
        // The pre-migration story also asserted a "Dismissed: N" counter
        // rendered by the story itself — the migrated story has no such
        // counter anymore (no equivalent data-cy). The dismiss MECHANIC
        // (item removed from the DOM) is still fully verifiable and is
        // what's asserted here.
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('#origam-snackbar-group-functional').first()

        await notifyBtn(sandbox).click()
        await page.waitForTimeout(200)

        const dismissBtn = host.locator('.origam-snackbar-item__dismiss').first()
        await expect(dismissBtn).toBeVisible({ timeout: 4000 })

        await dismissBtn.click()
        await page.waitForTimeout(400)

        await expect(host.locator('.origam-snackbar-item')).toHaveCount(0, { timeout: 5000 })
    })

    test.fixme('clicking the action invokes the handler and dismisses by default [STORY COVERAGE MISSING]', async () => {
        // The migrated story's Functional/Default `notify()` calls only
        // pass { title, message, intent, dismissible } — no `actions`
        // array is ever spawned, so OrigamSnackbarItem's action-button
        // slot never renders. There is no fixture left that exercises
        // the `actions` prop or the story-side "Action clicks" /
        // "Dismissed" counters that used to live in "Emit — onDismiss".
        // Needs a story fixture (Notify-with-action button + counters
        // restored), not a spec-only change.
    })
})

test.describe('OrigamSnackbarGroup — Auto-dismiss timing', () => {
    /**
     * ⛔ REAL BUG — FIXED (packages/ds/src/composables/Snackbar/snackbar-group.composable.ts,
     * packages/ds/src/components/Snackbar/OrigamSnackbarGroup.vue).
     * `<OrigamSnackbarGroup defaultDuration>` used to be entirely
     * decorative: `useSnackbarGroupInternal(id)` only exposed read-only
     * `rawItems` / `itemCount`, so the prop never reached `notify()`'s
     * `duration = opts.duration ?? options.defaultDuration ??
     * SNACKBAR_GROUP_DEFAULT_DURATION` resolution — every stack fell
     * back to the hardcoded 5000ms regardless of the prop.
     *
     * Fix: the per-id store now carries a `defaultDuration` ref.
     * `<OrigamSnackbarGroup>` registers its prop into that ref via
     * `useSnackbarGroupInternal(id).registerDefaultDuration` (a
     * `watch(… , { immediate: true })`, kept in sync on prop changes),
     * and `notify()` resolves `opts.duration ?? options.defaultDuration
     * ?? state.defaultDuration.value` — the component-declared default
     * now applies to `notify()` calls from ANY `useSnackbarGroup({ id })`
     * instance targeting that stack, not only call sites that repeat
     * `defaultDuration` as a composable option.
     *
     * The tight-timeout test below is written specifically so it can't
     * pass for the wrong reason (an over-generous window would still
     * catch the OLD hardcoded-5000ms behaviour).
     */
    test('sticky item (defaultDuration: 0) survives past the default auto-dismiss window', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('#origam-snackbar-group-functional').first()

        await fillHstNumber(page, 'defaultDuration (ms)', 0)
        for (let i = 0; i < 5; i++) {
            await notifyBtn(sandbox).click()
            await page.waitForTimeout(50)
        }
        await page.waitForTimeout(6_000)

        await expect(host.locator('.origam-snackbar-item')).toHaveCount(5)
    })

    test('short-duration item auto-dismisses within the requested window (tight timeout — see diagnostic above)', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('#origam-snackbar-group-functional').first()

        await fillHstNumber(page, 'defaultDuration (ms)', 1500)
        await selectHstOption(page, 'intent', 'Success')
        await notifyBtn(sandbox).click()
        await page.waitForTimeout(500)

        const item = host.locator('.origam-snackbar-item--intent-success').first()
        await expect(item).toBeVisible()

        // Tight timeout on purpose: 1500ms requested duration + 1000ms
        // slack, well short of the buggy hardcoded 5000ms fallback —
        // this must FAIL today (proving the bug) rather than pass for
        // the wrong reason with a generous window.
        await page.waitForTimeout(1_500)
        await expect(host.locator('.origam-snackbar-item--intent-success')).toHaveCount(0, { timeout: 1_000 })
    })
})

test.describe('OrigamSnackbarGroup — ARIA region', () => {
    test('stack root carries role="region"', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        // Trigger a notify first so the root becomes visible (it is always
        // rendered but may have zero size before items are present).
        await expect(notifyBtn(sandbox)).toBeVisible({ timeout: 8000 })
        await notifyBtn(sandbox).click()
        await page.waitForTimeout(300)

        const root = sandbox.locator('#origam-snackbar-group-playground').first()
        await expect(root).toBeVisible({ timeout: 5000 })
        await expect(root).toHaveAttribute('role', 'region')
        await expect(root).toHaveAttribute('aria-label', 'Notifications')
    })

    test('info / success intent items render role="status" + aria-live="polite"', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('#origam-snackbar-group-functional').first()

        await selectHstOption(page, 'intent', 'Success')
        await notifyBtn(sandbox).click()
        await page.waitForTimeout(200)

        const item = host.locator('.origam-snackbar-item--intent-success').first()
        await expect(item).toHaveAttribute('role', 'status')
        await expect(item).toHaveAttribute('aria-live', 'polite')
    })
})
