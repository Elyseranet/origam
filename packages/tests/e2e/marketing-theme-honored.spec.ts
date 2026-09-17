/**
 * Le thème servi par le serveur est-il encore là après hydratation ? (#835)
 *
 * ## Le défaut que ce fichier garde
 *
 * `packages/marketing/nuxt.config.ts` portait, dans `app.head.htmlAttrs`, un
 * couple d'attributs EN DUR :
 *
 *     htmlAttrs: { lang: …, 'data-theme': 'geek', 'data-mode': 'light' }
 *
 * posé le 2026-06-12 (`958a1b6fa`, « self-sufficient theme layer »), à une
 * époque où le site n'avait que deux thèmes de démonstration. Il a survécu au
 * passage de `defaultTheme` à `'origam'` (2026-06-27, `df88e8d24`) et à tout
 * ce qui a suivi.
 *
 * Conséquence, MESURÉE et non déduite : le serveur rend le bon thème, puis
 * unhead réécrit `<html>` ~1,3 s plus tard et le remplace par `geek`. Trace
 * d'appel capturée en patchant `documentElement.setAttribute` :
 *
 *     +1117 ms  data-theme="origam"   applyToDocument  (theme.composable.ts)
 *     +1296 ms  data-theme="origam"   applyToDocument
 *     +1359 ms  data-theme="geek"     trackCtx → _renderDOMHead  (unhead)
 *
 * Le dernier write gagne. Portée relevée sur le serveur de dev, 7 cas sur 7 :
 *
 *     /            cookie=—        SERVI=origam            APRÈS=geek
 *     /components  cookie=—        SERVI=origam            APRÈS=geek
 *     /roadmap     cookie=—        SERVI=origam            APRÈS=geek
 *     /theming     cookie=—        SERVI=origam            APRÈS=geek
 *     /            cookie=cartoon  SERVI=cartoon           APRÈS=geek
 *     /            cookie=glass    SERVI=glass             APRÈS=geek
 *     /            cookie=cartoon  SERVI=cartoon/dark      APRÈS=geek/light
 *
 * Les DEUX axes sont écrasés : la marque ET le clair/sombre. Autrement dit le
 * sélecteur de thème du site ne survivait à aucun rechargement, pour aucun
 * visiteur, sur aucune page, depuis trois mois.
 *
 * ## Ce que ce fichier assert, et pourquoi sous cette forme
 *
 * Il ne compare PAS à une valeur en dur — ce serait reproduire le défaut d'en
 * face. Il compare l'attribut SERVI par le serveur à celui présent APRÈS
 * hydratation : si quelque chose réécrit `<html>` dans le dos du rendu, les
 * deux divergent, quel que soit le thème par défaut du jour.
 *
 * Run :
 *   MARKETING_BASE_URL=http://localhost:3011 pnpm -F @origam/tests exec \
 *     playwright test --config=playwright.marketing.config.ts marketing-theme-honored
 */

import { expect, test, type Page, type Response } from '@playwright/test'

/** Les pages échantillonnées — une par famille de layout. */
const SAMPLED_PATHS = ['/', '/components', '/roadmap']

/** Un couple marque + mode qu'un visiteur peut avoir choisi. */
const PICKED_BRAND = 'cartoon'
const PICKED_MODE = 'dark'

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

/**
 * Attend la fin de l'hydratation, puis laisse unhead rendre le `<head>`.
 *
 * ⛔ Ne PAS utiliser `networkidle` : mesuré sur ce serveur de dev, il expire
 * parfois à 30 s sans que rien ne soit évalué (la liaison HMR de Vite reste
 * ouverte). On attend l'app montée, puis la réécriture éventuelle du `<head>`,
 * qui est ce qu'on cherche à observer — un état, pas une durée.
 */
async function waitForHydration (page: Page): Promise<void> {
    await page.waitForFunction(
        () => Boolean((document.querySelector('#__nuxt') as unknown as { __vue_app__?: unknown } | null)?.__vue_app__),
        undefined,
        { timeout: 20_000 }
    )

    // La réécriture fautive arrivait APRÈS l'hydratation (unhead rend le head
    // sur un microtask suivant). On laisse deux tours de boucle de rendu.
    await page.evaluate(() => new Promise<void>(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    }))
}

async function readBothSides (page: Page, response: Response | null): Promise<{ served: IThemeAttrs, hydrated: IThemeAttrs }> {
    expect(response, 'aucune réponse pour le document principal').not.toBeNull()

    const served = servedAttrs(await response!.text())
    await waitForHydration(page)

    return { served, hydrated: await hydratedAttrs(page) }
}

test.describe('Thème marketing — ce que le serveur rend survit à l\'hydratation', () => {

    for (const path of SAMPLED_PATHS) {
        test(`${path} — le thème servi n'est pas réécrit côté client`, async ({ page }) => {
            const response = await page.goto(path)
            const { served, hydrated } = await readBothSides(page, response)

            expect(
                served.theme,
                `${path} : le serveur n'a émis aucun data-theme sur <html>`
            ).not.toBeNull()

            expect(
                hydrated.theme,
                `${path} : le serveur a rendu data-theme="${ served.theme }", la page affiche "${ hydrated.theme }" après hydratation`
            ).toBe(served.theme)

            expect(
                hydrated.mode,
                `${path} : le serveur a rendu data-mode="${ served.mode }", la page affiche "${ hydrated.mode }" après hydratation`
            ).toBe(served.mode)
        })
    }

    test('le couple marque + mode choisi par le visiteur survit au rechargement', async ({ page, context }) => {
        const baseURL = test.info().project.use.baseURL!

        await context.addCookies([
            { name: 'origam-theme', value: PICKED_BRAND, url: baseURL },
            { name: 'origam-mode', value: PICKED_MODE, url: baseURL }
        ])

        const response = await page.goto('/')
        const { served, hydrated } = await readBothSides(page, response)

        expect(served.theme, 'le serveur devrait honorer le cookie de marque').toBe(PICKED_BRAND)
        expect(served.mode, 'le serveur devrait honorer le cookie de mode').toBe(PICKED_MODE)

        expect(
            hydrated.theme,
            `marque choisie "${ PICKED_BRAND }" perdue à l'hydratation — <html> affiche "${ hydrated.theme }"`
        ).toBe(PICKED_BRAND)

        expect(
            hydrated.mode,
            `mode choisi "${ PICKED_MODE }" perdu à l'hydratation — <html> affiche "${ hydrated.mode }"`
        ).toBe(PICKED_MODE)
    })

})
