import { expect, test } from '@playwright/test'

/**
 * OrigamMasonry — runtime behaviour specs.
 *
 * ## Variants (index → title)
 *   0 → Design         init: { columns: 3, gap: 'md' }, 9 preview cards
 *   1 → Functional     init: { columns: 3, gap: 'md', animated: true, align: 'top' }, 16 shufflable cards
 *   2 → Slots - Default  9 preview cards, no state
 *   3 → Default (playground) init: { columns: 3, gap: 'md', animated: true, align: 'top' }, 16 shufflable cards
 *
 * ## BEM root + JS path classes (Chromium headless has NO masonry CSS support)
 *   .origam-masonry              — root element (role="list")
 *   .origam-masonry--js          — always present in headless Chromium
 *   .origam-masonry--animated    — when animated=true
 *   .origam-masonry__item        — JS-path wrapper around each slot child
 *                                  (role="listitem", position: absolute)
 *
 * ## Cold-start note
 *   Histoire compiles components on demand via Vite. The Masonry story
 *   cold-start (ResizeObserver + rAF chain) can take 20-30 s on first
 *   navigation. A warmup pass in beforeAll primes the Vite transform cache
 *   so subsequent navigations complete in < 5 s. Test timeout is 60 s.
 *
 * ## Non-testable headless
 *   - CSS masonry path (.origam-masonry--css): requires the experimental
 *     grid-template-rows:masonry flag that Chromium headless does not enable.
 *     Documented with test.fixme() below.
 *   - animation: transition fires in browser after a layout pass — only the
 *     CSS transition declaration is asserted (not the runtime motion).
 */

const STORY_ID   = 'components-stories-masonry-origammasonry-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

/**
 * The first load of any story triggers Vite on-demand transform of all
 * transitive imports. For Masonry this includes useMasonry (ResizeObserver)
 * and related composables — the chain can take 20-30 s on a cold server.
 * We warm the cache once in beforeAll so every subsequent test navigates
 * to an already-compiled story and resolves in < 5 s.
 */
const WARM_TIMEOUT = 40000

