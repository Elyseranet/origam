/**
 * Aucun tiers contacté automatiquement — garde d'exécution (#761)
 *
 * Ce que ce spec protège : la page `/privacy` affirme, noir sur blanc, que
 * charger n'importe quelle page publique ne déclenche **aucune** requête vers
 * un autre hôte que le site lui-même. Tant que cette affirmation est publiée,
 * elle doit être vérifiée par une mesure, pas par une relecture.
 *
 * Pourquoi au journal réseau et pas par un `grep` sur `nuxt.config.ts` :
 * une police (ou un script, ou une image) peut être retirée d'un endroit et
 * rester tirée par un autre — une feuille de style importée, un composant, un
 * thème. Seul le relevé des requêtes réellement émises par le navigateur
 * tranche. C'est exactement la mesure qui a fondé la rédaction de `/privacy`.
 *
 * Historique : avant #761, `nuxt.config.ts` déclarait un `<link rel=stylesheet>`
 * vers `fonts.googleapis.com` et deux `preconnect`. Relevé alors, sur chaque
 * page : 1 requête vers `fonts.googleapis.com` (la feuille) + 2 vers
 * `fonts.gstatic.com` (les `.woff2` des sous-ensembles `latin`). Les trois
 * familles — Fraunces, Inter, JetBrains Mono — sont depuis servies depuis
 * `public/fonts/`.
 *
 * ⛔ CONTRÔLE POSITIF, non négociable : le premier test ci-dessous prouve que
 * la sonde VOIT une requête hors-origine quand il y en a une. Sans lui,
 * « zéro requête externe » et « ma sonde ne mesure rien » sont deux résultats
 * indiscernables — et le second passerait au vert pour toujours.
 *
 * Ce spec tourne en CI : il est inscrit dans `MARKETING_GREEN_SPECS`
 * (`playwright.marketing.config.ts`), la liste que le job `test-e2e-marketing`
 * exécute sous `MARKETING_GREEN_ONLY=1`. Y figurer est la seule chose qui fasse
 * tourner une spec — `MARKETING_SPEC_PATTERNS` ne suffit pas, et c'est le
 * défaut que le garde `spec-coverage` (#824) a relevé sur ce fichier même.
 *
 * Familles réellement chargées (mesuré, pas déduit de la config) : le thème
 * par défaut `geek` charge Inter + JetBrains Mono ; `editorial` y ajoute
 * Fraunces, romaine et italique. Les six autres thèmes n'ajoutent rien. Le
 * dernier test épingle ce fait, pour qu'une police devenue inutile se voie.
 */
import { test, expect, type Page } from '@playwright/test'

/**
 * Pages publiques représentatives : accueil, une page de contenu, /privacy
 * elle-même.
 *
 * `/` n'est PAS une page finale : `nuxt.config.ts` déclare
 * `i18n.detectBrowserLanguage.redirectOn: 'root'`, donc `/` est le point
 * d'entrée qui déclenche la détection de locale. Elle est conservée ici
 * délibérément (#910) pour vérifier que la redirection ELLE-MÊME ne contacte
 * aucun tiers — ce que `/fr` (déjà dans cette liste) ne peut pas garantir,
 * puisque `/fr` n'exécute jamais ce chemin de détection.
 */
const PAGES = ['/', '/fr', '/fr/privacy', '/fr/components', '/fr/theming'] as const

/**
 * `#910` — `/` peut déclencher, après le premier `load`, une navigation
 * client supplémentaire (le même URL, sans changement visible) pendant que
 * `detectBrowserLanguage` termine sa détection. Rare (~1 % mesuré), mais
 * quand elle tombe entre notre `goto`/`evaluate` et la fin de cette
 * navigation, Chromium détruit le contexte d'exécution en cours
 * (`Execution context was destroyed`) ou annule la navigation initiale
 * (`net::ERR_ABORTED`) — sans qu'aucune assertion n'ait jamais tourné.
 *
 * La correction n'est PAS un délai : c'est une barrière sur l'état. On
 * capture l'erreur transitoire précise que cette course produit, puis on
 * attend que la navigation en cours ait fini de charger (`waitForLoadState`,
 * qui suit la frame quel que soit l'URL final) avant de rejouer l'opération
 * — une seule fois. Une autre erreur, ou une deuxième course, remonte
 * normalement : on ne boucle pas indéfiniment sur un pari.
 */
function isTransientNavigationRace(error: unknown): boolean {
    return (
        error instanceof Error &&
        (error.message.includes('net::ERR_ABORTED') ||
            error.message.includes('Execution context was destroyed'))
    )
}

/**
 * Navigue vers `path` puis attend `document.fonts.ready`, en absorbant UNE
 * course transitoire contre la redirection de locale (#910) à chacune des
 * deux étapes.
 */
