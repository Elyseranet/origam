/**
 * HomeKpis — spec e2e T2
 *
 * Asserts :
 *  1. La section #kpis est présente dans le DOM avec aria-labelledby="kpis-title".
 *  2. Le titre <h2> "origam by the numbers" est visible.
 *  3. La liste de stats est un <dl>.
 *  4. Les 5 paires valeur/label sont rendues (<dd> + <dt>).
 *  5. Les valeurs attendues sont exactement : 95 · 29 · 100% · <50kb · MIT.
 *  6. Les labels attendus sont présents.
 *  7. A11y de base : pas de violation axe-core sur la section.
 *
 * Run :
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts home-kpis
 *
 * Pré-requis : dev server marketing sur http://localhost:3000.
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const BASE = '/'

/**
 * ⛔ Valeurs de CONTRAT uniquement — pas d'inventaire.
 *
 * `'95'` (composants) et `'29'` (primitives de graphes) figuraient ici. Ce
 * sont deux INVENTAIRES : ils bougent à chaque livraison. Mesuré sur
 * `packages/marketing/src/consts/kpis.const.ts`, ils valent aujourd'hui
 * **218** et **26** — le second a même BAISSÉ, donc aucune borne « au moins N »
 * ne tiendrait non plus. La spec était rouge sur ces deux tests, sans qu'aucun
 * comportement n'ait changé, et le serait redevenue au prochain composant
 * ajouté.
 *
 * Ce qui est garanti à la place, et qui ne périme pas : les deux KPI
 * d'inventaire rendent bien un NOMBRE (test dédié plus bas). Les trois autres
 * valeurs sont des engagements, pas des compteurs, et restent épinglées.
 */
const EXPECTED_VALUES = ['100%', '<50kb', 'MIT']

/** Les libellés, eux, sont stables : ils nomment les KPI, ils ne les comptent pas. */
const EXPECTED_LABELS = ['Components', 'Chart primitives', 'WCAG 2.1 AA', 'Tree-shakable', 'Open source']

/** Les deux KPI dont la valeur est un compteur. */
const INVENTORY_LABELS = ['Components', 'Chart primitives']

