import { expect, test, type Page } from '@playwright/test'

import { selectHstOption, toggleHstCheckbox } from './_support/histoire-controls'

/**
 * OrigamVideo — runtime probes for the native `<video>` element wiring,
 * controls modes (custom / native / none), tracks declaration, aspect
 * ratio CSS plumbing, and the prefers-reduced-motion autoplay
 * suppression rule. The actual playback behaviour cannot be reliably
 * asserted in headless mode (Chromium hangs on Big Buck Bunny in CI
 * without `--autoplay-policy=no-user-gesture-required`), so the spec
 * focuses on the DOM contract instead.
 *
 * REALIGNED (2026-08) — the story migrated to the canonical
 * Design/Functional/Events/Slots structure. None of the migrated
 * Variants pass a `data-cy` prop to `<origam-video>` — every old
 * `[data-cy="video-*-player"]` host is gone. The component root
 * carries a static `data-cy="origam-video"` (OrigamVideo.vue),
 * unaffected by the migration — tests locate the single instance per
 * Variant through it instead. Control-driving goes exclusively through
 * `histoire-controls.ts` (replaced a local ad-hoc
 * `page.locator('label:has-text("autoplay") input[type="checkbox"]')`
 * pattern in the reduced-motion test).
 */

const STORY = '/stories/story/components-stories-video-origamvideo-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(400)
}

const host = (sandbox: ReturnType<typeof sandboxOf>) =>
    sandbox.locator('[data-cy="origam-video"]').first()

test.describe('OrigamVideo — Default', () => {
    test('renders a native <video> element with the configured src', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const h = host(sandbox)
        await expect(h).toBeVisible({ timeout: 8000 })

        const video = h.locator('[data-cy="origam-video-el"]').first()
        await expect(video).toBeVisible()
        const tag = await video.evaluate((node) => node.tagName)
        expect(tag).toBe('VIDEO')

        const src = await video.getAttribute('src')
        expect(src).toMatch(/\.(mp4|webm|ogg|mov)/i)
    })

    test('renders the custom toolbar when controls=custom', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const h = host(sandbox)
        await expect(h).toBeVisible({ timeout: 8000 })
        await expect(h.locator('[data-cy="origam-video-controls"]').first()).toBeVisible()
        await expect(h.locator('[data-cy="origam-media-controller-play"]').first()).toBeVisible()
        // `origam-media-controller-scrubber`, NOT `origam-media-scrubber`.
        // OrigamMediaScrubber declares `dataCy` as a real prop and renders
        // `props.dataCy ?? 'origam-media-scrubber'`, so the literal only
        // survives when nobody forwards a selector — and OrigamMediaController
        // always does (`data-cy="origam-media-controller-scrubber"` on the
        // `#waveform` fallback). Same composition as the volume control below.
        // Asserting the bare literal here is what made this spec red on all
        // three engines: the element was present with a complete ARIA
        // contract, only the locator matched nothing.
        await expect(h.locator('[data-cy="origam-media-controller-scrubber"]').first()).toBeVisible()
        // Pin the composition itself — a parent silently renaming the child's
        // selector is exactly how this spec broke, and a `toBeVisible` on the
        // new name alone would not catch the symmetric mistake (the scrubber
        // falling back to its own literal because the forward was dropped).
        await expect(h.locator('[data-cy="origam-media-scrubber"]')).toHaveCount(0)
        // The volume control's root IS the mute button (origam-media-
        // controller-volume-mute) — the plain "origam-media-controller-
        // volume" data-cy is only a prefix forwarded into
        // OrigamMediaVolumeControl, never rendered as a literal attribute
        // value; its expanded slider is teleported into a tooltip popover,
        // not a descendant of the host (verified by source read of
        // OrigamMediaVolumeControl.vue).
        await expect(h.locator('[data-cy="origam-media-controller-volume-mute"]').first()).toBeVisible()
        await expect(h.locator('[data-cy="origam-video-fullscreen"]').first()).toBeVisible()
    })

    test('play button has a dynamic aria-label', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const btn = host(sandbox).locator('[data-cy="origam-media-controller-play"]').first()
        await expect(btn).toHaveAttribute('aria-label', /play/i)
    })

    /**
     * `role="slider"` is only half a contract. A role advertised without
     * its value triplet, its orientation, its name and a way to operate it
     * from the keyboard is worse than no role at all — the project rule is
     * "No ARIA is better than bad ARIA". So this asserts the whole thing,
     * not just the role attribute the old version checked.
     */
    test('scrubber honours the full role=slider contract', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const scrubber = host(sandbox).locator('[data-cy="origam-media-controller-scrubber"]').first()
        await expect(scrubber).toBeVisible({ timeout: 8000 })

        await expect(scrubber).toHaveAttribute('role', 'slider')
        await expect(scrubber).toHaveAttribute('aria-valuemin', '0')
        await expect(scrubber).toHaveAttribute('aria-orientation', 'horizontal')
        // Accessible name — the controller passes a translated `Seek`.
        await expect(scrubber).toHaveAttribute('aria-label', /.+/)
        // Operable from the keyboard, so it must be reachable by Tab.
        await expect(scrubber).toHaveAttribute('tabindex', '0')

        // aria-valuenow must exist AND sit inside [valuemin, valuemax].
        // aria-valuemax reflects the real duration once `loadedmetadata`
        // has landed — it must never be the internal epsilon guard the
        // component uses as a division floor (that leak is pinned at the
        // unit level in TU/components/Media/OrigamMediaScrubber.spec.ts).
        await expect
            .poll(async () => Number(await scrubber.getAttribute('aria-valuemax')), { timeout: 10000 })
            .toBeGreaterThan(1)

        const [min, now, max] = await Promise.all([
            scrubber.getAttribute('aria-valuemin'),
            scrubber.getAttribute('aria-valuenow'),
            scrubber.getAttribute('aria-valuemax')
        ])
        expect(now).not.toBeNull()
        expect(Number(now)).toBeGreaterThanOrEqual(Number(min))
        expect(Number(now)).toBeLessThanOrEqual(Number(max))
    })

    /**
     * The half of the slider contract an attribute check cannot prove:
     * that the arrow keys actually MOVE something. This is the failure
     * mode OrigamColorPicker shipped — `role` + a live `aria-valuetext`
     * on a control that ignored the arrows in its default state.
     *
     * MEASURED HEADLESS LIMITATION (verified, not assumed): the story's
     * remote asset reaches `readyState=4` and reports a real duration,
     * but never decodes a frame — `video.play()` flips `paused` to false
     * and ZERO `timeupdate` events fire over several seconds, and a
     * programmatic seek emits `seeking` without ever emitting `seeked`.
     * `state.currentTime` is fed by `timeupdate`, so `aria-valuenow`
     * cannot be asserted after a keypress here. That is the environment,
     * not the component.
     *
     * What IS observable is the link the keyboard owns: keydown → commit →
     * `update:modelValue` → the controller's seek → `video.currentTime`.
     * Asserting on the media element skips the event the environment
     * withholds while still proving the arrows are wired to the media.
     */
    test('scrubber arrow keys drive the media element, not just the ARIA value', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const h = host(sandbox)
        const scrubber = h.locator('[data-cy="origam-media-controller-scrubber"]').first()
        await expect(scrubber).toBeVisible({ timeout: 8000 })

        // Wait for the duration, otherwise the range is empty and every
        // key press legitimately clamps back to 0.
        await expect
            .poll(async () => Number(await scrubber.getAttribute('aria-valuemax')), { timeout: 10000 })
            .toBeGreaterThan(1)

        const readTime = () =>
            h.locator('[data-cy="origam-video-el"]').first()
                .evaluate((node) => (node as HTMLVideoElement).currentTime)

        await scrubber.focus()
        await expect(scrubber).toBeFocused()

        expect(await readTime()).toBe(0)

        await scrubber.press('ArrowRight')
        await expect.poll(readTime, { timeout: 5000 }).toBeGreaterThan(0)

        await scrubber.press('Home')
        await expect.poll(readTime, { timeout: 5000 }).toBe(0)

        await scrubber.press('End')
        await expect.poll(readTime, { timeout: 5000 }).toBeGreaterThan(1)
    })
})

