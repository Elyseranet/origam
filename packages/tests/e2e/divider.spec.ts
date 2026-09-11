import { expect, test } from '@playwright/test'

/**
 * OrigamDivider — runtime behaviour specs.
 *
 * ## Variants (index → title)
 *   0 → Design     init: { direction: 'horizontal' }
 *   1 → Default    playground
 *
 * ## BEM root
 *   .origam-divider   (rendered as <hr>)
 *
 * ## Non-testable headless
 *   - color / bgColor visual rendering requires resolved CSS custom properties
 *     from the Origam token sheet. Assertions use computed borderColor / opacity.
 *   - inset margin-inline-start token value is verified via getComputedStyle.
 */

const STORY_ID   = 'components-stories-divider-origamdivider-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamDivider', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { direction: 'horizontal' }                                    //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the divider root with BEM class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })
        })

        test('horizontal init-state applies origam-divider--horizontal class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })
            await expect(divider).toHaveClass(/origam-divider--horizontal/)
        })

        test('horizontal divider has border-top-width of 1px (thin resolves)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })
            const btw = await divider.evaluate(el => getComputedStyle(el).borderTopWidth)
            expect(btw).toBe('1px')
        })

        test('horizontal divider has border-right-width of 0px', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })
            const brw = await divider.evaluate(el => getComputedStyle(el).borderRightWidth)
            expect(brw).toBe('0px')
        })

        test('divider rendered tag is hr', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })
            const tag = await divider.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('hr')
        })

        test('divider has role=separator', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })
            await expect(divider).toHaveAttribute('role', 'separator')
        })

        test('divider has aria-orientation=horizontal', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })
            await expect(divider).toHaveAttribute('aria-orientation', 'horizontal')
        })

        test('divider max-width defaults to 100%', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })
            const mw = await divider.evaluate(el => getComputedStyle(el).maxWidth)
            // CSS var resolves to 100% of parent → should be equal to offsetWidth of parent
            // We only assert it is not 0px (the divider should span horizontally)
            expect(parseFloat(mw)).toBeGreaterThan(0)
        })

        test('thickness inline CSS var overrides border-top-width', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })

            // Inject the CSS variable directly to simulate the thickness prop
            const btw = await divider.evaluate(el => {
                (el as HTMLElement).style.setProperty('--origam-divider---border-top-width', '4px')
                return getComputedStyle(el).borderTopWidth
            })
            expect(btw).toBe('4px')
        })

        test('length inline CSS var constrains max-width', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })

            // Inject the CSS variable directly to simulate the length prop
            const mw = await divider.evaluate(el => {
                (el as HTMLElement).style.setProperty('--origam-divider---max-width', '120px')
                return getComputedStyle(el).maxWidth
            })
            expect(parseFloat(mw)).toBeLessThanOrEqual(120)
        })

        test('inset class adds margin-inline-start greater than 0', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })

            // Add inset class to verify the SCSS rule applies margin-inline-start
            const margin = await divider.evaluate(el => {
                el.classList.add('origam-divider--inset')
                return getComputedStyle(el).marginInlineStart
            })
            expect(parseFloat(margin)).toBeGreaterThan(0)
        })

        test('inset class token resolves to 16px by default', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })

            const margin = await divider.evaluate(el => {
                el.classList.add('origam-divider--inset')
                return getComputedStyle(el).marginInlineStart
            })
            expect(margin).toBe('16px')
        })
    })

    // ------------------------------------------------------------------ //
    // VERTICAL (tested via init-state override on Design variant)          //
    // The story allows switching direction via controls, but headless      //
    // control interaction is brittle. We assert the SCSS vertical rule     //
    // directly by adding the class and measuring computed styles.           //
    // ------------------------------------------------------------------ //

    test.describe('Vertical direction (SCSS rule verification)', () => {
        test('vertical class sets border-right-width via CSS var', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })

            const brw = await divider.evaluate(el => {
                el.classList.remove('origam-divider--horizontal')
                el.classList.add('origam-divider--vertical')
                return getComputedStyle(el).borderRightWidth
            })
            expect(brw).toBe('1px')
        })

        test('vertical class sets border-top-width to 0px', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })

            const btw = await divider.evaluate(el => {
                el.classList.remove('origam-divider--horizontal')
                el.classList.add('origam-divider--vertical')
                return getComputedStyle(el).borderTopWidth
            })
            expect(btw).toBe('0px')
        })

        test('vertical thickness CSS var overrides border-right-width', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })

            const brw = await divider.evaluate(el => {
                el.classList.remove('origam-divider--horizontal')
                el.classList.add('origam-divider--vertical')
                ;(el as HTMLElement).style.setProperty('--origam-divider---border-right-width', '3px')
                return getComputedStyle(el).borderRightWidth
            })
            expect(brw).toBe('3px')
        })

        test('vertical inset adds margin-block-start greater than 0', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })

            const margin = await divider.evaluate(el => {
                el.classList.remove('origam-divider--horizontal')
                el.classList.add('origam-divider--vertical')
                el.classList.add('origam-divider--inset')
                return getComputedStyle(el).marginBlockStart
            })
            expect(parseFloat(margin)).toBeGreaterThan(0)
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 1)                                       //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('playground variant renders divider root', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })
        })

        test('playground variant applies horizontal class by default', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const divider = sandbox.locator('.origam-divider').first()
            await expect(divider).toBeVisible({ timeout: 12000 })
            await expect(divider).toHaveClass(/origam-divider--horizontal/)
        })
    })
})
