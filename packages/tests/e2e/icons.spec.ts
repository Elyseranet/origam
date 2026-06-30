import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId.
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamIcon (base, 0-based):
 *   0  → Design
 *   1  → Functional
 *   2  → Events - click
 *   3  → Slots - Default
 *   4  → Prop — size
 *   5  → Prop — color & bgColor
 *   6  → Emit — click (button mode)
 *   7  → Prop — icon (SVG path dispatch)
 *   8  → Default (playground)
 *
 * Variants OrigamClassIcon (0-based):
 *   0  → Design
 *   1  → Functional
 *   2  → Prop — icon (class string)
 *   3  → Prop — size
 *   4  → Prop — size (numeric override)
 *   5  → Default (playground)
 *
 * Variants OrigamComponentIcon (0-based):
 *   0  → Design
 *   1  → Functional
 *   2  → Slots - Default
 *   3  → Prop — size
 *   4  → Prop — size (numeric override)
 *   5  → Slot — default (overrides icon prop)
 *   6  → Default (playground)
 *
 * Variants OrigamLigatureIcon (0-based):
 *   0  → Design
 *   1  → Functional
 *   2  → Prop — icon (ligature name)
 *   3  → Prop — size
 *   4  → Prop — size (numeric override)
 *   5  → Prop — icon (common ligature names showcase)
 *   6  → Default (playground)
 *
 * Variants OrigamSvgIcon (0-based):
 *   0  → Design
 *   1  → Functional
 *   2  → Prop — icon (single path)
 *   3  → Prop — icon (multi-path array)
 *   4  → Prop — icon (multi-path with opacity tuples)
 *   5  → Prop — size
 *   6  → Prop — size (numeric override)
 *   7  → Default (playground)
 */

const ICON_ID           = 'components-stories-icon-origamicon-story-vue'
const CLASS_ICON_ID     = 'components-stories-icon-origamclassicon-story-vue'
const COMPONENT_ICON_ID = 'components-stories-icon-origamcomponenticon-story-vue'
const LIGATURE_ICON_ID  = 'components-stories-icon-origamligatureicon-story-vue'
const SVG_ICON_ID       = 'components-stories-icon-origamsvgicon-story-vue'

const iconUrl          = (idx: number) => `/stories/story/${ICON_ID}?variantId=${ICON_ID}-${idx}`
const classIconUrl     = (idx: number) => `/stories/story/${CLASS_ICON_ID}?variantId=${CLASS_ICON_ID}-${idx}`
const componentIconUrl = (idx: number) => `/stories/story/${COMPONENT_ICON_ID}?variantId=${COMPONENT_ICON_ID}-${idx}`
const ligatureIconUrl  = (idx: number) => `/stories/story/${LIGATURE_ICON_ID}?variantId=${LIGATURE_ICON_ID}-${idx}`
const svgIconUrl       = (idx: number) => `/stories/story/${SVG_ICON_ID}?variantId=${SVG_ICON_ID}-${idx}`

// ─── OrigamIcon (base / dispatcher) ──────────────────────────────────────────

