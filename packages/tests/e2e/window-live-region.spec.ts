import { expect, test } from '@playwright/test'

/**
 * #474 — real-browser verification for OrigamWindow's carousel region /
 * live-region slide announcement.
 *
 * Story: components-stories-window-origamwindow-story-vue, Variant 0
 * ("Design"), 3 slides ("Slide 1" / "Slide 2" / "Slide 3"), a real
 * `v-model` bound to the story's own `designStep` ref.
 */

const STORY_ID = 'components-stories-window-origamwindow-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`
const VIS = { timeout: 35000 }

test.describe('OrigamWindow — #474 carousel region + live-region', () => {
    test.setTimeout(60000)

    test('root carries role=region and aria-roledescription=carousel', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('.origam-window').first()
        await expect(root).toBeVisible(VIS)
        await expect(root).toHaveAttribute('role', 'region')
        await expect(root).toHaveAttribute('aria-roledescription', 'carousel')
    })

    test('live region announces the current slide and updates on next/prev clicks', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const live = sandbox.locator('.origam-window__live-region').first()
        await expect(live).toBeAttached(VIS)
        await expect(live).toHaveAttribute('role', 'status')
        await expect(live).toHaveAttribute('aria-live', 'polite')
        await expect(live).toHaveText('Carousel slide 1 of 3')

        await sandbox.locator('.origam-window__next').first().click()
        await expect(live).toHaveText('Carousel slide 2 of 3')

        await sandbox.locator('.origam-window__next').first().click()
        await expect(live).toHaveText('Carousel slide 3 of 3')

        await sandbox.locator('.origam-window__prev').first().click()
        await expect(live).toHaveText('Carousel slide 2 of 3')
    })
})
