import { expect, test, type Page } from '@playwright/test'

import { fillHstText, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * OrigamChartCartesian — le libelle traduit du bouton « Reset zoom »
 * tient-il dans sa boite ? (#764)
 *
 * POURQUOI CE SPEC EXISTE
 * ---------------------------------------------------------------------
 * #764 a fait lire au texte VISIBLE du bouton la meme cle de locale que
 * son `aria-label` — avant, il affichait un litteral anglais en dur.
 * Le correctif cree donc un risque qui n'existait pas : la boite qui
 * l'entoure est un `<rect width="64">` ECRIT EN DUR, dimensionne pour
 * « Reset zoom ». « Réinitialiser le zoom » est nettement plus long.
 *
 * Remplacer un defaut d'i18n par un debordement visuel ne gagnerait
 * rien : le second se voit a l'ecran par tous les francophones, ce que
 * le premier faisait deja.
 *
 * ⛔ POURQUOI PAS JSDOM. `getBBox()` n'y est pas implemente, et meme
 * s'il l'etait jsdom ne fait aucune mise en page typographique : il
 * rendrait la meme valeur pour deux chaines de longueurs differentes.
 * Seul un vrai navigateur repond.
 *
 * ⛔ CONTROLE POSITIF, non negociable. On mesure les DEUX chaines. Si la
 * sonde rend la meme largeur pour « Reset zoom » et « Réinitialiser le
 * zoom », c'est qu'elle ne mesure PAS le texte — et un « pas de
 * debordement » ne vaudrait rien. Deux longueurs tres differentes
 * doivent produire deux nombres tres differents.
 *
 * COMMENT LA CHAINE FRANCAISE ARRIVE DANS LE COMPOSANT
 * ---------------------------------------------------------------------
 * Histoire monte `createOrigam()` sans locale, donc sous `en`. Mais
 * `zoomResetLabel` suit le contrat #477 : une chaine brute qui ne
 * correspond a AUCUNE cle traverse inchangee. On injecte donc
 * directement « Réinitialiser le zoom », byte-pour-byte la valeur que
 * `fr.json` rend pour `origam.chart.zoom.reset_aria_label`. Le composant
 * mesure est le vrai composant, dans le vrai navigateur, avec la vraie
 * police — c'est la geometrie du texte qui est en question, pas le
 * chemin de resolution de la cle (deja couvert en TU sous `fr`).
 */

const STORY = '/stories/story/components-stories-chart-origamchartcartesian-story-vue'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const RESET_GROUP = '[data-cy="origam-chart-zoom-reset"]'

/** Valeur exacte de `fr.json` pour `origam.chart.zoom.reset_aria_label`. */
const FR_LABEL = 'Réinitialiser le zoom'
const EN_LABEL = 'Reset zoom'

/*********************************************************
 * measureFit
 *
 * @description
 * Rend la largeur TYPOGRAPHIQUE du `<text>` (via `getBBox()`, qui force
 * la mise en page et repond en unites utilisateur SVG — les memes que
 * le `width` du `<rect>`) et celle du `<rect>` frere, lue dans le DOM
 * plutot que codee en dur : si quelqu'un elargit la boite, la sonde
 * suit.
 ********************************************************/
async function measureFit (page: Page) {
    const frame = page.frame({ url: /__sandbox/ })
    if (!frame) throw new Error('sandbox introuvable')

    return frame.evaluate((sel) => {
        const group = document.querySelector(sel)
        if (!group) return null

        const text = group.querySelector('text') as SVGTextElement | null
        const rect = group.querySelector('rect') as SVGRectElement | null
        if (!text || !rect) return null

        const svg = group.ownerSVGElement
        const groupBox = (group as SVGGElement).getBBox()
        const ctm = (group as SVGGElement).getCTM()
        const svgBox = svg ? svg.getBoundingClientRect() : null
        const groupRect = (group as SVGGElement).getBoundingClientRect()

        return {
            label: text.textContent?.trim() ?? '',
            textWidth: text.getBBox().width,
            rectWidth: rect.getBBox().width,
            groupWidth: groupBox.width,
            hasCtm: Boolean(ctm),
            // Debordement hors du cadre du SVG, en pixels ecran.
            // Negatif ou nul = entierement contenu.
            spillLeft: svgBox ? svgBox.left - groupRect.left : null,
            spillRight: svgBox ? groupRect.right - svgBox.right : null
        }
    }, RESET_GROUP)
}

/*********************************************************
 * zoomIn — le bouton n'existe qu'une fois le graphe zoome
 *
 * @description
 * `v-if="zoomable && isZoomed"`. `isZoomed` n'est pas une prop et le
 * composant n'expose pas `zoomTo` : le seul chemin est l'interaction
 * reelle, shift + molette, que `onSvgWheel` ecoute.
 ********************************************************/
async function zoomIn (page: Page) {
    const chart = sandboxOf(page).locator('[data-cy="origam-chart-cartesian"] svg').first()
    const box = await chart.boundingBox()
    if (!box) throw new Error('svg du graphe introuvable')

    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5)
    await page.keyboard.down('Shift')
    await page.mouse.wheel(0, -300)
    await page.keyboard.up('Shift')
    await page.waitForTimeout(400)
}

test.describe('OrigamChartCartesian — le libelle traduit du bouton de zoom tient dans sa boite (#764)', () => {
    test('mesure navigateur : « Reset zoom » vs « Réinitialiser le zoom »', async ({ page }) => {
        await page.goto(STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Functional', { exact: true }).first().click()
        await page.waitForTimeout(400)

        await toggleHstCheckbox(page, 'Zoomable')
        await page.waitForTimeout(300)

        await zoomIn(page)

        await expect(sandboxOf(page).locator(RESET_GROUP)).toBeVisible({ timeout: 8000 })

        // ── Mesure 1 : l'anglais, tel que le bouton l'affichait AVANT #764
        const en = await measureFit(page)
        expect(en, 'le bouton de reset doit etre rendu').not.toBeNull()

        // ── Mesure 2 : le francais, injecte par le contrat #477
        await fillHstText(page, 'Zoom Reset Label (locale key)', FR_LABEL)
        await page.waitForTimeout(500)

        const fr = await measureFit(page)
        expect(fr, 'le bouton de reset doit encore etre rendu').not.toBeNull()

        console.log('\n──────── #764 — ajustement du libelle de reset de zoom ────────')
        console.log(`  en  « ${ en!.label } »`)
        console.log(`      texte ${ en!.textWidth.toFixed(2) }  /  boite ${ en!.rectWidth.toFixed(2) }  → debord ${ (en!.textWidth - en!.rectWidth).toFixed(2) }`)
        console.log(`  fr  « ${ fr!.label } »`)
        console.log(`      texte ${ fr!.textWidth.toFixed(2) }  /  boite ${ fr!.rectWidth.toFixed(2) }  → debord ${ (fr!.textWidth - fr!.rectWidth).toFixed(2) }`)
        console.log(`  hors-cadre SVG : en  gauche ${ en!.spillLeft?.toFixed(2) }  droite ${ en!.spillRight?.toFixed(2) }`)
        console.log(`                   fr  gauche ${ fr!.spillLeft?.toFixed(2) }  droite ${ fr!.spillRight?.toFixed(2) }`)
        console.log('───────────────────────────────────────────────────────────────\n')

        // ── CONTROLE POSITIF ────────────────────────────────────────────
        // Sans lui, un « pas de debordement » serait indistinguable d'une
        // sonde qui ne mesure rien. Deux chaines de longueurs tres
        // differentes DOIVENT donner deux nombres tres differents.
        expect(en!.label).toBe(EN_LABEL)
        expect(fr!.label).toBe(FR_LABEL)
        expect(en!.textWidth).toBeGreaterThan(0)
        expect(fr!.textWidth).toBeGreaterThan(en!.textWidth * 1.4)

        // ── LE VERDICT ──────────────────────────────────────────────────
        // La boite doit contenir son texte, dans les deux langues.
        expect(en!.textWidth).toBeLessThanOrEqual(en!.rectWidth)
        expect(fr!.textWidth).toBeLessThanOrEqual(fr!.rectWidth)

        // ── LE RISQUE QUE LA CORRECTION ELLE-MEME CREE ──────────────────
        // La pilule est ancree a DROITE (`plot.x1 - largeur - gap`).
        // L'elargir la pousse vers la gauche : elle ne peut pas sortir du
        // cadre a droite, mais un libelle tres long finirait par mordre
        // le bord gauche. On le MESURE plutot que de le raisonner.
        for (const m of [en!, fr!]) {
            expect(m.spillLeft, `« ${ m.label } » deborde a gauche du SVG`).toBeLessThanOrEqual(0)
            expect(m.spillRight, `« ${ m.label } » deborde a droite du SVG`).toBeLessThanOrEqual(0)
        }
    })
})
