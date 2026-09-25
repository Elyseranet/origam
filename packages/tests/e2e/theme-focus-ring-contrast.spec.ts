import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, test } from '@playwright/test'

import { origamDarkTheme, origamLightTheme } from '../../ds/src/themes/origam.theme'
import { themeToCss } from '../../ds/src/utils/Commons/apply-theme.util'
import { appleThemes } from '../../marketing/src/themes/apple.theme'
import { cartoonThemes } from '../../marketing/src/themes/cartoon.theme'
import { ecomThemes } from '../../marketing/src/themes/ecom.theme'
import { editorialThemes } from '../../marketing/src/themes/editorial.theme'
import { geekThemes } from '../../marketing/src/themes/geek.theme'
import { glassThemes } from '../../marketing/src/themes/glass.theme'
import { materialThemes } from '../../marketing/src/themes/material.theme'

/**
 * #924 — l'anneau de focus doit tenir 3:1 sur les surfaces qu'il entoure.
 *
 * ── CE QUI EST EPINGLE ─────────────────────────────────────────────────────
 * `--origam-color__border---focus` est le token GLOBAL dont **38 des 96
 * familles de composants** peignent leur anneau de focus (10 le lisent
 * directement — Btn, Field, SelectionControl, RatingField, Treeview,
 * ColorPicker, 3 Chart ; 28 autres y accedent en composant les trois
 * premiers). Une valeur qui ne se detache pas rend l'identite entiere
 * inutilisable au clavier.
 *
 * Seuil : **3:1**, WCAG 2.1 SC 1.4.11 « Contraste des elements non textuels ».
 * Un indicateur de focus est un element d'interface non textuel.
 *
 * ── POURQUOI PLUSIEURS SURFACES, ET PAS « LE FOND DE PAGE » ────────────────
 * `OrigamBtn` et `OrigamSelectionControl` declarent tous deux
 *
 *     outline: 2px solid var(--origam-color__border---focus, currentColor);
 *     outline-offset: var(--origam-space---1, 2px);
 *
 * — un offset POSITIF. L'anneau se peint donc DEHORS de la boite du composant,
 * et la couleur adjacente de ses deux cotes est le fond de ce qui le CONTIENT :
 * une carte, un menu, une alerte — la page seulement quand le composant est
 * pose directement dessus. Un anneau qui passe a 3:1 sur une page neutre et
 * retombe a 2:1 dans une carte n'est pas conforme. D'ou les quatre surfaces.
 *
 * Mesure de reference (#924, Chromium reel, `audit/focus-ring.audit.mjs`) :
 * `cartoon` clair rendait 2,07 / 2,16 / 1,96 / 1,53 sur ces quatre surfaces.
 *
 * ── CE QUI N'EST DELIBEREMENT PAS EPINGLE ICI ──────────────────────────────
 * ⛔ `action.primary.bg` — un aplat d'intention — est EXCLU, et ce n'est pas
 * un oubli. L'anneau y echoue sur **15 des 16 configurations** (toutes les
 * identites, les deux modes ; seul `glass` sombre passe), parce que
 * `border.focus` est derive de la teinte primaire : sur un aplat primaire
 * l'anneau vaut le remplissage, ratio 1,00. C'est un defaut STRUCTUREL commun
 * aux 8 identites, pas un defaut de `cartoon`, et il a sa propre remontee.
 * L'inclure rendrait ce spec rouge sur `develop` pour une cause qu'il ne
 * corrige pas.
 *
 * ⛔ `--origam-field---focus-ring-color` d'`ecom` (une cssVar propre a ce
 * theme, `rgba(…, 0.18)`) mesure 1,23–1,33 et n'est pas ce token-ci. Remonte
 * a part.
 *
 * ── POURQUOI CE SPEC N'A NI SERVEUR NI PORT ────────────────────────────────
 * Meme forme que `token-intent-contrast.spec.ts` : les attributs sont ECRITS
 * DANS LE FICHIER, donc presents avant le parse. Aucune mutation apres rendu
 * (dans l'iframe `__sandbox` d'Histoire un element deja rendu ne recalcule
 * pas — CLAUDE.md), aucune dependance au port 6006, aucun build a rafraichir.
 * Et surtout pas jsdom : `getComputedStyle` n'y resout jamais `var()`.
 */

