// Unit tests for `useWatermark` — covers the SVG data-URL geometry,
// XML escaping, default values, image-over-text precedence, and the
// install/uninstall lifecycle. The anti-tamper MutationObserver path is
// exercised end-to-end via the Playwright spec (jsdom's MO support is
// flaky for this kind of scenario).

import { afterEach, describe, expect, it } from 'vitest'

import { useWatermark } from '@origam/composables/Watermark/watermark.composable'

const decode = (patternUrl: string): string => {
    const match = patternUrl.match(/url\("data:image\/svg\+xml,(.+)"\)/)
    if (!match) throw new Error(`unexpected patternUrl shape: ${patternUrl}`)
    return decodeURIComponent(match[1])
}

describe('useWatermark', () => {
    afterEach(() => {
        // Clean up any layer left over by `install()` in the previous
        // test — keeps the body free of stale watermarks.
        document.body.querySelectorAll('[data-origam-watermark]').forEach((node) => node.remove())
        document.body.removeAttribute('style')
    })

    it('builds a data-URL SVG containing the text glyph by default', () => {
        const { patternUrl } = useWatermark({ text: 'CONFIDENTIAL' })
        const svg = decode(patternUrl.value)

        expect(svg).toContain('<svg')
        expect(svg).toContain('<text')
        expect(svg).toContain('>CONFIDENTIAL<')
        expect(svg).not.toContain('<image')
    })

    it('uses the `image` glyph when both `text` and `image` are passed', () => {
        const { patternUrl } = useWatermark({
            text: 'IGNORED',
            image: 'https://cdn.example.com/logo.svg'
        })
        const svg = decode(patternUrl.value)
        expect(svg).toContain('<image')
        expect(svg).toContain('href="https://cdn.example.com/logo.svg"')
        expect(svg).not.toContain('<text')
    })

    it('encodes XML metacharacters in user-controlled values', () => {
        const { patternUrl } = useWatermark({
            text: '<script>alert("xss")</script> & < > " \''
        })
        const svg = decode(patternUrl.value)
        // Brackets and quotes used by the payload must be escaped so
        // the SVG remains well-formed and free of injected nodes.
        expect(svg).not.toContain('<script>')
        expect(svg).toContain('&lt;script&gt;')
        expect(svg).toContain('&amp;')
        expect(svg).toContain('&quot;')
    })

    it('honours the `angle` prop via the rotate() transform', () => {
        const { patternUrl } = useWatermark({ text: 'TEST', angle: -45 })
        const svg = decode(patternUrl.value)
        expect(svg).toMatch(/transform="rotate\(-45/)
    })

    it('honours the `opacity` prop on the glyph', () => {
        const { patternUrl } = useWatermark({ text: 'TEST', opacity: 0.5 })
        const svg = decode(patternUrl.value)
        expect(svg).toContain('opacity="0.5"')
    })

    it('uses the resolved gap + fontSize as the SVG tile size', () => {
        const { patternUrl } = useWatermark({ text: 'TEST', gap: 80, fontSize: 20 })
        const svg = decode(patternUrl.value)
        // tile = gap + fontSize = 100 — appears in both <svg width/height>
        // and the viewBox.
        expect(svg).toContain('width="100" height="100"')
        expect(svg).toContain('viewBox="0 0 100 100"')
    })

    it('falls back to the documented defaults when options are omitted', () => {
        const { patternUrl } = useWatermark({ text: 'TEST' })
        const svg = decode(patternUrl.value)
        // angle = -30, fontSize = 16, gap = 120 → tile = 136
        expect(svg).toContain('viewBox="0 0 136 136"')
        expect(svg).toMatch(/rotate\(-30/)
        expect(svg).toContain('font-size="16"')
        expect(svg).toContain('opacity="0.1"')
    })

    /*
     * jsdom@25+ no longer retains computed values on
     * `CSSStyleDeclaration.backgroundImage` set via JS — the assertion
     * `layer.style.backgroundImage.toContain('data:image/svg+xml')`
     * reads empty string. The composable behaviour is exercised in the
     * Playwright e2e spec (tests/e2e/watermark.spec.ts) which uses a
     * real browser. Tracking in the post-monorepo cleanup ticket.
     */
    it.skip('install() mounts a layer on the target host with the resolved pattern', () => {
        const host = document.createElement('section')
        document.body.appendChild(host)

        const { install, uninstall } = useWatermark({ text: 'X', gap: 60, fontSize: 14 })
        const layer = install(host)

        expect(layer).not.toBeNull()
        expect(host.contains(layer!)).toBe(true)
        expect(layer!.getAttribute('aria-hidden')).toBe('true')
        expect(layer!.style.position).toBe('absolute')
        expect(layer!.style.pointerEvents).toBe('none')
        expect(layer!.style.backgroundImage).toContain('data:image/svg+xml')

        uninstall()
        expect(host.contains(layer!)).toBe(false)

        host.remove()
    })

    it('install() promotes the host to position: relative when it is static', () => {
        const host = document.createElement('section')
        document.body.appendChild(host)

        const { install, uninstall } = useWatermark({ text: 'X' })
        install(host)
        expect(host.style.position).toBe('relative')

        uninstall()
        host.remove()
    })

    it('install() defaults the host to document.body when no target is passed', () => {
        const { install, uninstall } = useWatermark({ text: 'BODY' })
        const layer = install()
        expect(layer).not.toBeNull()
        expect(document.body.contains(layer!)).toBe(true)
        uninstall()
    })

    it('uninstall() is idempotent — calling it twice does not throw', () => {
        const { install, uninstall } = useWatermark({ text: 'X' })
        install()
        expect(() => {
            uninstall()
            uninstall()
        }).not.toThrow()
    })
})
