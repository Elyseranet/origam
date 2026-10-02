/**
 * marketing-nav-rail.spec.ts — le rail de navigation du catalogue (#1032).
 *
 * ⛔ Ce qui est épinglé ici a été trouvé AU NAVIGATEUR, pas à la relecture.
 * Chaque `describe` correspond à un défaut réel mesuré pendant le lot : les
 * assertions existent parce qu'elles ont été rouges une fois.
 *
 * ⚠️ Ces specs visent le site MARKETING, pas Histoire. Elles demandent donc un
 * serveur Nuxt et sont ignorées quand `E2E_MARKETING_URL` n'est pas fourni —
 * plutôt que d'échouer bruyamment dans une suite qui ne le monte pas :
 *
 *     E2E_MARKETING_URL=http://localhost:3042 \
 *       pnpm -F @origam/tests exec playwright test e2e/marketing-nav-rail.spec.ts \
 *       --project=chromium
 */

import { expect, test } from '@playwright/test'

const BASE = process.env.E2E_MARKETING_URL ?? ''
const DETAIL = '/components/btn'

/** Les trois paliers, aux seuils mesurés de `useDisplay` (xs:0 sm:600 md:960). */
const TIERS = [
    { name: 'rail', width: 1280, trigger: '[data-cy="rail-family-component"]' },
    { name: 'drawer', width: 800, trigger: '[data-cy="rail-family-component"]' },
    { name: 'sheet', width: 400, trigger: '[data-cy="quick-rail-fab"]' },
] as const

/** Plus petite cible tactile admise, en px (WCAG 2.5.8 / 2.5.5). */
const MIN_TARGET = 44

