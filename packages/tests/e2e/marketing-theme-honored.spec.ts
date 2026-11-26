/**
 * Le thème servi par le serveur est-il encore là après hydratation, et le
 * cookie de marque d'un ancien visiteur est-il ignoré ? (#835, #1515)
 *
 * ## Contrat (#1515, décision propriétaire 2026-11-26)
 *
 * Le site n'a plus de sélecteur de thème de marque : il rend TOUJOURS `origam`.
 * Un ancien visiteur dont le cookie `origam-theme` vaut `cartoon` (ou tout autre
 * thème) voit `origam`, rechargement compris. Le cookie de MODE reste honoré,
 * et le bouton clair / sombre reste.
 *
 * ## Le défaut #835 que ce fichier garde toujours
 *
 * `app.head.htmlAttrs` portait `data-theme` / `data-mode` en dur ; unhead
 * réécrivait `<html>` ~1,3 s après l'hydratation, par-dessus ce que le serveur
 * avait rendu — la marque ET le mode. Une lecture « après hydratation » ne
 * l'attrape pas (la réécriture arrive tard) : on enregistre CHAQUE écriture de
 * `data-theme` / `data-mode` sur une fenêtre d'observation, et on compare à ce
 * que le serveur a envoyé. Pour le mode, c'est le test « le mode choisi survit »
 * qui l'attrape (la valeur écrite par unhead et celle du serveur coïncident
 * sinon avec le défaut).
 *
 * Run :
 *   MARKETING_BASE_URL=http://localhost:3011 pnpm -F @origam/tests exec \
 *     playwright test --config=playwright.marketing.config.ts marketing-theme-honored
 */

import { expect, test, type Page, type Response } from '@playwright/test'

/** Les pages échantillonnées — une par famille de layout. */
const SAMPLED_PATHS = ['/', '/components', '/roadmap']

/** Le mode qu'un visiteur peut avoir choisi, et la marque d'un ancien choix. */
const PICKED_MODE = 'dark'
const STALE_BRAND_COOKIE = 'cartoon'

/**
 * L'apparence du site, toujours. Source de vérité : `origam.defaultTheme` dans
 * `packages/marketing/nuxt.config.ts`.
 */
const DEFAULT_BRAND = 'origam'

/**
 * #1103 — `defaultMode: 'auto'` : sans préférence stockée, le serveur n'épingle
 * AUCUN mode (pas de `data-mode` dans le HTML servi) et laisse le `@media
 * (prefers-color-scheme)` peindre ; le client épingle ensuite le mode système.
 * La spec fige le système en clair pour que ce mode soit déterministe.
 */
const DEFAULT_MODE_SERVED = null
const SYSTEM_MODE = 'light'

interface IThemeAttrs {
    theme: string | null
    mode: string | null
}

/** Ce que le serveur a réellement envoyé, lu dans les octets de la réponse. */
function servedAttrs (html: string): IThemeAttrs {
    const openingTag = html.match(/<html[^>]*>/)?.[0] ?? ''
    return {
        theme: openingTag.match(/data-theme="([^"]*)"/)?.[1] ?? null,
        mode: openingTag.match(/data-mode="([^"]*)"/)?.[1] ?? null
    }
}

/** Ce que porte `<html>` une fois la page hydratée et au repos. */
function hydratedAttrs (page: Page): Promise<IThemeAttrs> {
    return page.evaluate(() => ({
        theme: document.documentElement.getAttribute('data-theme'),
        mode: document.documentElement.getAttribute('data-mode')
    }))
}

/** Une écriture de `data-theme` / `data-mode` sur `<html>`, horodatée. */
interface IAttrWrite {
    at: number
    name: string
    value: string
}

/** Enregistre CHAQUE écriture de `data-theme` / `data-mode` sur `<html>`. */
async function recordAttrWrites (page: Page): Promise<void> {
    await page.addInitScript(() => {
        const store: IAttrWrite[] = []
        ;(window as unknown as { __origamAttrWrites: IAttrWrite[] }).__origamAttrWrites = store

        const el = document.documentElement
        if (!el) return

        const original = el.setAttribute.bind(el)
        el.setAttribute = (name: string, value: string) => {
            if (name === 'data-theme' || name === 'data-mode') {
                store.push({ at: Math.round(performance.now()), name, value })
            }
            return original(name, value)
        }
    })
}

/**
 * Durée pendant laquelle on SURVEILLE que rien ne change : la réécriture mesurée
 * tombe à +1,36 s, la fenêtre est prise à plus du double. Ce n'est pas un délai
 * posé pour faire passer un test instable — c'est une propriété de non-événement.
 */
const OBSERVATION_WINDOW_MS = 3_500

async function observeAfterHydration (page: Page): Promise<IAttrWrite[]> {
    await page.waitForFunction(
        () => Boolean((document.querySelector('#__nuxt') as unknown as { __vue_app__?: unknown } | null)?.__vue_app__),
        undefined,
        { timeout: 20_000 }
    )

    await page.waitForFunction(
        (deadline: number) => performance.now() >= deadline,
        OBSERVATION_WINDOW_MS,
        { timeout: OBSERVATION_WINDOW_MS + 15_000 }
    )

    return page.evaluate(() => (window as unknown as { __origamAttrWrites: IAttrWrite[] }).__origamAttrWrites ?? [])
}

