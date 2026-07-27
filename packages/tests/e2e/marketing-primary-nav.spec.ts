import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const BASE_URL = process.env.MARKETING_E2E_URL ?? 'http://localhost:3015'

const THEMES = [
  { name: 'glass', mode: 'light' },
  { name: 'glass', mode: 'dark' },
  { name: 'material', mode: 'light' },
  { name: 'material', mode: 'dark' }
]

async function setTheme (page: import('@playwright/test').Page, theme: string, mode: string) {
  await page.context().addCookies([
    { name: 'origam-theme', value: theme, url: BASE_URL },
    { name: 'origam-mode', value: mode, url: BASE_URL }
  ])
}

for (const { name, mode } of THEMES) {
  test.describe(`primary-nav look — ${name}/${mode}`, () => {
    test('nav links carry no button surface (no shadow, no border, transparent bg)', async ({ page }) => {
      await setTheme(page, name, mode)
      await page.goto(`${BASE_URL}/`, { waitUntil: 'load' })
      const link = page.locator('[data-cy="nav-section-introduction"]')
      await link.waitFor({ state: 'visible' })

      const computed = await link.evaluate(el => {
        const cs = getComputedStyle(el)
        return {
          backgroundColor: cs.backgroundColor,
          boxShadow: cs.boxShadow,
          borderWidth: cs.borderWidth
        }
      })

      expect(computed.backgroundColor).toBe('rgba(0, 0, 0, 0)')
      expect(computed.boxShadow).toBe('none')
      expect(computed.borderWidth).toBe('0px')
    })

    test('real appbar buttons keep their button surface (unaffected)', async ({ page }) => {
      await setTheme(page, name, mode)
      await page.goto(`${BASE_URL}/`, { waitUntil: 'load' })
      const themeBtn = page.locator('.appbar-actions__btn').first()
      await themeBtn.waitFor({ state: 'visible' })

      const computed = await themeBtn.evaluate(el => getComputedStyle(el).borderWidth)
      expect(computed).not.toBe('0px')
    })

    test('active vs inactive links pass WCAG AA color-contrast (axe-core)', async ({ page }) => {
      await setTheme(page, name, mode)
      await page.goto(`${BASE_URL}/roadmap`, { waitUntil: 'load' })
      await page.locator('[data-cy="nav-section-introduction"]').waitFor({ state: 'visible' })

      const results = await new AxeBuilder({ page })
        .include('.primary-nav')
        .withTags(['wcag2aa'])
        .analyze()

      const contrastViolations = results.violations.filter(v => v.id === 'color-contrast')
      expect(contrastViolations).toHaveLength(0)
    })
  })
}

test.describe('primary-nav active state (route-driven)', () => {
  test('section trigger gets aria-current + active class when a child route is open', async ({ page }) => {
    await setTheme(page, 'glass', 'light')
    await page.goto(`${BASE_URL}/roadmap`, { waitUntil: 'load' })

    const introBtn = page.locator('[data-cy="nav-section-introduction"]')
    await introBtn.waitFor({ state: 'visible' })
    await expect(introBtn).toHaveAttribute('aria-current', 'page')
    await expect(introBtn).toHaveClass(/primary-nav__link--active/)

    const gettingStartedBtn = page.locator('[data-cy="nav-section-getting-started"]')
    await expect(gettingStartedBtn).not.toHaveAttribute('aria-current', 'page')
    await expect(gettingStartedBtn).not.toHaveClass(/primary-nav__link--active/)
  })

  test('direct link (theming) gets aria-current + active class on its own route', async ({ page }) => {
    await setTheme(page, 'glass', 'light')
    await page.goto(`${BASE_URL}/theming`, { waitUntil: 'load' })

    const themingBtn = page.locator('[data-cy="nav-theming"]')
    await themingBtn.waitFor({ state: 'visible' })
    await expect(themingBtn).toHaveAttribute('aria-current', 'page')
    await expect(themingBtn).toHaveClass(/primary-nav__link--active/)
  })

  test('active link text color is visually distinct from inactive siblings', async ({ page }) => {
    // Regression guard: the DS's OrigamToolbar chrome contract
    // (`:deep(.origam-btn:not(:hover):not(.origam-btn--active))`) sets
    // `--origam-btn---color` with a higher-specificity selector than a
    // plain `.primary-nav__link--active` custom-property override, so a
    // naive fix silently loses the color change (only the underline/weight
    // would show). This asserts the two are genuinely different colors.
    await setTheme(page, 'glass', 'light')
    await page.goto(`${BASE_URL}/roadmap`, { waitUntil: 'load' })

    const active = page.locator('[data-cy="nav-section-introduction"]')
    const inactive = page.locator('[data-cy="nav-section-getting-started"]')
    await active.waitFor({ state: 'visible' })

    const activeColor = await active.evaluate(el => getComputedStyle(el).color)
    const inactiveColor = await inactive.evaluate(el => getComputedStyle(el).color)
    expect(activeColor).not.toBe(inactiveColor)
  })

  test('keyboard focus stays visible on a nav link', async ({ page }) => {
    await setTheme(page, 'glass', 'light')
    await page.goto(`${BASE_URL}/`, { waitUntil: 'load' })
    const link = page.locator('[data-cy="nav-section-introduction"]')
    await link.waitFor({ state: 'visible' })
    await link.focus()

    const outlineStyle = await link.evaluate(el => getComputedStyle(el).outlineStyle)
    expect(outlineStyle).not.toBe('none')
  })
})
