import { expect, test, type Page } from '@playwright/test'

import { fillHstText } from './_support/histoire-controls'

/**
 * #550 (critere C1) — `OrigamMessages.elevation` etait DECLAREE, EXPOSEE par
 * le controle « Elevation » de la Variant « Design », et lue nulle part :
 * taper une valeur dans ce champ ne posait aucune ombre.
 *
 * Mesure NAVIGATEUR (`getComputedStyle`) : la declaration emise est
 * `box-shadow: var(--origam-shadow---{echelon})`, invisible a jsdom (cf.
 * CLAUDE.md racine, #398). Le spec unitaire jumeau
 * (`TU/components/Messages/messages-elevation.spec.ts`) verifie l'emission
 * de la classe et de la declaration ; celui-ci verifie qu'elle PEINT.
 */

const STORY = '/stories/story/components-stories-messages-origammessages-story-vue'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText('Design', { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 })
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

test.describe('OrigamMessages — elevation (#550)', () => {
    test.setTimeout(45000)

    test('aucune ombre tant que `elevation` n\'est pas passee', async ({ page }) => {
        await openVariant(page, 'Design')
        const root = sandboxOf(page).locator('.origam-messages').first()
        await expect(root).toBeVisible({ timeout: 8000 })

        const shadow = await root.evaluate(el => getComputedStyle(el).boxShadow)
        expect(shadow).toBe('none')
    })

    test('un echelon token pose une ombre, et deux echelons donnent deux ombres', async ({ page }) => {
        await openVariant(page, 'Design')
        const root = sandboxOf(page).locator('.origam-messages').first()
        await expect(root).toBeVisible({ timeout: 8000 })

        await fillHstText(page, 'Elevation', 'md')
        await page.waitForTimeout(400)
        const md = await root.evaluate(el => getComputedStyle(el).boxShadow)

        await fillHstText(page, 'Elevation', 'xl')
        await page.waitForTimeout(400)
        const xl = await root.evaluate(el => getComputedStyle(el).boxShadow)

        expect(md).not.toBe('none')
        expect(xl).not.toBe('none')
        expect(md).not.toBe(xl)
    })

    test('la classe d\'etat et l\'utilitaire accompagnent la declaration', async ({ page }) => {
        await openVariant(page, 'Design')
        const root = sandboxOf(page).locator('.origam-messages').first()
        await expect(root).toBeVisible({ timeout: 8000 })

        await fillHstText(page, 'Elevation', 'md')
        await page.waitForTimeout(400)

        const cls = await root.evaluate(el => el.className)
        expect(cls).toContain('origam-messages--elevated')
        expect(cls).toContain('origam--shadow-md')
    })
})
