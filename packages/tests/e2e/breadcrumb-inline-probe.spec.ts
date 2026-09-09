import { test } from '@playwright/test'

const HOST = 'components-stories-breadcrumb-origambreadcrumb-story-vue'
const SANDBOX = 'iframe[src*="__sandbox"]'

test('PROBE inline', async ({ page }) => {
    await page.goto(`/stories/story/${HOST}?variantId=${HOST}-0`)
    const el = page.frameLocator(SANDBOX).locator('.origam-breadcrumb-item').first()
    await el.waitFor({ state: 'visible' })

    const out = await el.evaluate((n: HTMLElement) => ({
        inline: n.getAttribute('style'),
        classes: n.className,
        colorVar: getComputedStyle(n).getPropertyValue('--origam-breadcrumb-item---color').trim(),
        usedColor: getComputedStyle(n).color
    }))
    console.log(JSON.stringify(out, null, 2))
})
