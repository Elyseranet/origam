/**
 * #1192 — two defects of `OrigamImg` found under Nuxt (SSR + hydration).
 *
 *   1. Hydration style mismatch: the server emitted `style="width:120px;"`,
 *      the client's first render `style="aspect-ratio:1.77…;width:120px;"`
 *      (the viewport-ratio fallback of `useAspectRatio`, unknowable on the
 *      server). The fallback must wait for `onMounted` when hydrating.
 *   2. A client-mounted image never loaded: `v-intersect` was bound with the
 *      `withDirectives` tuple instead of `{ handler, options }` + `.once`, so
 *      `init` was never called by an intersection, and the `display:none`
 *      `<img>` stayed `loading="lazy"` (Chromium never loads a lazy image
 *      without a box). The real-browser verdict is in the PR (Nuxt probe);
 *      this spec pins the logic under jsdom with a controllable
 *      IntersectionObserver.
 *
 * Only literal inline styles / attributes are asserted (jsdom does not
 * resolve `var()`).
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

async function serverHtml (props: Record<string, unknown>) {
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
    const app = createSSRApp({ render: () => h(OrigamImg, props) })

    app.use(createOrigam({ themes: origamTheme, ssr: true }))

    const html = await renderToString(app)

    vi.doUnmock('@origam/consts/Commons/commons.const')

    return html
}

describe('OrigamImg SSR hydration (#1192)', { timeout: 60000 }, () => {
    let host: HTMLElement
    let fire: (isIntersecting: boolean) => void

    beforeEach(() => {
        host = document.createElement('div')
        document.body.appendChild(host)

        const callbacks: IntersectionObserverCallback[] = []

        fire = (isIntersecting) => callbacks.forEach((cb) => cb(
            [{ isIntersecting } as IntersectionObserverEntry],
            {} as IntersectionObserver
        ))

        vi.stubGlobal('IntersectionObserver', class {
            constructor (cb: IntersectionObserverCallback) { callbacks.push(cb) }
            observe () { /* no-op */ }
            unobserve () { /* no-op */ }
            disconnect () { /* no-op */ }
        })
    })

    afterEach(() => {
        host.remove()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('hydrating: no style mismatch, the viewport ratio only lands after mount', async () => {
        const html = await serverHtml({ src: SRC, alt: 'A', width: 120 })

        expect(html).not.toMatch(/aspect-ratio/)

        host.innerHTML = html

        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const { OrigamImg, plugin } = await importClient()
        const app = createSSRApp({ render: () => h(OrigamImg, { src: SRC, alt: 'A', width: 120 }) })

        app.use(plugin)
        app.mount(host)

        const messages = warn.mock.calls.map((call) => call.map(String).join(' '))

        expect(messages.filter((m) => m.includes('Hydration'))).toEqual([])

        await nextTick()
        await nextTick()

        expect((host.firstElementChild as HTMLElement).style.aspectRatio).not.toBe('')

        app.unmount()
    })

    it('hydrating with an explicit aspect-ratio: server and client agree from the first render', async () => {
        const html = await serverHtml({ src: SRC, alt: 'A', width: 120, aspectRatio: 2 })

        expect(html).toMatch(/aspect-ratio:\s*2/)

        host.innerHTML = html

        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const { OrigamImg, plugin } = await importClient()
        const app = createSSRApp({ render: () => h(OrigamImg, { src: SRC, alt: 'A', width: 120, aspectRatio: 2 }) })

        app.use(plugin)
        app.mount(host)

        expect(warn.mock.calls.map((call) => call.map(String).join(' ')).filter((m) => m.includes('Hydration'))).toEqual([])

        app.unmount()
    })

    it('client-mounted: the intersection starts the load (native loading leaves lazy)', async () => {
        const { OrigamImg, plugin } = await importClient()
        const app = createApp({ render: () => h(OrigamImg, { src: SRC, alt: 'A' }) })

        app.use(plugin)
        app.mount(host)
        await nextTick()

        const img = host.querySelector('img.origam-img__picture') as HTMLImageElement

        expect(img.style.display).toBe('none')
        expect(img.getAttribute('loading')).toBe('lazy')

        fire(true)
        await nextTick()

        expect(img.getAttribute('loading')).toBe('eager')

        app.unmount()
    })
})