test.describe('OrigamVideo — controls modes', () => {
    // "Prop — controls (custom / native / none)" is now the "Functional"
    // Variant's "Controls" HstSelect (init 'custom') — a single instance
    // switched sequentially instead of three parallel hosts.
    test('controls=custom paints the in-house toolbar and the <video> has no native controls attribute', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)

        const h = host(sandbox)
        await expect(h).toBeVisible({ timeout: 8000 })
        await expect(h.locator('[data-cy="origam-video-controls"]').first()).toBeVisible()

        const video = h.locator('[data-cy="origam-video-el"]').first()
        const hasControls = await video.evaluate((node) => (node as HTMLVideoElement).controls)
        expect(hasControls).toBe(false)
    })

    test('controls=native sets the controls attribute on the <video> and renders no custom toolbar', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const h = host(sandbox)
        await expect(h).toBeVisible({ timeout: 8000 })

        await selectHstOption(page, 'Controls', 'native')
        await page.waitForTimeout(300)

        const video = h.locator('[data-cy="origam-video-el"]').first()
        const hasControls = await video.evaluate((node) => (node as HTMLVideoElement).controls)
        expect(hasControls).toBe(true)

        await expect(h.locator('[data-cy="origam-video-controls"]')).toHaveCount(0)
    })

    test('controls=none renders neither the custom toolbar nor the native controls attribute', async ({ page }) => {
        await openVariant(page, 'Functional')
        const sandbox = sandboxOf(page)
        const h = host(sandbox)
        await expect(h).toBeVisible({ timeout: 8000 })

        await selectHstOption(page, 'Controls', 'none')
        await page.waitForTimeout(300)

        const video = h.locator('[data-cy="origam-video-el"]').first()
        const hasControls = await video.evaluate((node) => (node as HTMLVideoElement).controls)
        expect(hasControls).toBe(false)

        await expect(h.locator('[data-cy="origam-video-controls"]')).toHaveCount(0)
    })
})

