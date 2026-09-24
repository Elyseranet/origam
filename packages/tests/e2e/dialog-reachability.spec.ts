import { expect, FrameLocator, Page, test } from '@playwright/test'

/**
 * #563 — `OrigamDialog` : le contenu rendu HORS de `.origam-card__content`
 * doit rester ATTEIGNABLE.
 *
 * ## Le défaut, tel que MESURÉ (pas tel que décrit par le ticket)
 *
 * `.origam-overlay__content` est `position: absolute` et de hauteur AUTO :
 * le `max-height: 100%` posé par le dialogue sur `.origam-card` se résout
 * donc en `none`. La carte grandit sans plafond, et l'overlay la laissait
 * déborder en `overflow: visible`. `scrollStrategy: 'block'` interdit par
 * ailleurs au document de défiler.
 *
 * ⛔ Le ticket affirme que « seul `.origam-card__content` défile ». MESURÉ
 * FAUX : sans hauteur définie en amont, `__content` grandit lui aussi
 * (`clientHeight === scrollHeight`). AUCUNE boîte du dialogue ne défilait —
 * ni le contenu, ni ses frères. C'est pourquoi ce spec mesure les deux :
 * `#probe-body` est DANS `__content`, `#probe-tail` est le pied, à côté.
 *
 * ## Le critère de mesure (repris de #742)
 *
 * Un défaut de défilement se mesure par CE QUE L'UTILISATEUR PEUT ATTEINDRE,
 * pas par une propriété CSS. Un élément est ATTEIGNABLE quand son rectangle
 * est entièrement contenu dans le rectangle de CHAQUE ancêtre qui rogne
 * (`overflow != visible`) ET dans le viewport. Tolérance 1px (sous-pixel).
 *
 * `scrollTop = 9999` n'est pas une preuve : ça « réussit » sur une boîte que
 * l'utilisateur ne peut pas manipuler. Le défilement est donc exercé à la
 * MOLETTE, entrée réelle.
 *
 * ## Contrôle positif (obligatoire)
 *
 * Le Variant « Slots - Content » (index 7) ne déborde pas : son contenu doit
 * être déclaré ATTEIGNABLE sans le moindre défilement. Si le harnais ne sait
 * pas voir un élément atteignable, son verdict « inatteignable » sur le
 * Variant qui déborde ne vaut rien.
 *
 * ## Pourquoi ce spec ne peut pas vivre sous Vitest
 *
 * Le plafond du dialogue est `var(--origam-dialog---max-height, calc(100vh - 48px))`.
 * Sous jsdom, `getComputedStyle` ne résout jamais un `var()` et fabrique un
 * `16px` (CLAUDE.md #398) ; il n'y a de surcroît ni layout ni scroll. Tout
 * verdict Vitest serait faux. Navigateur réel obligatoire.
 *
 * ## Index 0-based des Variants — POSITIONNELS
 *
 * 7  = « Slots - Content » (court — contrôle positif).
 * 19 = « Overflowing content - reachability probe » (APPENDU EN DERNIER,
 *      aucun index préexistant décalé).
 */

const STORY_ID = 'components-stories-dialog-origamdialog-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const SHORT_VARIANT = 7
const OVERFLOW_VARIANT = 19

const variantUrl = (idx: number) => `${ STORY_PATH }?variantId=${ STORY_ID }-${ idx }`

interface IReach {
    found: boolean
    reachable: boolean
    belowViewportBy: number
    rect: { top: number, bottom: number, height: number }
    clippingAncestors: Array<{ selector: string, overflowY: string, clientHeight: number, scrollHeight: number, canScroll: boolean }>
    scrollableAncestors: Array<string>
    docCanScroll: boolean
    viewportHeight: number
}

/**
 * Mesure l'atteignabilité d'un élément : rectangle entièrement contenu dans
 * chaque ancêtre qui rogne, et dans le viewport. Renvoie aussi la chaîne
 * d'ancêtres, pour que la mesure avant/après soit lisible dans le ticket.
 */
