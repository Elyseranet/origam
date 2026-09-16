import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { BORDER_KEYWORD_WIDTH } from '@origam/consts/Commons/border.const'
import { NAMED_RADIUS_TOKEN } from '@origam/consts/Commons/spacing.const'
import { borderList, roundedList } from '@stories/const'

/*********************************************************
 * #730 — un libellé de story qui annonce une largeur est une MESURE
 *
 * @description
 * `{ label: 'Width — thick (utility, 3px)', value: 'thick' }` annonçait 3px
 * là où `thick` rend 2px. Une story est l'endroit où un intégrateur vérifie
 * ce que fait une prop : un libellé faux transforme l'instrument de mesure
 * en source d'erreur — quelqu'un qui mesure 2px conclut au défaut d'un
 * composant qui est correct.
 *
 * @description
 * Ce garde relie le libellé à la SEULE chaîne qui décide de la valeur rendue,
 * bout à bout et sans recopier aucun nombre :
 *
 *   libellé de story  →  BORDER_KEYWORD_WIDTH / NAMED_RADIUS_TOKEN
 *                     →  var(--origam-…)  →  primitive.css
 *
 * Les px sont LUS dans `primitive.css`, jamais réécrits ici : un échelon
 * retouché dans la feuille fait rougir le libellé qui ment, ce qui est
 * exactement l'inverse d'un test qui fige un littéral et interdit la
 * correction.
 *
 * @description
 * ⚠️ Ce qu'il ne couvre PAS : la valeur RENDUE dans un navigateur. La
 * résolution réelle de `var()` est mesurée en e2e (`border-keywords-sample.spec.ts`,
 * `btn-border.spec.ts`) — sous jsdom, `getComputedStyle` ne résout jamais
 * `var()` et fabrique `16px`.
 ********************************************************/

const __dirname = dirname(fileURLToPath(import.meta.url))
const PRIMITIVE_CSS = resolve(__dirname, '../../../ds/src/assets/css/tokens/primitive.css')

/** `--origam-x: 2px;` → { '--origam-x': '2px' } sur toute la feuille primitive. */
function readPrimitiveTokens (): Record<string, string> {
    const css = readFileSync(PRIMITIVE_CSS, 'utf-8')
    const out: Record<string, string> = {}
    for (const m of css.matchAll(/(--origam-[A-Za-z0-9_.-]+)\s*:\s*([^;}]+)[;}]/g)) {
        out[m[1]] = m[2].trim()
    }
    return out
}

const TOKENS = readPrimitiveTokens()

/** Résout `var(--a, 3px)` / `--a` / `4px` jusqu'à une valeur littérale. */
function resolveVar (expr: string, depth = 0): string {
    if (depth > 8) throw new Error(`cycle de var() sur « ${expr} »`)
    const m = /^var\(\s*(--[A-Za-z0-9_.-]+)\s*(?:,\s*([^)]*))?\)$/.exec(expr.trim())
    if (!m) return expr.trim()
    const declared = TOKENS[m[1]]
    if (declared !== undefined) return resolveVar(declared, depth + 1)
    if (m[2] !== undefined) return resolveVar(m[2], depth + 1)
    throw new Error(`token « ${m[1]} » non déclaré dans primitive.css et sans repli`)
}

const px = (v: string) => Number.parseFloat(v)

describe('#730 — les libellés de story qui annoncent des px disent la vérité', () => {
    it('la feuille primitive est bien lue (contrôle positif du harnais)', () => {
        // Sans ce témoin, un parseur muet rendrait tout le fichier vert.
        expect(Object.keys(TOKENS).length).toBeGreaterThan(50)
        expect(TOKENS['--origam-border__width---2']).toBe('2px')
        expect(resolveVar('var(--origam-border__width---2)')).toBe('2px')
        // …et il sait dire non quand la valeur diffère.
        expect(resolveVar('var(--origam-border__width---thin)')).not.toBe('2px')
    })

    it('borderList — chaque mot-clé utilitaire annonce la largeur de son échelon', () => {
        const announced = borderList
            .filter((o): o is { label: string, value: string } => typeof o.value === 'string')
            .map((o) => ({ ...o, px: /\(utility,\s*(\d+)px\)/.exec(o.label)?.[1] }))
            .filter((o) => o.px !== undefined)

        // Le filtre doit ramener quelque chose, sinon l'assertion suivante
        // boucle sur zéro élément et le test passe en ne vérifiant rien.
        expect(announced.map((o) => o.value)).toEqual(['thin', 'thick'])

        for (const option of announced) {
            const keyword = option.value as keyof typeof BORDER_KEYWORD_WIDTH
            const real = px(resolveVar(BORDER_KEYWORD_WIDTH[keyword]))
            expect(Number(option.px), `libellé « ${option.label} »`).toBe(real)
        }
    })

    it('borderList — chaque largeur numérique annonce sa propre valeur', () => {
        const numeric = borderList.filter((o): o is { label: string, value: number } => typeof o.value === 'number')

        expect(numeric.length).toBeGreaterThan(0)

        for (const option of numeric) {
            const claimed = /Width — (\d+)px/.exec(option.label)?.[1]
            expect(claimed, `libellé « ${option.label} »`).toBeDefined()
            expect(Number(claimed), `libellé « ${option.label} »`).toBe(option.value)
        }
    })

    it("l'échelle de largeurs ne comporte aucun échelon de 3px", () => {
        // La raison de fond du défaut : « thick = 3px » supposait un échelon
        // qui n'existe pas. Si un 3px est un jour ajouté, ce garde doit être
        // relu — pas contourné.
        const widths = Object.keys(TOKENS)
            .filter((n) => n.startsWith('--origam-border__width---'))
            .map((n) => TOKENS[n])

        expect(widths.sort()).toEqual(['0px', '1px', '2px', '4px'])
    })

    it('roundedList — chaque rung annonce le px de son token de radius', () => {
        const announced = roundedList
            .filter((o): o is { label: string, value: string } => typeof o.value === 'string')
            .map((o) => ({ ...o, px: /\/\s*(\d+)px\)/.exec(o.label)?.[1] }))
            .filter((o) => o.px !== undefined)

        expect(announced.length).toBe(Object.keys(NAMED_RADIUS_TOKEN).length)

        for (const option of announced) {
            const token = NAMED_RADIUS_TOKEN[option.value]
            expect(token, `« ${option.value} » absent de NAMED_RADIUS_TOKEN`).toBeDefined()
            expect(Number(option.px), `libellé « ${option.label} »`).toBe(px(resolveVar(token)))
        }
    })
})
