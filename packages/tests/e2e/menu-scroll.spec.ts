import { expect, FrameLocator, Page, test } from '@playwright/test'

/**
 * #742 — OrigamMenu / OrigamSelect : la liste doit DÉFILER, pas déborder.
 *
 * ## Le défaut
 *
 * Le plafond de hauteur et le `overflow` étaient posés sur DEUX boîtes
 * différentes. Mesuré dans Chromium sur `develop` (30 options) :
 *
 * | boîte                      | max-height | clientH | scrollH | overflow-y | scrollTop après `= 9999` |
 * |----------------------------|-----------:|--------:|--------:|------------|-------------------------:|
 * | `.origam-overlay__content` |      240px |     240 |    1453 | visible    |                        0 |
 * | `.origam-menu__content`    |      580px |     580 |    1448 | visible    |                        0 |
 * | `.origam-menu__list`       |       none |    1448 |    1448 | **auto**   |                        0 |
 *
 * La seule boîte qui savait défiler (`__list`) n'avait aucun plafond, donc
 * `clientHeight === scrollHeight` : rien à faire défiler. Les deux boîtes
 * plafonnées gardaient `overflow: visible`, donc leur contenu ressortait.
 * Résultat : les options du bas sont inatteignables, souris et clavier.
 *
 * ## Ce que ce spec vérifie
 *
 * 1. **Le scrollport existe** : `.origam-menu__content` a `overflow-y: auto`
 *    ET `scrollHeight > clientHeight`.
 * 2. **Il défile vraiment**, à la molette — pas par une écriture de
 *    `scrollTop` (qui « réussit » sur une boîte que l'utilisateur ne peut pas
 *    manipuler) mais par l'entrée réelle.
 * 3. **La dernière option est ATTEIGNABLE** : après défilement, son rectangle
 *    est entièrement contenu dans le rectangle client du scrollport, et le
 *    scrollport est dans le viewport. C'est le critère du ticket — « ça
 *    défile » n'est pas une preuve, la dernière option visible en est une.
 *
 * ## Contrôle positif (obligatoire)
 *
 * `reachability()` est d'abord exercé sur la PREMIÈRE option, sans défiler :
 * si le harnais ne sait pas voir une option atteignable, son verdict sur la
 * dernière ne vaut rien. Et sur la story courte (3 items, aucun débordement)
 * la dernière option est atteignable SANS défilement — le harnais ne répond
 * donc pas « inatteignable » par construction.
 *
 * ## Index 0-based des Variants — POSITIONNELS
 *
 * Menu   : 9 = « Long list - token ceiling », 10 = « Long list - prop ceiling »,
 *          8 = « Nested submenu », 7 = « Default » (3 items, contrôle positif).
 * Select : 29 = « Long list ».
 * Les deux Variants « Long list » ont été appendus EN DERNIER pour ne décaler
 * aucun index déjà documenté dans `menu.spec.ts` / `select.spec.ts`.
 */

const MENU_ID = 'components-stories-menu-origammenu-story-vue'
const SELECT_ID = 'components-stories-select-origamselect-story-vue'

const variantUrl = (storyId: string, idx: number) =>
    `/stories/story/${ storyId }?variantId=${ storyId }-${ idx }`

interface IGeometry {
    itemCount: number
    port: { overflowY: string, clientHeight: number, scrollHeight: number, top: number, bottom: number }
    firstReachable: boolean
    lastReachable: boolean
    lastRect: { top: number, bottom: number, text: string } | null
    scrollTop: number
    viewportH: number
}

/**
 * Une option est ATTEIGNABLE quand son rectangle est entièrement contenu
 * dans le rectangle client du scrollport ET que ce rectangle est lui-même
 * dans le viewport. Tolérance 1px (sous-pixel de bordure).
 */
const measure = async (sandbox: FrameLocator, itemSelector: string): Promise<IGeometry> =>
    sandbox.locator('.origam-menu__content').first().evaluate((port, sel) => {
        const cs = getComputedStyle(port)
        const portRect = port.getBoundingClientRect()
        const items = Array.from(port.querySelectorAll(sel)) as HTMLElement[]

        const reachable = (el: HTMLElement | undefined) => {
            if (!el) return false
            const r = el.getBoundingClientRect()
            if (r.height === 0 || r.width === 0) return false
            const insidePort = r.top >= portRect.top - 1 && r.bottom <= portRect.bottom + 1
            const insideViewport = r.top >= -1 && r.bottom <= window.innerHeight + 1
            return insidePort && insideViewport
        }

        const last = items[items.length - 1]

        return {
            itemCount: items.length,
            port: {
                overflowY: cs.overflowY,
                clientHeight: port.clientHeight,
                scrollHeight: port.scrollHeight,
                top: Math.round(portRect.top),
                bottom: Math.round(portRect.bottom)
            },
            firstReachable: reachable(items[0]),
            lastReachable: reachable(last),
            lastRect: last
                ? {
                    top: Math.round(last.getBoundingClientRect().top),
                    bottom: Math.round(last.getBoundingClientRect().bottom),
                    text: (last.textContent ?? '').trim().slice(0, 24)
                }
                : null,
            scrollTop: port.scrollTop,
            viewportH: window.innerHeight
        }
    }, itemSelector)

