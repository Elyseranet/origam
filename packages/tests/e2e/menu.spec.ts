import { expect, FrameLocator, test } from '@playwright/test'

/**
 * OrigamMenu — suite e2e calée sur la story réelle.
 *
 * ## STORY_ID & Variants (0-based index)
 *
 *   STORY_ID = 'components-stories-menu-origammenu-story-vue'
 *   Navigation : ?variantId=<STORY_ID>-<index>
 *
 *   Index → Titre
 *     0  → Design          init: bgColor/color/rounded/elevation/border/…
 *     1  → Functional      init: openOnClick=true, openOnHover=false, …
 *     2  → Events - update:modelValue  items=defaultItems, @update:model-value
 *     3  → Events - contextmenu        items=defaultItems, @contextmenu
 *     4  → Slots - Activator           items=defaultItems, #activator custom btn
 *     5  → Slots - Default             #default custom <ul> markup
 *     6  → Default (playground)        openOnClick=true, items=defaultItems
 *
 * ## DOM / floating
 *
 *   OrigamMenu passe `absolute` sur OrigamOverlay. Avec `absolute`,
 *   `teleportTarget` est null → le Teleport est disabled → le contenu
 *   reste dans le DOM de la sandbox iframe. On peut donc localiser
 *   `.origam-menu__content` directement dans le frameLocator sandbox.
 *
 *   `.origam-menu` est le root transparent (overlay racine, toujours
 *   présent dans le DOM une fois monté) — ne jamais l'utiliser pour
 *   asserter la visibilité (faux positif). Toujours asserter sur
 *   `.origam-menu__content`.
 *
 * ## Pattern click
 *
 *   1. Localiser `.origam-btn` (l'activateur dans chaque story).
 *   2. `await expect(activator).toBeVisible({ timeout: 35000 })`.
 *   3. `await activator.click()`.
 *   4. `await expect(sandbox.locator('.origam-menu__content')).toBeVisible({ timeout: 12000 })`.
 *
 *   Pas de `waitForLoadState('networkidle')` (Histoire garde un WS HMR
 *   ouvert → networkidle ne résout jamais). Pas de `data-cy` dans les
 *   stories canoniques. Le bouton activateur est `.origam-btn` dans
 *   chaque sandbox.
 *
 * ## Wrapper transparency
 *
 *   La régression "wrapper-bg" (box-shadow + bg sur le root `.origam-menu`
 *   au lieu du corps `.origam-menu__content`) a été réparée dans la même
 *   famille de bug que OrigamTooltip. Les tests assertent que le root
 *   est transparent ET que le corps porte la surface visible.
 */

const STORY_ID   = 'components-stories-menu-origammenu-story-vue'
// Story URLs live at `/stories/story/<id>` (Histoire vite.base = '/stories/').
// Use a root-relative path so it resolves against the configured baseURL —
// mirrors the passing specs (btn/stepper). The previous absolute form doubled
// the `/stories/` segment (`.../stories/stories/story/...`) → 404 → the sandbox
// never rendered and every menu assertion timed out.
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

/**
 * Clic sur l'activateur dans la sandbox et attente que le menu
 * soit visible. Retourne les locators activator + menu content.
 *
 * Timeout 35s sur l'activateur : Histoire applique `.htw-sandbox-hidden`
 * (display:none) pendant le chargement initial du composant. Le premier
 * test qui touche une story "froide" peut mettre 25-30s avant que le
 * rendu soit révélé.
 */
const openMenu = async (sandbox: FrameLocator) => {
    const activator = sandbox.locator('.origam-btn').first()
    await expect(activator).toBeVisible({ timeout: 35000 })
    await activator.click()
    const content = sandbox.locator('.origam-menu__content')
    await expect(content).toBeVisible({ timeout: 12000 })
    return { activator, content }
}