test.describe('OrigamVideo — tracks [STORY COVERAGE MISSING]', () => {
    test.fixme('captions are declared as <track kind="captions"> children of the <video>', async () => {
        // No Variant in the current story passes a `:tracks` array —
        // neither Design, Functional, Default, nor any Events/Slots
        // Variant declares captions. Needs a story fixture, not a
        // spec-only change.
    })

    test.fixme('the toolbar exposes a captions toggle when tracks are passed', async () => {
        // Same gap — no fixture with tracks means no way to reach
        // `[data-cy="origam-video-captions"]` anymore.
    })
})

test.describe('OrigamVideo — aspect ratio', () => {
    test('aspect-ratio prop maps to the CSS aspect-ratio property on the wrapper', async ({ page }) => {
        test.fail(true, 'DS BUG: useAspectRatio composable implements aspect ratio via padding-block-end (padding trick) on an inner __sizer div, not via the CSS `aspect-ratio` property on the root wrapper. getComputedStyle(root).aspectRatio returns "auto". The prop is functional but the CSS contract differs from the documented API. Fix: useAspectRatio should emit `aspect-ratio: <n>` on the root element instead of padding-block-end on a sizer child.')

        // "Prop — aspectRatio (16/9 / 4/3 / 1/1 / 21/9 / 9/16)" is now the
        // "Design" Variant's "Aspect Ratio" HstSelect (init '16/9') — a
        // single instance switched sequentially instead of five parallel
        // hosts.
        await openVariant(page, 'Design')
        const sandbox = sandboxOf(page)
        const h = host(sandbox)
        await expect(h).toBeVisible({ timeout: 8000 })

        for (const [ratio, expected] of [
            ['16/9', '16 / 9'],
            ['4/3', '4 / 3'],
            ['1/1', '1 / 1'],
            ['21/9', '21 / 9']
        ] as const) {
            if (ratio !== '16/9') {
                await selectHstOption(page, 'Aspect Ratio', ratio)
                await page.waitForTimeout(300)
            }
            const ar = await h.evaluate((node) => getComputedStyle(node).aspectRatio)
            expect(ar).toContain(expected)
        }
    })
})

test.describe('OrigamVideo — slot controls', () => {
    test('#controls slot replaces the default toolbar entirely', async ({ page }) => {
        await openVariant(page, 'Slots - Controls')
        const sandbox = sandboxOf(page)

        const h = host(sandbox)
        await expect(h).toBeVisible({ timeout: 8000 })
        await expect(h.getByText('Play', { exact: true }).or(h.getByText('Pause', { exact: true })).first()).toBeVisible()
        // The default play button must not be rendered alongside the slot.
        await expect(h.locator('[data-cy="origam-media-controller-play"]')).toHaveCount(0)
    })
})

test.describe('OrigamVideo — slot poster', () => {
    test('#poster slot replaces the default poster overlay', async ({ page }) => {
        await openVariant(page, 'Slots - Poster')
        const sandbox = sandboxOf(page)

        const h = host(sandbox)
        await expect(h).toBeVisible({ timeout: 8000 })
        await expect(h.getByText('Click to watch', { exact: true })).toBeVisible()
        await expect(h.locator('[data-cy="origam-video-poster-btn"]')).toHaveCount(0)
    })
})

test.describe('OrigamVideo — prefers-reduced-motion', () => {
    test('autoplay is suppressed when the OS reduced-motion preference is set', async ({ page }) => {
        // `page.emulateMedia()` explicitly, NOT `test.use({ reducedMotion })`
        // — verified empirically that the declarative fixture option does
        // not propagate into the sandbox iframe (or even the top-level page)
        // in this project's Playwright setup, while the imperative API call
        // does (same working pattern as text-mask.spec.ts's reduced-motion
        // test). A test-infra nuance, not a DS bug.
        await page.emulateMedia({ reducedMotion: 'reduce' })

        // Set the autoplay flag through the Histoire controls, then assert
        // the rendered <video> element does NOT carry the `autoplay`
        // attribute. The composable logs a warning in the console.
        const warnings: Array<string> = []
        page.on('console', (msg) => {
            if (msg.type() === 'warning') warnings.push(msg.text())
        })

        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        await toggleHstCheckbox(page, 'Autoplay')
        await page.waitForTimeout(300)

        const video = host(sandbox).locator('[data-cy="origam-video-el"]').first()
        const hasAutoplay = await video.evaluate((node) => (node as HTMLVideoElement).autoplay)
        expect(hasAutoplay).toBe(false)
    })
})
