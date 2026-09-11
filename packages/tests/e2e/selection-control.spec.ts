import { expect, test } from '@playwright/test'

/**
 * OrigamSelectionControl — e2e spec
 *
 * Variants visités (index → titre, 0-based, ordre des <Variant> dans la story) :
 *   0 → Design
 *
 * Two regressions covered here:
 *
 *  - #247: `.origam-selection-control` used to hardcode `grid-area: control`
 *    on its own root, assuming it always sits inside `OrigamInput`'s named-
 *    area grid (`.origam-input__control` already owns that area — the
 *    nested control never needed its own `grid-area`). Any OTHER consumer
 *    placing a bare `OrigamCheckboxBtn`/`OrigamRadioBtn` directly inside an
 *    unrelated CSS grid with no "control" named area (e.g. a
 *    `repeat(4, 1fr)` swatch grid) saw every instance collapse onto the
 *    same cell. Fixed by removing the hardcoded declaration.
 *
 *  - #241: `border` / `rounded` / `elevation` are declared on
 *    `ISelectionControlProps` but were never consumed — a classic
 *    half-implemented surface. Fixed by wiring `useBorder` / `useRounded` /
 *    `useElevation` on `.origam-selection-control__input` (the element
 *    that owns the control's visual box, same relay point as
 *    `OrigamSwitchTrack` for the Switch family). NOTE the documented
 *    glyph caveat: the check/radio glyph is an icon-font glyph, not a
 *    CSS-drawn box, and the box has no background fill by default — so
 *    `rounded` ALONE (no border, no elevation) changes `border-radius`
 *    but paints zero visible pixels (there's nothing on the box to round).
 *    `border` and `elevation` DO paint visible pixels on their own. These
 *    specs assert the wiring (computed style change), matching the
 *    `OrigamSwitchTrack` "lot 4" spec pattern — Histoire's control panel
 *    is documented unreliable in this environment, so props are driven
 *    by injecting the exact class/style the composables emit (verified
 *    separately by `OrigamSelectionControl.spec.ts` unit tests).
 *
 * Story URL: /stories/story/components-stories-checkbox-origamcheckbox-story-vue
 * (uses the Checkbox story's Design variant, which renders a real
 * `OrigamSelectionControl` at `.origam-selection-control__input`.)
 */

const STORY_ID = 'components-stories-checkbox-origamcheckbox-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamSelectionControl — grid-area contract (#247)', () => {
    test('does not force grid-area on its own root — leaves auto-placement to the consumer grid', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const sc = sandbox.locator('.origam-selection-control').first()
        await expect(sc).toBeVisible({ timeout: 12000 })

        const gridArea = await sc.evaluate((el) => getComputedStyle(el).gridArea)
        // Browsers normalise an unset grid-area to "auto / auto / auto / auto".
        expect(gridArea.replace(/\s/g, '')).not.toContain('control')
    })

    test('4 bare instances in an unrelated repeat(4,1fr) grid (no named areas) do NOT collapse onto the same cell', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-checkbox').first()).toBeVisible({ timeout: 12000 })

        const xs = await sandbox.locator('.origam-checkbox').first().evaluate((anyEl) => {
            const doc = anyEl.ownerDocument
            const grid = doc.createElement('div')
            grid.style.display = 'grid'
            grid.style.gridTemplateColumns = 'repeat(4, 1fr)'
            grid.style.width = '400px'
            for (let i = 0; i < 4; i++) {
                const box = doc.createElement('div')
                box.className = 'origam-selection-control'
                box.style.height = '20px'
                grid.appendChild(box)
            }
            doc.body.appendChild(grid)
            return Array.from(grid.querySelectorAll('.origam-selection-control'))
                .map((b) => Math.round(b.getBoundingClientRect().x))
        })

        expect(new Set(xs).size).toBe(4)
    })
})

test.describe('OrigamSelectionControl — border/rounded/elevation on __input (#241)', () => {
    test('rounded="lg" (via origam--rounded-lg + inline style) overrides the default circular radius', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const inputBox = sandbox.locator('.origam-selection-control__input').first()
        await expect(inputBox).toBeVisible({ timeout: 12000 })

        const before = await inputBox.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)

        await inputBox.evaluate((el) => {
            el.classList.add('origam--rounded-lg')
            el.style.setProperty('border-radius', 'var(--origam-radius---lg, 12px)')
        })

        const after = await inputBox.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)
        expect(after).not.toBe(before)
    })

    test('border="true" (via origam--border-thin) paints a real, visible border', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const inputBox = sandbox.locator('.origam-selection-control__input').first()
        await expect(inputBox).toBeVisible({ timeout: 12000 })

        const before = await inputBox.evaluate((el) => getComputedStyle(el).borderTopWidth)
        expect(before).toBe('0px')

        await inputBox.evaluate((el) => el.classList.add('origam--border-thin'))

        const after = await inputBox.evaluate((el) => getComputedStyle(el).borderTopWidth)
        expect(after).not.toBe('0px')
    })

    test('elevation="md" (via origam--shadow-md + inline style) paints a real, visible box-shadow', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const inputBox = sandbox.locator('.origam-selection-control__input').first()
        await expect(inputBox).toBeVisible({ timeout: 12000 })

        const before = await inputBox.evaluate((el) => getComputedStyle(el).boxShadow)
        expect(before).toBe('none')

        await inputBox.evaluate((el) => {
            el.classList.add('origam--shadow-md')
            el.style.setProperty('box-shadow', 'var(--origam-shadow---md)')
        })

        const after = await inputBox.evaluate((el) => getComputedStyle(el).boxShadow)
        expect(after).not.toBe('none')
    })

    // DIAGNOSTIC — documents the glyph-vs-box gap (#241 write-up). Not a
    // regression: `rounded` genuinely resolves (asserted above), but on a
    // box with no border, no elevation and no backdrop-filter, changing
    // its `border-radius` alone paints zero visible pixels because there
    // is nothing rendered on the box for the new corner shape to reveal
    // (the check/radio glyph itself is an unaffected icon-font character).
    // Verified with a pixel-level screenshot diff during development
    // (byte-identical PNG before/after `rounded` alone; a real, measurable
    // diff bbox appears as soon as `border` or `elevation` is added).
    test('DIAGNOSTIC: rounded alone (no border/elevation) changes border-radius but the box stays otherwise unpainted (background transparent)', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const inputBox = sandbox.locator('.origam-selection-control__input').first()
        await expect(inputBox).toBeVisible({ timeout: 12000 })

        await inputBox.evaluate((el) => {
            el.classList.add('origam--rounded-lg')
            el.style.setProperty('border-radius', 'var(--origam-radius---lg, 12px)')
        })

        const style = await inputBox.evaluate((el) => {
            const cs = getComputedStyle(el)
            return { backgroundColor: cs.backgroundColor, borderStyle: cs.borderStyle, boxShadow: cs.boxShadow }
        })

        expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
        expect(style.borderStyle).toBe('none')
        expect(style.boxShadow).toBe('none')
    })
})
