import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * SPEC — OrigamBtn : le libellé est centré verticalement (#1168)
 *
 * ## Le défaut encodé ici
 *
 * #1094 a remplacé la hauteur fixe de `.origam-btn` par `height: auto` +
 * `min-height` (pour que `wrap` puisse agrandir le bouton). La grille interne
 * `.origam-btn__loader` porte `height: 100%`, qui ne se résout pas contre une
 * hauteur `auto` : elle retombe à la hauteur d'une ligne, EN HAUT de la boîte.
 * La racine était `inline-block`, donc son `align-items: center` ne servait à
 * rien. Mesuré sur le site marketing : 12 px de contenu à 1 px du haut d'un
 * bouton de 28 px. Publié de 2.29.1 à 2.32.1.
 *
 * ## ⛔ Pourquoi `<a>` ET `<button>` — un `<button>` seul ne prouve RIEN
 *
 * L'UA centre verticalement le contenu d'un `<button>` tout seul : sur le
 * commit parent, chaque `<button>` de la matrice mesure un écart de 0 px. Seul
 * un `<a>` (`href` / `to`, ce que rend `useLink`) expose le défaut — c'est la
 * forme de `CatalogRelatedFamilies.vue` sur le marketing. La matrice rend donc
 * chaque cas sous les deux tags ; les `<button>` sont les témoins verts des
 * deux côtés.
 *
 * ## Le critère
 *
 * Pour un contenu d'une ligne : |centre vertical de `__loader` − centre
 * vertical de la boîte de bordure intérieure de la racine| ≤ 1 px.
 *
 * ## Temoin A/B
 *
 * Rejoué contre le commit parent (même story, `OrigamBtn.vue` d'avant) : les
 * tests « [rouge avant] » rougissent — 35 des 40 `<a>` d'une ligne sont
 * décentrés, de 4 à 21 px (`<a>` x-large comfortable). Les témoins restent
 * verts des deux côtés.
 *
 * ## ⛔ Pourquoi Playwright et pas Vitest
 *
 * Le `<style scoped>` d'un SFC n'est jamais injecté dans jsdom, et
 * `getComputedStyle` y ignore `var()` (CLAUDE.md, « getComputedStyle under
 * jsdom »). Seul un vrai navigateur calcule une position de boîte.
 *
 * ## Variants de la story OrigamBtn (index 0-based)
 *   17 → Layout — vertical centring (matrix)  ← ce spec
 *        tailles × densités (parent bloc), variants (parent flex), icônes,
 *        `icon`, `stacked`, `loading`, `height`, `wrap`, `block` ;
 *        chaque cas en `<button>` et en `<a href>`.
 */

const STORY_ID = 'components-stories-btn-origambtn-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

const CENTRE_VARIANT = 17

/** Tolérance du critère, en px : l'arrondi d'une boîte, pas un décalage. */
const TOLERANCE = 1

interface ICentreRow {
    label: string
    tag: string
    parentDisplay: string
    display: string
    height: number
    loaderHeight: number
    delta: number
    single: boolean
}

const measureAll = (page: Page): Promise<ICentreRow[]> => page
    .frameLocator('iframe[src*="__sandbox"]')
    .locator('[data-cy="btn-center-matrix"]')
    .evaluate((root) => [...root.querySelectorAll<HTMLElement>('.origam-btn')].map((el) => {
        const r = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        const loader = el.querySelector('.origam-btn__loader') as HTMLElement
        const l = loader.getBoundingClientRect()
        const bt = parseFloat(cs.borderTopWidth)
        const bb = parseFloat(cs.borderBottomWidth)
        const rootCentre = r.top + bt + (r.height - bt - bb) / 2

        return {
            label: (el.textContent ?? '').trim() || `${el.tagName} icon`,
            tag: el.tagName,
            parentDisplay: getComputedStyle(el.parentElement as HTMLElement).display,
            display: cs.display,
            height: r.height,
            loaderHeight: l.height,
            delta: l.top + l.height / 2 - rootCentre,
            single: el.dataset.center === 'single'
        }
    }))

const open = async (page: Page): Promise<ICentreRow[]> => {
    await page.goto(variantUrl(CENTRE_VARIANT), { waitUntil: 'domcontentloaded' })
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    await expect(sandbox.locator('[data-cy="btn-center-matrix"] .origam-btn').first()).toBeVisible({ timeout: 15000 })
    // Les icônes MDI sont une police : on attend qu'elle soit chargée avant de mesurer.
    await sandbox.locator('body').evaluate(() => document.fonts.ready.then(() => undefined))

    return measureAll(page)
}

const offCentre = (rows: ICentreRow[]) => rows
    .filter((r) => r.single && Math.abs(r.delta) > TOLERANCE)
    .map((r) => `${r.tag} « ${r.label} » (parent ${r.parentDisplay}) : ${r.delta.toFixed(2)} px`)

test.describe('OrigamBtn — centrage vertical du libellé (#1168)', () => {
    test.setTimeout(60000)

    test('garde-fou : la matrice couvre les deux tags, les deux parents et toutes les tailles', async ({ page }) => {
        const rows = await open(page)
        const single = rows.filter((r) => r.single)

        // 6 tailles (dont « (none) ») × 4 densités × 2 tags = 48, plus les cas limites.
        expect(single.length).toBeGreaterThanOrEqual(70)
        expect(single.filter((r) => r.tag === 'A').length).toBeGreaterThanOrEqual(35)
        expect(single.filter((r) => r.tag === 'BUTTON').length).toBeGreaterThanOrEqual(30)
        expect(new Set(single.map((r) => r.parentDisplay))).toEqual(new Set(['block', 'flex']))
    })

    test('[rouge avant] chaque `<a>` d\'une ligne a son libellé centré à 1 px près', async ({ page }) => {
        const rows = (await open(page)).filter((r) => r.tag === 'A')
        expect(offCentre(rows)).toEqual([])
    })

    test('témoin : chaque `<button>` d\'une ligne est centré (l\'UA le centrait déjà)', async ({ page }) => {
        const rows = (await open(page)).filter((r) => r.tag === 'BUTTON')
        expect(offCentre(rows)).toEqual([])
    })

    test('[rouge avant] `<a>` dans un parent bloc : racine de niveau inline, contenu centré', async ({ page }) => {
        const rows = (await open(page)).filter((r) => r.tag === 'A' && r.parentDisplay === 'block' && r.single && r.display !== 'flex')

        expect(rows.length).toBeGreaterThan(0)
        // #933 — jamais `inline` : une boîte inline ignore `min-height`.
        for (const r of rows) expect(r.display, r.label).toMatch(/^inline-/)
        expect(offCentre(rows)).toEqual([])
    })

    test('témoin : `wrap` sur deux lignes — le contenu reste dans le bouton, qui garde au moins sa hauteur minimale', async ({ page }) => {
        await open(page)
        const m = await page.frameLocator('iframe[src*="__sandbox"]').locator('[data-cy="btn-center-wrap"]').evaluate((el) => {
            const r = el.getBoundingClientRect()
            const c = (el.querySelector('.origam-btn__content') as HTMLElement).getBoundingClientRect()
            const lh = parseFloat(getComputedStyle(el.querySelector('.origam-btn__content') as HTMLElement).lineHeight)
            return { top: r.top, bottom: r.bottom, cTop: c.top, cBottom: c.bottom, cHeight: c.height, lineHeight: lh, minHeight: parseFloat(getComputedStyle(el).minHeight), height: r.height }
        })

        expect(m.cHeight).toBeGreaterThanOrEqual(m.lineHeight * 2 - 1)
        expect(m.cTop).toBeGreaterThanOrEqual(m.top - 0.5)
        expect(m.cBottom).toBeLessThanOrEqual(m.bottom + 0.5)
        expect(m.height).toBeGreaterThanOrEqual(m.minHeight - 0.5)
    })
})
