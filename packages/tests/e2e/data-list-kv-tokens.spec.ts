import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

// #1267 — the kv row / key / value tokens. Tokens are injected as a stylesheet
// BEFORE the document loads (addInitScript): mutating a rendered sandbox element
// is unreliable in Histoire's iframe (see CLAUDE.md).
const STORY_PATH = '/stories/story/components-stories-datalist-origamdatalist-story-vue'
const P = '--origam-data-list__kv---'

const measure = async (page: Page, tokens: Record<string, string>) => {
    const css = `.origam-data-list{${Object.entries(tokens).map(([k, v]) => `${P}${k}:${v}`).join(';')}}`
    await page.addInitScript(c => {
        document.addEventListener('DOMContentLoaded', () => {
            const s = document.createElement('style')
            s.textContent = c
            document.head.appendChild(s)
        })
    }, css)
    await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })
    await page.getByRole('link', { name: 'Functional', exact: true }).click()
    await page.waitForTimeout(800)
    await selectHstOption(page, 'Mode', 'kv')
    const sb = page.frameLocator('iframe[src*="__sandbox"]')
    const row = sb.locator('.origam-data-list__kv-row').first()
    await expect(row).toBeVisible({ timeout: 8000 })
    return row.evaluate(el => {
        const r = getComputedStyle(el)
        const k = getComputedStyle(el.querySelector('.origam-data-list__kv-key')!)
        const v = getComputedStyle(el.querySelector('.origam-data-list__kv-value')!)
        return {
            cols: r.gridTemplateColumns.split(' ').length, rowGap: r.rowGap, padL: r.paddingLeft,
            radius: r.borderTopLeftRadius, bg: r.backgroundColor, borderW: r.borderBottomWidth,
            ls: k.letterSpacing, tt: k.textTransform, fw: v.fontWeight, fvn: v.fontVariantNumeric,
        }
    })
}

test.describe('OrigamDataList kv tokens (#1267)', () => {
    test.setTimeout(45000)

    test('defaults are unchanged', async ({ page }) => {
        const m = await measure(page, {})
        expect(m).toMatchObject({
            cols: 2, rowGap: 'normal', padL: '0px', radius: '0px',
            bg: 'rgba(0, 0, 0, 0)', borderW: '1px', ls: 'normal', tt: 'none', fvn: 'normal',
        })
    })

    test('each token has a measured effect', async ({ page }) => {
        const m = await measure(page, {
            'row-columns': '1fr', 'row-gap': '2px', 'row-padding-inline': '9px', 'row-radius': '7px',
            'row-background': 'rgb(1, 2, 3)', 'row-border-width': '3px', 'key-letter-spacing': '2px',
            'key-text-transform': 'uppercase', 'value-font-weight': '700',
            'value-font-variant-numeric': 'tabular-nums',
        })
        expect(m).toMatchObject({
            cols: 1, rowGap: '2px', padL: '9px', radius: '7px', bg: 'rgb(1, 2, 3)', borderW: '3px',
            ls: '2px', tt: 'uppercase', fw: '700', fvn: 'tabular-nums',
        })
    })
})
