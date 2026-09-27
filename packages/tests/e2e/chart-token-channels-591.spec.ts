import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { expect, test, type Page } from '@playwright/test'

import { selectHstOption } from './_support/histoire-controls'

/**
 * #591 — famille Chart : reconciliation des canaux de theme morts.
 *
 * 92 tokens que le SCSS de la famille Chart LISAIT sans qu'aucune feuille ne
 * les DECLARE viennent d'etre declares dans `light.css` / `dark.css` (et leurs
 * jumeaux SCSS), avec pour valeur exactement le repli litteral que le rendu
 * utilisait deja. Trois autres lectures (`__grid---stroke-color`,
 * `__axis---stroke-color`, `__axis-label---fill`) ont ete renommees sur le nom
 * canonique deja declare et deja lu ailleurs (`__grid---color`,
 * `__axis---color`, `__axis-label---color`), dont le repli etait identique.
 *
 * L'EXIGENCE EST DONC : le rendu ne bouge pas d'un pixel. Cette spec mesure
 * des VALEURS ABSOLUES (jamais un simple ecart entre deux valeurs) sur sept
 * variantes, dont `OrigamChartPolar` qui n'a aucune spec dediee — tout son
 * rendu ne passait que par le relais d'`OrigamChart`.
 *
 * ⛔ Pourquoi Playwright et pas Vitest : `getComputedStyle` sous jsdom ne
 * resout JAMAIS un `var()` et renvoie un `16px` fabrique. Le seul verdict
 * valable pour ces tokens est un vrai navigateur (cf. CLAUDE.md).
 *
 * ⛔ Pourquoi on interroge des LONGHANDS : `getPropertyValue()` sur une
 * propriete raccourcie (`border`, `background`) rend `""` des que la valeur
 * contient un `var()` — substitution differee.
 *
 * Mesure de reference (chromium, Histoire statique, mode clair) prise avant
 * le correctif sur le commit parent, puis reproduite apres : identique.
 */

/**
 * ⛔ 90 s par test, et ce n'est PAS du « timeout whack-a-mole ».
 *
 * La mise en garde du CLAUDE.md racine vise le cas ou l'on allonge un delai
 * pour qu'une ASSERTION instable ait plus de temps de devenir vraie : le test
 * garde alors son worker deux fois plus longtemps et affame les autres. Ici
 * il n'y a aucune assertion en jeu. Ce qui depasse est l'AMORCAGE a froid du
 * catalogue Histoire : sur la seule rougeur qui subsistait, la capture montre
 * la page d'Histoire encore vide et le log dit `waiting for
 * locator('iframe[src*="__sandbox"]')` — l'iframe du bac a sable n'existait
 * pas encore. Mesure sur 245 executions reparties sur six passes
 * `--repeat-each=5` : ZERO assertion fausse, chaque rougeur etant un
 * `Test timeout`.
 *
 * Le cout est borne : 8 tests, 13 s a chaud pour le fichier entier, et la CI
 * tourne `workers=1`. Le budget sert de marge d'amorcage, pas de sursis
 * d'assertion.
 */
test.describe.configure({ timeout: 90_000 })

const SANDBOX = 'iframe[src*="__sandbox"]'

const sandboxOf = (page: Page) => page.frameLocator(SANDBOX)

/**
 * ⛔ PAS de `waitForLoadState('networkidle')` ici, contrairement aux autres
 * specs Chart du depot. Histoire precharge des polices et des chunks en
 * continu : `networkidle` n'arrive parfois jamais, et le test meurt sur un
 * `Test timeout` qui ressemble trait pour trait a un defaut produit. C'est
 * exactement la signature relevee dans le CLAUDE.md racine (« uniform
 * toBeVisible / page.goto timeouts that look like product defects and are
 * not »). On attend donc les ELEMENTS dont on a besoin, jamais le reseau.
 */
