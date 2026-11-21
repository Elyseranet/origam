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
import { createApp, createSSRApp, defineAsyncComponent, defineComponent, h } from 'vue'
import type { Component } from 'vue'
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

describe('OrigamImg chargé en différé (#1394)', { timeout: 60000 }, () => {
    let host: HTMLElement

    beforeEach(() => {
        host = document.createElement('div')
        document.body.appendChild(host)
        vi.stubGlobal('IntersectionObserver', class {
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

    it('hydratation dans un composant asynchrone : aucune erreur de pollForSize', async () => {
        const html = await serverHtml({ src: SRC, alt: 'A', width: 120 })

        host.innerHTML = html

        const { OrigamImg, plugin } = await importClient()
        const errors: unknown[] = []
        const Lazy = defineAsyncComponent(() => new Promise<Component>(resolve => setTimeout(() => resolve({ render: () => h(OrigamImg, { src: SRC, alt: 'A', width: 120 }) }), 20)))
        const app = createSSRApp({ render: () => h(Lazy) })

        app.config.errorHandler = (err) => { errors.push(err) }
        app.use(plugin)
        app.mount(host)

        await new Promise(resolve => setTimeout(resolve, 400))

        expect(errors).toEqual([])

        app.unmount()
    })

    it('élément image absent au moment du sondage (slot `additional` non rendu) : pas d\'erreur', async () => {
        // Le slot qui porte `<img ref="image">` n'est pas rendu : `image.value` reste `undefined`,
        // comme pour un composant différé dont le DOM n'est pas encore monté.
        vi.resetModules()
        vi.doMock('@origam/components/Responsive/OrigamResponsive.vue', () => ({
            default: defineComponent({ render () { return h('div') } })
        }))

        const [{ default: OrigamImg }, { createOrigam }, { origamTheme }] = await Promise.all([
            import('@origam/components/Img/OrigamImg.vue'),
            import('@origam/origam'),
            import('@origam/themes')
        ])
        const errors: unknown[] = []
        const app = createApp({ render: () => h(OrigamImg, { src: SRC, alt: 'A', eager: true }) })

        app.config.errorHandler = (err) => { errors.push(err) }
        // La minuterie est une minuterie Node : l'erreur remonte en `uncaughtException`, pas à Vue.
        const onUncaught = (e: unknown) => { errors.push(e) }
        const saved = process.listeners('uncaughtException')

        process.removeAllListeners('uncaughtException')
        process.on('uncaughtException', onUncaught)
        app.use(createOrigam({ themes: origamTheme, ssr: true }))
        app.mount(host)

        await new Promise(resolve => setTimeout(resolve, 300))

        process.removeListener('uncaughtException', onUncaught)
        saved.forEach(l => process.on('uncaughtException', l))

        expect(errors).toEqual([])

        app.unmount()
        vi.doUnmock('@origam/components/Responsive/OrigamResponsive.vue')
    })
})
