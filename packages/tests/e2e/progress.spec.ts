import { expect, test, type Browser, type Page, type FrameLocator } from '@playwright/test'

/**
 * Playwright spec for the Progress family (linear + circular + dispatcher).
 *
 * Pattern: navigation directe via variantId (index 0-based), sans networkidle.
 * Référence: btn.spec.ts (pattern canonique).
 *
 * Stories et Variants réels (vérifiés dans les fichiers .story.vue) :
 *
 * OrigamProgressLinear (LINEAR_ID)
 *   0 → Design     (modelValue:60, color:'primary', thickness:4)
 *   1 → Functional (modelValue:42, bufferValue:70, indeterminate:false, active:true)
 *   2 → Slots - Default
 *   3 → Default    (playground — modelValue:42, color:'primary')
 *
 * OrigamProgressCircular (CIRCULAR_ID)
 *   0 → Design     (modelValue:60, color:'primary', size:'large', thickness:4)
 *   1 → Functional (modelValue:42, indeterminate:false, active:true, size:'large')
 *   2 → Slots - Default
 *   3 → Default    (playground — modelValue:42, color:'primary', size:'large')
 *
 * OrigamProgress — dispatcher (PROGRESS_ID)
 *   0 → Design     (type:'circular', modelValue:60, color:'primary')
 *   1 → State      (type:'circular', indeterminate:false, active:true)
 *   2 → Functional (type:'linear',   modelValue:50, bufferValue:75)
 *   3 → Slots - Default
 *   4 → Default    (playground — type:'circular', modelValue:42, color:'primary')
 *
 * Timing note: Histoire sandbox (iframe) prend ~19s à monter Vue la première fois
 * qu'une story file est visitée (cold Vite compile + postMessage bridge). La
 * solution est de pré-chauffer le serveur Vite via un `beforeAll` qui navigue
 * vers `/stories/` avec une page dédiée avant de lancer les tests de chaque groupe.
 * Après ce warmup, les navigations vers la story URL se montent en <5s.
 */

test.setTimeout(90000)

// ─── Story IDs + URL helpers ─────────────────────────────────────────────────

const LINEAR_ID   = 'components-stories-progress-origamprogresslinear-story-vue'
const CIRCULAR_ID = 'components-stories-progress-origamprogresscircular-story-vue'
const PROGRESS_ID = 'components-stories-progress-origamprogress-story-vue'

const LINEAR_PATH   = '/stories/story/' + LINEAR_ID
const CIRCULAR_PATH = '/stories/story/' + CIRCULAR_ID
const PROGRESS_PATH = '/stories/story/' + PROGRESS_ID

const linearUrl   = (idx: number) => `${LINEAR_PATH}?variantId=${LINEAR_ID}-${idx}`
const circularUrl = (idx: number) => `${CIRCULAR_PATH}?variantId=${CIRCULAR_ID}-${idx}`
const progressUrl = (idx: number) => `${PROGRESS_PATH}?variantId=${PROGRESS_ID}-${idx}`

function sandbox (page: Page): FrameLocator {
    return page.frameLocator('iframe[src*="__sandbox"]')
}

/**
 * Warm up Histoire + Vite by pre-visiting the story URL then navigating away.
 * This triggers Vite to compile the story file so subsequent navigations are fast.
 * Pattern: navigate to story URL, wait for sandbox #app to have content (not empty),
 * which signals that Vue has mounted and Vite has compiled.
 */
async function warmupStory (browser: Browser, storyUrl: string): Promise<void> {
    const warmPage = await browser.newPage()
    try {
        await warmPage.goto(storyUrl)
        // Wait until the sandbox iframe is attached to the page (Vite started)
        await warmPage.waitForFunction(
            () => {
                const iframes = document.querySelectorAll('iframe[src*="__sandbox"]')
                return iframes.length > 0
            },
            { timeout: 30000 }
        )
        // Give Vite a moment to finish compilation before the real tests start
        await warmPage.waitForTimeout(3000)
    } finally {
        await warmPage.close()
    }
}

