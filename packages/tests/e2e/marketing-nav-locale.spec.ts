/**
 * Barre de navigation — le lien suit la langue du visiteur (#809)
 *
 * Jumeau du pied de page (#760). La stratégie i18n du site est
 * `prefix_except_default` : un chemin sans préfixe résout vers la locale par
 * DÉFAUT quelle que soit la locale courante. Un `:href="item.href"` brut
 * rendu sur `/fr/roadmap` envoyait donc le visiteur francophone sur la page
 * ANGLAISE, sous un libellé français.
 *
 * ⛔ Pourquoi ce spec ouvre les menus au lieu de lire le HTML servi :
 * les items des trois menus n'existent dans le DOM qu'une fois le
 * `origam-menu` ouvert. Un `curl` — et donc `marketing-nav-ssr.spec.ts`,
 * qui lit volontairement les octets bruts — n'en voit que 2 sur 17. Ce
 * spec-ci est le complément post-hydratation, pas son doublon.
 *
 * ⛔ Frontière Nuxt / non-Nuxt, mesurée et non supposée : `/stories/`
 * (Histoire) et `/docs/` (VitePress) sont des sites statiques voisins, pas
 * des routes de l'app. `/fr/stories/` rend la page 404 de Nuxt. Ils portent
 * `external: true` dans NAV_SECTIONS et doivent rester SANS préfixe — les
 * localiser casserait deux liens qui marchent.
 *
 * Mesuré sur le build de production AVANT correction, clic réel depuis
 * `/fr/roadmap` : 15 liens internes sur 15 atterrissaient en `lang=en-US`
 * avec un h1 anglais, et `.primary-nav__link--active` ne matchait aucun
 * élément. Chaque test ci-dessous échoue sur cet état.
 */
import { expect, test, type Page } from '@playwright/test'

const MENUS = [
    'nav-section-introduction',
    'nav-section-getting-started',
    'nav-section-features'
] as const

/** Les deux seules entrées de NAV_SECTIONS qui ne sont pas des routes Nuxt. */
const EXTERNAL_ITEMS = ['nav-item-stories', 'nav-item-docs']

interface INavAnchor {
    where: string
    href: string | null
}

/**
 * ⛔ Cliquer un activateur de menu juste après `goto` ne l'ouvre pas : le
 * clic arrive avant l'hydratation et rien ne l'écoute. Cinq des sept tests
 * de ce fichier ont échoué ainsi sur du code CORRECT avant l'ajout de cette
 * attente — même piège que celui documenté en tête de
 * `nav-link-availability.spec.ts`.
 */
async function gotoHydrated (page: Page, path: string): Promise<void> {
    await page.goto(path, { waitUntil: 'networkidle' })
    await page.locator('.primary-nav').waitFor({ state: 'visible', timeout: 15_000 })
}

/**
 * ⛔ `.primary-nav` est visible dès le HTML SERVI : l'attendre ne prouve donc
 * PAS que Vue a repris la main, et un clic qui arrive avant l'hydratation
 * n'est écouté par personne — le menu reste fermé, et l'échec ressemble trait
 * pour trait à « l'item n'existe pas ». Le clic est donc réessayé jusqu'à ce
 * que le menu s'ouvre réellement.
 */
async function openMenu (page: Page, menu: string): Promise<void> {
    const activator = page.locator(`[data-cy="${ menu }"]`).first()
    const items = page.locator('[data-cy^="nav-item-"]')

    await expect(activator).toBeVisible()

    await expect(async () => {
        await activator.click()
        await expect(items.first()).toBeVisible({ timeout: 2_000 })
    }).toPass({ timeout: 20_000 })
}

/**
 * ⛔ `Escape` n'est pas synchrone : sans attendre la fermeture effective, le
 * menu suivant s'ouvre pendant que celui-ci se referme et les deux jeux
 * d'items cohabitent dans le DOM. Mesuré : 23 ancres relevées au lieu de 17,
 * la section Introduction comptée deux fois.
 */
async function closeMenu (page: Page): Promise<void> {
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-cy^="nav-item-"]')).toHaveCount(0)
}

async function collectHeaderLinks (page: Page): Promise<INavAnchor[]> {
    const links: INavAnchor[] = [
        { where: 'brand', href: await page.locator('[data-cy="brand-home"]').first().getAttribute('href') },
        { where: 'theming', href: await page.locator('[data-cy="nav-theming"]').first().getAttribute('href') }
    ]

    for (const menu of MENUS) {
        await openMenu(page, menu)

        const rows = await page.locator('[data-cy^="nav-item-"]').evaluateAll(
            els => els.map(el => ({ where: el.getAttribute('data-cy') ?? '', href: el.getAttribute('href') }))
        )

        links.push(...rows)
        await closeMenu(page)
    }

    return links
}