async function gotoAndWaitForFonts(page: Page, path: string): Promise<void> {
    try {
        await page.goto(path, { waitUntil: 'load' })
    } catch (error) {
        if (!isTransientNavigationRace(error)) throw error
        await page.waitForLoadState('load')
    }

    try {
        await page.evaluate(() => document.fonts.ready)
    } catch (error) {
        if (!isTransientNavigationRace(error)) throw error
        await page.waitForLoadState('load')
        await page.evaluate(() => document.fonts.ready)
    }
}

/**
 * Délai laissé après `document.fonts.ready` pour qu'une requête déclenchée
 * juste après le chargement soit tout de même enregistrée. Volontairement
 * court : il s'ajoute à chaque page, et ce n'est pas lui qui porte la mesure
 * — c'est `fonts.ready`.
 */
const SETTLE_MS = 500

/** Un hôte est « externe » dès qu'il n'est pas celui que le test interroge. */
function externalHosts(urls: string[], baseURL: string): string[] {
    const own = new URL(baseURL).host

    return [
        ...new Set(
            urls
                .filter((u) => u.startsWith('http://') || u.startsWith('https://'))
                .map((u) => new URL(u).host)
                .filter((h) => h !== own)
        )
    ]
}

test.describe('marketing — aucun tiers contacté automatiquement (#761)', () => {
    test('CONTRÔLE POSITIF — la sonde voit une requête hors-origine', async ({ page, baseURL }) => {
        const seen: string[] = []

        page.on('request', (r) => seen.push(r.url()))

        // ⛔ L'hôte de contrôle est en `.invalid` — TLD réservé par la RFC 2606,
        // qui ne résout JAMAIS. Trois raisons, toutes délibérées :
        //   - la suite de tests ne contacte elle-même aucun tiers, ce qui serait
        //     contradictoire avec ce qu'elle vérifie ;
        //   - elle ne dépend pas de l'accès sortant du runner de CI ;
        //   - l'échec est immédiat et déterministe, jamais un `timeout`.
        // `page.on('request')` enregistre la requête ÉMISE, pas la réponse : que
        // la résolution échoue est sans importance, et c'est justement le point.
        await page.goto('/', { waitUntil: 'domcontentloaded' })
        await page.evaluate(async () => {
            await fetch('https://sonde-controle-positif.invalid/origam.woff2', {
                mode: 'no-cors',
                signal: AbortSignal.timeout(5000)
            }).catch(() => undefined)
        })

        expect(
            externalHosts(seen, baseURL!),
            'la sonde réseau doit voir un hôte externe quand la page en contacte un'
        ).toContain('sonde-controle-positif.invalid')
    })

    for (const path of PAGES) {
        test(`${path} ne contacte aucun hôte externe`, async ({ page, baseURL }) => {
            const seen: string[] = []

            page.on('request', (r) => seen.push(r.url()))

            // ⛔ PAS `networkidle`. Le serveur Nuxt de dev que la CI monte garde
            // ouverte la liaison HMR de Vite et compile les modules à la
            // demande : le réseau n'est jamais « au repos », et l'attente
            // expire au bout de 30 s sur les routes lourdes (/fr/theming,
            // /fr/components). Mesuré : 2 expirations sur 5 exécutions, sans
            // qu'aucune assertion n'ait jamais été évaluée.
            //
            // `load` + `document.fonts.ready` est l'attente EXACTE de ce qui est
            // vérifié ici : la promesse se résout quand le chargement des
            // polices est terminé — donc après l'émission de toute requête de
            // police. Le court délai qui suit laisse partir ce qu'un script
            // déclencherait juste après.
            //
            // `gotoAndWaitForFonts` absorbe la course #910 (voir sa doc
            // ci-dessus) sans jamais parier sur un délai.
            await gotoAndWaitForFonts(page, path)
            await page.waitForTimeout(SETTLE_MS)

            const hosts = externalHosts(seen, baseURL!)

            expect(hosts, `${path} a contacté : ${hosts.join(', ') || '(aucun)'}`).toEqual([])
        })
    }

    test('le thème editorial charge Fraunces, et toujours sans hôte externe', async ({ page, context, baseURL }) => {
        const seen: string[] = []

        page.on('request', (r) => seen.push(r.url()))

        await context.addCookies([
            { name: 'origam-theme', value: 'editorial', url: baseURL! },
            { name: 'origam-mode', value: 'light', url: baseURL! }
        ])

        await page.goto('/fr', { waitUntil: 'load' })
        await page.evaluate(() => document.fonts.ready)
        await page.waitForTimeout(SETTLE_MS)

        const familles = await page.evaluate(() => {
            const out: string[] = []

            document.fonts.forEach((f) => {
                if (f.status === 'loaded') out.push(f.family)
            })

            return [...new Set(out)].sort()
        })

        expect(familles, 'editorial doit charger Fraunces en plus du socle').toContain('Fraunces')
        expect(familles).toContain('Inter')
        expect(externalHosts(seen, baseURL!)).toEqual([])
    })
})
