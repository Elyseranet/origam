import { expect, test } from '@playwright/test'

/**
 * OrigamGrid / OrigamGridItem — e2e spec.
 *
 * ## Navigation (pattern canonique btn.spec.ts)
 *
 *   STORY_ID = 'components-stories-grid-origamgrid-story-vue'
 *   variantId = STORY_ID + '-' + index  (0-based, StoryGroup ≠ Variant)
 *
 *   Variants (index → titre) :
 *     0  Design
 *     1  Functional
 *     2  Slots - Default
 *     3  Prop — columns
 *     4  Prop — areas
 *     5  Prop — gap
 *     6  Prop — autoFlow
 *     7  Sub-component — OrigamGridItem
 *     8  Default  (playground)
 *
 * ## Sélection du composant
 *
 *   - Grille racine : `.origam-grid`
 *   - Item        : `.origam-grid-item`
 *   - La story n'utilise PAS de `data-cy` → on cible par classe BEM + ordre `.nth()`.
 *
 * ## Point critique — résolution des tokens
 *
 *   Le gap est passé via CSS custom property :
 *     `--origam-grid---gap: var(--origam-grid---gap-md)`
 *   Les tokens `--origam-grid---gap-{size}` sont injectés par le setup Histoire
 *   (qui charge les CSS DS dans le sandbox). Si les tokens ne sont pas chargés,
 *   la valeur computée reste 0px — le test échouera et c'est un vrai bug de setup.
 */

