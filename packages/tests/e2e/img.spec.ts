import { expect, test, type Page } from '@playwright/test'
import { eventLogItems, openEventsTab } from './_support/histoire-controls'

/**
 * OrigamImg — e2e spec.
 *
 * #C7 (lot mineur C2/C8/C7, 2026-09-13) — the story has 14 Variants and
 * NO e2e spec existed at all (`find packages/tests -iname '*img*'`
 * returned nothing before this file). Root CLAUDE.md's "test-as-you-build"
 * rule requires a matching spec per story. Separately, this component's C4
 * (eager theme default) was already fixed (#673, commit 090b7820) — not
 * touched here.
 *
 * ⛔ Measured trap, specific to THIS sandbox: `curl` from the shell fetches
 * https://picsum.photos in ~0.2s, but the SAME URL requested from inside
 * Chromium (Playwright's browser process) never completes —
 * `img.complete` stayed `false` after 11+ seconds in a manual probe. The
 * shell and the browser do not share a network path here. Consequently:
 *   - NOT tested: whether the real `<img>` ever becomes visible
 *     (`v-show="isLoaded"`, gated on the native `load` event actually
 *     firing) — unverifiable in this sandbox regardless of the component's
 *     correctness.
 *   - Tested instead: attributes/computed-styles that resolve BEFORE and
 *     REGARDLESS OF `display:none` (verified directly: `getComputedStyle`
 *     on a `display:none` `<img>` still reports `object-fit`,
 *     `border-radius`, `aspect-ratio` correctly) — these do not depend on
 *     the image byte transfer completing.
 *   - Requests to a genuinely INVALID host (Events - error, Slots - Error)
 *     fail fast regardless (DNS resolution failure, not a data transfer),
 *     so those ARE fully exercised end-to-end.
 *
 * Variant index map (OrigamImg story):
 *    0  Design
 *    1  Functional
 *    2  Events - load
 *    3  Events - loadstart
 *    4  Events - error
 *    5  Slots - Placeholder
 *    6  Slots - Default
 *    7  Slots - Error
 *    8  Prop — src & alt
 *    9  Prop — cover & position
 *   10  Prop — rounded
 *   11  Prop — aspectRatio
 *   12  Prop — lazySrc (preload blur)
 *   13  Prop — gradient
 *   14  Default (playground)
 */

const STORY_ID = 'components-stories-img-origamimg-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

test.describe('OrigamImg — Design (index 0)', () => {
    test.setTimeout(30000)

    test('renders the root with an accessible name from alt', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const root = sandbox.locator('.origam-img').first()
        await expect(root).toBeVisible({ timeout: 12000 })
        await expect(root).toHaveAttribute('aria-label', 'Design demo')
    })

    test('aspectRatio prop is applied as a real style, not merely accepted', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const root = sandbox.locator('.origam-img').first()
        await expect(root).toBeVisible({ timeout: 12000 })

        // `useAspectRatio` (OrigamResponsive) does NOT set the modern CSS
        // `aspect-ratio` property on the root — it uses the classic
        // padding-percentage sizer technique on a child `.origam-responsive
        // __sizer` div (verified: `getComputedStyle(root).aspectRatio` is
        // "auto" even when the prop works correctly). 16/9 -> 9/16 = 56.25%.
        const sizer = root.locator('.origam-responsive__sizer')
        await expect(sizer).toHaveCount(1)
        const paddingBlockEnd = await sizer.evaluate(el => (el as HTMLElement).style.paddingBlockEnd)
        expect(paddingBlockEnd).toBe('56.25%')
    })
})

test.describe('OrigamImg — Functional (index 1)', () => {
    test.setTimeout(30000)

    test('eager sets the native loading="eager" attribute (skips IntersectionObserver)', async ({ page }) => {
        await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const img = sandbox.locator('.origam-img img').first()
        await expect(img).toHaveAttribute('loading', 'eager', { timeout: 12000 })
    })
})

test.describe('OrigamImg — Events', () => {
    test.setTimeout(30000)

    test('Events - loadstart: the loadstart event fires as soon as loading begins', async ({ page }) => {
        await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toBeVisible({ timeout: 12000 })
    })

    test('Events - error: an unreachable host fires the error event', async ({ page }) => {
        await page.goto(variantUrl(4), { waitUntil: 'domcontentloaded' })

        await openEventsTab(page)
        await expect(eventLogItems(page).first()).toBeVisible({ timeout: 12000 })
    })
})

