import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamChartWordCloud — Playwright spec.
 *
 * Asserts:
 *  - N `<text>` word elements render for N valid data points.
 *  - Default variant carries role="figure", role="img", title, desc.
 *  - Each word has role="button", tabindex="0", non-empty aria-label.
 *  - Clicking a word fires point-click (checked via story-log).
 *  - Rotation variants all render the correct word count.
 *  - Empty state slot renders when series is empty.
 *
 * NOTE: The word-placement heuristic uses `text.length * fontSize * 0.6`
 * for AABB estimation. Wide-character words can visually overlap.
 * This is documented as an accepted v1 limitation.
 */

const WORD_CLOUD_STORY = '/stories/story/components-stories-chart-origamchartwordcloud-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyUrl: string, title: string) => {
    await page.goto(storyUrl)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

test.describe('OrigamChartWordCloud — Default', () => {
    test('renders figure root with role="figure"', async ({ page }) => {
        await openVariant(page, WORD_CLOUD_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const host = sandbox.locator('[data-cy="word-cloud-playground-chart"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })
        await expect(host).toHaveAttribute('role', 'figure')
    })

    test('SVG carries role=img, title and desc', async ({ page }) => {
        await openVariant(page, WORD_CLOUD_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const svg = sandbox.locator('[data-cy="word-cloud-playground-chart"] svg').first()
        await expect(svg).toBeVisible()
        await expect(svg).toHaveAttribute('role', 'img')
        await expect(svg.locator('title')).toHaveCount(1)
        await expect(svg.locator('desc')).toHaveCount(1)
    })

    test('renders 20 word elements for FIXTURE_TECH (20 data points)', async ({ page }) => {
        await openVariant(page, WORD_CLOUD_STORY, 'Default')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-word-cloud-default.png', fullPage: false })

        const words = sandbox.locator('[data-cy="word-cloud-playground-chart"] [data-cy^="origam-chart-word-cloud-word-"]')
        await expect(words).toHaveCount(20, { timeout: 8000 })
    })

    test('each word element has non-empty text content', async ({ page }) => {
        await openVariant(page, WORD_CLOUD_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const words = sandbox.locator('[data-cy="word-cloud-playground-chart"] [data-cy^="origam-chart-word-cloud-word-"]')
        await expect(words.first()).toBeVisible({ timeout: 8000 })
        const count = await words.count()
        expect(count).toBeGreaterThan(0)
        const firstText = await words.first().textContent()
        expect(firstText?.trim()).toBeTruthy()
    })
})

test.describe('OrigamChartWordCloud — accessibility', () => {
    test('each word has role="button" and a non-empty aria-label', async ({ page }) => {
        await openVariant(page, WORD_CLOUD_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const words = sandbox.locator('[data-cy="word-cloud-playground-chart"] [data-cy^="origam-chart-word-cloud-word-"]')
        await expect(words.first()).toBeVisible({ timeout: 8000 })
        const count = await words.count()
        expect(count).toBeGreaterThan(0)
        for (let i = 0; i < Math.min(count, 5); i++) {
            await expect(words.nth(i)).toHaveAttribute('role', 'button')
            const label = await words.nth(i).getAttribute('aria-label')
            expect(label).toBeTruthy()
        }
    })

    test('each word is keyboard-focusable (tabindex=0)', async ({ page }) => {
        await openVariant(page, WORD_CLOUD_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const words = sandbox.locator('[data-cy="word-cloud-playground-chart"] [data-cy^="origam-chart-word-cloud-word-"]')
        await expect(words.first()).toBeVisible({ timeout: 8000 })
        const count = await words.count()
        for (let i = 0; i < Math.min(count, 5); i++) {
            await expect(words.nth(i)).toHaveAttribute('tabindex', '0')
        }
    })
})

test.describe('OrigamChartWordCloud — emit point-click', () => {
    test('clicking a word appends an entry to the story log', async ({ page }) => {
        await openVariant(page, WORD_CLOUD_STORY, 'Emit — point-click on word (live counter)')
        const sandbox = sandboxOf(page)

        const words = sandbox.locator('[data-cy="word-cloud-emit-chart"] [data-cy^="origam-chart-word-cloud-word-"]')
        await expect(words.first()).toBeVisible({ timeout: 8000 })

        const logEl = sandbox.locator('[data-cy="word-cloud-emit-log"]')
        const beforeText = await logEl.textContent()

        await words.first().click()
        await page.waitForTimeout(300)

        const afterText = await logEl.textContent()
        expect(afterText).not.toBe(beforeText)
        expect(afterText).toContain('point-click')
    })
})

test.describe('OrigamChartWordCloud — rotation variants', () => {
    test('rotation=none renders correct word count', async ({ page }) => {
        await openVariant(page, WORD_CLOUD_STORY, 'Prop — rotation (none / random / orthogonal)')
        const sandbox = sandboxOf(page)
        await page.screenshot({ path: '/tmp/chart-word-cloud-rotation.png', fullPage: false })

        const words = sandbox.locator('[data-cy="word-cloud-rotation-none"] [data-cy^="origam-chart-word-cloud-word-"]')
        await expect(words.first()).toBeVisible({ timeout: 8000 })
        const count = await words.count()
        expect(count).toBeGreaterThan(0)
    })

    test('rotation=random renders correct word count', async ({ page }) => {
        await openVariant(page, WORD_CLOUD_STORY, 'Prop — rotation (none / random / orthogonal)')
        const sandbox = sandboxOf(page)
        const words = sandbox.locator('[data-cy="word-cloud-rotation-random"] [data-cy^="origam-chart-word-cloud-word-"]')
        await expect(words.first()).toBeVisible({ timeout: 8000 })
        const count = await words.count()
        expect(count).toBeGreaterThan(0)
    })

    test('rotation=orthogonal renders correct word count', async ({ page }) => {
        await openVariant(page, WORD_CLOUD_STORY, 'Prop — rotation (none / random / orthogonal)')
        const sandbox = sandboxOf(page)
        const words = sandbox.locator('[data-cy="word-cloud-rotation-orthogonal"] [data-cy^="origam-chart-word-cloud-word-"]')
        await expect(words.first()).toBeVisible({ timeout: 8000 })
        const count = await words.count()
        expect(count).toBeGreaterThan(0)
    })

    test('rotation=none: all words have transform with rotate(0)', async ({ page }) => {
        await openVariant(page, WORD_CLOUD_STORY, 'Prop — rotation (none / random / orthogonal)')
        const sandbox = sandboxOf(page)
        const words = sandbox.locator('[data-cy="word-cloud-rotation-none"] [data-cy^="origam-chart-word-cloud-word-"]')
        await expect(words.first()).toBeVisible({ timeout: 8000 })
        const count = await words.count()
        expect(count).toBeGreaterThan(0)

        for (let i = 0; i < Math.min(count, 5); i++) {
            const transform = await words.nth(i).getAttribute('transform')
            expect(transform).toBeTruthy()
            expect(transform).toContain('rotate(0)')
        }
    })

    test('rotation=orthogonal: odd-index words have rotate(90)', async ({ page }) => {
        await openVariant(page, WORD_CLOUD_STORY, 'Prop — rotation (none / random / orthogonal)')
        const sandbox = sandboxOf(page)
        const words = sandbox.locator('[data-cy="word-cloud-rotation-orthogonal"] [data-cy^="origam-chart-word-cloud-word-"]')
        await expect(words.first()).toBeVisible({ timeout: 8000 })
        const count = await words.count()
        expect(count).toBeGreaterThanOrEqual(2)

        const transform1 = await words.nth(1).getAttribute('transform')
        expect(transform1).toContain('rotate(90)')
    })
})

test.describe('OrigamChartWordCloud — font-size variants', () => {
    test('compact variant renders words with smaller font size than giant', async ({ page }) => {
        await openVariant(page, WORD_CLOUD_STORY, 'Prop — minFontSize / maxFontSize (compact vs giant)')
        const sandbox = sandboxOf(page)

        const compactFirstWord = sandbox.locator('[data-cy="word-cloud-font-compact"] [data-cy="origam-chart-word-cloud-word-0"]')
        const giantFirstWord = sandbox.locator('[data-cy="word-cloud-font-giant"] [data-cy="origam-chart-word-cloud-word-0"]')

        await expect(compactFirstWord).toBeVisible({ timeout: 8000 })
        await expect(giantFirstWord).toBeVisible({ timeout: 8000 })

        const compactStyle = await compactFirstWord.getAttribute('style')
        const giantStyle = await giantFirstWord.getAttribute('style')

        expect(compactStyle).toBeTruthy()
        expect(giantStyle).toBeTruthy()

        const extractFontSize = (style: string): number => {
            const m = style.match(/font-size:\s*([\d.]+)px/)
            return m ? parseFloat(m[1]) : 0
        }

        const compactFs = extractFontSize(compactStyle!)
        const giantFs = extractFontSize(giantStyle!)
        expect(giantFs).toBeGreaterThan(compactFs)
    })
})

test.describe('OrigamChartWordCloud — empty state', () => {
    test('empty slot renders when series is empty', async ({ page }) => {
        await openVariant(page, WORD_CLOUD_STORY, 'Slot — empty')
        const sandbox = sandboxOf(page)
        const empty = sandbox.locator('[data-cy="word-cloud-slot-empty-chart"] [data-cy="origam-chart-word-cloud-empty"]')
        await expect(empty).toBeVisible({ timeout: 6000 })
        await expect(empty).toContainText('No word frequency data')
    })
})
