import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * #550 (critere C1) — `OrigamTabs.bgColor` etait DECLAREE, exposee par deux
 * controles de la story, documentee, et lue NULLE PART. Le controle « Bg
 * Color » de la Variant « Design » existait donc deja : le manipuler ne
 * changeait strictement rien au rendu.
 *
 * Le verdict de ce spec est une mesure NAVIGATEUR (`getComputedStyle`) —
 * seul verdict valable pour une valeur qui transite par un
 * `var(--origam-color__…)` : sous jsdom, `getComputedStyle` ne resout
 * jamais un `var()` et renvoie un defaut fabrique (cf. CLAUDE.md racine,
 * #398). Le spec unitaire jumeau
 * (`TU/components/Tabs/tabs-bg-color.spec.ts`) verifie l'emission de la
 * declaration ; celui-ci verifie qu'elle PEINT.
 */

const STORY = '/stories/story/components-stories-tabs-origamtabs-story-vue'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText('Design', { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 })
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

test.describe('OrigamTabs — bgColor (#550)', () => {
    test.setTimeout(45000)

    test('le tablist est transparent tant que `bgColor` n\'est pas passee', async ({ page }) => {
        await openVariant(page, 'Design')
        const tablist = sandboxOf(page).locator('.origam-tabs').first()
        await expect(tablist).toBeVisible({ timeout: 8000 })

        const bg = await tablist.evaluate(el => getComputedStyle(el).backgroundColor)
        expect(bg).toBe('rgba(0, 0, 0, 0)')
    })

    test('une intention peint reellement la surface, et deux intentions donnent deux couleurs', async ({ page }) => {
        await openVariant(page, 'Design')
        const tablist = sandboxOf(page).locator('.origam-tabs').first()
        await expect(tablist).toBeVisible({ timeout: 8000 })

        await selectHstOption(page, 'Bg Color', 'Primary')
        await page.waitForTimeout(400)
        const primary = await tablist.evaluate(el => getComputedStyle(el).backgroundColor)

        await selectHstOption(page, 'Bg Color', 'Success')
        await page.waitForTimeout(400)
        const success = await tablist.evaluate(el => getComputedStyle(el).backgroundColor)

        expect(primary).not.toBe('rgba(0, 0, 0, 0)')
        expect(success).not.toBe('rgba(0, 0, 0, 0)')
        expect(primary).not.toBe(success)
    })

    // ⛔ Le controle « Bg Color » est cable sur `COLOR_OPTIONS`
    // (= `intentList`), qui ne contient QUE des intentions : le chemin
    // « couleur CSS brute » de `useColor` n'est pas atteignable depuis la
    // story. Il est couvert cote unitaire
    // (`TU/components/Tabs/tabs-bg-color.spec.ts`, cas `#ff00aa`).
    test('la paire de contraste suit la surface — le texte reste lisible', async ({ page }) => {
        await openVariant(page, 'Design')
        const tablist = sandboxOf(page).locator('.origam-tabs').first()
        await expect(tablist).toBeVisible({ timeout: 8000 })

        const before = await tablist.evaluate(el => getComputedStyle(el).color)

        await selectHstOption(page, 'Bg Color', 'Primary')
        await page.waitForTimeout(400)

        const after = await tablist.evaluate(el => getComputedStyle(el).color)
        expect(after).not.toBe(before)
    })
})
