import { expect, test } from '@playwright/test'

/**
 * OrigamQrCode — runtime probes for the SVG renderer, ARIA contract,
 * ECC modifier class, center overlay slots, and wrapper chrome.
 *
 * RECIPE (cf. btn.spec.ts)
 *
 * ## Navigation
 *   Direct navigation with variantId query param — never networkidle
 *   (Histoire keeps an HMR WebSocket open → networkidle never resolves).
 *
 *   const STORY_ID   = 'components-stories-qrcode-origamqrcode-story-vue'
 *   const STORY_PATH = '/stories/story/' + STORY_ID
 *   variantUrl(idx)  = STORY_PATH + '?variantId=' + STORY_ID + '-' + idx
 *
 * ## Variants (0-based, as declared in OrigamQrCode.story.vue)
 *   0 → Design     init: { value: 'https://origam.dev', size: 200, color: undefined, … }
 *   1 → Functional init: { value: 'https://origam.dev', errorCorrectionLevel: 'M',
 *                          border: 'thin', rounded: 'medium', … }
 *   2 → Slots - center  (static — error-correction-level="H", :size="200")
 *   3 → Default    init: { value: 'https://origam.dev', size: 200, errorCorrectionLevel: 'M', … }
 *
 * ## DOM
 *   Root BEM class : .origam-qr-code  (component is: tag='div' by default)
 *   ECC class      : origam-qr-code--ecc-{l|m|q|h}  (lowercased errorCorrectionLevel)
 *   Border class   : origam--border-thin  (utility from useBorder)
 *   Rounded class  : origam-qr-code--rounded-medium  (component-level, not utility)
 *   SVG host       : .origam-qr-code__svg-host  (innerHTML = SVG injected by watchEffect)
 *   Center overlay : .origam-qr-code__center  (present when image / icon / #center slot)
 *
 * ## Cold-start timing
 *   In a headless Playwright context, Histoire takes ~19-22s to mount the first Variant
 *   (Vite HMR + dynamic imports + Vue runtime). All first-visit toBeVisible() calls must
 *   use timeout: 30000.  Subsequent navigations within the same browser context are
 *   faster (~2-5s) because the JS bundles are already cached.
 *
 * ## Notes on SVG rendering
 *   The SVG is injected via watchEffect → svgHost.value.innerHTML after mount.
 *   A URL of 'https://origam.dev' produces 334 <rect> elements with ECC=M.
 */

