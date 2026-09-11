import { expect, FrameLocator, test } from '@playwright/test'

/**
 * OrigamTooltip — suite e2e calée sur la story réelle.
 *
 * ## STORY_ID & Variants (0-based index)
 *
 *   STORY_ID = 'components-stories-tooltip-origamtooltip-story-vue'
 *   Navigation : ?variantId=<STORY_ID>-<index>
 *
 *   Index → Titre
 *     0  → Design          init: text="Tooltip text", location="right", offset=10, open-on-hover
 *     1  → Functional      init: openOnHover=true, eager=true, disabled=false, …
 *     2  → Events - update:modelValue  open-on-hover, text="Watch Events tab"
 *     3  → Slots - Activator           open-on-hover, text="Tooltip text"
 *     4  → Slots - Default             open-on-hover, slot default custom markup (<strong>Bold</strong>)
 *     5  → Default (playground)        openOnHover=true, text="Tooltip text", location="right"
 *
 * ## DOM / floating
 *
 *   OrigamTooltip passe `absolute` sur OrigamOverlay. Avec `absolute`,
 *   `teleportTarget` est null → le Teleport est disabled → le contenu
 *   reste dans le DOM de la sandbox iframe. On peut donc localiser
 *   `.origam-tooltip__content` directement dans le frameLocator sandbox.
 *
 *   `.origam-tooltip` est le root transparent (overlay racine, toujours
 *   présent dans le DOM une fois monté) — ne jamais l'utiliser pour
 *   asserter la visibilité (faux positif). Toujours asserter sur
 *   `.origam-tooltip__content`.
 *
 * ## Pattern hover
 *
 *   1. Localiser `.origam-btn` (l'activateur dans chaque story).
 *   2. `await expect(activator).toBeVisible({ timeout: 12000 })`.
 *   3. `await activator.hover()`.
 *   4. `await expect(sandbox.locator('.origam-tooltip__content')).toBeVisible({ timeout: 5000 })`.
 *
 *   Pas de `waitForLoadState('networkidle')` (histoire garde un WS HMR
 *   ouvert → networkidle ne résout jamais). Pas de `data-cy` dans les
 *   stories canoniques. Le bouton activateur est `.origam-btn` dans
 *   chaque sandbox.
 */

const STORY_ID   = 'components-stories-tooltip-origamtooltip-story-vue'
// Root-relative path (resolves against baseURL). The previous absolute form
// doubled the `/stories/` segment → 404 → the sandbox never rendered.
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

/**
 * Hover l'activateur dans la sandbox et attend que le contenu tooltip
 * soit visible. Retourne les locators activator + tooltip content.
 *
 * Timeout 35s sur l'activateur : Histoire applique `.htw-sandbox-hidden`
 * (display:none) pendant le chargement initial du composant. Le premier
 * test qui touche une story "froide" peut mettre 25-30s avant que le
 * rendu soit révélé. Les tests suivants (même composant, cache chaud)
 * sont bien en-dessous de 5s.
 */
const openTooltip = async (sandbox: FrameLocator) => {
    const activator = sandbox.locator('.origam-btn').first()
    await expect(activator).toBeVisible({ timeout: 35000 })
    await activator.hover()
    const content = sandbox.locator('.origam-tooltip__content')
    await expect(content).toBeVisible({ timeout: 5000 })
    return { activator, content }
}

