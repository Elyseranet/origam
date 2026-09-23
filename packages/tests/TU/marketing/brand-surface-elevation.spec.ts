/**
 * #829 — `surface.sunken` doit lire comme un CREUX dans chaque palette de marque.
 *
 * POURQUOI CETTE SPEC EXISTE
 * --------------------------
 * `default` / `raised` / `sunken` ne sont pas trois couleurs interchangeables :
 * ce sont des ROLES. Un `sunken` promet une surface encaissee. DEUX marques le
 * declaraient du mauvais cote en mode CLAIR, et chacune recevait donc un ton
 * surELEVE partout ou un creux etait demande :
 *
 *   geek   `#fbf5ff`                 plus clair que son `default` `#f6f0ff`
 *   glass  `rgba(255,255,255,0.85)`  rendu `rgb(252,252,255)` sur une page a
 *                                    `rgb(233,236,255)`
 *
 * Mesure Chromium sur `/installation` avant correctif : les 13 blocs
 * `.origam-code` peints plus clair que la page sous les deux identites.
 *
 * Aucun test du depot ne lisait ce couple. `audit/dark-contrast.audit.mjs`
 * arbitre des couples {encre, fond} — pas l'ORDRE de clarte entre deux fonds —
 * et il etait vert (0 / 1664) pendant toute la duree du defaut. Cette spec
 * ferme ce trou.
 *
 * ⛔ LE SENS S'INVERSE ENTRE LES DEUX MODES, et c'est le coeur de la regle.
 * Un creux se lit plus SOMBRE que la page en mode clair, et plus CLAIR qu'elle
 * en mode sombre (la lumiere vient toujours du meme cote ; c'est la page qui
 * change de cote). Une spec qui asserterait « sunken plus sombre » dans les
 * deux modes condamnerait les 7 palettes sombres du depot, qui sont correctes.
 *
 * ⛔ La moitie SOMBRE de #829 n'etait PAS un defaut, ni pour `geek` ni pour
 * `glass`. Le ticket la signalait au motif que `sunken` y depasse `raised` ;
 * sur cette relation le depot n'est pas uniforme (apple, cartoon, editorial,
 * material et geek font ainsi ; ecom et glass l'inversent), et rien ne permet
 * d'en faire une regle. Cette spec n'arbitre donc QUE le couple
 * {default, sunken}.
 *
 * ⛔ POURQUOI « LE VERRE DEPOLI ECLAIRCIT » N'EXCUSAIT PAS `glass`
 * ---------------------------------------------------------------
 * L'objection est serieuse : un verre depoli qui eclaircit ce qu'il couvre
 * n'est pas absurde. Ce qui la refute est le mode SOMBRE de `glass` lui-meme.
 * Mesure des pixels RENDUS (capture d'ecran relue via canvas) :
 *
 *   glass sombre : default L=0.0021 | sunken L=0.0052 | raised L=0.0065
 *                  -> sunken est une elevation PLUS FAIBLE que raised
 *   glass clair  : default L=0.8453 | raised  L=0.9413 | sunken L=0.9754
 *                  -> sunken etait PLUS LOIN de la page que raised
 *
 * En sombre l'identite place deja `sunken` ENTRE `default` et `raised` (blanc
 * 4 % contre 5 %). En clair elle le placait AU-DELA de `raised` (blanc 85 %
 * contre 65 %). La these « le depoli eclaircit » predirait le meme sens dans
 * les deux modes ; l'identite se contredisait elle-meme. Le correctif garde la
 * translucidite (les consommateurs de `backdrop-filter` voient toujours au
 * travers) et remplace le blanc par l'encre de la palette a 3 %.
 *
 * ⛔ POURQUOI UN TEST STATIQUE EST LEGITIME ICI
 * ---------------------------------------------
 * Meme raisonnement que `brand-palette-contrast.spec.ts` : la regle CLAUDE.md
 * §#398 (`getComputedStyle` sous jsdom ne resout jamais `var()`) vise les
 * mesures de STYLE RENDU. On ne mesure rien de rendu : on lit des valeurs de
 * l'objet `IOrigamTheme`, avant toute indirection CSS. Le navigateur reste
 * l'arbitre de ce qui est peint (c'est ce qui a servi a etablir les deux
 * defauts et leurs correctifs) ; cette spec arbitre ce qui est ECRIT.
 */

import { describe, expect, it } from 'vitest'

import type { IOrigamTheme } from 'origam/interfaces'

import { appleDarkTheme, appleLightTheme } from '~/themes/apple.theme'
import { cartoonDarkTheme, cartoonLightTheme } from '~/themes/cartoon.theme'
import { ecomDarkTheme, ecomLightTheme } from '~/themes/ecom.theme'
import { editorialDarkTheme, editorialLightTheme } from '~/themes/editorial.theme'
import { geekDarkTheme, geekLightTheme } from '~/themes/geek.theme'
import { glassDarkTheme, glassLightTheme } from '~/themes/glass.theme'
import { materialDarkTheme, materialLightTheme } from '~/themes/material.theme'

type TRgb = [number, number, number]

/**
 * Formule de `TU/marketing/brand-palette-contrast.spec.ts` (l.58-71), elle-meme
 * reprise de `e2e/token-intent-contrast.spec.ts`. Le depot la porte en local
 * dans 5 fichiers ; on suit l'usage etabli plutot que d'extraire un module
 * partage au detour d'un correctif de couleur.
 */