test.describe('OrigamMasonry', () => {
    test.setTimeout(60000)

    // Prewarm: navigate to variant 0 and wait for the masonry root to appear.
    // This primes the Vite transform cache for the whole story file.
    test.beforeAll(async ({ browser }) => {
        const ctx = await browser.newContext()
        const page = await ctx.newPage()
        await page.goto(variantUrl(0))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await sandbox.locator('.origam-masonry').first().waitFor({ state: 'visible', timeout: WARM_TIMEOUT })
        await ctx.close()
    })

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: columns=3, gap='md', 9 preview cards                          //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the masonry root with BEM class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
        })

        test('root carries role="list" (a11y)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root).toHaveAttribute('role', 'list')
        })

        test('Chromium headless uses the JS path (.origam-masonry--js)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root).toHaveClass(/origam-masonry--js/)
        })

        test('JS path: 9 preview cards are wrapped in .origam-masonry__item', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            const items = sandbox.locator('.origam-masonry__item')
            await expect(items).toHaveCount(9, { timeout: 8000 })
        })

        test('each .origam-masonry__item carries role="listitem"', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            const firstItem = sandbox.locator('.origam-masonry__item').first()
            await expect(firstItem).toHaveAttribute('role', 'listitem')
        })

        test('JS path: items are positioned absolutely (bucket-fill layout)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            // Allow one rAF for the first relayout to fire
            await page.waitForTimeout(200)
            const position = await sandbox.locator('.origam-masonry__item').first().evaluate(
                (el) => getComputedStyle(el).position
            )
            expect(position).toBe('absolute')
        })

        test('columns=3: items distribute into 3 distinct horizontal positions', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            await page.waitForTimeout(300)

            const lefts: number[] = await sandbox.locator('.origam-masonry__item').evaluateAll((els) =>
                els.map((el) => Math.round((el as HTMLElement).getBoundingClientRect().left))
            )
            // Bucket left values: within 4 px → same column
            const sorted = [...lefts].sort((a, b) => a - b)
            const clusters: number[] = []
            for (const l of sorted) {
                if (clusters.length === 0 || Math.abs(l - clusters[clusters.length - 1]) > 4) {
                    clusters.push(l)
                }
            }
            expect(clusters.length).toBe(3)
        })

        test('--origam-masonry---resolved-gap is set on the root (token bridge)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const gap = await root.evaluate(
                (el) => getComputedStyle(el).getPropertyValue('--origam-masonry---resolved-gap').trim()
            )
            expect(gap).not.toBe('')
        })

        test('Design variant uses component default animated=true (.origam-masonry--animated present)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            // The Design variant passes no animated prop → component default is true → class IS present
            await expect(root).toHaveClass(/origam-masonry--animated/)
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: { columns: 3, gap: 'md', animated: true, align: 'top' }       //
    // 16 shufflable cards                                                  //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('renders 16 cards as masonry items', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            await expect(sandbox.locator('.origam-masonry__item')).toHaveCount(16, { timeout: 8000 })
        })

        test('animated=true: .origam-masonry--animated class is present', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root).toHaveClass(/origam-masonry--animated/)
        })

        test('animated=true: items carry a non-zero transition declaration', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            await page.waitForTimeout(200)
            const firstItem = sandbox.locator('.origam-masonry__item').first()
            const transition = await firstItem.evaluate((el) => getComputedStyle(el).transition)
            // Animated JS items declare top/left/width/transform transitions
            expect(transition).not.toBe('')
            // Must NOT be "all 0s ease 0s" (no-op)
            expect(transition).not.toMatch(/^all 0s/)
        })

        test('columns=3: 16 items distributed into 3 horizontal columns', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            await page.waitForTimeout(300)

            const lefts: number[] = await sandbox.locator('.origam-masonry__item').evaluateAll((els) =>
                els.map((el) => Math.round((el as HTMLElement).getBoundingClientRect().left))
            )
            const sorted = [...lefts].sort((a, b) => a - b)
            const clusters: number[] = []
            for (const l of sorted) {
                if (clusters.length === 0 || Math.abs(l - clusters[clusters.length - 1]) > 4) {
                    clusters.push(l)
                }
            }
            expect(clusters.length).toBe(3)
        })

        test('JS layout: container height CSS var is set and > 0', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await page.waitForTimeout(300)
            const h = await root.evaluate(
                (el) => getComputedStyle(el).getPropertyValue('--origam-masonry---container-height').trim()
            )
            expect(h).not.toBe('')
            const numeric = parseFloat(h)
            expect(numeric).toBeGreaterThan(0)
        })

        test('shuffle button reorders items in the DOM', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            await page.waitForTimeout(300)

            const before: string[] = await sandbox.locator('.origam-masonry__item').evaluateAll((els) =>
                els.map((el) => (el as HTMLElement).textContent?.trim() ?? '')
            )

            await sandbox.locator('button.story-btn').click()
            await page.waitForTimeout(400)

            const after: string[] = await sandbox.locator('.origam-masonry__item').evaluateAll((els) =>
                els.map((el) => (el as HTMLElement).textContent?.trim() ?? '')
            )

            // With 16 items the probability of an identical random shuffle is 1/16! ≈ 0
            expect(after).not.toEqual(before)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - DEFAULT (index 2)                                            //
    // 9 preview cards, no state, slot default                             //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('slot renders 9 cards as masonry items', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            await expect(sandbox.locator('.origam-masonry__item')).toHaveCount(9, { timeout: 8000 })
        })

        test('slot content is rendered inside each item wrapper', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            // Each item wraps a .card div from the slot
            const cardInItem = sandbox.locator('.origam-masonry__item .card').first()
            await expect(cardInItem).toBeVisible({ timeout: 8000 })
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 3)                                       //
    // init: { columns: 3, gap: 'md', animated: true, align: 'top' }       //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('playground renders the masonry root', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
        })

        test('playground: 16 items are rendered', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            await expect(sandbox.locator('.origam-masonry__item')).toHaveCount(16, { timeout: 8000 })
        })

        test('playground: gap token resolves to a non-empty CSS value', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const gap = await root.evaluate(
                (el) => getComputedStyle(el).getPropertyValue('--origam-masonry---resolved-gap').trim()
            )
            expect(gap).not.toBe('')
        })

        test('playground shuffle button reorders items', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            await page.waitForTimeout(300)

            const before: string[] = await sandbox.locator('.origam-masonry__item').evaluateAll((els) =>
                els.map((el) => (el as HTMLElement).textContent?.trim() ?? '')
            )

            await sandbox.locator('button.story-btn').click()
            await page.waitForTimeout(400)

            const after: string[] = await sandbox.locator('.origam-masonry__item').evaluateAll((els) =>
                els.map((el) => (el as HTMLElement).textContent?.trim() ?? '')
            )
            expect(after).not.toEqual(before)
        })
    })

    // ------------------------------------------------------------------ //
    // CSS MASONRY PATH — non-testable in headless Chromium                 //
    // ------------------------------------------------------------------ //

    test.fixme(
        'CSS path (.origam-masonry--css): grid-template-rows:masonry requires the experimental flag',
        async () => {
            // grid-template-rows: masonry is behind chrome://flags/#enable-experimental-web-platform-features.
            // Headless Chromium does not enable it. The CSS path is therefore
            // never activated in this suite. Unit tests cover the pure helpers
            // (pickColumnsForWidth, bucketFill) in packages/tests/TU/.
            // To test the CSS path manually: launch Chrome with
            //   --enable-experimental-web-platform-features
            // and navigate to http://localhost:6006/stories/story/<STORY_ID>.
        }
    )
})
