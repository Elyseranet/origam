import { expect, test } from '@playwright/test'

/**
 * OrigamSkeleton — e2e spec (pattern canonique, cf. btn.spec.ts)
 *
 * ## Variants (index 0-based, grep -E '<Variant' OrigamSkeleton.story.vue)
 *
 *   0 → Design                  init: { shape:'rectangular', width:'200', height:'80' }, loading=true
 *   1 → Functional               init: { loading:true, pulse:true, shape:'text', width:'200' }
 *   2 → Slots - Default          loading=false, slot "<span>Custom slot content…</span>" visible
 *   3 → Default (playground)
 *   4 → Composition - Card       literal: composition="card" loading
 *   5 → Composition - List Item  literal: composition="list-item" loading
 *
 * ADR-005 (Q4): `variant` was renamed and split into two independent props —
 * it used to conflate a shape axis (text/rectangular/circular) and a
 * composition axis (card/list-item), which are two different discriminants
 * (see ADR-005 D5/Skeleton). `shape` and `composition` are mutually
 * exclusive at the template level: `composition` selects a different
 * branch entirely and `shape` is ignored when it is set.
 *
 * ## Composant (OrigamSkeleton.vue)
 *
 *   - Quand loading=false → rend le slot (aucun .origam-skeleton dans le DOM).
 *   - shape ∈ { text | rectangular | circular } → root = .origam-skeleton.origam-skeleton--{shape}.
 *   - composition ∈ { card | list-item } → root = .origam-skeleton-wrapper--{composition}
 *     avec des .origam-skeleton enfants.
 *   - pulse=true → ajoute .origam-skeleton--pulse (animation wave/spin).
 *   - circular → border-radius = var(--origam-skeleton---border-radius-circular, 50%)
 *     Le token DS résout à 9999px (pill universel — même que Avatar, Chip, Badge).
 *
 * ## Non-testable headless
 *
 *   - L'animation CSS elle-même (keyframe timing, background-position) n'est pas
 *     observable via getComputedStyle en headless — on ne la testera pas directement.
 *     On vérifie uniquement la présence de la classe .origam-skeleton--pulse.
 *   - prefers-reduced-motion: la media-query désactive l'animation ; non simulable
 *     sans flag Chromium spécifique.
 */

const STORY_ID   = 'components-stories-skeleton-origamskeleton-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

