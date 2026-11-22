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
