import { expect, test, type Page } from '@playwright/test'
import { eventLogItems, fillHstNumber, fillHstText, openEventsTab, selectHstOption } from './_support/histoire-controls'

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
 * #684 (C3) — `responsiveProps` in `OrigamImg.vue` used to be a plain
 * `pick(props, [...])` call in the body of `setup()`, frozen at whatever
 * value 11 props (aspectRatio, contentClass, inline, height, maxHeight,
 * maxWidth, minHeight, minWidth, width, class, style) held at first
 * render. Fixed by wrapping it in `computed()`. The "Prop — aspectRatio"
 * test below now MUTATES the control after mount (it used to only read
 * the value frozen at mount, which passed on both broken and fixed code
 * and is exactly the kind of green test root CLAUDE.md warns against). A
 * second test drives Width/Height on the Design Variant to prove the fix
 * isn't limited to the one prop that was measured in the issue.
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

    test('Functional — the Aspect Ratio select really drives the render (not a lying control)', async ({ page }) => {
        await page.goto(variantUrl(1))
        const sizer = sandboxOf(page).locator('.origam-img .origam-responsive__sizer').first()
        await expect(sizer).toHaveCount(1)
        const read = () => sizer.evaluate(el => (el as HTMLElement).style.paddingBlockEnd)

        // The sizer uses the padding-percentage technique, so the rendered value
        // is the INVERSE of the ratio: 16/9 -> 56.25%, 1/1 -> 100%, 9/16 -> 177.778%.
        expect(await read()).toBe('56.25%')

        await selectHstOption(page, 'Aspect Ratio', '1 / 1 (square)')
        await expect.poll(read).toBe('100%')

        await selectHstOption(page, 'Aspect Ratio', '9 / 16 (story / reel)')
        await expect.poll(read).toBe('177.778%')
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

    // #684 — TDD red-first proof: the control is mutated AFTER mount, not
    // merely read at its init-state value. Against the pre-fix `pick()`
    // snapshot this stays at "56.25%" forever; against the `computed()`
    // fix it must track the new ratio. `1` -> "100%" (a square sizer).
    test('Prop — aspectRatio: reacts to a post-mount change (#684)', async ({ page }) => {
        await page.goto(variantUrl(11), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const sizer = sandbox.locator('.origam-responsive__sizer').first()
        await expect(sizer).toHaveCount(1, { timeout: 12000 })

        const before = await sizer.evaluate(el => (el as HTMLElement).style.paddingBlockEnd)
        expect(before).toBe('56.25%') // 16/9 -> 9/16 = 56.25%, the init-state value.

        await fillHstNumber(page, 'Aspect Ratio', 1)
        await expect.poll(() => sizer.evaluate(el => (el as HTMLElement).style.paddingBlockEnd)).toBe('100%')
    })

    // #684 — same defect family, two more of the eleven props the frozen
    // `pick()` covered (`height`/`minWidth`). Proves the fix isn't narrowly
    // scoped to `aspectRatio` alone.
    //
    // ⛔ Deliberately NOT `width` here. Measured against `HEAD~1`: `width`
    // ALSO reacts on the pre-fix code, because `OrigamImg`'s OWN `imgStyles`
    // computed (line ~400) independently re-derives
    // `{'width': convertToUnit(...)}` from `props.width` and merges it onto
    // the SAME `.origam-responsive` root via `:style="imgStyles"` — a
    // second, already-reactive channel for that one property, parallel to
    // (and masking) the frozen `responsiveProps.width`. Same story for
    // `class`/`style`: `imgClasses`/`imgStyles` already fold in
    // `props.class` / `props.style` reactively. So of the 11 props in the
    // pick() list, only 8 (aspectRatio, contentClass, inline, height,
    // maxHeight, maxWidth, minHeight, minWidth) had NO parallel reactive
    // path and were genuinely, fully dead pre-fix — `class`/`style`/`width`
    // were partially masked. A `width` assertion here would pass on BOTH
    // the broken and the fixed code, which root CLAUDE.md calls out
    // explicitly as a test that "proves nothing" — so it is excluded as a
    // discriminator and reported separately instead.
    test('Prop — height/minWidth: react to a post-mount change (#684)', async ({ page }) => {
        await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)
        const root = sandbox.locator('.origam-responsive').first()
        await expect(root).toBeVisible({ timeout: 12000 })

        const heightBefore = await root.evaluate(el => (el as HTMLElement).style.height)
        const minWidthBefore = await root.evaluate(el => (el as HTMLElement).style.minWidth)
        expect(heightBefore).toBe('')
        expect(minWidthBefore).toBe('')

        await fillHstText(page, 'Height', '150')
        await fillHstText(page, 'Min Width', '300')

        await expect.poll(() => root.evaluate(el => (el as HTMLElement).style.height)).toBe('150px')
        await expect.poll(() => root.evaluate(el => (el as HTMLElement).style.minWidth)).toBe('300px')
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
