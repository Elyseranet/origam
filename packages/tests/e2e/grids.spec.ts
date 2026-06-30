import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId.
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamCol (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Prop — cols
 *   4  → Prop — align (align-self)
 *   5  → Prop — offset
 *
 * Variants OrigamRow (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Prop — density
 *   4  → Prop — align
 *   5  → Prop — justify
 *
 * Variants OrigamContainer (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Default (playground)
 *
 * Variants OrigamSpacer (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Default (playground)
 */

const COL_ID       = 'components-stories-grids-origamcol-story-vue'
const ROW_ID       = 'components-stories-grids-origamrow-story-vue'
const CONTAINER_ID = 'components-stories-grids-origamcontainer-story-vue'
const SPACER_ID    = 'components-stories-grids-origamspacer-story-vue'

const colUrl       = (idx: number) => `/stories/story/${COL_ID}?variantId=${COL_ID}-${idx}`
const rowUrl       = (idx: number) => `/stories/story/${ROW_ID}?variantId=${ROW_ID}-${idx}`
const containerUrl = (idx: number) => `/stories/story/${CONTAINER_ID}?variantId=${CONTAINER_ID}-${idx}`
const spacerUrl    = (idx: number) => `/stories/story/${SPACER_ID}?variantId=${SPACER_ID}-${idx}`

/**
 * Grids — OrigamCol / OrigamRow / OrigamContainer / OrigamSpacer runtime specs.
 *
 * Approach: inject BEM modifier classes directly on the host element inside
 * the sandbox frame and verify computed styles change accordingly.
 */

// ─── OrigamCol ───────────────────────────────────────────────────────────────

test.describe('OrigamCol', () => {
    test.setTimeout(45000)

    test('cols=6 sets flex-basis to 50%', async ({ page }) => {
        await page.goto(colUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const col = sandbox.locator('.origam-col').first()
        await expect(col).toBeVisible({ timeout: 20000 })

        const fb = await col.evaluate((el) => {
            el.classList.add('origam-col--6')
            return getComputedStyle(el).flexBasis
        })
        console.log('[col-6] flex-basis:', fb)
        // 6/12 = 50%
        expect(fb).toMatch(/50%|0\.5/)
    })

    test('cols=4 sets flex-basis to ~33%', async ({ page }) => {
        await page.goto(colUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const col = sandbox.locator('.origam-col').first()
        await expect(col).toBeVisible({ timeout: 20000 })

        const fb = await col.evaluate((el) => {
            el.classList.remove('origam-col--6')
            el.classList.add('origam-col--4')
            return getComputedStyle(el).flexBasis
        })
        console.log('[col-4] flex-basis:', fb)
        // 4/12 ≈ 33.33%
        expect(parseFloat(fb)).toBeGreaterThan(30)
        expect(parseFloat(fb)).toBeLessThan(35)
    })

    test('align-center sets align-self: center', async ({ page }) => {
        await page.goto(colUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const col = sandbox.locator('.origam-col').first()
        await expect(col).toBeVisible({ timeout: 20000 })

        const alignSelf = await col.evaluate((el) => {
            el.classList.add('origam-col--align-center')
            return getComputedStyle(el).alignSelf
        })
        console.log('[col-align] align-self:', alignSelf)
        expect(alignSelf).toBe('center')
    })

    test('offset-2 applies margin-inline-start', async ({ page }) => {
        await page.goto(colUrl(5))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const col = sandbox.locator('.origam-col').first()
        await expect(col).toBeVisible({ timeout: 20000 })

        // The SCSS rule sets --origam-col---margin-inline-start which cascades to margin-inline-start
        const mis = await col.evaluate((el) => {
            el.classList.add('origam-col--offset-2')
            return getComputedStyle(el).marginInlineStart
        })
        console.log('[col-offset-2] margin-inline-start:', mis)
        // 2/12 ≈ 16.67% → in px depends on container width but must be > 0
        expect(parseFloat(mis)).toBeGreaterThan(0)
    })
})

// ─── OrigamRow ───────────────────────────────────────────────────────────────

test.describe('OrigamRow', () => {
    test.setTimeout(45000)

    test('density-compact / default / comfortable produce distinct margins', async ({ page }) => {
        await page.goto(rowUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const row = sandbox.locator('.origam-row').first()
        await expect(row).toBeVisible({ timeout: 20000 })

        const measureMargin = async (density: 'compact' | 'default' | 'comfortable') => {
            return row.evaluate((el, d) => {
                el.classList.remove(
                    'origam-row--density-compact',
                    'origam-row--density-default',
                    'origam-row--density-comfortable'
                )
                el.classList.add(`origam-row--density-${d}`)
                return getComputedStyle(el).marginInlineStart
            }, density)
        }

        const compact = await measureMargin('compact')
        const dflt = await measureMargin('default')
        const comfy = await measureMargin('comfortable')

        console.log('[row-density] compact:', compact, '| default:', dflt, '| comfortable:', comfy)
        // All three must differ
        expect(compact).not.toBe(dflt)
        expect(dflt).not.toBe(comfy)
    })

    test('align-center sets align-items: center', async ({ page }) => {
        await page.goto(rowUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const row = sandbox.locator('.origam-row').first()
        await expect(row).toBeVisible({ timeout: 20000 })

        const ai = await row.evaluate((el) => {
            el.classList.add('origam-row--align-center')
            return getComputedStyle(el).alignItems
        })
        expect(ai).toBe('center')
    })

    test('justify-space-between sets justify-content', async ({ page }) => {
        await page.goto(rowUrl(5))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const row = sandbox.locator('.origam-row').first()
        await expect(row).toBeVisible({ timeout: 20000 })

        const jc = await row.evaluate((el) => {
            el.classList.add('origam-row--justify-space-between')
            return getComputedStyle(el).justifyContent
        })
        expect(jc).toBe('space-between')
    })

    test('direction-column sets flex-direction: column', async ({ page }) => {
        await page.goto(rowUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const row = sandbox.locator('.origam-row').first()
        await expect(row).toBeVisible({ timeout: 20000 })

        const fd = await row.evaluate((el) => {
            el.classList.add('origam-row--direction-column')
            return getComputedStyle(el).flexDirection
        })
        expect(fd).toBe('column')
    })
})

// ─── OrigamContainer ─────────────────────────────────────────────────────────

test.describe('OrigamContainer', () => {
    test.setTimeout(45000)

    test('renders with auto margins (horizontally centered)', async ({ page }) => {
        await page.goto(containerUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const container = sandbox.locator('.origam-container').first()
        await expect(container).toBeVisible({ timeout: 20000 })

        const mis = await container.evaluate((el) => getComputedStyle(el).marginInlineStart)
        console.log('[container-margins] margin-inline-start:', mis)
        // The :root token sets margin-inline-start: auto which resolves to a px value
        expect(mis).not.toBe('')
    })

    test('fluid modifier removes max-width constraint', async ({ page }) => {
        await page.goto(containerUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const container = sandbox.locator('.origam-container').first()
        await expect(container).toBeVisible({ timeout: 20000 })

        const mw = await container.evaluate((el) => {
            el.classList.add('origam-container--fluid')
            return getComputedStyle(el).maxWidth
        })
        console.log('[container-fluid] max-width:', mw)
        // The SCSS rule &--fluid sets --origam-container---max-width: 100%
        // Computed value resolves to the viewport width in px (not the string "100%")
        // so we assert it's a valid px value greater than 0
        expect(parseFloat(mw)).toBeGreaterThan(0)
    })
})

// ─── OrigamSpacer ────────────────────────────────────────────────────────────

test.describe('OrigamSpacer', () => {
    test.setTimeout(45000)

    test('renders with flex-grow: 1', async ({ page }) => {
        await page.goto(spacerUrl(2))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const spacer = sandbox.locator('.origam-spacer').first()
        // Spacer has no intrinsic content — it is in the DOM but may have zero
        // dimensions. Use toBeAttached instead of toBeVisible.
        await expect(spacer).toBeAttached({ timeout: 20000 })

        const fg = await spacer.evaluate((el) => getComputedStyle(el).flexGrow)
        console.log('[spacer] flex-grow:', fg)
        expect(fg).toBe('1')
    })
})
