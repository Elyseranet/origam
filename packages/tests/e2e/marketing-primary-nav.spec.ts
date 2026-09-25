import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const BASE_URL = process.env.MARKETING_BASE_URL ?? 'http://localhost:3000'

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

/**
 * SPEC — le menu déroulant ne porte pas la forme de TIROIR (#944)
 *
 * ## Ce qui est encodé ici
 *
 * `material`, `glass` et `cartoon` donnaient au conteneur du menu ET à ses
 * lignes le MÊME rung (`rounded: 'lg'`) — 28px / 22-30px / 20px sur une ligne
 * de 48px de haut. Au-delà de 24px le navigateur ramène les rayons et la ligne
 * devient une pilule pleine.
 *
 * Pour `material` c'est une erreur de forme documentable, pas un goût. Vérifié
 * dans les sources de tokens Material :
 *   - conteneur de menu déroulant = `corner-extra-small` = 4px
 *     (`material-web/tokens/versions/v0_192/_md-comp-menu.scss` →
 *      `'container-shape': … 'corner-extra-small'`, `_md-sys-shape.scss` → 4px)
 *   - item de liste = `corner-none` = 0
 *     (`_md-comp-list.scss` → `'list-item-container-shape': … 'corner-none'`)
 *   - destination de TIROIR = `ShapeAppearance.Material3.Corner.Full` = pilule
 *     (`material-components-android`, `navigation/res/values/styles.xml`)
 * La pilule de 28px est `corner-extra-large` : une forme de tiroir, posée sur
 * un menu.
 *
 * ## ⛔ Pourquoi `.origam-menu__content` et pas `.origam-menu`
 *
 * Le menu est TÉLÉPORTÉ. `.origam-menu` est la racine du téléport et ne porte
 * aucun rayon — une mesure qui la vise rend `0px` sous les 8 identités et
 * conclut, à tort, que rien n'est arrondi. La surface visible est
 * `.origam-menu__content`.
 *
 * ## ⛔ Pourquoi des valeurs absolues
 *
 * « le menu est moins arrondi que la ligne » passerait sur n'importe quelle
 * valeur fausse. Les attentes viennent du rung que chaque thème pose, relu
 * dans son `vars.rounded`.
 *
 * ## ⛔ Les longhands, jamais le raccourci
 *
 * `getPropertyValue()` sur `border-radius` rend `""` dès que la valeur contient
 * un `var()` — ce qui est le cas ici, la prop `rounded` émettant
 * `border-radius: var(--origam-radius---xs, …)` en style inline.
 *
 * ## Le témoin positif
 *
 * Rejoué contre le produit d'avant correctif (`MARKETING_BASE_URL` pointé sur
 * un serveur marketing servant `develop`), les six cas rendent le rayon du
 * CONTENEUR sur la ligne — 28 / 28 / 22 / 30 / 20 / 20 — et le bloc est ROUGE.
 *
 * ⚠️ Ce fichier n'est PAS dans `MARKETING_GREEN_SPECS` : la CI ne l'exécute
 * pas. Il ne garde que les exécutions locales de la suite marketing.
 */
const MENU_SHAPE = [
  // identité, mode, rayon du conteneur, rayon de la ligne — mesurés en Chromium
  { name: 'material', mode: 'light', content: '4px', item: '4px' },
  { name: 'material', mode: 'dark', content: '4px', item: '4px' },
  { name: 'glass', mode: 'light', content: '22px', item: '10px' },
  { name: 'glass', mode: 'dark', content: '30px', item: '16px' },
  { name: 'cartoon', mode: 'light', content: '20px', item: '8px' },
  { name: 'cartoon', mode: 'dark', content: '20px', item: '8px' }
]

for (const { name, mode, content, item } of MENU_SHAPE) {
  test.describe(`menu shape — ${name}/${mode} (#944)`, () => {
    test('la ligne ne porte pas le rayon du conteneur, et garde sa gouttière', async ({ page }) => {
      await setTheme(page, name, mode)
      await page.goto(`${BASE_URL}/`, { waitUntil: 'load' })

      // ⛔ Le premier clic tombe dans le vide tant que Nuxt n'a pas hydraté :
      // le bouton est peint et « actionable » pour Playwright, mais Vue n'a
      // pas encore attaché son écouteur, donc `click()` réussit et le menu ne
      // s'ouvre jamais (mesuré : 6/6 expirations sur `waitFor visible`). Le
      // site n'expose aucun marqueur d'hydratation (`[data-v-app]` absent),
      // donc on reclique tant que le menu n'est pas ouvert — jamais quand il
      // l'est déjà, pour ne pas le refermer.
      const activator = page.locator('[data-cy="nav-section-introduction"]')
      await activator.waitFor({ state: 'visible' })
      const menuContent = page.locator('.origam-menu__content').first()

      await expect.poll(async () => {
        if (await menuContent.isVisible()) return true
        await activator.click().catch(() => undefined)
        await page.waitForTimeout(250)
        return menuContent.isVisible()
      }, {
        timeout: 20_000,
        message: 'le menu « Introduction » ne s’est jamais ouvert'
      }).toBe(true)

      await page.locator('[data-cy="nav-item-changelog"]').first().waitFor({ state: 'visible' })

      // Rien n'est muté : on lit ce que Vue a rendu, donc la règle du
      // « single evaluate » (classe liée à un computed) ne s'applique pas.
      const shape = await page.evaluate(() => {
        const contentEl = document.querySelector('.origam-menu__content')!
        const rows = [...contentEl.querySelectorAll('.origam-list-item')]
        const rowEl = rows[rows.length - 1]
        const rowCs = getComputedStyle(rowEl)
        const titleEl = rowEl.querySelector('.origam-list-item__title')
        return {
          content: getComputedStyle(contentEl).borderTopLeftRadius,
          item: rowCs.borderTopLeftRadius,
          itemBottomRight: rowCs.borderBottomRightRadius,
          padInlineStart: rowCs.paddingInlineStart,
          overflows: rowEl.getBoundingClientRect().right > contentEl.getBoundingClientRect().right,
          labelFlush: titleEl
            ? Math.abs(titleEl.getBoundingClientRect().left - rowEl.getBoundingClientRect().left) < 1
            : null
        }
      })

      expect(shape.content, 'rayon du conteneur du menu').toBe(content)
      expect(shape.item, 'rayon de la ligne — coin haut-gauche').toBe(item)
      expect(shape.itemBottomRight, 'rayon de la ligne — coin bas-droit').toBe(item)
      expect(shape.overflows, 'la ligne ne doit jamais déborder de .origam-menu__content').toBe(false)
      expect(shape.padInlineStart, 'gouttière intérieure de la ligne — 0px = libellé collé au bord').toBe('12px')
      expect(shape.labelFlush, 'le libellé ne doit pas toucher le bord de la surbrillance').toBe(false)
    })
  })
}
