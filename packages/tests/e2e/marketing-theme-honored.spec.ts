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

/** Une écriture de `data-theme` / `data-mode` sur `<html>`, horodatée. */
interface IAttrWrite {
    at: number
    name: string
    value: string
}

/**
 * Enregistre CHAQUE écriture de `data-theme` / `data-mode` sur `<html>`.
 *
 * ⛔ C'est le point de conception de ce fichier. Une simple lecture de
 * l'attribut « après hydratation » ne suffit pas : la réécriture fautive
 * arrive ~1,36 s après la navigation, donc une version antérieure de cette
 * spec — qui lisait après deux `requestAnimationFrame` — passait AU VERT SUR
 * LE CODE DÉFECTUEUX. Vérifié en la jouant contre le produit non corrigé :
 * 4 passed. Une spec verte des deux côtés ne prouve rien.
 *
 * On observe donc l'INVARIANT (« rien ne réécrit ces attributs ») sur une
 * fenêtre, au lieu d'échantillonner un instant.
 */
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
 * Laisse passer la fenêtre d'observation : hydratation, puis le rendu du
 * `<head>` par unhead qui la suit.
 *
 * ⛔ Ce n'est PAS un délai posé pour faire passer un test instable — il n'y a
 * rien à attendre qui deviendrait vrai. C'est la durée pendant laquelle on
 * SURVEILLE que rien ne change : la réécriture mesurée tombe à +1,36 s, la
 * fenêtre est prise à plus du double. Un test qui « attend l'état » n'a pas de
 * sens pour une propriété de non-événement.
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
    return writes.filter(w => w.value !== (w.name === 'data-theme' ? served.theme : served.mode))
}

test.describe('Thème marketing — ce que le serveur rend survit à l\'hydratation', () => {

    for (const path of SAMPLED_PATHS) {
        test(`${path} — le thème servi n'est pas réécrit côté client`, async ({ page }) => {
            await recordAttrWrites(page)

            const response = await page.goto(path)
            const { served, hydrated, writes } = await readBothSides(page, response)

            expect(
                served.theme,
                `${path} : le serveur n'a émis aucun data-theme sur <html>`
            ).not.toBeNull()

            expect(
                divergentWrites(writes, served),
                `${path} : <html> a été réécrit avec une valeur que le serveur n'avait pas rendue ` +
                `(servi data-theme="${ served.theme }" data-mode="${ served.mode }")`
            ).toEqual([])

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

        await recordAttrWrites(page)

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