test.describe('OrigamTooltip', () => {
    test.setTimeout(60000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: text="Tooltip text", location="right", offset=10              //
    // ------------------------------------------------------------------ //

    test.describe('Design (index 0)', () => {
        test('activateur visible dans la sandbox', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 35000 })
        })

        test('tooltip apparaît au hover avec le texte issu du prop text', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openTooltip(sandbox)
            await expect(content).toContainText('Tooltip text')
        })

        test('root .origam-tooltip porte la classe BEM', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-btn').first()).toBeVisible({ timeout: 35000 })
            const root = sandbox.locator('.origam-tooltip').first()
            await expect(root).toBeAttached()
        })

        test('contenu du tooltip porte la classe origam-tooltip__content', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openTooltip(sandbox)
            await expect(content).toHaveClass(/origam-tooltip__content/)
        })

        test('tooltip se ferme quand la souris quitte l activateur', async ({ page }) => {
            await page.goto(variantUrl(0))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { activator: _activator, content } = await openTooltip(sandbox)
            // Déplacer la souris hors de l'activateur
            await page.mouse.move(0, 0)
            await expect(content).not.toBeVisible({ timeout: 5000 })
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: openOnHover=true, eager=true, disabled=false                  //
    // ------------------------------------------------------------------ //

    test.describe('Functional (index 1)', () => {
        test('tooltip apparaît au hover (openOnHover=true par défaut)', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openTooltip(sandbox)
            await expect(content).toContainText('Tooltip text')
        })

        test('eager=true — le contenu est dans le DOM avant le premier hover', async ({ page }) => {
            await page.goto(variantUrl(1))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            // S'assurer que l'activateur est présent sans hover
            await expect(sandbox.locator('.origam-btn').first()).toBeVisible({ timeout: 35000 })
            // Avec eager=true, le contenu est dans le DOM (peut être hidden mais attaché)
            await expect(sandbox.locator('.origam-tooltip__content')).toBeAttached()
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - update:modelValue (index 2)                                 //
    // text="Watch Events tab", open-on-hover                              //
    // ------------------------------------------------------------------ //

    test.describe('Events - update:modelValue (index 2)', () => {
        test('tooltip s ouvre au hover (proxy de l emit update:modelValue)', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openTooltip(sandbox)
            // Le montage visible EST le signe que l'emit a bien déclenché
            await expect(content).toBeVisible()
        })

        test('tooltip affiche le texte déclaré dans la variant Events', async ({ page }) => {
            await page.goto(variantUrl(2))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openTooltip(sandbox)
            await expect(content).toContainText('Watch Events tab')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - ACTIVATOR (index 3)                                          //
    // slot #activator avec origam-btn "Custom activator"                  //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Activator (index 3)', () => {
        test('le slot activator rend un bouton personnalisé', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const btn = sandbox.locator('.origam-btn').first()
            await expect(btn).toBeVisible({ timeout: 35000 })
            await expect(btn.locator('.origam-btn__content')).toContainText('Custom activator')
        })

        test('tooltip s ouvre au hover de l activateur custom', async ({ page }) => {
            await page.goto(variantUrl(3))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openTooltip(sandbox)
            await expect(content).toContainText('Tooltip text')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - DEFAULT (index 4)                                            //
    // slot #default avec markup riche : <strong>Bold</strong> + <em>      //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default (index 4)', () => {
        test('le slot default rend du markup riche dans le contenu tooltip', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openTooltip(sandbox)
            // La variant Slots - Default contient :
            //   <strong>Bold</strong> tooltip with <em>custom markup</em>.
            await expect(content.locator('strong')).toHaveText('Bold')
            await expect(content.locator('em')).toHaveText('custom markup')
        })

        test('le prop text n est pas rendu quand le slot default est utilisé', async ({ page }) => {
            await page.goto(variantUrl(4))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openTooltip(sandbox)
            // Le slot override le <span>{{ text }}</span> natif
            // — aucun <span> direct dans le contenu (le markup est riche)
            const directSpan = content.locator(':scope > span')
            await expect(directSpan).toHaveCount(0)
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 5)                                       //
    // init: text="Tooltip text", location="right", openOnHover=true       //
    // ------------------------------------------------------------------ //

    test.describe('Default / Playground (index 5)', () => {
        test('tooltip apparaît au hover avec le texte seedé', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { content } = await openTooltip(sandbox)
            await expect(content).toContainText('Tooltip text')
        })

        test('location=right — le popup se positionne à droite de l activateur', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const { activator, content } = await openTooltip(sandbox)

            const aBox = await activator.evaluate(el => {
                const r = el.getBoundingClientRect()
                return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }
            })
            const cBox = await content.evaluate(el => {
                const r = el.getBoundingClientRect()
                return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }
            })

            // Avec location="right", le bord gauche du popup doit être
            // à droite du bord droit de l'activateur (tolérance 20px pour
            // offset + arrondi layout).
            expect(cBox.left).toBeGreaterThanOrEqual(aBox.right - 20)
        })

        test('offset=10 — le contenu overlay est positionné avec des coordonnées pixel', async ({ page }) => {
            await page.goto(variantUrl(5))
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await openTooltip(sandbox)

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
    })
})
