/**
 * marketing-catalog-detail-nav.spec.ts — la navigation des fiches de détail du
 * catalogue (#1032) : encart « même sujet », précédent / suivant, fil d'Ariane
 * à menu de famille.
 *
 * ⛔ Ce fichier vise le site Nuxt (`baseURL` de la config marketing), jamais
 * Histoire — il figure donc dans `MARKETING_SPEC_PATTERNS` ET dans la liste
 * verte (cf. `e2e/_support/marketing-specs.const.ts`). Il lit la base : sans
 * Postgres semé, `/api/reference/**` répond 503.
 *
 * ── Ce qui est épinglé, et pourquoi ─────────────────────────────────────
 *  1. prev / next == l'ordre de l'INDEX, pour les 2 654 entrées des 8
 *     familles. L'ordre est recalculé ICI depuis les mêmes routes publiques
 *     que lit chaque page d'index (catalogue + catégories), de façon
 *     indépendante du code serveur testé.
 *  2. L'encart ne lit que des relations stockées, dans les deux sens, et
 *     ignore le bruit `extends`.
 *  3. Un nom de relation de constante (`OrigamBtn`) se résout vers `btn`
 *     par le NOM DE FICHIER SOURCE — et ne devine jamais.
 *  4. Le menu de famille se pilote au clavier.
 *  5. 390 px : sélecteur de famille et ← / → visibles en texte, aucun
 *     débordement horizontal, aucun élément flottant venant de ces blocs.
 */

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const KINDS = ['component', 'composable', 'directive', 'enum', 'interface', 'type', 'util', 'const'] as const

interface ICatalogRow { slug: string; parentSlug?: string | null; category?: string; domain?: string }
interface INeighbours {
    prev: { slug: string; name: string } | null
    next: { slug: string; name: string } | null
    related: Array<{ kind: string; entries: Array<{ slug: string; name: string }> }>
}

/**
 * L'ordre que la page d'index AFFICHE — réécrit depuis les index.vue :
 * composable groupé par `domain` trié en JS, directive à plat, les autres
 * groupés par les catégories de l'API.
 */
function indexOrder (kind: string, catalog: ICatalogRow[], categories: string[]): string[] {
    if (kind === 'directive') return catalog.map(e => e.slug)

    if (kind === 'composable') {
        const domains = [...new Set(catalog.map(e => e.domain))].sort()

        return domains.flatMap(d => catalog.filter(e => e.domain === d).map(e => e.slug))
    }

    const top = catalog.filter(e => !e.parentSlug)

    return categories.flatMap(c => top.filter(e => e.category === c).map(e => e.slug))
}

