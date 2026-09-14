import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * OrigamChartGauge — premier spec e2e du composant.
 *
 * Le classeur portait C7 en defaut avec pour motif « aucun spec e2e dedie ».
 * Verifie et non suppose : `ls packages/tests/e2e | grep -i gauge` rendait
 * ZERO fichier avant celui-ci, alors que 20 autres membres de la famille
 * Chart ont le leur.
 *
 * Consequence pratique de ce trou : `gaugeStartAngle` et `gaugeEndAngle`
 * etaient documentes (OrigamChartGauge.md) mais n'avaient AUCUN controle de
 * story et aucune sonde. Ils sont pourtant bien vivants — passes en getters
 * paresseux a `useChartGauge` (OrigamChartGauge.vue:325-326), forme conforme
 * a l'ADR-005 puisqu'une lecture eager dans le corps de `setup()` ne verrait
 * jamais le theme.
 *
 * ⛔ Ce spec mesure la GEOMETRIE REELLE de l'arc (`getBBox` du path de serie),
 * pas la presence d'un controle. Un controle qui ne pilote rien ment plus
 * fort qu'une doc absente, et c'est precisement ce qu'on ne veut pas ajouter
 * en comblant un trou C7.
 */

const STORY = '/stories/story/components-stories-chart-origamchartgauge-story-vue'
const GAUGE = '[data-cy="origam-chart-gauge"]'
const SERIES = '[data-cy="origam-chart-gauge-series"]'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(400)
}

/** Boite englobante du path de serie, en unites utilisateur SVG. */
const seriesBox = async (page: Page) =>
    sandboxOf(page).locator(SERIES).first().evaluate((el) => {
        const { width, height } = (el as SVGGraphicsElement).getBBox()

        return { width: Math.round(width), height: Math.round(height) }
    })

test.describe('OrigamChartGauge — rendu de base', () => {
    test('rend la racine figure et un path de serie', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        await expect(sandbox.locator(GAUGE).first()).toBeVisible()
        await expect(sandbox.locator(SERIES).first()).toBeVisible()
    })

    test('affiche la valeur et les bornes', async ({ page }) => {
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)

        // ⛔ Le libelle textuel est `gauge-label`, PAS `gauge-value` : ce
        // dernier est le PATH de l'arc rempli (`<path class=
        // "origam-chart__gauge-value">`). Premiere redaction de ce spec, la
        // sonde visait `gauge-value` et lisait donc la chaine vide d'un
        // element SVG graphique — un rouge sur du code parfaitement correct.
        await expect(sandbox.locator('[data-cy="origam-chart-gauge-label"]').first()).toContainText('62')
        await expect(sandbox.locator('[data-cy="origam-chart-gauge-min"]').first()).toContainText('0')
        await expect(sandbox.locator('[data-cy="origam-chart-gauge-max"]').first()).toContainText('100')
    })
})

test.describe('OrigamChartGauge — gaugeStartAngle / gaugeEndAngle (C7)', () => {
    test('reduire la course a un quart de tour retrecit l\'arc', async ({ page }) => {
        await openVariant(page, 'Design')

        const before = await seriesBox(page)

        // -135°..135° (defaut, 270° de course) -> -90°..90° (180° de course).
        await selectHstOption(page, 'Start Angle', '-90° (quart)')
        await selectHstOption(page, 'End Angle', '90° (quart)')

        const after = await seriesBox(page)

        // Valeurs ABSOLUES des deux cotes, jamais un simple « ca a change » :
        // un arc de 270° descend sous le centre et occupe donc une hauteur
        // superieure a sa demi-largeur, ce qu'un arc de 180° ne fait pas.
        expect(before.height).toBeGreaterThan(after.height)
        expect(after.width).toBeGreaterThan(0)
        expect(after.height).toBeGreaterThan(0)
    })

    test('la course par defaut couvre 270° — l\'arc redescend sous le centre', async ({ page }) => {
        await openVariant(page, 'Design')

        const box = await seriesBox(page)

        // Un arc -135°..135° depasse le demi-cercle : sa hauteur vaut plus de
        // la moitie de sa largeur. Fige la valeur par defaut elle-meme, et
        // pas seulement l'ecart entre deux reglages — c'est ce qui a manque
        // au test du bloquant Row, vert alors que la gouttiere etait morte.
        expect(box.height).toBeGreaterThan(box.width / 2)
    })
})
