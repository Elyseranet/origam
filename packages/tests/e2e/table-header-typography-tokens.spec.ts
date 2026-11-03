import { expect, test, type Page } from '@playwright/test'

// #1245 — header-cell letter-spacing / text-transform tokens, Table and DataTable.
// Tokens injected BEFORE the document loads (addInitScript), see CLAUDE.md.
const P = '--origam-table__header-cell---'
const TABLE = { path: '/stories/story/components-stories-table-origamtable-story-vue', variant: 'Design' }
const DATA_TABLE = { path: '/stories/story/components-stories-datatable-origamdatatable-story-vue', variant: 'Prop — showSelect' }

const measure = async (page: Page, target: typeof TABLE, tokens: Record<string, string>) => {
    const css = `.origam-table{${Object.entries(tokens).map(([k, v]) => `${P}${k}:${v}`).join(';')}}`
    await page.addInitScript(c => {
        document.addEventListener('DOMContentLoaded', () => {
            const s = document.createElement('style')
            s.textContent = c
            document.head.appendChild(s)
        })
    }, css)
    await page.goto(target.path, { waitUntil: 'domcontentloaded' })
    await page.getByRole('link', { name: target.variant, exact: true }).click()
    const th = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-table th').first()
    await expect(th).toBeVisible({ timeout: 12000 })
    return th.evaluate(el => {
        const s = getComputedStyle(el)
        return { ls: s.letterSpacing, tt: s.textTransform }
    })
}

for (const [name, target] of [['Table', TABLE], ['DataTable', DATA_TABLE]] as const) {
    test.describe(`${name} header typography tokens (#1245)`, () => {
        test.setTimeout(45000)

        test('defaults are unchanged', async ({ page }) => {
            expect(await measure(page, target, {})).toEqual({ ls: 'normal', tt: 'none' })
        })

        test('each token has a measured effect', async ({ page }) => {
            expect(await measure(page, target, { 'letter-spacing': '3px', 'text-transform': 'uppercase' }))
                .toEqual({ ls: '3px', tt: 'uppercase' })
        })
    })
}