test.describe('Navigation des fiches de détail (#1032)', () => {
    test.describe('ordre prev / next == ordre de l’index', () => {
        for (const kind of KINDS) {
            test(`famille ${kind}`, async ({ request }) => {
                const catalog: ICatalogRow[] = await (await request.get(`/api/reference/${kind}`)).json()
                const categories: string[] = await (await request.get(`/api/reference/categories/${kind}`)).json()
                const order = indexOrder(kind, catalog, categories)

                expect(order.length).toBeGreaterThan(0)

                const wrong: string[] = []

                for (const [i, slug] of order.entries()) {
                    // Un slug qui commence par « - » (`-t-not-a-union`) est refusé par `assertSlug` — il n'a pas de fiche.
                    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) continue

                    const res = await request.get(`/api/reference/neighbours/${kind}/${slug}`)
                    const body: INeighbours = await res.json()
                    const want = [order[i - 1] ?? null, order[i + 1] ?? null]
                    const got = [body.prev?.slug ?? null, body.next?.slug ?? null]

                    if (got[0] !== want[0] || got[1] !== want[1]) wrong.push(`${slug}: got ${got} want ${want}`)
                }

                expect(wrong).toEqual([])
            })
        }

        test('un sous-composant a pour voisins ses frères, jamais un composant principal', async ({ request }) => {
            const body: INeighbours = await (await request.get('/api/reference/neighbours/component/bracket-match')).json()

            // Ordre des relations `family` du parent : round, match, competitor.
            expect(body.prev?.slug).toBe('bracket-round')
            expect(body.next?.slug).toBe('bracket-competitor')

            const catalog: ICatalogRow[] = await (await request.get('/api/reference/component')).json()
            const subs = new Set(catalog.filter(e => e.parentSlug).map(e => e.slug))

            const main: INeighbours = await (await request.get('/api/reference/neighbours/component/btn')).json()

            expect(subs.has(main.prev?.slug ?? '')).toBe(false)
            expect(subs.has(main.next?.slug ?? '')).toBe(false)
        })
    })

    test.describe('encart « même sujet » — relations stockées, dans les deux sens', () => {
        test('composant : lecture inverse des interfaces, types, enums, directives', async ({ request }) => {
            const body: INeighbours = await (await request.get('/api/reference/neighbours/component/btn')).json()
            const kinds = body.related.map(g => g.kind)

            for (const kind of ['interface', 'type', 'enum', 'directive', 'const']) expect(kinds).toContain(kind)

            expect(body.related.find(g => g.kind === 'interface')?.entries.map(e => e.slug)).toContain('i-btn-props')
            expect(body.related.find(g => g.kind === 'directive')?.entries.map(e => e.slug)).toContain('ripple')
        })

        test('interface : sens direct, vers les composants qu’elle sert, sans bruit extends', async ({ request }) => {
            const body: INeighbours = await (await request.get('/api/reference/neighbours/interface/i-btn-props')).json()

            expect(body.related.map(g => g.kind)).toEqual(['component'])
            expect(body.related[0].entries.map(e => e.slug)).toContain('btn')
        })

        test('constante : le nom de relation OrigamBtn se résout vers `btn` ; un nom non résoluble est écarté', async ({ request }) => {
            const body: INeighbours = await (await request.get('/api/reference/neighbours/const/delay-ripple')).json()

            expect(body.related.find(g => g.kind === 'component')?.entries.map(e => e.slug)).toContain('btn')

            // Aucun groupe ne contient d'entrée sans slug : pas de lien deviné.
            for (const group of body.related) {
                for (const entry of group.entries) expect(entry.slug).toMatch(/^[a-z0-9-]+$/)
            }
        })

        test('util : aucune relation inter-familles, donc aucun encart', async ({ request }) => {
            const body: INeighbours = await (await request.get('/api/reference/neighbours/util/date')).json()

            expect(body.related).toEqual([])
        })

        test('slug inconnu : 404, pas de 500', async ({ request }) => {
            const res = await request.get('/api/reference/neighbours/component/zzz-inconnu')

            expect(res.status()).toBe(404)
        })
    })

    test.describe('page /components/btn', () => {
        test('l’encart porte les liens justes, et ils mènent à la fiche', async ({ page }) => {
            await page.goto('/components/btn', { waitUntil: 'networkidle' })

            const link = page.locator('[data-cy="catalog-related-link-interface-i-btn-props"]')

            await expect(page.locator('[data-cy="catalog-related"]')).toBeVisible()
            await expect(link).toHaveAttribute('href', '/interfaces/i-btn-props')
            await expect(page.locator('[data-cy="catalog-related-link-directive-ripple"]')).toHaveAttribute('href', '/directives/ripple')

            await link.click()
            await expect(page).toHaveURL(/\/interfaces\/i-btn-props$/)
            await expect(page.locator('[data-cy="catalog-related-link-component-btn"]')).toHaveAttribute('href', '/components/btn')
        })

        test('précédent / suivant suivent l’index et se répondent', async ({ page }) => {
            await page.goto('/components/btn', { waitUntil: 'networkidle' })

            const next = page.locator('[data-cy="catalog-next"]')
            const prev = page.locator('[data-cy="catalog-prev"]')

            await expect(prev).toHaveAttribute('href', '/components/snackbar')
            await expect(next).toHaveAttribute('href', '/components/checkbox')
            await expect(next).toHaveAttribute('rel', 'next')

            await next.click()
            await expect(page).toHaveURL(/\/components\/checkbox$/)
            await expect(page.locator('[data-cy="catalog-prev"]')).toHaveAttribute('href', '/components/btn')
        })

        test('sous-composant : frères, et fil d’Ariane à trois maillons', async ({ page }) => {
            await page.goto('/components/bracket-match', { waitUntil: 'networkidle' })

            await expect(page.locator('[data-cy="catalog-prev"]')).toHaveAttribute('href', '/components/bracket-round')
            await expect(page.locator('[data-cy="catalog-next"]')).toHaveAttribute('href', '/components/bracket-competitor')
            await expect(page.locator('[data-cy="component-breadcrumb-parent-bracket"]')).toHaveAttribute('href', '/components/bracket')
        })
    })

    test('OrigamBreadcrumbItem : le href RENDU est une chaîne de chemin, jamais « [object Object] »', async ({ page }) => {
        await page.goto('/components/bracket-match', { waitUntil: 'networkidle' })

        const rendered = await page.locator('.catalog-breadcrumb a[href]').evaluateAll(els => els.map(el => el.getAttribute('href')))

        expect(rendered.length).toBeGreaterThan(0)

        for (const href of rendered) {
            expect(href).not.toContain('object')
            expect(href).toMatch(/^\//)
        }
    })

    test('fiche sans voisin ni relation : aucun bloc vide', async ({ page }) => {
        await page.goto('/utils/date', { waitUntil: 'networkidle' })

        await expect(page.locator('[data-cy="catalog-related"]')).toHaveCount(0)
        await expect(page.locator('[data-cy="catalog-prev-next"]')).toBeVisible()
    })

    test.describe('menu de famille du fil d’Ariane', () => {
        test('se pilote au clavier et mène à une autre famille', async ({ page }) => {
            await page.goto('/components/btn', { waitUntil: 'networkidle' })

            const trigger = page.locator('[data-cy="component-breadcrumb-catalog"]')

            await trigger.focus()
            await page.keyboard.press('Enter')

            const items = page.locator('[data-cy^="breadcrumb-family-"]')

            await expect(items).toHaveCount(8)
            await expect(page.locator('[data-cy="breadcrumb-family-type"]')).toHaveText(/Types/)
            await expect(page.locator('[data-cy="breadcrumb-family-type"]')).toHaveAttribute('href', '/types')

            // Échap referme et rend le focus au déclencheur.
            await page.keyboard.press('Escape')
            await expect(items.first()).toBeHidden()
            await expect(trigger).toBeFocused()

            // Entrée sur le déclencheur, puis navigation aux flèches jusqu'à « Types ».
            await page.keyboard.press('Enter')
            await expect(items.first()).toBeVisible()

            for (let i = 0; i < 12; i++) {
                const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-cy') ?? '')

                if (focused === 'breadcrumb-family-type') break

                await page.keyboard.press('ArrowDown')
            }

            await expect(page.locator('[data-cy="breadcrumb-family-type"]')).toBeFocused()
            await page.keyboard.press('Enter')
            await expect(page).toHaveURL(/\/types$/)
        })
    })

    test.describe('mobile 390 px', () => {
        test.use({ viewport: { width: 390, height: 844 } })

        for (const path of ['/components/btn', '/interfaces/i-btn-props']) {
            test(`${path} : sélecteur de famille et ← / → en texte, sans défilement horizontal`, async ({ page }) => {
                await page.goto(path, { waitUntil: 'networkidle' })

                const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

                expect(overflow).toBe(0)

                const trigger = page.locator('[data-cy$="-breadcrumb-catalog"]')

                await expect(trigger).toBeVisible()
                expect((await trigger.innerText()).trim().length).toBeGreaterThan(2)

                const bar = page.locator('[data-cy="catalog-prev-next"]')

                await bar.scrollIntoViewIfNeeded()
                await expect(bar).toBeVisible()

                for (const cy of ['catalog-prev', 'catalog-next']) {
                    const btn = page.locator(`[data-cy="${cy}"]`)

                    await expect(btn).toBeVisible()
                    expect((await btn.innerText()).trim().length).toBeGreaterThan(4)
                }

                // Aucun de nos blocs n'est flottant : pas de bouton fixe.
                const fixed = await page.evaluate(() => {
                    const hosts = document.querySelectorAll('[data-cy="catalog-prev-next"] *, [data-cy="catalog-related"] *, .catalog-breadcrumb *')

                    return [...hosts].filter(el => getComputedStyle(el).position === 'fixed').length
                })

                expect(fixed).toBe(0)
            })
        }
    })

    test.describe('accessibilité (axe, périmètre des blocs ajoutés)', () => {
        for (const path of ['/components/btn', '/interfaces/i-btn-props', '/components/bracket-match']) {
            test(`${path} : 0 violation`, async ({ page }) => {
                await page.goto(path, { waitUntil: 'networkidle' })
                await page.locator('[data-cy="catalog-prev-next"]').scrollIntoViewIfNeeded()

                const results = await new AxeBuilder({ page })
                    .include('.catalog-breadcrumb')
                    .include('[data-cy="catalog-related"]')
                    .include('[data-cy="catalog-prev-next"]')
                    .analyze()

                expect(results.violations.map(v => `${v.id}: ${v.nodes.length}`)).toEqual([])
            })
        }
    })
})
