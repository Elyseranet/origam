import { describe, expect, it } from 'vitest'
import { knownBrand } from '@origam/utils/Commons/apply-theme.util'

const themes = [{ name: 'glass' }, { name: 'cartoon' }, {}]

describe('knownBrand (#1120)', () => {
    it('accepts an installed name and auto', () => {
        expect(knownBrand('glass', themes)).toBe('glass')
        expect(knownBrand('auto', themes)).toBe('auto')
    })
    it.each(['"><script>alert(1)</script>', '__proto__', 'constructor', 'toString', 'unknown', '', null, undefined])(
        'rejects %s so the caller falls back to the default', (v) => {
            expect(knownBrand(v as string, themes)).toBeNull()
        })
    it('rejects everything when no theme is installed, except auto', () => {
        expect(knownBrand('glass', undefined)).toBeNull()
        expect(knownBrand('auto', [])).toBe('auto')
    })
})
