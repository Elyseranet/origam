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
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
        })

        test('root carries role="list" (a11y)', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root).toHaveAttribute('role', 'list')
        })

        test('Chromium headless uses the JS path (.origam-masonry--js)', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root).toHaveClass(/origam-masonry--js/)
        })

        test('JS path: 9 preview cards are wrapped in .origam-masonry__item', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            const items = sandbox.locator('.origam-masonry__item')
            await expect(items).toHaveCount(9, { timeout: 8000 })
        })

        test('each .origam-masonry__item carries role="listitem"', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            const firstItem = sandbox.locator('.origam-masonry__item').first()
            await expect(firstItem).toHaveAttribute('role', 'listitem')
        })

        test('JS path: items are positioned absolutely (bucket-fill layout)', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const gap = await root.evaluate(
                (el) => getComputedStyle(el).getPropertyValue('--origam-masonry---resolved-gap').trim()
            )
            expect(gap).not.toBe('')
        })

        test('Design variant uses component default animated=true (.origam-masonry--animated present)', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            await expect(sandbox.locator('.origam-masonry__item')).toHaveCount(16, { timeout: 8000 })
        })

        test('animated=true: .origam-masonry--animated class is present', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root).toHaveClass(/origam-masonry--animated/)
        })

        test('animated=true: items carry a non-zero transition declaration', async ({ page }) => {
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
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
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            await expect(sandbox.locator('.origam-masonry__item')).toHaveCount(9, { timeout: 8000 })
        })

        test('slot content is rendered inside each item wrapper', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            // Each item wraps a .card div from the slot
            const cardInItem = sandbox.locator('.origam-masonry__item .card').first()
            await expect(cardInItem).toBeVisible({ timeout: 8000 })
        })
    })

    // ------------------------------------------------------------------ //
    // #733 — ITEM GEOMETRY (real browser, the only valid verdict)         //
    //                                                                      //
    // The ticket reports `.origam-masonry__item` measuring 320 x 0 with a  //
    // populated column layout — i.e. items positioned but EMPTY. "The      //
    // items render" has to be a NUMBER, so these specs read                //
    // getBoundingClientRect() rather than asserting visibility.            //
    //                                                                      //
    // jsdom cannot arbitrate this: it resolves no `var()` and lays nothing //
    // out. Hence Playwright. The DOM-presence half of the same defect is   //
    // pinned in TU/components/Masonry/OrigamMasonry.slot-render.spec.ts.   //
    // ------------------------------------------------------------------ //

    test.describe('#733 — item geometry', () => {
        /**
         * POSITIVE CONTROL — run FIRST, and deliberately about the CHILD,
         * not the wrapper.
         *
         * Every assertion below concludes something from a height of 0. That
         * is an argument from absence, and it is only worth anything once the
         * harness has been shown to produce a NON-zero number on this page,
         * through this frame, with this measurement call. If the .card
         * children themselves measured 0, the story fixture would be the
         * defect and nothing could be said about OrigamMasonry.
         *
         * The story seeds explicit heights (180, 240, 110, …), so a healthy
         * fixture yields a sum well over 1000 px.
         */
        test('positive control: the seeded .card children measure non-zero height', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            await page.waitForTimeout(400)

            const heights: number[] = await sandbox.locator('.origam-masonry .card').evaluateAll(
                (els) => els.map((el) => Math.round((el as HTMLElement).getBoundingClientRect().height))
            )

            expect(heights.length).toBe(9)
            // Seeded heights are 110 px at the smallest — nothing legitimate is 0.
            expect(Math.min(...heights)).toBeGreaterThan(0)
            expect(heights.reduce((a, b) => a + b, 0)).toBeGreaterThan(1000)
        })

        test('every .origam-masonry__item has a non-zero bounding box', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            await page.waitForTimeout(400)

            const boxes: Array<{ w: number, h: number }> = await sandbox
                .locator('.origam-masonry__item')
                .evaluateAll((els) => els.map((el) => {
                    const r = (el as HTMLElement).getBoundingClientRect()
                    return { w: Math.round(r.width), h: Math.round(r.height) }
                }))

            expect(boxes.length).toBe(9)
            // Reported defect: width painted from the bucket-fill (320) but
            // height 0 because the wrapper holds nothing.
            const empty = boxes.filter((b) => b.h === 0)
            expect(
                empty.length,
                `items with height 0 (defect #733): ${JSON.stringify(boxes)}`
            ).toBe(0)
            expect(Math.min(...boxes.map((b) => b.w))).toBeGreaterThan(0)
        })

        /**
         * The wrapper must be as tall as the child it wraps. A wrapper that is
         * non-zero only because of its own padding would pass the spec above
         * while still clipping the content, so this compares the two boxes.
         */
        test('each item wrapper is as tall as the .card it wraps', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            await page.waitForTimeout(400)

            const pairs: Array<{ item: number, card: number }> = await sandbox
                .locator('.origam-masonry__item')
                .evaluateAll((els) => els.map((el) => {
                    const card = (el as HTMLElement).querySelector('.card') as HTMLElement | null
                    return {
                        item: Math.round((el as HTMLElement).getBoundingClientRect().height),
                        card: card ? Math.round(card.getBoundingClientRect().height) : -1
                    }
                }))

            expect(pairs.length).toBe(9)
            for (const p of pairs) {
                expect(p.card, `an item wrapper has no .card child: ${JSON.stringify(pairs)}`).toBeGreaterThan(0)
                expect(Math.abs(p.item - p.card)).toBeLessThanOrEqual(1)
            }
        })

        /**
         * The container height is derived from the MEASURED item heights
         * (`bucketFill` → `--origam-masonry---container-height`). Empty items
         * measure 0, so the container collapses. This checks the consequence
         * rather than the cause, and would catch a fix that restored the
         * markup but not the measurement pass.
         */
        test('container height reflects the measured items, not a collapsed 0', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await page.waitForTimeout(400)

            const h = await root.evaluate((el) => Math.round(el.getBoundingClientRect().height))
            // 9 cards over 3 columns, smallest seeded heights ⇒ several hundred px.
            expect(h).toBeGreaterThan(300)
        })
    })

    // ------------------------------------------------------------------ //
    // #733 — CHILD SURVIVAL ACROSS A RELAYOUT                              //
    //                                                                      //
    // This is the defect the #733 investigation actually found. The JS path //
    // used to place each extracted vnode inside                             //
    //     <component :is="{ render: () => child }" />                       //
    // and that object literal is rebuilt on every render pass, so Vue saw a //
    // new component type each time and DESTROYED / RECREATED the whole      //
    // child subtree rather than patching it.                                //
    //                                                                      //
    // A resize is the natural trigger: ResizeObserver → relayout →          //
    // `layout.value` changes → the root's `:style` recomputes → re-render   //
    // → (pre-fix) every child rebuilt. Measured pre-fix over ONE resize:    //
    //     117 nodes added, 117 removed, 0 of 9 children kept their node.    //
    // ------------------------------------------------------------------ //

    test.describe('#733 — children survive a relayout', () => {
        /**
         * The whole spec turns on DOM node identity, which is not directly
         * observable from Playwright — so we stamp the nodes ourselves and
         * check the stamps afterwards.
         *
         * POSITIVE CONTROL is built in and comes first: `taggedBefore` must be
         * 9. If the stamping step reached nothing, `survivors === 0` would be
         * trivially true and would prove nothing at all. The control makes the
         * difference between "the children were replaced" and "my probe never
         * found any children".
         */
        test('slot children keep their DOM nodes across a viewport resize', async ({ page }) => {
            await page.setViewportSize({ width: 1280, height: 800 })
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await page.waitForTimeout(600)

            const taggedBefore = await root.evaluate((el) => {
                const cards = el.querySelectorAll('.origam-masonry__item .card')
                cards.forEach((c, i) => { (c as HTMLElement).dataset.survivalTag = String(i) })
                return cards.length
            })
            // Positive control — the probe must have something to observe.
            expect(taggedBefore, 'probe stamped no children: the measurement below would be vacuous').toBe(9)

            // Drive a real relayout through the ResizeObserver.
            await page.setViewportSize({ width: 900, height: 800 })
            await page.waitForTimeout(800)

            const after = await root.evaluate((el) => {
                const cards = Array.from(el.querySelectorAll('.origam-masonry__item .card')) as HTMLElement[]
                return {
                    total: cards.length,
                    survivors: cards.filter((c) => c.dataset.survivalTag !== undefined).length
                }
            })

            expect(after.total).toBe(9)
            expect(
                after.survivors,
                'children were rebuilt by the relayout instead of patched (#733)'
            ).toBe(9)
        })

        /**
         * Same defect seen from the other side: a rebuild re-runs the child's
         * mount-time side effects. We can't inject a component into the story,
         * but a CSS transition is state the browser owns per-element, and a
         * rebuilt element restarts it. Simpler and more robust: assert the
         * relayout produced NO childList churn under the items.
         */
        test('a relayout patches the items instead of rebuilding them', async ({ page }) => {
            await page.setViewportSize({ width: 1280, height: 800 })
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await page.waitForTimeout(600)

            await root.evaluate((el) => {
                const w = window as unknown as Record<string, unknown>
                const churn = { added: 0, removed: 0 }
                w.__masonryChurn = churn
                const mo = new MutationObserver((recs) => {
                    for (const r of recs) {
                        churn.added += r.addedNodes.length
                        churn.removed += r.removedNodes.length
                    }
                })
                w.__masonryMo = mo
                mo.observe(el, { childList: true, subtree: true })
            })

            await page.setViewportSize({ width: 900, height: 800 })
            await page.waitForTimeout(800)

            const churn = await root.evaluate(() => {
                const w = window as unknown as Record<string, any>
                w.__masonryMo.disconnect()
                return w.__masonryChurn as { added: number, removed: number }
            })

            // Pre-fix this read 117 / 117. A patching relayout only rewrites
            // inline styles, which are attribute mutations, not childList ones.
            expect(churn.removed, `nodes removed during a pure relayout: ${JSON.stringify(churn)}`).toBe(0)
            expect(churn.added, `nodes added during a pure relayout: ${JSON.stringify(churn)}`).toBe(0)
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 3)                                       //
    // init: { columns: 3, gap: 'md', animated: true, align: 'top' }       //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('playground renders the masonry root', async ({ page }) => {
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
        })

        test('playground: 16 items are rendered', async ({ page }) => {
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-masonry').first()).toBeVisible({ timeout: 30000 })
            await expect(sandbox.locator('.origam-masonry__item')).toHaveCount(16, { timeout: 8000 })
        })

        test('playground: gap token resolves to a non-empty CSS value', async ({ page }) => {
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-masonry').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const gap = await root.evaluate(
                (el) => getComputedStyle(el).getPropertyValue('--origam-masonry---resolved-gap').trim()
            )
            expect(gap).not.toBe('')
        })

        test('playground shuffle button reorders items', async ({ page }) => {
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
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
            // 2026-08-17 — REASON RE-MEASURED, AND IT IS A REAL LIMITATION.
            //
            // The old wording ("requires the experimental flag") implied that
            // passing the flag would be enough, which would have made this a
            // false limitation. It is not. Probed by launching the chromium
            // project with
            //   test.use({ launchOptions: { args: ['--enable-experimental-web-platform-features'] } })
            // against this worktree's static Histoire. Result on
            // Chrome/147.0.7727.15:
            //
            //   CSS.supports('grid-template-rows', 'masonry')  -> false
            //   CSS.supports('grid-template',      'masonry')  -> false
            //   CSS.supports('item-flow',      'row masonry')  -> false
            //
            // The flag does not unlock it in this Chromium build — neither the
            // original `grid-template-rows: masonry` syntax nor the newer
            // `item-flow` one. So the CSS path CANNOT be activated here by any
            // launch option, and the component's `useCssSupport` branch always
            // takes the JS fallback under test.
            //
            // Unit tests cover the pure helpers (pickColumnsForWidth,
            // bucketFill) in packages/tests/TU/.
            //
            // TO LIFT: re-run the three CSS.supports probes above after a
            // Playwright chromium bump. The day any of them returns true, this
            // test becomes writable — assert `.origam-masonry--css` is the
            // active path and that items flow without the JS column buckets.
        }
    )
})
