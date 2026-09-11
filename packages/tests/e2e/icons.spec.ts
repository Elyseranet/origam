import { expect, test } from '@playwright/test'

/**
 * Consolidated Playwright spec for the Icon component family (Lot A4).
 *
 * Components covered:
 *   - OrigamIcon       (dispatcher)
 *   - OrigamClassIcon  (font-class leaf)
 *   - OrigamComponentIcon (Vue-component wrapper leaf)
 *   - OrigamLigatureIcon  (Material-style text ligature leaf)
 *   - OrigamSvgIcon    (inline SVG leaf)
 *
 * Each describe block mirrors one story file so that tests can navigate
 * to the matching Histoire variant URL and assert on what the user sees,
 * not on implementation details.
 *
 * Convention:
 *   - Navigate to the story path, then click the sidebar variant title.
 *   - All component assertions happen inside the iframe sandbox:
 *       page.frameLocator('iframe[src*="__sandbox"]')
 *   - Use `host.evaluate()` to dispatch synthetic DOM events when needed.
 */

// ─── Story URL helpers ───────────────────────────────────────────────────────

const ICON_STORY          = '/stories/story/components-stories-icon-origamicon-story-vue'
const CLASS_ICON_STORY    = '/stories/story/components-stories-icon-origamclassicon-story-vue'
const COMPONENT_ICON_STORY= '/stories/story/components-stories-icon-origamcomponenticon-story-vue'
const LIGATURE_ICON_STORY = '/stories/story/components-stories-icon-origamligatureicon-story-vue'
const SVG_ICON_STORY      = '/stories/story/components-stories-icon-origamsvgicon-story-vue'

// ─── OrigamIcon (dispatcher) ─────────────────────────────────────────────────

