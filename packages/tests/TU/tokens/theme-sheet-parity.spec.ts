import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { origamDarkTheme, origamLightTheme } from '@origam/themes/origam.theme'
import { resolveThemeVars, themeSelector } from '@origam/utils/Commons/apply-theme.util'

/*********************************************************
 * #615 — la feuille de tokens et le thème runtime doivent dire la MÊME chose
 *
 * @description
 * Le ticket partait d'un fait sans explication : `--origam-color__text---primary`
 * résolvait `#0a0a0a` alors que toutes ses déclarations dans le CSS servi
 * pointaient `neutral-900` (`#171717`).
 *
 * La déclaration gagnante n'est pas dans une feuille : c'est
 * `origamLightTheme.vars.color.text.primary` (`src/themes/origam.theme.ts`),
 * que `createOrigam()` sérialise via `applyThemes()` → `themeToCss()` en un
 * bloc `:root { … }` **injecté dans `<head>` à l'install**, donc APRÈS les
 * feuilles importées. Même spécificité (0,1,0) → l'ordre source tranche →
 * le bloc runtime gagne.
 *
 * @description
 * Conséquence visible, mesurée en Chromium avant correction : le même thème
 * « light » peignait DEUX couleurs — `#0a0a0a` à la racine (bloc runtime) et
 * `#171717` dans un sous-arbre `<OrigamThemeProvider theme="light">`, où le
 * sélecteur `[data-theme="light"]` de la feuille matche alors que `:root` ne
 * matche plus. Ce n'était donc pas qu'un écart de documentation.
 *
 * @description
 * Ce garde relie les deux sources, sans `getComputedStyle` : sous jsdom il ne
 * résout jamais `var()` et fabrique `16px`, il mesurerait autre chose. On
 * résout les chaînes `var()` à la lecture du texte des feuilles, exactement
 * comme le fait `story-const-px-labels.spec.ts`.
 *
 * @description
 * ⚠️ La liste `DIVERGENCES_CONNUES` n'est PAS une permission : c'est l'état
 * mesuré au moment de #615, versé dans le dépôt pour qu'aucune NOUVELLE
 * divergence ne passe en silence. Elle doit rétrécir, jamais grossir. Le
 * chantier de fond (aligner la feuille light sur l'identité runtime, ou
 * l'inverse) est un arbitrage de tokens, pas une correction de bug — il
 * recoupe #789 (paires d'intention sous 4.5:1) et attend une décision.
 ********************************************************/

const __dirname = dirname(fileURLToPath(import.meta.url))
const TOKENS_DIR = resolve(__dirname, '../../../ds/src/assets/css/tokens')

/** Retire les commentaires CSS avant toute analyse. */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

/** `--origam-x: v;` → { '--origam-x': 'v' } sur le texte fourni. */
function declarations (css: string): Record<string, string> {
    const out: Record<string, string> = {}
    for (const m of stripComments(css).matchAll(/(--origam-[A-Za-z0-9_-]+)\s*:\s*([^;}]+)[;}]/g)) {
        out[m[1]] = m[2].trim()
    }
    return out
}

const PRIMITIVE = declarations(readFileSync(`${TOKENS_DIR}/primitive.css`, 'utf-8'))
const LIGHT = declarations(readFileSync(`${TOKENS_DIR}/light.css`, 'utf-8'))
const DARK = declarations(readFileSync(`${TOKENS_DIR}/dark.css`, 'utf-8'))

/** Résout `var(--a, repli)` jusqu'à une valeur littérale, dans le palier donné. */
function resolveIn (scope: Record<string, string>, expr: string, depth = 0): string {
    if (depth > 12) return expr
    const m = /^var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,\s*([^)]*))?\)$/.exec(expr.trim())
    if (!m) return expr.trim()
    const declared = scope[m[1]] ?? PRIMITIVE[m[1]]
    if (declared !== undefined) return resolveIn(scope, declared, depth + 1)
    if (m[2] !== undefined) return resolveIn(scope, m[2], depth + 1)
    return expr.trim()
}

/**
 * Normalise pour comparer. `String(v)` n'est pas décoratif : un `TSemanticLeaf`
 * peut être un NOMBRE (`font.weight.regular: 400`, `lineHeight.normal: 1.5`),
 * et un `.toLowerCase()` direct jette dessus.
 */
const norm = (v: string | number) => String(v).toLowerCase().replace(/\s+/g, ' ').trim()

/**
 * Noms que le thème runtime `light` pose et que la feuille `light.css` résout
 * AUTREMENT. Mesuré le 2026-09-16, après la correction de `text---primary`.
 * ⛔ Cette liste doit rétrécir. Un nom qui s'y ajoute est une régression.
 */
const DIVERGENCES_CONNUES = new Set([
    '--origam-color__surface---raised',
    '--origam-color__surface---sunken',
    '--origam-color__border---default',
    '--origam-color__border---subtle',
    '--origam-color__border---strong',
    '--origam-color__action--primary---bgSubtle',
    '--origam-color__action--secondary---bg',
    '--origam-color__action--secondary---bgHover',
    '--origam-color__action--secondary---bgDisabled',
    '--origam-color__action--secondary---fg',
    '--origam-color__action--ghost---bgHover',
    '--origam-color__feedback--success---bg',
    '--origam-color__feedback--success---bgSubtle',
    '--origam-color__feedback--success---border',
    '--origam-color__feedback--warning---bg',
    '--origam-color__feedback--warning---bgSubtle',
    '--origam-color__feedback--warning---border',
    '--origam-color__feedback--danger---bgSubtle',
    '--origam-color__feedback--danger---border',
    '--origam-color__feedback--info---bg',
    '--origam-color__feedback--info---bgSubtle',
    '--origam-color__feedback--info---fgSubtle',
    '--origam-color__feedback--info---border'
])

