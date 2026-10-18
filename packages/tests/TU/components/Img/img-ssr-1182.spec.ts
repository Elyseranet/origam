// @vitest-environment node
/**
 * #1182 — `OrigamImg` / `OrigamResponsive` server HTML.
 *
 * Before: the root was a hard-coded `<div>` (invalid inside a `<p>`, so the
 * HTML parser closed the paragraph and Vue logged a hydration mismatch) and
 * the inner `<img>` carried `v-show="isLoaded"`, i.e. `style="display:none"`
 * in the served HTML (no image without JS, nothing for the preload scanner).
 *
 * Runs under the real `node` environment, exactly what a server sees.
 * Text assertions on the served HTML are the right tool here: it is the
 * artefact under test, not a source file.
 */
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import { describe, expect, it } from 'vitest'

import { OrigamImg, OrigamResponsive } from '@origam/components'
import { createOrigam } from '@origam/origam'
import { origamTheme } from '@origam/themes'

async function render (root: () => ReturnType<typeof h>) {
    const app = createSSRApp({ render: root })

    app.use(createOrigam({ themes: origamTheme, ssr: true }))

    return renderToString(app)
}

describe('OrigamImg server HTML (#1182)', () => {
    it('is a real server environment', () => {
        expect(typeof document).toBe('undefined')
    })

    it('emits a visible <img> with src, srcset, sizes and alt', async () => {
        const html = await render(() => h(OrigamImg, {
            src: '/a.png', srcset: '/a.png 1x, /b.png 2x', sizes: '100vw', alt: 'A'
        }))
        const img = /<img\b[^>]*>/.exec(html)?.[0] ?? ''

        expect(img, html).toContain('src="/a.png"')
        expect(img).toContain('srcset="/a.png 1x, /b.png 2x"')
        expect(img).toContain('sizes="100vw"')
        expect(img).toContain('alt="A"')
        expect(img).not.toMatch(/display:\s*none/)
        expect(html).not.toMatch(/display:\s*none/)
    })

    it('defaults to a <div> root', async () => {
        const html = await render(() => h(OrigamImg, { src: '/a.png', alt: 'A' }))

        expect(html.startsWith('<div')).toBe(true)
    })

    it('with tag="span" no <div> is rendered anywhere (phrasing content)', async () => {
        const html = await render(() => h('p', [h(OrigamImg, {
            tag: 'span', src: '/a.png', alt: 'A', gradient: 'to top, red, blue', lazySrc: '/lazy.png'
        }, { default: () => 'caption' })]))

        expect(html).toMatch(/^<p><span\b/)
        expect(html).not.toContain('<div')
        expect(html).not.toContain('</div>')
    })
})

describe('OrigamResponsive tag (#1182)', () => {
    it('renders root and content wrapper with the requested tag', async () => {
        const html = await render(() => h('p', [h(OrigamResponsive, { tag: 'span' }, {
            additional: () => 'x', default: () => 'content'
        })]))

        expect(html).not.toContain('<div')
        expect(html.match(/<span\b/g)?.length).toBe(2)
    })

    it('defaults to div', async () => {
        const html = await render(() => h(OrigamResponsive, null, { default: () => 'c' }))

        expect(html.match(/<div\b/g)?.length).toBe(2)
    })
})
