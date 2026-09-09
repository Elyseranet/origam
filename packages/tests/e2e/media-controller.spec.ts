import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamMediaController — runtime probes for the reusable controls
 * shell. Boots dedicated Variants (Playground / inset / extras-right /
 * config-extra / visible-false) and asserts the rendered toolbar.
 *
 * Variants are reached via their dedicated titles — never via the
 * HstSelect picker dropdown (custom DOM, brittle).
 */

const STORY = '/stories/story/components-stories-mediacontroller-origammediacontroller-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, title: string): Promise<void> => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(400)
}

test.describe('OrigamMediaController — Default (mount + ARIA)', () => {
    test('mounts the controls shell + play button', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const host = sandbox.locator('[data-cy="media-controller-playground-host"]').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const playBtn = sandbox.locator('[data-cy="origam-media-controller-play"]').first()
        await expect(playBtn).toBeVisible()
        await expect(playBtn).toHaveAttribute('aria-label', 'Play')
    })

    test('clicking play, then pause, flips the aria-label both ways', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const playBtn = sandbox.locator('[data-cy="origam-media-controller-play"]').first()
        await expect(playBtn).toHaveAttribute('aria-label', 'Play', { timeout: 8000 })
        await playBtn.click()

        await expect(playBtn).toHaveAttribute('aria-label', 'Pause', { timeout: 5000 })
        await playBtn.click()
        await expect(playBtn).toHaveAttribute('aria-label', 'Play', { timeout: 5000 })
    })
})

test.describe('OrigamMediaController — Config menu', () => {
    test('opens the config menu, navigates to speed, picks 2× and updates the rate', async ({ page }) => {
        await openVariant(page, 'Default')
        const sandbox = sandboxOf(page)

        const cog = sandbox.locator('[data-cy="origam-media-controller-config-btn"]').first()
        await expect(cog).toBeVisible({ timeout: 8000 })
        await cog.click()

        const openSpeed = sandbox.getByText('Playback speed').first()
        await expect(openSpeed).toBeVisible({ timeout: 5000 })
        await openSpeed.click()

        const twoX = sandbox.getByText('2×').first()
        await expect(twoX).toBeVisible({ timeout: 5000 })
        await twoX.click()

        await cog.click()
        const openSpeedAgain = sandbox.getByText('Playback speed').first()
        await expect(openSpeedAgain).toBeVisible({ timeout: 5000 })
    })
})

test.describe('OrigamMediaController — inset Variant', () => {
    test('the inset host carries the --inset modifier class', async ({ page }) => {
        await openVariant(page, 'Variant — inset (overlay over the media surface)')
        const sandbox = sandboxOf(page)

        const insetOnHost = sandbox.locator('[data-cy="media-controller-inset-on-host"]').first()
        await expect(insetOnHost).toBeVisible({ timeout: 8000 })
        const classes = await insetOnHost.getAttribute('class')
        expect(classes ?? '').toContain('origam-media-controller--inset')

        const insetOffHost = sandbox.locator('[data-cy="media-controller-inset-off-host"]').first()
        await expect(insetOffHost).toBeVisible()
        const offClasses = await insetOffHost.getAttribute('class')
        expect(offClasses ?? '').not.toContain('origam-media-controller--inset')
    })
})

test.describe('OrigamMediaController — extras-right slot', () => {
    test('injected buttons render alongside the cog', async ({ page }) => {
        await openVariant(page, 'Variant — #extraControlsRight slot')
        const sandbox = sandboxOf(page)

        const share = sandbox.locator('[data-cy="media-controller-extras-share"]').first()
        const pin = sandbox.locator('[data-cy="media-controller-extras-pin"]').first()
        const mark = sandbox.locator('[data-cy="media-controller-extras-mark"]').first()
        await expect(share).toBeVisible({ timeout: 8000 })
        await expect(pin).toBeVisible()
        await expect(mark).toBeVisible()
    })
})

