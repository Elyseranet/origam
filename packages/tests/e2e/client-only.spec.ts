import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamClientOnly — runtime probes.
 *
 * #C7 (lot mineur C2/C8/C7, 2026-09-13) — the doc was complete and accurate,
 * but NO story-backed e2e spec existed for this component (`find packages/
 * tests -iname '*client-only*'` returned nothing before this file). Root
 * CLAUDE.md mandates a matching spec for every story
 * ("test-as-you-build" rule) — a doc without a spec is a process gap even
 * when the doc itself does not lie.
 *
 * Known limitation, documented rather than worked around: `isMounted` flips
 * from `false` to `true` inside `onMounted()`, and Histoire is a pure
 * client-side SPA (no SSR step to intercept). By the time Playwright's
 * `page.goto()` resolves and the DOM is queryable, Vue has already mounted
 * and the fallback branch is gone — exactly what the story's own
 * `demo-note` explains ("lives for a single frame ... pressing Remount will
 * not hold it on screen"). These specs therefore assert the POST-MOUNT
 * state (default slot wins, placeholder/fallback are absent) rather than
 * trying to catch the one-frame SSR/pre-mount branch, which is not
 * reliably observable from outside the page.
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

const STORY = '/stories/story/components-stories-clientonly-origamclientonly-story-vue'

test.describe('OrigamClientOnly — Variant: Functional', () => {
    test('renders the default slot after mount, not the placeholder', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)

        await expect(sandbox.locator('[data-cy="client-only-functional"] .demo-client')).toBeVisible()
        await expect(sandbox.locator('[data-cy="client-only-functional"] .demo-placeholder')).toHaveCount(0)
    })

    test('Remount re-creates the component and the default slot content is present again', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)

        await sandbox.locator('[data-cy="client-only-remount"]').click()
        await page.waitForTimeout(300)

        await expect(sandbox.locator('[data-cy="client-only-functional"] .demo-client')).toBeVisible()
        await expect(sandbox.locator('[data-cy="client-only-functional"] .demo-client')).toHaveText(
            /Client-only content/
        )
    })
})

test.describe('OrigamClientOnly — Slots: Default', () => {
    test('the #default slot content is rendered post-mount', async ({ page }) => {
        await openVariant(page, 'Slots - Default')
        const sandbox = sandboxOf(page)

        await expect(sandbox.locator('[data-cy="client-only-slot-default"] .demo-client')).toContainText(
            'Default slot'
        )
    })
})

test.describe('OrigamClientOnly — Slots: Fallback', () => {
    test('the #fallback slot is NOT visible once mounted — #default wins', async ({ page }) => {
        await openVariant(page, 'Slots - Fallback')
        const sandbox = sandboxOf(page)

        await expect(sandbox.locator('[data-cy="client-only-slot-fallback"] .demo-client')).toHaveText(
            'Mounted content.'
        )
        await expect(sandbox.locator('[data-cy="client-only-slot-fallback"] .demo-placeholder')).toHaveCount(0)
    })

    // NOT covered here: whether the fallback branch itself carries
    // `aria-hidden="true"` at the instant it is the only branch rendered
    // (SSR / pre-mount). By the time this page is queryable, `isMounted`
    // is already `true` and the fallback DOM is gone — there is no way to
    // intercept it from outside a client-only-rendered Histoire page (see
    // file header). Verified instead by direct source read: both the
    // component's own default placeholder
    // (OrigamClientOnly.vue:11, `aria-hidden="true"`) and this story's
    // custom `#fallback` slot content
    // (OrigamClientOnly.story.vue, `aria-hidden="true"`) declare it
    // statically in the template.
})

test.describe('OrigamClientOnly — Variant: Default (playground)', () => {
    test('renders the custom content passed via the Content control', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        await expect(sandbox.locator('[data-cy="client-only-playground"] .demo-client')).toHaveText(
            'Hydrated content'
        )
    })
})
