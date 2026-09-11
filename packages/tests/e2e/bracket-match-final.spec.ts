import { expect, test } from '@playwright/test'

import { toggleHstCheckbox } from './_support/histoire-controls'

/**
 * #511 — OrigamBracketMatch posed `origam-bracket-match--final` on the DOM
 * (`is-final="true"`) with NO matching `&--final` SCSS rule: a final match
 * rendered pixel-identical to a normal one. jsdom cannot resolve scoped
 * SCSS custom properties (root CLAUDE.md), so this class -> real computed
 * style link can only be proven against a real browser — the TU spec
 * (packages/tests/TU/components/Bracket/OrigamBracketMatch.spec.ts) only
 * proves the isFinal -> class wiring half.
 *
 * Story: components-stories-bracket-origambracketmatch-story-vue,
 * Variant 2 ("Functional") — init: { status: 'live', isFinal: false,
 * interactive: true, tag: 'div' }, "Is Final" HstCheckbox control.
 */

const STORY_ID = 'components-stories-bracket-origambracketmatch-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`
const VIS = { timeout: 35000 }

test.describe('OrigamBracketMatch — #511 --final renders a real, distinct style', () => {
    test.setTimeout(60000)

    test('isFinal=true changes background-color / border-color vs a non-final match', async ({ page }) => {
        await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const match = sandbox.locator('.origam-bracket-match').first()
        await expect(match).toBeVisible(VIS)

        const baseline = await match.evaluate(el => {
            const cs = getComputedStyle(el)
            return { background: cs.backgroundColor, border: cs.borderColor, shadow: cs.boxShadow }
        })

        await toggleHstCheckbox(page, 'Is Final')
        await expect(match).toHaveClass(/origam-bracket-match--final/)

        // `.origam-bracket-match` declares `transition: border-color 120ms
        // ease, box-shadow 120ms ease` — reading getComputedStyle in the
        // same tick as the class toggle can catch a mid-transition (or
        // pre-first-frame) value. Poll until it settles past the baseline.
        const readStyle = () => match.evaluate(el => {
            const cs = getComputedStyle(el)
            return { background: cs.backgroundColor, border: cs.borderColor, shadow: cs.boxShadow }
        })

        await expect.poll(async () => {
            const final = await readStyle()
            return final.background !== baseline.background
                || final.border !== baseline.border
                || final.shadow !== baseline.shadow
        }, { timeout: 5000 }).toBe(true)
    })
})
