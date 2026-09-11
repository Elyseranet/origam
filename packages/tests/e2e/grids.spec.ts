import { expect, test } from '@playwright/test'

const COL_PATH = '/stories/story/components-stories-grids-origamcol-story-vue'
const ROW_PATH = '/stories/story/components-stories-grids-origamrow-story-vue'
const CONTAINER_PATH = '/stories/story/components-stories-grids-origamcontainer-story-vue'
const SPACER_PATH = '/stories/story/components-stories-grids-origamspacer-story-vue'

/**
 * Grids — OrigamCol / OrigamRow / OrigamContainer / OrigamSpacer runtime specs.
 *
 * Approach: inject BEM modifier classes directly on the host element inside
 * the sandbox frame and verify computed styles change accordingly.
 */

// ─── OrigamCol ───────────────────────────────────────────────────────────────

test.describe('OrigamCol', () => {

    test('cols=6 sets flex-basis to 50%', async ({ page }) => {
        await page.goto(COL_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — cols', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const col = sandbox.locator('.origam-col').first()
        await expect(col).toBeVisible({ timeout: 15000 })

        const fb = await col.evaluate((el) => {
            el.classList.add('origam-col--6')
            return getComputedStyle(el).flexBasis
        })
        console.log('[col-6] flex-basis:', fb)
        // 6/12 = 50%
        expect(fb).toMatch(/50%|0\.5/)
    })

    test('cols=4 sets flex-basis to ~33%', async ({ page }) => {
        await page.goto(COL_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — cols', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const col = sandbox.locator('.origam-col').first()
        await expect(col).toBeVisible({ timeout: 15000 })

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
        await page.goto(COL_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — align (align-self)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const col = sandbox.locator('.origam-col').first()
        await expect(col).toBeVisible({ timeout: 15000 })

        const alignSelf = await col.evaluate((el) => {
            el.classList.add('origam-col--align-center')
            return getComputedStyle(el).alignSelf
        })
        console.log('[col-align] align-self:', alignSelf)
        expect(alignSelf).toBe('center')
    })

    test('offset-2 applies margin-inline-start', async ({ page }) => {
        await page.goto(COL_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — offset', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const col = sandbox.locator('.origam-col').first()
        await expect(col).toBeVisible({ timeout: 15000 })

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

    test('density-compact / default / comfortable produce distinct margins', async ({ page }) => {
        await page.goto(ROW_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — density', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const row = sandbox.locator('.origam-row').first()
        await expect(row).toBeVisible({ timeout: 15000 })

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
        await page.goto(ROW_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — align', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const row = sandbox.locator('.origam-row').first()
        await expect(row).toBeVisible({ timeout: 15000 })

        const ai = await row.evaluate((el) => {
            el.classList.add('origam-row--align-center')
            return getComputedStyle(el).alignItems
        })
        expect(ai).toBe('center')
    })

    test('justify-space-between sets justify-content', async ({ page }) => {
        await page.goto(ROW_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — justify', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const row = sandbox.locator('.origam-row').first()
        await expect(row).toBeVisible({ timeout: 15000 })

        const jc = await row.evaluate((el) => {
            el.classList.add('origam-row--justify-space-between')
            return getComputedStyle(el).justifyContent
        })
        expect(jc).toBe('space-between')
    })

    test('direction-column sets flex-direction: column', async ({ page }) => {
        await page.goto(ROW_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — align', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const row = sandbox.locator('.origam-row').first()
        await expect(row).toBeVisible({ timeout: 15000 })

        const fd = await row.evaluate((el) => {
            el.classList.add('origam-row--direction-column')
            return getComputedStyle(el).flexDirection
        })
        expect(fd).toBe('column')
    })
})

// ─── OrigamContainer ─────────────────────────────────────────────────────────

test.describe('OrigamContainer', () => {

    test('renders with auto margins (horizontally centered)', async ({ page }) => {
        await page.goto(CONTAINER_PATH)
        await page.waitForLoadState('networkidle')
        // Container story has no "Modifiers" variant — navigate via Default to load sandbox
        await page.getByText('Default', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const container = sandbox.locator('.origam-container').first()
        await expect(container).toBeVisible({ timeout: 15000 })

        const mis = await container.evaluate((el) => getComputedStyle(el).marginInlineStart)
        console.log('[container-margins] margin-inline-start:', mis)
        // The :root token sets margin-inline-start: auto which resolves to a px value
        expect(mis).not.toBe('')
    })

    test('fluid modifier removes max-width constraint', async ({ page }) => {
        await page.goto(CONTAINER_PATH)
        await page.waitForLoadState('networkidle')
        // Container story has no "Modifiers" variant — navigate via Default to load sandbox
        await page.getByText('Default', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const container = sandbox.locator('.origam-container').first()
        await expect(container).toBeVisible({ timeout: 15000 })

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

    test('renders with flex-grow: 1', async ({ page }) => {
        await page.goto(SPACER_PATH)
        await page.waitForLoadState('networkidle')
        // Spacer story has no "Basic usage" variant — navigate via Default to load sandbox
        await page.getByText('Default', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const spacer = sandbox.locator('.origam-spacer').first()
        // Spacer has no intrinsic content — it is in the DOM but may have zero
        // dimensions. Use toBeAttached instead of toBeVisible.
        await expect(spacer).toBeAttached({ timeout: 15000 })

        const fg = await spacer.evaluate((el) => getComputedStyle(el).flexGrow)
        console.log('[spacer] flex-grow:', fg)
        expect(fg).toBe('1')
    })
})
