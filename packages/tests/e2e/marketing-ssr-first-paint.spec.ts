/**
 * Le premier paint serveur est-il déjà stylé ? (#1092)
 *
 * ## Le défaut que ce fichier garde
 *
 * `useStyle()` écrivait sa règle `#id { … }` depuis `onMounted`, qui ne tourne
 * jamais côté serveur. Un composant qui ne se peint QUE par cette règle (Btn,
 * BtnToggle, BtnGroup, Avatar, Breadcrumb, BottomNav, Stepper) sortait donc nu
 * du HTML servi, puis changeait d'aspect à l'hydratation. Mesuré en production
 * sur `/contact`, bouton primaire, JS coupé puis JS actif :
 *
 *     background-color         rgb(251, 245, 255)  ->  rgb(124, 58, 237)
 *     border-top-left-radius   8px                 ->  12px
 *
 * ## Ce que ce fichier assert, et pourquoi sous cette forme
 *
 * Il ne compare PAS à une couleur en dur : il compare ce que le serveur peint
 * (contexte `javaScriptEnabled: false`, donc AUCUN script ne peut intervenir)
 * à ce que la page montre une fois hydratée. Si le serveur cesse d'émettre la
 * règle, les deux divergent, quelle que soit la palette du jour.
 *
 * Il vérifie aussi le contrat d'identité qui rend la règle utile : l'id de
 * chaque élément rendu par le serveur est encore celui de la page hydratée, et
 * il n'y a qu'UN `<style>` par id (celui du serveur est réutilisé, pas doublé).
 *
 * Run :
 *   MARKETING_BASE_URL=http://localhost:3011 pnpm -F @origam/tests exec \
 *     playwright test --config=playwright.marketing.config.ts marketing-ssr-first-paint
 */

import { expect, test } from '@playwright/test'

const PATH = '/contact'
const PRIMARY_BUTTON = '.origam--bg-primary'

interface IPaint {
    id: string
    background: string
    radius: string
    height: number
}

function readPaint (selector: string): IPaint | null {
    const el = document.querySelector(selector)

    if (!el) return null

    const style = getComputedStyle(el)

    return {
        id: el.id,
        background: style.backgroundColor,
        radius: style.borderTopLeftRadius,
        height: Math.round(el.getBoundingClientRect().height)
    }
}

function listIds (): { elements: string[], tags: string[] } {
    return {
        elements: [...document.querySelectorAll('[id^="origam-"]')]
            .map((el) => el.id)
            .filter((id) => !id.startsWith('origam-style-')),
        tags: [...document.head.querySelectorAll('style[id^="origam-style-"]')].map((el) => el.id)
    }
}

test.describe('#1092 — le HTML servi est déjà stylé', () => {
    test('le bouton primaire a le même fond et le même rayon sans JS et après hydratation', async ({ browser }) => {
        const serverContext = await browser.newContext({ javaScriptEnabled: false })
        const serverPage = await serverContext.newPage()

        await serverPage.goto(PATH, { waitUntil: 'load' })

        const served = await serverPage.evaluate(readPaint, PRIMARY_BUTTON)
        const servedIds = await serverPage.evaluate(listIds)

        await serverContext.close()

        const clientContext = await browser.newContext()
        const clientPage = await clientContext.newPage()

        await clientPage.goto(PATH, { waitUntil: 'load' })
        // Hydration has no marker on this site: wait for the page to be idle of
        // layout work rather than for a fixed delay.
        await clientPage.evaluate(() => document.fonts.ready)
        await clientPage.waitForFunction(() => document.querySelectorAll('style[id^="origam-style-"]').length > 0)

        const hydrated = await clientPage.evaluate(readPaint, PRIMARY_BUTTON)
        const hydratedIds = await clientPage.evaluate(listIds)

        await clientContext.close()

        expect(served, 'un bouton primaire est rendu par le serveur').not.toBeNull()
        expect(hydrated).not.toBeNull()

        // The server paint is the final paint.
        expect(served!.background).toBe(hydrated!.background)
        expect(served!.radius).toBe(hydrated!.radius)
        expect(served!.height).toBe(hydrated!.height)

        // And it is a painted one: a transparent fill would "match" itself.
        expect(served!.background).not.toBe('rgba(0, 0, 0, 0)')

        // Same element ids on both sides: the rule still targets something.
        expect(served!.id).toBe(hydrated!.id)
        expect(servedIds.elements.length).toBeGreaterThan(0)
        expect(hydratedIds.elements).toEqual(expect.arrayContaining(servedIds.elements))

        // The server rendered one <style> per id and the client reused them.
        expect(servedIds.tags.length).toBeGreaterThan(0)
        expect(new Set(hydratedIds.tags).size, 'aucun <style> en double après hydratation').toBe(hydratedIds.tags.length)
        expect(hydratedIds.tags).toEqual(expect.arrayContaining(servedIds.tags))
    })
})
