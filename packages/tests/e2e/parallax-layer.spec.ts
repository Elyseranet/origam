import { expect, test } from '@playwright/test'

import { fillHstNumber } from './_support/histoire-controls'

/**
 * Regression coverage for #449 — `<OrigamParallaxLayer>`'s `speed` /
 * `offsetX` / `offsetY` used to be captured ONCE, at mount, into the
 * parent's registry. Changing them reactively afterwards had ZERO effect
 * on the running animation: the rAF loop / CSS scroll-driven path both
 * read the frozen registry entry directly, never Vue reactivity.
 *
 * This can only be proven against a REAL browser — jsdom has no
 * IntersectionObserver and no layout engine (see the sibling composable
 * spec's rationale, packages/tests/TU/composables/Parallax/parallax-update.composable.spec.ts).
 *
 * Pattern canonique — navigation directe par variantId (cf. parallax.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamParallaxLayer (0-based):
 *   0 → Design
 *   1 → Slots - Default
 *   2 → Default (playground)
 */

const STORY_ID   = 'components-stories-parallax-origamparallaxlayer-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamParallaxLayer — Design variant renders', () => {

    test('renders the host and the layer', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-parallax').first()).toBeVisible({ timeout: 12000 })
        await expect(sandbox.locator('.origam-parallax__layer').first()).toBeVisible()
    })
})

test.describe('OrigamParallaxLayer — reactive speed (#449)', () => {

    test('changing speed after mount changes the running transform, at the SAME scroll position', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const layer = sandbox.locator('.origam-parallax__layer').first()

        await expect(layer).toBeVisible({ timeout: 12000 })

        // Variant uses PARALLAX_EASING.EASE_OUT — the JS rAF path (never
        // CSS-driven, that only ever engages for 'linear'), NON-spring
        // branch: `applyLayerTransforms` sets `transform` DIRECTLY from the
        // freshly computed target every frame, no lerp/smoothing delay.
        // (SPRING was tried first and rejected: its damped lerp keeps
        // visibly drifting toward a FIXED target for a few hundred ms after
        // any scroll, so "the transform changed" was true even against the
        // pre-fix code — a false positive with no relation to the prop
        // change. EASE_OUT removes that source of flakiness entirely: at a
        // constant scroll position, the transform is provably stable
        // BEFORE the prop change and only moves because of it.)
        // The rAF loop keeps re-scheduling itself every frame while the
        // host is in the viewport, so no further scroll is needed to
        // observe a speed change — only a moment for the loop to prime.
        await sandbox.locator('body').evaluate(async () => {
            const win = window
            win.document.body.style.minHeight = '400vh'
            win.scrollTo({ top: 300, behavior: 'auto' })
            win.dispatchEvent(new Event('scroll'))
            await new Promise(r => setTimeout(r, 300))
        })

        const beforeChange = await layer.evaluate((el) => getComputedStyle(el).transform)
        await page.waitForTimeout(200)
        const stillStable = await layer.evaluate((el) => getComputedStyle(el).transform)
        expect(stillStable, 'sanity check: the transform must be STABLE at a fixed scroll position before we touch speed, or a later difference would prove nothing').toBe(beforeChange)

        await fillHstNumber(page, 'Speed', 2)

        await page.waitForTimeout(300)

        const afterChange = await layer.evaluate((el) => getComputedStyle(el).transform)

        expect(afterChange, 'the layer transform must react to the speed change without any further scroll').not.toBe(beforeChange)
    })

    test('changing offsetX/offsetY after mount changes the running transform', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const layer = sandbox.locator('.origam-parallax__layer').first()

        await expect(layer).toBeVisible({ timeout: 12000 })

        await sandbox.locator('body').evaluate(async () => {
            const win = window
            win.document.body.style.minHeight = '400vh'
            win.scrollTo({ top: 300, behavior: 'auto' })
            win.dispatchEvent(new Event('scroll'))
            await new Promise(r => setTimeout(r, 300))
        })

        const beforeChange = await layer.evaluate((el) => getComputedStyle(el).transform)
        await page.waitForTimeout(200)
        const stillStable = await layer.evaluate((el) => getComputedStyle(el).transform)
        expect(stillStable, 'sanity check: the transform must be STABLE at a fixed scroll position before we touch offsetX/offsetY, or a later difference would prove nothing').toBe(beforeChange)

        await fillHstNumber(page, 'Offset X', 150)
        await fillHstNumber(page, 'Offset Y', 150)

        await page.waitForTimeout(300)

        const afterChange = await layer.evaluate((el) => getComputedStyle(el).transform)

        expect(afterChange, 'the layer transform must react to offsetX/offsetY changes without any further scroll').not.toBe(beforeChange)
    })
})
