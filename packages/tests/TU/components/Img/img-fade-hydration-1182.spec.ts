/**
 * #1182 (owner decision) — the entrance fade of `OrigamImg` exists for an
 * image MOUNTED on the client, and never for one HYDRATED from server HTML.
 *
 *   hydrated        -> painted at once, no `display:none`, no enter class
 *   client-mounted  -> hidden until the native `load`, then faded in
 *
 * The server HTML is produced by the real component with `IN_BROWSER`
 * forced to false (jsdom otherwise makes the "server" believe it is a
 * browser), then the module graph is reset and the component is imported
 * again for the client pass. `getComputedStyle` is NOT used: inline
 * `style.display` and class names are literal values, which jsdom resolves
 * correctly (see the `var()` caveat in CLAUDE.md).
 */
import { renderToString } from '@vue/server-renderer'
import { createApp, createSSRApp, h, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const SRC = '/a.png'

async function importClient () {
    vi.resetModules()
    vi.doUnmock('@origam/consts/Commons/commons.const')

    const [{ OrigamImg }, { createOrigam }, { origamTheme }] = await Promise.all([
        import('@origam/components'),
        import('@origam/origam'),
        import('@origam/themes')
    ])

    return { OrigamImg, plugin: createOrigam({ themes: origamTheme, ssr: true }) }
}

async function serverHtml () {
    vi.resetModules()
    vi.doMock('@origam/consts/Commons/commons.const', async (importOriginal) => {
        const original = await importOriginal<Record<string, unknown>>()

        return { ...original, IN_BROWSER: false, SUPPORTS_INTERSECTION: false }
    })

    const [{ OrigamImg }, { createOrigam }, { origamTheme }] = await Promise.all([
        import('@origam/components'),
        import('@origam/origam'),
        import('@origam/themes')
    ])
    const app = createSSRApp({ render: () => h(OrigamImg, { src: SRC, alt: 'A' }) })

    app.use(createOrigam({ themes: origamTheme, ssr: true }))

    const html = await renderToString(app)

    vi.doUnmock('@origam/consts/Commons/commons.const')

    return html
}

const picture = (root: Element) => root.querySelector('img.origam-img__picture') as HTMLImageElement
const hasEnterClass = (el: Element) => /enter/.test(el.className)

describe('OrigamImg entrance fade (#1182)', { timeout: 60000 }, () => {
    let host: HTMLElement

    beforeEach(() => {
        host = document.createElement('div')
        document.body.appendChild(host)
    })

    afterEach(() => {
        host.remove()
        vi.restoreAllMocks()
    })

    it('hydrated from server HTML: visible at once, no enter class, no mismatch warning', async () => {
        const html = await serverHtml()

        expect(html).not.toMatch(/display:\s*none/)

        host.innerHTML = html

        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const { OrigamImg, plugin } = await importClient()
        const app = createSSRApp({ render: () => h(OrigamImg, { src: SRC, alt: 'A' }) })

        app.use(plugin)
        app.mount(host)
        await nextTick()

        const img = picture(host)

        expect(img.style.display).not.toBe('none')
        expect(hasEnterClass(img)).toBe(false)
        // jsdom reports an unrelated `aspect-ratio` style mismatch on the root
        // (it fabricates natural sizes); only the <img> concerns this ticket.
        const pictureMismatches = warn.mock.calls
            .map((call) => call.map(String).join(' '))
            .filter((m) => m.includes('Hydration') && /<img|display|enter/.test(m) && !m.includes('aspect-ratio'))

        expect(pictureMismatches).toEqual([])

        img.dispatchEvent(new Event('load'))
        await nextTick()

        expect(img.style.display).not.toBe('none')
        expect(hasEnterClass(img)).toBe(false)

        app.unmount()
    })

    it('mounted on the client: hidden until load, then faded in', async () => {
        const { OrigamImg, plugin } = await importClient()
        const app = createApp({ render: () => h(OrigamImg, { src: SRC, alt: 'A' }) })

        app.use(plugin)
        app.mount(host)
        await nextTick()

        const img = picture(host)

        expect(img.style.display).toBe('none')

        img.dispatchEvent(new Event('load'))
        await nextTick()
        await nextTick()

        expect(img.style.display).not.toBe('none')
        expect(hasEnterClass(img)).toBe(true)

        app.unmount()
    })
})
