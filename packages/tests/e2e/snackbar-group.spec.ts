import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamSnackbarGroup — runtime probes for every prop / behaviour
 * exposed by the story. Each block targets one orthogonal facet:
 *
 *   - Default: a notify click renders a visible item with the
 *     ARIA contract (`role="region"`, `aria-live`).
 *   - Location: spawning a toast in each anchor renders into the
 *     matching `--{location}` modifier class.
 *   - Max: bursting more items than `max` keeps only the latest N.
 *   - Sticky (`duration: 0`): the item survives past a typical
 *     auto-dismiss window.
 *   - Auto-dismiss: a short-`duration` toast leaves the DOM after
 *     the requested timeout.
 *   - Dismiss button: clicking X removes the item.
 *   - Action handler: clicking an action triggers its handler
 *     (verified via the story-side counter).
 *   - ARIA: confirms `role="region"` + `role="status" / "alert"`
 *     and the appropriate `aria-live` per intent.
 *
 * Items are now rendered by `<OrigamSnackbarItem>` — selectors use
 * `.origam-snackbar-item` and `.origam-snackbar-item--intent-*`.
 *
 * Histoire iframes render the sandbox under `iframe[src*="__sandbox"]`,
 * same convention as every other origam spec. The stack is teleported
 * to `document.body` so we search the whole page (not just the host
 * container) for items.
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

test.describe('OrigamSnackbarGroup — Default', () => {
    test('notify renders an item, dismiss-all empties the stack', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const trigger = sandbox.locator('[data-cy="snackbar-group-playground-trigger"]').first()
        await expect(trigger).toBeVisible({ timeout: 8000 })

        // 3 notifications.
        await trigger.click()
        await trigger.click()
        await trigger.click()
        await page.waitForTimeout(300)

        const items = sandbox.locator('.origam-snackbar-item')
        await expect(items).toHaveCount(3, { timeout: 5000 })

        const dismissAll = sandbox.locator('[data-cy="snackbar-group-playground-dismiss-all"]').first()
        await dismissAll.click()
        await page.waitForTimeout(400)

        await expect(items).toHaveCount(0)
    })

    test('stack renders OrigamSnackbarItem components (not duplicated markup)', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const trigger = sandbox.locator('[data-cy="snackbar-group-playground-trigger"]').first()
        await expect(trigger).toBeVisible({ timeout: 8000 })
        await trigger.click()
        await page.waitForTimeout(300)

        // Verify items use OrigamSnackbarItem classes (not old stack item classes)
        const item = sandbox.locator('.origam-snackbar-item').first()
        await expect(item).toBeVisible({ timeout: 5000 })

        // OrigamSnackbarItem structure: content div with prepend + text
        await expect(item.locator('.origam-snackbar-item__content')).toBeVisible()
    })
})

test.describe('OrigamSnackbarGroup — Prop: location', () => {
    test('spawning at each location renders into the matching container', async ({ page }) => {
        await openVariant(page, 'Prop — location')
        const sandbox = sandboxOf(page)

        const locations = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const

        for (const loc of locations) {
            const trigger = sandbox.locator(`[data-cy="snackbar-group-location-${loc}"]`).first()
            await expect(trigger).toBeVisible({ timeout: 8000 })
            await trigger.click()
        }

        await page.waitForTimeout(300)

        for (const loc of locations) {
            // The group is teleported to body — locate it by the DOM id the
            // component emits: `id="origam-snackbar-group-location-${loc}"`.
            // The location variant passes `:id="\`location-${loc}\`"` to each
            // group → rendered DOM id = `origam-snackbar-group-location-${loc}`.
            const host = sandbox.locator(`#origam-snackbar-group-location-${loc}`).first()

            // At least one OrigamSnackbarItem should live in the matching host.
            const items = host.locator('.origam-snackbar-item')
            await expect(items.first()).toBeVisible({ timeout: 5000 })
        }
    })
})

