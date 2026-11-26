import { expect, test, type Page } from '@playwright/test'

/**
 * #1090 — `loading={ type: 'skeleton', animation: 'wave' }` : le reflet (::before)
 * ne doit couvrir que la barre (::after), pas toute la cellule <td>.
 * Mesure navigateur reelle (Histoire), jamais jsdom.
 */
const STORY_PATH = '/stories/story/components-stories-datatable-origamdatatable-story-vue'

const open = async (page: Page, reduced = false) => {
    if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(STORY_PATH)
    await page.waitForLoadState('networkidle')
    await page.getByText('Prop — loading skeleton wave', { exact: true }).first().click()
    await page.waitForTimeout(800)
    const table = page.frameLocator('iframe[src*="__sandbox"]').locator('[data-cy="data-table-loading-skeleton-wave"]')
    await expect(table.locator('tbody td').first()).toBeVisible({ timeout: 8000 })
    return table
}

test.describe('DataTable skeleton wave — reflet borne a la barre (#1090)', () => {
    test('le ::before a la meme boite que la barre ::after, sur chaque cellule', async ({ page }) => {
        const table = await open(page)
        const boxes = await table.locator('tbody tr').first().locator('td').evaluateAll((tds) => tds.map((td) => {
            const box = (p: '::before' | '::after') => {
                const cs = getComputedStyle(td, p)
                return [cs.width, cs.height, cs.left, cs.top].map(parseFloat).map((n) => Math.round(n))
            }
            return { before: box('::before'), after: box('::after'), cell: Math.round(td.getBoundingClientRect().width) }
        }))

        expect(boxes.length).toBe(4)
        for (const b of boxes) {
            expect(b.before).toEqual(b.after)
            expect(b.before[0]).toBeLessThan(b.cell)
        }
    })

    test('reduced-motion : aucun reflet anime', async ({ page }) => {
        const table = await open(page, true)
        const m = await table.locator('tbody td').first().evaluate((td) => ({
            name: getComputedStyle(td, '::before').animationName,
            running: td.ownerDocument.getAnimations().length
        }))

        expect(m.name).toBe('none')
        expect(m.running).toBe(0)
    })
})
