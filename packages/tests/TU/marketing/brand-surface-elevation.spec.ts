/**
 * #829 — `surface.sunken` doit lire comme un CREUX dans chaque palette de marque.
 *
 * POURQUOI CETTE SPEC EXISTE
 * --------------------------
 * `default` / `raised` / `sunken` ne sont pas trois couleurs interchangeables :
 * ce sont des ROLES. Un `sunken` promet une surface encaissee. Le theme `geek`
 * declarait, en mode CLAIR, un `sunken` (`#fbf5ff`) plus clair que son
 * `default` (`#f6f0ff`) : chacun des consommateurs qui demandait un creux
 * recevait un ton surELEVE. Mesure Chromium sur `/installation`, thema `geek`,
 * avant correctif — 13 blocs `.origam-code` peints `rgb(251, 245, 255)`
 * par-dessus une page a `rgb(246, 240, 255)`.
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
 * Mesure du depot au moment d'ecrire (luminance relative WCAG) :
 *
 *   mode clair   sunken < default   apple cartoon ecom editorial material ✅
 *                                   geek ❌ (#829, corrige ici)
 *   mode sombre  sunken > default   les 7 marques ✅ — y compris `geek`
 *
 * ⛔ La moitie SOMBRE de #829 n'etait donc PAS un defaut. Le ticket la signalait
 * au motif que `sunken` y depasse `raised` ; sur cette relation-la le depot
 * n'est pas uniforme (apple, cartoon, editorial, material et geek font ainsi ;
 * seuls ecom et glass l'inversent), et rien ne permet d'en faire une regle.
 * Cette spec n'arbitre donc QUE le couple {default, sunken}.
 *
 * ⛔ POURQUOI UN TEST STATIQUE EST LEGITIME ICI
 * ---------------------------------------------
 * Meme raisonnement que `brand-palette-contrast.spec.ts` : la regle CLAUDE.md
 * §#398 (`getComputedStyle` sous jsdom ne resout jamais `var()`) vise les
 * mesures de STYLE RENDU. On ne mesure rien de rendu : on lit des litteraux
 * hexadecimaux dans l'objet `IOrigamTheme`, avant toute indirection CSS. Le
 * navigateur reste l'arbitre de ce qui est peint (c'est ce qui a servi a
 * etablir le defaut et son correctif) ; cette spec arbitre ce qui est ECRIT.
 *
 * Les valeurs non litterales (`rgba(…)`, `var(…)`, `color-mix(…)`) sont
 * ignorees : leur clarte depend d'un fond composite que seul le navigateur
 * connait. C'est ce qui met `glass` hors de portee ici — ses `raised` /
 * `sunken` sont des blancs semi-opaques. ⚠️ Composite sur son propre
 * `default`, `glass` CLAIR presente la meme inversion que `geek`
 * (sunken L=0.976 > default L=0.845) ; ce n'est pas tranche et ce n'est pas le
 * perimetre de #829. Le compteur `covered` ci-dessous empeche ce filtre de
 * vider la spec en silence.
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

/**
 * Formule de `TU/marketing/brand-palette-contrast.spec.ts` (l.58-71), elle-meme
 * reprise de `e2e/token-intent-contrast.spec.ts`. Le depot la porte en local
 * dans 5 fichiers ; on suit l'usage etabli plutot que d'extraire un module
 * partage au detour d'un correctif de couleur.
 */
const toRgb = (value: string): [number, number, number] => {
    const raw = value.replace('#', '')
    const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw

    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number]
}

const luminance = (hex: string): number => {
    const rgb = toRgb(hex)
    const channel = (v: number): number => {
        const s = v / 255

        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }

    return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])
}

/** Un hex litteral `#rgb` / `#rrggbb` — seule forme que cette spec arbitre. */
const isLiteralHex = (value: unknown): value is string =>
    typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())

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
        const { default: def, sunken } = surface as { default?: unknown, sunken?: unknown }

        if (!isLiteralHex(def) || !isLiteralHex(sunken)) {
            // `glass` uniquement — surfaces semi-opaques, cf. l'en-tete.
            expect(brand).toBe('glass')

            return
        }

        covered += 1

        const lDefault = luminance(def.trim())
        const lSunken = luminance(sunken.trim())

        const detail = `${brand}/${mode}: default ${def} (L=${lDefault.toFixed(4)}) `
            + `vs sunken ${sunken} (L=${lSunken.toFixed(4)})`

        if (mode === 'light') {
            // Un creux se lit plus SOMBRE que la page en mode clair.
            expect(lSunken, `${detail} — sunken doit etre plus SOMBRE que default`).toBeLessThan(lDefault)
        } else {
            // … et plus CLAIR qu'elle en mode sombre.
            expect(lSunken, `${detail} — sunken doit etre plus CLAIR que default`).toBeGreaterThan(lDefault)
        }
    })

    it('le filtre « litteral » n\'a pas vide la spec', () => {
        // 14 cas moins les 2 de `glass` (surfaces `rgba`).
        expect(covered).toBe(12)
    })
})
