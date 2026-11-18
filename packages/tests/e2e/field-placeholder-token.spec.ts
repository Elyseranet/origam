import { expect, test, type Page } from '@playwright/test'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')
const SLUG = 'components-stories-textfield-origamtextfield-story-vue'

const open = async (page: Page) => {
    await page.goto(`/stories/story/${SLUG}?variantId=${SLUG}-0`, { waitUntil: 'domcontentloaded' })
}

const readPlaceholder = (page: Page) =>
    sandboxOf(page).locator('.origam-field__input input').first().evaluate(el => {
        el.setAttribute('placeholder', 'x') // pseudo only exists with a placeholder
        const s = getComputedStyle(el, '::placeholder')
        return { color: s.color, opacity: s.opacity, text: getComputedStyle(el).color }
    })

test('Field placeholder - default is unchanged (currentColor at 50 %)', async ({ page }) => {
    await open(page)
    await expect(sandboxOf(page).locator('.origam-field').first()).toBeVisible({ timeout: 8000 })
    const r = await readPlaceholder(page)
    expect(r.color).toBe(r.text)
    expect(r.opacity).toBe('0.5')
})

test('Field placeholder - placeholder-color / placeholder-opacity tokens drive ::placeholder', async ({ page }) => {
    await page.addInitScript(() => {
        const inject = () => {
            const s = document.createElement('style')
            s.textContent = ':root:root{--origam-field---placeholder-color:rgb(1,2,3);--origam-field---placeholder-opacity:1}'
            document.head.appendChild(s)
        }
        if (document.head) inject()
        else document.addEventListener('DOMContentLoaded', inject, { once: true })
    })
    await open(page)
    await expect(sandboxOf(page).locator('.origam-field').first()).toBeVisible({ timeout: 8000 })
    const r = await readPlaceholder(page)
    expect(r.color).toBe('rgb(1, 2, 3)')
    expect(r.opacity).toBe('1')
})
