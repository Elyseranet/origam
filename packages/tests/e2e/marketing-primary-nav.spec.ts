import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const BASE_URL = process.env.MARKETING_BASE_URL ?? 'http://localhost:3000'

// #1515 — le site rend toujours `origam` : le cookie de marque est ignoré.
const THEMES = [
  { name: 'origam', mode: 'light' },
  { name: 'origam', mode: 'dark' }
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
      // `none` OU l'ombre nulle transparente que le token `--origam-shadow---none` rend : aucune ne peint.
      expect(computed.boxShadow).toMatch(/^(none|rgba\(0, 0, 0, 0\) 0px 0px 0px 0px)$/)
      expect(computed.borderWidth).toBe('0px')
    })

    test('real appbar buttons keep their button surface (unaffected)', async ({ page }) => {
      await setTheme(page, name, mode)
      await page.goto(`${BASE_URL}/`, { waitUntil: 'load' })
      const themeBtn = page.locator('[data-cy="nav-mode-toggle"]')
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
    await setTheme(page, 'origam', 'light')
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
    await setTheme(page, 'origam', 'light')
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
    await setTheme(page, 'origam', 'light')
    await page.goto(`${BASE_URL}/roadmap`, { waitUntil: 'load' })

    const active = page.locator('[data-cy="nav-section-introduction"]')
    const inactive = page.locator('[data-cy="nav-section-getting-started"]')
    await active.waitFor({ state: 'visible' })

    const activeColor = await active.evaluate(el => getComputedStyle(el).color)
    const inactiveColor = await inactive.evaluate(el => getComputedStyle(el).color)
    expect(activeColor).not.toBe(inactiveColor)
  })

  test('keyboard focus stays visible on a nav link', async ({ page }) => {
    await setTheme(page, 'origam', 'light')
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
// #1515 — le site rend toujours `origam` : les rayons littéraux par marque
// (material 4px, glass 10/16px, cartoon 8px) ne sont plus atteignables sur le
// site entier. On garde ce qui reste vrai pour origam (gouttière, pas de débordement),
// qui ne dépend d'aucune valeur — donc qui survit au changement de couleurs
// et de rayons du thème `origam`. (Voir plus bas : le rung partagé n'est pas vrai pour origam.)
const MENU_SHAPE = [
  { name: 'origam', mode: 'light' },
  { name: 'origam', mode: 'dark' }
]

for (const { name, mode } of MENU_SHAPE) {
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

      expect(shape.itemBottomRight, 'rayon de la ligne — coin bas-droit').toBe(shape.item)
      // #1515 — « conteneur et ligne partagent le même rung » n'est PAS vrai pour
      // `origam` (mesuré : conteneur 8px, ligne 0px) : la règle de #944 a été posée
      // pour material / glass / cartoon, qui ne sont plus atteignables sur le site
      // entier. Écart signalé dans #1515, non masqué ici par une valeur en dur.
      expect(shape.overflows, 'la ligne ne doit jamais déborder de .origam-menu__content').toBe(false)
      expect(shape.padInlineStart, 'gouttière intérieure de la ligne — 0px = libellé collé au bord').not.toBe('0px')
      expect(shape.labelFlush, 'le libellé ne doit pas toucher le bord de la surbrillance').toBe(false)
    })
  })
}