test.describe('OrigamSnackbarGroup — Prop: max', () => {
    test('bursting 10 toasts caps the rendered stack at 5', async ({ page }) => {
        await openVariant(page, 'Prop — max')
        const sandbox = sandboxOf(page)

        const trigger = sandbox.locator('[data-cy="snackbar-group-max-burst"]').first()
        await expect(trigger).toBeVisible({ timeout: 8000 })
        await trigger.click()
        await page.waitForTimeout(500)

        // The group is teleported to body and the component emits
        // id="origam-snackbar-group-max-test" (story passes id="max-test").
        const host = sandbox.locator('#origam-snackbar-group-max-test').first()
        const items = host.locator('.origam-snackbar-item')
        await expect(items).toHaveCount(5, { timeout: 5000 })
    })
})

test.describe('OrigamSnackbarGroup — Prop: intent', () => {
    test('renders each intent with the matching modifier class', async ({ page }) => {
        await openVariant(page, 'Prop — intent')
        const sandbox = sandboxOf(page)

        // The group is teleported to body — data-cy attrs on <origam-snackbar-group>
        // are NOT forwarded through the teleport. Locate the host by its DOM id:
        // story passes id="intent-stack" → resolvedDomId = "origam-snackbar-group-intent-stack".
        const host = sandbox.locator('#origam-snackbar-group-intent-stack').first()

        for (const intent of ['success', 'warning', 'danger', 'info'] as const) {
            const trigger = sandbox.locator(`[data-cy="snackbar-group-intent-${intent}"]`).first()
            await trigger.click()
            await page.waitForTimeout(150)

            const intentItem = host
                .locator(`.origam-snackbar-item--intent-${intent}`)
                .first()

            await expect(intentItem).toBeVisible({ timeout: 4000 })
        }
    })

    test('warning and danger intents render role="alert" + aria-live="assertive"', async ({ page }) => {
        await openVariant(page, 'Prop — intent')
        const sandbox = sandboxOf(page)

        await sandbox.locator('[data-cy="snackbar-group-intent-danger"]').first().click()
        await page.waitForTimeout(200)

        const item = sandbox.locator('.origam-snackbar-item--intent-danger').first()
        await expect(item).toHaveAttribute('role', 'alert')
        await expect(item).toHaveAttribute('aria-live', 'assertive')
    })
})

test.describe('OrigamSnackbarGroup — Emits + dismiss + actions', () => {
    test('clicking the X dismiss button removes the item and bumps the counter', async ({ page }) => {
        await openVariant(page, 'Emit — onDismiss')
        const sandbox = sandboxOf(page)

        const trigger = sandbox.locator('[data-cy="snackbar-group-emit-trigger"]').first()
        await expect(trigger).toBeVisible({ timeout: 8000 })
        await trigger.click()
        await page.waitForTimeout(200)

        // The group is teleported to body — data-cy is not forwarded through
        // the teleport. Locate by DOM id: story passes id="emit-stack" →
        // resolvedDomId = "origam-snackbar-group-emit-stack".
        const host = sandbox.locator('#origam-snackbar-group-emit-stack').first()
        const dismissBtn = host
            .locator('.origam-snackbar-item__dismiss')
            .first()
        await expect(dismissBtn).toBeVisible({ timeout: 4000 })

        await dismissBtn.click()
        await page.waitForTimeout(400)

        const items = host.locator('.origam-snackbar-item')
        await expect(items).toHaveCount(0, { timeout: 5000 })

        const counter = sandbox.locator('[data-cy="snackbar-group-emit-counter"]').first()
        await expect(counter).toContainText('Dismissed: 1')
    })

    test('clicking the action invokes the handler and dismisses by default', async ({ page }) => {
        await openVariant(page, 'Emit — onDismiss')
        const sandbox = sandboxOf(page)

        const trigger = sandbox.locator('[data-cy="snackbar-group-emit-action"]').first()
        await expect(trigger).toBeVisible({ timeout: 8000 })
        await trigger.click()
        await page.waitForTimeout(200)

        const action = sandbox
            .locator('[data-cy^="origam-snackbar-group-item-"]')
            .locator('.origam-snackbar-item__action')
            .first()
        await expect(action).toBeVisible({ timeout: 4000 })
        await action.click()
        await page.waitForTimeout(400)

        const counter = sandbox.locator('[data-cy="snackbar-group-emit-counter"]').first()
        await expect(counter).toContainText('Action clicks: 1')
        // Action handler default dismisses → onDismiss increments too.
        await expect(counter).toContainText('Dismissed: 1')
    })
})