test.describe('Rail de navigation du catalogue (#1032)', () => {
    test.skip(!BASE, 'E2E_MARKETING_URL non fourni — le site marketing n’est pas monté')

    test.beforeEach(async ({ context }) => {
        /*
         * ⛔ Le thème s'injecte par COOKIE avant chargement, jamais en cliquant
         * dans l'app bar : une sonde qui clique traverse le bouton de mode et
         * mesure l'identité OPPOSÉE, avec des chiffres plausibles.
         */
        await context.addCookies([
            { name: 'origam-theme', value: 'glass', url: BASE },
            { name: 'origam-mode', value: 'light', url: BASE },
        ])
    })

    for (const tier of TIERS) {
        test.describe(`palier ${tier.name} (${tier.width}px)`, () => {
            test.use({ viewport: { width: tier.width, height: 900 } })

            test('aucune référence aria-controls morte, panneau fermé', async ({ page }) => {
                await page.goto(`${BASE}${DETAIL}`, { waitUntil: 'networkidle' })

                /*
                 * Le tiroir des deux petits paliers est TÉLÉPORTÉ et absent du
                 * DOM tant qu'il est fermé : un `aria-controls` statique y
                 * désignait un identifiant inexistant (9 références mortes
                 * mesurées). Il n'est donc émis que panneau ouvert.
                 */
                const dangling = await page.evaluate(() => {
                    const out: string[] = []

                    for (const el of document.querySelectorAll('[aria-controls]')) {
                        const ids = (el.getAttribute('aria-controls') ?? '').split(/\s+/).filter(Boolean)

                        for (const id of ids) {
                            if (!document.getElementById(id)) out.push(id)
                        }
                    }

                    return out
                })

                expect(dangling).toEqual([])
            })

            test('le catalogue n’est PAS chargé au boot, et l’est à l’ouverture', async ({ page }) => {
                /*
                 * L'arbitrage du propriétaire : chargement paresseux par
                 * famille. Charger les 8 familles coûterait 986 Ko (mesuré) ;
                 * les pastilles viennent de /api/reference/counts, 644 octets.
                 */
                const catalogue: string[] = []

                page.on('request', r => {
                    const u = new URL(r.url()).pathname

                    if (/^\/api\/reference\/[a-z]+$/.test(u) && u !== '/api/reference/counts') {
                        catalogue.push(u)
                    }
                })

                await page.goto(`${BASE}${DETAIL}`, { waitUntil: 'networkidle' })
                await page.waitForTimeout(1200)

                expect(catalogue, 'aucune famille chargée avant ouverture').toEqual([])

                await page.click(tier.trigger)
                await page.waitForSelector('[data-cy^="rail-item-"]')

                expect(catalogue).toEqual(['/api/reference/component'])
            })

            test('chaque cible fait au moins 44x44 et porte un nom accessible', async ({ page }) => {
                await page.goto(`${BASE}${DETAIL}`, { waitUntil: 'networkidle' })
                await page.waitForTimeout(1200)

                const targets = await page.evaluate(() => {
                    const sel = '[data-cy^="rail-family-"],[data-cy="rail-pages"],'
                        + '[data-cy="rail-search"],[data-cy="quick-rail-fab"]'

                    return [...document.querySelectorAll(sel)].map(el => {
                        const b = el.getBoundingClientRect()

                        return {
                            cy: el.getAttribute('data-cy'),
                            w: Math.round(b.width),
                            h: Math.round(b.height),
                            name: el.getAttribute('aria-label') ?? '',
                        }
                    })
                })

                expect(targets.length).toBeGreaterThan(0)

                for (const t of targets) {
                    expect(t.w, `${t.cy} largeur`).toBeGreaterThanOrEqual(MIN_TARGET)
                    expect(t.h, `${t.cy} hauteur`).toBeGreaterThanOrEqual(MIN_TARGET)
                    expect(t.name, `${t.cy} nom accessible`).not.toBe('')
                }
            })

            test('ouverture : le panneau est nommé, non modal, et les entrées sont de vraies ancres', async ({ page }) => {
                await page.goto(`${BASE}${DETAIL}`, { waitUntil: 'networkidle' })
                await page.waitForTimeout(1200)
                await page.click(tier.trigger)
                await page.waitForSelector('[data-cy^="rail-item-"]')

                const state = await page.evaluate(() => {
                    const panel = document.querySelector('#nav-rail-panel')
                    const first = document.querySelector('[data-cy^="rail-item-"]')
                    const labelId = panel?.getAttribute('aria-labelledby') ?? ''

                    return {
                        labelResolves: !!document.getElementById(labelId),
                        ariaModal: panel?.getAttribute('aria-modal'),
                        tag: first?.tagName.toLowerCase(),
                        href: first?.getAttribute('href'),
                        tabindex: first?.getAttribute('tabindex'),
                    }
                })

                expect(state.labelResolves, 'le panneau a un nom accessible qui résout').toBe(true)

                /*
                 * Arbitrage du propriétaire : panneau de DIVULGATION labellé,
                 * jamais `aria-modal`. Aucun composant Origam n'offre de piège
                 * à focus, et un faux `aria-modal` annonce aux lecteurs
                 * d'écran un confinement qui n'existe pas.
                 */
                expect(state.ariaModal).toBeNull()

                /*
                 * Les entrées restent des ancres — clic milieu, ouvrir dans un
                 * nouvel onglet — tout en étant hors du parcours de tabulation
                 * (`OrigamListItem` pose `tabindex="-2"` dans une liste). Sans
                 * ça, le panneau des interfaces ajouterait 972 arrêts.
                 */
                expect(state.tag).toBe('a')
                expect(state.href).toBeTruthy()
                expect(Number(state.tabindex)).toBeLessThan(0)
            })

            test('clavier : ↓ déplace le focus sur une entrée, ⎋ ferme et rend le focus', async ({ page }) => {
                await page.goto(`${BASE}${DETAIL}`, { waitUntil: 'networkidle' })
                await page.waitForTimeout(1200)
                await page.click(tier.trigger)
                await page.waitForSelector('[data-cy^="rail-item-"]')

                await page.keyboard.press('ArrowDown')

                const focused = await page.evaluate(() => ({
                    tag: document.activeElement?.tagName.toLowerCase(),
                    cy: document.activeElement?.getAttribute('data-cy'),
                }))

                expect(focused.tag, '↓ donne le focus réel à une ancre').toBe('a')
                expect(focused.cy ?? '').toMatch(/^rail-item-/)

                await page.keyboard.press('Escape')
                await page.waitForTimeout(400)

                const afterEscape = await page.evaluate(() => {
                    const panel = document.querySelector('#nav-rail-panel')

                    return {
                        closed: !panel || panel.hasAttribute('hidden'),
                        focusCy: document.activeElement?.getAttribute('data-cy'),
                    }
                })

                expect(afterEscape.closed, '⎋ ferme le panneau').toBe(true)
                expect(afterEscape.focusCy, '⎋ rend le focus au déclencheur')
                    .toBe(tier.trigger.replace(/\[data-cy="(.+)"\]/, '$1'))
            })
        })
    }

    test('la nav principale cède la place au rail sous 600px', async ({ page }) => {
        /*
         * Mesuré à 400px : `.primary-nav` s'étendait jusqu'à right=506 dans un
         * viewport de 400 et était CLIPPÉE par `origam-toolbar`
         * (`--origam-toolbar---overflow: hidden`, light.css:772). Elle ne
         * faisait donc pas défiler la page — elle laissait TROIS commandes hors
         * écran tout en les gardant dans la tabulation. `display: none` les en
         * sort aussi.
         */
        await page.setViewportSize({ width: 400, height: 900 })
        await page.goto(`${BASE}${DETAIL}`, { waitUntil: 'networkidle' })
        await page.waitForTimeout(1200)

        await expect(page.locator('.primary-nav')).toBeHidden()
        await expect(page.locator('[data-cy="quick-rail-fab"]')).toBeVisible()
        await expect(page.locator('[data-cy="quick-rail"]')).toHaveCount(0)
    })

    test('aucun défilement horizontal à 400px sur les pages du catalogue', async ({ page }) => {
        await page.setViewportSize({ width: 400, height: 900 })

        for (const route of ['/', '/components', '/interfaces', '/roadmap']) {
            await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
            await page.waitForTimeout(900)

            const overflow = await page.evaluate(() => {
                const de = document.documentElement

                return de.scrollWidth - de.clientWidth
            })

            expect(overflow, `${route} déborde horizontalement`).toBeLessThanOrEqual(1)
        }
    })

    test('les animations sont neutralisées sous prefers-reduced-motion', async ({ page }) => {
        /*
         * Règle du propriétaire (2026-10-02) : animations en CSS uniquement, et
         * toutes désactivées sous mouvement réduit.
         */
        await page.setViewportSize({ width: 1280, height: 900 })
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.goto(`${BASE}${DETAIL}`, { waitUntil: 'networkidle' })
        await page.waitForTimeout(1200)
        await page.click('[data-cy="rail-family-component"]')
        await page.waitForSelector('[data-cy^="rail-item-"]')

        const duration = await page.evaluate(() => {
            const panel = document.querySelector('#nav-rail-panel')

            return panel ? getComputedStyle(panel).transitionDuration : null
        })

        // 0.01ms — la valeur conventionnelle du dépôt pour « pas d'animation ».
        expect(parseFloat(duration ?? '1')).toBeLessThan(0.001)
    })
})