const openVariant = async (page: Page, storyUrl: string, title: string) => {
    await page.goto(storyUrl, { waitUntil: 'domcontentloaded' })

    const entry = page.getByText(title, { exact: true }).first()
    await entry.waitFor({ state: 'visible', timeout: 30000 })
    await entry.click()

    // ⛔ N'attendre le bac a sable qu'APRES le clic. Mesure : tant qu'aucune
    // Variant n'est choisie, `iframe[src*="__sandbox"]` n'existe pas — une
    // attente placee avant le clic brule son delai a chaque test puis echoue
    // (22 `TimeoutError: waiting for locator('iframe[src*="__sandbox"]')`
    // avant correction). Et attendre son CONTENU, pas seulement son
    // rattachement : l'iframe peut etre la et vide.
    await page.locator(SANDBOX).first().waitFor({ state: 'attached', timeout: 30000 })
    await sandboxOf(page).locator('body > *').first().waitFor({ state: 'attached', timeout: 30000 })
}

interface IProbe {
    /** Titre de la Variant Histoire a ouvrir. */
    variant: string
    /** Selecteur, relatif au document du sandbox. */
    selector: string
    /** Longhand CSS a lire. */
    property: string
    /** Valeur absolue attendue, telle que Chromium la calcule. */
    expected: string
}

interface ICase {
    name: string
    story: string
    probes: IProbe[]
    /** Pilotage des controles Histoire a faire APRES l'ouverture de la Variant. */
    prepare?: (page: Page) => Promise<void>
    /** Verification supplementaire greffee sur la page deja ouverte. */
    andThen?: (page: Page) => Promise<void>
}

const STORY = (slug: string) => `/stories/story/components-stories-chart-origamchart${slug}-story-vue`

const CASES: ICase[] = [
    {
        name: 'BoxPlot — les trois lectures renommees + la famille box',
        story: STORY('boxplot'),
        probes: [
            { variant: 'Design', selector: '.origam-chart__grid-line', property: 'stroke', expected: 'rgba(0, 0, 0, 0.04)' },
            { variant: 'Design', selector: '.origam-chart__axis-line', property: 'stroke', expected: 'rgba(0, 0, 0, 0.08)' },
            { variant: 'Design', selector: '.origam-chart__axis-label', property: 'fill', expected: 'rgb(82, 82, 82)' },
            { variant: 'Design', selector: '.origam-chart__box-rect', property: 'fill-opacity', expected: '0.25' },
            { variant: 'Design', selector: '.origam-chart__box-rect', property: 'stroke-width', expected: '1.5px' },
            { variant: 'Design', selector: '.origam-chart__box-whisker', property: 'stroke-width', expected: '1.5px' },
            { variant: 'Design', selector: '.origam-chart__box-cap', property: 'stroke-width', expected: '2px' }
        ]
    },
    {
        name: 'Treemap — tuiles, deux rangs d etiquette, et la feuille qui declare',
        story: STORY('treemap'),
        andThen: (page) => assertSheetDeclares(page),
        probes: [
            { variant: 'Design', selector: '.origam-chart__treemap-tile', property: 'stroke', expected: 'rgb(255, 255, 255)' },
            { variant: 'Design', selector: '.origam-chart__treemap-tile', property: 'stroke-width', expected: '2px' },
            { variant: 'Design', selector: '.origam-chart__treemap-label', property: 'fill', expected: 'rgb(255, 255, 255)' },
            { variant: 'Design', selector: '.origam-chart__treemap-label', property: 'font-size', expected: '11px' },
            { variant: 'Design', selector: '.origam-chart__treemap-label', property: 'font-weight', expected: '600' }
        ]
    },
    {
        name: 'Sunburst — arcs, etiquettes, ligne de rappel',
        story: STORY('sunburst'),
        probes: [
            { variant: 'Design', selector: '.origam-chart__sunburst-arc', property: 'stroke', expected: 'rgb(255, 255, 255)' },
            { variant: 'Design', selector: '.origam-chart__sunburst-arc', property: 'stroke-width', expected: '1.5px' },
            { variant: 'Design', selector: '.origam-chart__sunburst-label', property: 'fill', expected: 'rgb(255, 255, 255)' },
            { variant: 'Design', selector: '.origam-chart__sunburst-label', property: 'font-size', expected: '10px' },
            { variant: 'Design', selector: '.origam-chart__sunburst-label', property: 'font-weight', expected: '500' }
        ]
    },
    {
        name: 'Heatmap — cellules et deux familles d etiquette',
        story: STORY('heatmap'),
        probes: [
            { variant: 'Design', selector: '.origam-chart__heatmap-cell', property: 'stroke', expected: 'rgb(255, 255, 255)' },
            { variant: 'Design', selector: '.origam-chart__heatmap-cell', property: 'stroke-width', expected: '0.5px' },
            { variant: 'Design', selector: '.origam-chart__heatmap-axis-label', property: 'fill', expected: 'rgb(82, 82, 82)' },
            { variant: 'Design', selector: '.origam-chart__heatmap-axis-label', property: 'font-size', expected: '10px' }
        ]
    },
    {
        name: 'Gauge — piste et etiquette centrale',
        story: STORY('gauge'),
        probes: [
            { variant: 'Design', selector: '.origam-chart__gauge-track', property: 'fill', expected: 'rgba(0, 0, 0, 0.04)' },
            { variant: 'Design', selector: '.origam-chart__gauge-label', property: 'fill', expected: 'rgb(10, 10, 10)' },
            { variant: 'Design', selector: '.origam-chart__gauge-label', property: 'font-size', expected: '24px' },
            { variant: 'Design', selector: '.origam-chart__gauge-label', property: 'font-weight', expected: '700' }
        ]
    },
    {
        name: 'Pyramid — tranches et etiquette interieure',
        story: STORY('pyramid'),
        probes: [
            { variant: 'Design', selector: '.origam-chart__pyramid-slice', property: 'stroke', expected: 'rgb(255, 255, 255)' },
            { variant: 'Design', selector: '.origam-chart__pyramid-slice', property: 'stroke-width', expected: '2px' },
            { variant: 'Design', selector: '.origam-chart__pyramid-label--inside', property: 'fill', expected: 'rgb(255, 255, 255)' },
            { variant: 'Design', selector: '.origam-chart__pyramid-label--inside', property: 'font-weight', expected: '500' }
        ]
    },
    {
        name: 'Polar — la variante SANS spec dediee',
        story: STORY('polar'),
        // La legende laterale n'existe qu'a `legendPosition: 'right'`; la
        // Variant Design part sur `'bottom'`, d'ou le pilotage du controle.
        prepare: async (page) => { await selectHstOption(page, 'Legend Position', 'right') },
        probes: [
            { variant: 'Design', selector: '.origam-chart__legend--right', property: 'padding-left', expected: '8px' },
            { variant: 'Design', selector: '.origam-chart-polar__body--with-side-legend', property: 'min-width', expected: '200px' }
        ]
    }
]

