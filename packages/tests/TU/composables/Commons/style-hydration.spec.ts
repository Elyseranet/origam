/**
 * #1092 — the server renders one `<style id="origam-style-…">` per `useStyle()`
 * instance; the client must REUSE it at hydration (same id, no stacking) and
 * the element ids the rules target must be the ones the markup still carries.
 *
 * jsdom has a `document`, so `createOrigam()` would not provide the server
 * collector on its own; the spec provides one by hand, which is exactly what
 * `createOrigam()` does when there is no `document`. The server half is
 * covered under a real `node` environment in `style-ssr.spec.ts`.
 */
import { renderToString } from '@vue/server-renderer'
import { createApp, createSSRApp, h } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { OrigamBtn } from '@origam/components'
import { ORIGAM_SSR_STYLES_KEY } from '@origam/consts/Commons/ssr-style.const'
import { createOrigam } from '@origam/origam'
import { origamTheme } from '@origam/themes'
import { createSsrStyleCollector } from '@origam/utils/Commons/ssr-styles.util'

const tree = () => h(OrigamBtn, { bgColor: 'primary', rounded: 'xl' }, () => 'Go')

describe('useStyle — server tag reused at hydration (#1092)', () => {
    afterEach(() => {
        document.head.innerHTML = ''
        document.body.innerHTML = ''
        vi.restoreAllMocks()
    })

    it('keeps the same ids, reuses the server <style>, warns about nothing', async () => {
        // ── server half ────────────────────────────────────────────────
        const collector = createSsrStyleCollector()
        const serverApp = createSSRApp({ render: tree })

        serverApp.use(createOrigam({ themes: origamTheme, ssr: true }))
        serverApp.provide(ORIGAM_SSR_STYLES_KEY, collector)

        const html = await renderToString(serverApp)
        const serverEntries = collector.entries()
        const serverRootId = /<button[^>]*\sid="([^"]+)"/.exec(html)![1]

        expect(serverEntries).toHaveLength(1)

        // What the host does with the rules: put them in <head>.
        document.head.innerHTML = serverEntries.map(({ id, css }) => `<style id="${id}">${css}</style>`).join('')
        const serverTag = document.getElementById(serverEntries[0].id)!

        const container = document.createElement('div')

        container.innerHTML = html
        document.body.appendChild(container)

        // ── client half: hydrate the very same tree ────────────────────
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const clientApp = createSSRApp({ render: tree })

        clientApp.use(createOrigam({ themes: origamTheme, ssr: true }))
        clientApp.mount(container)

        // Same id on the element the rule targets.
        expect(container.querySelector('button')!.id).toBe(serverRootId)

        // Same tag id, and it is THE element the server rendered: not a copy.
        const tags = document.head.querySelectorAll(`style[id="${serverEntries[0].id}"]`)

        expect(tags).toHaveLength(1)
        expect(tags[0]).toBe(serverTag)
        expect(document.head.querySelectorAll('style[id^="origam-style-"]')).toHaveLength(1)

        // …and it still holds the rule for that id.
        expect(tags[0].textContent).toContain(`#${serverRootId}`)

        const hydrationWarnings = warn.mock.calls.filter((call) => String(call[0]).toLowerCase().includes('hydration'))

        expect(hydrationWarnings).toEqual([])

        clientApp.unmount()

        // Unmount removes it, as for any client-created tag.
        expect(document.getElementById(serverEntries[0].id)).toBeNull()
    })

    it('a client-only mount creates exactly one tag, with the same id grammar', async () => {
        const app = createApp({ render: tree })
        const container = document.createElement('div')

        document.body.appendChild(container)
        app.use(createOrigam({ themes: origamTheme, ssr: true }))
        app.mount(container)

        const tags = document.head.querySelectorAll('style[id^="origam-style-"]')

        expect(tags).toHaveLength(1)
        expect(tags[0].id).toMatch(/^origam-style-origam-btn-.+-0$/)

        app.unmount()
    })

    it('two apps in one document keep a tag each: the 2nd never rewrites nor removes the 1st', () => {
        // Ids are unique per APP, not per document, so two apps derive the same
        // tag id. Without the ownership flag the second `load()` adopted the
        // first one's tag and the first unmount left the second without a rule
        // (and `removeChild(null)` threw).
        const mountOne = (color: string) => {
            const app = createApp({ render: () => h(OrigamBtn, { bgColor: color }, () => 'x') })
            const container = document.createElement('div')

            document.body.appendChild(container)
            app.use(createOrigam({ themes: origamTheme }))
            app.mount(container)

            return app
        }

        const a = mountOne('primary')
        const b = mountOne('danger')

        const tags = [...document.head.querySelectorAll('style[id^="origam-style-"]')]

        expect(tags).toHaveLength(2)
        expect(new Set(tags.map((tag) => tag.id)).size).toBe(2)
        expect(tags[0].textContent).not.toBe(tags[1].textContent)

        a.unmount()
        expect(document.head.querySelectorAll('style[id^="origam-style-"]')).toHaveLength(1)

        expect(() => b.unmount()).not.toThrow()
        expect(document.head.querySelectorAll('style[id^="origam-style-"]')).toHaveLength(0)
    })

    it('unmounting after the head was wiped does not throw', () => {
        const app = createApp({ render: tree })
        const container = document.createElement('div')

        document.body.appendChild(container)
        app.use(createOrigam({ themes: origamTheme }))
        app.mount(container)

        document.head.innerHTML = ''

        expect(() => app.unmount()).not.toThrow()
    })
})
