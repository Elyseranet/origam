// Fixtures for findVarReads — nested fallbacks (#507).
//
// A fallback `var()` is a REAL read: when the outer property is unset the
// browser evaluates the fallback and reads it. `var(--x, var(--y, 1rem))`
// is two reads.
//
// Before the fix the scanner resumed AFTER the whole call, so every nested
// var was invisible. Measured impact: 145 of 1584 entries in the `dormant`
// baseline were declared "emitted but never read" while being read. The
// generic-first pattern documented in typography.composable.ts produces
// exactly this shape, so the blind spot grew with every adoption.
//
// ⛔ The fix must NOT undo the reason the scanner became paren-aware:
// `var(--x, color-mix(in srgb, var(--y), black 20%))` is ONE outer read plus
// ONE inner read — never three flat ones, and the commas belonging to
// `color-mix` must stay invisible to the name/fallback split. Recall and
// precision are therefore pinned separately below.

import { describe, expect, it } from 'vitest'

import { findVarReads } from '../../../ds/scripts/guards/lib/css-var-scan.mjs'

const names = (css: string) => findVarReads(css).map((r: { name: string }) => r.name)

describe('findVarReads — RECALL: nested fallbacks are real reads', () => {
    it('sees the var nested one level deep in a fallback', () => {
        expect(names('font-size: var(--origam-chip---font-size, var(--origam-chip---font-size-md, 1rem));'))
            .toEqual(['--origam-chip---font-size', '--origam-chip---font-size-md'])
    })

    it('sees all three levels of a doubly-nested fallback', () => {
        expect(names('x: var(--origam-a---1, var(--origam-b---2, var(--origam-c---3, 0)));'))
            .toEqual(['--origam-a---1', '--origam-b---2', '--origam-c---3'])
    })

    it('sees the generic-first shape used across the DS', () => {
        // The exact pattern typography.composable.ts documents and encourages.
        const css = `
            .a { font-size: var(--origam-chip---font-size, var(--origam-chip---font-size-xs, 0.625rem)); }
            .b { font-size: var(--origam-chip---font-size, var(--origam-chip---font-size-sm, 0.75rem)); }
        `

        expect(names(css)).toEqual([
            '--origam-chip---font-size', '--origam-chip---font-size-xs',
            '--origam-chip---font-size', '--origam-chip---font-size-sm'
        ])
    })

    it('marks the OUTER read as carrying a fallback, the inner-most as not', () => {
        const reads = findVarReads('x: var(--origam-a---1, var(--origam-b---2));')

        expect(reads.map((r: { hasFallback: boolean }) => r.hasFallback)).toEqual([true, false])
    })
})

describe('findVarReads — PRECISION: no over-counting', () => {
    /*********************************************************
     * The case the paren-awareness exists for.
     *
     * @description
     * `color-mix` is not a var call, and its inner commas belong to it, not
     * to the outer `var()`. Counting them would split the name from its
     * fallback in the wrong place. One outer read, plus the genuine nested
     * one — never three.
     ********************************************************/
    it('counts a color-mix fallback as outer + inner, never three', () => {
        expect(names('bg: var(--origam-a---bg, color-mix(in srgb, var(--origam-b---base), black 20%));'))
            .toEqual(['--origam-a---bg', '--origam-b---base'])
    })

    it('keeps the name/fallback split correct despite nested commas', () => {
        const reads = findVarReads('bg: var(--origam-a---bg, color-mix(in srgb, var(--origam-b---base), black 20%));')

        expect(reads[0].name).toBe('--origam-a---bg')
        expect(reads[0].hasFallback).toBe(true)
    })

    it('ignores non-origam custom properties at any depth', () => {
        expect(names('x: var(--not-ours, var(--origam-a---1, var(--also-not-ours, 0)));'))
            .toEqual(['--origam-a---1'])
    })

    it('does not double-count a flat read', () => {
        expect(names('color: var(--origam-a---x);')).toEqual(['--origam-a---x'])
        expect(names('color: var(--origam-a---x, 10px);')).toEqual(['--origam-a---x'])
    })

    it('handles several independent calls on one line', () => {
        expect(names('a: var(--origam-x---1); b: var(--origam-y---2);'))
            .toEqual(['--origam-x---1', '--origam-y---2'])
    })
})
