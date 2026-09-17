import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { eventLogItems, openEventsTab, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * #812 — `OrigamRatingField` is operable from the keyboard, and the focus it
 * moves is VISIBLE.
 *
 * ## What was measured BEFORE (Chromium, built Histoire, `E2E_STATIC=1`)
 *
 * ```
 * 8 x Tab                        -> document.activeElement stays BODY, every time
 * Arrow{Right,Left,Up,Down}      -> checked stays 3, activeElement stays BODY
 * Home / End / Space / Enter     -> checked stays 3, activeElement stays BODY
 * ```
 *
 * ## ⛔ Why this file does not assert on attributes
 *
 * #810, #786 and #614 all paid for the same mistake: a handler was wired, a
 * `tabindex` was present, the review stopped there, and the key still did
 * nothing. Every assertion below PRESSES the key and reads what moved —
 * `document.activeElement`, `:checked`, the rendered star fill, the emitted
 * event. Not one of them looks at a `@keydown` binding.
 *
 * ## ⛔ And not on `outlineWidth` alone either
 *
 * Measured while building this fix, on `halfIncrements`:
 * `getComputedStyle(item).outlineWidth` read `2px` while the screenshot showed
 * NOTHING — the `clip-path` that carves the half-star clipped the ring away
 * entirely. A computed style is not a pixel. `focusRingIsPainted` below
 * therefore photographs the row focused and unfocused and requires the two
 * images to differ.
 *
 * ## Positive control — REQUIRED
 *
 * `OrigamRadio` is driven by the same keys, is untouched by this change, and
 * is exercised by the same probe in `positive control` below. Without that
 * witness, "the key acts" and "my probe reads nothing" are indistinguishable —
 * which is exactly how #810 concluded, correctly, that it could not tell.
 *
 * ## NOT verified here
 *
 * Firefox / WebKit (everything below is Chromium) · a real screen reader ·
 * the `#item` slot override, where a consumer replaces the star entirely (the
 * ring is painted on `.origam-rating-field-item`, which the slot does not
 * remove, but no consumer markup was exercised) · touch / mobile a11y.
 */

const RF_ID = 'components-stories-ratingfield-origamratingfield-story-vue'
const rfUrl = (idx: number) => `/stories/story/${RF_ID}?variantId=${RF_ID}-${idx}`

/** Variant 1 = "Functional" — label 'Rating', model starts at 3, and carries
 *  the Half Increments / Readonly / Disabled / Clearable controls. */
const VARIANT_FUNCTIONAL = 1
/** Variant 11 = "Default" playground — label 'Rating', modelValue 3, and the
 *  only one wiring `@update:model-value="logEvent(…)"`. */
const VARIANT_DEFAULT = 11

const R_ID = 'components-stories-radio-origamradio-story-vue'
const rUrl = (idx: number) => `/stories/story/${R_ID}?variantId=${R_ID}-${idx}`

interface IKeyboardState {
    /** `radio[<value>]` when a rating radio holds focus, else TAG.class. */
    active: string
    /** Value of the checked radio in the group, or `none`. */
    checked: string
    /** Computed `outline-width` of the star cell owning the focused radio. */
    outline: string
    /** Computed `outline-style` of that same cell. */
    outlineStyle: string
    /** Computed `outline-color` of that same cell. */
    outlineColor: string
    /** Number of FILLED stars actually rendered — this follows the MODEL,
     *  not the DOM `:checked` the browser flips on its own. */
    filled: number
}

const readState = (page: Page): Promise<IKeyboardState> => page.evaluate(() => {
    const d = (document.querySelector('iframe[src*="__sandbox"]') as HTMLIFrameElement).contentDocument!
    const a = d.activeElement as HTMLElement | null
    const checked = d.querySelector('.origam-rating-field input[type="radio"]:checked') as HTMLInputElement | null

    let active = 'null'
    let outline = '-'
    let outlineStyle = '-'
    let outlineColor = '-'

    if (a) {
        const isRatingRadio = a.tagName === 'INPUT' && (a as HTMLInputElement).type === 'radio' && !!a.closest('.origam-rating-field')
        active = isRatingRadio ? 'radio[' + (a as HTMLInputElement).value + ']' : a.tagName + '.' + String(a.className || '').split(' ')[0]

        const cell = a.closest('.origam-rating-field-item') as HTMLElement | null

        if (cell) {
            const cs = d.defaultView!.getComputedStyle(cell)

            outline = cs.outlineWidth
            outlineStyle = cs.outlineStyle
            outlineColor = cs.outlineColor
        }
    }

    return {
        active,
        checked: checked ? checked.value : 'none',
        outline,
        outlineStyle,
        outlineColor,
        filled: d.querySelectorAll('.origam-rating-field .origam-icon.mdi-star').length
    }
})

/** Puts the caret inside the sandbox document so the next `Tab` starts from
 *  its `<body>` rather than from Histoire's own chrome. */
const enterSandbox = async (page: Page) => {
    await page.frameLocator('iframe[src*="__sandbox"]').locator('body').click({ position: { x: 2, y: 2 } })
}

/**
 * Photographs the star row (padded, so a ring drawn OUTSIDE the element stays
 * in frame) with the given radio focused and with nothing focused, and returns
 * whether the two images differ.
 *
 * This is the assertion that a computed `outline-width` cannot make: on the
 * half-step items a `clip-path` removed every ring pixel while the computed
 * style still said `2px`.
 */
const focusRingIsPainted = async (page: Page, radioValue: string): Promise<boolean> => {
    const root = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field').first()
    const box = await root.boundingBox()

    if (!box) throw new Error('rating field has no box')

    const clip = { x: box.x - 14, y: box.y - 14, width: box.width + 28, height: box.height + 28 }

    await root.evaluate((el) => (el.ownerDocument!.activeElement as HTMLElement | null)?.blur())
    await page.waitForTimeout(200)

    const blurred = await page.screenshot({ clip })

    await root.evaluate((el, value) => (el.querySelector(`input[type="radio"][value="${value}"]`) as HTMLInputElement).focus(), radioValue)
    await page.waitForTimeout(200)

    const focused = await page.screenshot({ clip })

    return !focused.equals(blurred)
}

test.describe('OrigamRatingField — keyboard operability (#812)', () => {
    test.setTimeout(60000)

    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1600, height: 1000 })
    })

    // ------------------------------------------------------------------ //
    // POSITIVE CONTROL                                                     //
    // ------------------------------------------------------------------ //

    test('positive control — OrigamRadio answers Tab and Space, before and after', async ({ page }) => {
        await page.goto(rUrl(0))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        await expect(sandbox.locator('.origam-radio').first()).toBeVisible({ timeout: 30000 })
        await enterSandbox(page)
        await page.keyboard.press('Tab')

        const focusedIsTheRadio = await page.evaluate(() => {
            const d = (document.querySelector('iframe[src*="__sandbox"]') as HTMLIFrameElement).contentDocument!
            const a = d.activeElement as HTMLInputElement | null

            return !!a && a.tagName === 'INPUT' && a.type === 'radio'
        })

        expect(focusedIsTheRadio, 'Tab must reach OrigamRadio — if this fails the probe is broken, not OrigamRatingField').toBe(true)

        await page.keyboard.press('Space')
        await expect(sandbox.locator('input[type="radio"]').first()).toBeChecked()
    })

    // ------------------------------------------------------------------ //
    // TAB                                                                  //
    // ------------------------------------------------------------------ //

    test('Tab reaches the group — exactly one stop for the whole rating', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_FUNCTIONAL))
        await expect(page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field').first()).toBeVisible({ timeout: 30000 })
        await enterSandbox(page)

        await page.keyboard.press('Tab')
        expect((await readState(page)).active).toBe('radio[3]')

        // Roving tabindex: the SECOND Tab must leave the group entirely, not
        // walk star by star.
        await page.keyboard.press('Tab')
        expect((await readState(page)).active).not.toMatch(/^radio\[/)
    })

    test('the phantom value=0 radio is gone — it was reachable by arrow and invisible', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_FUNCTIONAL))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        await expect(sandbox.locator('.origam-rating-field').first()).toBeVisible({ timeout: 30000 })
        await expect(sandbox.locator('.origam-rating-field input[type="radio"]')).toHaveCount(5)
    })

    // ------------------------------------------------------------------ //
    // FOCUS VISIBLE — WCAG 2.4.7                                           //
    // ------------------------------------------------------------------ //

    test('the focused star is visibly outlined — computed AND photographed', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_FUNCTIONAL))
        await expect(page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field').first()).toBeVisible({ timeout: 30000 })
        await enterSandbox(page)
        await page.keyboard.press('Tab')

        const state = await readState(page)

        expect(state.active).toBe('radio[3]')
        expect(state.outlineStyle).toBe('solid')
        expect(Number.parseFloat(state.outline)).toBeGreaterThan(0)
        // A fully transparent ring computes a non-zero width and paints nothing.
        expect(state.outlineColor).not.toMatch(/rgba\([^)]*,\s*0\)$/)

        expect(await focusRingIsPainted(page, '3'), 'focusing a star must change the pixels of the row').toBe(true)
    })

    // ------------------------------------------------------------------ //
    // ARROWS                                                               //
    // ------------------------------------------------------------------ //

    test('ArrowRight / ArrowDown move the focus AND the selection, and wrap', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_FUNCTIONAL))
        await expect(page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field').first()).toBeVisible({ timeout: 30000 })
        await enterSandbox(page)
        await page.keyboard.press('Tab')

        await page.keyboard.press('ArrowRight')
        expect(await readState(page)).toMatchObject({ active: 'radio[4]', checked: '4' })

        await page.keyboard.press('ArrowDown')
        expect(await readState(page)).toMatchObject({ active: 'radio[5]', checked: '5' })

        await page.keyboard.press('ArrowRight')
        expect(await readState(page)).toMatchObject({ active: 'radio[1]', checked: '1' })
    })

    test('ArrowLeft / ArrowUp move the focus AND the selection, and wrap', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_FUNCTIONAL))
        await expect(page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field').first()).toBeVisible({ timeout: 30000 })
        await enterSandbox(page)
        await page.keyboard.press('Tab')

        await page.keyboard.press('ArrowLeft')
        expect(await readState(page)).toMatchObject({ active: 'radio[2]', checked: '2' })

        await page.keyboard.press('ArrowUp')
        expect(await readState(page)).toMatchObject({ active: 'radio[1]', checked: '1' })

        await page.keyboard.press('ArrowLeft')
        expect(await readState(page)).toMatchObject({ active: 'radio[5]', checked: '5' })
    })

    test('the MODEL follows the arrows — the rendered fill moves, not just :checked', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_FUNCTIONAL))
        await expect(page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field').first()).toBeVisible({ timeout: 30000 })
        await enterSandbox(page)
        await page.keyboard.press('Tab')

        expect((await readState(page)).filled).toBe(3)

        await page.keyboard.press('ArrowRight')
        await expect.poll(async () => (await readState(page)).filled).toBe(4)

        await page.keyboard.press('ArrowLeft')
        await page.keyboard.press('ArrowLeft')
        await expect.poll(async () => (await readState(page)).filled).toBe(2)
    })

    test('the arrows emit update:modelValue', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_DEFAULT))
        await expect(page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field').first()).toBeVisible({ timeout: 30000 })
        await openEventsTab(page)
        await enterSandbox(page)
        await page.keyboard.press('Tab')
        await page.keyboard.press('ArrowRight')

        await expect.poll(async () => eventLogItems(page).count(), { timeout: 10000 }).toBeGreaterThan(0)
        await expect(eventLogItems(page).first()).toContainText('update:modelValue')
    })

    // ------------------------------------------------------------------ //
    // HOME / END — the platform does NOT provide these                     //
    // ------------------------------------------------------------------ //

    test('Home goes to the first star, End to the last — focus AND selection', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_FUNCTIONAL))
        await expect(page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field').first()).toBeVisible({ timeout: 30000 })
        await enterSandbox(page)
        await page.keyboard.press('Tab')

        await page.keyboard.press('Home')
        expect(await readState(page)).toMatchObject({ active: 'radio[1]', checked: '1' })
        await expect.poll(async () => (await readState(page)).filled).toBe(1)

        await page.keyboard.press('End')
        expect(await readState(page)).toMatchObject({ active: 'radio[5]', checked: '5' })
        await expect.poll(async () => (await readState(page)).filled).toBe(5)
    })

    // ------------------------------------------------------------------ //
    // SPACE / ENTER                                                        //
    // ------------------------------------------------------------------ //

    test('Space selects the focused star when it is not already selected', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_FUNCTIONAL))
        const root = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field').first()

        await expect(root).toBeVisible({ timeout: 30000 })

        // Focus a star that is NOT the checked one, without selecting it —
        // otherwise Space has nothing to change and the test proves nothing.
        await root.evaluate((el) => (el.querySelector('input[type="radio"][value="5"]') as HTMLInputElement).focus())
        expect(await readState(page)).toMatchObject({ active: 'radio[5]', checked: '3' })

        await page.keyboard.press('Space')
        expect(await readState(page)).toMatchObject({ active: 'radio[5]', checked: '5' })
        await expect.poll(async () => (await readState(page)).filled).toBe(5)
    })

    test('Enter is a no-op — the radiogroup pattern gives it no role', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_FUNCTIONAL))
        await expect(page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field').first()).toBeVisible({ timeout: 30000 })
        await enterSandbox(page)
        await page.keyboard.press('Tab')

        const before = await readState(page)

        await page.keyboard.press('Enter')
        expect(await readState(page)).toMatchObject({ active: before.active, checked: before.checked, filled: before.filled })
    })

    // ------------------------------------------------------------------ //
    // HALF INCREMENTS                                                      //
    // ------------------------------------------------------------------ //

    test('halfIncrements — the arrows step by 0.5 and the half ring is PAINTED', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_FUNCTIONAL))
        const root = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field').first()

        await expect(root).toBeVisible({ timeout: 30000 })
        await toggleHstCheckbox(page, 'Half Increments')
        await expect(page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field input[type="radio"]')).toHaveCount(10)

        await root.evaluate((el) => (el.querySelector('input[type="radio"][value="2.5"]') as HTMLInputElement).focus())
        expect((await readState(page)).active).toBe('radio[2.5]')

        await page.keyboard.press('ArrowRight')
        expect(await readState(page)).toMatchObject({ active: 'radio[3]', checked: '3' })

        await page.keyboard.press('ArrowLeft')
        expect(await readState(page)).toMatchObject({ active: 'radio[2.5]', checked: '2.5' })

        await page.keyboard.press('Home')
        expect(await readState(page)).toMatchObject({ active: 'radio[0.5]', checked: '0.5' })

        await page.keyboard.press('End')
        expect(await readState(page)).toMatchObject({ active: 'radio[5]', checked: '5' })

        // ⛔ The computed style lies here — see the file header. Only the
        // photograph decides.
        expect(await focusRingIsPainted(page, '2.5'), 'the half-step ring must survive the clip-path that carves the half star').toBe(true)
    })

    // ------------------------------------------------------------------ //
    // READONLY / DISABLED — the two points #812 listed as NOT measured     //
    // ------------------------------------------------------------------ //

    test('readonly — the group stays reachable and focus-visible, and every key is inert', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_FUNCTIONAL))
        const root = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field').first()

        await expect(root).toBeVisible({ timeout: 30000 })
        await toggleHstCheckbox(page, 'Readonly')
        await expect(root).toHaveClass(/origam-rating-field--readonly/)
        await expect(root).toHaveAttribute('aria-readonly', 'true')

        await enterSandbox(page)
        await page.keyboard.press('Tab')

        const entered = await readState(page)

        expect(entered.active).toMatch(/^radio\[/)
        expect(Number.parseFloat(entered.outline)).toBeGreaterThan(0)

        for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Space']) {
            await page.keyboard.press(key)
            expect(await readState(page), `${key} must not move anything while readonly`)
                .toMatchObject({ active: entered.active, checked: entered.checked, filled: entered.filled })
        }
    })

    // ------------------------------------------------------------------ //
    // AXE — the a11y gate does NOT cover this component                    //
    // ------------------------------------------------------------------ //

    /**
     * ⛔ `a11y/components.spec.ts` sweeps 36 of 218 stories, and BOTH RatingField
     * stories sit in its `UNSWEPT_STORIES` list. Its green says nothing here, so
     * axe is run directly — exactly as #810 had to.
     *
     * This assertion is not decorative: the first version of this fix mirrored
     * `aria-readonly` onto each `<input type="radio">`, and axe reported a
     * **critical** `aria-allowed-attr` — `aria-readonly` is not an allowed
     * attribute on `role="radio"`. It is allowed on the `radiogroup` root, which
     * is where it lives now. Without this test the fix would have shipped one
     * WCAG failure traded for another, which is the precise mistake #810 and
     * #812 both exist to refuse.
     *
     * The four violations axe always reports on a Histoire page — `frame-title`,
     * `landmark-one-main`, `page-has-heading-one`, `region` — belong to the
     * harness, not to the component, so the filter below keeps only violations
     * that actually touch `origam-` markup.
     */
    for (const state of [null, 'Readonly', 'Disabled', 'Half Increments'] as (string | null)[]) {
        test(`axe reports nothing on the component itself — ${state ?? 'default'}`, async ({ page }) => {
            await page.goto(rfUrl(VARIANT_FUNCTIONAL))
            const frame = page.frameLocator('iframe[src*="__sandbox"]')

            await expect(frame.locator('.origam-rating-field').first()).toBeVisible({ timeout: 30000 })

            if (state) {
                await toggleHstCheckbox(page, state)
                await page.waitForTimeout(400)
            }

            const result = await new AxeBuilder({ page }).include('iframe[src*="__sandbox"]').analyze()
            const ours = result.violations.filter((v) => v.nodes.some((n) => n.html.includes('origam-') || n.target.join(' ').includes('origam')))

            expect(
                ours.map((v) => `${v.id} (${v.impact}) ${v.nodes[0]?.target.join(' ')}`),
                'axe violation attributable to OrigamRatingField markup'
            ).toEqual([])
        })
    }

    test('disabled — the group is out of the tab order (native, no code of ours)', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_FUNCTIONAL))

        await expect(page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field').first()).toBeVisible({ timeout: 30000 })
        await toggleHstCheckbox(page, 'Disabled')
        await expect(page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-rating-field input[type="radio"]').first()).toBeDisabled()

        await enterSandbox(page)

        for (let i = 0; i < 3; i++) {
            await page.keyboard.press('Tab')
            expect((await readState(page)).active).not.toMatch(/^radio\[/)
        }
    })
})
