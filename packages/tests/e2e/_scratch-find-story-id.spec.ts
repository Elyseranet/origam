import { expect, test } from '@playwright/test'

test('inspect iframe with even longer wait', async ({ page }) => {
    await page.goto('/stories/story/components-stories-scratchverticalaudit-scratchverticalaudit-story-vue', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const frameHandle = await page.$('iframe[src*="__sandbox"]')
    const frame = await frameHandle?.contentFrame()
    if (frame) {
        for (let i = 0; i < 6; i++) {
            await page.waitForTimeout(2000)
            const app = await frame.locator('#app').innerHTML().catch(e => 'ERR:' + e.message)
            console.log(`ITER ${i} LEN=${app.length}`)
        }
        const app = await frame.locator('#app').innerHTML()
        console.log('FINAL=' + app.slice(0, 3000))
    } else {
        console.log('NO_FRAME')
    }
})
