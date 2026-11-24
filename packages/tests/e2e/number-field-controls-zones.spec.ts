import { expect, test } from '@playwright/test'
import type { Locator } from '@playwright/test'
import { toggleHstCheckbox } from './_support/histoire-controls'

/**
 * #1448 — toggling `hideControls` AFTER the first render must remove the empty
 * `.origam-field__prepend-inner` zone (no remount). #1449 — without `split` and
 * without `hideControls`, no empty controls `div` / prepend-inner zone is rendered.
 * Functional variant (index 1) of the NumberField story.
 */
const STORY_ID = 'components-stories-numberfield-origamnumberfield-story-vue'
const url = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-1`

const measure = (root: Locator) => root.evaluate((el) => ({
    prependZones: el.querySelectorAll('.origam-field__prepend-inner').length,
    prependedClass: el.querySelector('.origam-field')?.classList.contains('origam-field--prepended') ?? false,
    emptyControls: [...el.querySelectorAll('.origam-number-field__control')].filter((c) => c.children.length === 0).length,
    textLeft: Math.round((el.querySelector('input')?.getBoundingClientRect().left ?? 0) - el.getBoundingClientRect().left)
}))

test.describe('OrigamNumberField — controls zones (#1448 #1449)', () => {
    test.setTimeout(60000)

    test('hideControls toggled at runtime removes the prepend-inner zone (#1448)', async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        const root = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-number-field').first()
        await expect(root).toBeVisible({ timeout: 12000 })
        await toggleHstCheckbox(page, 'Split')
        await expect.poll(async () => (await measure(root)).prependZones, { timeout: 8000 }).toBe(1)
        await toggleHstCheckbox(page, 'Hide Controls')
        await expect.poll(async () => (await measure(root)).prependZones, { timeout: 8000 }).toBe(0)
        expect((await measure(root)).prependedClass).toBe(false)
        await toggleHstCheckbox(page, 'Hide Controls')
        await expect.poll(async () => (await measure(root)).prependZones, { timeout: 8000 }).toBe(1)
    })

    test('no empty controls div without split (#1449)', async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        const root = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-number-field').first()
        await expect(root).toBeVisible({ timeout: 12000 })
        const m = await measure(root)
        expect(m.emptyControls).toBe(0)
        expect(m.prependZones).toBe(0)
        // same start as with `hideControls` (16px, a plain field's padding) — was 12px with the empty zone
        expect(m.textLeft).toBe(16)
    })
})
