import { expect, test } from '@playwright/test'
import type { FrameLocator, Locator } from '@playwright/test'

/**
 * SPEC — OrigamBtn `block` dans un parent flex (#1095)
 *
 * `.origam-btn--block` portait `flex: 1 0 auto` : dans un parent flex en COLONNE
 * le bouton GRANDISSAIT sur l'axe principal (80 px au lieu de 44 px dans une carte
 * a hauteur egale, 132 px dans une colonne de 200 px). Desormais `flex: 0 0 auto`
 * + `width: 100%` : pleine largeur, aucune croissance.
 *
 * ## Pourquoi Playwright
 * `getComputedStyle` sous jsdom ne resout jamais `var()` (CLAUDE.md) et le
 * `<style scoped>` n'y est pas injecte : seul un vrai navigateur repond.
 *
 * ## Temoin A/B
 * Les tests « [rouge avant] » echouent sur `origin/develop`. Les autres sont des
 * temoins de non-regression (largeur, plafond max-width, stacked, wrap).
 *
 * Variant 15 de la story OrigamBtn = « Prop — block (flex column) ».
 */

const STORY_ID = 'components-stories-btn-origambtn-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const BLOCK_VARIANT = 15
const url = `${STORY_PATH}?variantId=${STORY_ID}-${BLOCK_VARIANT}`

interface IBox { height: number, width: number, parentContentWidth: number, parentHeight: number, flexGrow: string, flexBasis: string }

const box = (loc: Locator): Promise<IBox> => loc.evaluate((el) => {
    const parent = el.parentElement as HTMLElement
    const pcs = getComputedStyle(parent)
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
        height: r.height,
        width: r.width,
        parentContentWidth: parent.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight),
        parentHeight: parent.getBoundingClientRect().height,
        flexGrow: cs.flexGrow,
        flexBasis: cs.flexBasis
    }
})

const open = async (page: import('@playwright/test').Page): Promise<FrameLocator> => {
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    await expect(sandbox.locator('[data-cy="btn-block-columns"]')).toBeVisible({ timeout: 15000 })
    await sandbox.locator('body').evaluate(() => document.fonts.ready.then(() => undefined))
    return sandbox
}

test.describe('OrigamBtn — block dans un parent flex (#1095)', () => {
    test.setTimeout(60000)

    test('[rouge avant] flex-grow vaut 0 sur un bouton block', async ({ page }) => {
        const sb = await open(page)
        const m = await box(sb.locator('[data-cy="btn-block-short"]'))
        expect(m.flexGrow).toBe('0')
    })

    test('[rouge avant] carte etiree a hauteur egale : le bouton garde sa hauteur propre (44 px, pas etire a 188 px comme avant)', async ({ page }) => {
        const sb = await open(page)
        const short = await box(sb.locator('[data-cy="btn-block-short"]'))
        const long = await box(sb.locator('[data-cy="btn-block-long"]'))
        // Precondition du defaut : la carte courte a bien ete etiree par la rangee.
        expect(short.parentHeight).toBeGreaterThan(short.height + 40)
        expect(short.parentHeight).toBeCloseTo(long.parentHeight, 0)
        expect(short.height).toBeCloseTo(44, 0)
        expect(long.height).toBeCloseTo(short.height, 0)
    })

    test('[rouge avant] colonne de 200 px de haut : le bouton ne grandit plus (168 px avant)', async ({ page }) => {
        const sb = await open(page)
        const m = await box(sb.locator('[data-cy="btn-block-tall"]'))
        expect(m.parentHeight).toBeGreaterThanOrEqual(200)
        expect(m.height).toBeCloseTo(44, 0)
    })

    test('temoin : la largeur vaut 100 % du parent en colonne', async ({ page }) => {
        const sb = await open(page)
        for (const cy of ['btn-block-short', 'btn-block-long', 'btn-block-tall']) {
            const m = await box(sb.locator(`[data-cy="${cy}"]`))
            expect(m.width, cy).toBeCloseTo(m.parentContentWidth, 0)
        }
    })

    test('temoin : la largeur vaut 100 % du parent en ligne', async ({ page }) => {
        const sb = await open(page)
        const m = await box(sb.locator('[data-cy="btn-block-in-row"]'))
        expect(m.width).toBeCloseTo(m.parentContentWidth, 0)
    })

    test('[rouge avant] stacked + block garde la pleine largeur', async ({ page }) => {
        const sb = await open(page)
        const m = await box(sb.locator('[data-cy="btn-block-stacked"]'))
        expect(m.width).toBeCloseTo(m.parentContentWidth, 0)
        expect(m.flexGrow).toBe('0')
    })

    test('temoin : wrap + block grandit pour son contenu, pas pour le parent', async ({ page }) => {
        const sb = await open(page)
        const wrapped = await box(sb.locator('[data-cy="btn-block-wrapped"]'))
        expect(wrapped.width).toBeCloseTo(wrapped.parentContentWidth, 0)
        // Plusieurs lignes : plus haut qu'un bouton d'une ligne...
        expect(wrapped.height).toBeGreaterThan(44.5)
        // ... mais loin de la hauteur du parent (360 px) qu'il remplissait avant.
        expect(wrapped.height).toBeLessThan(wrapped.parentHeight / 2)
    })

    test('temoin : max-width ne plafonne pas un bouton block (min-width: 100% l emporte, inchange)', async ({ page }) => {
        const sb = await open(page)
        const m = await box(sb.locator('[data-cy="btn-block-capped"]'))
        expect(m.width).toBeCloseTo(m.parentContentWidth, 0)
    })
})