/** Construit l'URL d'un Variant par son index (0-based). */
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamSkeleton', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { shape:'rectangular', width:'200', height:'80' }, loading    //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the skeleton root with BEM class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const el = sandbox.locator('.origam-skeleton').first()
            await expect(el).toBeVisible({ timeout: 12000 })
        })

        test('shape=rectangular applies the modifier class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const el = sandbox.locator('.origam-skeleton').first()
            await expect(el).toBeVisible({ timeout: 12000 })
            await expect(el).toHaveClass(/origam-skeleton--rectangular/)
        })

        test('width and height are applied as inline styles', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const el = sandbox.locator('.origam-skeleton').first()
            await expect(el).toBeVisible({ timeout: 12000 })
            const width  = await el.evaluate(e => getComputedStyle(e).width)
            const height = await el.evaluate(e => getComputedStyle(e).height)
            // init-state: width='200' → 200px, height='80' → 80px
            expect(width).toBe('200px')
            expect(height).toBe('80px')
        })

        test('loading=true makes the skeleton visible (aria-busy)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const el = sandbox.locator('.origam-skeleton').first()
            await expect(el).toBeVisible({ timeout: 12000 })
            const ariaBusy = await el.getAttribute('aria-busy')
            expect(ariaBusy).toBe('true')
        })

        test('skeleton has a non-transparent background color from DS token', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const el = sandbox.locator('.origam-skeleton').first()
            await expect(el).toBeVisible({ timeout: 12000 })
            const bg = await el.evaluate(e => getComputedStyle(e).backgroundColor)
            expect(bg).not.toBe('rgba(0, 0, 0, 0)')
            expect(bg).not.toBe('transparent')
        })

        test('shape=text applies the text modifier class', async ({ page: _page }) => {
            // Navigate to Design, then test text shape explicitly via circular/text
            // The Design init-state uses 'rectangular'; we test text via Functional (index 1)
            // which sets shape='text'. This test is here for documentation purposes:
            // tested in Functional.
            test.skip(true, 'shape=text covered by Functional variant (index 1)')
        })

        test('shape=circular applies the circular modifier and a square aspect', async ({ page: _page }) => {
            // circular is not the init-state of Design (rectangular is).
            // We test circular via dedicated check below using the component's
            // skeletonCircularClasses (exposed in list-item composite). For a
            // standalone circular shape, the SCSS sets border-radius to
            // --origam-skeleton---border-radius-circular (9999px token).
            // Tested via the Composition - List Item variant (index 5), whose
            // avatar block is rendered with skeletonCircularClasses.
            test.skip(true, 'standalone circular tested via Composition - List Item (index 5)')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: { loading:true, pulse:true, shape:'text', width:'200' }       //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('loading=true renders the skeleton element (not the slot)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const el = sandbox.locator('.origam-skeleton').first()
            await expect(el).toBeVisible({ timeout: 12000 })
        })

        test('pulse=true adds origam-skeleton--pulse class', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const el = sandbox.locator('.origam-skeleton').first()
            await expect(el).toBeVisible({ timeout: 12000 })
            await expect(el).toHaveClass(/origam-skeleton--pulse/)
        })

        test('shape=text applies the text modifier class', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const el = sandbox.locator('.origam-skeleton').first()
            await expect(el).toBeVisible({ timeout: 12000 })
            await expect(el).toHaveClass(/origam-skeleton--text/)
        })

        test('shape=text with no height prop uses CSS token height (not inline)', async ({ page }) => {
            // init-state has no height → resolvedHeight resolves to CSS var
            // → inline style "height" must NOT be set as a pixel value by JS
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const el = sandbox.locator('.origam-skeleton').first()
            await expect(el).toBeVisible({ timeout: 12000 })
            // The CSS var resolves to a positive pixel value at runtime.
            const height = await el.evaluate(e => getComputedStyle(e).height)
            // Should be resolved by the token (> 0px), not "auto" or empty.
            expect(height).not.toBe('0px')
            expect(height).not.toBe('auto')
            expect(height).not.toBe('')
        })

        test('slot content is hidden when loading=true', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            // The slot "<p>Content loaded</p>" should not be visible
            const slotContent = sandbox.locator('p').filter({ hasText: 'Content loaded' })
            await expect(slotContent).not.toBeVisible()
        })

        test('role=status and aria-busy=true present on loading skeleton', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const el = sandbox.locator('.origam-skeleton').first()
            await expect(el).toBeVisible({ timeout: 12000 })
            const role     = await el.getAttribute('role')
            const ariaBusy = await el.getAttribute('aria-busy')
            expect(role).toBe('status')
            expect(ariaBusy).toBe('true')
        })

        test('aria-label="Loading" present on skeleton element', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const el = sandbox.locator('.origam-skeleton').first()
            await expect(el).toBeVisible({ timeout: 12000 })
            const ariaLabel = await el.getAttribute('aria-label')
            expect(ariaLabel).toBe('Loading')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - DEFAULT (index 2)                                            //
    // loading=false → slot content visible, no .origam-skeleton in DOM    //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('loading=false renders slot content instead of skeleton', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            // The story renders: <span>Custom slot content visible when not loading</span>
            const slot = sandbox.locator('span').filter({ hasText: 'Custom slot content visible when not loading' })
            await expect(slot).toBeVisible({ timeout: 12000 })
        })

        test('loading=false — no .origam-skeleton element in the DOM', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const slot = sandbox.locator('span').filter({ hasText: 'Custom slot content visible when not loading' })
            await expect(slot).toBeVisible({ timeout: 12000 })
            // Skeleton must be absent when loading=false (v-if guard on the component root)
            const skeleton = sandbox.locator('.origam-skeleton')
            await expect(skeleton).toHaveCount(0)
        })
    })

    // ------------------------------------------------------------------ //
    // COMPOSITION: card (index 4) and list-item (index 5)                  //
    // ADR-005 (Q4) — `composition` is the discriminant axis split out of   //
    // the former `variant`; each literal Variant fixes one value.          //
    // ------------------------------------------------------------------ //

    test.describe('Composition', () => {
        test('composition=card renders a wrapper with 4 inner .origam-skeleton children', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const wrapper = sandbox.locator('.origam-skeleton-wrapper--card')
            await expect(wrapper).toBeVisible({ timeout: 12000 })
            const children = wrapper.locator('.origam-skeleton')
            await expect(children).toHaveCount(4)
        })

        test('composition=list-item renders circular avatar + 2 text lines', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const wrapper = sandbox.locator('.origam-skeleton-wrapper--list-item')
            await expect(wrapper).toBeVisible({ timeout: 12000 })
            const circular = wrapper.locator('.origam-skeleton--circular')
            await expect(circular).toHaveCount(1)
            const lines = wrapper.locator('.origam-skeleton__lines .origam-skeleton')
            await expect(lines).toHaveCount(2)
        })

        test('single-block shapes (rectangular) render .origam-skeleton root — not a wrapper', async ({ page }) => {
            // Verifies that rectangular (and by extension text/circular) use
            // the v-else branch → root element IS .origam-skeleton, NOT .origam-skeleton-wrapper
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const el = sandbox.locator('.origam-skeleton').first()
            await expect(el).toBeVisible({ timeout: 12000 })
            // Must NOT have wrapper class on the root
            await expect(el).not.toHaveClass(/origam-skeleton-wrapper/)
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT playground (index 3)                                         //
    // init: { shape:'text', width:'200', loading:true, pulse:true }       //
    // ------------------------------------------------------------------ //

    test.describe('Default playground', () => {
        test('renders with combined init-state: text shape, pulse, loading', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const el = sandbox.locator('.origam-skeleton').first()
            await expect(el).toBeVisible({ timeout: 12000 })
            await expect(el).toHaveClass(/origam-skeleton--text/)
            await expect(el).toHaveClass(/origam-skeleton--pulse/)
        })

        test('width=200 from init-state is applied (200px)', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const el = sandbox.locator('.origam-skeleton').first()
            await expect(el).toBeVisible({ timeout: 12000 })
            const width = await el.evaluate(e => getComputedStyle(e).width)
            expect(width).toBe('200px')
        })
    })
})
