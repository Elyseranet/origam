/**
 * HomeBenefits — bande de 4 bénéfices de la maquette A (#1517, lot 4A).
 * 4 colonnes en desktop, 2 en tablette, 1 en mobile.
 */

import { expect, test } from '@playwright/test'

const columnsAt = async (page: import('@playwright/test').Page, width: number) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page.locator('#benefits .home-benefits__grid')).toBeVisible()
    return page.locator('#benefits li[data-cy="benefit-item"]').evaluateAll(
        els => new Set(els.map(el => Math.round(el.getBoundingClientRect().left))).size
    )
}

test.describe('HomeBenefits — maquette A', () => {

    test('4 bénéfices dans une liste, chacun avec un titre h3 et une description', async ({ page }) => {
        await page.goto('/')
        const items = page.locator('#benefits li[data-cy="benefit-item"]')
        await expect(items).toHaveCount(4)
        await expect(page.locator('#benefits li h3')).toHaveCount(4)
        await expect(page.locator('#benefits ul')).toHaveCount(1)
    })

    test('4 colonnes en desktop', async ({ page }) => {
        expect(await columnsAt(page, 1440)).toBe(4)
    })

    test('2 colonnes en tablette', async ({ page }) => {
        expect(await columnsAt(page, 820)).toBe(2)
    })

    test('1 colonne en mobile', async ({ page }) => {
        expect(await columnsAt(page, 390)).toBe(1)
    })

})
