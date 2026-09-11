import { expect, test } from '@playwright/test'

/**
 * OrigamWatermark — runtime probes.
 *
 * Story variants (0-based index):
 *   0 → Design      init: text=CONFIDENTIAL, opacity=0.1, angle=-30, gap=120, fontSize=16
 *   1 → Functional  init: antiTamper=false, pointerEvents='none', zIndex=1, text=CONFIDENTIAL, opacity=0.1
 *   2 → Slots - Default  static: text="CONFIDENTIAL — j.doe@example.com — 2026-05-15", opacity=0.08, angle=-30, color=#dc2626
 *   3 → Default     playground: text=CONFIDENTIAL, opacity=0.1, angle=-30, gap=120, fontSize=16
 *
 * SVG anatomy (produced by useWatermark / buildPatternUrl):
 *   tile = gap + fontSize
 *   text mode → <text … opacity="N">TEXT</text>
 *   image mode → <image href="…" … opacity="N"/>
 *   rotation  → <g transform="rotate(ANGLE CX CY)">
 *   viewBox   → "0 0 TILE TILE"
 *
 * DOM anatomy:
 *   .origam-watermark[data-cy="origam-watermark"]   — root (position: relative)
 *     ↳ <slot/>                                     — wrapped content
 *     ↳ .origam-watermark__layer[data-cy="origam-watermark-layer"]
 *         aria-hidden="true"
 *         style.backgroundImage = url("data:image/svg+xml,<percent-encoded-svg>")
 *         style.pointerEvents = "none"
 *         style.zIndex = "1"
 *
 * Navigation: direct variantId query param. No networkidle — Histoire keeps an HMR
 * websocket open and networkidle never resolves.
 *
 * Cold-start latency: the sandbox iframe bundles the full Vite/Vue module graph on
 * first load; in headless Chromium this takes ~19s. All first-visible assertions
 * therefore use timeout:30000.
 */

const STORY_ID   = 'components-stories-watermark-origamwatermark-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

/**
 * Decode the SVG payload from the layer's backgroundImage inline style.
 *
 * The browser stores the style value as:
 *   url("data:image/svg+xml,<percent-encoded-svg>")
 *
 * A greedy quantifier captures everything up to the closing double-quote so
 * ")" characters inside the SVG body (e.g. in CSS transform values like
 * rotate(-30 68 68)) don't prematurely terminate the match.
 */
const getDecodedBackground = async (
    layer: ReturnType<import('@playwright/test').Page['locator']>
): Promise<string> => {
    const raw = await layer.evaluate((el) => (el as HTMLElement).style.backgroundImage)
    const match = raw.match(/url\("data:image\/svg\+xml,(.+)"\)/)
    if (!match) throw new Error(`unexpected backgroundImage shape: ${raw.slice(0, 300)}`)
    return decodeURIComponent(match[1])
}

