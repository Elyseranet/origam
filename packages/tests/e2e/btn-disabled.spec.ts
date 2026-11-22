import { expect, test, type Page } from '@playwright/test'

/**
 * #1097 — `disabled` reads the disabled tokens and shows `not-allowed`.
 *
 * Real browser: jsdom does not resolve `var()` (CLAUDE.md). The disabled matrix
 * lives in the "State" Variant (index 1) of the Btn story, one button per look.
 * Tokens (light): `--origam-btn---background-color-disabled` = neutral-200
 * (230), `--origam-btn---color-disabled` = neutral-400 (163).
 */
const STORY_ID = 'components-stories-btn-origambtn-story-vue'
const URL = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-1`
const LOOKS = ['text', 'flat', 'elevated', 'tonal', 'outlined', 'plain', 'ghost', 'primary'] as const
const FILLED = ['flat', 'elevated', 'primary'] as const
const FG = 'rgb(163, 163, 163)'

const btn = (page: Page, look: string) =>
    page.frameLocator('iframe[src*="__sandbox"]').locator(`[data-cy="btn-disabled-${look}"]`)

const read = (page: Page, look: string, prop: 'backgroundColor' | 'color' | 'opacity' | 'cursor' | 'pointerEvents') =>
    btn(page, look).evaluate((el, p) => getComputedStyle(el)[p as 'color'], prop)

test.describe('OrigamBtn disabled (#1097)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL)
        await expect(btn(page, 'flat')).toBeVisible()
        // the surface transitions (280 ms): wait for the colour to settle
        await expect.poll(() => read(page, 'flat', 'color')).toBe(FG)
    })

    for (const look of LOOKS) {
        test(`${look} : not-allowed cursor, events kept, 50 % veil, disabled foreground`, async ({ page }) => {
            expect(await read(page, look, 'cursor')).toBe('not-allowed')
            expect(await read(page, look, 'pointerEvents')).not.toBe('none')
            expect(await read(page, look, 'opacity')).toBe('0.5')
            expect(await read(page, look, 'color')).toBe(FG)
        })
    }

    for (const look of FILLED) {
        test(`${look} : the fill is the disabled token, not the brand colour`, async ({ page }) => {
            expect(await read(page, look, 'backgroundColor')).toBe('rgb(230, 230, 230)')
        })
    }

    test('see-through looks stay see-through', async ({ page }) => {
        for (const look of ['text', 'outlined', 'plain']) {
            expect(await read(page, look, 'backgroundColor')).toBe('rgba(0, 0, 0, 0)')
        }
    })

    test('hover changes nothing on a disabled plain / ghost button', async ({ page }) => {
        for (const look of ['plain', 'ghost']) {
            const before = await read(page, look, 'backgroundColor')
            await btn(page, look).hover()
            // two steps: let style recalculation and the 280 ms transition land
            await page.waitForTimeout(450)
            expect(await read(page, look, 'opacity')).toBe('0.5')
            expect(await read(page, look, 'backgroundColor')).toBe(before)
        }
    })
})