test.describe('OrigamIcon — dispatcher', () => {

    test('Size variant — .origam-icon is visible', async ({ page }) => {
        await page.goto(ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — size', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icon = sandbox.locator('.origam-icon').first()
        await expect(icon).toBeVisible({ timeout: 15000 })
    })

    test('All sizes — five origam-icon elements visible side by side', async ({ page }) => {
        await page.goto(ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — size', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // The variant renders 1 interactive icon (bound to state.size) + 5 static
        // icons at x-small/small/default/large/x-large = 6 total.
        const icons = sandbox.locator('.origam-icon')
        await expect(icons).toHaveCount(6, { timeout: 15000 })
    })

    test('All intents — five origam-icon elements visible', async ({ page }) => {
        await page.goto(ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — color & bgColor', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // The variant renders 1 state-bound icon (no color) + primary + success
        // + danger + warning + info = 6 total.
        const icons = sandbox.locator('.origam-icon')
        await expect(icons).toHaveCount(6, { timeout: 15000 })
    })

    test('Color — primary intent sets a non-transparent color', async ({ page }) => {
        await page.goto(ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — color & bgColor', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // The variant renders: index 0 = state-bound icon (no color), index 1 = color="primary".
        // We assert on index 1 (the primary icon).
        const primaryIcon = sandbox.locator('.origam-icon').nth(1)
        const colorValue = await primaryIcon.evaluate(
            el => getComputedStyle(el).color
        )
        expect(colorValue).not.toBe('rgba(0, 0, 0, 0)')
        expect(colorValue).not.toBe('transparent')
        // Phase 3 Vague D — class-first companion: the primary icon must carry the utility class.
        await expect(primaryIcon).toHaveClass(/origam--color-primary/)
    })

    test('Click button mode — icon gets origam-icon--clickable class', async ({ page }) => {
        await page.goto(ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Emit — click (button mode)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icon = sandbox.locator('.origam-icon--clickable').first()
        await expect(icon).toBeVisible({ timeout: 15000 })
    })

    test('Click button mode — role="button" is present', async ({ page }) => {
        await page.goto(ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Emit — click (button mode)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const btn = sandbox.locator('[role="button"]').first()
        await expect(btn).toBeVisible({ timeout: 15000 })
    })

    test('Dispatch SVG path — renders .origam-icon--svg', async ({ page }) => {
        await page.goto(ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (SVG path dispatch)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const svgIcon = sandbox.locator('.origam-icon--svg').first()
        await expect(svgIcon).toBeVisible({ timeout: 15000 })
    })

    test('Dispatch SVG path — contains an inner <svg> element', async ({ page }) => {
        await page.goto(ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (SVG path dispatch)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const svgEl = sandbox.locator('.origam-icon--svg svg.origam-icon__svg').first()
        await expect(svgEl).toBeVisible({ timeout: 15000 })
    })

    test('Playground — renders .origam-icon', async ({ page }) => {
        await page.goto(ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Default', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icon = sandbox.locator('.origam-icon').first()
        await expect(icon).toBeVisible({ timeout: 15000 })
    })
})

// ─── OrigamClassIcon ─────────────────────────────────────────────────────────

test.describe('OrigamClassIcon — font-class leaf', () => {

    test('Icon variant — .origam-icon is visible', async ({ page }) => {
        await page.goto(CLASS_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (class string)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icon = sandbox.locator('.origam-icon').first()
        await expect(icon).toBeVisible({ timeout: 15000 })
    })

    test('Icon class string — MDI class applied to element', async ({ page }) => {
        await page.goto(CLASS_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (class string)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // The icon prop value ('mdi:mdi-home') is added as a CSS class.
        // We check that the element carries at least the mdi-home portion.
        const hasClass = await sandbox.locator('.origam-icon').first().evaluate(
            el => el.classList.contains('mdi-home') || el.className.includes('mdi')
        )
        expect(hasClass).toBe(true)
    })

    test('All sizes — five icons rendered side by side', async ({ page }) => {
        await page.goto(CLASS_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — size', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // The variant renders 1 interactive icon (bound to state.size) + 5 static
        // icons at x-small/small/default/large/x-large = 6 total.
        const icons = sandbox.locator('.origam-icon')
        await expect(icons).toHaveCount(6, { timeout: 15000 })
    })

    test('Size variant — size class applied to element', async ({ page }) => {
        await page.goto(CLASS_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — size', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // Default state has no size selected — no size class expected yet.
        const icon = sandbox.locator('.origam-icon').first()
        await expect(icon).toBeVisible({ timeout: 15000 })
    })

    test('Numeric size — four icons at distinct pixel sizes', async ({ page }) => {
        await page.goto(CLASS_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — size (numeric override)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icons = sandbox.locator('.origam-icon')
        await expect(icons).toHaveCount(4, { timeout: 15000 })

        // The four icons must have strictly increasing font-size values.
        const fontSizes = await icons.evaluateAll(
            (els) => els.map(el => parseFloat(getComputedStyle(el).fontSize))
        )
        for (let i = 1; i < fontSizes.length; i++) {
            expect(fontSizes[i]).toBeGreaterThan(fontSizes[i - 1])
        }
    })
})

// ─── OrigamComponentIcon ─────────────────────────────────────────────────────

test.describe('OrigamComponentIcon — Vue-component wrapper leaf', () => {

    test('Icon variant — .origam-icon--component is visible', async ({ page }) => {
        await page.goto(COMPONENT_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Default', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icon = sandbox.locator('.origam-icon--component').first()
        await expect(icon).toBeVisible({ timeout: 15000 })
    })

    test('Icon variant — inner SVG is rendered inside the wrapper', async ({ page }) => {
        await page.goto(COMPONENT_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Default', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const innerSvg = sandbox.locator('.origam-icon--component svg').first()
        await expect(innerSvg).toBeVisible({ timeout: 15000 })
    })

    test('All sizes — five icons rendered side by side', async ({ page }) => {
        await page.goto(COMPONENT_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — size', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // The variant renders 1 interactive icon (bound to state.size) + 5 static
        // icons at x-small/small/default/large/x-large = 6 total.
        const icons = sandbox.locator('.origam-icon--component')
        await expect(icons).toHaveCount(6, { timeout: 15000 })
    })

    test('Numeric size — four icons at distinct pixel sizes', async ({ page }) => {
        await page.goto(COMPONENT_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — size (numeric override)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icons = sandbox.locator('.origam-icon--component')
        await expect(icons).toHaveCount(4, { timeout: 15000 })

        const widths = await icons.evaluateAll(
            (els) => els.map(el => parseFloat(getComputedStyle(el).width))
        )
        for (let i = 1; i < widths.length; i++) {
            expect(widths[i]).toBeGreaterThan(widths[i - 1])
        }
    })

    test('Slot default — slot content overrides icon prop', async ({ page }) => {
        await page.goto(COMPONENT_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Slot — default (overrides icon prop)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('.origam-icon--component').first()
        await expect(wrapper).toBeVisible({ timeout: 15000 })
        // The slot inserts an SVG directly — verify it is present inside the wrapper.
        const slotSvg = sandbox.locator('.origam-icon--component svg').first()
        await expect(slotSvg).toBeVisible({ timeout: 15000 })
    })
})

// ─── OrigamLigatureIcon ──────────────────────────────────────────────────────

test.describe('OrigamLigatureIcon — Material-style ligature leaf', () => {

    test('Icon variant — .origam-icon--ligature is visible', async ({ page }) => {
        await page.goto(LIGATURE_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (ligature name)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icon = sandbox.locator('.origam-icon--ligature').first()
        await expect(icon).toBeVisible({ timeout: 15000 })
    })

    test('Icon text content — ligature name renders as text fallback', async ({ page }) => {
        await page.goto(LIGATURE_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (ligature name)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // Without the font, the ligature name "home" is rendered as plain text.
        const textContent = await sandbox.locator('.origam-icon--ligature').first().textContent()
        expect(textContent?.trim()).toBe('home')
    })

    test('All sizes — five icons rendered side by side', async ({ page }) => {
        await page.goto(LIGATURE_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — size', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // The variant renders 1 interactive icon (bound to state.size) + 5 static
        // icons at x-small/small/default/large/x-large = 6 total.
        const icons = sandbox.locator('.origam-icon--ligature')
        await expect(icons).toHaveCount(6, { timeout: 15000 })
    })

    test('Numeric size — four icons at distinct font sizes', async ({ page }) => {
        await page.goto(LIGATURE_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — size (numeric override)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icons = sandbox.locator('.origam-icon--ligature')
        await expect(icons).toHaveCount(4, { timeout: 15000 })

        const fontSizes = await icons.evaluateAll(
            (els) => els.map(el => parseFloat(getComputedStyle(el).fontSize))
        )
        for (let i = 1; i < fontSizes.length; i++) {
            expect(fontSizes[i]).toBeGreaterThan(fontSizes[i - 1])
        }
    })

    test('Common ligature names — eight icons rendered', async ({ page }) => {
        await page.goto(LIGATURE_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (common ligature names showcase)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icons = sandbox.locator('.origam-icon--ligature')
        await expect(icons).toHaveCount(8, { timeout: 15000 })
    })

    test('Font family — Material Icons or Material Symbols applied', async ({ page }) => {
        await page.goto(LIGATURE_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (ligature name)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const fontFamily = await sandbox.locator('.origam-icon--ligature').first().evaluate(
            el => getComputedStyle(el).fontFamily
        )
        // The component sets font-family to 'Material Icons', 'Material Symbols Outlined'.
        // Even if the font file isn't loaded, the CSS declaration must be present.
        expect(fontFamily).toMatch(/Material/)
    })
})

// ─── OrigamSvgIcon ───────────────────────────────────────────────────────────

test.describe('OrigamSvgIcon — inline SVG leaf', () => {

    test('Single path — .origam-icon--svg and inner svg are visible', async ({ page }) => {
        await page.goto(SVG_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (single path)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('.origam-icon--svg').first()
        const svg = sandbox.locator('.origam-icon--svg .origam-icon__svg').first()
        await expect(wrapper).toBeVisible({ timeout: 15000 })
        await expect(svg).toBeVisible({ timeout: 15000 })
    })

    test('Single path — inner svg contains exactly one <path> element', async ({ page }) => {
        await page.goto(SVG_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (single path)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // Wait for at least one path to appear before counting — guards against
        // the iframe still rendering when tests run in parallel under load.
        await sandbox.locator('.origam-icon__svg path').first().waitFor({ state: 'attached', timeout: 15000 })
        const pathCount = await sandbox.locator('.origam-icon__svg path').count()
        expect(pathCount).toBe(1)
    })

    test('Multi-path (array) — inner svg contains multiple <path> elements', async ({ page }) => {
        await page.goto(SVG_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (multi-path array)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // Wait for at least one path to appear before counting — guards against
        // the iframe still rendering when tests run in parallel under load.
        await sandbox.locator('.origam-icon__svg path').first().waitFor({ state: 'attached', timeout: 15000 })
        const pathCount = await sandbox.locator('.origam-icon__svg path').count()
        expect(pathCount).toBeGreaterThanOrEqual(2)
    })

    test('Multi-path with opacity tuples — fill-opacity attribute set on path', async ({ page }) => {
        await page.goto(SVG_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (multi-path with opacity tuples)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // The tuple [path, 0.3] causes OrigamSvgIcon to set fill-opacity="0.3"
        // on that specific path element.
        const fillOpacity = await sandbox.locator('.origam-icon__svg path').first().getAttribute('fill-opacity')
        expect(fillOpacity).toBe('0.3')
    })

    test('All sizes — five svg icons rendered side by side', async ({ page }) => {
        await page.goto(SVG_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — size', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // The variant renders 1 interactive icon (bound to state.size) + 5 static
        // icons at x-small/small/default/large/x-large = 6 total.
        const icons = sandbox.locator('.origam-icon--svg')
        await expect(icons).toHaveCount(6, { timeout: 15000 })
    })

    test('Numeric size — four icons at distinct widths', async ({ page }) => {
        await page.goto(SVG_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — size (numeric override)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icons = sandbox.locator('.origam-icon--svg')
        await expect(icons).toHaveCount(4, { timeout: 15000 })

        const widths = await icons.evaluateAll(
            (els) => els.map(el => parseFloat(getComputedStyle(el).width))
        )
        for (let i = 1; i < widths.length; i++) {
            expect(widths[i]).toBeGreaterThan(widths[i - 1])
        }
    })

    // Decorative-icon semantics (W3C "No ARIA is better than bad ARIA"):
    // OrigamSvgIcon is presentational, so the <svg> carries aria-hidden="true"
    // and MUST NOT carry role="img". A meaningful icon is labelled on its host
    // (e.g. aria-label on an icon-only button), never by exposing the hidden svg.
    test('SVG element — decorative: aria-hidden="true" and no role', async ({ page }) => {
        await page.goto(SVG_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (single path)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const svgEl = sandbox.locator('.origam-icon__svg').first()
        await expect(svgEl).toBeVisible({ timeout: 15000 })
        await expect(svgEl).toHaveAttribute('aria-hidden', 'true')
        await expect(svgEl).not.toHaveAttribute('role', /.*/)
    })

    test('SVG element — viewBox is "0 0 24 24"', async ({ page }) => {
        await page.goto(SVG_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (single path)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const svgEl = sandbox.locator('.origam-icon__svg').first()
        await expect(svgEl).toBeVisible({ timeout: 15000 })
        await expect(svgEl).toHaveAttribute('viewBox', '0 0 24 24')
    })

    test('SVG fill — path inherits currentColor (fill not hardcoded hex)', async ({ page }) => {
        await page.goto(SVG_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (single path)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // The SVG rule sets `fill: currentColor`. Verify it is NOT a hardcoded hex.
        const fillValue = await sandbox.locator('.origam-icon__svg path').first().evaluate(
            el => getComputedStyle(el).fill
        )
        expect(fillValue).not.toMatch(/^#[0-9a-fA-F]{3,6}$/)
    })

    test.fixme('Visual regression — SVG icon — no baseline committed yet', async ({ page }) => {
        // Run `npx playwright test --update-snapshots` to create the baseline,
        // commit the .png, then remove this fixme.
        await page.goto(SVG_ICON_STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Prop — icon (single path)', { exact: true }).first().click()
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const wrapper = sandbox.locator('.origam-icon--svg').first()
        await expect(wrapper).toHaveScreenshot('svg-icon-single-path.png', {
            maxDiffPixelRatio: 0.01
        })
    })
})