/**
 * SPEC — les 4 tokens que le contrôleur lisait sans les déclarer (#429)
 *
 * ## Le défaut
 *
 * Même famille que celui réparé sur `OrigamMediaVolumeControl`, mais sur le
 * PARENT. `OrigamMediaController` lisait quatre variables qui n'étaient
 * déclarées nulle part — elles figuraient dans la baseline « dead » de
 * `token-var-channels`. Le repli inline s'appliquait donc toujours et
 * silencieusement : la couleur d'accent des boutons actifs (loop / shuffle /
 * cast) et les trois couleurs du compteur de temps étaient **inatteignables
 * par un thème**, `IOrigamTheme.vars` compris — il n'y avait rien à surcharger.
 *
 * Les quatre sont maintenant déclarées à leur valeur de repli exacte : le
 * rendu ne bouge pas d'un pixel, seule la surface de thème apparaît.
 *
 * ## ⛔ `inherit` comme valeur de custom property est un NO-OP, pas un défaut
 *
 * Le repli de `__time---color` s'écrivait `var(--…__time---color, inherit)`.
 * Le recopier tel quel dans la feuille produit une déclaration **inerte** :
 * `inherit` est un mot-clé CSS-wide, consommé par la custom property
 * elle-même — « hérite la valeur de `--x` du parent », que personne ne
 * déclare. La propriété devient *guaranteed-invalid* et `getPropertyValue`
 * rend la chaîne VIDE. Mesuré sur le build réel :
 *
 *     --…__time---color: inherit;        getPropertyValue → ""      (inerte)
 *     --…__time---color: currentColor;   getPropertyValue → "currentColor"
 *
 * Les deux peignent `rgb(10, 10, 10)` — le rendu ne distingue pas les deux
 * cas. Mais par la définition même qu'utilise ce spec (chaîne vide = absence
 * de déclaration), la première version aurait laissé le token NON déclaré
 * tout en ayant l'air corrigé. `currentColor` est retenu : mesuré équivalent
 * pour la propriété `color`, et il rend une vraie valeur.
 */

test.describe('OrigamMediaController — tokens déclarés (#429)', () => {
    test.setTimeout(45000)

    test('les 4 variables sont déclarées, à leur valeur de repli exacte', async ({ page }) => {
        await page.goto(`${STORY}?variantId=components-stories-mediacontroller-origammediacontroller-story-vue-0`, { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)

        const controller = sandbox.locator('.origam-media-controller').first()
        await expect(controller).toBeVisible({ timeout: 15000 })

        const declared = await controller.evaluate((el) => {
            const cs = getComputedStyle(el)
            const names = [
                '--origam-media-controller---accent-color',
                '--origam-media-controller__time---color',
                '--origam-media-controller__time-sep---color',
                '--origam-media-controller__time-total---color'
            ]

            return Object.fromEntries(names.map((n) => [ n, cs.getPropertyValue(n).trim() ]))
        })

        for (const [ name, value ] of Object.entries(declared)) {
            expect(value, `${name} doit être déclaré dans la feuille de tokens`).not.toBe('')
        }

        /*
         * Valeurs ABSOLUES, pas seulement « non vides ». Elles doivent être
         * exactement les anciens replis inline, sinon la correction n'est plus
         * gratuite et le rendu bouge.
         *
         *   accent      = --origam-color__action--primary---bg = primary.600
         *   sep / total = --origam-color__text---secondary      = neutral.600
         */
        expect(declared['--origam-media-controller---accent-color']).toBe('#7c3aed')
        expect(declared['--origam-media-controller__time---color']).toBe('currentColor')
        expect(declared['--origam-media-controller__time-sep---color']).toBe('#525252')
        expect(declared['--origam-media-controller__time-total---color']).toBe('#525252')
    })

    test('le compteur de temps peint exactement ce qu\'il peignait avant', async ({ page }) => {
        await page.goto(`${STORY}?variantId=components-stories-mediacontroller-origammediacontroller-story-vue-0`, { waitUntil: 'domcontentloaded' })
        const sandbox = sandboxOf(page)

        const time = sandbox.locator('[data-cy="origam-media-controller-time"]')
        await expect(time).toBeVisible({ timeout: 15000 })

        const painted = await time.evaluate((el) => {
            const color = (sel: string) => getComputedStyle(el.querySelector(sel) as HTMLElement).color

            return {
                current: color('.origam-media-controller__time-current'),
                sep: color('.origam-media-controller__time-sep'),
                total: color('.origam-media-controller__time-total')
            }
        })

        // Les trois nombres mesurés AVANT la déclaration des tokens, sur le
        // même build. Ce sont eux qui prouvent que zéro pixel n'a bougé.
        expect(painted.current, 'temps courant — hérite du contrôleur').toBe('rgb(10, 10, 10)')
        expect(painted.sep, 'séparateur — text.secondary').toBe('rgb(82, 82, 82)')
        expect(painted.total, 'durée totale — text.secondary').toBe('rgb(82, 82, 82)')

        // Le fait visible que ces tokens portent : la durée totale et le
        // séparateur sont volontairement plus pâles que le temps courant.
        expect(painted.sep).not.toBe(painted.current)
    })
})