/** Défile à la MOLETTE au-dessus du scrollport — entrée utilisateur réelle. */
const wheelToBottom = async (page: Page, sandbox: FrameLocator) => {
    const port = sandbox.locator('.origam-menu__content').first()
    const box = await port.boundingBox()
    if (!box) throw new Error('scrollport sans boundingBox — le menu n’est pas rendu')
    // boundingBox() d'un frameLocator est déjà en coordonnées page.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    for (let i = 0; i < 12; i++) await page.mouse.wheel(0, 500)
    await page.waitForTimeout(400)
}

/**
 * Verse la mesure geometrique dans la sortie du runner : c'est la preuve
 * chiffree que la PR cite, dans les deux sens de l'A/B.
 */
const report = (label: string, before: IGeometry, after: IGeometry) => {
    const line = (tag: string, g: IGeometry) =>
        `${ label }/${ tag } port=${ g.port.clientHeight }/${ g.port.scrollHeight } ` +
        `overflow-y=${ g.port.overflowY } scrollTop=${ g.scrollTop } ` +
        `derniere=[${ g.lastRect?.top }..${ g.lastRect?.bottom }] ` +
        `atteignable=${ g.lastReachable }`
    console.log('[#742] ' + line('avant', before))
    console.log('[#742] ' + line('apres', after))
}

const openMenuVariant = async (page: Page, idx: number) => {
    await page.goto(variantUrl(MENU_ID, idx), { waitUntil: 'domcontentloaded' })
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    const activator = sandbox.locator('.origam-btn').first()
    await expect(activator).toBeVisible({ timeout: 35000 })
    await activator.click()
    await expect(sandbox.locator('.origam-menu__content')).toBeVisible({ timeout: 12000 })
    await page.waitForTimeout(500)
    return sandbox
}

const openSelectVariant = async (page: Page, idx: number) => {
    await page.goto(variantUrl(SELECT_ID, idx), { waitUntil: 'domcontentloaded' })
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    const field = sandbox.locator('.origam-select').first()
    await expect(field).toBeVisible({ timeout: 35000 })
    await field.click()
    await expect(sandbox.locator('.origam-menu__content')).toBeVisible({ timeout: 12000 })
    await page.waitForTimeout(500)
    return sandbox
}

