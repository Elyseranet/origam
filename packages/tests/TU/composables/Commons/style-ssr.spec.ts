// @vitest-environment node
/**
 * #1092 — `useStyle()` wrote its `#id { … }` rule from `onMounted`, which never
 * runs on the server: a component that paints only through that rule (Btn,
 * BtnToggle, BtnGroup, Avatar, Breadcrumb, BottomNav, Stepper) had no
 * background, radius or colour in the served HTML.
 *
 * This file runs under the real `node` environment (no `window`, no
 * `document`) so `IN_BROWSER` is false, i.e. exactly what a server sees.
 * `renderSsrStyles(app)` is the host-facing entry point for plain Vue SSR;
 * the Nuxt server plugin feeds `getSsrStyles(app)` to the head.
 */
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'

import { OrigamAvatar, OrigamBtn, OrigamChip } from '@origam/components'
import { createOrigam } from '@origam/origam'
import { origamTheme } from '@origam/themes'
import { getSsrStyles, renderSsrStyles } from '@origam/utils/Commons/ssr-styles.util'
import { useStyle } from '@origam/composables/Commons/style.composable'
import { computed } from 'vue'

function ssrApp (root: () => ReturnType<typeof h>) {
    const app = createSSRApp({ render: root })

    app.use(createOrigam({ themes: origamTheme, ssr: true }))

    return app
}

describe('useStyle on the server (#1092)', () => {
    it('is a real server environment', () => {
        expect(typeof document).toBe('undefined')
    })

    it('renders the Btn rule: bgColor + rounded reach the served HTML', async () => {
        const app = ssrApp(() => h(OrigamBtn, { bgColor: 'primary', rounded: 'xl' }, () => 'Go'))

        const html = await renderToString(app)
        const styles = renderSsrStyles(app)

        const rootId = /<button[^>]*\sid="([^"]+)"/.exec(html)?.[1]

        expect(rootId, `button has an id in ${html}`).toBeTruthy()
        // The rule targets the id the root element actually carries.
        expect(styles).toMatch(/^<style id="origam-style-[^"]+">/)
        expect(styles).toContain(`#${rootId} {`)
        expect(styles).toMatch(/background-color:\s*var\(--origam-color__action--primary---bg\)/)
        expect(styles).toMatch(/border-radius:\s*var\(--origam-radius---xl/)
    })

    it('covers other useStyle components too (Avatar, Chip)', async () => {
        const app = ssrApp(() => h('div', [
            h(OrigamAvatar, { bgColor: 'danger' }),
            h(OrigamChip, { bgColor: 'success' }, () => 'x')
        ]))

        await renderToString(app)

        const entries = getSsrStyles(app)

        expect(entries.length).toBeGreaterThanOrEqual(2)
        // one entry (= one <style id>) per instance, ids unique
        expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length)
    })

    it('gives two useStyle calls of ONE instance two different tags', async () => {
        const Twice = defineComponent({
            name: 'OrigamTwice',
            setup () {
                const a = useStyle(computed(() => ({ color: 'red' })))
                const b = useStyle(computed(() => ({ color: 'blue' })), () => 'second')

                return () => h('div', { id: a.id.value }, h('span', { id: b.id.value }))
            }
        })
        const app = ssrApp(() => h(Twice))

        await renderToString(app)

        const entries = getSsrStyles(app)

        expect(entries).toHaveLength(2)
        expect(entries[0].id).not.toBe(entries[1].id)
        expect(entries[1].css).toContain('#second')
    })

    it('cannot be broken out of by a value containing </style>', async () => {
        const Evil = defineComponent({
            name: 'OrigamEvil',
            setup () {
                const s = useStyle(computed(() => ({ color: 'red;}</style><script>alert(1)</script>' })))

                return () => h('div', { id: s.id.value })
            }
        })
        const app = ssrApp(() => h(Evil))

        await renderToString(app)

        const out = renderSsrStyles(app)

        expect(out.match(/<\/style/gi)).toHaveLength(1) // the closing tag we emit
        expect(out).not.toContain('</style><script>')
    })

    it('keeps the registries of two apps apart (persistent server, many requests)', async () => {
        const a = ssrApp(() => h(OrigamBtn, { bgColor: 'primary' }, () => 'a'))
        const b = ssrApp(() => h('div', 'nothing styled'))

        await renderToString(a)
        await renderToString(b)

        expect(getSsrStyles(a).length).toBeGreaterThan(0)
        expect(getSsrStyles(b)).toHaveLength(0)
    })

    it('reads the rule at collection time, not at registration', async () => {
        const app = ssrApp(() => h(OrigamBtn, { bgColor: 'primary' }, () => 'x'))

        await renderToString(app)

        // Same string twice: collection is idempotent.
        expect(renderSsrStyles(app)).toBe(renderSsrStyles(app))
    })
})