/**
 * Journal machine-lisible, ecrit ligne par ligne AU MOMENT de la mesure — donc
 * y compris quand l'assertion qui suit echoue. C'est ce qui permet de comparer
 * le rendu avant et apres le correctif sans dependre du verdict.
 */
const JOURNAL = process.env.CHART_591_JOURNAL

const record = (key: string, value: string) => {
    if (!JOURNAL) return
    mkdirSync(dirname(resolve(JOURNAL)), { recursive: true })
    appendFileSync(resolve(JOURNAL), `${JSON.stringify({ key, value })}\n`)
}

/**
 * UN test par variante, pas un par sonde.
 *
 * ⛔ La premiere version ouvrait la story une fois PAR mesure : 31 chargements
 * d'un catalogue Histoire lourd, chacun avec son propre budget de 30 s. Sous
 * charge la moitie mourait sur `Test timeout`, sans une seule assertion
 * fausse — le faux rouge que le CLAUDE.md racine decrit. Regrouper les sondes
 * d'une meme Variant ramene 33 chargements a 9 et supprime la cause, au lieu
 * de rallonger les delais (le « timeout whack-a-mole » qui deplace le flake
 * sans le corriger).
 *
 * Les assertions sont SOUPLES (`expect.soft`) pour que l'echec nomme TOUTES
 * les mesures fausses d'un coup, pas seulement la premiere.
 */
for (const kase of CASES) {
    test(`#591 ${kase.name}`, async ({ page }) => {
        await openVariant(page, kase.story, kase.probes[0].variant)
        if (kase.prepare) {
            await kase.prepare(page)
            await page.waitForTimeout(400)
        }

        for (const probe of kase.probes) {
            const el = sandboxOf(page).locator(probe.selector).first()
            await el.waitFor({ state: 'attached', timeout: 30000 })

            // Mesure ET lecture dans le MEME evaluate : pas de mutation ici,
            // donc pas de piege de recalcul — mais on lit le longhand, jamais
            // le raccourci.
            const value = await el.evaluate(
                (node, prop) => getComputedStyle(node as Element).getPropertyValue(prop).trim(),
                probe.property
            )

            record(`${kase.story}|${probe.selector}|${probe.property}`, value)
            expect.soft(value, `${probe.selector} → ${probe.property}`).toBe(probe.expected)
        }

        if (kase.andThen) await kase.andThen(page)
    })
}