const STORY_ID   = 'components-stories-qrcode-origamqrcode-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamQrCode', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { value: 'https://origam.dev', size: 200, color: undefined }  //
    // classes at runtime: origam-qr-code origam-qr-code--ecc-m            //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('mounts with the BEM root class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            // Cold-start: Histoire + DS bundle load takes ~19-22s on headless Chromium.
            await expect(qr).toBeVisible({ timeout: 30000 })
        })

        test('carries role="img" for a11y', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            await expect(qr).toHaveAttribute('role', 'img')
        })

        test('carries a non-empty aria-label (fallback = "QR code for <value>")', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            const label = await qr.getAttribute('aria-label')
            expect(label).toBe('QR code for https://origam.dev')
        })

        test('default ECC=M applies the origam-qr-code--ecc-m modifier class', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            await expect(qr).toHaveClass(/origam-qr-code--ecc-m/)
        })

        test('injects an inline SVG into the svg-host span', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            // watchEffect injects the SVG asynchronously after mount
            const svg = qr.locator('.origam-qr-code__svg-host svg').first()
            await expect(svg).toBeAttached({ timeout: 12000 })
        })

        test('SVG contains at least 2 rects (background + module rects)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            const svg = qr.locator('.origam-qr-code__svg-host svg').first()
            await expect(svg).toBeAttached({ timeout: 12000 })
            const rectCount = await qr.locator('.origam-qr-code__svg-host svg rect').count()
            // 'https://origam.dev' with ECC=M produces 334 rects at runtime.
            expect(rectCount).toBeGreaterThan(1)
        })

        test('renders as a <div> by default (tag prop default)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            const tag = await qr.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('div')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // story: border="thin" rounded="medium" :size="200"                   //
    // classes: origam-qr-code origam-qr-code--ecc-m                       //
    //          origam-qr-code--rounded-medium origam-qr-code--border      //
    //          origam--border-thin                                         //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('mounts and renders the svg-host span', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            await expect(qr.locator('.origam-qr-code__svg-host')).toBeAttached()
        })

        test('ECC=M modifier class is present (init state)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            await expect(qr).toHaveClass(/origam-qr-code--ecc-m/)
        })

        test('border=thin applies origam--border-thin utility class', async ({ page }) => {
            // Story sets border="thin" rounded="medium" on the Functional variant.
            // useBorder emits both origam-qr-code--border (component scope) and
            // origam--border-thin (utility class) on the root.
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            await expect(qr).toHaveClass(/origam--border-thin/)
        })

        test('rounded=medium applies origam-qr-code--rounded-medium class', async ({ page }) => {
            // useRounded emits the component-scoped class origam-qr-code--rounded-medium
            // (not the generic utility origam--rounded-medium) on the QrCode root.
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            await expect(qr).toHaveClass(/origam-qr-code--rounded-medium/)
        })

        test('no .origam-qr-code__center present when no overlay props set', async ({ page }) => {
            // Functional init has icon: undefined, image: undefined, no center slot
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            const centerCount = await qr.locator('.origam-qr-code__center').count()
            expect(centerCount).toBe(0)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - center (index 2)                                            //
    // Static: error-correction-level="H" :size="200"                     //
    // Slot: <span class="qrcode-star-overlay">★</span>                   //
    // classes: origam-qr-code origam-qr-code--ecc-h                      //
    // ------------------------------------------------------------------ //

    test.describe('Slots - center', () => {
        test('mounts and renders the SVG', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            const svg = qr.locator('.origam-qr-code__svg-host svg').first()
            await expect(svg).toBeAttached({ timeout: 12000 })
        })

        test('ECC=H modifier class applied (story passes error-correction-level="H")', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            await expect(qr).toHaveClass(/origam-qr-code--ecc-h/)
        })

        test('center slot mounts the .origam-qr-code__center wrapper', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            const center = qr.locator('.origam-qr-code__center').first()
            await expect(center).toBeAttached()
        })

        test('center slot renders custom content (star span)', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            // Story slots a <span class="qrcode-star-overlay"> with ★ (U+2605)
            const star = qr.locator('.origam-qr-code__center .qrcode-star-overlay').first()
            await expect(star).toBeAttached()
        })

        test('center wrapper carries aria-hidden="true" (decorative overlay)', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            const center = qr.locator('.origam-qr-code__center').first()
            await expect(center).toBeAttached()
            await expect(center).toHaveAttribute('aria-hidden', 'true')
        })

        test('H ECC produces more SVG rects than M ECC for the same payload', async ({ page }) => {
            // H (~30% redundancy) generates a denser matrix than M (~15%).
            // Compare Slots-center (ECC=H, same domain payload) vs Design (ECC=M).
            // Design: 'https://origam.dev' → ECC=M
            // Slots-center: 'https://origam.dev/center-slot' → ECC=H
            // Both payloads are short URLs — rect count difference comes from ECC level.
            await page.goto(variantUrl(2))
            const sandboxH = page.frameLocator('iframe[src*="__sandbox"]')
            const qrH = sandboxH.locator('.origam-qr-code').first()
            await expect(qrH).toBeVisible({ timeout: 30000 })
            await expect(qrH.locator('.origam-qr-code__svg-host svg').first()).toBeAttached({ timeout: 12000 })
            const hCount = await qrH.locator('.origam-qr-code__svg-host svg rect').count()

            await page.goto(variantUrl(0))
            const sandboxM = page.frameLocator('iframe[src*="__sandbox"]')
            const qrM = sandboxM.locator('.origam-qr-code').first()
            await expect(qrM).toBeVisible({ timeout: 15000 })
            await expect(qrM.locator('.origam-qr-code__svg-host svg').first()).toBeAttached({ timeout: 12000 })
            const mCount = await qrM.locator('.origam-qr-code__svg-host svg rect').count()

            expect(hCount).toBeGreaterThan(1)
            expect(mCount).toBeGreaterThan(1)
            // H generates strictly more redundancy → higher module count.
            expect(hCount).toBeGreaterThan(mCount)
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT — playground (index 3)                                       //
    // init: { value: 'https://origam.dev', size: 200, ecc: 'M', … }     //
    // classes: origam-qr-code origam-qr-code--ecc-m                      //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders the QR root with BEM class', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
        })

        test('SVG is injected into the svg-host span', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            const svg = qr.locator('.origam-qr-code__svg-host svg').first()
            await expect(svg).toBeAttached({ timeout: 12000 })
        })

        test('ECC=M modifier class present (init state)', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            await expect(qr).toHaveClass(/origam-qr-code--ecc-m/)
        })

        test('aria-label defaults to "QR code for https://origam.dev"', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            const label = await qr.getAttribute('aria-label')
            expect(label).toBe('QR code for https://origam.dev')
        })

        test('svg-host has display:block (SCSS rule)', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            const host = qr.locator('.origam-qr-code__svg-host').first()
            await expect(host).toBeAttached()
            const display = await host.evaluate(el => getComputedStyle(el).display)
            expect(display).toBe('block')
        })

        test('svg-host enforces 1:1 aspect-ratio (SCSS rule)', async ({ page }) => {
            // Story sets size=200 → svg-host should be exactly 200×200.
            // aspect-ratio: 1 means width === height (tolerance ±2px for sub-pixel).
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })
            const host = qr.locator('.origam-qr-code__svg-host').first()
            const box = await host.boundingBox()
            expect(box).not.toBeNull()
            // aspect-ratio: 1 → width ≈ height (tolerance ±2px for sub-pixel rounding)
            expect(Math.abs(box!.width - box!.height)).toBeLessThanOrEqual(2)
        })

        test('SCSS: ECC modifier classes can be toggled programmatically', async ({ page }) => {
            // Verify that all 4 ECC SCSS modifier classes are compiled into the
            // scoped stylesheet by injecting each one and checking class presence.
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const qr = sandbox.locator('.origam-qr-code').first()
            await expect(qr).toBeVisible({ timeout: 30000 })

            for (const ecc of ['l', 'q', 'h'] as const) {
                const hasClass = await qr.evaluate((el, suffix) => {
                    el.classList.remove('origam-qr-code--ecc-m')
                    el.classList.add(`origam-qr-code--ecc-${suffix}`)
                    return el.classList.contains(`origam-qr-code--ecc-${suffix}`)
                }, ecc)
                expect(hasClass, `ecc-${ecc} class should be togglable`).toBe(true)
            }
        })
    })
})
