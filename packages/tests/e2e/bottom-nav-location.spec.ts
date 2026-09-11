import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * #550 (critere C1) — `OrigamBottomNav.location` etait DECLAREE (via
 * `ILayoutItemProps`) et lue nulle part : `useLayoutItem` recevait
 * `position: computed(() => 'bottom')`, une constante.
 *
 * La Variant « Functional - Location » a ete ajoutee AVEC ce correctif : la
 * prop n'etait exposee nulle part avant, precisement parce qu'elle ne
 * faisait rien. Elle enveloppe la barre dans un `<origam-layout>` — hors
 * layout, `useLayoutItem` retombe volontairement sur des styles inertes et
 * `location` n'aurait rien a piloter — et passe `absolute` pour que la
 * barre reste dans le cadre de la story au lieu de se fixer au viewport.
 *
 * Mesure NAVIGATEUR : on compare des rectangles, pas des tokens.
 */

const STORY = '/stories/story/components-stories-bottomnav-origambottomnav-story-vue'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText('Default', { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 })
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

test.describe('OrigamBottomNav — location (#550)', () => {
    test.setTimeout(45000)

    test('`bottom` (defaut) puis `top` : la barre change de bord', async ({ page }) => {
        await openVariant(page, 'Functional - Location')
        const nav = sandboxOf(page).locator('.origam-bottom-nav').first()
        await expect(nav).toBeVisible({ timeout: 8000 })

        const bottomBox = await nav.boundingBox()
        expect(bottomBox).not.toBeNull()

        await selectHstOption(page, 'Location', 'top')
        await page.waitForTimeout(600)

        const topBox = await nav.boundingBox()
        expect(topBox).not.toBeNull()

        expect(topBox!.y).toBeLessThan(bottomBox!.y)
    })

    test('`left` bascule sur l\'axe horizontal — la barre devient une colonne', async ({ page }) => {
        await openVariant(page, 'Functional - Location')
        const nav = sandboxOf(page).locator('.origam-bottom-nav').first()
        await expect(nav).toBeVisible({ timeout: 8000 })

        const horizontal = await nav.boundingBox()
        expect(horizontal).not.toBeNull()

        await selectHstOption(page, 'Location', 'left')
        await page.waitForTimeout(600)

        const vertical = await nav.boundingBox()
        expect(vertical).not.toBeNull()

        expect(vertical!.height).toBeGreaterThan(horizontal!.height)
        expect(vertical!.width).toBeLessThan(horizontal!.width)
    })
})
