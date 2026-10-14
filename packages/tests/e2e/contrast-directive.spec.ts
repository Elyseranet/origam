import { expect, test } from '@playwright/test'

import { writeContrastHarnessPage } from './_support/contrast-harness'

/**
 * #869 — `v-contrast` was silently inert whenever fg AND bg were both
 * OPAQUE, i.e. the DS's default look on every one of the 30 components that
 * wire the directive.
 *
 * ── THE TWO RUPTURES, BOTH IN SHARED CODE ──────────────────────────────────
 * 1. `toRgb()` unconditionally round-tripped every colour through a canvas
 *    `fillStyle` get/set, even when `getComputedStyle` had already produced
 *    an `rgb()/rgba()` string — the form every caller here needs. Chromium's
 *    `fillStyle` GETTER re-serialises any OPAQUE colour to `#rrggbb` (only
 *    alpha < 1 comes back as `rgba(...)`), so the round-trip silently turned
 *    an exploitable value into `rgbaParts`'s dead end.
 * 2. `channelsOf()` extracted channels via `match(/[\d.]+/g)`, built for
 *    `rgb(r, g, b)` — a run of hex DIGITS with no separator (e.g. `#777777`,
 *    every character a digit) collapses into ONE huge number instead of
 *    three, so `channelsOf` returns `null` on exactly the hex shape rupture
 *    1 could still produce for any COLOUR NAME / `hsl()` input that legitimately
 *    needs the canvas round-trip.
 *
 * Fixing only one leaves the other reachable — see the two `toRgb()` probes
 * below, which drive each rupture independently with a literal input the
 * fix's own `toRgb()` never gets to see through `getComputedStyle`.
 *
 * ── WHY THIS SPEC LOADS THE REAL MODULE, NOT A REIMPLEMENTATION ───────────
 * The bug is a Chromium `canvas.fillStyle` serialisation quirk. jsdom has no
 * working `getContext('2d')` in this repo (no `canvas` npm package — see
 * `OrigamDataList.spec.ts`'s comment), so a Vitest/jsdom spec cannot even
 * observe rupture 1, let alone prove the fix. This spec compiles the ACTUAL
 * `contrast.directive.ts` source (types stripped, zero bundling needed since
 * both its imports are `import type`) into a plain script and runs it in a
 * real Chromium page — the only environment where `canvas.fillStyle`
 * behaves the way production does. Same technique and same rationale as
 * `token-intent-contrast.spec.ts`'s file:// pages (real browser, no
 * Histoire/:6006 dependency, no server-port contention).
 */

// Built once: identical content for every test in this file. `dev: true` keeps the
// development build, the one that carries the console warning this spec observes.
const HARNESS_PAGE_FILE = writeContrastHarnessPage(true, 'origam-869-')

// Since #1092 `schedule()` queues ONE rAF, which measures once the surface's
// transitions have settled (the former second pass, a fixed 250 ms timer, is
// gone). On a STATIC pair (no CSS transition in flight — the case every
// scenario below exercises) that single pass forces the colour at once and the
// data flag stays set. Both checkpoints are still read: the settled colour is
// the durable proof.
const POST_RAF_WAIT_MS = 80
const POST_SETTLE_WAIT_MS = 500

interface ICaseSnapshot {
    color: string
    fixed: boolean
}

interface ICaseResult {
    postRaf: ICaseSnapshot
    postSettle: ICaseSnapshot
}

type TWindowWithContrast = Window & typeof globalThis & {
    __origamContrast: {
        vContrast: { mounted: (el: HTMLElement, binding: { value: undefined }) => void }
        setContrastConfig: (v: boolean | { enabled?: boolean, threshold?: number } | undefined) => void
    }
    __origamContrastInternal: {
        toRgb: (c: string | null | undefined) => string | null
        channelsOf: (c: string | null) => [number, number, number] | null
        hexToRgb: (h: string) => string | null
    }
}

function readCaseSnapshot (): ICaseSnapshot {
    const el = document.getElementById('__case') as HTMLElement
    return {
        color: getComputedStyle(el).color,
        fixed: el.dataset.origamContrastFixed === 'true'
    }
}

/** Mount `v-contrast` (via `mounted`, exactly what Vue calls) on `#__case`. */
async function mountOnCase (page: import('@playwright/test').Page): Promise<ICaseResult> {
    await page.evaluate(() => {
        const el = document.getElementById('__case') as HTMLElement
        ;(window as TWindowWithContrast).__origamContrast.vContrast.mounted(el, { value: undefined })
    })

    await page.waitForTimeout(POST_RAF_WAIT_MS)
    const postRaf = await page.evaluate(readCaseSnapshot)

    await page.waitForTimeout(POST_SETTLE_WAIT_MS)
    const postSettle = await page.evaluate(readCaseSnapshot)

    return { postRaf, postSettle }
}

