import { expect, test, type Page } from '@playwright/test'

// #1128 — a <dl> must not paint its own surface: on a coloured / gradient
// parent it has to stay transparent, inherit the parent's colour and not clip.
// Histoire is pinned data-theme="light"; the dark sheets carry the same three
// values (checked by the token twin guard, not by this spec).
const STORY_PATH = '/stories/story/components-stories-datalist-origamdatalist-story-vue'
const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

test.describe('OrigamDataList — no own surface (#1128)', () => {
    test.setTimeout(45000)

    test('transparent background, inherited colour, visible overflow', async ({ page }) => {
        await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })
        await page.getByRole('link', { name: 'Design', exact: true }).click()
        const dl = sandboxOf(page).locator('.origam-data-list').first()
        await expect(dl).toBeVisible({ timeout: 5000 })
        // Read-only measurement in ONE evaluate: no post-render mutation
        // (stale inside Histoire's sandbox iframe).
        const m = await dl.evaluate((el) => {
            const cs = getComputedStyle(el)
            const parent = getComputedStyle(el.parentElement as HTMLElement)
            return { bg: cs.backgroundColor, overflow: cs.overflow, color: cs.color, parentColor: parent.color }
        })
        expect(m.bg).toBe('rgba(0, 0, 0, 0)')
        expect(m.overflow).toBe('visible')
        expect(m.color).toBe(m.parentColor)
    })
})
