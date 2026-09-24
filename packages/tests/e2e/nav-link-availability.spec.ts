/**
 * Nav link availability — masquage des liens 404 (#43)
 *
 * Vérifie, une fois le client hydraté, que le méga-menu et le footer
 * n'exposent que des liens réels et que les pages réelles y sont bien
 * présentes. C'est un test de comportement CLIENT (clic pour ouvrir un
 * menu, lecture du DOM après hydratation) — pour la garantie SSR (le HTML
 * tel que servi, avant JS), voir `marketing-nav-ssr.spec.ts`. Les deux
 * sont complémentaires : celui-ci ne peut structurellement pas voir un
 * bug de rendu serveur, l'autre ne peut pas voir un bug d'interaction
 * client (menu qui ne s'ouvre pas, item qui ne réagit pas au clic).
 *
 * Changements (audit-ssr-nav, 2026-08-31) :
 * - Retrait de la dépendance à `[data-nav-ready="true"]` — cet attribut
 *   et le composable `useLinkAvailability` qui le posait ont été retirés
 *   (fix-nav-ssr). On attend désormais que `.primary-nav` soit visible,
 *   ce qui suffit : les assertions qui suivent utilisent `.click()` et
 *   `expect(...).toHaveCount(...)`, qui ré-essaient déjà nativement.
 * - `/stories` et `/docs` (SANS slash) retirés de DEAD_HREFS : les vrais
 *   hrefs portent un slash final (`/stories/`, `/docs/`), donc vérifier
 *   l'absence de la forme sans slash ne prouvait rien — elle ne pouvait
 *   de toute façon jamais apparaître. Vérifié dans
 *   `packages/marketing/src/consts/nav.const.ts`.
 * - `/playground` et `/blog` retirés de DEAD_HREFS : ils ne viennent que
 *   de `NAV_LINKS`, une const jamais importée nulle part — ces liens
 *   n'ont jamais été candidats au rendu, donc leur absence ne prouvait
 *   rien non plus.
 * - Ajout d'une vérification que "Docs" et "Stories" apparaissent bien
 *   dans les menus, PAR LABEL et non par href : ces deux hrefs peuvent
 *   pointer vers une origine séparée une fois la config de déploiement
 *   tranchée (Stories/Docs embarqués sur un domaine/port distinct) —
 *   décision utilisateur du 2026-08-31, normative pour ce fichier aussi.
 *
 * Run:
 *   pnpm -F @origam/tests playwright test \
 *     --config=playwright.marketing.config.ts nav-link-availability
 */

import { expect, test, type Locator, type Page } from '@playwright/test'

// '/figma-plugin' a été ajouté par un autre agent (purge-figma-vitrine),
// en parallèle de ce chantier — non touché ici (hors périmètre). À noter :
// ce href n'existe dans aucune des consts de nav actuelles (NAV_SECTIONS,
// FOOTER_COLUMNS, NAV_LINKS) non plus, donc l'assertion sur son absence a
// le même défaut que celles retirées ci-dessus (jamais candidate au
// rendu — la garder est neutre, mais elle ne prouve rien de plus).
const DEAD_HREFS = ['/figma-plugin']

const LIVE_LABELS_BY_TEXT = ['Docs', 'Stories']

/**
 * Les TROIS activateurs de méga-menu, et eux seuls.
 *
 * ⛔ Ne PAS élargir à `.primary-nav .origam-btn` : ce sélecteur attrape aussi
 * « Theming » (`data-cy="nav-theming"`), qui n'est pas un activateur mais un
 * `<a href="/theming">` rendu par `origam-btn`. Le cliquer NAVIGUE vers la
 * page la plus lourde du site (Theme Builder) au milieu de la collecte, et
 * tous les locators suivants se mettent à attendre cette navigation. Mesuré
 * (sonde, 3 tours, serveur de dev tiède, machine au repos) :
 *
 *   btn#0 nav-section-introduction   total 10 485 ms   0 lien lu
 *   btn#1 nav-section-getting-started   total   506 ms   2 liens
 *   btn#2 nav-section-features          total   500 ms  10 liens
 *   btn#3 nav-theming <A href=/theming> total 11 404 ms   0 lien → url=/theming
 *   ————— boucle complète 22,9 s, dont 50 % pour le seul lien Theming
 *
 * soit ~45 % du budget de 30 s d'un test consommé par une navigation dont il
 * n'a aucun besoin. C'est le symptôme « expiration à 30 s » de #836 : il ne
 * faut pas doubler ce budget, il faut supprimer le détour.
 */
const NAV_SECTION_ACTIVATORS = '.primary-nav [data-cy^="nav-section-"]'

/** Le lien Theming, couvert SANS clic (lecture d'attribut). */
const NAV_THEMING_LINK = '.primary-nav [data-cy="nav-theming"]'