test.describe('OrigamImg — Slots', () => {
    test.setTimeout(30000)

    test('Slots - Placeholder: custom placeholder is mounted while the image has not resolved', async ({ page }) => {
        await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        await expect(sandbox.getByText('Loading...')).toBeVisible({ timeout: 12000 })
    })

    test('Slots - Default: overlay content renders on top of the image', async ({ page }) => {
        await page.goto(variantUrl(6), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        await expect(sandbox.getByText('Caption overlay')).toBeVisible({ timeout: 12000 })
    })

    test('Slots - Error: custom error content replaces the broken image', async ({ page }) => {
        await page.goto(variantUrl(7), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        await expect(sandbox.getByText('Failed to load image')).toBeVisible({ timeout: 12000 })
        // The real <img> stays hidden (v-show, never `isLoaded`) once errored —
        // it may still exist as a DOM node, so assert on visibility, not count.
        const realImg = sandbox.locator('.origam-img img')
        if (await realImg.count() > 0) {
            await expect(realImg.first()).toBeHidden()
        }
    })
})

test.describe('OrigamImg — Props', () => {
    test.setTimeout(30000)

    test('Prop — src & alt: both forward onto the rendered <img> attribute set', async ({ page }) => {
        await page.goto(variantUrl(8), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const img = sandbox.locator('.origam-img img').first()
        await expect(img).toHaveAttribute('alt', 'Demo image', { timeout: 12000 })
        await expect(img).toHaveAttribute('src', /origam-img-basic/)
    })

    test('Prop — cover & position: cover toggles object-fit (computed style resolves regardless of load state)', async ({ page }) => {
        await page.goto(variantUrl(9), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const img = sandbox.locator('.origam-img img').first()
        await expect(img).toHaveCount(1, { timeout: 12000 })

        // init-state sets cover: false — object-fit must NOT be "cover".
        const fitBefore = await img.evaluate(el => getComputedStyle(el).objectFit)
        expect(fitBefore).not.toBe('cover')

        await page.getByRole('checkbox', { name: 'Cover (object-fit: cover)' }).click()
        await expect.poll(() => img.evaluate(el => getComputedStyle(el).objectFit)).toBe('cover')
    })

    test('Prop — rounded: applies a real border-radius on the root', async ({ page }) => {
        await page.goto(variantUrl(10), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const root = sandbox.locator('.origam-img').first()
        await expect(root).toBeVisible({ timeout: 12000 })

        const before = await root.evaluate(el => getComputedStyle(el).borderRadius)

        await page.locator('label.histoire-select').filter({ hasText: 'Rounded' }).locator('.v-popper--theme-dropdown').click()
        await page.waitForTimeout(300)
        await page.locator('.v-popper__popper:visible').getByText('large (radius.xl / 16px)', { exact: true }).click()

        await expect.poll(() => root.evaluate(el => getComputedStyle(el).borderRadius)).not.toBe(before)
    })

    // ⛔ NOT asserting that changing the control updates the ratio after
    // mount — measured, and it does NOT (found while writing this spec,
    // absent from the classeur, a C3 defect out of scope for this C2/C8/C7
    // lot). `OrigamImg.vue:196` builds `responsiveProps` via a plain
    // `pick(props, [...])` call in the body of `setup()` — NOT wrapped in
    // `computed()` — so `aspectRatio` (and `contentClass`/`inline`/
    // `height`/`maxHeight`/`maxWidth`/`minHeight`/`minWidth`/`width`/
    // `class`/`style`, all forwarded through the same `pick()`) are frozen
    // at whatever value they held at first render and never update again.
    // Verified live: after changing "Aspect Ratio" from 1.777... to 1
    // (confirmed reactive in Vue — the Source panel shows
    // `:aspect-ratio="1"`), `.origam-responsive__sizer`'s
    // `padding-block-end` stayed at "56.25%" (the 16/9 value) instead of
    // moving to "100%". This is a distinct defect from the classeur's
    // known C4 (theme eager default, #673) and from `useDimension`'s
    // separate lack of an `aspectRatio` field (dead by design there — the
    // real mechanism is `OrigamResponsive`'s own `useAspectRatio`).
    test('Prop — aspectRatio: applies once at mount (see comment above for the found reactivity gap)', async ({ page }) => {
        await page.goto(variantUrl(11), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const sizer = sandbox.locator('.origam-responsive__sizer').first()
        await expect(sizer).toHaveCount(1, { timeout: 12000 })

        const paddingBlockEnd = await sizer.evaluate(el => (el as HTMLElement).style.paddingBlockEnd)
        expect(paddingBlockEnd).toBe('56.25%')
    })

    test('Prop — lazySrc: a second <img> pointing at the blur-preview URL is mounted alongside the real one', async ({ page }) => {
        await page.goto(variantUrl(12), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const pictures = sandbox.locator('.origam-img img')
        await expect(pictures).toHaveCount(2, { timeout: 12000 })

        const srcs = await pictures.evaluateAll(imgs => imgs.map(i => (i as HTMLImageElement).src))
        expect(srcs.some(s => s.includes('origam-img-lazy'))).toBe(true)
    })

    test('Prop — gradient: an overlay gradient layer is painted on top of the image', async ({ page }) => {
        await page.goto(variantUrl(13), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const root = sandbox.locator('.origam-img').first()
        await expect(root).toBeVisible({ timeout: 12000 })

        // The gradient value passed by the story must show up in SOME
        // descendant's background-image (the exact selector is an
        // implementation detail; the presence of a real gradient is not).
        const hasGradient = await root.evaluate(el => {
            const all = [el, ...Array.from(el.querySelectorAll('*'))]
            return all.some(node => getComputedStyle(node).backgroundImage.includes('gradient'))
        })
        expect(hasGradient).toBe(true)
    })
})

test.describe('OrigamImg — Default (playground, index 14)', () => {
    test.setTimeout(30000)

    test('renders with the playground defaults', async ({ page }) => {
        await page.goto(variantUrl(14), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        await expect(sandbox.locator('.origam-img img').first()).toHaveCount(1, { timeout: 15000 })
    })
})
