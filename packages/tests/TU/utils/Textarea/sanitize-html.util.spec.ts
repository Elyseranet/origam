import { describe, expect, it } from 'vitest'

import { sanitizeHtml } from '@origam/utils/Textarea/sanitize-html.util'

describe('sanitizeHtml', () => {
    it('returns an empty string for nullish / non-string inputs', () => {
        // @ts-expect-error — runtime robustness probe.
        expect(sanitizeHtml(null)).toBe('')
        // @ts-expect-error — runtime robustness probe.
        expect(sanitizeHtml(undefined)).toBe('')
        expect(sanitizeHtml('')).toBe('')
        // @ts-expect-error — runtime robustness probe.
        expect(sanitizeHtml(42)).toBe('')
    })

    it('strips <script> tags wholesale', () => {
        const out = sanitizeHtml('Hello <script>alert(1)</script> world')
        expect(out).not.toContain('<script')
        expect(out).not.toContain('alert(1)')
    })

    it('strips <iframe>, <object>, <embed>, <form>, <style>', () => {
        for (const tag of ['iframe', 'object', 'embed', 'form', 'style']) {
            const out = sanitizeHtml(`<p>ok</p><${tag}>x</${tag}>`)
            expect(out).not.toContain(`<${tag}`)
        }
    })

    it('removes javascript: hrefs', () => {
         
        const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
        expect(out).not.toMatch(/href=/)
        expect(out).toContain('click')
    })

    it('removes data: hrefs', () => {
        const out = sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">x</a>')
        expect(out).not.toMatch(/href="data:/i)
    })

    it('keeps http / https / mailto / tel hrefs and hardens rel/target', () => {
        const out = sanitizeHtml('<a href="https://example.com">x</a>')
        expect(out).toContain('href="https://example.com"')
        expect(out).toContain('rel="noopener noreferrer nofollow"')
        expect(out).toContain('target="_blank"')
    })

    it('keeps relative hrefs', () => {
        const out = sanitizeHtml('<a href="/docs">docs</a>')
        expect(out).toContain('href="/docs"')
    })

    it('strips on* event handlers from any tag', () => {
        const out = sanitizeHtml('<p onclick="alert(1)" onerror="x">hi</p>')
        expect(out).not.toMatch(/onclick=/i)
        expect(out).not.toMatch(/onerror=/i)
        expect(out).toContain('<p>hi</p>')
    })

    it('strips style attribute', () => {
        const out = sanitizeHtml('<p style="color:red">hi</p>')
        expect(out).not.toMatch(/style=/)
        expect(out).toContain('<p>hi</p>')
    })

    it('unwraps disallowed tags but preserves text content', () => {
        const out = sanitizeHtml('<p><span>kept</span></p>')
        expect(out).toBe('<p>kept</p>')
    })

    it('preserves rich formatting allowlist', () => {
        const out = sanitizeHtml('<p><strong>b</strong><em>i</em><u>u</u><code>c</code></p>')
        expect(out).toBe('<p><strong>b</strong><em>i</em><u>u</u><code>c</code></p>')
    })

    it('preserves list structure', () => {
        const out = sanitizeHtml('<ul><li>one</li><li>two</li></ul>')
        expect(out).toBe('<ul><li>one</li><li>two</li></ul>')
    })

    it('keeps allowed class names (origam-rich--*) and drops others', () => {
        const out = sanitizeHtml('<p class="origam-rich--note danger">hi</p>')
        expect(out).toContain('class="origam-rich--note"')
        expect(out).not.toContain('danger')
    })

    it('drops the class attribute entirely when no whitelisted token remains', () => {
        const out = sanitizeHtml('<p class="danger evil">hi</p>')
        expect(out).toBe('<p>hi</p>')
    })

    it('strips svg / math / link / meta / base wholesale', () => {
        for (const tag of ['svg', 'math', 'link', 'meta', 'base']) {
            const out = sanitizeHtml(`<p>ok</p><${tag}>x</${tag}>`)
            expect(out).not.toContain(`<${tag}`)
        }
    })

    it('handles deeply nested malicious payloads', () => {
        const out = sanitizeHtml('<div><span><script>x</script><a href="javascript:1">y</a></span></div>')
        expect(out).not.toContain('script')
        expect(out).not.toMatch(/href=/)
        expect(out).toContain('y')
    })
})