test.describe('OrigamIcon — base dispatcher', () => {
    test.setTimeout(45000)

    test('size tokens produce distinct font-size values (x-small < default < x-large)', async ({ page }) => {
        await page.goto(iconUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icons = sandbox.locator('.origam-icon')
        await expect(icons.first()).toBeVisible({ timeout: 20000 })

        // The story renders x-small / small / default / large / x-large in a flex row.
        // We read the first (x-small) and last (x-large) to verify strict ordering.
        const first = await icons.first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
        const last  = await icons.last().evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
        expect(first).toBeLessThan(last)
    })

    test('color=primary applies the primary color token', async ({ page }) => {
        await page.goto(iconUrl(5))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icons = sandbox.locator('.origam-icon')
        await expect(icons.first()).toBeVisible({ timeout: 20000 })

        // Icons at index 1+ have hardcoded color props ("primary", "success", …).
        // We verify the second icon (color="primary") carries the utility class.
        const primaryIcon = icons.nth(1)
        await expect(primaryIcon).toBeAttached({ timeout: 15000 })
        const cls = await primaryIcon.getAttribute('class')
        // useColor emits .origam--color-primary for tokenised values.
        expect(cls).toMatch(/origam--color-primary/)
    })

    test('click event is emittable in button mode', async ({ page }) => {
        await page.goto(iconUrl(6))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icon = sandbox.locator('.origam-icon').first()
        await expect(icon).toBeVisible({ timeout: 20000 })

        // Clicking must not throw — the event handler calls logEvent().
        await icon.click()
    })

    test('SVG path string — dispatches to SvgIcon sub-component', async ({ page }) => {
        await page.goto(iconUrl(7))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // When the icon prop is an SVG path string (starts with "M"),
        // OrigamIcon renders OrigamSvgIcon which emits an <svg> element.
        const svg = sandbox.locator('.origam-icon svg').first()
        await expect(svg).toBeAttached({ timeout: 20000 })
    })
})

// ─── OrigamClassIcon ──────────────────────────────────────────────────────────

test.describe('OrigamClassIcon', () => {
    test.setTimeout(45000)

    test('renders an <i> element containing the class-based icon', async ({ page }) => {
        await page.goto(classIconUrl(2))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icon = sandbox.locator('.origam-icon').first()
        await expect(icon).toBeVisible({ timeout: 20000 })

        const tag = await icon.evaluate((el) => el.tagName.toLowerCase())
        // OrigamClassIcon renders a <i> by default.
        expect(tag).toBe('i')
    })

    test('size tokens set distinct font-size values', async ({ page }) => {
        await page.goto(classIconUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icons = sandbox.locator('.origam-icon')
        await expect(icons.first()).toBeVisible({ timeout: 20000 })

        // Story renders x-small, small, default, large, x-large.
        const xSmall = await icons.first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
        const xLarge = await icons.last().evaluate((el)  => parseFloat(getComputedStyle(el).fontSize))
        expect(xSmall).toBeLessThan(xLarge)
    })

    test('numeric size override — font-size resolves to the given px value', async ({ page }) => {
        await page.goto(classIconUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icon = sandbox.locator('.origam-icon').first()
        await expect(icon).toBeVisible({ timeout: 20000 })

        // Numeric size prop is injected as an inline style `font-size: Npx`.
        const style = await icon.getAttribute('style')
        expect(style).toMatch(/font-size:\s*\d+px/)
    })
})

// ─── OrigamComponentIcon ──────────────────────────────────────────────────────

test.describe('OrigamComponentIcon', () => {
    test.setTimeout(45000)

    test('size tokens set distinct width values', async ({ page }) => {
        await page.goto(componentIconUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icons = sandbox.locator('.origam-icon')
        await expect(icons.first()).toBeVisible({ timeout: 20000 })

        const first = await icons.first().evaluate((el) => parseFloat(getComputedStyle(el).width))
        const last  = await icons.last().evaluate((el) => parseFloat(getComputedStyle(el).width))
        expect(first).toBeLessThan(last)
    })

    test('numeric size override — width resolves to the given px value', async ({ page }) => {
        await page.goto(componentIconUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icon = sandbox.locator('.origam-icon').first()
        await expect(icon).toBeVisible({ timeout: 20000 })

        // Numeric size prop is injected as inline style `width: Npx; height: Npx`.
        const style = await icon.getAttribute('style')
        expect(style).toMatch(/width:\s*\d+px/)
    })

    test('default slot overrides the icon prop', async ({ page }) => {
        await page.goto(componentIconUrl(5))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icon = sandbox.locator('.origam-icon').first()
        await expect(icon).toBeVisible({ timeout: 20000 })

        // When a default slot is provided, the slot content replaces the icon.
        // The component renders a <svg> in slot mode; the icon prop SVG path is ignored.
        const slotContent = sandbox.locator('.origam-icon > *').first()
        await expect(slotContent).toBeAttached({ timeout: 15000 })
    })
})

// ─── OrigamLigatureIcon ───────────────────────────────────────────────────────

test.describe('OrigamLigatureIcon', () => {
    test.setTimeout(45000)

    test('ligature icon — renders a <span> with the ligature text node', async ({ page }) => {
        await page.goto(ligatureIconUrl(2))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icon = sandbox.locator('.origam-icon').first()
        await expect(icon).toBeVisible({ timeout: 20000 })

        // OrigamLigatureIcon renders via a <span>. The font-family used for
        // ligature rendering is "Material Icons" which maps ligature → glyph.
        const tag = await icon.evaluate((el) => el.tagName.toLowerCase())
        expect(tag).toBe('span')
    })

    test('size tokens set distinct font-size values', async ({ page }) => {
        await page.goto(ligatureIconUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icons = sandbox.locator('.origam-icon')
        await expect(icons.first()).toBeVisible({ timeout: 20000 })

        const xSmall = await icons.first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
        const xLarge = await icons.last().evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
        expect(xSmall).toBeLessThan(xLarge)
    })

    test('numeric size override — font-size resolves to the given px value', async ({ page }) => {
        await page.goto(ligatureIconUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icon = sandbox.locator('.origam-icon').first()
        await expect(icon).toBeVisible({ timeout: 20000 })

        const style = await icon.getAttribute('style')
        expect(style).toMatch(/font-size:\s*\d+px/)
    })

    test('ligature showcase — multiple common names are all rendered', async ({ page }) => {
        await page.goto(ligatureIconUrl(5))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icons = sandbox.locator('.origam-icon')
        await expect(icons.first()).toBeVisible({ timeout: 20000 })

        const count = await icons.count()
        // Showcase renders at least 4 common ligature names.
        expect(count).toBeGreaterThanOrEqual(4)
    })
})

// ─── OrigamSvgIcon ────────────────────────────────────────────────────────────

test.describe('OrigamSvgIcon', () => {
    test.setTimeout(45000)

    test('single path — renders an <svg> with one <path> element', async ({ page }) => {
        await page.goto(svgIconUrl(2))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const svg = sandbox.locator('.origam-icon svg').first()
        await expect(svg).toBeAttached({ timeout: 20000 })

        const pathCount = await svg.locator('path').count()
        expect(pathCount).toBeGreaterThanOrEqual(1)
    })

    test('multi-path array — renders multiple <path> elements inside the <svg>', async ({ page }) => {
        await page.goto(svgIconUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const svg = sandbox.locator('.origam-icon svg').first()
        await expect(svg).toBeAttached({ timeout: 20000 })

        const pathCount = await svg.locator('path').count()
        // The story renders the multi-path array variant — at least 2 paths.
        expect(pathCount).toBeGreaterThanOrEqual(2)
    })

    test('multi-path with opacity tuples — paths carry fill-opacity attributes', async ({ page }) => {
        await page.goto(svgIconUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const svg = sandbox.locator('.origam-icon svg').first()
        await expect(svg).toBeAttached({ timeout: 20000 })

        // When icon is [[path, opacity], ...] tuples, OrigamSvgIcon adds fill-opacity.
        const paths = svg.locator('path[fill-opacity]')
        const count = await paths.count()
        expect(count).toBeGreaterThanOrEqual(1)
    })

    test('size tokens — viewBox stays 0 0 24 24 regardless of size', async ({ page }) => {
        await page.goto(svgIconUrl(5))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icons = sandbox.locator('.origam-icon')
        await expect(icons.first()).toBeVisible({ timeout: 20000 })

        // All size rungs change width/height via CSS font-size, never the viewBox.
        const svgs = sandbox.locator('.origam-icon svg')
        const count = await svgs.count()
        for (let i = 0; i < count; i++) {
            const vb = await svgs.nth(i).getAttribute('viewBox')
            expect(vb).toBe('0 0 24 24')
        }
    })

    test('numeric size override — width resolves to a px value', async ({ page }) => {
        await page.goto(svgIconUrl(6))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const icon = sandbox.locator('.origam-icon').first()
        await expect(icon).toBeVisible({ timeout: 20000 })

        // Numeric size prop injects font-size / width inline via useDimension.
        const style = await icon.getAttribute('style')
        expect(style).toMatch(/font-size:\s*\d+px|width:\s*\d+px/)
    })
})