/** Contenu de méga-menu réellement ouvert (les autres ne sont pas montés). */
const OPEN_MENU_CONTENT = '.origam-menu__content:visible'

/**
 * Attend que la nav soit visible ET que l'app soit HYDRATÉE.
 *
 * ⛔ `.primary-nav` visible ne suffit pas : c'est du HTML SSR, présent avant
 * que Vue n'ait attaché quoi que ce soit. Mesuré (sonde, 3 tours sur 3) — à
 * l'instant où la nav devient visible (+222 à +397 ms selon le tour) :
 *
 *   #__nuxt présent : true     __vue_app__ présent : FALSE
 *   1er clic sur nav-section-introduction ouvre le menu : FALSE
 *   2e  clic, après hydratation                         : TRUE
 *
 * Le premier clic est donc PERDU, systématiquement. L'ancienne version de ce
 * fichier ne le voyait pas : les trois liens de la section Introduction sont
 * aussi dans le sitemap du footer, qui rattrapait l'assertion. Un des trois
 * méga-menus ne contribuait donc RIEN, à chaque exécution, dans un fichier
 * dont c'est l'objet même.
 */
async function waitForPrimaryNav (page: Page): Promise<void> {
    await page.locator('.primary-nav').waitFor({ state: 'visible', timeout: 15_000 })

    await page.waitForFunction(
        () => Boolean((document.querySelector('#__nuxt') as unknown as { __vue_app__?: unknown } | null)?.__vue_app__),
        undefined,
        { timeout: 15_000 }
    )
}

/**
 * Ouvre le méga-menu `index` et rend son contenu une fois qu'il porte
 * réellement des liens.
 *
 * ⛔ Ne PAS revenir à `waitForTimeout(300)`. Un délai fixe n'atteste de rien :
 * quand l'ouverture arrive plus tard (machine chargée, compilation Vite à la
 * demande), la collecte lit un menu vide et le test échoue sur « aucun lien
 * n'a le libellé "Docs" » — le second symptôme de #836. Rallonger le délai
 * ne corrige pas ça, ça déplace le seuil. On attend l'ÉTAT, pas le temps.
 */
async function openSectionMenu (page: Page, index: number): Promise<Locator> {
    await page.locator(NAV_SECTION_ACTIVATORS).nth(index).click()

    const content = page.locator(OPEN_MENU_CONTENT)

    await expect(content.locator('a[href]').first()).toBeVisible({ timeout: 10_000 })

    return content
}

/** Referme le méga-menu ouvert, en attendant sa disparition effective. */
async function closeSectionMenu (page: Page): Promise<void> {
    await page.keyboard.press('Escape')
    await expect(page.locator(OPEN_MENU_CONTENT)).toHaveCount(0, { timeout: 10_000 })
}

/** Les `href` d'un lot de liens, en un seul aller-retour. */
function hrefsOf (links: Locator): Promise<(string | null)[]> {
    return links.evaluateAll(els => els.map(el => el.getAttribute('href')))
}

/** Les libellés visibles d'un lot de liens, en un seul aller-retour. */
function labelsOf (links: Locator): Promise<string[]> {
    return links.evaluateAll(els => els.map(el => (el as HTMLElement).innerText.trim()))
}

async function collectAllNavHrefs (page: Page): Promise<Set<string>> {
    const found = new Set<string>()

    const sectionCount = await page.locator(NAV_SECTION_ACTIVATORS).count()

    for (let i = 0; i < sectionCount; i++) {
        const content = await openSectionMenu(page, i)

        for (const href of await hrefsOf(content.locator('a[href]'))) {
            if (href) found.add(href)
        }

        await closeSectionMenu(page)
    }

    // Theming reste couvert, mais par lecture d'attribut : le cliquer ferait
    // exactement le détour que ce fichier vient de supprimer.
    const themingHref = await page.locator(NAV_THEMING_LINK).getAttribute('href')
    if (themingHref) found.add(themingHref)

    for (const href of await hrefsOf(page.locator('.site-footer a[href]'))) {
        if (href) found.add(href)
    }

    return found
}

async function collectAllNavLabels (page: Page): Promise<string[]> {
    const labels: string[] = []

    const sectionCount = await page.locator(NAV_SECTION_ACTIVATORS).count()

    for (let i = 0; i < sectionCount; i++) {
        const content = await openSectionMenu(page, i)

        labels.push(...(await labelsOf(content.locator('a[href]'))).filter(Boolean))

        await closeSectionMenu(page)
    }

    const themingLabel = (await page.locator(NAV_THEMING_LINK).innerText()).trim()
    if (themingLabel) labels.push(themingLabel)

    labels.push(...(await labelsOf(page.locator('.site-footer a[href]'))).filter(Boolean))

    return labels
}

