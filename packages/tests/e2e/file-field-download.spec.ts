import { expect, test } from '@playwright/test'

/**
 * OrigamFileFieldListItem / OrigamFileFieldDragNDropItem — `downloadable`
 * (#418).
 *
 * `downloadable` and `downloadIcon` were bound by `<OrigamFileField>` onto
 * two sub-components that never DECLARED them (`grep -n download` on both
 * returned zero). No download button existed anywhere, and the public
 * `click:download` emit could not structurally fire.
 *
 * The two Variants below are a natural A/B and that is why they are used
 * rather than driving the HstCheckbox: `Events - click:remove` renders the
 * item WITHOUT `downloadable`, `Events - click:download` renders the same
 * component WITH it. The only difference between the two is the prop, so a
 * button present in one and absent in the other is the prop working — not
 * a rendering accident.
 *
 * Conventions (mirrors `file-field.spec.ts`):
 *   - `getByRole('link', { name, exact })` for variant nav, NOT getByText.
 *   - Component locators go through the `__sandbox` iframe.
 *   - Assertions are on ABSOLUTE facts (button present / absent, accessible
 *     name non-empty), never on a mere difference between two readings.
 */

const STORIES = [
    {
        label: 'ListItem',
        path: '/stories/story/components-stories-filefield-origamfilefieldlistitem-story-vue'
    },
    {
        label: 'DragNDropItem',
        path: '/stories/story/components-stories-filefield-origamfilefielddragndropitem-story-vue'
    }
]

const DOWNLOAD_BTN = '[data-cy="file-field-item-download"]'

const navigateToVariant = async (
    page: import('@playwright/test').Page,
    path: string,
    name: string
) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name, exact: true }).click()
    await page.waitForTimeout(800)
}

for (const story of STORIES) {
    test.describe(`Origam FileField ${story.label} — downloadable (#418)`, () => {
        test.setTimeout(45000)

        test('renders a download button on the `downloadable` variant', async ({ page }) => {
            await navigateToVariant(page, story.path, 'Events - click:download')

            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

            await expect(sandbox.locator(DOWNLOAD_BTN).first()).toBeVisible({ timeout: 12000 })
            await expect(sandbox.locator(DOWNLOAD_BTN)).toHaveCount(1)
        })

        test('renders NO download button when `downloadable` is absent', async ({ page }) => {
            await navigateToVariant(page, story.path, 'Events - click:remove')

            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

            // Wait for the item itself, so an empty count cannot be "the
            // variant had not mounted yet".
            await expect(
                sandbox.locator('.origam-file-field-list-item, .origam-file-field-dragndrop-item').first()
            ).toBeVisible({ timeout: 12000 })

            await expect(sandbox.locator(DOWNLOAD_BTN)).toHaveCount(0)
        })

        test('the download button carries a non-empty accessible name', async ({ page }) => {
            await navigateToVariant(page, story.path, 'Events - click:download')

            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator(DOWNLOAD_BTN).first()

            await expect(btn).toBeVisible({ timeout: 12000 })

            const label = await btn.getAttribute('aria-label')

            expect(label ?? '').not.toBe('')
            // The file name is interpolated into the translated label, which
            // is what distinguishes a real accessible name from a generic one.
            expect(label ?? '').toContain('downloadable.pdf')
        })

        test('the download button stays reachable and is not disabled', async ({ page }) => {
            await navigateToVariant(page, story.path, 'Events - click:download')

            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator(DOWNLOAD_BTN).first()

            await expect(btn).toBeVisible({ timeout: 12000 })
            await expect(btn).toBeEnabled()

            // Clicking must not throw; the emit itself is asserted in the
            // unit spec (`file-field-dead-props.spec.ts`), where the payload
            // `{ file, index }` can be read directly.
            await btn.click()
            await expect(btn).toBeVisible()
        })
    })
}
