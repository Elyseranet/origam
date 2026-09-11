/*
 * Every value-enumerating type in the DS derives from an enum rather than
 * restating the list. Two derivation shapes are in use:
 *
 *   1. `type TX = \`${SOME_ENUM}\`` — the plain case. A drift is impossible
 *      by construction, so nothing here needs to guard it.
 *   2. `type TX = Exclude<TY, 'a'>` / `Extract<TY, 'a' | 'b'>` — used when a
 *      component surfaces a SUBSET of a shared vocabulary (TEmptyStateAlign,
 *      TGridPlaceItems, TGridPlaceContent, TInlineEditInputType, …).
 *
 * Shape 2 is the one that can rot silently: `Extract<T, 'typo'>` yields
 * `never` and `Exclude<T, 'typo'>` yields T unchanged — TypeScript reports
 * NEITHER as an error. A rename in the source enum therefore shrinks or
 * widens the derived type with no diagnostic anywhere.
 *
 * This file pins those narrowings, plus the two enums that were unified
 * (CODE_THEME -> COLOR_MODE) so a future "cleanup" that re-splits them fails
 * loudly.
 *
 * WHICH HALF ACTUALLY GATES CI — read before trusting this file
 * -------------------------------------------------------------
 * The `assertType<Equals<…>>()` calls are compile-time only, and CI's
 * type-check job runs `pnpm -F origam type-check` — whose tsconfig covers
 * `packages/ds/src` ONLY. Nothing in CI type-checks `packages/tests`, so the
 * type-level half of this file is verified by your IDE and by a manual:
 *
 *     npx tsc --noEmit -p TU/tsconfig.json --ignoreDeprecations 6.0
 *
 * (the `--ignoreDeprecations` flag is not optional — without it tsc aborts on
 * the inherited `baseUrl` deprecation BEFORE type-checking anything, and
 * reports success having checked nothing.)
 *
 * The `expect` calls DO run in CI, and they are deliberately aimed at the
 * inputs of each narrowing rather than its output: if `ALIGN` loses
 * `baseline`, or `JUSTIFY` gains `stretch`, the runtime assertion fails and
 * points at the narrowing that silently changed shape. That is the drift
 * scenario worth catching, and it is covered without a type-checker.
 */

import { describe, expect, it } from 'vitest'

import {
    ALIGN,
    BG_FG_ROLE,
    BORDER_LOGICAL_AXIS,
    CODE_THEME,
    COLOR_MODE,
    FONT_FAMILY,
    FONT_SIZE,
    JUSTIFY,
    LETTER_SPACING,
    LINE_HEIGHT,
    LOADER_KIND,
    TEXT_ALIGN
} from '@origam/enums'

import type {
    TChartLegendPosition,
    TEmptyStateAlign,
    TGridPlaceContent,
    TGridPlaceItems,
    TGridPlaceSelf,
    TInlineEditInputType,
    TMode
} from '@origam/types'

/** Compile-time mutual assignability — fails to compile if A !== B. */
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false

function assertType<T extends true> (_v?: T): void { /* compile-time only */ }

describe('types derived from enums — narrowed (Extract / Exclude) surfaces', () => {
    it('TEmptyStateAlign is TTextAlign minus `right`', () => {
        assertType<Equals<TEmptyStateAlign, 'center' | 'left'>>()

        expect(Object.values(TEXT_ALIGN)).toEqual(['left', 'center', 'right'])
    })

    it('TGridPlaceItems (and its TGridPlaceSelf alias) is TAlign minus `baseline`', () => {
        assertType<Equals<TGridPlaceItems, 'start' | 'end' | 'center' | 'stretch'>>()
        assertType<Equals<TGridPlaceSelf, TGridPlaceItems>>()

        expect(Object.values(ALIGN)).toContain('baseline')
    })

    it('TGridPlaceContent is the full TJustify vocabulary plus `stretch`', () => {
        assertType<Equals<
            TGridPlaceContent,
            'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch'
        >>()

        expect(Object.values(JUSTIFY)).toHaveLength(6)
        expect(Object.values(JUSTIFY)).not.toContain('stretch')
    })

    it('TInlineEditInputType is the 4-value subset of TTextFieldType', () => {
        assertType<Equals<TInlineEditInputType, 'text' | 'number' | 'email' | 'tel'>>()
    })

    it('TChartLegendPosition is the physical-side vocabulary (BLOCK + INLINE)', () => {
        assertType<Equals<TChartLegendPosition, 'top' | 'bottom' | 'left' | 'right'>>()
    })
})

describe('types derived from enums — unified vocabularies', () => {
    it('CODE_THEME is COLOR_MODE, not a second auto/light/dark list', () => {
        expect(CODE_THEME).toBe(COLOR_MODE)
        expect(Object.values(COLOR_MODE)).toEqual(['auto', 'light', 'dark'])

        assertType<Equals<TMode, 'auto' | 'light' | 'dark'>>()
    })

    it('BORDER_LOGICAL_AXIS names the axes, not the physical sides', () => {
        expect(Object.values(BORDER_LOGICAL_AXIS)).toEqual(['block', 'inline'])
    })
})

describe('types derived from enums — new value sets', () => {
    it('exposes the typography scales as enums', () => {
        expect(Object.values(FONT_FAMILY)).toEqual(['sans', 'mono', 'serif'])
        expect(Object.values(FONT_SIZE)).toEqual(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'])
        expect(Object.values(LETTER_SPACING)).toEqual(['tight', 'normal', 'wide', 'wider', 'widest'])
        expect(Object.values(LINE_HEIGHT)).toEqual(['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'])
    })

    it('keeps LOADER_KIND distinct from PROGRESS_TYPE (`line`, not `linear`)', () => {
        expect(Object.values(LOADER_KIND)).toEqual(['line', 'circular', 'skeleton'])
    })

    it('exposes the state-aware colour roles as an enum', () => {
        expect(Object.values(BG_FG_ROLE)).toEqual(['default', 'hover', 'active', 'disabled'])
    })
})
