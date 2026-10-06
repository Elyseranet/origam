/**
 * marketing-nav-rail.spec.ts — le rail de navigation du catalogue (#1032).
 *
 * ⛔ Ce qui est épinglé ici a été trouvé AU NAVIGATEUR, pas à la relecture.
 * Chaque `describe` correspond à un défaut réel mesuré pendant le lot : les
 * assertions existent parce qu'elles ont été rouges une fois. Les sept
 * défauts, dans l'ordre où ils sont gardés plus bas :
 *
 *   1. deux cibles rendues 42 px de large (le minimum tactile est 44) ;
 *   2. NEUF références `aria-controls` mortes — le tiroir des petits paliers
 *      est TÉLÉPORTÉ et absent du DOM tant qu'il est fermé, donc chaque
 *      cible du rail désignait un identifiant inexistant ;
 *   3. `aria-labelledby` n'atteignait jamais le DOM : la clé était écrite
 *      `ariaLabelledby` dans un objet passé en `v-bind`, et Vue ne
 *      kebab-case que les props déclarées, pas un attribut arbitraire ;
 *   4. le focus n'entrait jamais dans le panneau — le champ de filtre n'est
 *      rendu qu'une fois le catalogue arrivé, alors que le focus était
 *      demandé juste après le clic ;
 *   5. et 6. ⎋ ne fermait pas, ↑/↓ ne déplaçaient rien : MÊME racine que 4,
 *      plus le fait que le déclencheur est hors du panneau ;
 *   7. le panneau fermé restait peint — `[hidden]` pose `display: none` à
 *      (0,1,0), que la règle `display: flex` du panneau battait.
 *
 * ── Pourquoi ce fichier vit dans la config MARKETING ────────────────────
 *
 * ⛔ Il vise le site Nuxt, jamais Histoire. Il doit donc figurer dans DEUX
 * listes, et l'oubli de la première est un piège documenté
 * (`e2e/_support/marketing-specs.const.ts`) :
 *
 *   - `MARKETING_SPEC_PATTERNS` — sert de `testMatch` à la config marketing
 *     ET de `testIgnore` à la config Histoire. Sans l'entrée, un run local
 *     complet lance ce fichier contre la baseURL d'Histoire, où `.primary-nav`
 *     et `#nav-rail-panel` n'existent pas : tous les cas expirent à
 *     l'identique, ce qui ressemble à un défaut produit et n'en est pas un.
 *   - `MARKETING_GREEN_SPECS` — ce que la CI exécute réellement.
 *
 * ⛔ Et il ne lit AUCUNE variable d'environnement à lui : les URL sont
 * relatives, donc résolues contre le `baseURL` de la config. Une version
 * antérieure se `skip`ait d'elle-même sans `E2E_MARKETING_URL` — en CI, où
 * cette variable n'existe pas, elle aurait été VERTE sans rien exécuter.
 * Un spec qui se saute est indiscernable d'un spec qui passe.
 */

import { expect, test } from '@playwright/test'

/** Page de détail : la seule où le rail connaît sa famille ET son entrée. */
const DETAIL = '/components/btn'

/** Les trois paliers, aux seuils mesurés de `useDisplay` (xs:0 sm:600 md:960). */
const TIERS = [
    { name: 'rail', width: 1280, trigger: 'rail-family-component' },
    { name: 'drawer', width: 800, trigger: 'rail-family-component' },
    { name: 'sheet', width: 400, trigger: 'quick-rail-fab' },
] as const

/** Plus petite cible tactile admise, en px (WCAG 2.5.8 / 2.5.5). */
const MIN_TARGET = 44