test.describe('#869 — v-contrast is no longer inert on an opaque fg/bg pair', () => {
    test('control positif — opaque fg/bg PAIR sous le seuil AA declenche la correction + console.warn', async ({ page }) => {
        const warnings: string[] = []
        page.on('console', msg => {
            if (msg.type() === 'warning' || msg.type() === 'warn') warnings.push(msg.text())
        })
        await page.goto(`file://${HARNESS_PAGE_FILE}`)

        // #767676 sur blanc = 4.54 (AA, passe) ; #777777 sur blanc = 4.48
        // (sous 4.5 — echoue). Temoins DEJA valides, repris tels quels de
        // CLAUDE.md / token-intent-contrast.spec.ts — aucune nouvelle valeur
        // a re-deriver. Les DEUX couleurs sont OPAQUES : c'est exactement la
        // configuration que #869 diagnostique comme silencieusement ignoree.
        await page.evaluate(() => {
            const el = document.createElement('div')
            el.id = '__case'
            el.style.backgroundColor = 'rgb(255, 255, 255)'
            el.style.color = 'rgb(119, 119, 119)' // #777777, opaque
            el.textContent = 'Aa'
            document.body.appendChild(el)
        })
        const result = await mountOnCase(page)

        expect(result.postRaf.fixed, 'data-origam-contrast-fixed doit etre pose juste apres le rAF').toBe(true)
        // La correction force blanc ou noir, jamais la couleur d'origine —
        // et reste en place apres le settle (250ms), meme si le flag
        // transitoire, lui, retombe (voir le commentaire sur `mountOnCase`).
        for (const snap of [result.postRaf, result.postSettle]) {
            expect(snap.color).not.toBe('rgb(119, 119, 119)')
            expect(['rgb(0, 0, 0)', 'rgb(255, 255, 255)']).toContain(snap.color)
        }

        const warned = warnings.some(w => w.includes('Low text contrast') && w.includes('4.48'))
        expect(warned, `console.warn attendu avec le ratio 4.48, recu: ${JSON.stringify(warnings)}`).toBe(true)
    })

    test('control negatif — noir sur blanc (21:1) ne declenche rien', async ({ page }) => {
        const warnings: string[] = []
        page.on('console', msg => {
            if (msg.type() === 'warning' || msg.type() === 'warn') warnings.push(msg.text())
        })
        await page.goto(`file://${HARNESS_PAGE_FILE}`)

        await page.evaluate(() => {
            const el = document.createElement('div')
            el.id = '__case'
            el.style.backgroundColor = 'rgb(255, 255, 255)'
            el.style.color = 'rgb(0, 0, 0)'
            el.textContent = 'Aa'
            document.body.appendChild(el)
        })
        const result = await mountOnCase(page)

        expect(result.postRaf.fixed).toBe(false)
        expect(result.postSettle.fixed).toBe(false)
        expect(result.postRaf.color).toBe('rgb(0, 0, 0)')
        expect(result.postSettle.color).toBe('rgb(0, 0, 0)')
        expect(warnings.some(w => w.includes('Low text contrast'))).toBe(false)
    })

    test('non-regression — le chemin translucide (fond compose) continue de fonctionner', async ({ page }) => {
        const warnings: string[] = []
        page.on('console', msg => {
            if (msg.type() === 'warning' || msg.type() === 'warn') warnings.push(msg.text())
        })
        await page.goto(`file://${HARNESS_PAGE_FILE}`)

        // Parent opaque noir + enfant a fond blanc 50% translucide => fond
        // EFFECTIF compose ~= rgb(128, 128, 128). Texte gris fonce dessus
        // est sous le seuil. Ce chemin (resolvePaintedBackground / `over()`)
        // n'est pas touche par le correctif #869 — il doit continuer a
        // fonctionner a l'identique.
        await page.evaluate(() => {
            const parent = document.createElement('div')
            parent.style.backgroundColor = 'rgb(0, 0, 0)'
            const el = document.createElement('span')
            el.id = '__case'
            el.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
            el.style.color = 'rgb(100, 100, 100)'
            el.textContent = 'Aa'
            parent.appendChild(el)
            document.body.appendChild(parent)
        })
        const result = await mountOnCase(page)

        expect(result.postRaf.fixed, 'le chemin translucide doit toujours corriger un contraste insuffisant').toBe(true)
        for (const snap of [result.postRaf, result.postSettle]) {
            expect(['rgb(0, 0, 0)', 'rgb(255, 255, 255)']).toContain(snap.color)
        }
        expect(warnings.some(w => w.includes('Low text contrast'))).toBe(true)
    })
})

test.describe('#869 — toRgb() : les deux ruptures independamment', () => {
    test('rupture 1 — un rgb() deja exploitable ne repasse plus par le canvas (jamais serialise en hex)', async ({ page }) => {
        await page.goto(`file://${HARNESS_PAGE_FILE}`)

        const out = await page.evaluate(() => {
            return (window as unknown as { __origamContrastInternal: { toRgb: (c: string) => string | null } })
                .__origamContrastInternal.toRgb('rgb(119, 119, 119)')
        })

        // Avant le fix, TOUTE couleur passait par le canvas, qui serialise
        // l'opaque en hex ('#777777') — ce test echoue sur le code parent.
        expect(out).toBe('rgb(119, 119, 119)')
    })

    test('rupture 2 — une couleur qui a legitimement besoin du canvas (nommee) ne ressort plus en hex', async ({ page }) => {
        await page.goto(`file://${HARNESS_PAGE_FILE}`)

        const out = await page.evaluate(() => {
            const w = window as unknown as {
                __origamContrastInternal: {
                    toRgb: (c: string) => string | null
                    channelsOf: (c: string | null) => [number, number, number] | null
                }
            }
            const rgb = w.__origamContrastInternal.toRgb('gray')
            return { rgb, channels: w.__origamContrastInternal.channelsOf(rgb) }
        })

        // CSS 'gray' = #808080 = rgb(128, 128, 128). `toRgb` DOIT emprunter
        // le canvas ici (ce n'est pas un rgb() deja forme) : la sonde teste
        // donc bien le chemin hex -> rgb(), pas le court-circuit du dessus.
        expect(out.rgb).not.toBeNull()
        expect(out.rgb).toMatch(/^rgb\(/)
        expect(out.channels).toEqual([128, 128, 128])
    })
})
