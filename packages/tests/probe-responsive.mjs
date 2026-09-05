import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:6006/stories/story/components-stories-responsive-origamresponsive-story-vue')
await page.waitForLoadState('networkidle')
await page.getByText('Prop — aspectRatio', { exact: true }).first().click()
await page.waitForTimeout(800)

const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
const sizer = sandbox.locator('.origam-responsive__sizer').first()
const responsive = sandbox.locator('.origam-responsive').first()

const info = await sizer.evaluate((el) => {
    const cs = getComputedStyle(el)
    const parent = el.parentElement
    const parentCs = parent ? getComputedStyle(parent) : null
    return {
        sizer: {
            flex: cs.flex,
            flexBasis: cs.flexBasis,
            flexGrow: cs.flexGrow,
            flexShrink: cs.flexShrink,
            display: cs.display,
            paddingBlockEnd: cs.paddingBlockEnd,
            width: cs.width,
            height: cs.height,
            rect: el.getBoundingClientRect().toJSON(),
            inlineStyle: el.getAttribute('style')
        },
        parent: parentCs ? {
            flex: parentCs.flex,
            display: parentCs.display,
            width: parentCs.width,
            height: parentCs.height,
            rect: parent.getBoundingClientRect().toJSON()
        } : null
    }
})
console.log(JSON.stringify(info, null, 2))

await browser.close()
