import { expect, test } from '@playwright/test'

/**
 * E2E spec — OrigamTimeline
 *
 * Story : packages/stories/components/stories/Timeline/OrigamTimeline.story.vue
 * Variants (0-based) :
 *   0 → Design        init: { color:'primary', density:'default', size:'default' }
 *   1 → Functional    init: { orientation:'vertical', side:'start', truncateLine:false }
 *   2 → Slots - Default   2 manual items (v1.0.0 + v0.9-rc); isLast=true on second
 *   3 → Default (playground) — v-bind="state", same releaseEntries as Design
 *
 * Pattern canonique : navigation directe par variantId (cf. btn.spec.ts recipe).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Bug DS connu (#20) : OrigamTimelineItem — icône du dot est rendue avec
 * size=10 hardcodé (packages/ds/src/components/Timeline/OrigamTimelineItem.vue:9).
 * Le test qui le couvre est marqué test.fixme.
 */

const STORY_ID   = 'components-stories-timeline-origamtimeline-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamTimeline', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { color:'primary', density:'default', size:'default' }        //
    // releaseEntries : 4 items (primary, success, info, warning)          //
    // ------------------------------------------------------------------ //

    test.describe('Design (variant 0)', () => {

        test('timeline root carries BEM class and orientation-vertical modifier', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            await expect(timeline).toHaveClass(/origam-timeline--orientation-vertical/)
        })

        test('four items are rendered from releaseEntries', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            const items = timeline.locator('.origam-timeline-item')
            await expect(items).toHaveCount(4)
        })

        test('each item owns a dot element', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            const dots = timeline.locator('.origam-timeline-item__dot')
            await expect(dots).toHaveCount(4)
        })

        test('four connectors are present (truncateLine=false, isLast computed per index)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            // OrigamTimeline sets isLast = (index === items.length - 1) on each child.
            // With truncateLine=false (default), showConnector is always true → 4 connectors.
            const connectors = timeline.locator('.origam-timeline-item__connector')
            await expect(connectors).toHaveCount(4)
        })

        test('dot styles carry the intent token reference for each entry', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })

            const items = timeline.locator('.origam-timeline-item')

            // item 0 = primary, item 1 = success — verify the tokens differ
            const primaryDotBg = await items.nth(0).locator('.origam-timeline-item__dot').evaluate(
                el => (el as HTMLElement).style.getPropertyValue('--origam-timeline-item---dot-bg')
            )
            const successDotBg = await items.nth(1).locator('.origam-timeline-item__dot').evaluate(
                el => (el as HTMLElement).style.getPropertyValue('--origam-timeline-item---dot-bg')
            )

            expect(primaryDotBg).toContain('primary')
            expect(successDotBg).toContain('success')
            expect(primaryDotBg).not.toEqual(successDotBg)
        })

        test('timeline has role=list and each item has role=listitem (a11y)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            await expect(timeline).toHaveAttribute('role', 'list')
            const firstItem = timeline.locator('.origam-timeline-item').first()
            await expect(firstItem).toHaveAttribute('role', 'listitem')
        })

        // Bug DS #20 — OrigamTimelineItem icône du dot hardcodée à size=10
        // (packages/ds/src/components/Timeline/OrigamTimelineItem.vue ligne 9)
        // La prop `size` du timeline parent (via tokens CSS) n'affecte pas la
        // taille réelle de l'OrigamIcon injecté dans le dot.
        // Ce test est marqué fixme jusqu'à correction du DS.
        test.fixme('dot icon size respects the timeline size token (DS bug #20 — hardcoded size=10)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            // When fixed: icon inside dot should use var(--origam-timeline---dot-size)
            // instead of the hardcoded literal 10.
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: { orientation:'vertical', side:'start', truncateLine:false }  //
    // ------------------------------------------------------------------ //

    test.describe('Functional (variant 1)', () => {

        test('side=start applies origam-timeline--side-start on root', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            await expect(timeline).toHaveClass(/origam-timeline--side-start/)
        })

        test('side=start items carry origam-timeline-item--side-start class', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            const firstItem = timeline.locator('.origam-timeline-item').first()
            await expect(firstItem).toHaveClass(/origam-timeline-item--side-start/)
        })

        test('truncateLine=false keeps connector on the last item (showConnector=true)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            const items = timeline.locator('.origam-timeline-item')
            const lastItem = items.last()
            // showConnector is true when truncateLine=false regardless of isLast
            await expect(lastItem.locator('.origam-timeline-item__connector')).toBeVisible({ timeout: 8000 })
        })

        test('last item carries origam-timeline-item--last class', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            const items = timeline.locator('.origam-timeline-item')
            await expect(items.last()).toHaveClass(/origam-timeline-item--last/)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - DEFAULT (index 2)                                            //
    // 2 manual items via slot : v1.0.0 (isLast=false) + v0.9-rc (isLast=true) //
    // Second item: truncateLine not set → showConnector = true            //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default (variant 4)', () => {

        test('timeline renders with two manually-slotted items', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            const items = timeline.locator('.origam-timeline-item')
            await expect(items).toHaveCount(2)
        })

        test('default slot overrides the item body (renders a <ul> list)', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            // Item 0 (v1.0.0) provides a #default slot containing a <ul>
            const firstItem = timeline.locator('.origam-timeline-item').first()
            const list = firstItem.locator('ul')
            await expect(list).toBeVisible({ timeout: 8000 })
        })

        test('item title texts are rendered correctly from slot', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            // Item titles are rendered inside span.origam-timeline-item__title
            // BUT: this story uses #default slot which REPLACES the header/body.
            // v1.0.0 slot has <strong>v1.0.0 — Stable release</strong>
            const firstItem = timeline.locator('.origam-timeline-item').first()
            await expect(firstItem).toContainText('v1.0.0')
        })

        test('second item (isLast=true) carries origam-timeline-item--last class', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            const secondItem = timeline.locator('.origam-timeline-item').nth(1)
            await expect(secondItem).toHaveClass(/origam-timeline-item--last/)
        })

        test('first item (isLast=false) does NOT carry origam-timeline-item--last', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            const firstItem = timeline.locator('.origam-timeline-item').first()
            await expect(firstItem).not.toHaveClass(/origam-timeline-item--last/)
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 3)                                      //
    // init: { orientation:'vertical', side:'start', truncateLine:false,   //
    //         color:undefined, density:'default', size:'default' }        //
    // releaseEntries : 4 items                                            //
    // ------------------------------------------------------------------ //

    test.describe('Default playground (variant 5)', () => {

        test('timeline root renders with four items in playground state', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            const items = timeline.locator('.origam-timeline-item')
            await expect(items).toHaveCount(4)
        })

        test('each item renders a title from the releaseEntries data', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            const titles = timeline.locator('.origam-timeline-item__title')
            await expect(titles).toHaveCount(4)
            await expect(titles.first()).toContainText('v1.0.0')
        })

        test('each item renders a subtitle', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            const subtitles = timeline.locator('.origam-timeline-item__subtitle')
            await expect(subtitles).toHaveCount(4)
        })

        test('each item renders a description in the body', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            const bodies = timeline.locator('.origam-timeline-item__body')
            await expect(bodies).toHaveCount(4)
        })

        test('orientation-vertical is applied by default', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const timeline = sandbox.locator('.origam-timeline').first()
            await expect(timeline).toBeVisible({ timeout: 12000 })
            await expect(timeline).toHaveClass(/origam-timeline--orientation-vertical/)
        })
    })
})
