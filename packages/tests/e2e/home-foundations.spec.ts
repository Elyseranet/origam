/**
 * Fondations partagées de la home (#1554, T2) — un seul bord gauche, un seul
 * écart de section, une seule échelle typographique, et le trait jaune des
 * eyebrows. Mesuré en navigateur : un test jsdom ne résout pas `var()`.
 *
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts home-foundations.spec.ts
 */

import { expect, test } from '@playwright/test'

const BASE = process.env.MARKETING_BASE_URL ?? 'http://localhost:3000'

const SECTIONS = ['playground', 'library', 'themes']

test.describe('Home foundations', () => {
    test('playground, library and themes share the same left edge at 1440', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto(BASE, { waitUntil: 'domcontentloaded' })

        const lefts = await Promise.all(SECTIONS.map(id =>
            page.locator(`section#${id}`).evaluate((el) => {
                const cs = getComputedStyle(el)
                return Math.round(el.getBoundingClientRect().left + parseFloat(cs.paddingLeft))
            })
        ))

        // (1440 - 1280) / 2 = 80
        expect(lefts).toEqual([80, 80, 80])
    })

    test('section padding follows --home-section-gap', async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' })

        const { gap, paddings } = await page.evaluate((ids) => {
            const probe = document.createElement('div')
            probe.style.paddingTop = 'var(--home-section-gap)'
            document.body.appendChild(probe)
            const gap = getComputedStyle(probe).paddingTop
            probe.remove()
            return {
                gap,
                paddings: ids.map(id => getComputedStyle(document.querySelector(`section#${id}`)!).paddingTop)
            }
        }, ['benefits', ...SECTIONS])

        expect(gap).toBe('24px')
        expect(paddings).toEqual([gap, gap, gap, gap])
    })

    test('.home-eyebrow draws a yellow skewed mark', async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' })

        const mark = await page.evaluate(() => {
            const el = document.createElement('p')
            el.className = 'home-eyebrow'
            el.textContent = 'x'
            document.body.appendChild(el)
            const s = getComputedStyle(el, '::before')
            const out = { bg: s.backgroundColor, transform: s.transform, w: s.width }
            el.remove()
            return out
        })

        expect(mark.bg).toBe('rgb(255, 197, 41)') // --origam-color__sun---500
        expect(mark.transform).not.toBe('none')
        expect(parseFloat(mark.w)).toBeGreaterThan(0)
    })
})
