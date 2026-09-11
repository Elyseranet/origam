import { expect, test } from '@playwright/test'

/**
 * RECIPE — Pattern canonique (réf. btn.spec.ts)
 *
 * ## Variants (0-based index)
 *   0  → Design       (color, bgColor, width, height, hideDelimiters, delimiterIcon, rounded, elevation, border)
 *   1  → State        (bgColor, hover, active, modelValue, show-arrows)
 *   2  → Functional   (cycle, interval, progress, showArrows, continuous, reverse, disabled, mandatory, direction, tag)
 *   3  → Events - update:modelValue
 *   4  → Slots - Default
 *   5  → Slots - Additional
 *   6  → Slots - Item
 *   7  → Slots - Prev
 *   8  → Slots - Next
 *   9  → Slots - Arrows
 *  10  → Slots - Progress
 *  11  → Default (playground)
 *
 * ## BEM classes observables
 *   - .origam-carousel                    → root (merges origam-window + origam-carousel classes)
 *   - .origam-carousel__controls          → delimiter strip (dots bar at bottom)
 *   - .origam-carousel__controls-item     → each delimiter dot (origam-btn)
 *   - .origam-btn--active                 → the selected dot carries this modifier
 *   - .origam-window__controls            → arrow overlay zone (prev + next btn)
 *   - .origam-window__next                → next arrow button
 *   - .origam-window__prev                → prev arrow button (only when not at first slide)
 *   - .origam-carousel__progress          → progress bar strip (cycle=true, progress=true)
 *
 * ## bgColor behaviour
 *   bgColor on <OrigamCarousel> is NOT applied as a utility class on the root element.
 *   It is forwarded to the delimiter dots via controlProps. The root element only
 *   carries 'origam-window origam-carousel'. Do NOT assert origam--bg-* on root.
 *
 * ## Cold-start timing note
 *   The Histoire sandbox iframe JS bundle loads asynchronously. On a fresh browser
 *   context the carousel can take up to 22s to mount. All first-visible assertions
 *   use { timeout: 30000 }. test.setTimeout is set to 60000 to allow for the
 *   mounting delay PLUS additional interaction time.
 *
 * ## Autoplay note
 *   Design (no cycle in init), Functional (cycle=false in init), and all Slot
 *   variants are safe for static-snapshot assertions. Slots - Progress has
 *   cycle=true/:cycle="true" — we assert structure only (not timing-sensitive).
 */

