import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamDataTable, tri au clavier (#1341)
 *
 * Avant : le tri n'etait declenche que par un `@click` sur le `<th>`, sans
 * element focusable. Apres : un `<button type="button">` dans le `<th>`
 * (motif APG « Sortable Table ») ; `aria-sort` reste sur le `<th>`.
 */

const STORY_ID = 'components-stories-datatable-origamdatatable-story-vue'
const URL = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-0`
const TH = 'th.origam-data-table-header-cell'

test.describe('OrigamDataTable — tri au clavier (#1341)', () => {
    test.setTimeout(45000)

    for (const key of ['Enter', 'Space']) {
        test(`l'en-tete triable est focusable et ${key} trie (aria-sort suit)`, async ({ page }) => {
            await page.goto(URL, { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const th = sandbox.locator(TH).first()
            await expect(th).toBeVisible({ timeout: 8000 })
            const btn = th.locator('button[type="button"]')
            await expect(th).toHaveAttribute('aria-sort', 'none')

            await btn.focus()
            await expect(btn).toBeFocused()
            await btn.press(key)
            await expect(th).toHaveAttribute('aria-sort', 'ascending')
            await btn.press(key)
            await expect(th).toHaveAttribute('aria-sort', 'descending')
        })
    }

    // Rendu inchange vs l'ancien <div> (mesure A/B #1341) : le bouton reprend la
    // police du <th>, n'ajoute aucun padding/bordure et occupe toute la largeur utile.
    test('le bouton garde le rendu de l\'ancien div (police, padding, largeur)', async ({ page }) => {
        await page.goto(URL, { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const th = sandbox.locator(TH).first()
        await expect(th).toBeVisible({ timeout: 8000 })
        await page.waitForTimeout(500)
        const m = await th.evaluate((el) => {
            const b = el.querySelector('button.origam-data-table-header-cell__content')!
            const cs = getComputedStyle(b), ts = getComputedStyle(el)
            const inner = el.clientWidth - parseFloat(ts.paddingLeft) - parseFloat(ts.paddingRight)
            return {
                same: ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color'].every(k => (cs as never)[k] === (ts as never)[k]),
                pad: cs.padding, border: cs.borderTopWidth, bg: cs.backgroundColor,
                dw: Math.abs(b.getBoundingClientRect().width - inner)
            }
        })
        expect(m.same).toBe(true)
        expect(m.pad).toBe('0px')
        expect(m.border).toBe('0px')
        expect(m.bg).toBe('rgba(0, 0, 0, 0)')
        expect(m.dw).toBeLessThan(1)
    })

    test('axe : aucune violation serious/critical sur le tableau', async ({ page }) => {
        await page.goto(URL, { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator(TH).first()).toBeVisible({ timeout: 8000 })
        // AxeBuilder wants a Page: open the sandbox iframe document on its own.
        const src = await page.locator('iframe[src*="__sandbox"]').getAttribute('src')
        await page.goto(src!, { waitUntil: 'domcontentloaded' })
        await expect(page.locator(TH).first()).toBeVisible({ timeout: 8000 })
        const res = await new AxeBuilder({ page }).include('table').analyze()
        const bad = res.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
        expect(bad.map(v => v.id)).toEqual([])
    })
})
