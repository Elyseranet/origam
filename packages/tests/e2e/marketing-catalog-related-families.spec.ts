/**
 * marketing-catalog-related-families.spec.ts — l'encart « Same subject in the
 * other families » des fiches de référence, en index de lignes (#1172, piste B).
 *
 * ⛔ Vise le site Nuxt (`baseURL` de la config marketing), jamais Histoire :
 * il figure dans `MARKETING_SPEC_PATTERNS` ET dans la liste verte. Il lit la
 * base : `requireMarketingDb()`.
 *
 * ── Ce qui est épinglé ─────────────────────────────────────────────────
 *  1. Structure en LIGNES : une `<li>` par famille liée, dans une liste, chacune
 *     avec son titre `h3`, son compteur et SA liste de liens nommée par le titre.
 *  2. Repli au-delà de 12 : la ligne `interface` de Btn (plus de 12 entrées)
 *     montre 12 liens, garde les autres dans le DOM masqués, et propose
 *     « Show all N » avec `aria-expanded` / `aria-controls`.
 *  3. Dépli au clic ET au clavier (Entrée, Espace), le focus reste sur le bouton.
 *  4. Ordre : les liens de chaque ligne sont dans l'ordre que l'API livre, et
 *     cet ordre est alphabétique.
 *  5. 390 px sans défilement horizontal ; axe WCAG A/AA à 0 sur la section.
 *
 * Les attentes chiffrées sont lues dans l'API (`/api/reference/neighbours`),
 * jamais recopiées : le catalogue est une donnée éditoriale.
 */
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

import { requireMarketingDb } from './_support/require-marketing-db'

requireMarketingDb()

const LIMIT = 12

interface IRelated { kind: string; entries: Array<{ slug: string; name: string }> }

async function relatedOfBtn (page: Page): Promise<IRelated[]> {
    const res = await page.request.get('/api/reference/neighbours/component/btn')

    expect(res.ok()).toBe(true)

    return (await res.json()).related
}

/** Clique tant que l'hydratation n'a pas branché le bouton : un clic avant elle tombe dans le vide. */
async function expandOnce (toggle: Locator): Promise<void> {
    await expect(async () => {
        if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click()

        await expect(toggle).toHaveAttribute('aria-expanded', 'true', { timeout: 1_000 })
    }).toPass({ timeout: 20_000 })
}

