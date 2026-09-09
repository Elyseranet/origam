import { test } from '@playwright/test'

const HOST = 'components-stories-breadcrumb-origambreadcrumb-story-vue'
const SANDBOX = 'iframe[src*="__sandbox"]'

test('AB — couleurs rendues item + divider', async ({ page }) => {
    await page.goto(`/stories/story/${HOST}?variantId=${HOST}-0`)
    const item = page.frameLocator(SANDBOX).locator('.origam-breadcrumb-item').first()
    await item.waitFor({ state: 'visible' })

    const out = await item.evaluate(() => {
        const read = (sel: string) => {
            const el = document.querySelector(sel) as HTMLElement | null
            if (!el) return null
            const cs = getComputedStyle(el)
            return { token: cs.getPropertyValue(`--origam-${sel.replace('.origam-', '')}---color`).trim(), used: cs.color }
        }
        return {
            item: read('.origam-breadcrumb-item'),
            divider: read('.origam-breadcrumb-divider'),
            root: (() => {
                const el = document.querySelector('.origam-breadcrumb') as HTMLElement
                return { token: getComputedStyle(el).getPropertyValue('--origam-breadcrumb---color').trim(), used: getComputedStyle(el).color }
            })()
        }
    })

    console.log('MEASURED ' + JSON.stringify(out))
})