const reach = async (sandbox: FrameLocator, selector: string): Promise<IReach> =>
    sandbox.locator('body').evaluate((body, sel) => {
        const TOL = 1
        const el = body.ownerDocument.querySelector(sel) as HTMLElement | null

        const label = (node: Element) => {
            const cls = (node.getAttribute('class') ?? '').trim().split(/\s+/).filter(Boolean)[0]

            return node.id ? `#${ node.id }` : (cls ? `.${ cls }` : node.tagName.toLowerCase())
        }

        const doc = body.ownerDocument
        const scroller = doc.scrollingElement as HTMLElement
        const docCanScroll = !!scroller && scroller.scrollHeight > scroller.clientHeight + TOL
            && getComputedStyle(doc.body).overflowY !== 'hidden'

        if (!el) {
            return {
                found: false,
                reachable: false,
                belowViewportBy: 0,
                rect: { top: 0, bottom: 0, height: 0 },
                clippingAncestors: [],
                scrollableAncestors: [],
                docCanScroll,
                viewportHeight: window.innerHeight
            }
        }

        const rect = el.getBoundingClientRect()
        const clipping: Array<{ selector: string, overflowY: string, clientHeight: number, scrollHeight: number, canScroll: boolean }> = []
        const scrollable: Array<string> = []

        let node = el.parentElement
        while (node) {
            const cs = getComputedStyle(node)
            const canScroll = [ 'auto', 'scroll', 'overlay' ].includes(cs.overflowY)
                && node.scrollHeight > node.clientHeight + TOL

            if (canScroll) scrollable.push(label(node))

            if (cs.overflowY !== 'visible' || cs.overflowX !== 'visible') {
                clipping.push({
                    selector: label(node),
                    overflowY: cs.overflowY,
                    clientHeight: node.clientHeight,
                    scrollHeight: node.scrollHeight,
                    canScroll
                })
            }

            node = node.parentElement
        }

        const insideViewport = rect.top >= -TOL && rect.bottom <= window.innerHeight + TOL

        // Containment reelle, evaluee sur les noeuds eux-memes (les libelles
        // ci-dessus ne servent qu'a la lisibilite du rapport).
        let contained = true
        let walker = el.parentElement
        while (walker) {
            const cs = getComputedStyle(walker)
            if (cs.overflowY !== 'visible' || cs.overflowX !== 'visible') {
                const pr = walker.getBoundingClientRect()
                if (!(rect.top >= pr.top - TOL && rect.bottom <= pr.bottom + TOL)) contained = false
            }
            walker = walker.parentElement
        }

        return {
            found: true,
            reachable: contained && insideViewport && rect.height > 0,
            belowViewportBy: Math.max(0, Math.round(rect.bottom - window.innerHeight)),
            rect: { top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height) },
            clippingAncestors: clipping,
            scrollableAncestors: scrollable,
            docCanScroll,
            viewportHeight: window.innerHeight
        }
    }, selector)

const openDialog = async (sandbox: FrameLocator) => {
    const activator = sandbox.locator('.origam-btn').first()
    await expect(activator).toBeVisible({ timeout: 35000 })
    await activator.click()
    const overlayContent = sandbox.locator('.origam-overlay__content')
    await expect(overlayContent).toBeVisible({ timeout: 12000 })

    return overlayContent
}

/** Défile à la MOLETTE, au centre du dialogue — entrée réelle, pas `scrollTop=`. */
const wheelOverDialog = async (page: Page, sandbox: FrameLocator, deltaY: number) => {
    const box = await sandbox.locator('.origam-overlay__content').boundingBox()
    expect(box, 'boundingBox du dialogue').not.toBeNull()
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.wheel(0, deltaY)
    await page.waitForTimeout(400)
}

test.describe('OrigamDialog — atteignabilité du contenu #563', () => {
    test.setTimeout(90000)

    // ------------------------------------------------------------------ //
    // CONTRÔLE POSITIF — le harnais sait voir un élément atteignable      //
    // ------------------------------------------------------------------ //
    test('contrôle positif : dialogue court, contenu atteignable sans défiler (index 7)', async ({ page }) => {
        await page.goto(variantUrl(SHORT_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await openDialog(sandbox)

        const r = await reach(sandbox, '.origam-card__content')
        console.log('#563 controle positif :', JSON.stringify(r, null, 2))

        expect(r.found, 'le harnais trouve .origam-card__content').toBe(true)
        expect(r.reachable, 'contenu court atteignable SANS defilement').toBe(true)
    })

    // ------------------------------------------------------------------ //
    // LE CRITÈRE DU TICKET                                                //
    // ------------------------------------------------------------------ //
    test('un scrollport existe pour le pied, rendu hors de __content (index 19)', async ({ page }) => {
        await page.goto(variantUrl(OVERFLOW_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await openDialog(sandbox)

        const before = await reach(sandbox, '#probe-tail')
        console.log('#563 AVANT defilement :', JSON.stringify(before, null, 2))

        expect(before.found, 'le pied du dialogue est rendu').toBe(true)
        expect(
            before.scrollableAncestors.length,
            `aucun ancetre defilant (chaine rognante: ${ JSON.stringify(before.clippingAncestors) })`
        ).toBeGreaterThan(0)
    })

    test('le pied du dialogue devient ATTEIGNABLE après défilement à la molette (index 19)', async ({ page }) => {
        await page.goto(variantUrl(OVERFLOW_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await openDialog(sandbox)

        const before = await reach(sandbox, '#probe-tail')
        expect(before.found).toBe(true)

        // Molette : plusieurs crans, le corps fait 1600px.
        for (let i = 0; i < 12; i++) {
            await wheelOverDialog(page, sandbox, 400)
        }

        const after = await reach(sandbox, '#probe-tail')
        console.log('#563 APRES defilement molette :', JSON.stringify(after, null, 2))

        expect(
            after.reachable,
            `pied inatteignable apres defilement — ${ after.belowViewportBy }px sous le viewport, `
            + `ancetres defilants: [${ after.scrollableAncestors.join(', ') }]`
        ).toBe(true)
    })

    test('le bas du corps du dialogue est atteint apres defilement (index 19)', async ({ page }) => {
        await page.goto(variantUrl(OVERFLOW_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await openDialog(sandbox)

        for (let i = 0; i < 12; i++) {
            await wheelOverDialog(page, sandbox, 400)
        }

        const body = await reach(sandbox, '#probe-body')
        console.log('#563 corps apres defilement :', JSON.stringify(body, null, 2))

        // Le corps fait 1600px : il ne tient pas dans le viewport, mais son BAS
        // doit avoir ete atteint — donc ne plus etre sous le bord inferieur.
        expect(
            body.belowViewportBy,
            'le bas du corps reste hors du viewport apres defilement'
        ).toBeLessThanOrEqual(1)
    })
})
