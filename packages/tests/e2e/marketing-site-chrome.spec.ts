/**
 * Chrome du site — header, logo, favicons, menu mobile (#1516)
 *
 * Ce que ce spec encode : le header suit le kit de marque A1 sur l'arborescence
 * de navigation EXISTANTE (aucun menu inventé), le logo clair / sombre suit le
 * mode du site, les favicons du kit sont déclarés, et sous 1120 px la nav passe
 * dans un menu burger sans qu'aucune cible cachée ne reste dans la tabulation.
 */
import { expect, test } from '@playwright/test'

const BASE_URL = process.env.MARKETING_BASE_URL ?? 'http://localhost:3000'

test.describe('chrome du site — desktop (#1516)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('la barre décorative est aria-hidden, la nav existante et le CTA Documentation sont là', async ({ page }) => {
    await page.goto(`${BASE_URL}/installation`, { waitUntil: 'load' })

    await expect(page.locator('[data-cy="site-topbar"]')).toHaveAttribute('aria-hidden', 'true')
    for (const section of ['introduction', 'getting-started', 'features']) {
      await expect(page.locator(`[data-cy="nav-section-${section}"]`)).toBeVisible()
    }
    await expect(page.locator('[data-cy="nav-theming"]')).toBeVisible()
    await expect(page.locator('[data-cy="nav-docs-cta"]')).toHaveAttribute('href', '/docs/')
    await expect(page.locator('[data-cy="nav-mobile-trigger"]')).toBeHidden()
  })

  test('le logo est servi en AVIF 1x / 2x, un seul est affiché et il suit le mode', async ({ page }) => {
    for (const mode of ['light', 'dark'] as const) {
      await page.context().addCookies([{ name: 'origam-mode', value: mode, url: BASE_URL }])
      await page.goto(`${BASE_URL}/installation`, { waitUntil: 'load' })

      const shown = await page.evaluate(() =>
        [...document.querySelectorAll('header [data-cy="site-logo"] img')]
          .filter((img) => getComputedStyle(img.closest('.site-logo__img')!).display !== 'none')
          .map((img) => ({ src: img.getAttribute('src'), srcset: img.getAttribute('srcset'), alt: img.getAttribute('alt') }))
      )

      expect(shown, `un seul logo visible en ${mode}`).toHaveLength(1)
      expect(shown[0].src).toContain(`origam-horizontal-${mode}-1x.avif`)
      expect(shown[0].srcset).toContain('2x')
      expect(shown[0].alt).toBeTruthy()
    }
  })

  test('les favicons du kit et le manifest sont déclarés et servis', async ({ page, request }) => {
    await page.goto(`${BASE_URL}/installation`, { waitUntil: 'domcontentloaded' })

    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]')]
        .map((l) => l.getAttribute('href'))
    )

    for (const href of [
      '/favicon.ico', '/favicons/favicon-16.png', '/favicons/favicon-32.png', '/favicons/favicon-48.png',
      '/favicons/favicon-192.png', '/favicons/favicon-512.png', '/favicons/favicon-180.png', '/site.webmanifest'
    ]) {
      expect(hrefs).toContain(href)
      expect((await request.get(`${BASE_URL}${href}`)).status(), href).toBe(200)
    }
  })

  test('la famille du site est Sora, servie par le site', async ({ page }) => {
    await page.goto(`${BASE_URL}/installation`, { waitUntil: 'load' })

    const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily)

    expect(font).toMatch(/^Sora/)
    await expect.poll(() => page.evaluate(async () => {
      await document.fonts.ready
      return [...document.fonts].some((f) => f.family === 'Sora' && f.status === 'loaded')
    })).toBe(true)
  })
})

test.describe('chrome du site — mobile (#1516)', () => {
  test.use({ viewport: { width: 390, height: 800 } })

  test('barre décorative masquée, nav hors tabulation, menu burger complet', async ({ page }) => {
    await page.goto(`${BASE_URL}/installation`, { waitUntil: 'load' })

    await expect(page.locator('[data-cy="site-topbar"]')).toBeHidden()
    await expect(page.locator('.primary-nav')).toBeHidden()
    await expect(page.locator('[data-cy="nav-docs-cta"]')).toBeHidden()

    const trigger = page.locator('[data-cy="nav-mobile-trigger"]')
    await expect(trigger).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-label', /.+/)

    const content = page.locator('.origam-menu__content').first()

    await expect.poll(async () => {
      if (await content.isVisible()) return true
      await trigger.click().catch(() => undefined)
      await page.waitForTimeout(250)
      return content.isVisible()
    }, { timeout: 20_000 }).toBe(true)

    for (const label of ['Why origam?', 'Installation', 'Components', 'Theming', 'Documentation', 'GitHub']) {
      await expect(content.getByText(label, { exact: true }).first()).toBeVisible()
    }

    const box = (await content.boundingBox())!

    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(390)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
  })
})
