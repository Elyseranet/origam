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
 * Familles réellement chargées (mesuré, pas déduit de la config) : le thème
 * par défaut `geek` charge Inter + JetBrains Mono ; `editorial` y ajoute
 * Fraunces, romaine et italique. Les six autres thèmes n'ajoutent rien. Le
 * dernier test épingle ce fait, pour qu'une police devenue inutile se voie.
 */
import { test, expect } from '@playwright/test'

/** Pages publiques représentatives : accueil, une page de contenu, /privacy elle-même. */
const PAGES = ['/', '/fr', '/fr/privacy', '/fr/components', '/fr/theming'] as const

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

        // Une image hors-origine délibérée, injectée dans la page. Elle n'a pas
        // besoin d'aboutir : `page.on('request')` enregistre la requête émise,
        // pas la réponse — le test reste donc valable hors connexion.
        await page.goto('/', { waitUntil: 'domcontentloaded' })
        await page.evaluate(async () => {
            await fetch('https://fonts.gstatic.com/origam-sonde-controle-positif.woff2', {
                mode: 'no-cors'
            }).catch(() => undefined)
        })

        expect(
            externalHosts(seen, baseURL!),
            'la sonde réseau doit voir un hôte externe quand la page en contacte un'
        ).toContain('fonts.gstatic.com')
    })

    for (const path of PAGES) {
        test(`${path} ne contacte aucun hôte externe`, async ({ page, baseURL }) => {
            const seen: string[] = []

            page.on('request', (r) => seen.push(r.url()))

            await page.goto(path, { waitUntil: 'networkidle' })
            await page.evaluate(() => document.fonts.ready)

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

        await page.goto('/fr', { waitUntil: 'networkidle' })
        await page.evaluate(() => document.fonts.ready)

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
