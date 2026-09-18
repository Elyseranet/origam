import { expect, test } from '@playwright/test'

/**
 * #827 — `OrigamRatingField` under a CONTROLLED parent that REFUSES the
 * value: the DOM must show only what the model says, never what the
 * browser did on its own.
 *
 * ## The defect (measured, Chromium, built Histoire, `E2E_STATIC=1`, port
 * isolated, `develop` @ `b13647589`, before this fix)
 *
 * A parent binding `v-bind="state"` and `@update:model-value="…"` WITHOUT
 * `state.modelValue = $event` never writes the new value back — the exact
 * shape of the Histoire "Default" playground Variant (index 11 below), and
 * of any real consumer validating a rating before accepting it. Clicking
 * star 1 while the model held 3:
 *
 * ```
 * BEFORE click   { domChecked: '3', filledStars: 3 }
 * AFTER  click   { domChecked: '1', filledStars: 3 }   -- DOM lied
 * ```
 *
 * `filledStars` (the number of `.origam-icon.mdi-star` actually rendered)
 * tracks the MODEL — it stayed 3, correctly. `domChecked` (the radio the
 * browser marked `:checked`) moved to 1 regardless of the parent's refusal.
 * Worse than a single wrong radio: because native radios sharing one `name`
 * un-check each other, the star that WAS correctly checked also went
 * `checked:false` in the same click, with no `change` event of its own to
 * hook — both radios in the group ended up wrong, not just the one clicked:
 *
 * ```
 * BEFORE  [{"value":"3","checked":true}]
 * AFTER   [{"value":"1","checked":true}, {"value":"3","checked":false}]
 * ```
 *
 * ## Why Vue's own diffing does not catch this
 *
 * `:checked="isChecked(range)"` is a plain prop binding. Vue only re-patches
 * a DOM prop whose COMPUTED VALUE differs from the previous render's vnode.
 * When the parent refuses the value, `isChecked(...)` returns the exact same
 * booleans it returned before the click, for every item — Vue sees no
 * change and never revisits `checked` on either radio, so the browser's own
 * mutation (native label click, or native arrow/Home/End radio-group
 * navigation) is left standing indefinitely. Native `v-model` on a radio
 * (`vModelRadio`) does not help here either: its own `beforeUpdate` guard is
 * `if (value !== oldValue)` — the same "nothing changed" case skips it too.
 * The fix (`resyncRadios` in `OrigamRatingField.vue`) force-reasserts every
 * radio's `.checked` against the model on `nextTick` after any `click` /
 * `change` reaches the group, regardless of whether the model actually
 * moved — the same code path runs whether the parent accepted or refused.
 *
 * ## Positive control — REQUIRED, see "ACCEPTING parent" below
 *
 * The "Functional" Variant (index 1) uses a real `v-model`, so the parent
 * DOES write the value back. Without asserting that this path still moves
 * the DOM, "the DOM stays because the fix works" and "the DOM stays because
 * the fix broke selection entirely" would be indistinguishable.
 *
 * ## A/B against the parent commit
 *
 * Re-run against `develop` @ `b13647589` (`OrigamRatingField.vue` without
 * `resyncRadios`): the "REFUSING parent" tests below fail exactly as the
 * measurements above show (`domChecked` moves, the un-clicked sibling's
 * `.checked` flips too). The "ACCEPTING parent" tests pass unchanged on
 * both commits — they are the witness, not the fix's target.
 *
 * ## NOT verified here
 *
 * Firefox / WebKit (Chromium only) · a parent that accepts the value
 * ASYNCHRONOUSLY (e.g. after a server round-trip) rather than never · the
 * exact number of other DS components sharing the same `:checked` /
 * `:value` pattern without native `v-model` (not measured, out of scope).
 */

const RF_ID = 'components-stories-ratingfield-origamratingfield-story-vue'
const rfUrl = (idx: number) => `/stories/story/${RF_ID}?variantId=${RF_ID}-${idx}`

/** Variant 1 = "Functional" — real `v-model`, the parent ACCEPTS every
 *  value the field emits. */
const VARIANT_FUNCTIONAL = 1
/** Variant 11 = "Default" playground — `v-bind="state"` with only
 *  `@update:model-value="logEvent(...)"`, no `state.modelValue = $event`.
 *  The parent REFUSES every value: it observes the emit and never writes
 *  it back. */