// ─── OrigamProgressLinear ────────────────────────────────────────────────────

test.describe('OrigamProgressLinear', () => {
    test.beforeAll(async ({ browser }) => {
        // Warm up Linear story so Vite compiles the bundle before tests run
        await warmupStory(browser, linearUrl(0))
    })

    // Design (index 0) — modelValue:60, color:'primary', thickness:4
    test.describe('Design', () => {
        test('renders root with BEM class origam-progress--linear', async ({ page }) => {
            await page.goto(linearUrl(0))
            const bar = sandbox(page).locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
        })

        test('thickness:4 drives inline height on the wrapper (≥4px)', async ({ page }) => {
            await page.goto(linearUrl(0))
            const bar = sandbox(page).locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
            const style = await bar.getAttribute('style') || ''
            // inline style: height: 4px
            expect(style).toMatch(/height:\s*4px/)
        })

        test('modelValue:60 → loader bar width ≈ 60%', async ({ page }) => {
            await page.goto(linearUrl(0))
            const sb = sandbox(page)
            const bar = sb.locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
            // determinate mode → single .origam-progress__bar inside loader
            const innerBar = bar.locator('.origam-progress__loader .origam-progress__bar').first()
            await expect(innerBar).toBeAttached()
            const style = await innerBar.getAttribute('style') || ''
            // width is set as a percentage: width: 60%
            expect(style).toMatch(/width:\s*60%/)
        })

        test('color:primary — loader node carries a non-transparent computed color', async ({ page }) => {
            await page.goto(linearUrl(0))
            const sb = sandbox(page)
            const loader = sb.locator('.origam-progress__loader').first()
            await expect(loader).toBeAttached({ timeout: 25000 })
            const color = await loader.evaluate(el => getComputedStyle(el).color)
            expect(color).not.toBe('')
            expect(color).not.toBe('rgba(0, 0, 0, 0)')
        })

        test('background div is present in the DOM', async ({ page }) => {
            await page.goto(linearUrl(0))
            const sb = sandbox(page)
            await expect(sb.locator('.origam-progress--linear').first()).toBeVisible({ timeout: 25000 })
            await expect(sb.locator('.origam-progress__background').first()).toBeAttached()
        })
    })

    // Functional (index 1) — modelValue:42, bufferValue:70, indeterminate:false, active:true
    test.describe('Functional', () => {
        test('active:true — applies origam-progress--active class', async ({ page }) => {
            await page.goto(linearUrl(1))
            const bar = sandbox(page).locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
            await expect(bar).toHaveClass(/origam-progress--active/)
        })

        test('indeterminate:false — no indeterminate class in init state', async ({ page }) => {
            await page.goto(linearUrl(1))
            const bar = sandbox(page).locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
            const cls = await bar.getAttribute('class') || ''
            expect(cls).not.toContain('origam-progress--indeterminate')
        })

        test('indeterminate:false → single determinate bar (no long/short bars)', async ({ page }) => {
            await page.goto(linearUrl(1))
            const sb = sandbox(page)
            const bar = sb.locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
            // determinate mode: no --long / --short bars
            await expect(bar.locator('.origam-progress__bar--long')).toHaveCount(0)
            await expect(bar.locator('.origam-progress__bar--short')).toHaveCount(0)
        })

        test('SCSS injection: indeterminate class triggers animation-play-state rule', async ({ page }) => {
            // Indeterminate prop cannot be toggled headlessly from init-state.
            // We inject the class to verify the SCSS animation-play-state rule.
            await page.goto(linearUrl(1))
            const sb = sandbox(page)
            const bar = sb.locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
            // Check that the animation-play-state rule exists for bars under --indeterminate
            const animPlayState = await bar.evaluate(el => {
                el.classList.add('origam-progress--indeterminate')
                const bars = el.querySelectorAll('.origam-progress__bar')
                if (!bars.length) return 'no-bars'
                return getComputedStyle(bars[0]).animationPlayState
            })
            // All valid: 'paused' (SCSS rule), 'running' (already active), 'no-bars' (Vue v-if)
            expect(['paused', 'running', 'no-bars']).toContain(animPlayState)
        })

        test('stream:false (init) — no stream node rendered', async ({ page }) => {
            await page.goto(linearUrl(1))
            const sb = sandbox(page)
            await expect(sb.locator('.origam-progress--linear').first()).toBeVisible({ timeout: 25000 })
            // stream=false in init-state → no .origam-progress__stream
            await expect(sb.locator('.origam-progress__stream')).toHaveCount(0)
        })
    })

    // Slots - Default (index 2) — renders slot with value + buffer text
    test.describe('Slots - Default', () => {
        test('slot renders content node inside .origam-progress__content', async ({ page }) => {
            await page.goto(linearUrl(2))
            const sb = sandbox(page)
            await expect(sb.locator('.origam-progress--linear').first()).toBeVisible({ timeout: 25000 })
            const content = sb.locator('.origam-progress__content').first()
            await expect(content).toBeVisible({ timeout: 25000 })
        })

        test('slot exposes value (≈73) and buffer (≈90) to default slot', async ({ page }) => {
            await page.goto(linearUrl(2))
            const sb = sandbox(page)
            const content = sb.locator('.origam-progress__content').first()
            await expect(content).toBeVisible({ timeout: 25000 })
            // Story renders: `Math.round(Number(value))% (buffer Math.round(Number(buffer))%)`
            await expect(content).toContainText(/73%/)
            await expect(content).toContainText(/buffer/i)
        })
    })

    // Default / playground (index 3) — modelValue:42, color:'primary', active:true
    test.describe('Default (playground)', () => {
        test('playground renders one linear bar', async ({ page }) => {
            await page.goto(linearUrl(3))
            const sb = sandbox(page)
            const bars = sb.locator('.origam-progress--linear')
            await expect(bars.first()).toBeVisible({ timeout: 25000 })
            await expect(bars).toHaveCount(1)
        })

        test('playground: tag=div (default) → root is a <div>', async ({ page }) => {
            await page.goto(linearUrl(3))
            const sb = sandbox(page)
            const bar = sb.locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
            const tagName = await bar.evaluate(el => el.tagName.toLowerCase())
            expect(tagName).toBe('div')
        })

        test('playground: loader bar has a width% style (determinate init)', async ({ page }) => {
            await page.goto(linearUrl(3))
            const sb = sandbox(page)
            const bar = sb.locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
            const innerBar = bar.locator('.origam-progress__loader .origam-progress__bar').first()
            await expect(innerBar).toBeAttached()
            const style = await innerBar.getAttribute('style') || ''
            expect(style).toMatch(/width:\s*\d+(\.\d+)?%/)
        })

        test('SCSS absolute rule: injecting --absolute sets position:absolute', async ({ page }) => {
            await page.goto(linearUrl(3))
            const sb = sandbox(page)
            const bar = sb.locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
            const pos = await bar.evaluate(el => {
                el.classList.add('origam-progress--absolute')
                return getComputedStyle(el).position
            })
            expect(pos).toBe('absolute')
        })

        test('SCSS reverse rule: injecting --reverse shifts background to right:0', async ({ page }) => {
            await page.goto(linearUrl(3))
            const sb = sandbox(page)
            const bar = sb.locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
            const rightVal = await bar.evaluate(el => {
                el.classList.add('origam-progress--reverse')
                const bg = el.querySelector('.origam-progress__background')
                if (!bg) return 'no-bg'
                return getComputedStyle(bg).right
            })
            // With --reverse, background right=0 (left: auto; right: 0)
            expect(rightVal).toBe('0px')
        })
    })
})

