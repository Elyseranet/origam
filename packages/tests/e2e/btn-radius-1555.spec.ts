import { expect, test, type Page } from '@playwright/test'

import { toggleHstCheckbox } from './_support/histoire-controls'

/**
 * #1555 — the default theme's buttons are rounded rectangles (12px,
 * `--origam-radius---lg`), no longer pills (9999px, #1514).
 *
 * Read on the elements Vue rendered, without any mutation: the radius comes
 * from `--origam-btn---border-radius` / `--origam-btn-group---border-radius`
 * in light.css. The nested buttons (InlineEdit, Pagination, OrigamCode's copy
 * control) redeclare their own radius and must NOT follow the Btn token.
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openDefault = async (page: Page, story: string) => {
    await page.goto(`/stories/story/components-stories-${story}-story-vue`)
    await page.waitForLoadState('networkidle')
    await page.getByText('Default', { exact: true }).first().click()
    await page.waitForTimeout(800)
}

// Longhand on purpose: the `border-radius` shorthand is not a computed value.
const radiusOf = async (page: Page, selector: string) => {
    const el = sandboxOf(page).locator(selector).first()
    await expect(el).toBeAttached({ timeout: 8000 })
    return el.evaluate(node => {
        const s = getComputedStyle(node)
        return [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius]
    })
}

test.describe('#1555 — Btn radius 12px', () => {
    test('a standalone Btn renders 12px on all four corners', async ({ page }) => {
        await openDefault(page, 'btn-origambtn')
        expect(await radiusOf(page, '.origam-btn')).toEqual(['12px', '12px', '12px', '12px'])
    })

    for (const story of ['btn-origambtngroup', 'btn-origambtntoggle']) {
        test(`${story}: group is 12px and clips square children (no corner overflow)`, async ({ page }) => {
            await openDefault(page, story)
            expect(await radiusOf(page, '.origam-btn-group')).toEqual(['12px', '12px', '12px', '12px'])
            const group = sandboxOf(page).locator('.origam-btn-group').first()
            // The inner curve is derived by the browser from the group's
            // `overflow: hidden` clip: children stay square inside it.
            const clip = await group.evaluate(node => {
                const s = getComputedStyle(node)
                return `${s.overflowX}/${s.overflowY}`
            })
            expect(clip).toBe('hidden/hidden')
            const children = await group.locator('.origam-btn').evaluateAll(els =>
                els.map(el => getComputedStyle(el).borderTopLeftRadius)
            )
            expect(children.length).toBeGreaterThan(1)
            expect(new Set(children)).toEqual(new Set(['0px']))
        })
    }

    test('nested buttons keep their own radius (4px, radius.sm)', async ({ page }) => {
        await openDefault(page, 'inlineedit-origaminlineedit')
        await toggleHstCheckbox(page, 'Show Actions')
        expect(await radiusOf(page, '.origam-inline-edit__action-btn')).toEqual(['4px', '4px', '4px', '4px'])

        await openDefault(page, 'pagination-origampagination')
        expect(await radiusOf(page, '.origam-pagination .origam-btn')).toEqual(['4px', '4px', '4px', '4px'])

        await openDefault(page, 'code-origamcode')
        expect(await radiusOf(page, '.origam-code .origam-btn')).toEqual(['4px', '4px', '4px', '4px'])
    })
})