test.describe('Nav link availability — masquage des liens 404', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        await waitForPrimaryNav(page)
    })

    test('les liens morts ne sont dans aucun menu ni footer', async ({ page }) => {
        const allHrefs = await collectAllNavHrefs(page)
        for (const href of DEAD_HREFS) {
            expect(
                allHrefs.has(href),
                `Le lien "${href}" est mort (404) mais apparaît dans la nav`
            ).toBe(false)
        }
    })

    test('/components est visible dans les menus', async ({ page }) => {
        const allHrefs = await collectAllNavHrefs(page)
        expect(allHrefs.has('/components'), '"/components" devrait être visible').toBe(true)
    })

    test('les pages réelles apparaissent dans les menus ou le footer', async ({ page }) => {
        const LIVE_HREFS = [
            '/components',
            '/installation',
            '/changelog',
            '/roadmap',
            '/why-origam'
        ]
        const allHrefs = await collectAllNavHrefs(page)
        for (const href of LIVE_HREFS) {
            expect(
                allHrefs.has(href),
                `Le lien "${href}" existe mais est absent de la nav/footer`
            ).toBe(true)
        }
    })

    test('"Docs" et "Stories" apparaissent dans les menus, par libellé (href non testé — peut pointer hors origine)', async ({ page }) => {
        const labels = await collectAllNavLabels(page)
        for (const label of LIVE_LABELS_BY_TEXT) {
            expect(
                labels.some(l => l.includes(label)),
                `Aucun lien de menu/footer n'a le libellé "${label}" — labels trouvés : ${JSON.stringify(labels)}`
            ).toBe(true)
        }
    })

    test('liens externes (GitHub) sont toujours visibles dans le footer', async ({ page }) => {
        const githubLinks = page.locator('.site-footer a[href*="github.com"]')
        const count = await githubLinks.count()
        expect(count, 'Au moins un lien GitHub doit être présent dans le footer').toBeGreaterThan(0)
    })

    test('les liens morts ne sont pas présents directement dans le DOM (hors menus)', async ({ page }) => {
        for (const href of DEAD_HREFS) {
            const links = page.locator(`a[href="${href}"]`)
            await expect(links).toHaveCount(0)
        }
    })

    // Ce test était `.fixme` depuis le 2026-08-31 : `getUid()` reposait sur un
    // compteur GLOBAL AU MODULE, donc les id générés divergeaient entre le HTML
    // servi et le DOM hydraté. Deux causes distinctes, toutes deux mesurées sur
    // le build de production de marketing, pas déduites :
    //   - l'ordre d'attribution diffère entre serveur et client (un compteur
    //     linéaire est ordre-dépendant) — 82 des 125 id différaient sur `/`,
    //     serveur au repos, une seule requête ;
    //   - `createOrigam()` appelait `getUid.reset()` à chaque install, et le
    //     plugin serveur Nuxt installe UNE FOIS PAR REQUÊTE — une requête
    //     rembobinait donc le compteur au milieu du rendu d'une autre. Sous
    //     charge parallèle : 125 id sur 125 remplacés à l'hydratation.
    // `getUid()` s'appuie désormais sur `useId()` de Vue 3.5 (id dérivé de la
    // position dans l'arbre, portée = l'app, aucun état de module). Après
    // correctif, sur la même page : 0 id divergent, au repos comme sous charge,
    // et plus aucune erreur "Hydration completed but contains mismatches."
    test('pas d\'erreur d\'hydratation dans la console', async ({ page }) => {
        const hydrationErrors: string[] = []
        page.on('console', msg => {
            const text = msg.text()
            if (
                msg.type() === 'error' &&
                (text.includes('hydration') || text.includes('Hydration') || text.includes('mismatch'))
            ) {
                hydrationErrors.push(text)
            }
        })

        await page.reload()
        await waitForPrimaryNav(page)

        expect(
            hydrationErrors,
            `Erreurs d'hydratation détectées :\n${hydrationErrors.join('\n')}`
        ).toHaveLength(0)
    })

    test('pas d\'erreur console bloquante (hors hydratation)', async ({ page }) => {
        const consoleErrors: string[] = []
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text())
            }
        })

        await page.reload()
        await waitForPrimaryNav(page)

        // Le titre du test dit "hors hydratation" : les mismatches
        // d'hydratation ont leur propre test (ci-dessus). Le filtre reste en
        // place pour que ce test-ci garde un seul objet — toute AUTRE erreur
        // console bloquante — et ne redevienne pas le canari d'un problème
        // d'hydratation qui a déjà son assertion dédiée.
        const blocking = consoleErrors.filter(e =>
            !e.includes('favicon') &&
            !e.includes('net::ERR') &&
            !e.includes('hydration') &&
            !e.includes('Hydration') &&
            !e.includes('mismatch')
        )

        expect(
            blocking,
            `Erreurs console bloquantes :\n${blocking.join('\n')}`
        ).toHaveLength(0)
    })

})
