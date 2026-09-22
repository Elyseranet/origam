/**
 * #871 — les couples `{bg, fg}` des palettes de marque tiennent AA.
 *
 * POURQUOI CETTE SPEC EXISTE
 * --------------------------
 * Les 7 dernieres violations de #871 ne venaient pas d'un composant : elles
 * venaient de deux palettes de marque ou le mode SOMBRE eclaircit l'accent
 * (`action.primary.bg`) et garde l'encre `#ffffff` heritee du jumeau clair.
 * Le DS, lui, etait a zero.
 *
 *   apple  sombre : #ffffff sur #0a84ff = 3.65:1
 *   ecom   sombre : #ffffff sur #f43f5e = 3.67:1
 *
 * Ces deux couples ne sont lus par aucun test de CI. L'instrument qui les a
 * trouves — `packages/tests/audit/dark-contrast.audit.mjs` — est un audit
 * qu'on lance a la main, pas une spec : rien ne le rejoue, donc rien
 * n'empeche une retouche de palette de les ramener en silence. Cette spec
 * ferme ce trou.
 *
 * ⛔ POURQUOI C'EST UN TEST STATIQUE, ET POURQUOI C'EST LEGITIME ICI
 * ------------------------------------------------------------------
 * La regle du depot (CLAUDE.md §#398) est que `getComputedStyle` sous jsdom
 * ne resout JAMAIS `var()`, donc qu'une mesure de style doit passer par un
 * vrai navigateur. Elle ne s'applique pas ici : on ne mesure aucun style
 * rendu. On lit des LITTERAUX hexadecimaux dans l'objet `IOrigamTheme`, avant
 * toute indirection CSS. Le navigateur reste l'arbitre de ce qui est peint a
 * l'ecran (c'est le role de l'audit) ; cette spec arbitre ce qui est ECRIT
 * dans la palette.
 *
 * Les valeurs non litterales (`rgba(…)`, `var(…)`, `transparent`,
 * `color-mix(…)`) sont volontairement ignorees : leur rendu depend d'un fond
 * composite que seul le navigateur connait. Le compteur `covered` ci-dessous
 * empeche ce filtre de vider la spec en silence.
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

/** Seuil WCAG 2.x AA pour du texte de taille courante. */
const AA_TEXT = 4.5

/**
 * Formule de `packages/tests/e2e/token-intent-contrast.spec.ts` (l.192-197),
 * elle-meme validee par temoins calcules a la main : noir/blanc 21.00 ·
 * #767676 4.54 · #777777 4.48. Ne pas en ecrire une autre.
 */
const toRgb = (value: string): [number, number, number] => {
    const raw = value.replace('#', '')
    const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw

    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number]
}

const luminance = (rgb: [number, number, number]): number => {
    const channel = (v: number): number => {
        const s = v / 255

        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }

    return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])
}

const contrast = (fg: string, bg: string): number => {
    const [a, b] = [luminance(toRgb(fg)), luminance(toRgb(bg))]
    const [hi, lo] = a > b ? [a, b] : [b, a]

    return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100
}

/** Un hex litteral `#rgb` / `#rrggbb` — seule forme que cette spec arbitre. */
const isLiteralHex = (value: unknown): value is string =>
    typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())

interface IPairSource {
    bg?: unknown
    fg?: unknown
}

/** Les couples `{bg, fg}` litteraux d'un theme, nommes pour le message d'echec. */
function literalPairs (theme: IOrigamTheme): { label: string, fg: string, bg: string }[] {
    const color = (theme.vars?.color ?? {}) as Record<string, unknown>
    const pairs: { label: string, fg: string, bg: string }[] = []

    const push = (label: string, source: unknown): void => {
        const entry = source as IPairSource | undefined

        if (!entry || !isLiteralHex(entry.bg) || !isLiteralHex(entry.fg)) return

        pairs.push({ label, fg: entry.fg.trim(), bg: entry.bg.trim() })
    }

    for (const [name, entry] of Object.entries((color.action ?? {}) as Record<string, unknown>)) {
        push(`action.${name}`, entry)
    }

    for (const [name, entry] of Object.entries((color.feedback ?? {}) as Record<string, unknown>)) {
        push(`feedback.${name}`, entry)
    }

    return pairs
}

const BRANDS: [string, IOrigamTheme, IOrigamTheme][] = [
    ['apple', appleLightTheme, appleDarkTheme],
    ['cartoon', cartoonLightTheme, cartoonDarkTheme],
    ['ecom', ecomLightTheme, ecomDarkTheme],
    ['editorial', editorialLightTheme, editorialDarkTheme],
    ['geek', geekLightTheme, geekDarkTheme],
    ['glass', glassLightTheme, glassDarkTheme],
    ['material', materialLightTheme, materialDarkTheme]
]

describe('#871 — couples bg/fg des palettes de marque', () => {
    /*
     * Controle de la formule AVANT tout verdict. Une sonde qui ne sait pas
     * prouver qu'elle mesure ne mesure rien : sans ce bloc, une regression de
     * `contrast()` rendrait la suite verte sur une palette cassee.
     */
    it('la formule reproduit ses trois temoins calcules a la main', () => {
        expect(contrast('#000000', '#ffffff')).toBe(21)
        expect(contrast('#767676', '#ffffff')).toBe(4.54)
        expect(contrast('#777777', '#ffffff')).toBe(4.48)
    })

    /*
     * Controle negatif : les trois couples corrigés par #871 DOIVENT etre
     * detectes comme fautifs par cette meme sonde. Sinon le test ci-dessous
     * passerait aussi sur le code d'avant le correctif — un vert qui ne prouve
     * rien (CLAUDE.md : « toujours confronter une nouvelle spec au commit
     * parent »).
     */
    it('la sonde rejette bien les trois couples que #871 a corriges', () => {
        expect(contrast('#ffffff', '#0a84ff')).toBe(3.65) // apple sombre, avant
        expect(contrast('#ffffff', '#f43f5e')).toBe(3.67) // ecom sombre, avant
        expect(contrast('#e11d48', '#fff7f0')).toBe(4.43) // ecom clair, fil d'Ariane, avant

        for (const ratio of [3.65, 3.67, 4.43]) expect(ratio).toBeLessThan(AA_TEXT)
    })

    let covered = 0

    for (const [brand, light, dark] of BRANDS) {
        for (const [mode, theme] of [['clair', light], ['sombre', dark]] as const) {
            it(`${brand} ${mode} — chaque couple litteral tient AA`, () => {
                const pairs = literalPairs(theme)
                const failures = pairs
                    .map((p) => ({ ...p, ratio: contrast(p.fg, p.bg) }))
                    .filter((p) => p.ratio < AA_TEXT)
                    .map((p) => `${p.label} : ${p.fg} sur ${p.bg} = ${p.ratio}:1`)

                covered += pairs.length

                expect(pairs.length, `${brand}/${mode} n'expose aucun couple litteral — le filtre a tout mange`).toBeGreaterThan(0)
                expect(failures, `${brand}/${mode} — couple(s) sous ${AA_TEXT}:1`).toEqual([])
            })
        }
    }

    /*
     * Garde-fou de couverture. Le filtre `isLiteralHex` est volontairement
     * strict ; s'il se met a tout rejeter (un refactor qui passerait les
     * palettes en `oklch()`, par exemple), les 14 tests ci-dessus resteraient
     * verts sur zero comparaison. Ce plancher rend cette derive bruyante.
     */
    it('la couverture reste substantielle', () => {
        expect(covered).toBeGreaterThanOrEqual(60)
    })
})