const AA_UI = 3.0

const HERE = dirname(fileURLToPath(import.meta.url))
const DS_ASSETS = resolve(HERE, '..', '..', 'ds', 'src', 'assets')
const MAIN_CSS = readFileSync(join(DS_ASSETS, 'css', 'main.css'), 'utf8')

const OUT_DIR = mkdtempSync(join(tmpdir(), 'origam-924-'))

/**
 * Les 8 identites du site marketing. `origam` est l'identite sans marque : le
 * theme de base du DS, sans `data-theme`.
 */
const IDENTITIES: { name: string, css: string }[] = [
    { name: 'origam', css: '' },
    { name: 'apple', css: appleThemes.map(themeToCss).join('\n') },
    { name: 'cartoon', css: cartoonThemes.map(themeToCss).join('\n') },
    { name: 'ecom', css: ecomThemes.map(themeToCss).join('\n') },
    { name: 'editorial', css: editorialThemes.map(themeToCss).join('\n') },
    { name: 'geek', css: geekThemes.map(themeToCss).join('\n') },
    { name: 'glass', css: glassThemes.map(themeToCss).join('\n') },
    { name: 'material', css: materialThemes.map(themeToCss).join('\n') }
]

/**
 * Les surfaces SEMANTIQUES sur lesquelles un composant focusable se pose
 * reellement. `page` est la surface de la page, `raised` ce que peint une
 * Card, `overlay` ce que peignent Menu et Dialog, `danger-subtle` le corps
 * d'une Alert.
 */
const BACKDROPS: { id: string, token: string }[] = [
    { id: 'page', token: '--origam-color__surface---default' },
    { id: 'raised', token: '--origam-color__surface---raised' },
    { id: 'overlay', token: '--origam-color__surface---overlay' },
    { id: 'sunken', token: '--origam-color__surface---sunken' },
    { id: 'danger-subtle', token: '--origam-color__feedback--danger---bgSubtle' }
]

/**
 * Temoins a valeurs LITTERALES, calculables a la main avec la formule WCAG 2.x.
 * Ils prouvent que la sonde mesure, et qu'elle compose l'alpha :
 *   #949494 sur blanc → 3.03  (juste AU-DESSUS du seuil UI)
 *   #969696 sur blanc → 2.96  (juste EN DESSOUS)
 * Une sonde qui ne separe pas ces deux-la ne peut rien affirmer a 3:1.
 */
const CONTROLS: Record<string, { ring: string, bg: string, expected: number }> = {
    'noir-sur-blanc': { ring: '#000000', bg: '#ffffff', expected: 21.00 },
    'blanc-sur-blanc': { ring: '#ffffff', bg: '#ffffff', expected: 1.00 },
    '949494-sur-blanc': { ring: '#949494', bg: '#ffffff', expected: 3.03 },
    '969696-sur-blanc': { ring: '#969696', bg: '#ffffff', expected: 2.96 },
    // Compositing : sans lui, un anneau a 50 % d'alpha mesurerait 21.00.
    'alpha50-sur-blanc': { ring: 'rgba(0, 0, 0, 0.5)', bg: '#ffffff', expected: 3.98 }
}

