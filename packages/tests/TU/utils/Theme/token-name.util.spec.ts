// Tests for the shared token-path → CSS-variable naming util.
//
// Two responsibilities:
//   1. Assert the naming grammar produces the documented `--origam-*` names.
//   2. PARITY GUARD — the TS runtime util (`token-name.util.ts`) and the
//      build-time core (`scripts/token-name.mjs`) implement the same
//      algorithm by hand (the build script is plain Node `.mjs` and cannot
//      import from the published `src/**.ts`). This test imports BOTH and
//      asserts they agree across a representative path matrix, so the names
//      baked into the published CSS sheets never drift from the names a
//      runtime-injected or exported theme emits.

import { describe, expect, it } from 'vitest'

import { tokenPathToCssVar, tokenPathToCssVarName } from '@origam/utils/Theme/token-name.util'

// Build-time core lives outside src/ — import via relative path.
import {
    tokenPathToCssVarName as coreName,
    tokenPathToCssVar as coreVar
} from '../../../../ds/scripts/token-name.mjs'

describe('tokenPathToCssVarName — primitive / semantic grammar', () => {
    it('2-segment primitive → block---prop', () => {
        expect(tokenPathToCssVarName(['color', 'black'], false)).toBe('origam-color---black')
        expect(tokenPathToCssVarName(['space', '4'], false)).toBe('origam-space---4')
        expect(tokenPathToCssVarName(['radius', 'md'], false)).toBe('origam-radius---md')
    })

    it('3-segment → block__child---prop', () => {
        expect(tokenPathToCssVarName(['color', 'neutral', '500'], false)).toBe('origam-color__neutral---500')
        expect(tokenPathToCssVarName(['color', 'surface', 'default'], false)).toBe('origam-color__surface---default')
        expect(tokenPathToCssVarName(['font', 'size', 'sm'], false)).toBe('origam-font__size---sm')
    })

    it('4-segment semantic with modifier → block__child--mod---prop', () => {
        expect(tokenPathToCssVarName(['color', 'action', 'primary', 'bg'], false)).toBe('origam-color__action--primary---bg')
        expect(tokenPathToCssVarName(['color', 'feedback', 'warning', 'fgSubtle'], false)).toBe('origam-color__feedback--warning---fgSubtle')
    })
})

describe('tokenPathToCssVarName — component grammar', () => {
    it('bare component name', () => {
        expect(tokenPathToCssVarName(['btn'], true)).toBe('origam-btn')
    })

    it('component property', () => {
        expect(tokenPathToCssVarName(['btn', 'background-color'], true)).toBe('origam-btn---background-color')
    })

    it('component intent state', () => {
        expect(tokenPathToCssVarName(['btn', 'primary', 'background-color'], true)).toBe('origam-btn--primary---background-color')
    })

    it('component BEM child', () => {
        expect(tokenPathToCssVarName(['card', 'overlay', 'background-color'], true)).toBe('origam-card__overlay---background-color')
    })

    it('component BEM child with nested state', () => {
        expect(tokenPathToCssVarName(['card', 'overlay', 'hover', 'opacity'], true)).toBe('origam-card__overlay--hover---opacity')
    })
})

describe('tokenPathToCssVar — full custom-property reference', () => {
    it('prefixes with --', () => {
        expect(tokenPathToCssVar(['color', 'neutral', '500'], false)).toBe('--origam-color__neutral---500')
        expect(tokenPathToCssVar(['btn', 'primary', 'background-color'], true)).toBe('--origam-btn--primary---background-color')
    })
})

describe('PARITY — TS util vs build-time .mjs core', () => {
    const matrix: Array<{ path: string[], component: boolean }> = [
        { path: ['color', 'black'], component: false },
        { path: ['color', 'neutral', '500'], component: false },
        { path: ['color', 'surface', 'default'], component: false },
        { path: ['color', 'action', 'primary', 'bg'], component: false },
        { path: ['color', 'feedback', 'warning', 'fgSubtle'], component: false },
        { path: ['space', '4'], component: false },
        { path: ['radius', 'md'], component: false },
        { path: ['shadow', 'sm'], component: false },
        { path: ['border', 'width', 'thin'], component: false },
        { path: ['font', 'size', 'sm'], component: false },
        { path: ['color', 'a', 'b', 'c', 'd'], component: false },
        { path: ['btn'], component: true },
        { path: ['btn', 'background-color'], component: true },
        { path: ['btn', 'primary', 'background-color'], component: true },
        { path: ['btn', 'success', 'fg'], component: true },
        { path: ['card', 'overlay', 'background-color'], component: true },
        { path: ['card', 'overlay', 'hover', 'opacity'], component: true },
        { path: ['alert', 'icon', 'color'], component: true }
    ]

    it.each(matrix)('matches for $path (component=$component)', ({ path, component }) => {
        expect(tokenPathToCssVarName(path, component)).toBe(coreName(path, component))
        expect(tokenPathToCssVar(path, component)).toBe(coreVar(path, component))
    })
})
