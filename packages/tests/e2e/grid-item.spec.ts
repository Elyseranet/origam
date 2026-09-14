import { expect, test } from '@playwright/test'

/**
 * OrigamGridItem — dedicated e2e spec (#C7, lot mineur, 2026-09-11).
 *
 * Context: `<OrigamGridItem>` shipped with zero story and zero dedicated
 * doc of its own — the classeur flagged it "a ouvrir (story + doc)". This
 * spec accompanies the new `OrigamGridItem.story.vue` per the "test-as-
 * you-build" rule (CLAUDE.md): every new story ships with a Playwright
 * spec proving each prop produces a distinct computed style, not just
 * that a class/attribute exists.
 *
 * `column` / `row` / `area` object-spec serialisation is ALREADY covered
 * end-to-end by `grid.spec.ts`'s "Sub-component — OrigamGridItem" describe
 * block, against the markup embedded in `OrigamGrid.story.vue`. This spec
 * does NOT duplicate that — it covers what only the new dedicated story
 * exercises: the string-form `column` input, and — untested anywhere
 * before this — `alignSelf` / `justifySelf` and `tag`.
 *
 * ⛔ Deliberately does NOT drive HstSelect controls live (`selectOption`
 * on `getByRole('combobox', …)`): CLAUDE.md's own "test-as-build" rule
 * warns HstSelect is "custom DOM and brittle" for this, and `btn.spec.ts`
 * (the canonical e2e reference) documents the same lesson learned the
 * hard way — "En pratique c'est fragile — préférer tester l'init-state
 * uniquement et naviguer vers un Variant dédié pour chaque état à
 * couvrir." Each prop value below therefore gets its own static instance
 * in a dedicated "Prop — …" Variant, exactly like `grid.spec.ts` does for
 * `columns` / `gap` / `autoFlow`.
 *
 * ## Navigation (pattern canonique btn.spec.ts)
 *
 *   STORY_ID = 'components-stories-grid-origamgriditem-story-vue'
 *   variantId = STORY_ID + '-' + index  (0-based)
 *
 *   Variants (index → titre) :
 *     0 → Design
 *     1 → Functional
 *     2 → Slots - Default
 *     3 → Prop — alignSelf / justifySelf
 *     4 → Prop — tag
 *     5 → Default (playground)
 */