test.describe('OrigamMenu', () => {
    test.setTimeout(60000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: bgColor/color/rounded/elevation/border/offset=8               //
    // ------------------------------------------------------------------ //

    test.describe('Design (index 0)', () => {
        test('activateur .origam-btn visible dans la sandbox', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-btn').first()).toBeVisible({ timeout: 35000 })
        })

        test('menu root .origam-menu porte la classe BEM (attaché quand le menu est ouvert)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            // Ouvrir le menu — l'overlay monte son wrapper au premier rendu
            await openMenu(sandbox)
            await expect(sandbox.locator('.origam-menu').first()).toBeAttached()
        })

        test('wrapper .origam-menu est transparent (pas de rectangle plein-iframe)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { activator: _activator } = await openMenu(sandbox)
            const wrapperBg = await sandbox.locator('.origam-menu').first()
                .evaluate(el => getComputedStyle(el).backgroundColor)
            expect(wrapperBg).toBe('rgba(0, 0, 0, 0)')
        })

        test('corps .origam-menu__content apparaît au clic et porte une surface non transparente', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openMenu(sandbox)
            const bg = await content.evaluate(el => getComputedStyle(el).backgroundColor)
            expect(bg).not.toBe('rgba(0, 0, 0, 0)')
        })

        test('corps porte le border-radius par défaut (8px)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openMenu(sandbox)
            const borderRadius = await content.evaluate(el => getComputedStyle(el).borderRadius)
            expect(borderRadius).toBe('8px')
        })

        test('corps porte une box-shadow (elevation token)', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openMenu(sandbox)
            const boxShadow = await content.evaluate(el => getComputedStyle(el).boxShadow)
            expect(boxShadow).not.toBe('none')
        })

        test('corps est display:inline-block', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openMenu(sandbox)
            const display = await content.evaluate(el => getComputedStyle(el).display)
            expect(display).toBe('inline-block')
        })

        test('items par défaut (Edit / Duplicate / Delete) s affichent dans .origam-menu__items', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openMenu(sandbox)
            const items = content.locator('.origam-menu__items')
            await expect(items).toBeVisible({ timeout: 5000 })
            await expect(items).toContainText('Edit')
            await expect(items).toContainText('Duplicate')
            await expect(items).toContainText('Delete')
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: openOnClick=true, closeOnContentClick=true, …                 //
    // ------------------------------------------------------------------ //

    test.describe('Functional (index 1)', () => {
        test('menu s ouvre au clic sur l activateur (openOnClick=true)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openMenu(sandbox)
            await expect(content).toBeVisible()
        })

        test('menu affiche la liste des items (Edit / Duplicate / Delete)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openMenu(sandbox)
            await expect(content).toContainText('Edit')
            await expect(content).toContainText('Duplicate')
            await expect(content).toContainText('Delete')
        })

        test('closeOnContentClick=true — clic sur un item ferme le menu', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openMenu(sandbox)
            // Clic sur le premier item de la liste
            const firstItem = content.locator('.origam-menu__item').first()
            await expect(firstItem).toBeVisible({ timeout: 5000 })
            await firstItem.click()
            await expect(content).not.toBeVisible({ timeout: 5000 })
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - update:modelValue (index 2)                                 //
    // items=defaultItems, @update:model-value="logEvent"                  //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:modelValue (index 2)', () => {
        test('menu s ouvre au clic (proxy de l emit update:modelValue)', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openMenu(sandbox)
            await expect(content).toBeVisible()
        })

        test('activateur porte aria-expanded="true" quand le menu est ouvert', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { activator } = await openMenu(sandbox)
            const ariaExpanded = await activator.evaluate(el => el.getAttribute('aria-expanded'))
            expect(ariaExpanded).toBe('true')
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - contextmenu (index 3)                                       //
    // items=defaultItems, @contextmenu="logEvent"                         //
    // ------------------------------------------------------------------ //

    test.describe('Events - contextmenu (index 3)', () => {
        test('activateur .origam-btn visible', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-btn').first()).toBeVisible({ timeout: 35000 })
        })

        test('menu s ouvre au clic gauche (openOnClick reste la valeur par défaut)', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openMenu(sandbox)
            await expect(content).toBeVisible()
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - ACTIVATOR (index 4)                                          //
    // #activator custom : origam-btn bg-color="primary" color="white"     //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Activator (index 4)', () => {
        test('le slot #activator rend un bouton personnalisé', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 35000 })
            await expect(btn.locator('.origam-btn__content')).toContainText('Custom activator slot')
        })

        test('menu s ouvre au clic de l activateur custom', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openMenu(sandbox)
            await expect(content).toContainText('Edit')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - DEFAULT (index 5)                                            //
    // #default custom <ul> markup (pas d items prop)                      //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default (index 5)', () => {
        test('le slot #default rend du markup personnalisé dans le corps du menu', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openMenu(sandbox)
            // La variant Slots - Default contient :
            //   <li>Custom slot</li> + <li>Any markup goes here.</li>
            await expect(content).toContainText('Custom slot')
            await expect(content).toContainText('Any markup goes here.')
        })

        test('le slot #default n utilise pas origam-menu__items (pas de prop items)', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openMenu(sandbox)
            // Aucun <ul class="origam-list-group origam-menu__items"> quand le
            // slot par défaut est utilisé — le contenu est du markup libre.
            const itemsList = content.locator('.origam-menu__items')
            await expect(itemsList).toHaveCount(0)
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 6)                                       //
    // init: openOnClick=true, closeOnContentClick=true, offset=8          //
    // ------------------------------------------------------------------ //

    test.describe('Default / Playground (index 6)', () => {
        test('menu s ouvre au clic avec l état seedé du playground', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openMenu(sandbox)
            await expect(content).toBeVisible()
        })

        test('offset=8 — l overlay content a des coordonnées pixel calculées', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await openMenu(sandbox)

            // L'overlay content doit avoir des coordonnées calculées (top/left en px)
            // — preuve que la location strategy a tourné avec l'offset.
            const overlayContent = sandbox.locator('.origam-overlay__content').first()
            await expect(overlayContent).toBeAttached()
            const styles = await overlayContent.evaluate(el => {
                const cs = getComputedStyle(el)
                return { top: cs.top, left: cs.left }
            })
            expect(styles.top).toMatch(/\d+px/)
            expect(styles.left).toMatch(/\d+px/)
        })

        test('activateur porte aria-haspopup="menu"', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const activator = sandbox.locator('.origam-btn').first()
            await expect(activator).toBeVisible({ timeout: 35000 })
            const ariaHasPopup = await activator.evaluate(el => el.getAttribute('aria-haspopup'))
            expect(ariaHasPopup).toBe('menu')
        })

        test('activateur porte aria-expanded="false" à l état initial fermé', async ({ page }) => {
            await page.goto(variantUrl(6))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const activator = sandbox.locator('.origam-btn').first()
            await expect(activator).toBeVisible({ timeout: 35000 })
            const ariaExpanded = await activator.evaluate(el => el.getAttribute('aria-expanded'))
            expect(ariaExpanded).toBe('false')
        })
    })
})