/**
 * Noms que le thème runtime pose et que la feuille ne déclare PAS du tout.
 * Le thème est alors la SEULE source : une app qui importe le CSS sans
 * `createOrigam()` n'a pas ces variables.
 */
const ABSENTS_DE_LA_FEUILLE = new Set([
    '--origam-color__text---tertiary',
    '--origam-color__text---ink',
    '--origam-color__border---subtle-alpha',
    '--origam-color__border---ghost',
    // Ombres propres à l'identité `origam`, jamais versées dans les feuilles.
    '--origam-shadow---btn-primary',
    '--origam-shadow---btn-secondary',
    '--origam-shadow---card-elevated',
    '--origam-shadow---glow-primary'
])

describe('#615 — le thème runtime racine et les feuilles de tokens', () => {
    it('le thème light est bien injecté à `:root` (contrôle positif du harnais)', () => {
        // Sans `name` ni `mode`, le bloc cible `:root` — donc il entre en
        // concurrence directe avec `:root, [data-theme="light"]` de light.css,
        // à spécificité égale. C'est toute la mécanique du défaut.
        expect(themeSelector(origamLightTheme)).toBe(':root')
        expect(themeSelector(origamDarkTheme)).toBe('[data-mode="dark"]')

        // …et le harnais lit bien les feuilles.
        expect(Object.keys(PRIMITIVE).length).toBeGreaterThan(100)
        expect(resolveIn(LIGHT, 'var(--origam-color__neutral---900)')).toBe('#171717')
        expect(resolveIn(LIGHT, 'var(--origam-color__neutral---950)')).toBe('#0a0a0a')
    })

    it('#615 — `color__text---primary` dit la même chose des deux côtés, en light comme en dark', () => {
        const light = resolveThemeVars(origamLightTheme)['--origam-color__text---primary']
        const dark = resolveThemeVars(origamDarkTheme)['--origam-color__text---primary']

        expect(norm(light)).toBe(norm(resolveIn(LIGHT, LIGHT['--origam-color__text---primary'])))
        expect(norm(dark)).toBe(norm(resolveIn(DARK, DARK['--origam-color__text---primary'])))

        // Et la valeur elle-même, pour que le ticket reste lisible dans dix ans.
        expect(norm(light)).toBe('#0a0a0a')
        expect(norm(dark)).toBe('#fafafa')
    })

    it('aucune NOUVELLE divergence entre `origamLightTheme` et `light.css`', () => {
        const themeVars = resolveThemeVars(origamLightTheme)
        const nouvelles: string[] = []
        const absents: string[] = []

        for (const name of Object.keys(themeVars)) {
            // ⚠️ `primitive.css` compte : le thème pose aussi des noms du palier
            // primitif (`--origam-radius---md`, `--origam-motion__*`, …) que
            // `light.css` ne redéclare pas. Les chercher uniquement dans
            // `light.css` les faisait passer pour absents du dépôt.
            const sheet = LIGHT[name] ?? PRIMITIVE[name]
            if (sheet === undefined) {
                if (!ABSENTS_DE_LA_FEUILLE.has(name)) absents.push(name)
                continue
            }
            if (norm(resolveIn(LIGHT, sheet)) === norm(themeVars[name])) continue
            if (!DIVERGENCES_CONNUES.has(name)) nouvelles.push(name)
        }

        expect(nouvelles, 'divergence NON répertoriée : la feuille et le thème ne disent plus la même chose').toEqual([])
        expect(absents, 'le thème pose un token que la feuille ne déclare nulle part').toEqual([])
    })

    it('la liste des divergences connues ne contient rien de périmé', () => {
        // Un nom qui a été corrigé doit SORTIR de la liste, sinon elle devient
        // un catalogue de dettes imaginaires et plus personne ne la relit.
        const themeVars = resolveThemeVars(origamLightTheme)
        const perimes = [...DIVERGENCES_CONNUES].filter((name) => {
            const sheet = LIGHT[name] ?? PRIMITIVE[name]
            return sheet !== undefined && norm(resolveIn(LIGHT, sheet)) === norm(themeVars[name])
        })

        expect(perimes, 'ces noms ne divergent plus — les retirer de DIVERGENCES_CONNUES').toEqual([])
    })

    it('aucune NOUVELLE divergence entre `origamDarkTheme` et `dark.css`', () => {
        const themeVars = resolveThemeVars(origamDarkTheme)
        const rapport: Array<{ token: string, theme: string, feuille: string }> = []

        for (const name of Object.keys(themeVars)) {
            const sheet = DARK[name]
            if (sheet === undefined) continue
            const resolved = resolveIn(DARK, sheet)
            if (norm(resolved) !== norm(themeVars[name])) {
                rapport.push({ token: name, theme: themeVars[name], feuille: resolved })
            }
        }

        // Le palier `text` du thème sombre est, lui, aligné sur sa feuille :
        // la divergence de #615 était une asymétrie light-seulement.
        const textuels = rapport.filter((r) => r.token.startsWith('--origam-color__text---'))
        expect(textuels).toEqual([])
    })
})