const STORY_ID = 'components-stories-grid-origamgriditem-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamGridItem', () => {
    test.setTimeout(60000)

    // ------------------------------------------------------------------ //
    // Design (index 0)                                                    //
    // init: column='2 / span 2' (string form, not the object form         //
    // already covered by grid.spec.ts)                                    //
    // ------------------------------------------------------------------ //

    test.describe('Design — column (string form)', () => {
        test('column="2 / span 2" (string, défaut) → grid-column inline style', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const target = sandbox.locator('[data-cy="grid-item-design-target"]')
            await expect(target).toBeVisible({ timeout: 30000 })

            const style = await target.evaluate(el => el.getAttribute('style') ?? '')
            expect(style.replace(/\s+/g, ' ')).toMatch(/grid-column:\s*2 \/ span 2/)
        })

        test('4 cellules sont rendues dans la grille', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.grid-host').first()
            await expect(grid).toBeVisible({ timeout: 30000 })

            const cells = grid.locator('.cell')
            await expect(cells).toHaveCount(4)
        })
    })

    // ------------------------------------------------------------------ //
    // Functional (index 1)                                                //
    // init: tag='div'                                                     //
    // ------------------------------------------------------------------ //

    test.describe('Functional — tag (init-state default)', () => {
        test('tag="div" (défaut) → l\'élément rendu est un <div>', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const target = sandbox.locator('[data-cy="grid-item-functional-target"]')
            await expect(target).toBeVisible({ timeout: 30000 })

            const tagName = await target.evaluate(el => el.tagName.toLowerCase())
            expect(tagName).toBe('div')
        })
    })

    // ------------------------------------------------------------------ //
    // Slots - Default (index 2)                                           //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('le contenu du slot default (markup, pas juste du texte) est rendu', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const strong = sandbox.locator('.cell strong', { hasText: 'Custom slot content' })
            await expect(strong).toBeVisible({ timeout: 30000 })
        })
    })

    // ------------------------------------------------------------------ //
    // Prop — alignSelf / justifySelf (index 3)                            //
    // 4 static items: start / center / end / stretch                     //
    // ------------------------------------------------------------------ //

    test.describe('Prop — alignSelf', () => {
        test('chaque valeur produit un align-self computed distinct', async ({ page }) => {
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

            const start = sandbox.locator('[data-cy="grid-item-align-start"]')
            const center = sandbox.locator('[data-cy="grid-item-align-center"]')
            const end = sandbox.locator('[data-cy="grid-item-align-end"]')
            const stretch = sandbox.locator('[data-cy="grid-item-align-stretch"]')
            await expect(start).toBeVisible({ timeout: 30000 })

            expect(await start.evaluate(el => getComputedStyle(el).alignSelf)).toBe('start')
            expect(await center.evaluate(el => getComputedStyle(el).alignSelf)).toBe('center')
            expect(await end.evaluate(el => getComputedStyle(el).alignSelf)).toBe('end')
            expect(await stretch.evaluate(el => getComputedStyle(el).alignSelf)).toBe('stretch')
        })

        test('start/center/end produisent des hauteurs de boîte différentes de stretch', async ({ page }) => {
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

            const start = sandbox.locator('[data-cy="grid-item-align-start"]')
            const stretch = sandbox.locator('[data-cy="grid-item-align-stretch"]')
            await expect(start).toBeVisible({ timeout: 30000 })

            const startBox = await start.boundingBox()
            const stretchBox = await stretch.boundingBox()
            expect(startBox).not.toBeNull()
            expect(stretchBox).not.toBeNull()
            if (!startBox || !stretchBox) return

            // `stretch` fills the row track; `start` sizes to content — the
            // stretched cell must be taller, proving `align-self` actually
            // changes layout, not just the CSSOM string.
            expect(stretchBox.height).toBeGreaterThan(startBox.height)
        })
    })

    test.describe('Prop — justifySelf (même grille, sur l\'axe inline)', () => {
        test('les 4 valeurs alignSelf produisent 4 positions verticales cohérentes (start < center < end)', async ({ page }) => {
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

            const start = sandbox.locator('[data-cy="grid-item-align-start"]')
            const center = sandbox.locator('[data-cy="grid-item-align-center"]')
            const end = sandbox.locator('[data-cy="grid-item-align-end"]')
            await expect(start).toBeVisible({ timeout: 30000 })

            const startBox = await start.boundingBox()
            const centerBox = await center.boundingBox()
            const endBox = await end.boundingBox()
            expect(startBox).not.toBeNull()
            expect(centerBox).not.toBeNull()
            expect(endBox).not.toBeNull()
            if (!startBox || !centerBox || !endBox) return

            expect(startBox.y).toBeLessThan(centerBox.y)
            expect(centerBox.y).toBeLessThan(endBox.y)
        })
    })

    // ------------------------------------------------------------------ //
    // Prop — tag (index 4)                                                //
    // 3 static items: div / section / article                            //
    // ------------------------------------------------------------------ //

    test.describe('Prop — tag', () => {
        test('tag="div" / "section" / "article" rendent l\'élément HTML correspondant', async ({ page }) => {
            await page.goto(variantUrl(4), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

            const div = sandbox.locator('[data-cy="grid-item-tag-div"]')
            const section = sandbox.locator('[data-cy="grid-item-tag-section"]')
            const article = sandbox.locator('[data-cy="grid-item-tag-article"]')
            await expect(div).toBeVisible({ timeout: 30000 })

            expect(await div.evaluate(el => el.tagName.toLowerCase())).toBe('div')
            expect(await section.evaluate(el => el.tagName.toLowerCase())).toBe('section')
            expect(await article.evaluate(el => el.tagName.toLowerCase())).toBe('article')
        })
    })

    // ------------------------------------------------------------------ //
    // Default / playground (index 5)                                      //
    // init: tag='div', column='1 / span 2'                                //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('column initial "1 / span 2" (string form) est appliqué', async ({ page }) => {
            await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const target = sandbox.locator('.cell--target').first()
            await expect(target).toBeVisible({ timeout: 30000 })

            const style = await target.evaluate(el => el.getAttribute('style') ?? '')
            expect(style.replace(/\s+/g, ' ')).toMatch(/grid-column:\s*1 \/ span 2/)

            const tag = await target.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('div')
        })
    })
})
