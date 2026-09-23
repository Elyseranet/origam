/**
 * #267 — chaque marque porte les bonnes couleurs `feedback` dans son objet
 * `IOrigamTheme`.
 *
 * POURQUOI CETTE SPEC EXISTE, ET POURQUOI ELLE EST ICI
 * ---------------------------------------------------
 * Elle remplace le « Tier 1 » de `packages/tests/e2e/theming-feedback-tokens.spec.ts`,
 * qui lisait en TEXTE le fichier généré `theme-builder-brand-presets.const.ts`
 * et en extrayait les `--origam-color__feedback--*---bg` à coups de regex.
 *
 * Ce fichier était du CODE MORT — mesuré, pas supposé : `THEME_BUILDER_PRESETS`
 * filtrait chacune des 8 clés qu'il déclarait, si bien que le vider à `[]` OU
 * le régénérer (-804 lignes) laissait l'état du Theme Builder **identique à
 * l'octet près** sur les 7 marques. Il a été supprimé avec son générateur sous
 * #267. La source de vérité est l'objet `IOrigamTheme` de chaque marque, dont
 * `presetFromThemes()` dérive le preset à l'exécution (props + vars).
 *
 * ⛔ LES VALEURS SOMBRES ONT CHANGÉ EN RETARGETANT, ET C'EST LE FOND DU SUJET.
 * L'ancien fichier était généré depuis la couche CSS legacy
 * `assets/src/assets/css/themes/*.css` (#269). Sur l'axe SOMBRE, cette couche
 * avait dérivé des objets de thème pour **les 7 marques** ; sur l'axe CLAIR,
 * les deux sources concordaient exactement. Les valeurs ci-dessous sont celles
 * des objets vivants — les claires sont inchangées, les sombres corrigées.
 *
 * `sobre` a disparu de la table : il n'a pas de `*.theme.ts` (c'est la
 * baseline DS, donc le thème `origam`), il n'y a plus rien de spécifique à
 * épingler.
 *
 * ⛔ POURQUOI UN TEST STATIQUE PLUTÔT QU'UN E2E
 * Depuis le retarget, cette vérification ne touche ni navigateur, ni serveur
 * Nuxt, ni base : elle lit des objets TypeScript. La laisser dans la suite e2e
 * marketing la rendait INEXÉCUTABLE en CI — ce fichier appelle
 * `requireMarketingDb()` pour son Tier 2, et **aucun job de `ci.yml` ne
 * provisionne de base** (`grep -c NUXT_DB .github/workflows/ci.yml` → 0), donc
 * l'ajouter à `MARKETING_GREEN_SPECS` aurait rendu le job rouge. Ici, elle
 * tourne dans le job unitaire, qui lui s'exécute à chaque push.
 *
 * Même famille que `brand-palette-contrast.spec.ts`, juste à côté.
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

type TFeedbackIntent = 'success' | 'danger' | 'warning' | 'info'

interface IFeedbackCase {
    brand: string
    mode: 'light' | 'dark'
    theme: IOrigamTheme
    expected: Partial<Record<TFeedbackIntent, string>>
}

const CASES: IFeedbackCase[] = [
    {
        brand: 'apple', mode: 'light', theme: appleLightTheme,
        expected: { success: '#28cd41', danger: '#ff3b30', warning: '#ff9f0a', info: '#0071e3' }
    },
    {
        brand: 'material', mode: 'light', theme: materialLightTheme,
        expected: { success: '#388e3c', danger: '#b3261e', warning: '#f57c00', info: '#0288d1' }
    },
    {
        brand: 'ecom', mode: 'light', theme: ecomLightTheme,
        expected: { success: '#16a34a', danger: '#dc2626', warning: '#b45309', info: '#1677ff' }
    },
    {
        brand: 'editorial', mode: 'light', theme: editorialLightTheme,
        expected: { success: '#15803d', danger: '#b91c1c', warning: '#b45309', info: '#1d4ed8' }
    },
    {
        brand: 'cartoon', mode: 'light', theme: cartoonLightTheme,
        expected: { success: '#16a34a', danger: '#ef4444', warning: '#fbbf24', info: '#60a5fa' }
    },
    {
        brand: 'geek', mode: 'light', theme: geekLightTheme,
        expected: { success: '#16a34a', danger: '#dc2626', warning: '#d97706', info: '#2563eb' }
    },
    {
        brand: 'glass', mode: 'light', theme: glassLightTheme,
        expected: { success: '#16a34a', danger: '#dc2626', warning: '#d97706', info: '#2563eb' }
    },
    {
        brand: 'apple', mode: 'dark', theme: appleDarkTheme,
        expected: { success: '#64e47c', danger: '#ff6961', warning: '#ffb445', info: '#0a84ff' }
    },
    {
        brand: 'material', mode: 'dark', theme: materialDarkTheme,
        expected: { success: '#81c784', danger: '#e57373', warning: '#ffb300', info: '#d0bcff' }
    },
    {
        brand: 'geek', mode: 'dark', theme: geekDarkTheme,
        expected: { success: '#39ff14', danger: '#ff3864', warning: '#ffd166', info: '#00f0ff' }
    },
    {
        brand: 'cartoon', mode: 'dark', theme: cartoonDarkTheme,
        expected: { success: '#86efac', danger: '#ff6961', warning: '#fcd34d', info: '#7dd3fc' }
    },
    {
        brand: 'glass', mode: 'dark', theme: glassDarkTheme,
        expected: { success: '#6ee7b7', danger: '#fca5a5', warning: '#fcd34d', info: '#7dd3fc' }
    },
    {
        brand: 'editorial', mode: 'dark', theme: editorialDarkTheme,
        expected: { success: '#4ade80', danger: '#f87171', warning: '#fbbf24', info: '#60a5fa' }
    },
    {
        brand: 'ecom', mode: 'dark', theme: ecomDarkTheme,
        expected: { success: '#86efac', danger: '#fca5a5', warning: '#fcd34d', info: '#38bdf8' }
    }
]

describe('#267 — couleurs feedback des objets de thème de marque', () => {
    for (const { brand, mode, theme, expected } of CASES) {
        it(`${brand} ${mode} porte les bonnes couleurs feedback`, () => {
            const feedback = theme.vars?.color?.feedback

            expect(feedback, `${brand} ${mode} : vars.color.feedback absent`).toBeTruthy()

            for (const [intent, want] of Object.entries(expected)) {
                const actual = feedback?.[intent as TFeedbackIntent]?.bg

                expect(
                    actual,
                    `${brand} ${mode} : vars.color.feedback.${intent}.bg absent`
                ).toBeTruthy()

                expect(
                    String(actual).toLowerCase(),
                    `${brand} ${mode} : feedback.${intent}.bg`
                ).toBe(want.toLowerCase())
            }
        })
    }
})