const VARIANT_DEFAULT = 11

test.describe('OrigamRatingField — controlled contract under refusal (#827)', () => {
    test.setTimeout(45000)

    const dump = (root: import('@playwright/test').Locator) => root.evaluate((el) => {
        const radios = Array.from(el.querySelectorAll('input[type="radio"]')) as HTMLInputElement[]
        return {
            radios: radios.map((r) => ({ value: r.value, checked: r.checked })),
            filledStars: el.querySelectorAll('.origam-icon.mdi-star').length
        }
    })

    test.describe('REFUSING parent (Default playground, v-bind="state")', () => {
        test('a mouse click on a star does not move the DOM — model and every radio stay put', async ({page}) => {
            await page.goto(rfUrl(VARIANT_DEFAULT))
            const frame = page.frameLocator('iframe[src*="__sandbox"]')
            const root = frame.locator('.origam-rating-field').first()
            await expect(root).toBeVisible({timeout: 30000})

            const before = await dump(root)
            expect(before.radios.find((r) => r.checked)?.value).toBe('3')
            expect(before.filledStars).toBe(3)

            await root.locator('.origam-rating-field-item .origam-btn').nth(0).click()
            await page.waitForTimeout(200)

            const after = await dump(root)
            expect(after).toEqual(before)
        })

        test('the previously-checked sibling is not left un-checked by the browser', async ({page}) => {
            await page.goto(rfUrl(VARIANT_DEFAULT))
            const frame = page.frameLocator('iframe[src*="__sandbox"]')
            const root = frame.locator('.origam-rating-field').first()
            await expect(root).toBeVisible({timeout: 30000})

            await root.locator('.origam-rating-field-item .origam-btn').nth(0).click()
            await page.waitForTimeout(200)

            const {radios} = await dump(root)
            expect(radios.find((r) => r.value === '3')?.checked).toBe(true)
            expect(radios.find((r) => r.value === '1')?.checked).toBe(false)
        })

        test('ArrowRight moves focus but not the checked radio, and the model does not move either', async ({page}) => {
            await page.goto(rfUrl(VARIANT_DEFAULT))
            const frame = page.frameLocator('iframe[src*="__sandbox"]')
            const root = frame.locator('.origam-rating-field').first()
            await expect(root).toBeVisible({timeout: 30000})

            await root.locator('input[type="radio"][value="3"]').focus()

            const before = await dump(root)

            await page.keyboard.press('ArrowRight')
            await page.waitForTimeout(200)

            const after = await dump(root)
            expect(after).toEqual(before)

            // Point #4 of the ticket: the focus is allowed to move even though the
            // selection is refused — that IS the correct end state (focus and
            // selection legitimately diverging), not a leftover bug.
            const focusedValue = await root.evaluate(
                (el) => (el.ownerDocument!.activeElement as HTMLInputElement | null)?.value ?? null
            )
            expect(focusedValue).toBe('4')
        })
    })

    test.describe('ACCEPTING parent (Functional, real v-model) — positive control', () => {
        test('a mouse click on a star moves the DOM and the model together', async ({page}) => {
            await page.goto(rfUrl(VARIANT_FUNCTIONAL))
            const frame = page.frameLocator('iframe[src*="__sandbox"]')
            const root = frame.locator('.origam-rating-field').first()
            await expect(root).toBeVisible({timeout: 30000})

            await root.locator('.origam-rating-field-item .origam-btn').nth(0).click()
            await page.waitForTimeout(200)

            const after = await dump(root)
            expect(after.radios.find((r) => r.checked)?.value).toBe('1')
            expect(after.filledStars).toBe(1)
        })

        test('ArrowRight moves focus, the checked radio, and the model together', async ({page}) => {
            await page.goto(rfUrl(VARIANT_FUNCTIONAL))
            const frame = page.frameLocator('iframe[src*="__sandbox"]')
            const root = frame.locator('.origam-rating-field').first()
            await expect(root).toBeVisible({timeout: 30000})

            await root.locator('input[type="radio"][value="3"]').focus()
            await page.keyboard.press('ArrowRight')
            await page.waitForTimeout(200)

            const after = await dump(root)
            expect(after.radios.find((r) => r.checked)?.value).toBe('4')
            expect(after.filledStars).toBe(4)
        })
    })
})
