import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * #550 (critere C1) — `OrigamSystemBar.location` etait DECLAREE (via
 * `ILayoutItemProps`) et lue nulle part : `useLayoutItem` recevait
 * `position: shallowRef('top')`, une constante.
 *
 * Mesure NAVIGATEUR : on compare le rectangle de la barre a celui de son
 * hote de layout. Une barre ancree en haut a son bord superieur sur celui
 * du conteneur ; ancree en bas, son bord inferieur sur le bord inferieur.
 * Aucune resolution de `var()` n'entre en jeu — on mesure une geometrie,
 * pas un token — mais seul un vrai navigateur applique la cascade
 * `#id{...}` / `.origam-system-bar` qui produit ce placement.
 */

const STORY = '/stories/story/components-stories-systembar-origamsystembar-story-vue'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText('Design', { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 })
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

test.describe('OrigamSystemBar — location (#550)', () => {
    test.setTimeout(45000)

    test('`top` ancre la barre en haut, `bottom` en bas — deux geometries distinctes', async ({ page }) => {
        await openVariant(page, 'Functional')
        const bar = sandboxOf(page).locator('.origam-system-bar').first()
        await expect(bar).toBeVisible({ timeout: 8000 })

        const topBox = await bar.boundingBox()
        expect(topBox).not.toBeNull()

        await selectHstOption(page, 'Location', 'bottom')
        await page.waitForTimeout(600)

        const bottomBox = await bar.boundingBox()
        expect(bottomBox).not.toBeNull()

        // La barre a bouge vers le bas : son bord superieur est strictement
        // plus bas qu'en ancrage `top`.
        expect(bottomBox!.y).toBeGreaterThan(topBox!.y)
    })

    test('`left` bascule sur l\'axe horizontal — la barre devient une colonne', async ({ page }) => {
        await openVariant(page, 'Functional')
        const bar = sandboxOf(page).locator('.origam-system-bar').first()
        await expect(bar).toBeVisible({ timeout: 8000 })

        const horizontal = await bar.boundingBox()
        expect(horizontal).not.toBeNull()

        await selectHstOption(page, 'Location', 'left')
        await page.waitForTimeout(600)

        const vertical = await bar.boundingBox()
        expect(vertical).not.toBeNull()

        // Ancree a gauche, `useCreateLayout` ecrit `height: calc(100% - …)`
        // et `width: {elementSize}` — la barre est plus haute que large,
        // l'inverse de son ancrage horizontal par defaut.
        expect(vertical!.height).toBeGreaterThan(horizontal!.height)
        expect(vertical!.width).toBeLessThan(horizontal!.width)
    })
})
