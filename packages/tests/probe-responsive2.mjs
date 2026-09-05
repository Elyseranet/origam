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
const content = sandbox.locator('.origam-responsive__content').first()

// mutate: force flex-direction column on the responsive root
await responsive.evaluate((el) => { el.style.flexDirection = 'column' })
await page.waitForTimeout(100)

const info = await page.evaluate(() => {
    const iframe = document.querySelector('iframe[src*="__sandbox"]')
    const doc = iframe.contentDocument
    const sizerEl = doc.querySelector('.origam-responsive__sizer')
    const contentEl = doc.querySelector('.origam-responsive__content')
    const rootEl = doc.querySelector('.origam-responsive')
    return {
        sizer: sizerEl.getBoundingClientRect().toJSON(),
        content: contentEl.getBoundingClientRect().toJSON(),
        root: rootEl.getBoundingClientRect().toJSON(),
        sizerCS: {
            width: getComputedStyle(sizerEl).width,
            height: getComputedStyle(sizerEl).height,
            paddingBlockEnd: getComputedStyle(sizerEl).paddingBlockEnd
        },
        contentCS: {
            marginBlockStart: getComputedStyle(contentEl).marginBlockStart
        }
    }
})
console.log(JSON.stringify(info, null, 2))

await browser.close()
