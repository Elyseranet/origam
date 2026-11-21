// @vitest-environment node
/*********************************************************
 * #1386 — jetons par mode + helper SSR + budget CSS
 *
 * Budget : une page qui n'utilise qu'un thème et un mode ne charge que ses
 * jetons. Mesure en gzip -9 sur les feuilles réelles de `src/assets/css/tokens`.
 * Référence avant #1386 (feuilles primitive + light + dark, toujours toutes) :
 * 651 Kio bruts / 84 Kio gzip. Ne pas relever ces plafonds sans décision du
 * propriétaire.
 ********************************************************/
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'

// @ts-expect-error script .mjs sans déclaration de types
import { splitDarkSheet } from '../../../ds/scripts/lib/split-dark-sheet.mjs'
import { renderThemeCss } from '../../../ds/src/ssr'
import type { IOrigamTheme } from '../../../ds/src/interfaces'

const TOKENS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../ds/src/assets/css/tokens')
const read = (name: string) => readFileSync(resolve(TOKENS, `${name}.css`), 'utf8')
const gz = (css: string) => gzipSync(css, {level: 9}).length
const KIB = 1024

const primitive = read('primitive')
const light = read('light')
const dark = read('dark')
const { pinned, system } = splitDarkSheet(dark) as { pinned: string, system: string }

describe('feuilles de jetons par mode (#1386)', () => {
    it('dark-pinned + dark-system recomposent dark.css sans perte', () => {
        expect(pinned + system).toBe(dark)
    })

    it('dark-pinned ne porte que le bloc [data-mode], dark-system que le bloc @media', () => {
        expect(pinned).toContain('[data-mode="dark"]:not([data-theme="light"]) {')
        expect(pinned).not.toMatch(/^@media/m)
        expect(system.startsWith('@media (prefers-color-scheme: dark) {')).toBe(true)
        expect(system).not.toContain('[data-mode="dark"]:not([data-theme="light"]) {')
    })

    it('budget : mode clair épinglé <= 32 Kio gzip (84 Kio avant)', () => {
        const total = gz(primitive + light)
        expect(total, `gz = ${(total / KIB).toFixed(1)} Kio`).toBeLessThanOrEqual(32 * KIB)
    })

    it('budget : mode sombre épinglé <= 62 Kio gzip, et sous la référence de 25 %', () => {
        const total = gz(primitive + light + pinned)
        const before = gz(primitive + light + dark)
        expect(total, `gz = ${(total / KIB).toFixed(1)} Kio`).toBeLessThanOrEqual(62 * KIB)
        expect(total).toBeLessThan(before * 0.75)
    })
})

describe('renderThemeCss (#1386)', () => {
    const themes: IOrigamTheme[] = [
        {name: 'elysera', mode: 'light', colors: {primary: '#111111'}},
        {name: 'elysera', mode: 'dark', colors: {primary: '#222222'}},
        {name: 'cartoon', mode: 'light', colors: {primary: '#333333'}},
        {name: 'cartoon', mode: 'dark', colors: {primary: '#444444'}}
    ]

    it('mode épinglé : le seul bloc de la marque et du mode actifs', () => {
        const css = renderThemeCss(themes, {theme: 'elysera', mode: 'dark'})
        expect(css).toContain('[data-theme="elysera"][data-mode="dark"]')
        expect(css).not.toContain('cartoon')
        expect(css).not.toContain('[data-mode="light"]')
    })

    it('mode non épinglé : les deux modes de la marque, derrière @media, sans autre marque', () => {
        const css = renderThemeCss(themes, {theme: 'elysera'})
        expect(css).toContain('@media not (prefers-color-scheme: dark)')
        expect(css).toContain('@media (prefers-color-scheme: dark)')
        expect(css).not.toContain('cartoon')
    })

    it('marque absente : seulement les thèmes sans nom', () => {
        expect(renderThemeCss(themes, {theme: 'auto', mode: 'light'})).toBe('')
    })
})
