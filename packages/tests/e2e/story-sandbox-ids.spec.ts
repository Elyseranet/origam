import { expect, test } from '@playwright/test'

/**
 * SPEC — ids uniques dans le bac a sable Histoire (#1424)
 *
 * Chaque story est enveloppee par OrigamStoryLayout (`<origam-app>`). Mesure :
 * aucun id ne doit apparaitre deux fois dans le document du `__sandbox`.
 */
const STORIES = [
    'components-stories-textfield-origamtextfield-story-vue',
    'components-stories-field-origamfield-story-vue',
    'components-stories-btn-origambtn-story-vue'
]

for (const storyId of STORIES) {
    test(`${storyId} — aucun id duplique dans le sandbox`, async ({ page }) => {
        test.setTimeout(60000)
        await page.goto(`/stories/story/${storyId}?variantId=${storyId}-0`, { waitUntil: 'domcontentloaded' })
        const sb = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sb.locator('.origam-app').first()).toBeAttached({ timeout: 15000 })

        const r = await sb.locator('body').evaluate(() => {
            const counts: Record<string, number> = {}
            document.querySelectorAll('[id]').forEach((e) => { counts[e.id] = (counts[e.id] ?? 0) + 1 })
            return {
                dups: Object.entries(counts).filter(([, n]) => n > 1),
                apps: document.querySelectorAll('.origam-app').length
            }
        })
        // Histoire monte la story dans 2 apps Vue (cachee + visible) : le test n'a de sens que s'il y en a 2.
        expect(r.apps).toBe(2)
        expect(r.dups).toEqual([])
    })
}