async function readBothSides (page: Page, response: Response | null): Promise<{ served: IThemeAttrs, hydrated: IThemeAttrs, writes: IAttrWrite[] }> {
    expect(response, 'aucune réponse pour le document principal').not.toBeNull()

    const served = servedAttrs(await response!.text())
    const writes = await observeAfterHydration(page)

    return { served, hydrated: await hydratedAttrs(page), writes }
}

/** Les écritures qui s'écartent de ce que le serveur avait rendu. */
function divergentWrites (writes: IAttrWrite[], served: IThemeAttrs): IAttrWrite[] {
    return writes.filter(w => w.value !== (w.name === 'data-theme' ? served.theme : (served.mode ?? SYSTEM_MODE)))
}

test.describe('Thème marketing — toujours origam, le mode seul est au choix du visiteur', () => {

    for (const path of SAMPLED_PATHS) {
        test(`${path} — rend "${ DEFAULT_BRAND }", et rien ne le réécrit côté client`, async ({ page }) => {
            await page.emulateMedia({ colorScheme: SYSTEM_MODE })
            await recordAttrWrites(page)

            const response = await page.goto(path)
            const { served, hydrated, writes } = await readBothSides(page, response)

            expect(
                served.theme,
                `${path} : le site doit rendre "${ DEFAULT_BRAND }" (origam.defaultTheme dans nuxt.config.ts)`
            ).toBe(DEFAULT_BRAND)

            expect(
                served.mode,
                `${path} : sans préférence stockée, le serveur n'épingle aucun mode (#1103)`
            ).toBe(DEFAULT_MODE_SERVED)

            expect(
                divergentWrites(writes, served),
                `${path} : <html> a été réécrit avec une valeur que le serveur n'avait pas rendue ` +
                `(servi data-theme="${ served.theme }" data-mode="${ served.mode }")`
            ).toEqual([])

            expect(hydrated.theme, `${path} : data-theme après hydratation`).toBe(served.theme)
            expect(hydrated.mode, `${path} : data-mode après hydratation`).toBe(served.mode ?? SYSTEM_MODE)
        })
    }

    /**
     * #1515 — un ancien visiteur : cookie de marque `cartoon` + cookie de mode
     * `dark`. La marque est ignorée (serveur ET après hydratation, rechargement
     * compris) ; le mode reste honoré.
     */
    test('le cookie de marque d\'un ancien visiteur est ignoré, son mode est honoré, rechargement compris', async ({ page, context }) => {
        const baseURL = test.info().project.use.baseURL!

        await context.addCookies([
            { name: 'origam-theme', value: STALE_BRAND_COOKIE, url: baseURL },
            { name: 'origam-mode', value: PICKED_MODE, url: baseURL }
        ])

        await recordAttrWrites(page)

        const response = await page.goto('/')
        const { served, hydrated } = await readBothSides(page, response)

        expect(served.theme, 'le serveur ne doit plus honorer le cookie de marque').toBe(DEFAULT_BRAND)
        expect(served.mode, 'le serveur doit honorer le cookie de mode').toBe(PICKED_MODE)
        expect(hydrated.theme, `la page affiche "${ hydrated.theme }" après hydratation`).toBe(DEFAULT_BRAND)
        expect(hydrated.mode, `le mode choisi "${ PICKED_MODE }" est perdu à l'hydratation`).toBe(PICKED_MODE)

        await page.reload()
        await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as unknown as { __vue_app__?: unknown } | null)?.__vue_app__))
        const again = await hydratedAttrs(page)
        expect(again.theme, 'après rechargement').toBe(DEFAULT_BRAND)
        expect(again.mode, 'après rechargement').toBe(PICKED_MODE)
    })

    test('une marque restée dans le localStorage ne repeint pas le site', async ({ page, context }) => {
        const baseURL = test.info().project.use.baseURL!

        await context.addCookies([{ name: 'origam-theme', value: STALE_BRAND_COOKIE, url: baseURL }])
        await page.addInitScript((brand: string) => {
            try { localStorage.setItem('origam-theme', brand) } catch { /* fenêtre privée */ }
        }, STALE_BRAND_COOKIE)

        const response = await page.goto('/')
        const { hydrated } = await readBothSides(page, response)

        expect(hydrated.theme).toBe(DEFAULT_BRAND)
    })

    test('le bouton clair / sombre bascule le mode sans recharger, et le mode survit au rechargement', async ({ page }) => {
        await page.emulateMedia({ colorScheme: SYSTEM_MODE })
        await page.goto('/')
        await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as unknown as { __vue_app__?: unknown } | null)?.__vue_app__))

        // Cible nommée par son libellé accessible : un clic à l'aveugle dans l'appbar bascule le mode.
        await page.getByRole('button', { name: 'Toggle light and dark mode' }).click()
        await expect.poll(async () => (await hydratedAttrs(page)).mode).toBe('dark')
        expect((await hydratedAttrs(page)).theme).toBe(DEFAULT_BRAND)

        await page.reload()
        await expect.poll(async () => (await hydratedAttrs(page)).mode).toBe('dark')
        expect((await hydratedAttrs(page)).theme).toBe(DEFAULT_BRAND)
    })

    test('le sélecteur de thème de marque n\'existe plus', async ({ page }) => {
        await page.goto('/')
        await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as unknown as { __vue_app__?: unknown } | null)?.__vue_app__))
        await expect(page.locator('[data-cy="theme-switcher-trigger"]')).toHaveCount(0)
        await expect(page.locator('[data-cy^="theme-menu-"]')).toHaveCount(0)
        await expect(page.getByRole('button', { name: 'Toggle light and dark mode' })).toHaveCount(1)
    })

})
