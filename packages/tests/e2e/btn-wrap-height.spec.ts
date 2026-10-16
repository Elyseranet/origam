import { expect, test } from '@playwright/test'
import type { FrameLocator, Locator } from '@playwright/test'

/**
 * SPEC — OrigamBtn : `wrap` et hauteur minimale (#1093, #1094, #929)
 *
 * ## Les trois defauts encodes ici
 *
 * 1. #1093 — `&__content { white-space: nowrap }` n'avait aucune echappatoire :
 *    un bouton `block` de 304 px dans un conteneur de 320 px, avec un libelle FR
 *    de 445 px, laissait le texte SORTIR du bouton. La prop `wrap` pose la classe
 *    `origam-btn--wrap` (`white-space: normal`).
 * 2. #1094 — la hauteur etait FIXE (`height: calc(token)`) : deux lignes dans une
 *    hauteur d'une ligne debordaient en hauteur. Elle est desormais un MINIMUM
 *    (`height: auto` + `min-height` = le token).
 * 3. #929 — `--origam-btn---padding-block` etait ecrit en cinq endroits et lu
 *    nulle part. Le bouton le lit maintenant (repli `0`).
 *
 * ## ⛔ Pourquoi Playwright et pas Vitest
 *
 * `getComputedStyle` sous jsdom ne resout JAMAIS `var()`, et le `<style scoped>`
 * d'un SFC n'y est jamais injecte : tout ce qui est mesure ici passe par un
 * `var(--origam-btn---…)`. Voir CLAUDE.md, « getComputedStyle under jsdom ».
 *
 * ## Temoin A/B
 *
 * Les tests marques « [rouge avant] » echouent sur le commit parent (la prop
 * `wrap` n'existe pas, la hauteur est fixe, le padding vertical n'est pas lu).
 * Les autres sont des temoins de NON-regression, verts des deux cotes par
 * construction.
 *
 * ## Variants de la story OrigamBtn (index 0-based)
 *   0  → Design
 *   15 → Prop — wrap  ← controle `wrap`, `block`, `slim`, `size`, largeur du conteneur
 *        init: { wrap: true, block: true, size: 'large', containerWidth: 320 }
 */

const STORY_ID = 'components-stories-btn-origambtn-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

const DESIGN_VARIANT = 0
const WRAP_VARIANT = 15

interface IBoxes {
    btnHeight: number
    btnRight: number
    contentHeight: number
    contentRight: number
    paddingTop: number
    paddingBottom: number
    minHeight: string
    whiteSpace: string
    lineHeight: number
    classes: string
}

const measure = (btn: Locator): Promise<IBoxes> => btn.evaluate((el) => {
    const content = el.querySelector('.origam-btn__content') as HTMLElement
    const b = el.getBoundingClientRect()
    const c = content.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
        btnHeight: b.height,
        btnRight: b.right,
        contentHeight: c.height,
        contentRight: c.right,
        paddingTop: parseFloat(cs.paddingTop),
        paddingBottom: parseFloat(cs.paddingBottom),
        minHeight: cs.minHeight,
        whiteSpace: getComputedStyle(content).whiteSpace,
        lineHeight: parseFloat(getComputedStyle(content).lineHeight) || parseFloat(getComputedStyle(content).fontSize) * 1.2,
        classes: el.className
    }
})

const open = async (page: import('@playwright/test').Page, idx: number): Promise<{ sandbox: FrameLocator, btn: Locator }> => {
    await page.goto(variantUrl(idx), { waitUntil: 'domcontentloaded' })
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    const btn = sandbox.locator('.origam-btn').first()
    await expect(btn).toBeVisible({ timeout: 15000 })
    return { sandbox, btn }
}

test.describe('OrigamBtn — wrap et hauteur minimale', () => {
    test.setTimeout(60000)

    test('[rouge avant] wrap=true pose la classe origam-btn--wrap et white-space: normal', async ({ page }) => {
        const { btn } = await open(page, WRAP_VARIANT)
        const m = await measure(btn)
        expect(m.classes).toContain('origam-btn--wrap')
        expect(m.whiteSpace).toBe('normal')
    })

    test('[rouge avant] avec wrap, le libelle reste DANS le bouton', async ({ page }) => {
        const { btn } = await open(page, WRAP_VARIANT)
        const m = await measure(btn)
        // Une tolerance d'un demi-pixel : l'arrondi de la boite, pas un debordement.
        expect(m.contentRight).toBeLessThanOrEqual(m.btnRight + 0.5)
    })

    test('[rouge avant] avec wrap, le bouton GRANDIT pour tenir le libelle sur plusieurs lignes', async ({ page }) => {
        const { btn } = await open(page, WRAP_VARIANT)
        const m = await measure(btn)
        // Plusieurs lignes : le contenu fait au moins deux fois une ligne.
        expect(m.contentHeight).toBeGreaterThanOrEqual(m.lineHeight * 2 - 1)
        // Le bouton n'est pas reste a son minimum : il contient son contenu.
        expect(m.btnHeight).toBeGreaterThanOrEqual(m.contentHeight - 0.5)
        expect(m.btnHeight).toBeGreaterThan(parseFloat(m.minHeight))
    })

    test('temoin : sans wrap, le libelle deborde toujours (nowrap) — le defaut #1093 est la valeur par defaut', async ({ page }) => {
        const { sandbox, btn } = await open(page, WRAP_VARIANT)
        // Le contenu est decoche via le DOM : on lit le defaut du composant, pas une prop.
        await btn.evaluate((el) => el.classList.remove('origam-btn--wrap'))
        await sandbox.locator('body').evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))))
        const m = await measure(btn)
        expect(m.whiteSpace).toBe('nowrap')
        expect(m.contentRight).toBeGreaterThan(m.btnRight + 0.5)
    })

    test('[rouge avant] --origam-btn---padding-block est LU : le bouton grandit de 2 x la valeur', async ({ page }) => {
        const { sandbox, btn } = await open(page, WRAP_VARIANT)
        const before = await measure(btn)
        expect(before.paddingTop).toBe(0)

        // Le token est pose sur <html> du bac a sable, pas sur le bouton : un element deja
        // rendu par Vue ne recalcule pas toujours apres une mutation inline (CLAUDE.md).
        await sandbox.locator('body').evaluate(() => {
            document.documentElement.style.setProperty('--origam-btn---padding-block', '8px')
        })
        await sandbox.locator('body').evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))))
        // Deuxieme etape : laisser la recalculation du descendant se faire.
        await page.waitForTimeout(500)

        const after = await measure(btn)
        expect(after.paddingTop).toBe(8)
        expect(after.paddingBottom).toBe(8)
        expect(after.btnHeight).toBeCloseTo(before.btnHeight + 16, 0)
    })

    test('temoin de non-regression : au repos, un libelle d\'une ligne a exactement la hauteur du token', async ({ page }) => {
        const { btn } = await open(page, DESIGN_VARIANT)
        const m = await measure(btn)
        // `height: auto` + `min-height: token` : la boite mesure le minimum, ni plus ni moins.
        expect(m.btnHeight).toBeCloseTo(parseFloat(m.minHeight), 1)
        expect(m.paddingTop).toBe(0)
        expect(m.paddingBottom).toBe(0)
    })
})
