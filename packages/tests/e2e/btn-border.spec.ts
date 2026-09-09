import { expect, test } from '@playwright/test'

/**
 * #391 — the `border` prop on an ISOLATED `OrigamBtn`.
 *
 * Measured in a REAL browser only. `getComputedStyle` under jsdom never
 * resolves `var()` and fabricates a `16px` default, so a Vitest assertion
 * on `border-*-width` here would be structurally blind (see CLAUDE.md,
 * "`getComputedStyle` under jsdom NEVER resolves `var()`").
 *
 * Variant index 15 = "Prop — border (VRT matrix)" — a STATIC matrix, so
 * every case goes through the component's own prop path (`useBorder` →
 * classes + inline styles → scoped SCSS), not through a DOM mutation the
 * `alert.spec.ts` pattern would let Vue re-patch under the assertion.
 */

const STORY_ID = 'components-stories-btn-origambtn-story-vue'
const STORY_PATH = `/stories/story/${STORY_ID}`
const BORDER_MATRIX_URL = `${STORY_PATH}?variantId=${STORY_ID}-13`

type TBorderWidths = { top: string, right: string, bottom: string, left: string, style: string }

test.describe('OrigamBtn — border prop (#391)', () => {
    test('every border form paints a real, distinct border', async ({ page }) => {
        await page.goto(BORDER_MATRIX_URL, { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="btn-border-matrix"]')).toBeVisible()

        const read = async (cy: string): Promise<TBorderWidths> =>
            sandbox.locator(`[data-cy="${cy}"]`).evaluate((el) => {
                const cs = getComputedStyle(el)

                return {
                    top: cs.borderTopWidth,
                    right: cs.borderRightWidth,
                    bottom: cs.borderBottomWidth,
                    left: cs.borderLeftWidth,
                    style: cs.borderTopStyle
                }
            })

        const px = (v: string) => Number.parseFloat(v) || 0

        const unset = await read('btn-border-unset')
        const none = await read('btn-border-none')
        const bool = await read('btn-border-bool')
        const thin = await read('btn-border-thin')
        const thick = await read('btn-border-thick')
        const top = await read('btn-border-top')
        const bottom = await read('btn-border-bottom')
        const four = await read('btn-border-four')
        const str = await read('btn-border-string')

        // Diagnostic — printed on failure so the report carries real numbers.
         
        console.log(JSON.stringify({ unset, none, bool, thin, thick, top, bottom, four, str }, null, 2))

        // Negative control: no `border` prop => nothing painted.
        expect(px(unset.top), 'no border prop must paint nothing').toBe(0)

        // `border="none"` is an explicit opt-OUT. It used to paint 1px:
        // the string is truthy, so `useBorder` emitted `${name}--border`
        // (= the `thin` default) and the `.origam--border-none` utility
        // that should have cancelled it lost the cascade.
        expect(px(none.top), 'border="none" must paint nothing').toBe(0)

        // Boolean opt-in must paint on all four sides.
        expect(px(bool.top), 'border (boolean) top').toBeGreaterThan(0)
        expect(px(bool.right), 'border (boolean) right').toBeGreaterThan(0)
        expect(px(bool.bottom), 'border (boolean) bottom').toBeGreaterThan(0)
        expect(px(bool.left), 'border (boolean) left').toBeGreaterThan(0)

        // Width keywords must paint, and `thick` must be strictly thicker.
        expect(px(thin.top), 'border="thin" top').toBeGreaterThan(0)
        expect(px(thick.top), 'border="thick" top').toBeGreaterThan(0)
        expect(px(thick.top), 'thick must be strictly thicker than thin').toBeGreaterThan(px(thin.top))

        // Direction keywords must paint ONLY their own side.
        expect(px(top.top), 'border="top" top').toBeGreaterThan(0)
        expect(px(top.right), 'border="top" must not paint right').toBe(0)
        expect(px(top.bottom), 'border="top" must not paint bottom').toBe(0)
        expect(px(top.left), 'border="top" must not paint left').toBe(0)

        expect(px(bottom.bottom), 'border="bottom" bottom').toBeGreaterThan(0)
        expect(px(bottom.top), 'border="bottom" must not paint top').toBe(0)

        // Numeric width (the case that already worked — regression guard).
        expect(px(four.top), ':border="4" top').toBe(4)

        // Free-form string keeps its declared style.
        expect(px(str.top), 'border="2px dashed" top').toBe(2)
        expect(str.style, 'border="2px dashed" style').toBe('dashed')
    })

    test('keyword and direction values emit no junk inline declarations', async ({ page }) => {
        await page.goto(BORDER_MATRIX_URL, { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="btn-border-matrix"]')).toBeVisible()

        // BORDER_REGEX's <color> alternative ends in a bare `[A-Za-z]+`, so
        // it matched the class-channel keywords AS a colour: the live style
        // attribute carried `border-color: top` and an empty `border-width:`.
        for (const cy of ['btn-border-thick', 'btn-border-top', 'btn-border-none']) {
            const style = await sandbox.locator(`[data-cy="${cy}"]`).getAttribute('style')

            expect(style ?? '', `${cy} must not carry a keyword as a colour`).not.toMatch(/border-color:\s*(none|thin|thick|top|right|bottom|left)\b/)
            expect(style ?? '', `${cy} must not carry an empty border-width`).not.toMatch(/border-width:\s*(;|$)/)
        }
    })
})

test.describe('OrigamBtn — aria-busy while loading', () => {
    // The doc claimed `aria-busy` since the component shipped; the attribute
    // was emitted nowhere in the template. Variant 4 = "Prop — loading
    // (interactive)".
    const LOADING_URL = `${STORY_PATH}?variantId=${STORY_ID}-4`

    test('exposes aria-busy only while a loader is active', async ({ page }) => {
        await page.goto(LOADING_URL, { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const btn = sandbox.locator('.origam-btn').first()
        await expect(btn).toBeVisible()

        const state = await btn.evaluate((el) => ({
            busy: el.getAttribute('aria-busy'),
            loading: el.className.includes('loading') || !!el.querySelector('.origam-btn__progress, .origam-btn__loader .origam-skeleton')
        }))

         
        console.log('aria-busy state:', JSON.stringify(state))

        if (state.loading) {
            expect(state.busy, 'a loading btn must expose aria-busy="true"').toBe('true')
        } else {
            expect(state.busy, 'an idle btn must not expose aria-busy at all').toBeNull()
        }
    })
})
