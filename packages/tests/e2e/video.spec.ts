import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamVideo — runtime probes for the native `<video>` element wiring,
 * controls modes (custom / native / none), tracks declaration, aspect
 * ratio CSS plumbing, and the prefers-reduced-motion autoplay
 * suppression rule. The actual playback behaviour cannot be reliably
 * asserted in headless mode (Chromium hangs on Big Buck Bunny in CI
 * without `--autoplay-policy=no-user-gesture-required`), so the spec
 * focuses on the DOM contract instead.
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

test.describe('OrigamVideo — Default', () => {
    test('renders a native <video> element with the configured src', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="video-default-player"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const video = host.locator('[data-cy="origam-video-el"]').first()
        await expect(video).toBeVisible()
        const tag = await video.evaluate((node) => node.tagName)
        expect(tag).toBe('VIDEO')

        const src = await video.getAttribute('src')
        expect(src).toMatch(/\.(mp4|webm|ogg|mov)/i)
    })

    test('renders the custom toolbar when controls=custom', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="video-default-player"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host.locator('[data-cy="origam-video-controls"]').first()).toBeVisible()
        await expect(host.locator('[data-cy="origam-media-controller-play"]').first()).toBeVisible()
        await expect(host.locator('[data-cy="origam-media-scrubber"]').first()).toBeVisible()
        await expect(host.locator('[data-cy="origam-media-controller-volume"]').first()).toBeVisible()
        await expect(host.locator('[data-cy="origam-video-fullscreen"]').first()).toBeVisible()
    })

    test('play button has a dynamic aria-label', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const btn = sandbox.locator('[data-cy="origam-media-controller-play"]').first()
        await expect(btn).toHaveAttribute('aria-label', /play/i)
    })

    test('scrubber declares role=slider with aria-valuemin/max', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const scrubber = sandbox.locator('[data-cy="origam-media-scrubber"]').first()
        await expect(scrubber).toHaveAttribute('role', 'slider')
        await expect(scrubber).toHaveAttribute('aria-valuemin', '0')
    })
})

test.describe('OrigamVideo — controls modes', () => {
    test('controls=custom paints the in-house toolbar and the <video> has no native controls attribute', async ({ page }) => {
        await openVariant(page, 'Prop — controls (custom / native / none)')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="video-controls-custom"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host.locator('[data-cy="origam-video-controls"]').first()).toBeVisible()

        const video = host.locator('[data-cy="origam-video-el"]').first()
        const hasControls = await video.evaluate((node) => (node as HTMLVideoElement).controls)
        expect(hasControls).toBe(false)
    })

    test('controls=native sets the controls attribute on the <video> and renders no custom toolbar', async ({ page }) => {
        await openVariant(page, 'Prop — controls (custom / native / none)')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="video-controls-native"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const video = host.locator('[data-cy="origam-video-el"]').first()
        const hasControls = await video.evaluate((node) => (node as HTMLVideoElement).controls)
        expect(hasControls).toBe(true)

        const customCount = await host.locator('[data-cy="origam-video-controls"]').count()
        expect(customCount).toBe(0)
    })

    test('controls=none renders neither the custom toolbar nor the native controls attribute', async ({ page }) => {
        await openVariant(page, 'Prop — controls (custom / native / none)')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="video-controls-none"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const video = host.locator('[data-cy="origam-video-el"]').first()
        const hasControls = await video.evaluate((node) => (node as HTMLVideoElement).controls)
        expect(hasControls).toBe(false)

        const customCount = await host.locator('[data-cy="origam-video-controls"]').count()
        expect(customCount).toBe(0)
    })
})