test.describe('Rail de navigation du catalogue (#1032)', () => {
    test.beforeEach(async ({ context, baseURL }) => {
        /*
         * ⛔ Le thème s'injecte par COOKIE avant chargement, jamais en
         * cliquant dans l'app bar : `.appbar-actions` tient le bouton de mode
         * à côté des déclencheurs de menu, donc une sonde qui clique le
         * traverse et mesure l'identité OPPOSÉE, avec des chiffres plausibles.
         */
        await context.addCookies([
            { name: 'origam-theme', value: 'glass', url: baseURL! },
            { name: 'origam-mode', value: 'light', url: baseURL! },
        ])
    })

    for (const tier of TIERS) {
        test.describe(`palier ${tier.name} (${tier.width}px)`, () => {
            test.use({ viewport: { width: tier.width, height: 900 } })

            test('aucune référence aria-controls morte, panneau fermé', async ({ page }) => {
                await page.goto(DETAIL, { waitUntil: 'networkidle' })
                await page.waitForSelector('[data-cy="quick-rail"],[data-cy="quick-rail-fab"]')

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
                 * les pastilles viennent de `/api/reference/counts`, 644
                 * octets. C'est ce que cette assertion garde, et elle le fait
                 * par interception RÉSEAU — la seule preuve qu'un appel n'a
                 * pas eu lieu.
                 */
                const catalogue: string[] = []

                page.on('request', r => {
                    const u = new URL(r.url()).pathname

                    if (/^\/api\/reference\/[a-z]+$/.test(u) && u !== '/api/reference/counts') {
                        catalogue.push(u)
                    }
                })

                await page.goto(DETAIL, { waitUntil: 'networkidle' })
                await page.waitForSelector(`[data-cy="${tier.trigger}"]`)

                expect(catalogue, 'aucune famille chargée avant ouverture').toEqual([])

                await page.click(`[data-cy="${tier.trigger}"]`)
                await page.waitForSelector('[data-cy^="rail-item-"]')

                expect(catalogue).toEqual(['/api/reference/component'])
            })

            test('chaque cible fait au moins 44x44 et porte un nom accessible', async ({ page }) => {
                await page.goto(DETAIL, { waitUntil: 'networkidle' })
                await page.waitForSelector(`[data-cy="${tier.trigger}"]`)

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

            test('ouverture : panneau nommé, non modal, entrées = vraies ancres', async ({ page }) => {
                await page.goto(DETAIL, { waitUntil: 'networkidle' })
                await page.waitForSelector(`[data-cy="${tier.trigger}"]`)
                await page.click(`[data-cy="${tier.trigger}"]`)
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
                await page.goto(DETAIL, { waitUntil: 'networkidle' })
                await page.waitForSelector(`[data-cy="${tier.trigger}"]`)
                await page.click(`[data-cy="${tier.trigger}"]`)
                await page.waitForSelector('[data-cy^="rail-item-"]')

                await page.keyboard.press('ArrowDown')

                await expect.poll(
                    () => page.evaluate(() => document.activeElement?.tagName.toLowerCase()),
                    { message: '↓ donne le focus réel à une ancre' }
                ).toBe('a')

                const focusedCy = await page.evaluate(
                    () => document.activeElement?.getAttribute('data-cy') ?? ''
                )

                expect(focusedCy).toMatch(/^rail-item-/)

                await page.keyboard.press('Escape')

                await expect.poll(
                    () => page.evaluate(() => {
                        const panel = document.querySelector('#nav-rail-panel')

                        return !panel || panel.hasAttribute('hidden')
                    }),
                    { message: '⎋ ferme le panneau' }
                ).toBe(true)

                const restored = await page.evaluate(
                    () => document.activeElement?.getAttribute('data-cy') ?? ''
                )

                expect(restored, '⎋ rend le focus au déclencheur').toBe(tier.trigger)
            })
        })
    }

    test('la nav principale cède la place au rail sous 600px', async ({ page }) => {
        /*
         * Mesuré à 400 px : `.primary-nav` s'étendait jusqu'à right=506 dans
         * un viewport de 400 et était CLIPPÉE par `origam-toolbar`
         * (`--origam-toolbar---overflow: hidden`, `light.css:772`, appliqué
         * par `OrigamToolbar.vue:280` — la propriété est la forme COURTE et la
         * valeur vient d'un token, donc un grep de `overflow-x` ou d'un
         * `hidden` littéral dans le composant ne rend RIEN).
         *
         * Elle ne faisait donc pas défiler la page : elle laissait TROIS
         * commandes hors écran tout en les gardant dans la tabulation.
         * `display: none` les en sort aussi.
         */
        await page.setViewportSize({ width: 400, height: 900 })
        await page.goto(DETAIL, { waitUntil: 'networkidle' })
        await page.waitForSelector('[data-cy="quick-rail-fab"]')

        await expect(page.locator('.primary-nav')).toBeHidden()
        await expect(page.locator('[data-cy="quick-rail-fab"]')).toBeVisible()
        await expect(page.locator('[data-cy="quick-rail"]')).toHaveCount(0)
    })

    test('aucun défilement horizontal à 400px', async ({ page }) => {
        /*
         * Le critère du lot #1032. Les trois causes mesurées n'étaient PAS la
         * navigation : la grille à 4 colonnes du pied de page (11 px sur 17
         * pages), un `flex-wrap` resté à `nowrap` sur le titre du showcase
         * (54 px sur `/`), et un chip portant une phrase entière contre
         * `white-space: nowrap` (6 px sur `/roadmap`).
         */
        await page.setViewportSize({ width: 400, height: 900 })

        for (const route of ['/', '/components', '/interfaces', '/roadmap']) {
            await page.goto(route, { waitUntil: 'networkidle' })
            await page.waitForSelector('[data-cy="quick-rail-fab"]')

            const overflow = await page.evaluate(() => {
                const de = document.documentElement

                return de.scrollWidth - de.clientWidth
            })

            expect(overflow, `${route} déborde horizontalement`).toBeLessThanOrEqual(1)
        }
    })

    test('les animations sont neutralisées sous prefers-reduced-motion', async ({ page }) => {
        /*
         * Règle du propriétaire (2026-10-02) : animations en CSS uniquement,
         * aucun timer JS pilotant du visuel, et toutes désactivées sous
         * mouvement réduit. 0,01 ms est la valeur conventionnelle du dépôt
         * pour « pas d'animation ».
         */
        await page.setViewportSize({ width: 1280, height: 900 })
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.goto(DETAIL, { waitUntil: 'networkidle' })
        await page.waitForSelector('[data-cy="rail-family-component"]')
        await page.click('[data-cy="rail-family-component"]')
        await page.waitForSelector('[data-cy^="rail-item-"]')

        const duration = await page.evaluate(() => {
            const panel = document.querySelector('#nav-rail-panel')

            return panel ? getComputedStyle(panel).transitionDuration : null
        })

        expect(parseFloat(duration ?? '1')).toBeLessThan(0.001)
    })
})