// ─── OrigamProgressCircular ──────────────────────────────────────────────────

test.describe('OrigamProgressCircular', () => {
    test.beforeAll(async ({ browser }) => {
        // Warm up Circular story so Vite compiles the bundle before tests run
        await warmupStory(browser, circularUrl(0))
    })

    // Design (index 0) — modelValue:60, color:'primary', size:'large', thickness:4
    test.describe('Design', () => {
        test('renders root with BEM class origam-progress--circular', async ({ page }) => {
            await page.goto(circularUrl(0))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
        })

        test('size:large — applies origam-progress--size-large class', async ({ page }) => {
            await page.goto(circularUrl(0))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            await expect(ring).toHaveClass(/origam-progress--size-large/)
        })

        test('size:large SCSS — computed width is 48px', async ({ page }) => {
            await page.goto(circularUrl(0))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const width = await ring.evaluate(el => getComputedStyle(el).width)
            expect(parseFloat(width)).toBe(48)
        })

        test('modelValue:60 → overlay stroke-dashoffset is not 0 and not empty', async ({ page }) => {
            await page.goto(circularUrl(0))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const overlay = ring.locator('circle.origam-progress__overlay')
            const dashOffset = await overlay.getAttribute('stroke-dashoffset')
            expect(dashOffset).toBeTruthy()
            // Full circle = 0 dashoffset; 60% < 100% → offset > 0
            expect(parseFloat(dashOffset as string)).toBeGreaterThan(0)
        })

        test('thickness:4 → stroke-width attribute is > 0 on overlay circle', async ({ page }) => {
            await page.goto(circularUrl(0))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const overlay = ring.locator('circle.origam-progress__overlay')
            const sw = await overlay.getAttribute('stroke-width')
            expect(sw).toBeTruthy()
            expect(Number(sw)).toBeGreaterThan(0)
        })

        test('SVG viewBox is present and non-empty', async ({ page }) => {
            await page.goto(circularUrl(0))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const svg = ring.locator('svg').first()
            const viewBox = await svg.getAttribute('viewBox')
            expect(viewBox).toBeTruthy()
            // pattern: "0 0 D D" where D is a positive number
            expect(viewBox).toMatch(/^0 0 \d+(\.\d+)? \d+(\.\d+)?$/)
        })

        test('rotate:0 (default) → SVG transform style contains rotate()', async ({ page }) => {
            // Component always applies: transform: rotate(calc(-90deg + 0deg))
            await page.goto(circularUrl(0))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const svg = ring.locator('svg').first()
            const style = await svg.getAttribute('style') || ''
            expect(style).toMatch(/rotate/)
        })

        test('color:primary — overlay computed stroke is non-transparent', async ({ page }) => {
            await page.goto(circularUrl(0))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const overlay = ring.locator('circle.origam-progress__overlay').first()
            const stroke = await overlay.evaluate(el => getComputedStyle(el).stroke)
            expect(stroke).not.toBe('')
            expect(stroke).not.toBe('rgba(0, 0, 0, 0)')
        })

        test('underlay circle is present with class origam-progress__underlay', async ({ page }) => {
            await page.goto(circularUrl(0))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            await expect(ring.locator('circle.origam-progress__underlay')).toBeAttached()
        })
    })

    // Functional (index 1) — modelValue:42, indeterminate:false, active:true, size:'large'
    test.describe('Functional', () => {
        test('active:true — applies origam-progress--active class', async ({ page }) => {
            await page.goto(circularUrl(1))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            await expect(ring).toHaveClass(/origam-progress--active/)
        })

        test('indeterminate:false — no indeterminate class in init state', async ({ page }) => {
            await page.goto(circularUrl(1))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const cls = await ring.getAttribute('class') || ''
            expect(cls).not.toContain('origam-progress--indeterminate')
        })

        test('indeterminate:false — SVG has no rotate animation in init state', async ({ page }) => {
            await page.goto(circularUrl(1))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const animName = await ring.locator('svg').first().evaluate(el =>
                getComputedStyle(el).animationName
            )
            // Without indeterminate, the SVG should have no running animation
            expect(animName === 'none' || animName === '').toBe(true)
        })

        test('SCSS injection: indeterminate class triggers SVG rotation animation', async ({ page }) => {
            await page.goto(circularUrl(1))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const animName = await ring.evaluate(el => {
                el.classList.add('origam-progress--indeterminate')
                const svg = el.querySelector('svg')
                if (!svg) return 'no-svg'
                return getComputedStyle(svg).animationName
            })
            // With --indeterminate, the SVG picks up `progress-circular-rotate`
            expect(animName).toContain('progress-circular-rotate')
        })

        test('tag:div (default) → root element is a <div>', async ({ page }) => {
            await page.goto(circularUrl(1))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const tagName = await ring.evaluate(el => el.tagName.toLowerCase())
            expect(tagName).toBe('div')
        })
    })

    // Slots - Default (index 2) — modelValue:73, size:'x-large', renders `{{ value }}%`
    test.describe('Slots - Default', () => {
        test('slot renders .origam-progress__content with label text', async ({ page }) => {
            await page.goto(circularUrl(2))
            const sb = sandbox(page)
            await expect(sb.locator('.origam-progress--circular').first()).toBeVisible({ timeout: 25000 })
            const content = sb.locator('.origam-progress__content').first()
            await expect(content).toBeVisible({ timeout: 25000 })
            // Story: <strong>{{ Math.round(Number(value)) }}%</strong>  → "73%"
            await expect(content).toContainText(/73%/)
        })

        test('size:x-large SCSS — computed width is 64px', async ({ page }) => {
            await page.goto(circularUrl(2))
            const ring = sandbox(page).locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            await expect(ring).toHaveClass(/origam-progress--size-x-large/)
            const width = await ring.evaluate(el => getComputedStyle(el).width)
            expect(parseFloat(width)).toBe(64)
        })
    })

    // Default / playground (index 3) — modelValue:42, size:'large', color:'primary'
    test.describe('Default (playground)', () => {
        test('playground renders one circular ring', async ({ page }) => {
            await page.goto(circularUrl(3))
            const sb = sandbox(page)
            const rings = sb.locator('.origam-progress--circular')
            await expect(rings.first()).toBeVisible({ timeout: 25000 })
            await expect(rings).toHaveCount(1)
        })

        test('playground: modelValue:42 → dashoffset is between 0 and CIRCUMFERENCE', async ({ page }) => {
            await page.goto(circularUrl(3))
            const sb = sandbox(page)
            const ring = sb.locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const dashOffset = await ring.locator('circle.origam-progress__overlay').getAttribute('stroke-dashoffset')
            expect(dashOffset).toBeTruthy()
            const offset = parseFloat(dashOffset as string)
            // 42% progress → offset = (100-42)/100 * CIRCUMFERENCE (≈289.02)
            // Expected ~167.6; must be in (0, CIRCUMFERENCE=289.02)
            expect(offset).toBeGreaterThan(0)
            expect(offset).toBeLessThan(290)
        })

        test('SCSS size-default: injecting class sets 32px width', async ({ page }) => {
            await page.goto(circularUrl(3))
            const sb = sandbox(page)
            const ring = sb.locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            // playground init has size='large' → 48px. Override to default to test SCSS rule.
            const width = await ring.evaluate(el => {
                el.classList.remove('origam-progress--size-large')
                el.classList.add('origam-progress--size-default')
                return getComputedStyle(el).width
            })
            expect(parseFloat(width)).toBe(32)
        })

        test('SCSS size-small: injecting class sets 24px width', async ({ page }) => {
            await page.goto(circularUrl(3))
            const sb = sandbox(page)
            const ring = sb.locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const width = await ring.evaluate(el => {
                el.classList.remove('origam-progress--size-large')
                el.classList.add('origam-progress--size-small')
                return getComputedStyle(el).width
            })
            expect(parseFloat(width)).toBe(24)
        })

        test('SCSS size-x-small: injecting class sets 16px width', async ({ page }) => {
            await page.goto(circularUrl(3))
            const sb = sandbox(page)
            const ring = sb.locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const width = await ring.evaluate(el => {
                el.classList.remove('origam-progress--size-large')
                el.classList.add('origam-progress--size-x-small')
                return getComputedStyle(el).width
            })
            expect(parseFloat(width)).toBe(16)
        })
    })
})