/**
 * `inherit` en valeur de repli devient `currentColor` en valeur DECLAREE.
 *
 * ⛔ `--x: inherit` est inerte : `inherit` est un mot-cle CSS-wide consomme par
 * la custom property elle-meme, qui devient *guaranteed-invalid*. La campagne
 * #550 impose donc `currentColor`. Reste a prouver que, POUR LA PROPRIETE
 * `color`, les deux calculent la meme chose — sinon les deux tokens
 * `__breadcrumb-back---color` / `__breadcrumb-current---color` changeraient le
 * rendu. Mesure directe, sans Histoire : rien d'autre que la semantique CSS
 * n'est en jeu.
 */
test('#591 — sur la propriete `color`, `currentColor` calcule comme `inherit`', async ({ page }) => {
    await page.setContent(`
        <div id="parent" style="color: rgb(17, 34, 51)">
            <button id="viaInherit" style="color: inherit">a</button>
            <button id="viaCurrent" style="color: currentColor">b</button>
            <button id="viaToken">c</button>
        </div>
        <style>
            :root { --tok: currentColor; }
            #viaToken { color: var(--tok, inherit); }
        </style>
    `)

    const read = (id: string) => page.evaluate(
        (sel) => getComputedStyle(document.querySelector(sel) as Element).color,
        `#${id}`
    )

    const inherited = await read('viaInherit')
    const current = await read('viaCurrent')
    const token = await read('viaToken')

    expect(inherited).toBe('rgb(17, 34, 51)')
    expect(current).toBe('rgb(17, 34, 51)')
    expect(token).toBe('rgb(17, 34, 51)')
})

/**
 * Le CANAL est-il vraiment vivant ? — la moitie qui rougit AVANT le correctif.
 *
 * Les 31 mesures ci-dessus prouvent que le rendu n'a pas bouge ; elles passent
 * donc AUSSI sur le commit parent, et ne prouvent a elles seules rien du
 * correctif. Ce qui distingue les deux etats est la feuille : avant, ces noms
 * n'etaient declares NULLE PART, donc `getPropertyValue` sur la racine du
 * document rend la chaine vide, et ni `dark.css` ni un bloc de marque
 * `[data-theme="x"]` ne pouvaient leur donner une valeur propre. C'est ce que
 * cette assertion mesure — elle est ROUGE a HEAD~1 et verte apres.
 */
const RECONCILED_TOKENS: Array<[token: string, expected: string]> = [
    ['--origam-chart__body---min-width', '200px'],
    ['--origam-chart__legend---side-gap', '8px'],
    ['--origam-chart__treemap-label---color', '#ffffff'],
    ['--origam-chart__heatmap---stroke-width', '0.5'],
    ['--origam-chart__gauge-label---font-weight', '700'],
    ['--origam-chart__breadcrumb-back---color', 'currentColor'],
    ['--origam-chart-pictorial__label---font-weight', '600']
]

/**
 * ⛔ Cette verification NE charge PAS sa propre story : elle se greffe sur la
 * page deja ouverte par le cas Treemap. Un chargement de catalogue Histoire
 * en moins, donc un budget de 30 s en moins a tenir sous charge — c'est la
 * meme raison qui a fait regrouper les sondes par variante plus haut.
 */
const assertSheetDeclares = async (page: Page) => {
    const host = sandboxOf(page).locator('[data-cy="origam-chart-treemap"]').first()
    await host.waitFor({ state: 'attached', timeout: 30000 })

    const declared = await host.evaluate(
        (node, tokens) => Object.fromEntries((tokens as string[]).map((t) => [
            t,
            getComputedStyle((node as Element).ownerDocument.documentElement).getPropertyValue(t).trim()
        ])),
        RECONCILED_TOKENS.map(([t]) => t)
    )

    for (const [token, expected] of RECONCILED_TOKENS) {
        expect.soft(declared[token], `${token} doit etre declare par la feuille`).toBe(expected)
    }
}