test.describe('Barre de navigation — localisation des liens (#809)', () => {
    test('sur une page FR, les 15 liens internes portent le préfixe /fr', async ({ page }) => {
        await gotoHydrated(page, '/fr/roadmap')

        const links = await collectHeaderLinks(page)
        const internal = links.filter(l => !EXTERNAL_ITEMS.includes(l.where))

        // 1 marque + 1 thématisation + 3 + 2 + 8 = 15 routes Nuxt.
        expect(internal).toHaveLength(15)

        // `localePath('/')` rend `/fr` (sans barre finale) — d'où le `/fr` nu.
        const unprefixed = internal.filter(l => l.href !== '/fr' && !l.href?.startsWith('/fr/'))

        expect(unprefixed.map(l => `${ l.where }=${ l.href }`)).toEqual([])
    })

    test('les deux cibles non-Nuxt restent SANS préfixe de locale', async ({ page }) => {
        await gotoHydrated(page, '/fr/roadmap')

        const links = await collectHeaderLinks(page)
        const external = links.filter(l => EXTERNAL_ITEMS.includes(l.where))

        expect(external).toHaveLength(2)
        expect(external.map(l => l.href).sort()).toEqual(['/docs/', '/stories/'])
    })

    test('suivre un lien FR mène à la page FR — URL, langue et h1', async ({ page }) => {
        await gotoHydrated(page, '/fr/roadmap')

        await openMenu(page, MENUS[0])

        const item = page.locator('[data-cy="nav-item-why-origam"]').first()

        await expect(item).toBeVisible()
        await item.click()

        await expect(page).toHaveURL(/\/fr\/why-origam$/)
        await expect(page.locator('html')).toHaveAttribute('lang', /^fr/)
        // Le h1 anglais est « Why origam? An honest answer. » — la mesure du défaut.
        await expect(page.locator('h1').first()).not.toContainText('An honest answer')
    })

    test('la palette de recherche localise sa destination', async ({ page }) => {
        await gotoHydrated(page, '/fr/roadmap')

        await page.locator('[data-cy="search-trigger"]').first().click()
        await expect(page.locator('.origam-command-palette__input')).toBeVisible()

        await page.keyboard.type('Installation')
        // Entrée valide l'élément surligné : attendre que la liste ait filtré,
        // sinon la touche part avant que la commande visée soit la première.
        await expect(page.locator('.origam-command-palette__item-label').first()).toContainText('Installation')

        await page.keyboard.press('Enter')

        await expect(page).toHaveURL(/\/fr\/installation$/)
        await expect(page.locator('html')).toHaveAttribute('lang', /^fr/)
    })

    test('la section courante est surlignée hors locale par défaut', async ({ page }) => {
        await gotoHydrated(page, '/fr/roadmap')

        // `/roadmap` appartient à la section Introduction ; comparer `route.path`
        // (`/fr/roadmap`) au chemin brut de l'entrée rendait ce surlignage mort.
        const active = page.locator('.primary-nav__link--active')

        await expect(active).toHaveCount(1)
        await expect(active.first()).toHaveAttribute('aria-current', 'page')
    })

    test('non-régression EN — aucun lien ne gagne un préfixe /en', async ({ page }) => {
        await gotoHydrated(page, '/roadmap')

        const header = await collectHeaderLinks(page)
        const footer = await page.locator('.site-footer a').evaluateAll(
            els => els.map(el => el.getAttribute('href'))
        )

        const offenders = [...header.map(l => l.href), ...footer]
            .filter(href => href === '/en' || href?.startsWith('/en/'))

        expect(offenders).toEqual([])
    })

    test('non-régression pied de page (#760) — toujours localisé en FR', async ({ page }) => {
        await gotoHydrated(page, '/fr/roadmap')

        const footer = await page.locator('.site-footer a').evaluateAll(
            els => els.map(el => el.getAttribute('href')).filter((h): h is string => !!h && h.startsWith('/'))
        )

        const notLocalised = footer.filter(
            href => href !== '/fr' && !href.startsWith('/fr/') && !href.startsWith('/fr#') && !['/stories/', '/docs/'].includes(href)
        )

        expect(notLocalised).toEqual([])
    })
})
