/**
 * Rythme de fonds et transitions T1, T2, T3 de la home enso (#1595, spec v12 § 1, 5, 6).
 * Mesuré en navigateur (un test jsdom ne résout pas `var()`), clair ET sombre.
 *
 *   pnpm -F @origam/tests exec playwright test -c playwright.marketing.config.ts home-rhythm.spec.ts
 */

import { expect, test } from '@playwright/test'

const BASE = process.env.MARKETING_BASE_URL ?? 'http://localhost:3000'

const MODES = ['light', 'dark'] as const

for (const mode of MODES) {
    test.describe(`Rythme de fonds, ${mode}`, () => {
        test.beforeEach(async ({ page }) => {
            await page.emulateMedia({ colorScheme: mode })
            await page.setViewportSize({ width: 1440, height: 900 })
            await page.goto(BASE, { waitUntil: 'networkidle' })
            await page.evaluate(m => document.documentElement.setAttribute('data-mode', m), mode)
        })

        test('chaque section peint le token surface du rythme', async ({ page }) => {
            const expectedToken = {
                benefits: 'overlay',
                playground: 'overlay',
                library: 'default',
                themes: mode === 'light' ? 'sunken' : 'overlay'
            }

            const res = await page.evaluate((tokens) => {
                const probe = (token: string) => {
                    const p = document.createElement('div')
                    p.style.backgroundColor = `var(--origam-color__surface---${token})`
                    document.body.appendChild(p)
                    const c = getComputedStyle(p).backgroundColor
                    p.remove()
                    return c
                }
                return Object.entries(tokens).map(([id, token]) => ({
                    id,
                    actual: getComputedStyle(document.querySelector(`section#${id}`)!).backgroundColor,
                    expected: probe(token)
                }))
            }, expectedToken)

            for (const r of res) expect(r.actual, r.id).toBe(r.expected)
        })

        test('les transitions sont des pseudo-éléments masqués par des pinceaux de même origine', async ({ page }) => {
            const res = await page.evaluate(() => {
                const mask = (sel: string, pseudo: '::before' | '::after') => {
                    const cs = getComputedStyle(document.querySelector(sel)!, pseudo)
                    return { content: cs.content, mask: cs.maskImage || cs.webkitMaskImage, origin: location.origin }
                }
                return {
                    t1: mask('section#benefits', '::before'),
                    t2: mask('section#playground', '::after'),
                    t3a: mask('section#themes', '::before'),
                    t3b: mask('section#themes', '::after')
                }
            })

            // T1 est un lavis CSS seul : aucun masque.
            expect(res.t1.content).not.toBe('none')
            expect(res.t1.mask).toBe('none')

            expect(res.t2.mask).toContain(`${res.t2.origin}/brand/enso/shared/dry-02-`)
            expect(res.t3a.mask).toContain(`${res.t3a.origin}/brand/enso/shared/brush-violet-04-`)
            expect(res.t3b.mask).toContain(`${res.t3b.origin}/brand/enso/shared/brush-violet-07-`)
        })

        test('les masques se chargent (200) et aucun paysage à bords durs ne reste derrière library/themes', async ({ page, request }) => {
            for (const file of ['dry-02-1200', 'brush-violet-04-1200', 'brush-violet-07-1200']) {
                const r = await request.get(`${BASE}/brand/enso/shared/${file}.avif`)
                expect(r.status(), file).toBe(200)
            }
            await expect(page.locator('section#library [data-cy="enso-backdrop"], section#themes [data-cy="enso-backdrop"]')).toHaveCount(0)
        })
    })
}
