import { expect, test, type Page } from '@playwright/test'

/**
 * Regression — `OrigamChip` default rendering must match the design
 * baseline (mirrors Vuetify's `v-chip`). Pre-fix the chip rendered
 * 18 px tall with 0 padding because:
 *   • `withDefaults` had no `size: SIZES.DEFAULT`, so `useSize` emitted
 *     no `--size-*` class at all.
 *   • The size variant rules only set `padding` + `font-size` (via a
 *     dead-end CSS-var indirection); they never declared `height` or
 *     `line-height`.
 * Default chip now: 32 px tall, 12 px horizontal padding, 14 px font.
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto('/stories/story/components-stories-chip-origamchip-story-vue')
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

test('OrigamChip default: 32px height, 12px padding, 14px font, --size-default class', async ({ page }) => {
    await openVariant(page, 'Default')
    const sandbox = sandboxOf(page)
    const chip = sandbox.locator('.origam-chip').first()
    await expect(chip).toBeVisible({ timeout: 8000 })

    const m = await chip.evaluate(el => {
        const cs = getComputedStyle(el)
        const box = el.getBoundingClientRect()
        return {
            height: box.height,
            paddingLeft: parseFloat(cs.paddingLeft),
            paddingRight: parseFloat(cs.paddingRight),
            fontSize: parseFloat(cs.fontSize),
            classes: el.className
        }
    })

    expect(m.classes).toContain('origam-chip--size-default')
    expect(m.height).toBe(32)
    expect(m.paddingLeft).toBe(12)
    expect(m.paddingRight).toBe(12)
    expect(m.fontSize).toBe(14)
})

test('OrigamChip size scale: x-small < small < default < large < x-large in height', async ({ page }) => {
    await openVariant(page, 'Default')
    const sandbox = sandboxOf(page)
    const chip = sandbox.locator('.origam-chip').first()
    await expect(chip).toBeVisible({ timeout: 8000 })

    const heights: Record<string, number> = {}
    for (const size of ['x-small', 'small', 'default', 'large', 'x-large']) {
        await chip.evaluate((el, s) => {
            el.classList.remove(
                'origam-chip--size-x-small',
                'origam-chip--size-small',
                'origam-chip--size-default',
                'origam-chip--size-large',
                'origam-chip--size-x-large'
            )
            el.classList.add(`origam-chip--size-${s}`)
        }, size)
        await page.waitForTimeout(80)
        heights[size] = (await chip.boundingBox())!.height
    }

    expect(heights['x-small']).toBeLessThan(heights['small'])
    expect(heights['small']).toBeLessThan(heights['default'])
    expect(heights['default']).toBeLessThan(heights['large'])
    expect(heights['large']).toBeLessThan(heights['x-large'])
})