const hexToRgb = (value: string): TRgb => {
    const raw = value.replace('#', '')
    const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw

    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as TRgb
}

const luminance = (rgb: TRgb): number => {
    const channel = (v: number): number => {
        const s = v / 255

        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }

    return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])
}

/**
 * Compositing alpha — meme operation que `over()` dans
 * `audit/dark-contrast.audit.mjs`, qui reproduit lui-meme
 * `resolvePaintedBackground` de `ds/src/directives/Contrast/contrast.directive.ts`.
 */
const over = (top: TRgb, alpha: number, bottom: TRgb): TRgb =>
    top.map((c, i) => c * alpha + bottom[i] * (1 - alpha)) as TRgb

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i
const RGBA = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/i

/**
 * Resout une valeur de surface en RGB opaque, composite sur `ground` si elle
 * est translucide.
 *
 * ⛔ Retourne `null` — et NE DEVINE PAS — sur toute forme inconnue
 * (`color(srgb …)`, `oklch(…)`, `color-mix(…)`, `var(…)`). Un parseur qui rend
 * silencieusement une valeur par defaut ne sous-rapporte pas : il MIS-rapporte,
 * et c'est exactement ce qui a fabrique 4 fausses violations dans #871. Le
 * compteur `covered` plus bas transforme un `null` inattendu en echec.
 */
const resolve = (value: unknown, ground: TRgb | null): TRgb | null => {
    if (typeof value !== 'string') return null

    const raw = value.trim()

    if (HEX.test(raw)) return hexToRgb(raw)

    const m = RGBA.exec(raw)

    if (!m) return null

    const rgb: TRgb = [Number(m[1]), Number(m[2]), Number(m[3])]
    const alpha = m[4] === undefined ? 1 : Number(m[4])

    if (rgb.some(Number.isNaN) || Number.isNaN(alpha)) return null
    if (alpha === 1) return rgb
    if (ground === null) return null

    return over(rgb, alpha, ground)
}

const surfaceOf = (theme: IOrigamTheme): Record<string, unknown> => {
    const color = (theme.vars?.color ?? {}) as Record<string, unknown>

    return (color.surface ?? {}) as Record<string, unknown>
}

interface ICase {
    brand: string
    mode: 'light' | 'dark'
    theme: IOrigamTheme
}

const CASES: ICase[] = [
    { brand: 'apple', mode: 'light', theme: appleLightTheme },
    { brand: 'apple', mode: 'dark', theme: appleDarkTheme },
    { brand: 'cartoon', mode: 'light', theme: cartoonLightTheme },
    { brand: 'cartoon', mode: 'dark', theme: cartoonDarkTheme },
    { brand: 'ecom', mode: 'light', theme: ecomLightTheme },
    { brand: 'ecom', mode: 'dark', theme: ecomDarkTheme },
    { brand: 'editorial', mode: 'light', theme: editorialLightTheme },
    { brand: 'editorial', mode: 'dark', theme: editorialDarkTheme },
    { brand: 'geek', mode: 'light', theme: geekLightTheme },
    { brand: 'geek', mode: 'dark', theme: geekDarkTheme },
    { brand: 'glass', mode: 'light', theme: glassLightTheme },
    { brand: 'glass', mode: 'dark', theme: glassDarkTheme },
    { brand: 'material', mode: 'light', theme: materialLightTheme },
    { brand: 'material', mode: 'dark', theme: materialDarkTheme }
]

describe('#829 — palettes de marque : `surface.sunken` lit comme un creux', () => {
    let covered = 0

    it.each(CASES)('$brand / $mode — sunken du bon cote de default', ({ brand, mode, theme }) => {
        const surface = surfaceOf(theme)
        const { default: rawDefault, sunken: rawSunken } = surface as {
            default?: unknown
            sunken?: unknown
        }

        // `default` est le sol : il doit etre opaque, sinon il n'y a pas de
        // reference pour composer. Les 7 marques le declarent en hex litteral.
        const ground = resolve(rawDefault, null)

        expect(ground, `${brand}/${mode}: \`default\` illisible (${String(rawDefault)})`).not.toBeNull()

        // `sunken` peut etre translucide (glass) — on le composite sur le sol,
        // ce que fait le navigateur quand un consommateur le peint sur la page.
        const sunken = resolve(rawSunken, ground)

        expect(sunken, `${brand}/${mode}: \`sunken\` illisible (${String(rawSunken)})`).not.toBeNull()

        covered += 1

        const lDefault = luminance(ground as TRgb)
        const lSunken = luminance(sunken as TRgb)

        const detail = `${brand}/${mode}: default ${String(rawDefault)} (L=${lDefault.toFixed(4)}) `
            + `vs sunken ${String(rawSunken)} (L=${lSunken.toFixed(4)})`

        if (mode === 'light') {
            // Un creux se lit plus SOMBRE que la page en mode clair.
            expect(lSunken, `${detail} — sunken doit etre plus SOMBRE que default`).toBeLessThan(lDefault)
        } else {
            // … et plus CLAIR qu'elle en mode sombre.
            expect(lSunken, `${detail} — sunken doit etre plus CLAIR que default`).toBeGreaterThan(lDefault)
        }
    })

    it('les 14 cas ont bien ete arbitres — aucun n\'a ete saute en silence', () => {
        expect(covered).toBe(CASES.length)
    })
})