test.describe('HomeKpis — T2', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE)
        await page.waitForLoadState('networkidle')
    })

    test('section #kpis est dans le DOM avec aria-labelledby', async ({ page }) => {
        const section = page.locator('#kpis')
        await expect(section).toBeAttached()
        await expect(section).toHaveAttribute('aria-labelledby', 'kpis-title')
    })

    test('<h2> titre "origam by the numbers" est visible', async ({ page }) => {
        const heading = page.locator('#kpis h2#kpis-title')
        await expect(heading).toBeVisible()
        await expect(heading).toHaveText('origam by the numbers')
    })

    test('la liste de stats est un <dl>', async ({ page }) => {
        const dl = page.locator('#kpis dl')
        await expect(dl).toBeAttached()
    })

    test('5 items <dd> (valeurs) présents', async ({ page }) => {
        const dds = page.locator('#kpis dd')
        await expect(dds).toHaveCount(5)
    })

    test('5 items <dt> (labels) présents', async ({ page }) => {
        const dts = page.locator('#kpis dt')
        await expect(dts).toHaveCount(5)
    })

    for (const value of EXPECTED_VALUES) {
        test(`valeur "${value}" est rendue dans un <dd>`, async ({ page }) => {
            const dd = page.locator(`#kpis dd`).filter({ hasText: value })
            await expect(dd).toBeVisible()
        })
    }

    for (const label of EXPECTED_LABELS) {
        test(`label "${label}" est rendu dans un <dt>`, async ({ page }) => {
            const dt = page.locator(`#kpis dt`).filter({ hasText: label })
            await expect(dt).toBeVisible()
        })
    }

    for (const label of INVENTORY_LABELS) {
        test(`le KPI "${label}" rend un nombre (inventaire, valeur non épinglée)`, async ({ page }) => {
            // On apparie par ORDRE DU DOCUMENT (`dt` puis son `dd`), pas par
            // index fixe : OrigamGrid peut interposer des wrappers, et l'ordre
            // des KPI n'est pas un contrat.
            //
            // ⛔ Comparaison INSENSIBLE À LA CASSE : `.home-kpis__label` porte
            // `text-transform: uppercase`, et `innerText` rend le texte TEL
            // QU'IL EST PEINT — il renvoie donc « COMPONENTS ». Mesuré : la
            // première version de ce test, en comparaison stricte, échouait
            // sur les deux KPI. (`locator.filter({ hasText })`, utilisé par les
            // tests de libellé plus haut, est insensible à la casse et masquait
            // le piège.)
            const value = await page.locator('#kpis').evaluate((root, wanted) => {
                const needle = wanted.toLowerCase()
                const cells = Array.from(root.querySelectorAll('dt, dd'))
                const i = cells.findIndex(el => el.tagName === 'DT' && (el as HTMLElement).innerText.trim().toLowerCase().includes(needle))
                if (i < 0) return null
                const dd = cells.slice(i + 1).find(el => el.tagName === 'DD')
                return dd ? (dd as HTMLElement).innerText.trim() : null
            }, label)

            expect(value, `aucun <dd> apparié au <dt> "${ label }"`).not.toBeNull()
            expect(value!, `le KPI "${ label }" devrait rendre un nombre, obtenu "${ value }"`).toMatch(/\d/)
        })
    }

    test('règles haut/bas rendues par OrigamDivider (<hr>)', async ({ page }) => {
        const rules = page.locator('#kpis hr.origam-divider')
        await expect(rules).toHaveCount(2)
        await expect(page.locator('[data-cy="kpis-rule-top"]')).toBeAttached()
        await expect(page.locator('[data-cy="kpis-rule-bottom"]')).toBeAttached()
    })

    test('la liste est rendue par OrigamGrid (tag dl, .origam-grid)', async ({ page }) => {
        const grid = page.locator('#kpis dl.origam-grid')
        await expect(grid).toBeAttached()
    })

    // ── Sobre computed-style assertions (≥3) ───────────────────────────────

    test('Sobre — le nombre KPI est peint via gradient (kpi-value)', async ({ page }) => {
        const value = page.locator('#kpis dd.home-kpis__value').first()
        const styles = await value.evaluate(el => {
            const s = getComputedStyle(el)
            return {
                bgImage: s.backgroundImage,
                webkitTextFillColor: (s as CSSStyleDeclaration & Record<string, string>)['-webkit-text-fill-color'] ?? s.getPropertyValue('-webkit-text-fill-color')
            }
        })
        // .home-kpis__value peint le texte via background-clip:text + gradient kpi-value.
        // getComputedStyle().color retourne rgba(0,0,0,0) quand -webkit-text-fill-color: transparent.
        // On assert la présence du gradient sur backgroundImage.
        expect(styles.bgImage).not.toBe('none')
        expect(styles.bgImage.toLowerCase()).toContain('gradient')
    })

    test('Sobre — le label KPI est uppercase + gris secondaire', async ({ page }) => {
        const label = page.locator('#kpis dt.home-kpis__label').first()
        const styles = await label.evaluate(el => {
            const s = getComputedStyle(el)
            return { transform: s.textTransform, color: s.color }
        })
        expect(styles.transform).toBe('uppercase')
        // sobre text---secondary = #525252 = rgb(82, 82, 82)
        expect(styles.color).toBe('rgb(82, 82, 82)')
    })

    test('Sobre — la règle (divider) lit le token border à pleine opacité', async ({ page }) => {
        const rule = page.locator('[data-cy="kpis-rule-top"]')
        const opacity = await rule.evaluate(el => getComputedStyle(el).opacity)
        expect(opacity).toBe('1')
    })

    test('a11y — pas de violation axe-core critique sur la section kpis', async ({ page }) => {
        const results = await new AxeBuilder({ page })
            .include('#kpis')
            .analyze()

        const critical = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')

        expect(
            critical,
            `a11y violations critiques/sérieuses sur #kpis :\n` +
            critical.map(v => `  [${v.impact}] ${v.id}: ${v.description}`).join('\n')
        ).toHaveLength(0)
    })

})
