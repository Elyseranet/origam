import { expect, test } from '@playwright/test'

/**
 * OrigamTable — runtime behaviour specs.
 *
 * Pattern canonique : navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamTable (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Slots - Default
 *   4  → Slots - Top
 *   5  → Slots - Bottom
 *   6  → Slots - Wrapper
 *   7  → Default (playground)
 *
 * Covers: density cell-padding, fixed-header sticky positioning,
 * rounded border-radius.
 */

const STORY_ID   = 'components-stories-table-origamtable-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamTable density', () => {
    test.setTimeout(45000)

    test('compact / default / comfortable produce different cell padding', async ({ page }) => {
        // Design variant (0) has a table with density support.
        await page.goto(variantUrl(0))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const table = sandbox.locator('.origam-table').first()
        await expect(table).toBeVisible({ timeout: 12000 })

        // Force each density via the host's class API directly. This sidesteps
        // the Histoire HstSelect dropdown (custom DOM, painful to drive) and
        // exercises the SCSS rules `&--density-{name}`.
        const measure = async (density: 'compact' | 'default' | 'comfortable') => {
            return table.evaluate((el, density) => {
                el.classList.remove(
                    'origam-table--density-compact',
                    'origam-table--density-default',
                    'origam-table--density-comfortable'
                )
                el.classList.add(`origam-table--density-${density}`)
                const cell = el.querySelector('td') as HTMLElement | null
                const header = el.querySelector('th') as HTMLElement | null
                return {
                    cellPadding: cell ? getComputedStyle(cell).padding : null,
                    headerPadding: header ? getComputedStyle(header).padding : null,
                }
            }, density)
        }

        const compact = await measure('compact')
        const dflt = await measure('default')
        const comfy = await measure('comfortable')

        console.log('[density] compact:    ', compact)
        console.log('[density] default:    ', dflt)
        console.log('[density] comfortable:', comfy)

        // Must produce three distinct paddings.
        expect(compact.cellPadding).not.toBe(dflt.cellPadding)
        expect(dflt.cellPadding).not.toBe(comfy.cellPadding)
        expect(compact.cellPadding).not.toBe(comfy.cellPadding)

        // Sanity check the actual numbers (block padding 6/12/18).
        expect(compact.cellPadding).toContain('6px')
        expect(dflt.cellPadding).toContain('12px')
        expect(comfy.cellPadding).toContain('18px')
    })
})

test.describe('OrigamTable fixed-header', () => {
    test.setTimeout(45000)

    test('fixed-header class makes thead sticky', async ({ page }) => {
        // Functional variant (2) exposes the fixedHeader prop.
        await page.goto(variantUrl(2))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const table = sandbox.locator('.origam-table').first()
        await expect(table).toBeVisible({ timeout: 12000 })

        const thPosition = await table.evaluate((el) => {
            el.classList.add('origam-table--fixed-header')
            const th = el.querySelector('th') as HTMLElement | null
            return th ? getComputedStyle(th).position : null
        })
        console.log('[table-fixed-header] th position:', thPosition)
        expect(thPosition).toBe('sticky')
    })

    test('wrapper overflow-y is auto when fixed-header is active', async ({ page }) => {
        await page.goto(variantUrl(2))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const table = sandbox.locator('.origam-table').first()
        await expect(table).toBeVisible({ timeout: 12000 })

        const wrapperOverflow = await table.evaluate((el) => {
            el.classList.add('origam-table--fixed-header')
            const wrapper = el.querySelector('.origam-table__wrapper') as HTMLElement | null
            return wrapper ? getComputedStyle(wrapper).overflowY : null
        })
        console.log('[table-fixed-header] wrapper overflow-y:', wrapperOverflow)
        expect(wrapperOverflow).toBe('auto')
    })
})

test.describe('OrigamTable visual variants', () => {
    test.setTimeout(45000)

    test('rounded class applies border-radius', async ({ page }) => {
        await page.goto(variantUrl(2))

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const table = sandbox.locator('.origam-table').first()
        await expect(table).toBeVisible({ timeout: 12000 })

        const br = await table.evaluate((el) => {
            el.classList.add('origam-table--rounded')
            return getComputedStyle(el).borderRadius
        })
        console.log('[table-rounded] border-radius:', br)
        expect(parseFloat(br)).toBeGreaterThan(0)
    })
})
