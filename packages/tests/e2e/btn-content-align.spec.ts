import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * SPEC — OrigamBtn : alignement du contenu par jetons (#1304)
 *
 * `__content { justify-content }` et `--wrap __content { text-align }` etaient en dur
 * (`center`). Ils lisent maintenant `--origam-btn__content---justify-content` et
 * `--origam-btn__content---text-align`, declares a `center` : defaut inchange.
 *
 * Le jeton est pose AVANT le chargement (addInitScript + feuille adoptee), jamais par
 * mutation apres rendu (CLAUDE.md : un element deja rendu peut rester perime dans le
 * bac a sable Histoire). Temoin A/B : le test « [rouge avant] » echoue sur le parent.
 *
 * Variant 15 de la story = « Prop — wrap » (bouton `block` de 320 px, libelle sur 2+ lignes).
 */
const STORY_ID = 'components-stories-btn-origambtn-story-vue'
const url = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-15`

const measure = async (page: Page) => {
    const btn = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-btn').first()
    await expect(btn).toBeVisible({ timeout: 15000 })
    return btn.evaluate((el) => {
        const content = el.querySelector('.origam-btn__content') as HTMLElement
        const text = document.createRange()
        text.selectNodeContents(content)
        const lefts = Array.from(text.getClientRects()).map((r) => Math.round(r.left * 10) / 10)
        const cs = getComputedStyle(content)
        return { lefts, justify: cs.justifyContent, textAlign: cs.textAlign, contentLeft: content.getBoundingClientRect().left }
    })
}

test.describe('OrigamBtn — alignement du contenu (#1304)', () => {
    test.setTimeout(60000)

    test('temoin : sans jeton, le contenu reste centre', async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        const m = await measure(page)
        expect(m.justify).toBe('center')
        expect(m.textAlign).toBe('center')
        // Centre : les deux lignes (de largeurs differentes) ne partagent pas le meme bord.
        expect(Math.max(...m.lefts) - Math.min(...m.lefts)).toBeGreaterThan(5)
    })

    test('[rouge avant] jetons flex-start / start : les lignes du libelle wrap sont alignees au debut', async ({ page }) => {
        await page.addInitScript(() => {
            if (!location.href.includes('__sandbox')) return
            const sheet = new CSSStyleSheet()
            sheet.replaceSync(':root{--origam-btn__content---justify-content:flex-start;--origam-btn__content---text-align:start}')
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
        })
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        const m = await measure(page)
        expect(m.justify).toBe('flex-start')
        expect(m.textAlign).toBe('start')
        // Au moins deux lignes, toutes au meme bord de debut (a l'ecart de bearing pres du glyphe).
        expect(m.lefts.length).toBeGreaterThanOrEqual(2)
        expect(Math.max(...m.lefts) - Math.min(...m.lefts)).toBeLessThanOrEqual(3)
        expect(Math.abs(m.lefts[0] - m.contentLeft)).toBeLessThanOrEqual(3)
    })
})
