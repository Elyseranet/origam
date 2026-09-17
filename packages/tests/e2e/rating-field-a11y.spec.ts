import { expect, test } from '@playwright/test'

/**
 * #810 — OrigamRatingField: the group is named, and no `<label for>` dangles.
 *
 * ## What was measured BEFORE the fix (Chromium, built Histoire, variant 11)
 *
 * ```
 * label for="origam-rating-field-v-2" -> resolves=false   text="Rating"
 * root role=null  aria-labelledby=null  aria-label=null
 * aria snapshot: - text: Rating / - radio "Rating 0 of 5" / … (no group node)
 * ```
 *
 * The `for` pointed at an id no element carried — reproduced with NO consumer
 * `id` at all, i.e. on the component's own default rendering, not on an exotic
 * consumer configuration.
 *
 * ⛔ The tempting repair — make `OrigamInput` honour that id — would have made
 * the `for` resolve to the Input's ROOT, which is a `<div>` and therefore not a
 * labelable element. The orphan would have stopped being detectable while a
 * screen reader still announced nothing. The WAI-ARIA radiogroup pattern names
 * the whole group instead, which is what a rating is.
 *
 * ## Positive control — REQUIRED, see `group is named` below
 *
 * Each star's own `<label for>` → `<input type=radio>` pairing ALREADY resolved
 * before this change and still does. It is asserted here in the same page, with
 * the same reader, so that "the group has no name" and "this probe cannot read
 * names" stay distinguishable. Without that witness a silent probe and a real
 * defect look identical.
 *
 * ## ⚠️ NOT fixed here, and NOT asserted here — keyboard operability
 *
 * Measured on this component, before AND after this change, unchanged by it:
 *
 * ```
 * 12 × Tab                      -> document.activeElement stays BODY, every time
 * Arrow{Right,Left,Up,Down}     -> checked stays 3, activeElement stays BODY
 * Space / Enter                 -> checked stays 3, activeElement stays BODY
 * stars                         -> DIV[role=null][tabindex=null]  (not <button>:
 *                                  OrigamRatingFieldItem forwards its own
 *                                  `tag: 'div'` default down to OrigamBtn)
 * radio.focus() programmatically -> FOCUSED
 * ```
 *
 * That last line is the useful one: the radios are NOT unfocusable, they are
 * merely out of the tab order (`tabindex="-1"`, and
 * `.origam-rating-field-item__hidden` is `height:0;width:0;opacity:0` — invisible
 * but still focusable). Dropping that `tabindex` would hand the whole group
 * native arrow-key navigation for free, which is why the fix is NOT done here:
 * focus would then land on a 0×0 transparent input, i.e. a WCAG 2.4.7 failure,
 * unless the star is also given a visible focus style first. That is a separate
 * change with its own blast radius, deliberately out of scope for #810.
 *
 * `role="radiogroup"` does not make any of this worse, and does not cure it.
 */

const RF_ID = 'components-stories-ratingfield-origamratingfield-story-vue'
const RF_PATH = '/stories/story/' + RF_ID
const rfUrl = (idx: number) => `${RF_PATH}?variantId=${RF_ID}-${idx}`

/** Variant 11 = "Default" playground — label:'Rating', modelValue:3. */
const VARIANT_DEFAULT = 11

test.describe('OrigamRatingField — a11y naming (#810)', () => {
    test.setTimeout(45000)

    test('the group is named, and the per-star label still resolves (positive control)', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_DEFAULT))
        const frame = page.frameLocator('iframe[src*="__sandbox"]')
        const root = frame.locator('.origam-rating-field').first()
        await expect(root).toBeVisible({ timeout: 30000 })

        // --- POSITIVE CONTROL -------------------------------------------------
        // This name worked before this change and must keep working. If this
        // assertion ever fails at the same time as the group one below, the
        // reader is broken, not the product.
        const witness = frame.locator('input[type="radio"][value="3"]')
        await expect(witness).toHaveAccessibleName('Rating 3 of 5')

        // --- THE FIX ----------------------------------------------------------
        await expect(root).toHaveAttribute('role', 'radiogroup')
        await expect(root).toHaveAccessibleName('Rating')
    })

    test('aria-labelledby points at an element that exists and carries text', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_DEFAULT))
        const frame = page.frameLocator('iframe[src*="__sandbox"]')
        const root = frame.locator('.origam-rating-field').first()
        await expect(root).toBeVisible({ timeout: 30000 })

        // An aria-labelledby aimed at a missing id would reproduce #810 in a new
        // form — it is exactly as silent as the orphan `for` it replaces.
        const target = await root.evaluate((el) => {
            const ref = el.getAttribute('aria-labelledby')
            if (!ref) return { ref: null as string | null, exists: false, text: '' }
            const t = el.ownerDocument!.getElementById(ref)
            return { ref, exists: !!t, text: t ? (t.textContent || '').trim() : '' }
        })

        expect(target.ref).not.toBeNull()
        expect(target.exists).toBe(true)
        expect(target.text.length).toBeGreaterThan(0)
    })

    test('no <label for> inside the field points at a missing element', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_DEFAULT))
        const frame = page.frameLocator('iframe[src*="__sandbox"]')
        const root = frame.locator('.origam-rating-field').first()
        await expect(root).toBeVisible({ timeout: 30000 })

        const orphans = await root.evaluate((el) => {
            const doc = el.ownerDocument!
            return Array.from(el.querySelectorAll('label'))
                .map((l) => l.getAttribute('for'))
                .filter((f): f is string => !!f && !doc.getElementById(f))
        })

        expect(orphans).toEqual([])
    })

    test('clicking a star still updates the selection (no regression from the markup change)', async ({ page }) => {
        await page.goto(rfUrl(VARIANT_DEFAULT))
        const frame = page.frameLocator('iframe[src*="__sandbox"]')
        const root = frame.locator('.origam-rating-field').first()
        await expect(root).toBeVisible({ timeout: 30000 })

        const checkedValue = () => root.evaluate((el) => {
            const r = el.querySelector('input[type="radio"]:checked') as HTMLInputElement | null
            return r ? r.value : null
        })

        expect(await checkedValue()).toBe('3')
        await root.locator('.origam-rating-field-item .origam-btn').nth(4).click()
        await expect.poll(checkedValue).toBe('5')
    })
})
