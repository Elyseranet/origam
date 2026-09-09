import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamMediaVolumeControl (#429)
 *
 * ## Le défaut que ce spec encode
 *
 * `OrigamMediaVolumeControl` est **livré et utilisé en production** par
 * `OrigamMediaController` (lignes 73-82), et il n'avait ni token déclaré ni
 * prop visuelle. Un configurateur de thème ne pouvait donc l'atteindre ni par
 * `IOrigamTheme.components` (aucune prop de design à nommer), ni par
 * `IOrigamTheme.vars` (aucune variable déclarée dans les feuilles) — seul un
 * override CSS brut fonctionnait, ce qui inverse la règle props-d'abord du DS.
 *
 * Les six `var(--origam-media-volume-control---*)` que le SCSS lisait étaient
 * tous dans la baseline « dead » de `token-var-channels` : lus, jamais
 * déclarés. Le repli inline s'appliquait donc toujours, silencieusement.
 *
 * ## Pourquoi Playwright et pas Vitest
 *
 * ⛔ Sous jsdom, `getComputedStyle` ne résout JAMAIS un `var()` : il renvoie
 * `16px` fabriqué. Toute la surface de style de ce composant passe par des
 * tokens, donc un TU serait structurellement aveugle — vert sur le code cassé
 * ET sur le code corrigé.
 *
 * ## ⛔ Pourquoi on mesure des instances à props FIXES, et pas des classes
 * ##    posées à la main dans le DOM
 *
 * Le patron `switch-density.spec.ts` (poser la classe + mesurer dans un seul
 * `evaluate`) prouve que le SCSS répond à une classe. Il ne prouve PAS que la
 * PROP émet cette classe — c'est exactement le trou par lequel une story peut
 * mentir sur du code sain. La variante « Design » embarque donc une matrice de
 * référence à props figées (`mvc-size-*`, `mvc-density-*`, `mvc-rounded-*`,
 * `mvc-color-*`) : chaque instance est rendue par Vue à partir de la prop, et
 * c'est elle qu'on mesure. Aucune mutation DOM.
 *
 * ⛔ Deux pièges mesurés en écrivant ce spec, gardés ici pour le prochain :
 *
 *  1. `getComputedStyle(el).borderTopLeftRadius` rend la valeur SPÉCIFIÉE
 *     (`9999px`), pas la valeur écrêtée à la moitié de la boîte (`18px`) que
 *     l'écran affiche. Attendre `18px` fait échouer un code correct.
 *  2. Muter `el.style.color` puis lire la couleur d'un DESCENDANT dans le
 *     MÊME `evaluate` renvoie l'ancienne valeur : Chromium n'a pas encore
 *     réinvalidé le `currentColor` substitué à travers `var()` chez l'enfant.
 *     Le parent, lui, est déjà à jour — d'où un faux « la prop color ne
 *     repeint pas l'icône » parfaitement crédible. Vérifié : la même
 *     séquence en deux temps rend `rgb(255, 0, 128)` des deux côtés.
 */

const STORY_ID = 'components-stories-mediavolumecontrol-origammediavolumecontrol-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

const DESIGN_VARIANT = 0
const FUNCTIONAL_VARIANT = 1
const EVENTS_MUTED_VARIANT = 2

/** Les cinq échelons de `size`, tels que les tokens les déclarent. */
const EXPECTED_SIZE = {
    'x-small': { box: '24px', icon: '14px' },
    'small': { box: '30px', icon: '17px' },
    'default': { box: '36px', icon: '20px' },
    'large': { box: '44px', icon: '24px' },
    'x-large': { box: '52px', icon: '28px' }
} as const

/**
 * `36px` (échelon md) + l'offset de densité.
 *
 * ⛔ Les valeurs sont ABSOLUES, pas relatives entre elles : `compact` doit
 * RÉTRÉCIR (−8px) et `comfortable` ÉLARGIR (+8px). Un câblage inversé
 * produirait trois valeurs toujours distinctes — un test qui ne compare que
 * les différences le laisserait passer.
 */
const EXPECTED_DENSITY = {
    'default': '36px',
    'compact': '28px',
    'comfortable': '44px'
} as const

/**
 * `useRounded` : les rungs utilitaires passent par
 * `var(--origam-radius---{rung}, fallback)`, les variantes nommées par
 * `NAMED_RADIUS_TOKEN` (`large` → `radius.xl` → 16px).
 */
const EXPECTED_ROUNDED = {
    'none': '0px',
    'sm': '4px',
    'full': '9999px',
    'large': '16px'
} as const

const DESIGN_BTN = '[data-cy="mvc-design-mute"]'

test.describe('OrigamMediaVolumeControl — surface de thème (#429)', () => {
    test.setTimeout(60000)

    test('les tokens du composant sont DÉCLARÉS, pas seulement lus', async ({ page }) => {
        await page.goto(variantUrl(DESIGN_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const btn = sandbox.locator(DESIGN_BTN)
        await expect(btn).toBeVisible({ timeout: 15000 })

        /*
         * ⛔ C'est CE test qui échoue sur le code d'avant #429 : aucune de ces
         * variables n'était déclarée nulle part, donc `getPropertyValue` renvoie
         * la chaîne vide. Une chaîne vide n'est pas une valeur « par défaut » —
         * c'est l'absence de déclaration, et c'est exactement ce qu'un
         * configurateur de thème ne peut pas atteindre.
         */
        const declared = await btn.evaluate((el) => {
            const cs = getComputedStyle(el)
            const names = [
                '--origam-media-volume-control---density',
                '--origam-media-volume-control--default---density',
                '--origam-media-volume-control--compact---density',
                '--origam-media-volume-control--comfortable---density',
                '--origam-media-volume-control__btn---size',
                '--origam-media-volume-control__btn---size-xs',
                '--origam-media-volume-control__btn---size-sm',
                '--origam-media-volume-control__btn---size-md',
                '--origam-media-volume-control__btn---size-lg',
                '--origam-media-volume-control__btn---size-xl',
                '--origam-media-volume-control__btn---border-radius',
                '--origam-media-volume-control__btn---color',
                '--origam-media-volume-control__btn---background-color',
                '--origam-media-volume-control__btn---opacity',
                '--origam-media-volume-control__btn---transition-duration',
                '--origam-media-volume-control__btn--hover---background-color',
                '--origam-media-volume-control__btn--hover---opacity',
                '--origam-media-volume-control__btn--active---scale',
                '--origam-media-volume-control__icon---font-size',
                '--origam-media-volume-control__icon---font-size-xs',
                '--origam-media-volume-control__icon---font-size-sm',
                '--origam-media-volume-control__icon---font-size-md',
                '--origam-media-volume-control__icon---font-size-lg',
                '--origam-media-volume-control__icon---font-size-xl',
                '--origam-media-volume-control__tooltip---background-color',
                '--origam-media-volume-control__tooltip---color',
                '--origam-media-volume-control__tooltip---padding',
                '--origam-media-volume-control__wrapper---width',
                '--origam-media-volume-control__wrapper---height',
                '--origam-media-volume-control__scrubber---track-background-color',
                '--origam-media-volume-control__scrubber---track-size',
                '--origam-media-volume-control__scrubber---thumb-diameter'
            ]

            return Object.fromEntries(names.map((n) => [ n, cs.getPropertyValue(n).trim() ]))
        })

        for (const [ name, value ] of Object.entries(declared)) {
            expect(value, `${name} doit être déclaré dans la feuille de tokens`).not.toBe('')
        }

        /*
         * Valeurs ABSOLUES, pas seulement « non vides ». Un token câblé sur le
         * mauvais voisin (compact ↔ comfortable) ou déclaré `0` sans unité —
         * ce qui invalide tout le `calc()` qui le consomme — passerait un test
         * qui se contente de vérifier la présence.
         */
        expect(declared['--origam-media-volume-control__btn---size']).toBe('36px')
        expect(declared['--origam-media-volume-control__btn---size-xs']).toBe('24px')
        expect(declared['--origam-media-volume-control__btn---size-xl']).toBe('52px')
        expect(declared['--origam-media-volume-control---density']).toBe('0px')
        expect(declared['--origam-media-volume-control--default---density']).toBe('0px')
        expect(declared['--origam-media-volume-control--compact---density']).toBe('-8px')
        expect(declared['--origam-media-volume-control--comfortable---density']).toBe('8px')
        expect(declared['--origam-media-volume-control__icon---font-size']).toBe('20px')
        expect(declared['--origam-media-volume-control__wrapper---width']).toBe('14px')
        expect(declared['--origam-media-volume-control__wrapper---height']).toBe('80px')
        expect(declared['--origam-media-volume-control__tooltip---padding']).toBe('10px 8px')
    })

    test('prop `size` — cinq échelons rendus par Vue, cinq boîtes ET cinq icônes distinctes', async ({ page }) => {
        await page.goto(variantUrl(DESIGN_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        await expect(sandbox.locator('[data-cy="mvc-size-default-mute"]')).toBeVisible({ timeout: 15000 })

        for (const [ rung, expected ] of Object.entries(EXPECTED_SIZE)) {
            const btn = sandbox.locator(`[data-cy="mvc-size-${rung}-mute"]`)

            const measured = await btn.evaluate((el) => ({
                box: getComputedStyle(el).width,
                icon: getComputedStyle(el.querySelector('.origam-icon') as HTMLElement).fontSize,
                classes: el.className
            }))

            expect(measured.classes, `la prop size=${rung} doit émettre sa classe`)
                .toContain(`origam-media-volume-control--size-${rung}`)
            expect(measured.box, `width pour size=${rung}`).toBe(expected.box)
            expect(measured.icon, `font-size de l'icône pour size=${rung}`).toBe(expected.icon)
        }
    })

    test('prop `density` — trois offsets rendus par Vue, compact rétrécit et comfortable élargit', async ({ page }) => {
        await page.goto(variantUrl(DESIGN_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        await expect(sandbox.locator('[data-cy="mvc-density-default-mute"]')).toBeVisible({ timeout: 15000 })

        for (const [ density, expected ] of Object.entries(EXPECTED_DENSITY)) {
            const btn = sandbox.locator(`[data-cy="mvc-density-${density}-mute"]`)

            const measured = await btn.evaluate((el) => ({
                box: getComputedStyle(el).width,
                classes: el.className
            }))

            expect(measured.classes, `la prop density=${density} doit émettre sa classe`)
                .toContain(`origam-media-volume-control--density-${density}`)
            expect(measured.box, `width pour density=${density}`).toBe(expected)
        }
    })

    test('prop `rounded` — la prop gagne bien le duel de cascade contre le radius scopé', async ({ page }) => {
        await page.goto(variantUrl(DESIGN_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        await expect(sandbox.locator('[data-cy="mvc-rounded-sm-mute"]')).toBeVisible({ timeout: 15000 })

        /*
         * Le duel documenté dans CLAUDE.md : `.origam--rounded-sm` pèse (0,1,0)
         * et le `border-radius` scopé du composant (0,2,0). Sans le compagnon
         * inline de `useRounded`, la prop serait morte. On mesure donc le
         * `border-radius` réellement calculé, pas la présence de la classe.
         */
        for (const [ rung, expected ] of Object.entries(EXPECTED_ROUNDED)) {
            const radius = await sandbox
                .locator(`[data-cy="mvc-rounded-${rung}-mute"]`)
                .evaluate((el) => getComputedStyle(el).borderTopLeftRadius)

            expect(radius, `border-radius pour rounded=${rung}`).toBe(expected)
        }

        // Sans la prop : le token du composant, `--origam-radius---full`.
        const defaultRadius = await sandbox
            .locator(DESIGN_BTN)
            .evaluate((el) => getComputedStyle(el).borderTopLeftRadius)

        expect(defaultRadius, 'défaut = radius.full').toBe('9999px')
    })

    test('prop `color` — trois intents repeignent le bouton ET son icône', async ({ page }) => {
        await page.goto(variantUrl(DESIGN_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        await expect(sandbox.locator('[data-cy="mvc-color-primary-mute"]')).toBeVisible({ timeout: 15000 })

        const neutral = await sandbox.locator(DESIGN_BTN).evaluate((el) => getComputedStyle(el).color)

        const painted: Record<string, { btn: string, icon: string }> = {}

        for (const intent of [ 'primary', 'danger', 'success' ]) {
            painted[intent] = await sandbox
                .locator(`[data-cy="mvc-color-${intent}-mute"]`)
                .evaluate((el) => ({
                    btn: getComputedStyle(el).color,
                    icon: getComputedStyle(el.querySelector('.origam-icon') as HTMLElement).color
                }))
        }

        for (const [ intent, value ] of Object.entries(painted)) {
            expect(value.btn, `color=${intent} doit différer du défaut`).not.toBe(neutral)
            expect(value.icon, `l'icône suit currentColor pour color=${intent}`).toBe(value.btn)
        }

        expect(
            new Set(Object.values(painted).map((v) => v.btn)).size,
            'trois intents, trois couleurs distinctes'
        ).toBe(3)

        /*
         * Valeurs absolues : `useTextColor` résout un intent par son token
         * `fgSubtle` (la teinte de l'intent sur fond neutre), PAS par la paire
         * blanc-sur-saturé de `.origam--color-*`. Cf. #514 — les deux sont des
         * rôles opposés, et c'est la déclaration inline qui gagne.
         */
        expect(painted.primary.btn).toBe('rgb(109, 40, 217)')
    })

    test('le tooltip s\'ouvre au survol et rend un slider vertical accessible', async ({ page }) => {
        await page.goto(variantUrl(FUNCTIONAL_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const btn = sandbox.locator('[data-cy="mvc-functional-mute"]')
        await expect(btn).toBeVisible({ timeout: 15000 })

        await btn.hover()

        const scrubber = sandbox.locator('[data-cy="mvc-functional"][role="slider"]')
        await expect(scrubber).toBeVisible({ timeout: 8000 })

        await expect(scrubber).toHaveAttribute('aria-orientation', 'vertical')
        await expect(scrubber).toHaveAttribute('aria-valuemax', '1')
        await expect(scrubber).toHaveAttribute('aria-valuenow', '0.7')
        await expect(scrubber).toHaveAttribute('aria-valuetext', '70 %')
        await expect(scrubber).toHaveAttribute('aria-label', 'Volume')

        /*
         * Le style du tooltip est écrit dans un `<style scoped>` avec `:deep()`,
         * alors que le contenu est TÉLÉPORTÉ hors de l'arbre du composant. Il
         * n'y arrive que parce qu'`OrigamTooltip` re-pose le `scopeId` du
         * parent sur la racine téléportée. Si cette chaîne casse, la règle
         * devient muette sans erreur — d'où la mesure.
         */
        const wrapper = sandbox.locator('[data-cy="mvc-functional-wrapper"]')
        const geometry = await wrapper.evaluate((el) => {
            const cs = getComputedStyle(el)
            const tooltip = el.closest('.origam-media-volume-control__tooltip') as HTMLElement

            return {
                width: cs.width,
                height: cs.height,
                tooltipFound: Boolean(tooltip),
                tooltipPadding: tooltip ? getComputedStyle(tooltip).padding : null
            }
        })

        expect(geometry.width).toBe('14px')
        expect(geometry.height).toBe('80px')
        expect(geometry.tooltipFound, 'la classe contentClass est bien posée').toBe(true)
        expect(geometry.tooltipPadding, 'la règle :deep() atteint le nœud téléporté').toBe('10px 8px')
    })

    test('l\'icône suit le palier de volume', async ({ page }) => {
        await page.goto(variantUrl(FUNCTIONAL_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const icon = sandbox.locator('[data-cy="mvc-functional-mute"] .origam-icon')
        await expect(icon).toBeVisible({ timeout: 15000 })

        // La story démarre à volume = 0.7 → high.
        await expect(icon).toHaveClass(/mdi-volume-high/)
    })

    test('emit `update:muted` — le clic bascule l\'état ET l\'aria-label', async ({ page }) => {
        await page.goto(variantUrl(EVENTS_MUTED_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const btn = sandbox.locator('[data-cy="mvc-events-muted-mute"]')
        await expect(btn).toBeVisible({ timeout: 15000 })

        await expect(btn).toHaveAttribute('aria-label', 'Mute')

        await btn.click()

        await expect(btn).toHaveAttribute('aria-label', 'Unmute')
        await expect(sandbox.locator('.story-status')).toContainText('true')
        await expect(sandbox.locator('[data-cy="mvc-events-muted-mute"] .origam-icon')).toHaveClass(/mdi-volume-off/)
    })
})

/**
 * SPEC — l'instance du volume DANS OrigamMediaController (#429, suite)
 *
 * ## Le défaut
 *
 * `OrigamMediaController` ne déclare AUCUNE prop de design en propre
 * (`IMediaControllerProps extends ICommonsComponentProps`, rien d'autre) : il
 * ne transmet donc rien, il IMPOSE. Ses sept `origam-btn` reçoivent
 * `variant="text" density="compact"` en dur, et leur boîte est ensuite forcée
 * par un override de variable dans son SCSS scopé. Le volume control, lui, ne
 * recevait NI prop NI variable — il n'avait aucune des deux surfaces. Ses 36px
 * carrés n'étaient donc pas un choix de design : c'était le défaut d'un
 * composant livré sans props.
 *
 * ## ⛔ Mesure AVANT câblage — les voisins ne font PAS 32px carrés
 *
 * L'écart annoncé était « 4px ». La mesure en dit autre chose :
 *
 *     bouton play / cog   32 × 24 px
 *     volume (avant)      36 × 36 px
 *     volume (compact)    28 × 28 px
 *
 * Les Btn du transport sont RECTANGULAIRES : le contrôleur force
 * `--origam-btn---width/height: 32px`, puis la densité compacte de Btn retire
 * 8px à la hauteur seule (`calc(32px - 8px)` = 24px). Le volume control est
 * circulaire, donc carré par construction — une seule valeur pilote ses deux
 * axes. Aucune valeur de `density` ne peut produire 32 × 24.
 *
 * `compact` reste le bon réglage : il aligne le volume sur la même intention
 * (la rangée compacte) et ramène l'écart de hauteur de +12px à +4px. Ce spec
 * épingle les trois nombres pour que la revue visuelle porte sur des faits.
 */

const CONTROLLER_STORY_ID = 'components-stories-mediacontroller-origammediacontroller-story-vue'

test.describe('OrigamMediaVolumeControl dans OrigamMediaController (#429)', () => {
    test.setTimeout(60000)

    test('le volume adopte la densité compacte de la rangée transport', async ({ page }) => {
        await page.goto(`/stories/story/${CONTROLLER_STORY_ID}?variantId=${CONTROLLER_STORY_ID}-0`, { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const row = sandbox.locator('.origam-media-controller__buttons-row').first()
        await expect(row).toBeVisible({ timeout: 15000 })

        const measured = await row.evaluate((el) => {
            const box = (sel: string) => {
                const n = el.querySelector(sel) as HTMLElement | null
                if (!n) return null
                const cs = getComputedStyle(n)

                return { width: cs.width, height: cs.height, classes: n.className }
            }

            return {
                play: box('[data-cy="origam-media-controller-play"]'),
                cog: box('[data-cy="origam-media-controller-config-btn"]'),
                volume: box('[data-cy="origam-media-controller-volume-mute"]')
            }
        })

        /*
         * ⛔ C'est CETTE assertion qui échoue sur le code d'avant : sans la prop
         * `density`, le volume rendait 36px — et avant #429 il n'existait même
         * aucune prop pour le dire.
         */
        expect(measured.volume!.classes).toContain('origam-media-volume-control--density-compact')
        expect(measured.volume!.width, 'volume compact = 36px - 8px').toBe('28px')
        expect(measured.volume!.height, 'le volume reste carré — c\'est un cercle').toBe('28px')

        // Les voisins, pour que l'écart réel vive dans le rapport de test et
        // pas seulement dans une capture d'écran.
        expect(measured.play!.width).toBe('32px')
        expect(measured.play!.height).toBe('24px')
        expect(measured.cog!.width).toBe('32px')
        expect(measured.cog!.height).toBe('24px')
    })
})