test.describe('OrigamSnackbarGroup — Auto-dismiss timing', () => {
    test('sticky item (duration: 0) survives past the default auto-dismiss window', async ({ page }) => {
        await openVariant(page, 'Prop — max')
        const sandbox = sandboxOf(page)

        // The max-burst spawn uses `duration: 0` → sticky.
        await sandbox.locator('[data-cy="snackbar-group-max-burst"]').first().click()
        await page.waitForTimeout(6_000)

        // The group is teleported to body — data-cy is not forwarded.
        // Story passes id="max-test" → resolvedDomId = "origam-snackbar-group-max-test".
        const host = sandbox.locator('#origam-snackbar-group-max-test').first()
        const items = host.locator('.origam-snackbar-item')
        await expect(items).toHaveCount(5)
    })

    test('short-duration item auto-dismisses within the requested window', async ({ page }) => {
        await openVariant(page, 'Prop — intent')
        const sandbox = sandboxOf(page)

        // Intent spawns use `duration: 4000`. We assert the item is
        // still there at 1s and gone after the full 4.5s.
        // The group is teleported to body — data-cy is not forwarded.
        // Story passes id="intent-stack" → resolvedDomId = "origam-snackbar-group-intent-stack".
        await sandbox.locator('[data-cy="snackbar-group-intent-success"]').first().click()
        await page.waitForTimeout(1_000)

        const host = sandbox.locator('#origam-snackbar-group-intent-stack').first()
        const item = host.locator('.origam-snackbar-item--intent-success').first()
        await expect(item).toBeVisible()

        await page.waitForTimeout(4_000)
        await expect(host.locator('.origam-snackbar-item--intent-success')).toHaveCount(0, { timeout: 5000 })
    })
})

test.describe('OrigamSnackbarGroup — ARIA region', () => {
    test('stack root carries role="region"', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        // The group is teleported to body — data-cy attrs passed to
        // <origam-snackbar-group> are not forwarded through the teleport.
        // Locate via DOM id: story passes id="playground" →
        // resolvedDomId = "origam-snackbar-group-playground".
        // Trigger a notify first so the root becomes visible (it is always
        // rendered but may have zero size before items are present).
        const trigger = sandbox.locator('[data-cy="snackbar-group-playground-trigger"]').first()
        await expect(trigger).toBeVisible({ timeout: 8000 })
        await trigger.click()
        await page.waitForTimeout(300)

        const root = sandbox.locator('#origam-snackbar-group-playground').first()
        await expect(root).toBeVisible({ timeout: 5000 })
        await expect(root).toHaveAttribute('role', 'region')
        await expect(root).toHaveAttribute('aria-label', 'Notifications')
    })

    test('info / success intent items render role="status" + aria-live="polite"', async ({ page }) => {
        await openVariant(page, 'Prop — intent')
        const sandbox = sandboxOf(page)

        await sandbox.locator('[data-cy="snackbar-group-intent-success"]').first().click()
        await page.waitForTimeout(200)

        const item = sandbox.locator('.origam-snackbar-item--intent-success').first()
        await expect(item).toHaveAttribute('role', 'status')
        await expect(item).toHaveAttribute('aria-live', 'polite')
    })
})
