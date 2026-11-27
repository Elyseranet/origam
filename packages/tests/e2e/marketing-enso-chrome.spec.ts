/**
 * Chrome enso — header papier opaque, trait de pinceau, footer panoramique (#1571)
 *
 * Mesure le fond CALCULÉ du header (un fond transparent laissait le contenu
 * défiler dessous), la présence des décors `aria-hidden`, et que les deux
 * modes lisent leur variante de papier.
 */
import { expect, test } from '@playwright/test'

const BASE_URL = process.env.MARKETING_BASE_URL ?? 'http://localhost:3000'

const PAPER = { light: 'rgb(247, 245, 239)', dark: 'rgb(27, 17, 39)' } as const

for (const mode of ['light', 'dark'] as const) {
  test.describe(`chrome enso — ${mode}`, () => {
    test.use({ viewport: { width: 1280, height: 800 }, colorScheme: mode })

    test.beforeEach(async ({ context }) => {
      await context.addCookies([{ name: 'origam-mode', value: mode, url: BASE_URL }])
    })

    test('le header est opaque, papier / encre, sans flou, même après défilement', async ({ page }) => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
      await page.evaluate(() => window.scrollTo(0, 900))

      const header = await page.locator('header').first().evaluate((el) => {
        const cs = getComputedStyle(el)
        return { bg: cs.backgroundColor, backdrop: cs.backdropFilter, height: el.getBoundingClientRect().height }
      })

      expect(header.bg).toBe(PAPER[mode])
      expect(header.backdrop).toBe('none')
      expect(header.height).toBe(72)
    })

    test('le trait de pinceau et le panorama du footer sont décoratifs', async ({ page }) => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })

      for (const cy of ['appbar-brush', 'footer-art']) {
        const art = page.locator(`[data-cy="${cy}"]`)
        await expect(art).toHaveAttribute('aria-hidden', 'true')
        expect(await art.evaluate(el => getComputedStyle(el).backgroundImage)).toContain('/brand/enso/')
      }
    })

    test('le lien actif est souligné au pinceau', async ({ page }) => {
      await page.goto(`${BASE_URL}/roadmap`, { waitUntil: 'networkidle' })

      const underline = await page.locator('.primary-nav__link--active').first().evaluate((el) => {
        const cs = getComputedStyle(el, '::after')
        return { image: cs.backgroundImage, height: cs.height }
      })

      expect(underline.image).toContain('/brand/enso/shared/')
      expect(underline.height).toBe('6px')
    })
  })
}
