import { test } from '@playwright/test'

const STORY_ID = 'components-stories-input-origaminput-story-vue'

test('diag', async ({ page }) => {
    await page.goto(`/stories/story/${STORY_ID}?variantId=${STORY_ID}-12`, { waitUntil: 'domcontentloaded' })
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    const input = sandbox.locator('.origam-input').first()
    await input.waitFor({ timeout: 15000 })

    const out = await input.evaluate((el) => {
        const doc = el.ownerDocument
        const cs = getComputedStyle(el)
        const rootCs = getComputedStyle(doc.documentElement)
        const details = el.querySelector('.origam-input__details') as HTMLElement | null
        const prepend = el.querySelector('.origam-input__prepend') as HTMLElement | null
        return {
            tag: el.tagName,
            cls: el.className,
            paddingTopVarOnEl: cs.getPropertyValue('--origam-input---padding-top'),
            paddingTopVarOnRoot: rootCs.getPropertyValue('--origam-input---padding-top'),
            densityVar: cs.getPropertyValue('--origam-input---density'),
            detailsExists: !!details,
            detailsPaddingTop: details ? getComputedStyle(details).paddingTop : null,
            prependExists: !!prepend,
            prependMarginBlockStart: prepend ? getComputedStyle(prepend).marginBlockStart : null,
            prependMarginInlineEnd: prepend ? getComputedStyle(prepend).marginInlineEnd : null,
            sheetCount: doc.styleSheets.length,
            scopeAttrs: Array.from(el.attributes).map((a) => a.name).filter((n) => n.startsWith('data-v-')),
            detailsScope: details ? Array.from(details.attributes).map((a) => a.name).filter((n) => n.startsWith('data-v-')) : null
        }
    })
    console.log('DIAG=' + JSON.stringify(out, null, 2))
})
