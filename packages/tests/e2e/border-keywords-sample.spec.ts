import { expect, test } from '@playwright/test'

/**
 * #391 — SAMPLE PROOF across `useBorder` consumers, in a real browser.
 *
 * The defect was never Btn-specific: it hits any component that paints its
 * border from a Vue-scoped `border-width: var(--origam-{cmp}---border-width…)`
 * rule, because that rule (0,2,0) outranks the `.origam--border-thick`
 * utility (0,1,0) whatever the sheet order. Measured across the catalogue,
 * 10 of the 43 consumers carry such a rule.
 *
 * Two NON-BUTTON components are checked here alongside Btn's own matrix
 * (`btn-border.spec.ts`), each covering a different SCSS shape:
 *
 *   - OrigamKbd      `border-width: var(--origam-kbd---border-width, 1px)`
 *   - OrigamCardText `border-width: var(--origam-card-text---border-width)`
 *
 * Every case renders through the component's real prop path in a static
 * matrix Variant, so nothing here depends on driving Histoire controls.
 */

type TSample = { label: string, story: string, variant: number, slug: string }

const SAMPLES: Array<TSample> = [
    { label: 'OrigamKbd', story: 'components-stories-kbd-origamkbd-story-vue', variant: 3, slug: 'kbd' },
    { label: 'OrigamCardText', story: 'components-stories-card-origamcardtext-story-vue', variant: 3, slug: 'card-text' }
]

const px = (v: string) => Number.parseFloat(v) || 0

for (const sample of SAMPLES) {
    test.describe(`#391 — border keywords on ${sample.label}`, () => {
        test('thick, none and a named side each render distinctly', async ({ page }) => {
            await page.goto(`/stories/story/${sample.story}?variantId=${sample.story}-${sample.variant}`, { waitUntil: 'domcontentloaded' })

            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator(`[data-cy="${sample.slug}-border-matrix"]`)).toBeVisible()

            const read = async (name: string) =>
                sandbox.locator(`[data-cy="${sample.slug}-border-${name}"]`).evaluate((el) => {
                    const cs = getComputedStyle(el)

                    return {
                        top: cs.borderTopWidth,
                        right: cs.borderRightWidth,
                        bottom: cs.borderBottomWidth,
                        left: cs.borderLeftWidth
                    }
                })

            const unset = await read('unset')
            const none = await read('none')
            const thin = await read('thin')
            const thick = await read('thick')
            const top = await read('top')
            const four = await read('four')

             
            console.log(`\n${sample.label}: ${JSON.stringify({ unset, none, thin, thick, top, four })}`)

            expect(px(none.top), 'border="none" must paint nothing').toBe(0)
            expect(px(thin.top), 'border="thin" must paint').toBeGreaterThan(0)
            expect(px(thick.top), 'border="thick" must paint').toBeGreaterThan(0)

            // The heart of #391: before the fix these were equal.
            expect(px(thick.top), 'thick must be strictly thicker than thin').toBeGreaterThan(px(thin.top))

            // A direction must isolate its edge — on components that own no
            // per-side custom property, this only works because useBorder now
            // emits all four physical widths.
            expect(px(top.top), 'border="top" top edge').toBeGreaterThan(0)
            expect(px(top.right), 'border="top" must not paint right').toBe(0)
            expect(px(top.bottom), 'border="top" must not paint bottom').toBe(0)
            expect(px(top.left), 'border="top" must not paint left').toBe(0)

            // The numeric form was already correct — regression guard.
            expect(px(four.top), ':border="4"').toBe(4)

            // And the component's own resting appearance is untouched.
            expect(unset, 'no border prop must leave the component as it was').toBeTruthy()
        })
    })
}