test.describe('Encart « même sujet » en lignes (#1172)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/components/btn', { waitUntil: 'load' })
        await expect(page.locator('[data-cy="catalog-related"]')).toBeVisible()
    })

    test('une ligne par famille liée, chacune avec titre, compteur et liste nommée', async ({ page }) => {
        const related = await relatedOfBtn(page)
        const rows = page.locator('[data-cy^="catalog-related-group-"]')

        await expect(rows).toHaveCount(related.length)

        for (const group of related) {
            const row = page.locator(`[data-cy="catalog-related-group-${group.kind}"]`)

            expect(await row.evaluate(el => `${el.tagName}<${el.parentElement?.tagName}`)).toBe('LI<UL')

            const heading = row.locator('h3')
            const list = row.locator(`[data-cy="catalog-related-list-${group.kind}"]`)

            await expect(heading).toHaveCount(1)
            await expect(row.locator(`[data-cy="catalog-related-count-${group.kind}"]`)).toHaveText(String(group.entries.length))
            expect(await list.evaluate(el => el.tagName)).toBe('UL')
            await expect(list).toHaveAttribute('aria-labelledby', await heading.getAttribute('id') ?? '__missing')
            await expect(list.locator(':scope > li')).toHaveCount(group.entries.length)
        }
    })

    test('ordre : celui de l’API, et il est alphabétique', async ({ page }) => {
        const related = await relatedOfBtn(page)

        for (const group of related) {
            const names = await page
                .locator(`[data-cy="catalog-related-list-${group.kind}"] [data-cy^="catalog-related-link-"]`)
                .evaluateAll(links => links.map(a => a.textContent?.trim() ?? ''))
            const want = group.entries.map(e => e.name)

            expect(names).toEqual(want)
            expect(names).toEqual([...want].sort((a, b) => a.localeCompare(b)))
        }
    })

    test('repli au-delà de 12 : Show all N, aria-expanded, liens gardés dans le DOM', async ({ page }) => {
        const related = await relatedOfBtn(page)
        const interfaces = related.find(g => g.kind === 'interface')

        expect(interfaces?.entries.length ?? 0).toBeGreaterThan(LIMIT)

        const total = interfaces!.entries.length
        const list = page.locator('[data-cy="catalog-related-list-interface"]')
        const toggle = page.locator('[data-cy="catalog-related-toggle-interface"]')

        await expect(toggle).toHaveText(`Show all ${total}`)
        await expect(toggle).toHaveAttribute('aria-expanded', 'false')
        await expect(toggle).toHaveAttribute('aria-controls', await list.getAttribute('id') ?? '__missing')
        await expect(list.locator(':scope > li:visible')).toHaveCount(LIMIT)
        await expect(list.locator('[data-cy^="catalog-related-link-"]')).toHaveCount(total)

        const hidden = list.locator(`[data-cy="catalog-related-link-interface-${interfaces!.entries[LIMIT].slug}"]`)

        await expect(hidden).toBeAttached()
        await expect(hidden).toBeHidden()

        await expandOnce(toggle)
        await expect(list.locator(':scope > li:visible')).toHaveCount(total)
        await expect(hidden).toBeVisible()
        await expect(toggle).toHaveText('Show fewer')

        await toggle.click()
        await expect(toggle).toHaveAttribute('aria-expanded', 'false')
        await expect(list.locator(':scope > li:visible')).toHaveCount(LIMIT)

        for (const group of related.filter(g => g.entries.length <= LIMIT)) {
            await expect(page.locator(`[data-cy="catalog-related-toggle-${group.kind}"]`)).toHaveCount(0)
            await expect(page.locator(`[data-cy="catalog-related-list-${group.kind}"] > li:visible`)).toHaveCount(group.entries.length)
        }
    })

    test('clavier : Tab atteint le bouton après le dernier lien montré, Entrée et Espace le basculent', async ({ page }) => {
        const toggle = page.locator('[data-cy="catalog-related-toggle-interface"]')
        const lastShown = page.locator('[data-cy="catalog-related-list-interface"] > li:visible').last().locator('a')

        await expandOnce(toggle)
        await toggle.click()
        await expect(toggle).toHaveAttribute('aria-expanded', 'false')

        await lastShown.focus()
        await page.keyboard.press('Tab')
        await expect(toggle).toBeFocused()

        await page.keyboard.press('Enter')
        await expect(toggle).toHaveAttribute('aria-expanded', 'true')
        await expect(toggle).toBeFocused()

        await page.keyboard.press(' ')
        await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    })

    test('390 px : aucun défilement horizontal, et axe A/AA à 0 sur la section', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 900 })
        await page.reload({ waitUntil: 'load' })
        await expect(page.locator('[data-cy="catalog-related"]')).toBeVisible()

        // Mesuré sur la SECTION, pas sur la page : pendant son chargement, l'aperçu
        // live du haut de la fiche déborde de quelques pixels, hors périmètre ici.
        const overflowing = await page.locator('[data-cy="catalog-related"]').evaluate((section) => {
            const limit = document.documentElement.clientWidth

            return [section, ...section.querySelectorAll('*')]
                .filter(el => el.getBoundingClientRect().right > limit + 0.5)
                .map(el => el.getAttribute('data-cy') ?? el.tagName)
        })

        expect(overflowing).toEqual([])

        const results = await new AxeBuilder({ page })
            .include('[data-cy="catalog-related"]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze()

        expect(results.violations.map(v => `${v.id} (${v.nodes.length})`)).toEqual([])
    })
})