function buildPage (identity: { name: string, css: string }, mode: 'light' | 'dark'): string {
    const themeAttr = identity.name === 'origam' ? '' : ` data-theme="${identity.name}"`

    /*
     * L'anneau est reproduit a l'identique de ce que declarent `OrigamBtn` et
     * `OrigamSelectionControl` : meme propriete, meme token, meme offset. Le
     * `<button>` porte le remplissage d'un bouton primaire pour que la pile de
     * fonds soit realiste, mais c'est bien le fond du CONTENEUR qui est lu —
     * l'offset positif place l'anneau dessus.
     */
    const cells = BACKDROPS.map((b) => `
<div class="backdrop" data-backdrop="${b.id}" style="background-color: var(${b.token});">
  <button class="ring" data-key="${b.id}" type="button">Aa</button>
</div>`).join('\n')

    const controls = Object.entries(CONTROLS).map(([key, c]) => `
<div class="backdrop" style="background-color: ${c.bg};">
  <button class="ring ctl" data-key="${key}" type="button"
          style="outline-color: ${c.ring};">Aa</button>
</div>`).join('\n')

    return `<!doctype html>
<html lang="fr"${themeAttr} data-mode="${mode}">
<head>
<meta charset="utf-8">
<style>${MAIN_CSS}</style>
<style id="origam-base-light">${themeToCss(origamLightTheme)}</style>
<style id="origam-base-dark">${themeToCss(origamDarkTheme)}</style>
${identity.css ? `<style id="origam-brand">${identity.css}</style>` : ''}
<style>
  html, body { margin: 0; padding: 0; }
  body { background-color: var(--origam-color__surface---default); }
  .backdrop { padding: 24px; }
  .ring {
    background-color: var(--origam-color__action--primary---bg);
    color: var(--origam-color__action--primary---fg);
    border: 0;
    padding: 8px 16px;
    font: 16px/1.4 system-ui, sans-serif;
    /* Copie exacte de la declaration des composants (OrigamBtn.vue:632). */
    outline: var(--origam-border__width---2, 2px) solid var(--origam-color__border---focus, currentColor);
    outline-offset: var(--origam-space---1, 2px);
  }
  /* Les temoins forcent leur propre couleur d'anneau, pas celle du theme. */
  .ctl { background-color: #ffffff; color: #000000; }
</style>
</head>
<body>
${controls}
${cells}
</body>
</html>`
}

interface IMeasure {
    key: string
    ratio: number
    naive: number
    ring: string
    bg: string
    theme: string
    mode: string
}

/**
 * Mesure executee DANS la page : le navigateur a deja resolu `var()`.
 *
 * ⛔ `data-theme` / `data-mode` sont relus ICI, dans le meme `evaluate` que la
 * lecture des couleurs, et une divergence est renvoyee comme erreur plutot que
 * comme un chiffre plausible (CLAUDE.md, post-mortem #944).
 */
function measureInPage (expected: { theme: string, mode: string }): IMeasure[] | { error: string } {
    interface IRgba { r: number, g: number, b: number, a: number }

    const parse = (s: string): IRgba | null => {
        const raw = String(s ?? '').trim()
        const srgb = raw.match(/color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/i)
        if (srgb) {
            const ch = (v: string): number => Math.min(1, Math.max(0, parseFloat(v))) * 255
            const a = srgb[4] !== undefined ? parseFloat(srgb[4]) : 1
            return { r: ch(srgb[1]), g: ch(srgb[2]), b: ch(srgb[3]), a: Number.isNaN(a) ? 1 : a }
        }
        const n = (raw.match(/[-\d.]+/g) ?? []).map(Number)
        if (n.length < 3) return null
        return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 }
    }
    const over = (fg: IRgba, bg: IRgba): IRgba => ({
        r: fg.r * fg.a + bg.r * (1 - fg.a),
        g: fg.g * fg.a + bg.g * (1 - fg.a),
        b: fg.b * fg.a + bg.b * (1 - fg.a),
        a: 1
    })
    const lum = ({ r, g, b }: IRgba): number => {
        const c = (v: number): number => {
            const s = v / 255
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)
    }
    const ratio = (x: IRgba, y: IRgba): number => {
        const a = lum(x)
        const b = lum(y)
        return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100
    }
    const painted = (el: Element): IRgba => {
        const layers: IRgba[] = []
        let node: Element | null = el
        while (node) {
            const p = parse(getComputedStyle(node).backgroundColor)
            if (p && p.a > 0) { layers.push(p); if (p.a >= 1) break }
            node = node.parentElement
        }
        if (!layers.length) return { r: 255, g: 255, b: 255, a: 1 }
        let acc: IRgba = layers[layers.length - 1].a >= 1
            ? (layers.pop() as IRgba)
            : { r: 255, g: 255, b: 255, a: 1 }
        for (let i = layers.length - 1; i >= 0; i -= 1) acc = over(layers[i], acc)
        return acc
    }
    const rgb = (c: IRgba): string => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`

    const theme = document.documentElement.getAttribute('data-theme') ?? 'origam'
    const mode = document.documentElement.getAttribute('data-mode') ?? ''
    if (theme !== expected.theme || mode !== expected.mode) {
        return { error: `CONTAMINE — demande ${expected.theme}/${expected.mode}, lu ${theme}/${mode}` }
    }

    const out: IMeasure[] = []
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('.ring'))) {
        const ring = parse(getComputedStyle(el).outlineColor)
        if (!ring) continue
        // Offset POSITIF → l'anneau est dehors : le fond adjacent est celui du PARENT.
        const bg = painted(el.parentElement ?? el)
        out.push({
            key: el.dataset.key as string,
            ratio: ratio(over(ring, bg), bg),
            // Temoin negatif : sans compositing, un anneau alpha mesurerait faux.
            naive: ratio(ring, bg),
            ring: rgb(over(ring, bg)),
            bg: rgb(bg),
            theme,
            mode
        })
    }
    return out
}

async function measure (
    page: import('@playwright/test').Page,
    identity: { name: string, css: string },
    mode: 'light' | 'dark'
): Promise<Map<string, IMeasure>> {
    const file = join(OUT_DIR, `${identity.name}-${mode}.html`)
    writeFileSync(file, buildPage(identity, mode), 'utf8')
    await page.goto(`file://${file}`)
    const got = await page.evaluate(measureInPage, { theme: identity.name === 'origam' ? 'origam' : identity.name, mode })
    if (!Array.isArray(got)) throw new Error(got.error)
    return new Map(got.map((m) => [m.key, m]))
}