/**
 * SPEC — tous les menus du site se lisent pareil, quel que soit ce qui les
 * ouvre (#946)
 *
 * ## Ce qui est encodé ici
 *
 * `rounded` sur `origam-menu` est un DÉFAUT DE COMPOSANT : trois des quatre
 * surfaces à menu du site en héritent (menu de nav, menu de langue, sélecteur
 * d'identité). La quatrième — le dropdown d'`origam-select` — reçoit un
 * `menuProps` EXPLICITE depuis le thème, un binding qui bat le défaut. C'est
 * pour ça qu'elle était restée en arrière quand #944 a allégé les trois autres :
 * en glass sombre, un menu de nav à 16px côtoyait un dropdown à 30px sur la
 * même page. Mesuré, photographié, corrigé sous #946.
 *
 * ⛔ C'est un canal SÉPARÉ, pas une conséquence : un spec qui ne mesure que le
 * menu de nav reste vert pendant que le dropdown dérive. D'où ce bloc.
 *
 * ## ⛔ Pourquoi dans CE fichier
 *
 * Le dropdown n'est pas de la navigation primaire, et le nom du fichier le dit
 * mal. Il vit ici quand même parce que c'est ce fichier qui est inscrit dans
 * `MARKETING_GREEN_SPECS` : un fichier neuf sortirait du périmètre exécuté par
 * la CI et devrait repasser par la baseline `spec-coverage`. Un spec qu'aucun
 * job n'exécute ne garde rien.
 *
 * ## Le témoin positif
 *
 * Contre un serveur servant `develop`, les six cas rendent la valeur d'avant —
 * glass 22px / 30px, cartoon 14px — et le bloc est ROUGE. Ces trois valeurs
 * sont celles de `develop` APRÈS le merge de #945 : #945 n'a pas touché
 * `menuProps` (vérifiable par `git show origin/develop:packages/marketing/src/
 * themes/glass.theme.ts`), donc le témoin ne dépend pas de la fraîcheur du
 * serveur témoin.
 *
 * ## Les témoins négatifs
 *
 * `geek` et `editorial` portent DÉJÀ un `menuProps` explicite, à une valeur qui
 * coïncide avec leur menu (`sm` = 4px, `none` = 0). Ils ne doivent pas bouger —
 * s'ils bougent, le correctif a débordé de sa cible.
 */
// #1515 — voir MENU_SHAPE : la règle (même rayon que le menu de nav) est gardée,
// les valeurs par marque ne sont plus atteignables sur le site entier.
const SELECT_MENU_SHAPE = [
  { name: 'origam', mode: 'light' },
  { name: 'origam', mode: 'dark' }
]

for (const { name, mode } of SELECT_MENU_SHAPE) {
  test.describe(`select dropdown shape — ${name}/${mode} (#946)`, () => {
    test('le dropdown d’un origam-select porte le même rayon que le menu de nav', async ({ page }) => {
      await setTheme(page, name, mode)
      await page.goto(`${BASE_URL}/changelog`, { waitUntil: 'load' })

      // Même boucle de re-clic que le bloc précédent : avant hydratation, le
      // clic réussit pour Playwright et n'ouvre rien.
      const select = page.locator('.changelog-release__select').first()
      await select.waitFor({ state: 'visible', timeout: 15000 })
      const menuContent = page.locator('.origam-menu__content').first()

      await expect.poll(async () => {
        if (await menuContent.isVisible()) return true
        await select.click().catch(() => undefined)
        await page.waitForTimeout(250)
        return menuContent.isVisible()
      }, {
        timeout: 20_000,
        message: 'le dropdown du select ne s’est jamais ouvert'
      }).toBe(true)

      const shape = await page.evaluate(() => {
        const el = [...document.querySelectorAll('.origam-menu__content')]
          .find((e) => e.getBoundingClientRect().width > 0)!
        return {
          radius: getComputedStyle(el).borderTopLeftRadius,
          // ⛔ relu AU MOMENT de la mesure : une sonde antérieure cliquait en
          // aveugle dans la barre, tombait sur la bascule de mode et rendait
          // des valeurs du mode OPPOSÉ, inversées mais cohérentes.
          themeAtRead: document.documentElement.getAttribute('data-theme'),
          modeAtRead: document.documentElement.getAttribute('data-mode')
        }
      })

      expect(shape.themeAtRead, 'identité réellement active à la mesure').toBe(name)
      expect(shape.modeAtRead, 'mode réellement actif à la mesure').toBe(mode)

      // La RÈGLE : le menu de nav, sur la même page, porte le même rayon.
      await page.keyboard.press('Escape')
      const activator = page.locator('[data-cy="nav-section-introduction"]')
      await expect.poll(async () => {
        if (await menuContent.isVisible()) return true
        await activator.click().catch(() => undefined)
        await page.waitForTimeout(250)
        return menuContent.isVisible()
      }, { timeout: 20_000, message: 'le menu de nav ne s’est jamais ouvert' }).toBe(true)
      const navRadius = await page.evaluate(() => {
        const el = [...document.querySelectorAll('.origam-menu__content')]
          .find((e) => e.getBoundingClientRect().width > 0)!
        return getComputedStyle(el).borderTopLeftRadius
      })
      expect(shape.radius, 'le dropdown de select doit porter le rayon du menu de nav').toBe(navRadius)
    })
  })
}