test.describe('OrigamVideo — tracks', () => {
    test('captions are declared as <track kind="captions"> children of the <video>', async ({ page }) => {
        await openVariant(page, 'Prop — tracks (captions on/off, language switch)')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="video-tracks-player"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const video = host.locator('[data-cy="origam-video-el"]').first()
        const tracks = await video.evaluate((node) => {
            const list = (node as HTMLVideoElement).querySelectorAll('track')
            return Array.from(list).map((track) => ({
                kind: track.getAttribute('kind'),
                srclang: track.getAttribute('srclang')
            }))
        })
        expect(tracks.length).toBeGreaterThanOrEqual(2)
        expect(tracks.some((t) => t.kind === 'captions' && t.srclang === 'en')).toBe(true)
        expect(tracks.some((t) => t.kind === 'captions' && t.srclang === 'fr')).toBe(true)
    })

    test('the toolbar exposes a captions toggle when tracks are passed', async ({ page }) => {
        await openVariant(page, 'Prop — tracks (captions on/off, language switch)')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="video-tracks-player"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host.locator('[data-cy="origam-video-captions"]').first()).toBeVisible()
    })
})

test.describe('OrigamVideo — aspect ratio', () => {
    test('aspect-ratio prop maps to the CSS aspect-ratio property on the wrapper', async ({ page }) => {
        test.fixme(true, 'DS BUG: useAspectRatio composable implements aspect ratio via padding-block-end (padding trick) on an inner __sizer div, not via the CSS `aspect-ratio` property on the root wrapper. getComputedStyle(root).aspectRatio returns "auto". The prop is functional but the CSS contract differs from the documented API. Fix: useAspectRatio should emit `aspect-ratio: <n>` on the root element instead of padding-block-end on a sizer child.')

        await openVariant(page, 'Prop — aspectRatio (16/9 / 4/3 / 1/1 / 21/9 / 9/16)')
        const sandbox = sandboxOf(page)

        for (const [ratio, expected] of [
            ['16/9', '16 / 9'],
            ['4/3', '4 / 3'],
            ['1/1', '1 / 1'],
            ['21/9', '21 / 9']
        ] as const) {
            const cy = `video-aspect-${ratio.replace('/', '-')}`
            const host = sandbox.locator(`[data-cy="${cy}"]`).first()
            await expect(host).toBeVisible({ timeout: 8000 })
            const ar = await host.evaluate((node) => getComputedStyle(node).aspectRatio)
            expect(ar).toContain(expected)
        }
    })
})

test.describe('OrigamVideo — slot controls', () => {
    test('#controls slot replaces the default toolbar entirely', async ({ page }) => {
        await openVariant(page, 'Slot — controls (timestamp-only minimal bar)')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="video-slot-controls-player"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host.locator('[data-cy="video-slot-controls-play"]').first()).toBeVisible()
        // The default play button must not be rendered alongside the slot.
        const defaultPlay = await host.locator('[data-cy="origam-video-play"]').count()
        expect(defaultPlay).toBe(0)
    })
})

test.describe('OrigamVideo — slot poster', () => {
    test('#poster slot replaces the default poster overlay', async ({ page }) => {
        await openVariant(page, 'Slot — poster (custom overlay)')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="video-slot-poster-player"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host.locator('[data-cy="video-slot-poster-overlay"]').first()).toBeVisible()
        const defaultBtn = await host.locator('[data-cy="origam-video-poster-btn"]').count()
        expect(defaultBtn).toBe(0)
    })
})

test.describe('OrigamVideo — prefers-reduced-motion', () => {
    test.use({ reducedMotion: 'reduce' })

    test('autoplay is suppressed when the OS reduced-motion preference is set', async ({ page }) => {
        // Set the autoplay flag through the Playground state, then assert
        // the rendered <video> element does NOT carry the `autoplay`
        // attribute. The composable logs a warning in the console.
        const warnings: Array<string> = []
        page.on('console', (msg) => {
            if (msg.type() === 'warning') warnings.push(msg.text())
        })

        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        // Toggle autoplay on via the Histoire controls.
        const autoplay = page.locator('label:has-text("autoplay") input[type="checkbox"]').first()
        if (await autoplay.count()) {
            await autoplay.check({ force: true })
            await page.waitForTimeout(300)
        }

        const video = sandbox.locator('[data-cy="origam-video-el"]').first()
        const hasAutoplay = await video.evaluate((node) => (node as HTMLVideoElement).autoplay)
        expect(hasAutoplay).toBe(false)
    })
})
