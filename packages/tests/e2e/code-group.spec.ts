import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { FrameLocator, Page } from '@playwright/test'

/**
 * OrigamCodeGroup — tabs, shared copy, distinct scroller names, one surface
 *
 * ## Navigation
 *   Direct navigation with `variantId` (never networkidle: Histoire keeps an
 *   HMR socket open).
 *
 *   const STORY_ID = 'components-stories-codegroup-origamcodegroup-story-vue'
 *
 * ## Variants (0-based, as declared in OrigamCodeGroup.story.vue)
 *   0 → Design
 *   1 → Functional
 *   2 → Functional - Slot form (origam-code children)
 *   3 → Functional - Several groups (labels keep the names distinct)
 *   4 → Events - copy
 *   5 → Events - update:modelValue
 *   6 → Slots - Default
 *   7 → Slots - Copy
 *   8 → Default
 *
 * ## Measurement notes
 *   Mutation and measurement never share a turn with a Vue-bound class here:
 *   the spec only CLICKS (real events) and then reads. `getComputedStyle` runs
 *   in a real browser, so `var()`-driven values resolve.
 */

const STORY_ID = 'components-stories-codegroup-origamcodegroup-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

const IGNORED_RULES = new Set<string>([
    'frame-title',
    'region',
    'page-has-heading-one',
    'landmark-one-main',
    'document-title',
    'html-has-lang',
    'html-lang-valid',
    'aria-tooltip-name'
])

async function open (page: Page, idx: number): Promise<FrameLocator> {
    await page.goto(variantUrl(idx), { waitUntil: 'domcontentloaded' })
    const frame = page.frameLocator('iframe[src*="__sandbox"]')
    await expect(frame.locator('.origam-code-group').first()).toBeVisible({ timeout: 30000 })
    return frame
}

