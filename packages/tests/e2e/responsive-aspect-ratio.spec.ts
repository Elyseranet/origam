import { expect, test, type FrameLocator, type Locator, type Page } from '@playwright/test'
import { fillHstNumber, fillHstText, selectHstOption } from './_support/histoire-controls'

/**
 * #709 — `OrigamResponsive` used alone does not hold the height of its own
 * ratio.
 *
 * MECHANISM (measured, not inferred — see the A/B in the PR body)
 * ---------------------------------------------------------------
 * `useAspectRatio` used to emit two literal styles that are exactly
 * opposite:
 *
 *     aspectStyles  -> `padding-block-end: ${p}%`   on `__sizer`
 *     contentStyles -> `margin-block-start: -${p}%` on `__content`
 *
 * `.origam-responsive` is `display:flex; flex-direction:column`, so the root
 * height resolves to `sizer(p) + margin(-p) + content = content`. The sizer's
 * entire contribution is cancelled by the pull-back margin that overlays the
 * content on top of it (#454).
 *
 * The cancellation only bites when the DEFAULT slot is filled — `__content`
 * is `v-if="slots.default"`. That is precisely why `OrigamImg` looked healthy:
 * its variants render into `#additional`, never `#default`, so no negative
 * margin was ever emitted and the sizer's height survived. The bug was never
 * "Responsive is broken and Img is fine"; it was "the pull-back cancels the
 * sizer whenever both exist".
 *
 * THE FIX — `aspect-ratio` on the root (CLAUDE.md "CSS-first": the property
 * is the first choice, the padding-bottom hack the fallback). The sizer and
 * the pull-back margin both disappear, so there is nothing left to cancel.
 *
 * WHAT THIS SPEC PINS
 * -------------------
 *  - correctness  : Responsive alone holds `height == width / ratio`
 *  - non-regression: Img and CarouselItem keep the boxes they already had
 *  - positive control: every ratio assertion is paired with a ratio CHANGE
 *    that must move the measured height. A geometry test that never sees the
 *    number move is not evidence the harness can actuate the prop at all.
 *
 * Variant indices come from the built `histoire.json` manifest, not from
 * counting `<Variant>` tags by eye.
 */

const RESPONSIVE_ID = 'components-stories-responsive-origamresponsive-story-vue'
const IMG_ID = 'components-stories-img-origamimg-story-vue'
const CAROUSEL_ITEM_ID = 'components-stories-carousel-origamcarouselitem-story-vue'

const variantUrl = (storyId: string, idx: number) =>
    `/stories/story/${storyId}?variantId=${storyId}-${idx}`

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

/** Sub-pixel tolerance: layout resolves 480 / (16/9) to 270, 200 / (16/9) to 112.5. */
const TOL = 1.5

interface IBox {
    width: number
    height: number
}

async function boxOf (locator: Locator): Promise<IBox> {
    const box = await locator.evaluate((el) => {
        const r = el.getBoundingClientRect()

        return { width: r.width, height: r.height }
    })

    return box
}

/**
 * Logs a measured box so the BEFORE/AFTER table in the PR is a transcript of
 * a real run rather than a recollection.
 */
function report (label: string, box: IBox, extra = ''): void {
    const w = box.width.toFixed(2)
    const h = box.height.toFixed(2)

    console.log(`[#709] ${label.padEnd(52)} ${w} x ${h} ${extra}`)
}

async function firstResponsiveRoot (sandbox: FrameLocator, nth = 0): Promise<Locator> {
    const root = sandbox.locator('.origam-responsive').nth(nth)

    await expect(root).toBeVisible({ timeout: 12000 })

    return root
}