const STORY_ID   = 'components-stories-carousel-origamcarousel-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamCarousel', () => {
    test.setTimeout(60000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: height=300, hideDelimiters=false, no cycle                    //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the carousel root with BEM class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-carousel').first()).toBeVisible({ timeout: 30000 })
        })

        test('delimiter controls strip is visible by default', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            await expect(carousel.locator('.origam-carousel__controls')).toBeVisible()
        })

        test('delimiter dots are rendered (one per slide)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            // Story has 4 slides → 4 delimiter dots
            await expect(carousel.locator('.origam-carousel__controls-item')).toHaveCount(4)
        })

        test('height prop is applied as inline style on the root', async ({ page }) => {
            // init-state: height=300 — dimensionStyles sets height via useDimension
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            const heightStyle = await carousel.evaluate(el => (el as HTMLElement).style.height)
            expect(heightStyle).toBe('300px')
        })

        test('no cycle autoplay: first dot stays active after 1s', async ({ page }) => {
            // Design init-state does not set cycle — timer never starts.
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            // First dot (index 0) should be selected → carries origam-btn--active
            const firstDot = carousel.locator('.origam-carousel__controls-item').first()
            await expect(firstDot).toHaveClass(/origam-btn--active/)
            await page.waitForTimeout(1200)
            // Still active after 1.2 s — no autoplay drift
            await expect(firstDot).toHaveClass(/origam-btn--active/)
        })
    })

    // ------------------------------------------------------------------ //
    // STATE (index 1)                                                      //
    // init: bgColor='primary', modelValue=0, show-arrows=true             //
    // ------------------------------------------------------------------ //

    test.describe('State', () => {
        test('carousel renders in State variant', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-carousel').first()).toBeVisible({ timeout: 30000 })
        })

        test('show-arrows=true exposes the arrow controls zone', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            // Window controls zone always rendered when showArrows !== false
            await expect(carousel.locator('.origam-window__controls')).toBeVisible()
        })

        test('modelValue=0 selects the first delimiter dot', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            const firstDot = carousel.locator('.origam-carousel__controls-item').first()
            await expect(firstDot).toHaveClass(/origam-btn--active/)
        })

        test('clicking the next arrow advances to slide 2 (dot 2 becomes active)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })

            // Click the next arrow
            const nextBtn = carousel.locator('.origam-window__next')
            await expect(nextBtn).toBeVisible()
            await nextBtn.click()

            // Second dot should become active
            const secondDot = carousel.locator('.origam-carousel__controls-item').nth(1)
            await expect(secondDot).toHaveClass(/origam-btn--active/, { timeout: 3000 })
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 2)                                                 //
    // init: cycle=false, showArrows=true, continuous=true, mandatory=true //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders the carousel in Functional variant', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-carousel').first()).toBeVisible({ timeout: 30000 })
        })

        test('showArrows=true: arrow controls zone is present', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            await expect(carousel.locator('.origam-window__controls')).toBeVisible()
        })

        test('delimiter strip is visible (hideDelimiters defaults to false)', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            await expect(carousel.locator('.origam-carousel__controls')).toBeVisible()
        })

        test('cycle=false: slide does not change automatically after 1.2s', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            const firstDot = carousel.locator('.origam-carousel__controls-item').first()
            await expect(firstDot).toHaveClass(/origam-btn--active/)
            await page.waitForTimeout(1200)
            await expect(firstDot).toHaveClass(/origam-btn--active/)
        })

        test('dot click navigates to the targeted slide', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })

            // Click the 3rd dot (index 2)
            const thirdDot = carousel.locator('.origam-carousel__controls-item').nth(2)
            await thirdDot.click()
            await expect(thirdDot).toHaveClass(/origam-btn--active/, { timeout: 3000 })
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - update:modelValue (index 3)                                 //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:modelValue', () => {
        test('carousel renders in Events variant', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-carousel').first()).toBeVisible({ timeout: 30000 })
        })

        test('clicking a delimiter dot changes the active dot (proxy for emit firing)', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })

            // Click the 2nd dot → update:modelValue should fire; second dot becomes active
            const secondDot = carousel.locator('.origam-carousel__controls-item').nth(1)
            await secondDot.click()
            await expect(secondDot).toHaveClass(/origam-btn--active/, { timeout: 3000 })
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Default (index 4)                                            //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('carousel renders with default slot content', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-carousel').first()).toBeVisible({ timeout: 30000 })
        })

        test('4 window items are rendered inside the default slot', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            // origam-window-item wraps each OrigamCarouselItem
            await expect(carousel.locator('.origam-window-item')).toHaveCount(4)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Additional (index 5)                                         //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Additional', () => {
        test('carousel renders with additional slot overlay', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            // The custom additional slot replaces the default __controls content
            await expect(carousel).toContainText('Custom additional content')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Item (index 6)                                               //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Item', () => {
        test('carousel renders with custom #item slot for delimiters', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            // __controls strip is still rendered (custom item slot replaces each dot)
            await expect(carousel.locator('.origam-carousel__controls')).toBeVisible()
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Prev (index 7)                                               //
    // show-arrows is set; the custom #prev slot replaces the default btn  //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Prev', () => {
        test('carousel renders in Slots - Prev variant', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            // show-arrows is set — arrow controls zone is present
            await expect(carousel.locator('.origam-window__controls')).toBeVisible()
        })

        test('custom prev slot renders ← button after navigating to slide 2', async ({ page }) => {
            await page.goto(variantUrl(7))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })

            // Navigate to slide 2 via dot so the prev arrow becomes active
            const secondDot = carousel.locator('.origam-carousel__controls-item').nth(1)
            await secondDot.click()
            await page.waitForTimeout(300)

            // The custom prev slot btn contains ← text
            await expect(carousel.locator('.origam-window__controls')).toContainText('←')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Next (index 8)                                               //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Next', () => {
        test('carousel renders in Slots - Next variant', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            await expect(carousel.locator('.origam-window__controls')).toBeVisible()
        })

        test('custom next slot renders → button from slide 0 (not last slide)', async ({ page }) => {
            await page.goto(variantUrl(8))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            // From slide 0 the next arrow should be visible
            await expect(carousel.locator('.origam-window__controls')).toContainText('→')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Arrows (index 9)                                             //
    // custom #arrows slot overrides the entire arrows zone                //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Arrows', () => {
        test('carousel renders in Slots - Arrows variant', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-carousel').first()).toBeVisible({ timeout: 30000 })
        })

        test('custom arrows slot provides the › button from slide 0', async ({ page }) => {
            await page.goto(variantUrl(9))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            // From slide 0: next button (›) should be rendered by the custom slot
            await expect(carousel).toContainText('›')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Progress (index 10)                                          //
    // cycle=true, interval=3000 — structure only (no timing asserts)      //
    // NOTE: timing assertions (exact width) are NOT testable headlessly   //
    // with determinism — rAF/setTimeout cadence is hardware-dependent.    //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Progress', () => {
        test('carousel renders in Slots - Progress variant', async ({ page }) => {
            await page.goto(variantUrl(10))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-carousel').first()).toBeVisible({ timeout: 30000 })
        })

        test('custom #progress slot outer container (height 4px) is in the DOM', async ({ page }) => {
            await page.goto(variantUrl(10))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            // The custom #progress slot renders a div with height: 4px (inline style)
            const progressOuter = carousel.locator('[style*="height: 4px"]').first()
            await expect(progressOuter).toBeVisible()
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 11)                                     //
    // init: height=300, cycle=false, showArrows=true                     //
    // ------------------------------------------------------------------ //

    test.describe('Default (Playground)', () => {
        test('carousel renders in playground variant', async ({ page }) => {
            await page.goto(variantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-carousel').first()).toBeVisible({ timeout: 30000 })
        })

        test('playground: height=300 is applied as inline style', async ({ page }) => {
            await page.goto(variantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            const h = await carousel.evaluate(el => (el as HTMLElement).style.height)
            expect(h).toBe('300px')
        })

        test('playground: 4 delimiter dots are rendered', async ({ page }) => {
            await page.goto(variantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })
            await expect(carousel.locator('.origam-carousel__controls-item')).toHaveCount(4)
        })

        test('playground: next arrow click advances slide (dot 2 becomes active)', async ({ page }) => {
            await page.goto(variantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })

            const nextBtn = carousel.locator('.origam-window__next')
            await expect(nextBtn).toBeVisible()
            await nextBtn.click()

            const secondDot = carousel.locator('.origam-carousel__controls-item').nth(1)
            await expect(secondDot).toHaveClass(/origam-btn--active/, { timeout: 3000 })
        })

        test('playground: dot click selects the matching slide', async ({ page }) => {
            await page.goto(variantUrl(11))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const carousel = sandbox.locator('.origam-carousel').first()
            await expect(carousel).toBeVisible({ timeout: 30000 })

            // Click the 4th dot
            const lastDot = carousel.locator('.origam-carousel__controls-item').nth(3)
            await lastDot.click()
            await expect(lastDot).toHaveClass(/origam-btn--active/, { timeout: 3000 })
        })
    })
})