test.describe('OrigamCodeGroup', () => {
    test.setTimeout(90000)

    test('switching tabs shows the matching panel and hides the others', async ({ page }) => {
        const frame = await open(page, 1)
        const group = frame.locator('[data-cy="code-group-functional"]')

        const tabs = group.locator('[role="tab"]')
        await expect(tabs).toHaveCount(3)

        await tabs.nth(0).click()
        await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')
        await expect(group.locator('[role="tabpanel"]:visible')).toHaveCount(1)
        await expect(group.locator('[role="tabpanel"]:visible')).toContainText('npm install origam')

        await tabs.nth(2).click()
        await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true')
        await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'false')
        await expect(group.locator('[role="tabpanel"]:visible')).toHaveCount(1)
        await expect(group.locator('[role="tabpanel"]:visible')).toContainText('yarn add origam')
    })

    test('the shared copy button copies the code of the ACTIVE tab', async ({ page }) => {
        const frame = await open(page, 0)
        const group = frame.locator('[data-cy="code-group-design"]')

        await frame.locator('body').evaluate(() => {
            (window as unknown as { __copied: string[] }).__copied = []
            Object.defineProperty(navigator, 'clipboard', {
                configurable: true,
                value: { writeText: (text: string) => { (window as unknown as { __copied: string[] }).__copied.push(text); return Promise.resolve() } }
            })
        })

        await expect(group.locator('[data-cy="origam-code-group-copy"]')).toHaveCount(1)

        await group.locator('[data-cy="origam-code-group-copy"]').click()
        await group.locator('[role="tab"]').nth(1).click()
        await expect(group.locator('[role="tab"]').nth(1)).toHaveAttribute('aria-selected', 'true')
        await group.locator('[data-cy="origam-code-group-copy"]').click()
        await group.locator('[role="tab"]').nth(2).click()
        await expect(group.locator('[role="tab"]').nth(2)).toHaveAttribute('aria-selected', 'true')
        await group.locator('[data-cy="origam-code-group-copy"]').click()

        const copied = await frame.locator('body').evaluate(() => (window as unknown as { __copied: string[] }).__copied)
        expect(copied).toEqual(['npm install origam', 'pnpm add origam', 'yarn add origam'])
    })

    test('every panel scroller has a distinct accessible name', async ({ page }) => {
        const frame = await open(page, 1)
        const group = frame.locator('[data-cy="code-group-functional"]')

        const names: string[] = []
        for (let i = 0; i < 3; i++) {
            await group.locator('[role="tab"]').nth(i).click()
            await expect(group.locator('[role="tab"]').nth(i)).toHaveAttribute('aria-selected', 'true')
            const name = await group.locator('.origam-code__scroller:visible').getAttribute('aria-label')
            names.push(String(name))
        }

        expect(new Set(names).size).toBe(3)
        expect(names[0]).toBe('Package manager, npm, code block 1 of 3, scrollable region')
        expect(names[2]).toBe('Package manager, yarn, code block 3 of 3, scrollable region')
    })

    test('the group reads as ONE surface: one border, no repeated header', async ({ page }) => {
        const frame = await open(page, 0)
        const group = frame.locator('[data-cy="code-group-design"]')

        const measure = await group.evaluate((root) => {
            const width = (el: Element) => parseFloat(getComputedStyle(el).borderTopWidth)
            const codes = Array.from(root.querySelectorAll('.origam-code'))
            return {
                groupBorder: width(root),
                groupRadius: parseFloat(getComputedStyle(root).borderTopLeftRadius),
                headers: root.querySelectorAll('.origam-code__header').length,
                codeCount: codes.length,
                codeBorders: codes.map((code) => width(code)),
                codeRadii: codes.map((code) => parseFloat(getComputedStyle(code).borderTopLeftRadius)),
                codeShadows: codes.map((code) => getComputedStyle(code).boxShadow),
                codeMargins: codes.map((code) => parseFloat(getComputedStyle(code).marginTop))
            }
        })

        expect(measure.groupBorder).toBeGreaterThan(0)
        expect(measure.groupRadius).toBeGreaterThan(0)
        expect(measure.headers).toBe(0)
        expect(measure.codeCount).toBeGreaterThan(0)
        expect(measure.codeBorders.every((value) => value === 0)).toBe(true)
        expect(measure.codeRadii.every((value) => value === 0)).toBe(true)
        expect(measure.codeShadows.every((value) => value === 'none')).toBe(true)
        expect(measure.codeMargins.every((value) => value === 0)).toBe(true)
    })

    test('slot form: tab labels come from label / filename and only the active child is mounted', async ({ page }) => {
        const frame = await open(page, 2)
        const group = frame.locator('[data-cy="code-group-slot-form"]')

        await expect(group.locator('[role="tab"]')).toHaveText(['npm', 'pnpm', 'yarn'])
        await expect(group.locator('.origam-code')).toHaveCount(1)
        await expect(group.locator('.origam-code[label]')).toHaveCount(0)
    })

    test('v-model: starts on the pinned tab (pnpm) and follows a tab click', async ({ page }) => {
        const frame = await open(page, 1)
        const group = frame.locator('[data-cy="code-group-functional"]')

        await expect(group.locator('[role="tab"]').nth(1)).toHaveAttribute('aria-selected', 'true')
        await group.locator('[role="tab"]').nth(0).click()
        await expect(group.locator('[role="tab"]').nth(0)).toHaveAttribute('aria-selected', 'true')
    })

    test('a custom copy slot replaces the default button', async ({ page }) => {
        const frame = await open(page, 7)

        await expect(frame.locator('[data-cy="code-group-custom-copy"]')).toHaveCount(1)
        await expect(frame.locator('[data-cy="origam-code-group-copy"]')).toHaveCount(0)
    })

    test.describe('axe — landmark-unique', () => {
        const run = async (page: Page) => {
            const results = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
                .analyze()
            return results.violations.filter((violation) => !IGNORED_RULES.has(violation.id))
        }

        test('positive control — axe reports landmark-unique on two same-named regions', async ({ page }) => {
            const frame = await open(page, 0)

            await frame.locator('body').evaluate((body) => {
                for (let i = 0; i < 2; i++) {
                    const region = document.createElement('section')
                    region.setAttribute('aria-label', 'bash code block, scrollable region')
                    region.textContent = 'x'
                    body.appendChild(region)
                }
            })

            const violations = await run(page)
            expect(violations.map((violation) => violation.id)).toContain('landmark-unique')
        })

        test('two labelled groups on one page raise no landmark-unique', async ({ page }) => {
            const frame = await open(page, 3)

            const activeScrollers = frame.locator('.origam-tab-panel--active .origam-code__scroller')
            await expect(activeScrollers).toHaveCount(2)
            const names = await activeScrollers.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label')))
            expect(names).toHaveLength(2)
            expect(new Set(names).size).toBe(2)

            const violations = await run(page)
            const ours = violations
                .filter((violation) => violation.id === 'landmark-unique')
                .filter((violation) => violation.nodes.some((node) => node.target.some((target) => String(target).includes('origam-'))))
            expect(ours).toEqual([])
        })
    })
})