test.describe('#924 — anneau de focus : contraste du token global border.focus', () => {
    test('la sonde mesure, et elle compose l\'alpha (temoins litteraux)', async ({ page }) => {
        const got = await measure(page, IDENTITIES[0], 'light')

        for (const [key, c] of Object.entries(CONTROLS)) {
            const m = got.get(key)
            expect(m, `temoin ${key} absent — la sonde n'a rien lu`).toBeTruthy()
            expect(Math.abs((m as IMeasure).ratio - c.expected), `${key}: attendu ~${c.expected}, lu ${(m as IMeasure).ratio}`).toBeLessThan(0.05)
        }

        // Le temoin qui separe une sonde qui compose d'une qui ne compose pas.
        const alpha = got.get('alpha50-sur-blanc') as IMeasure
        expect(alpha.naive, 'sans compositing l\'anneau alpha doit mesurer 21 — sinon ce temoin ne temoigne de rien').toBeCloseTo(21, 1)
        expect(alpha.ratio, 'avec compositing il doit mesurer 3.98').toBeCloseTo(3.98, 1)

        // Le temoin qui prouve la resolution au seuil exact.
        expect((got.get('949494-sur-blanc') as IMeasure).ratio).toBeGreaterThanOrEqual(AA_UI)
        expect((got.get('969696-sur-blanc') as IMeasure).ratio).toBeLessThan(AA_UI)
    })

    test('le token differe d\'une identite a l\'autre (controle negatif)', async ({ page }) => {
        const values = new Set<string>()
        for (const identity of IDENTITIES) {
            for (const mode of ['light', 'dark'] as const) {
                const got = await measure(page, identity, mode)
                values.add((got.get('raised') as IMeasure).ring)
            }
        }
        /*
         * Sans ce controle, une sonde qui aurait cesse d'actionner le theme
         * rendrait 16 fois la meme valeur et les 16 assertions ci-dessous
         * passeraient — vertes, bien formees, et sans rapport avec le sujet.
         */
        expect(values.size, `l'anneau doit changer selon l'identite ; lu ${values.size} valeur(s) distincte(s) sur 16`).toBeGreaterThanOrEqual(6)
    })

    for (const identity of IDENTITIES) {
        for (const mode of ['light', 'dark'] as const) {
            test(`${identity.name} / ${mode} — l'anneau tient ${AA_UI}:1 sur les 4 surfaces neutres + l'aplat danger`, async ({ page }) => {
                const got = await measure(page, identity, mode)

                for (const b of BACKDROPS) {
                    const m = got.get(b.id)
                    expect(m, `${identity.name}/${mode}: surface ${b.id} non mesuree`).toBeTruthy()
                    const { ratio, ring, bg } = m as IMeasure
                    expect(
                        ratio,
                        `${identity.name}/${mode} — anneau ${ring} sur ${bg} (${b.id}) = ${ratio}:1, sous le seuil WCAG 1.4.11 de ${AA_UI}:1`
                    ).toBeGreaterThanOrEqual(AA_UI)
                }
            })
        }
    }
})
