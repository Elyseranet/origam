// Unit tests for `useQrCode` — covers the matrix shape, the SVG
// fragment structure, the option pass-through (fg / bg / margin /
// corner radius / logo), reactive recomputation and the overlay
// warning.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ref } from 'vue'

import {
    __clearQrCodeCache,
    useQrCode
} from '@origam/composables/QrCode/qr-code.composable'

describe('useQrCode', () => {
    beforeEach(() => {
        __clearQrCodeCache()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('produces a square boolean matrix', () => {
        const { modules, size } = useQrCode('hello')
        const count = size.value
        expect(count).toBeGreaterThan(0)
        expect(modules.value).toHaveLength(count)
        for (const row of modules.value) {
            expect(row).toHaveLength(count)
            for (const cell of row) {
                expect(typeof cell).toBe('boolean')
            }
        }
    })

    it('emits an SVG element with the right viewBox', () => {
        const { svg, size } = useQrCode('hello', { margin: 4 })
        const expectedSize = size.value + 8
        expect(svg.value).toContain('<svg')
        expect(svg.value).toContain(`viewBox="0 0 ${expectedSize} ${expectedSize}"`)
    })

    it('contains at least one dark <rect> for non-empty payloads', () => {
        const { svg } = useQrCode('hello')
        const rectMatches = svg.value.match(/<rect/g)
        expect(rectMatches).not.toBeNull()
        // 1 background rect (when bg !== transparent) plus N dark modules;
        // with `transparent` default we still need ≥1 dark rect.
        expect(rectMatches!.length).toBeGreaterThan(1)
    })

    it('applies the `foreground` option to dark modules', () => {
        const { svg } = useQrCode('hello', { foreground: '#ff0000' })
        expect(svg.value).toContain('fill="#ff0000"')
    })

    it('paints a background rect when `background` is set (non-transparent)', () => {
        const { svg } = useQrCode('hello', { background: '#ffffff' })
        // viewBox: 0 0 N N — the only rect with x=0 / y=0 is the bg.
        expect(svg.value).toMatch(/<rect x="0" y="0" width="\d+" height="\d+" fill="#ffffff"/)
    })

    it('skips the background rect when `background` is "transparent"', () => {
        const { svg } = useQrCode('hello', { background: 'transparent' })
        expect(svg.value).not.toMatch(/<rect x="0" y="0".*fill="transparent"/)
    })

    it('honours `cornerRadius` and emits rx / ry attributes', () => {
        const { svg } = useQrCode('hello', { cornerRadius: 0.5 })
        expect(svg.value).toContain('rx="0.5"')
        expect(svg.value).toContain('ry="0.5"')
    })

    it('omits rx / ry attributes when `cornerRadius` is 0', () => {
        const { svg } = useQrCode('hello', { cornerRadius: 0 })
        expect(svg.value).not.toContain('rx="0"')
    })

    it('changing `errorCorrectionLevel` changes the matrix dimensions', () => {
        const { size: sizeL } = useQrCode('hello', { errorCorrectionLevel: 'L' })
        const { size: sizeH } = useQrCode('hello', { errorCorrectionLevel: 'H' })
        // For the same payload, "H" needs more redundancy → larger or equal matrix.
        expect(sizeH.value).toBeGreaterThanOrEqual(sizeL.value)
    })

    it('reactively recomputes when the `value` ref changes', () => {
        const value = ref('hello')
        const { svg } = useQrCode(value)
        const before = svg.value
        value.value = 'world'
        const after = svg.value
        expect(before).not.toBe(after)
    })

    it('renders an <image> element when a logo is configured', () => {
        const { svg } = useQrCode('hello', {
            logo: { src: '/logo.svg', size: 0.2 }
        })
        expect(svg.value).toContain('<image')
        expect(svg.value).toContain('href="/logo.svg"')
    })

    it('warns when the logo size exceeds 0.3', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        const { svg } = useQrCode('hello', {
            logo: { src: '/logo.svg', size: 0.5 }
        })
        // Touch the computed to trigger the warn.
        expect(typeof svg.value).toBe('string')
        expect(warn).toHaveBeenCalled()
        expect(warn.mock.calls[0][0]).toContain('exceeds the recommended max')
    })

    it('does not warn when the logo size stays within the recommended cap', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        const { svg } = useQrCode('hello', {
            logo: { src: '/logo.svg', size: 0.2 }
        })
        expect(typeof svg.value).toBe('string')
        expect(warn).not.toHaveBeenCalled()
    })

    it('escapes XML metacharacters in user-supplied values', () => {
        const { svg } = useQrCode('hello', {
            foreground: 'rgb(0, 0, 0)',
            background: '#fff',
            logo: { src: 'a"b<c>d&e\'f.svg' }
        })
        // The dangerous metacharacters from the URL must be encoded.
        // We assert presence of the encoded forms — and absence of the
        // raw form INSIDE the href attribute by checking the encoded
        // payload appears in the SVG output.
        expect(svg.value).toContain('href="a&quot;b&lt;c&gt;d&amp;e&apos;f.svg"')
        // And the SVG must still be a well-formed root element.
        expect(svg.value.startsWith('<svg')).toBe(true)
        expect(svg.value.endsWith('</svg>')).toBe(true)
    })

    it('produces identical matrix for the same payload (cache hit)', () => {
        const { modules: first } = useQrCode('cached-value')
        const { modules: second } = useQrCode('cached-value')
        // Same payload + default ECC → reference-equal cached matrix.
        expect(first.value).toBe(second.value)
    })
})
