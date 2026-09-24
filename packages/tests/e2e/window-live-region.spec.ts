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

    /**
     * ⛔ #781 — le repère est conditionné au nom accessible.
     *
     * `region` est l'un des rares rôles dont WAI-ARIA 1.2 marque le nom
     * comme REQUIS ; `<OrigamWindow>` ne déclare donc plus ni `role` ni
     * `aria-roledescription` tant qu'aucun `aria-label` /
     * `aria-labelledby` n'arrive. La Variant « Design » en pose un
     * désormais — c'est l'usage que la story doit montrer — donc ce test
     * mesure la branche NOMMÉE. La branche anonyme est mesurée en TU
     * (`TU/components/Window/window-live-region.spec.ts`) : elle porte sur
     * des attributs et n'a pas besoin d'un vrai navigateur.
     */
    test('root carries role=region and aria-roledescription=carousel once named', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('.origam-window').first()
        await expect(root).toBeVisible(VIS)
        await expect(root).toHaveAttribute('aria-label', 'Design window demo')
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
