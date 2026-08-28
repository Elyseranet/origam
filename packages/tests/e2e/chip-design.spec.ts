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
 *
 * The `withDefaults` fallback is still `size: SIZES.DEFAULT` (32px), but
 * that value is only ever seen by a consumer who opts out of the shipped
 * baseline theme. `createOrigam()` — used unconditionally by every
 * consumer, including this Histoire sandbox (`histoire.setup.ts`) — always
 * layers the root-scoped `origam` identity theme (ADR-004/005,
 * `packages/ds/src/themes/origam.theme.ts`) on top, which sets
 * `'origam-chip': { size: 'small', variant: 'outlined', color: 'primary',
 * pill: true, border: true, borderColor: '...' }`. That theme block is
 * resolved onto every instance's props by the global props resolver
 * (`installThemePropsResolver`), so it wins over `withDefaults` for any
 * app built with `createOrigam()` — the actual, current default chip is
 * 26 px tall (24px box + 1px border each side), 10 px horizontal padding,
 * 12 px font, pill + outlined + primary. See CLAUDE.md ADR-005 section
 * ("How theme.components props actually resolve").
 */

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto('/stories/story/components-stories-chip-origamchip-story-vue')
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

test('OrigamChip default (origam baseline theme): 26px height, 10px padding, 12px font, --size-small class', async ({ page }) => {
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

    expect(m.classes).toContain('origam-chip--size-small')
    expect(m.classes).toContain('origam-chip--pill')
    expect(m.classes).toContain('origam-chip--border')
    expect(m.height).toBe(26)
    expect(m.paddingLeft).toBe(10)
    expect(m.paddingRight).toBe(10)
    expect(m.fontSize).toBe(12)
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