test.describe('#742 — le plafond et le défilement portent sur la même boîte', () => {
    test.setTimeout(90000)

    // ------------------------------------------------------------------ //
    // CONTRÔLE POSITIF — le harnais sait voir une option ATTEIGNABLE      //
    // ------------------------------------------------------------------ //

    test('contrôle positif : menu court (3 items) — toutes les options atteignables SANS défiler', async ({ page }) => {
        const sandbox = await openMenuVariant(page, 7)
        const g = await measure(sandbox, '.origam-menu__item')

        expect(g.itemCount).toBe(3)
        // Aucun débordement : le scrollport n'a rien à faire défiler…
        expect(g.port.scrollHeight).toBeLessThanOrEqual(g.port.clientHeight + 1)
        // …et le harnais répond BIEN « atteignable » aux deux bouts.
        expect(g.firstReachable).toBe(true)
        expect(g.lastReachable).toBe(true)
    })

    // ------------------------------------------------------------------ //
    // MENU — plafond porté par le token (--origam-menu---max-height)      //
    // ------------------------------------------------------------------ //

    test('menu, plafond token : 30 options — le scrollport défile et la dernière option devient atteignable', async ({ page }) => {
        const sandbox = await openMenuVariant(page, 9)

        const before = await measure(sandbox, '.origam-menu__item')
        expect(before.itemCount).toBe(30)
        // Contrôle positif local : la 1re option est atteignable d'emblée.
        expect(before.firstReachable).toBe(true)
        // Le contenu déborde bel et bien du plafond.
        expect(before.port.scrollHeight).toBeGreaterThan(before.port.clientHeight)
        expect(before.lastReachable).toBe(false)

        await wheelToBottom(page, sandbox)
        const after = await measure(sandbox, '.origam-menu__item')
        report('menu/token', before, after)

        // Le critère du ticket, AVANT toute assertion structurelle : après
        // avoir molette-é jusqu'en bas, la 30e option est-elle atteignable ?
        expect(after.lastReachable).toBe(true)
        expect(after.scrollTop).toBeGreaterThan(0)
        // Et la boîte plafonnée est bien CELLE qui défile.
        expect(after.port.overflowY).toBe('auto')
    })

    // ------------------------------------------------------------------ //
    // MENU — plafond porté par la prop max-height (chemin d'OrigamSelect) //
    // ------------------------------------------------------------------ //

    test('menu, plafond prop max-height : le plafond du PARENT contraint le scrollport', async ({ page }) => {
        const sandbox = await openMenuVariant(page, 10)

        const before = await measure(sandbox, '.origam-menu__item')
        expect(before.itemCount).toBe(30)
        expect(before.firstReachable).toBe(true)
        expect(before.lastReachable).toBe(false)

        await wheelToBottom(page, sandbox)
        const after = await measure(sandbox, '.origam-menu__item')
        report('menu/prop', before, after)

        expect(after.lastReachable).toBe(true)
        expect(after.scrollTop).toBeGreaterThan(0)
        expect(after.port.overflowY).toBe('auto')
        // `max-height="240"` est posé en inline par useDimension sur
        // `.origam-overlay__content`, PARENT du scrollport. Sans le conteneur
        // flex, le scrollport gardait sa propre hauteur (580px mesurés) et le
        // plafond du parent ne lui était pas opposable.
        expect(after.port.clientHeight).toBeLessThanOrEqual(240)
        expect(after.port.scrollHeight).toBeGreaterThan(after.port.clientHeight)
    })

    // ------------------------------------------------------------------ //
    // SELECT — le cas du ticket (30 options, plafond interne de 310px)    //
    // ------------------------------------------------------------------ //

    test('select, 30 options : la dernière option est atteignable après défilement', async ({ page }) => {
        const sandbox = await openSelectVariant(page, 29)

        const before = await measure(sandbox, '.origam-list-item')
        expect(before.itemCount).toBe(30)
        expect(before.firstReachable).toBe(true)
        expect(before.lastReachable).toBe(false)

        await wheelToBottom(page, sandbox)
        const after = await measure(sandbox, '.origam-list-item')
        report('select', before, after)

        expect(after.lastReachable).toBe(true)
        expect(after.lastRect?.text).toContain('Option 30')
        expect(after.scrollTop).toBeGreaterThan(0)
        expect(after.port.overflowY).toBe('auto')
        // OrigamSelect passe `:max-height="310"` à son OrigamMenu interne.
        expect(after.port.clientHeight).toBeLessThanOrEqual(310)
        expect(after.port.scrollHeight).toBeGreaterThan(after.port.clientHeight)
    })

    // ------------------------------------------------------------------ //
    // NON-RÉGRESSION — le sous-menu n'est PAS rogné par le scrollport     //
    // ------------------------------------------------------------------ //

    test('sous-menu : le flyout reste hors du scrollport (téléporté) et n’est pas rogné', async ({ page }) => {
        const sandbox = await openMenuVariant(page, 8)

        await sandbox.locator('.origam-menu__item').first().click()
        await page.waitForTimeout(700)

        const dump = await sandbox.locator('.origam-menu__content').first().evaluate((root) => {
            const panels = Array.from(document.querySelectorAll('.origam-menu__content')) as HTMLElement[]
            return panels.map((el) => {
                const r = el.getBoundingClientRect()
                return {
                    isRoot: el === root,
                    // Un descendant DOM du scrollport SERAIT rogné. `useTeleport`
                    // résout `attach || contained` à `false` → `document.body`,
                    // donc chaque niveau vit dans `body > .origam-overlay-container`.
                    insideRoot: el !== root && root.contains(el),
                    visible: r.width > 0 && r.height > 0,
                    inViewport: r.top >= 0 && r.bottom <= window.innerHeight,
                    text: (el.textContent ?? '').replace(/\s+/g, ' ').trim()
                }
            })
        })

        expect(dump.length).toBe(2)
        const flyout = dump.find(d => !d.isRoot)
        expect(flyout).toBeDefined()
        expect(flyout!.insideRoot).toBe(false)
        expect(flyout!.visible).toBe(true)
        expect(flyout!.inViewport).toBe(true)
        expect(flyout!.text).toContain('Open')
    })
})
