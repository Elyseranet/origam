import { expect, test } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * #1307 — at rest, `<OrigamAlert>` must carry neither `--hover` nor `--active`
 * and paint its intent's `bg` token as-is. Pre-fix `hover` defaulted to `true`
 * (forced) and `modelValue` (visibility) fed the "active" state, so the fill
 * was darkened by `bgHover` / `bgActive` without any interaction.
 */
const STORY = '/stories/story/components-stories-alert-origamalert-story-vue'

test.describe('OrigamAlert — resting state (#1307)', () => {
    test('status="error": no hover/active class, background = danger bg token; hover still engages on mouseenter', async ({ page }) => {
        await page.goto(STORY)
        await page.waitForLoadState('networkidle')
        await page.getByText('Design', { exact: true }).first().click()
        await page.waitForTimeout(800)
        await selectHstOption(page, 'Status', 'Error')
        await page.waitForTimeout(500)

        const alert = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-alert').first()
        await expect(alert).toBeVisible({ timeout: 8000 })

        await expect(alert).not.toHaveClass(/origam-alert--hover/)
        await expect(alert).not.toHaveClass(/origam-alert--active/)

        const read = () => alert.evaluate((el) => {
            const probe = document.createElement('div')
            probe.style.backgroundColor = 'var(--origam-color__feedback--danger---bg)'
            el.parentElement!.appendChild(probe)
            const expected = getComputedStyle(probe).backgroundColor
            probe.remove()
            return { actual: getComputedStyle(el).backgroundColor, expected }
        })

        await page.mouse.move(0, 0)
        await page.waitForTimeout(500)
        const rest = await read()
        expect(rest.expected).not.toBe('rgba(0, 0, 0, 0)')
        expect(rest.actual).toBe(rest.expected)

        await alert.hover()
        await expect(alert).toHaveClass(/origam-alert--hover/)
    })

    test('badge (same pattern): visibility is not a pressed state — pill paints its intent bg token at rest', async ({ page }) => {
        await page.goto('/stories/story/components-stories-badge-origambadge-story-vue')
        await page.waitForLoadState('networkidle')
        await page.getByText('Design', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const pill = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-badge__badge').first()
        await expect(pill).toBeVisible({ timeout: 8000 })

        const { actual, expected } = await pill.evaluate((el) => {
            const probe = document.createElement('div')
            probe.style.backgroundColor = 'var(--origam-color__action--primary---bg)'
            el.parentElement!.appendChild(probe)
            const expected = getComputedStyle(probe).backgroundColor
            probe.remove()
            return { actual: getComputedStyle(el).backgroundColor, expected }
        })
        expect(expected).not.toBe('rgba(0, 0, 0, 0)')
        expect(actual).toBe(expected)
    })
})
