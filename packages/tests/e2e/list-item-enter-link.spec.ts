import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamListItem : Entrée sur un item `href`/`to` SANS prop `link` (#1066)
 *
 * Cause : `handleKeyDown` n'ignorait que `props.link && link.isLink`. Sans `link`, un
 * item `href` (rendu `<a>`) voyait son Entrée interceptée : `preventDefault()` tue
 * l'activation native, puis `navigate(e)` de vue-router refuse un event `defaultPrevented`
 * (guardEvent) -> aucune navigation (WCAG 2.1.1).
 */
const STORY_ID = 'components-stories-list-origamlistitem-story-vue'
const FUNCTIONAL_VARIANT = 3

test('Enter sur un item href sans `link` navigue (activation native non annulée)', async ({ page }) => {
    test.setTimeout(45000)
    await page.goto(`/stories/story/${STORY_ID}?variantId=${STORY_ID}-${FUNCTIONAL_VARIANT}`, { waitUntil: 'domcontentloaded' })
    await page.getByLabel('Href (tag=a)').fill('#enter-nav')

    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    const row = sandbox.locator('a.origam-list-item').first()
    await expect(row).toBeVisible({ timeout: 12000 })

    await row.evaluate((el) => {
        const w = el.ownerDocument.defaultView as any
        w.__prevented = null
        el.ownerDocument.addEventListener('keydown', (e) => { if (e.key === 'Enter') w.__prevented = e.defaultPrevented })
    })
    await row.focus()
    await page.keyboard.press('Enter')

    const r = await row.evaluate((el) => ({
        prevented: (el.ownerDocument.defaultView as any).__prevented,
        hash: el.ownerDocument.defaultView!.location.hash,
    }))
    expect(r.prevented).toBe(false)
    expect(r.hash).toBe('#enter-nav')
})