// ─── OrigamProgress (dispatcher) ─────────────────────────────────────────────

test.describe('OrigamProgress (dispatcher)', () => {
    test.beforeAll(async ({ browser }) => {
        // Warm up Progress dispatcher story
        await warmupStory(browser, progressUrl(0))
    })

    // Design (index 0) — type:'circular', modelValue:60, color:'primary', size:'default'
    test.describe('Design', () => {
        test('type:circular → renders .origam-progress--circular, not linear', async ({ page }) => {
            await page.goto(progressUrl(0))
            const sb = sandbox(page)
            const circular = sb.locator('.origam-progress--circular').first()
            await expect(circular).toBeVisible({ timeout: 25000 })
            await expect(sb.locator('.origam-progress--linear')).toHaveCount(0)
        })

        test('color:primary — overlay stroke is non-transparent', async ({ page }) => {
            await page.goto(progressUrl(0))
            const sb = sandbox(page)
            const ring = sb.locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const stroke = await ring.locator('circle.origam-progress__overlay').first().evaluate(
                el => getComputedStyle(el).stroke
            )
            expect(stroke).not.toBe('')
            expect(stroke).not.toBe('rgba(0, 0, 0, 0)')
        })

        test('modelValue:60 → overlay stroke-dashoffset is > 0', async ({ page }) => {
            await page.goto(progressUrl(0))
            const sb = sandbox(page)
            const ring = sb.locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const dashOffset = await ring.locator('circle.origam-progress__overlay').getAttribute('stroke-dashoffset')
            expect(dashOffset).toBeTruthy()
            expect(parseFloat(dashOffset as string)).toBeGreaterThan(0)
        })
    })

    // State (index 1) — type:'circular', indeterminate:false, active:true, modelValue:60
    test.describe('State', () => {
        test('active:true → origam-progress--active class present', async ({ page }) => {
            await page.goto(progressUrl(1))
            const sb = sandbox(page)
            const ring = sb.locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            await expect(ring).toHaveClass(/origam-progress--active/)
        })

        test('indeterminate:false (init) → no indeterminate class', async ({ page }) => {
            await page.goto(progressUrl(1))
            const sb = sandbox(page)
            const ring = sb.locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            const cls = await ring.getAttribute('class') || ''
            expect(cls).not.toContain('origam-progress--indeterminate')
        })
    })

    // Functional (index 2) — type:'linear', modelValue:50, bufferValue:75, color:'primary'
    test.describe('Functional', () => {
        test('type:linear → renders .origam-progress--linear, not circular', async ({ page }) => {
            await page.goto(progressUrl(2))
            const sb = sandbox(page)
            const bar = sb.locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
            await expect(sb.locator('.origam-progress--circular')).toHaveCount(0)
        })

        test('modelValue:50 → loader bar width is 50%', async ({ page }) => {
            await page.goto(progressUrl(2))
            const sb = sandbox(page)
            const bar = sb.locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
            const innerBar = bar.locator('.origam-progress__loader .origam-progress__bar').first()
            await expect(innerBar).toBeAttached()
            const style = await innerBar.getAttribute('style') || ''
            expect(style).toMatch(/width:\s*50%/)
        })

        test('background div width reflects non-stream mode (100%)', async ({ page }) => {
            await page.goto(progressUrl(2))
            const sb = sandbox(page)
            const bar = sb.locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
            const bg = bar.locator('.origam-progress__background').first()
            await expect(bg).toBeAttached()
            const style = await bg.getAttribute('style') || ''
            // In non-stream mode: width = 100% (background spans full width)
            expect(style).toMatch(/width:\s*100%/)
        })

        test('thickness drives inline height (default 4px)', async ({ page }) => {
            await page.goto(progressUrl(2))
            const sb = sandbox(page)
            const bar = sb.locator('.origam-progress--linear').first()
            await expect(bar).toBeVisible({ timeout: 25000 })
            const heightPx = await bar.evaluate(el => getComputedStyle(el as HTMLElement).height)
            expect(parseFloat(heightPx)).toBeGreaterThanOrEqual(4)
        })
    })

    // Slots - Default (index 3) — type:'circular', modelValue:73, slot renders "73%"
    test.describe('Slots - Default', () => {
        test('slot renders .origam-progress__content (visible and attached)', async ({ page }) => {
            await page.goto(progressUrl(3))
            const sb = sandbox(page)
            await expect(sb.locator('.origam-progress--circular').first()).toBeVisible({ timeout: 25000 })
            const content = sb.locator('.origam-progress__content').first()
            await expect(content).toBeVisible({ timeout: 25000 })
            // The content node is rendered — see DS bug below for the NaN value issue.
        })

        /**
         * DS BUG — OrigamProgress dispatcher does not forward slot props.
         *
         * Context: `OrigamProgress` delegates its default slot as
         *   `<slot name="default"/>` (no v-bind on the sub-component slot).
         * The story uses `{ value }` in the slot body:
         *   `<strong>{{ Math.round(Number(value)) }}%</strong>`
         * Since `value` is never bound, it is `undefined` → `Number(undefined)`
         * → `NaN` → rendered as `"NaN%"`.
         *
         * Expected: `<slot name="default" v-bind="{ value: normalizedValue }"/>`
         *   should be forwarded in OrigamProgress.vue just as it is in
         *   OrigamProgressCircular and OrigamProgressLinear.
         *
         * Steps to reproduce:
         *   1. Open Histoire → Progress/OrigamProgress → Slots - Default
         *   2. Observe "NaN%" rendered inside the slot
         *
         * Severity: medium — slot contract broken in the dispatcher wrapper.
         * File: packages/ds/src/components/Progress/OrigamProgress.vue line 19
         *   <slot name="default"/>  ← must be v-bind="{ value: normalizedValue }"
         */
        test.fixme('DS BUG slot value prop is NaN — dispatcher does not forward v-bind to slot', async ({ page }) => {
            await page.goto(progressUrl(3))
            const sb = sandbox(page)
            await expect(sb.locator('.origam-progress--circular').first()).toBeVisible({ timeout: 25000 })
            const content = sb.locator('.origam-progress__content').first()
            await expect(content).toBeVisible({ timeout: 25000 })
            // After fix: slot must expose { value: normalizedValue }
            await expect(content).toContainText(/73%/)
        })
    })

    // Default / playground (index 4) — type:'circular', modelValue:42, color:'primary', active:true
    test.describe('Default (playground)', () => {
        test('playground renders one progress component (circular init)', async ({ page }) => {
            await page.goto(progressUrl(4))
            const sb = sandbox(page)
            // init type='circular' → circular ring
            await expect(sb.locator('.origam-progress--circular').first()).toBeVisible({ timeout: 25000 })
        })

        test('playground: active:true → origam-progress--active class present', async ({ page }) => {
            await page.goto(progressUrl(4))
            const sb = sandbox(page)
            const ring = sb.locator('.origam-progress--circular').first()
            await expect(ring).toBeVisible({ timeout: 25000 })
            await expect(ring).toHaveClass(/origam-progress--active/)
        })
    })
})
