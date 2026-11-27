/**
 * Fondations partagées de la home (#1554, T2) — un seul bord gauche, un seul
 * écart de section, une seule échelle typographique, et la marque dorée des
 * eyebrows (#1592). Mesuré en navigateur : un test jsdom ne résout pas `var()`.
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
            page.locator(`section#${id} .home-container`).first().evaluate((el) => {
                const cs = getComputedStyle(el)
                return Math.round(el.getBoundingClientRect().left + parseFloat(cs.paddingLeft))
            })
        ))

        // maquette v12 (#1594) : conteneur 1200 px, gouttière max(20px, 4vw) = 57,6 px à 1440
        // (1440 - 1200) / 2 + 57,6 = 177,6
        expect(lefts).toEqual([178, 178, 178])
    })

    test('middle sections carry the v12 background rhythm paddings (spec 1, 5, 6)', async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' })

        const paddings = await page.evaluate(ids => ids.map((id) => {
            const cs = getComputedStyle(document.querySelector(`section#${id}`)!)
            return [cs.paddingTop, cs.paddingBottom]
        }), ['benefits', 'playground', 'library', 'themes'])

        expect(paddings).toEqual([['40px', '0px'], ['88px', '120px'], ['130px', '150px'], ['90px', '40px']])
    })

    test('.home-eyebrow draws the gold-tick mark, 18x24, rotated 28deg', async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' })

        const mark = await page.evaluate(() => {
            const el = document.createElement('p')
            el.className = 'home-eyebrow'
            el.textContent = 'x'
            document.body.appendChild(el)
            const s = getComputedStyle(el, '::before')
            const out = { bg: s.backgroundImage, transform: s.transform, w: s.width, h: s.height }
            el.remove()
            return out
        })

        expect(mark.bg).toContain('/brand/enso/shared/gold-tick-')
        expect(mark.w).toBe('18px')
        expect(mark.h).toBe('24px')
        // rotate(28deg) = matrix(cos, sin, -sin, cos, 0, 0)
        const [cos, sin] = mark.transform.replace(/^matrix\(|\)$/g, '').split(',').map(Number)
        expect(cos).toBeCloseTo(Math.cos((28 * Math.PI) / 180), 3)
        expect(sin).toBeCloseTo(Math.sin((28 * Math.PI) / 180), 3)
    })
})