test.describe('#709 — OrigamResponsive holds its own ratio', () => {
    test.setTimeout(45000)

    test('Prop — aspectRatio: two fixed ratios, no explicit height', async ({ page }) => {
        // Variant 4 renders two instances side by side, `max-width: 200`, one
        // at 16/9 and one at 4/3, each with a filled DEFAULT slot. No explicit
        // height anywhere — the ratio is the only thing that can set one.
        await page.goto(variantUrl(RESPONSIVE_ID, 4), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)

        const wide = await firstResponsiveRoot(sandbox, 0)
        const classic = await firstResponsiveRoot(sandbox, 1)

        const wideBox = await boxOf(wide)
        const classicBox = await boxOf(classic)

        report('Responsive 16/9 (max-width 200, default slot)', wideBox)
        report('Responsive 4/3  (max-width 200, default slot)', classicBox)

        // POSITIVE CONTROL — the two instances differ only by their ratio. If
        // the heights match, the harness is not actuating the ratio and every
        // number below would be meaningless.
        expect(
            Math.abs(wideBox.height - classicBox.height),
            'positive control: 16/9 and 4/3 must not render the same height'
        ).toBeGreaterThan(10)

        expect(wideBox.height).toBeCloseTo(wideBox.width / (16 / 9), 0)
        expect(classicBox.height).toBeCloseTo(classicBox.width / (4 / 3), 0)
    })

    test('Design: the ratio drives the height, and changing it moves the height', async ({ page }) => {
        await page.goto(variantUrl(RESPONSIVE_ID, 0), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const root = await firstResponsiveRoot(sandbox)

        const initial = await boxOf(root)

        report('Responsive Design 16/9 (max-width 480)', initial)
        expect(initial.height).toBeCloseTo(initial.width / (16 / 9), 0)

        // POSITIVE CONTROL — swap the ratio through the real control and watch
        // the box follow.
        await selectHstOption(page, 'Aspect Ratio', '1 / 1 (square)')
        await expect
            .poll(async () => Math.round((await boxOf(root)).height), { timeout: 8000 })
            .toBe(Math.round(initial.width))

        const square = await boxOf(root)

        report('Responsive Design 1/1  (max-width 480)', square)
        expect(square.height).toBeCloseTo(square.width, 0)
    })

    test('an explicit height still wins over the ratio (non-regression)', async ({ page }) => {
        // The ratio must size the box when nothing else does — it must NOT
        // start overriding a consumer's explicit height.
        await page.goto(variantUrl(RESPONSIVE_ID, 5), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const root = await firstResponsiveRoot(sandbox)

        await fillHstText(page, 'Height', '120px')
        await expect
            .poll(async () => Math.round((await boxOf(root)).height), { timeout: 8000 })
            .toBe(120)

        report('Responsive Default + height:120px', await boxOf(root), '(explicit height wins)')
    })
})

test.describe('#709 — non-regression: OrigamImg keeps its box', () => {
    test.setTimeout(45000)

    test('Prop — aspectRatio: 480-wide host, ratio drives the height', async ({ page }) => {
        // Img variant 11: `style="max-width: 480px"`, aspectRatio 16/9, and
        // NO default slot. This is the case that already worked before the
        // migration (480 x 270) — it must still measure 480 x 270 after.
        await page.goto(variantUrl(IMG_ID, 11), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const root = sandbox.locator('.origam-img').first()

        await expect(root).toBeVisible({ timeout: 12000 })

        const initial = await boxOf(root)

        report('Img Prop-aspectRatio 16/9 (max-width 480)', initial)
        expect(initial.height).toBeCloseTo(initial.width / (16 / 9), 0)

        // POSITIVE CONTROL — drive the real HstNumber and require movement.
        await fillHstNumber(page, 'Aspect Ratio', 1)
        await expect
            .poll(async () => Math.round((await boxOf(root)).height), { timeout: 8000 })
            .toBe(Math.round(initial.width))

        report('Img Prop-aspectRatio 1/1  (max-width 480)', await boxOf(root))
    })

    test('Design: the root box is unchanged by the migration', async ({ page }) => {
        await page.goto(variantUrl(IMG_ID, 0), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const root = sandbox.locator('.origam-img').first()

        await expect(root).toBeVisible({ timeout: 12000 })

        const box = await boxOf(root)

        report('Img Design (story defaults)', box)
        expect(box.height).toBeCloseTo(box.width / (16 / 9), 0)
    })
})

test.describe('#709 — non-regression: OrigamCarouselItem keeps its box', () => {
    test.setTimeout(45000)

    test('Design: the carousel still imposes its own height on the item', async ({ page }) => {
        // MEASURED BASELINE, not a guessed one. The story wraps the carousel
        // in a `height: 300px` host, but `OrigamCarousel` defaults its own
        // `height` prop to 500 and pushes `height: 100% !important` onto the
        // item (OrigamCarousel.vue:482), so the item measures 596 x 500 on
        // `develop` — the 300px host is overridden by the carousel itself.
        // That is pre-existing and OUT OF SCOPE for #709; this test exists to
        // pin it so the ratio migration cannot silently move it.
        await page.goto(variantUrl(CAROUSEL_ITEM_ID, 0), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const item = sandbox.locator('.origam-carousel-item').first()

        await expect(item).toBeVisible({ timeout: 12000 })

        const box = await boxOf(item)

        report('CarouselItem Design (carousel height prop = 500)', box)
        expect(box.height).toBeCloseTo(500, 0)
        expect(box.width).toBeCloseTo(596, 0)
    })
})