const STORY_ID   = 'components-stories-grid-origamgrid-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamGrid', () => {
    test.setTimeout(90000)

    // ------------------------------------------------------------------ //
    // Design (index 0)                                                    //
    // init: columns=4, rows='auto', gap='md', alignItems='stretch', …    //
    // ------------------------------------------------------------------ //

    test.describe('Design — montage et display grid', () => {
        test('le composant racine a display: grid', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').first()
            await expect(grid).toBeVisible({ timeout: 30000 })

            const display = await grid.evaluate(el => getComputedStyle(el).display)
            expect(display).toBe('grid')
        })

        test('columns=4 (défaut) → 4 pistes dans grid-template-columns', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').first()
            await expect(grid).toBeVisible({ timeout: 30000 })

            const trackCount = await grid.evaluate(el =>
                getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length
            )
            expect(trackCount).toBe(4)
        })

        test('gap=md (défaut) → token --origam-grid---gap-md = 16px résolu', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').first()
            await expect(grid).toBeVisible({ timeout: 30000 })

            const gap = await grid.evaluate(el => parseFloat(getComputedStyle(el).columnGap))
            expect(gap).toBe(16)
        })

        test('8 cellules enfants sont rendues', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').first()
            await expect(grid).toBeVisible({ timeout: 30000 })

            const cells = grid.locator('.cell')
            await expect(cells).toHaveCount(8)
        })
    })

    // ------------------------------------------------------------------ //
    // Functional (index 1)                                                //
    // init: autoFlow='row', inline=false, tag='div', columns=4, gap='md' //
    // ------------------------------------------------------------------ //

    test.describe('Functional — inline-grid', () => {
        test('inline=false → display: grid (pas inline-grid) par défaut', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').first()
            await expect(grid).toBeVisible({ timeout: 30000 })

            const display = await grid.evaluate(el => getComputedStyle(el).display)
            expect(display).toBe('grid')
            await expect(grid).not.toHaveClass(/origam-grid--inline/)
        })
    })

    // ------------------------------------------------------------------ //
    // Slots - Default (index 2)                                           //
    // columns=3, gap='sm' — 3 cellules                                   //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('les enfants passés dans le slot default sont rendus dans la grille', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').first()
            await expect(grid).toBeVisible({ timeout: 30000 })

            const cells = grid.locator('.cell--span')
            await expect(cells).toHaveCount(3)
        })

        test('columns=3 → 3 pistes', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').first()
            await expect(grid).toBeVisible({ timeout: 30000 })

            const trackCount = await grid.evaluate(el =>
                getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length
            )
            expect(trackCount).toBe(3)
        })
    })

    // ------------------------------------------------------------------ //
    // Prop — columns (index 3)                                            //
    // Grilles dans l'ordre d'apparition dans la story :                  //
    //   nth(0) → number = 3                                              //
    //   nth(1) → number = 12                                             //
    //   nth(2) → string = '1fr 2fr 1fr'                                 //
    //   nth(3) → array  = ['200px', '1fr', '200px']                     //
    // ------------------------------------------------------------------ //

    test.describe('Prop — columns', () => {
        test('number=3 → 3 pistes égales', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').nth(0)
            await expect(grid).toBeVisible({ timeout: 30000 })

            const trackCount = await grid.evaluate(el =>
                getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length
            )
            expect(trackCount).toBe(3)
        })

        test('number=12 → 12 pistes égales', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').nth(1)
            await expect(grid).toBeVisible({ timeout: 30000 })

            const trackCount = await grid.evaluate(el =>
                getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length
            )
            expect(trackCount).toBe(12)
        })

        test('string "1fr 2fr 1fr" → piste centrale ~2× les latérales', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').nth(2)
            await expect(grid).toBeVisible({ timeout: 30000 })

            const tracksPx = await grid.evaluate(el =>
                getComputedStyle(el).gridTemplateColumns
                    .split(' ')
                    .filter(Boolean)
                    .map(t => parseFloat(t))
            )
            expect(tracksPx).toHaveLength(3)

            const [a, b, c] = tracksPx
            expect(b).toBeGreaterThan(a)
            expect(b).toBeGreaterThan(c)
            const ratio = b / a
            expect(ratio).toBeGreaterThan(1.7)
            expect(ratio).toBeLessThan(2.3)
        })

        test('array ["200px","1fr","200px"] → pistes latérales à 200px exact', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').nth(3)
            await expect(grid).toBeVisible({ timeout: 30000 })

            const tracks = await grid.evaluate(el =>
                getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean)
            )
            expect(tracks).toHaveLength(3)
            expect(tracks[0]).toBe('200px')
            expect(tracks[2]).toBe('200px')
        })
    })

    // ------------------------------------------------------------------ //
    // Prop — areas (index 4)                                              //
    // HOLY_GRAIL_AREAS : header × 3 / sidebar + main + aside / footer × 3//
    // ------------------------------------------------------------------ //

    test.describe('Prop — areas', () => {
        test('grid-template-areas contient les 5 noms de zones', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').first()
            await expect(grid).toBeVisible({ timeout: 30000 })

            const areas = await grid.evaluate(el => getComputedStyle(el).gridTemplateAreas)
            expect(areas).toContain('header')
            expect(areas).toContain('sidebar')
            expect(areas).toContain('main')
            expect(areas).toContain('aside')
            expect(areas).toContain('footer')
        })

        test('header et footer s\'étendent sur toute la largeur de la grille', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').first()
            await expect(grid).toBeVisible({ timeout: 30000 })

            const headerCell = grid.locator('.cell--area').filter({ hasText: 'header' }).first()
            const footerCell = grid.locator('.cell--area').filter({ hasText: 'footer' }).first()
            await expect(headerCell).toBeVisible()
            await expect(footerCell).toBeVisible()

            const gridBox   = await grid.boundingBox()
            const headerBox = await headerCell.boundingBox()
            const footerBox = await footerCell.boundingBox()
            expect(gridBox).not.toBeNull()
            expect(headerBox).not.toBeNull()
            expect(footerBox).not.toBeNull()
            if (!gridBox || !headerBox || !footerBox) return

            expect(headerBox.width).toBeGreaterThan(gridBox.width - 40)
            expect(footerBox.width).toBeGreaterThan(gridBox.width - 40)
        })
    })

    // ------------------------------------------------------------------ //
    // Prop — gap (index 5)                                                //
    // Grilles dans l'ordre GRID_GAP_SIZES : xs sm md lg xl               //
    // Tokens : xs=4px sm=8px md=16px lg=24px xl=32px                     //
    // ------------------------------------------------------------------ //

    test.describe('Prop — gap (résolution des tokens)', () => {
        const EXPECTED_PX: Record<string, number> = {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32
        }

        const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

        for (let i = 0; i < SIZES.length; i++) {
            const size = SIZES[i]
            const expected = EXPECTED_PX[size]

            test(`gap=${size} → columnGap computé = ${expected}px`, async ({ page }) => {
                await page.goto(variantUrl(5))
                const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
                const grid = sandbox.locator('.origam-grid').nth(i)
                await expect(grid).toBeVisible({ timeout: 30000 })

                const gapPx = await grid.evaluate(el =>
                    parseFloat(getComputedStyle(el).columnGap)
                )
                expect(gapPx).toBe(expected)
            })
        }

        test('les valeurs de gap sont strictement croissantes (xs < sm < md < lg < xl)', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const values: number[] = []

            for (let i = 0; i < SIZES.length; i++) {
                const grid = sandbox.locator('.origam-grid').nth(i)
                await expect(grid).toBeVisible({ timeout: 30000 })
                const gapPx = await grid.evaluate(el =>
                    parseFloat(getComputedStyle(el).columnGap)
                )
                values.push(gapPx)
            }

            for (let i = 1; i < values.length; i++) {
                expect(values[i]).toBeGreaterThan(values[i - 1])
            }
        })
    })

    // ------------------------------------------------------------------ //
    // Prop — autoFlow (index 6)                                           //
    // Grilles dans l'ordre : row / column / row dense                    //
    // ------------------------------------------------------------------ //

    test.describe('Prop — autoFlow', () => {
        test('autoFlow="row" → grid-auto-flow = "row"', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').nth(0)
            await expect(grid).toBeVisible({ timeout: 30000 })

            const flow = await grid.evaluate(el => getComputedStyle(el).gridAutoFlow)
            expect(flow).toBe('row')
        })

        test('autoFlow="column" → grid-auto-flow = "column"', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').nth(1)
            await expect(grid).toBeVisible({ timeout: 30000 })

            const flow = await grid.evaluate(el => getComputedStyle(el).gridAutoFlow)
            expect(flow).toBe('column')
        })

        test('autoFlow="row dense" → keyword dense présent dans grid-auto-flow', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').nth(2)
            await expect(grid).toBeVisible({ timeout: 30000 })

            const flow = await grid.evaluate(el => getComputedStyle(el).gridAutoFlow)
            expect(flow).toMatch(/dense/)
        })
    })

    // ------------------------------------------------------------------ //
    // Sub-component — OrigamGridItem (index 7)                           //
    // Grille 1 (nth 0) — column span : 4 items                          //
    //   item nth(0) : { start: 1, end: 4 }   → grid-column: 1 / 4      //
    //   item nth(1) : { start: 4, span: 3 }  → grid-column: 4 / span 3 //
    //   item nth(2) : { span: 2 }            → grid-column: span 2      //
    //   item nth(3) : column="span 4" (raw)  → grid-column: span 4      //
    // Grille 2 (nth 1) — named areas : 5 OrigamGridItems avec `area`    //
    // ------------------------------------------------------------------ //

    test.describe('Sub-component — OrigamGridItem', () => {
        test('object { start:1, end:4 } → style grid-column: 1 / 4', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const firstGrid = sandbox.locator('.origam-grid').nth(0)
            await expect(firstGrid).toBeVisible({ timeout: 30000 })

            const item = firstGrid.locator('.origam-grid-item').nth(0)
            await expect(item).toBeVisible()

            const style = await item.evaluate(el => el.getAttribute('style') ?? '')
            expect(style.replace(/\s+/g, ' ')).toMatch(/grid-column:\s*1 \/ 4/)
        })

        test('object { start:4, span:3 } → style grid-column: 4 / span 3', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const firstGrid = sandbox.locator('.origam-grid').nth(0)
            await expect(firstGrid).toBeVisible({ timeout: 30000 })

            const item = firstGrid.locator('.origam-grid-item').nth(1)
            await expect(item).toBeVisible()

            const style = await item.evaluate(el => el.getAttribute('style') ?? '')
            expect(style.replace(/\s+/g, ' ')).toMatch(/grid-column:\s*4 \/ span 3/)
        })

        test('object { span:2 } → style grid-column: span 2', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const firstGrid = sandbox.locator('.origam-grid').nth(0)
            await expect(firstGrid).toBeVisible({ timeout: 30000 })

            const item = firstGrid.locator('.origam-grid-item').nth(2)
            await expect(item).toBeVisible()

            const style = await item.evaluate(el => el.getAttribute('style') ?? '')
            expect(style.replace(/\s+/g, ' ')).toMatch(/grid-column:\s*span 2/)
        })

        test('string "span 4" (syntaxe raw) → style grid-column: span 4', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const firstGrid = sandbox.locator('.origam-grid').nth(0)
            await expect(firstGrid).toBeVisible({ timeout: 30000 })

            const item = firstGrid.locator('.origam-grid-item').nth(3)
            await expect(item).toBeVisible()

            const style = await item.evaluate(el => el.getAttribute('style') ?? '')
            expect(style.replace(/\s+/g, ' ')).toMatch(/grid-column:\s*span 4/)
        })

        test('prop area="header" → style grid-area: header', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const secondGrid = sandbox.locator('.origam-grid').nth(1)
            await expect(secondGrid).toBeVisible({ timeout: 30000 })

            const item = secondGrid.locator('.origam-grid-item').filter({ hasText: 'header' }).first()
            await expect(item).toBeVisible()

            const style = await item.evaluate(el => el.getAttribute('style') ?? '')
            expect(style).toMatch(/grid-area:\s*header/)
        })

        test('prop area="footer" → style grid-area: footer', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const secondGrid = sandbox.locator('.origam-grid').nth(1)
            await expect(secondGrid).toBeVisible({ timeout: 30000 })

            const item = secondGrid.locator('.origam-grid-item').filter({ hasText: 'footer' }).first()
            await expect(item).toBeVisible()

            const style = await item.evaluate(el => el.getAttribute('style') ?? '')
            expect(style).toMatch(/grid-area:\s*footer/)
        })

        test('la grille areas contient 5 OrigamGridItems', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const secondGrid = sandbox.locator('.origam-grid').nth(1)
            await expect(secondGrid).toBeVisible({ timeout: 30000 })

            const items = secondGrid.locator('.origam-grid-item')
            await expect(items).toHaveCount(5)
        })
    })

    // ------------------------------------------------------------------ //
    // Default / playground (index 8)                                     //
    // init: columns=4, rows='auto', gap='md', autoFlow='row', …         //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('display grid + 4 pistes + gap=md résolu', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const grid = sandbox.locator('.origam-grid').first()
            await expect(grid).toBeVisible({ timeout: 30000 })

            const display = await grid.evaluate(el => getComputedStyle(el).display)
            expect(display).toBe('grid')

            const trackCount = await grid.evaluate(el =>
                getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length
            )
            expect(trackCount).toBe(4)

            const gap = await grid.evaluate(el => parseFloat(getComputedStyle(el).columnGap))
            expect(gap).toBe(16)
        })
    })
})