test.describe('OrigamWatermark', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: text=CONFIDENTIAL, opacity=0.1, angle=-30, gap=120, fontSize=16 //
    // tile = gap + fontSize = 120 + 16 = 136                              //
    // ------------------------------------------------------------------ //

    test.describe('Design variant', () => {
        test('renders root and layer with BEM classes', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root  = sandbox.locator('.origam-watermark').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const layer = root.locator('.origam-watermark__layer').first()
            await expect(layer).toBeVisible({ timeout: 5000 })
        })

        test('layer carries aria-hidden="true" so screen readers skip the overlay', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const layer = sandbox.locator('[data-cy="origam-watermark-layer"]').first()
            await expect(layer).toBeVisible({ timeout: 30000 })
            await expect(layer).toHaveAttribute('aria-hidden', 'true')
        })

        test('layer backgroundImage is a data:image/svg+xml URL', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const layer = sandbox.locator('[data-cy="origam-watermark-layer"]').first()
            await expect(layer).toBeVisible({ timeout: 30000 })
            const raw = await layer.evaluate((el) => (el as HTMLElement).style.backgroundImage)
            expect(raw).toMatch(/^url\("data:image\/svg\+xml,/)
        })

        test('SVG contains a <text> glyph with text CONFIDENTIAL', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const layer = sandbox.locator('[data-cy="origam-watermark-layer"]').first()
            await expect(layer).toBeVisible({ timeout: 30000 })
            const svg = await getDecodedBackground(layer)
            expect(svg).toContain('<text')
            expect(svg).toContain('CONFIDENTIAL')
            expect(svg).not.toContain('<image')
        })

        test('SVG viewBox matches tile = gap(120) + fontSize(16) = 136', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const layer = sandbox.locator('[data-cy="origam-watermark-layer"]').first()
            await expect(layer).toBeVisible({ timeout: 30000 })
            const svg = await getDecodedBackground(layer)
            expect(svg).toContain('viewBox="0 0 136 136"')
        })

        test('SVG rotate() transform uses init angle -30', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const layer = sandbox.locator('[data-cy="origam-watermark-layer"]').first()
            await expect(layer).toBeVisible({ timeout: 30000 })
            const svg = await getDecodedBackground(layer)
            expect(svg).toMatch(/rotate\(-30\b/)
        })

        test('SVG opacity attribute matches init opacity=0.1', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const layer = sandbox.locator('[data-cy="origam-watermark-layer"]').first()
            await expect(layer).toBeVisible({ timeout: 30000 })
            const svg = await getDecodedBackground(layer)
            expect(svg).toContain('opacity="0.1"')
        })

        test('root has position:relative (computed) so absolute layer is bounded', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('[data-cy="origam-watermark"]').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const position = await root.evaluate(
                (el) => getComputedStyle(el).position
            )
            expect(position).toBe('relative')
        })

        test('layer inline style has pointer-events:none', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const layer = sandbox.locator('[data-cy="origam-watermark-layer"]').first()
            await expect(layer).toBeVisible({ timeout: 30000 })
            const pe = await layer.evaluate(
                (el) => (el as HTMLElement).style.pointerEvents
            )
            expect(pe).toBe('none')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: antiTamper=false, pointerEvents='none', zIndex=1,             //
    //       text=CONFIDENTIAL, opacity=0.1                                //
    // ------------------------------------------------------------------ //

    test.describe('Functional variant', () => {
        test('renders root and layer', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-watermark').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const layer = root.locator('.origam-watermark__layer').first()
            await expect(layer).toBeVisible({ timeout: 5000 })
        })

        test('zIndex=1 (init) is set on the layer inline style', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const layer = sandbox.locator('[data-cy="origam-watermark-layer"]').first()
            await expect(layer).toBeVisible({ timeout: 30000 })
            const zi = await layer.evaluate((el) => (el as HTMLElement).style.zIndex)
            expect(zi).toBe('1')
        })

        test('antiTamper=false (init) — layer stays removed after DOM removal', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('[data-cy="origam-watermark"]').first()
            await expect(root).toBeVisible({ timeout: 30000 })

            const before = await root.locator('[data-cy="origam-watermark-layer"]').count()
            expect(before).toBe(1)

            // Remove the layer — no MutationObserver installed (antiTamper=false)
            await root.evaluate((node) => {
                const layer = (node as HTMLElement).querySelector('[data-cy="origam-watermark-layer"]')
                if (layer) layer.remove()
            })
            await page.waitForTimeout(200)

            const after = await root.locator('[data-cy="origam-watermark-layer"]').count()
            expect(after).toBe(0)
        })

        test('antiTamper=true — layer is re-injected after DOM removal', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('[data-cy="origam-watermark"]').first()
            await expect(root).toBeVisible({ timeout: 30000 })

            // HstCheckbox in Histoire renders as a <label role="checkbox"> — no real <input>.
            // The label with text "Anti-Tamper" is the second occurrence (the first is the
            // StoryGroup legend). We target the clickable label inside the controls panel.
            const checkbox = page.locator('label.histoire-checkbox').filter({ hasText: /^Anti-Tamper$/ }).first()
            await expect(checkbox).toBeVisible({ timeout: 8000 })
            await checkbox.click()
            // Allow Vue reactivity to propagate the prop change + install the MutationObserver
            await page.waitForTimeout(300)

            // Remove the layer
            await root.evaluate((node) => {
                const layer = (node as HTMLElement).querySelector('[data-cy="origam-watermark-layer"]')
                if (layer) layer.remove()
            })
            // MutationObserver microtask deferred via Promise.resolve() — wait 300ms
            await page.waitForTimeout(300)

            const after = await root.locator('[data-cy="origam-watermark-layer"]').count()
            expect(after).toBe(1)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - DEFAULT (index 2)                                            //
    // static: text="CONFIDENTIAL — j.doe@example.com — 2026-05-15",      //
    //         opacity=0.08, angle=-30, color=#dc2626                      //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default variant', () => {
        test('renders root with slotted <article> content visible', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-watermark').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const heading = root.locator('article h2').first()
            await expect(heading).toBeVisible({ timeout: 5000 })
            await expect(heading).toContainText('Project Falcon')
        })

        test('layer aria-hidden="true" on the Slots variant', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const layer = sandbox.locator('[data-cy="origam-watermark-layer"]').first()
            await expect(layer).toBeVisible({ timeout: 30000 })
            await expect(layer).toHaveAttribute('aria-hidden', 'true')
        })

        test('SVG opacity is 0.08 (static prop)', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const layer = sandbox.locator('[data-cy="origam-watermark-layer"]').first()
            await expect(layer).toBeVisible({ timeout: 30000 })
            const svg = await getDecodedBackground(layer)
            expect(svg).toContain('opacity="0.08"')
        })

        test('SVG fill uses the static color #dc2626', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const layer = sandbox.locator('[data-cy="origam-watermark-layer"]').first()
            await expect(layer).toBeVisible({ timeout: 30000 })
            const svg = await getDecodedBackground(layer)
            expect(svg).toContain('fill="#dc2626"')
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 3)                                       //
    // init: text=CONFIDENTIAL, opacity=0.1, angle=-30, gap=120,          //
    //       fontSize=16, antiTamper=false, pointerEvents='none', zIndex=1 //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground) variant', () => {
        test('renders root and layer', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-watermark').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            const layer = root.locator('.origam-watermark__layer').first()
            await expect(layer).toBeVisible({ timeout: 5000 })
        })

        test('playground init — SVG text + angle=-30 + opacity=0.1 + tile=136', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const layer = sandbox.locator('[data-cy="origam-watermark-layer"]').first()
            await expect(layer).toBeVisible({ timeout: 30000 })
            const svg = await getDecodedBackground(layer)
            expect(svg).toContain('<text')
            expect(svg).toContain('CONFIDENTIAL')
            expect(svg).toMatch(/rotate\(-30\b/)
            expect(svg).toContain('opacity="0.1"')
            // tile = gap(120) + fontSize(16) = 136
            expect(svg).toContain('viewBox="0 0 136 136"')
        })

        test('slot button inside the playground is still clickable (pointer-events passthrough)', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('.origam-watermark').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            // The playground slot contains <button type="button">I am still clickable</button>
            const btn = root.locator('button').first()
            await expect(btn).toBeVisible({ timeout: 5000 })
            // If the layer intercepted clicks this would fail
            await btn.click()
        })

        test('origam-watermark--anti-tamper class absent when antiTamper=false (init)', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator('[data-cy="origam-watermark"]').first()
            await expect(root).toBeVisible({ timeout: 30000 })
            await expect(root).not.toHaveClass(/origam-watermark--anti-tamper/)
        })
    })
})
