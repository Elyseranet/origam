import { expect, test } from '@playwright/test'
import { selectHstOption } from './_support/histoire-controls'

// #1129 — `appearance: slider-vertical` est non standard (warning Chromium a chaque page).
// Remplace par `writing-mode: vertical-lr` + `direction: rtl` : on verifie que le rendu
// vertical, le sens des valeurs (haut = max) et le clavier restent identiques.
const STORY_ID = 'components-stories-sliderfield-origamsliderfield-story-vue'
const URL_DESIGN = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-0`

test.describe('OrigamSliderField vertical (#1129)', () => {
    test.setTimeout(60000)

    test('aucun warning Chromium sur `slider-vertical`', async ({ page }) => {
        const warnings: string[] = []
        page.on('console', m => { if (m.text().includes('slider-vertical')) warnings.push(m.text()) })
        await page.goto(URL_DESIGN, { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('.origam-slider-field').first()
        await expect(root).toBeVisible({ timeout: 12000 })
        await selectHstOption(page, 'Direction', 'Vertical')
        await expect(root).toHaveClass(/origam-slider-field--vertical/)
        await page.waitForTimeout(500)
        expect(warnings).toEqual([])
    })

    test('vertical : orientation, haut = max, fleches haut/bas', async ({ page }) => {
        await page.goto(URL_DESIGN, { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('.origam-slider-field').first()
        await expect(root).toBeVisible({ timeout: 12000 })
        await selectHstOption(page, 'Direction', 'Vertical')
        await expect(root).toHaveClass(/origam-slider-field--vertical/)
        const input = root.locator('input[type=range]').first()
        const box = await input.boundingBox()
        expect(box!.height).toBeGreaterThan(box!.width)
        const min = Number(await input.getAttribute('min') ?? 0)
        const max = Number(await input.getAttribute('max') ?? 100)
        // clic en haut du rail => valeur proche du max ; en bas => proche du min
        await page.mouse.click(box!.x + box!.width / 2, box!.y + 3)
        expect(Number(await input.inputValue())).toBeGreaterThan(min + (max - min) * 0.9)
        await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height - 3)
        expect(Number(await input.inputValue())).toBeLessThan(min + (max - min) * 0.1)
        // le thumb visuel suit la valeur : valeur min => thumb en bas du rail
        const thumbY = await root.locator('.origam-slider-field__thumb').first().evaluate(t => t.getBoundingClientRect().y)
        const inputY = await input.evaluate(i => i.getBoundingClientRect().y + i.getBoundingClientRect().height / 2)
        expect(thumbY).toBeGreaterThan(inputY)
        // clavier
        await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)
        await input.focus()
        const before = Number(await input.inputValue())
        await page.keyboard.press('ArrowUp')
        expect(Number(await input.inputValue())).toBeGreaterThan(before)
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        expect(Number(await input.inputValue())).toBeLessThan(before)
    })
})
