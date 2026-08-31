/**
 * `getUid()` — SSR stability.
 *
 * Two independent defects were measured on the marketing site (Nuxt 4, prod
 * build, `packages/marketing/.output`) before this spec existed. Both come
 * from `getUid()` having been a MODULE-GLOBAL monotonic counter:
 *
 *  1. ORDER DIVERGENCE (fires on a single, quiet request). Vue's SSR renderer
 *     buffers an async subtree and resumes it after its siblings, so the order
 *     in which component instances call `getUid()` on the server is not the
 *     order in which they mount on the client. A linear counter therefore
 *     hands the same element a different number on each side. Measured on
 *     `/`: 82 of 125 `origam-*` ids differed between the served HTML and the
 *     post-hydration DOM, with no concurrency at all.
 *
 *  2. CROSS-REQUEST BLEED (fires under concurrency). `createOrigam()`'s
 *     `install()` used to call `getUid.reset()`, and Nuxt's server plugin runs
 *     `createOrigam()` + `app.use()` ONCE PER REQUEST. That made a per-request
 *     code path mutate module-global state: request B's install reset the
 *     counter while request A was still rendering. Measured on the same page:
 *     under parallel load the server emitted `origam-app-263` where a quiet
 *     server emitted `origam-app-0` — and 125 of 125 ids were replaced at
 *     hydration. In isolation the same mechanism produces the SAME id twice in
 *     one document (see the duplicate-id test below), which is invalid HTML and
 *     collides the `#id { … }` rules `useStyle` injects.
 *
 * The fix is Vue 3.5's `useId()`: it derives the value from the instance's
 * position in the tree (`instance.ids`, inherited from the parent and extended
 * at each async boundary) and stores nothing at module scope. Same tree
 * position ⇒ same id on both sides; separate apps ⇒ separate namespaces.
 *
 * The two concurrency tests below FAIL on the module-global counter and pass
 * on `useId()`. The other two are guards that must not regress: defect (1)
 * needs Nuxt's own server/client asymmetry to surface and could not be
 * reproduced in a bare jsdom tree (every synthetic `async setup` yields on
 * BOTH sides, so both sides order it the same way), so it is verified end to
 * end against the marketing production build instead — see the PR description
 * for the before/after id counts.
 */
import { describe, expect, it } from 'vitest'
import { Suspense, createSSRApp, defineComponent, h, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'

import { createOrigam } from '@origam/origam'
import { getUid } from '@origam/utils/Commons/getCurrentInstance.util'

/** Emits its own generated uid so the rendered HTML carries it. */
const Probe = defineComponent({
    name: 'Probe',
    setup () {
        const uid = getUid()

        return () => h('i', { 'data-uid': String(uid) })
    }
})

/** Awaits in `setup()`, which makes the SSR renderer buffer its subtree. */
const Slow = defineComponent({
    name: 'Slow',
    async setup (_props, { attrs }) {
        await new Promise((resolve) => setTimeout(resolve, (attrs.delay as number) ?? 0))

        return () => h(Probe)
    }
})

/**
 * Awaits on the first (server) render only, mirroring how a Nuxt page fetches
 * on the server and reads the serialised payload on the client.
 */
function makeAsymmetric () {
    let served = false

    return defineComponent({
        name: 'Asymmetric',
        async setup () {
            if (!served) {
                served = true
                await new Promise((resolve) => setTimeout(resolve, 10))
            }

            return () => h(Probe)
        }
    })
}

function mountApp (root: ReturnType<typeof defineComponent>) {
    const app = createSSRApp(root)

    app.use(createOrigam({}))

    return app
}

function uidsOf (html: string) {
    return [...html.matchAll(/data-uid="([^"]*)"/g)].map((match) => match[1])
}

describe('getUid — SSR stability', () => {
    it('two successive SSR renders on one process emit the same ids', async () => {
        const Root = defineComponent({
            setup: () => () => h('div', [h(Probe), h(Probe), h(Probe)])
        })

        const first = uidsOf(await renderToString(mountApp(Root)))
        const second = uidsOf(await renderToString(mountApp(Root)))

        expect(second).toEqual(first)
    })

    it('a concurrent second request never shifts the first request\'s ids', async () => {
        const Root = defineComponent({
            setup: () => () => h('div', [h(Probe), h(Slow, { delay: 40 }), h(Probe)])
        })
        const Bare = defineComponent({ setup: () => () => h('span') })

        // Baseline: the same tree rendered with nothing else in flight.
        const alone = uidsOf(await renderToString(mountApp(Root)))

        // Now render it again while a second app installs midway through —
        // exactly what a Nitro process does under parallel traffic.
        const pending = renderToString(mountApp(Root))
        const interleaved = new Promise<string>((resolve) => {
            setTimeout(() => resolve(renderToString(mountApp(Bare))), 10)
        })

        const [underLoad] = await Promise.all([pending, interleaved])

        expect(uidsOf(underLoad)).toEqual(alone)
    })

    it('never emits the same id twice in one document', async () => {
        const Root = defineComponent({
            setup: () => () => h('div', [h(Probe), h(Slow, { delay: 40 }), h(Probe)])
        })

        // A second app that installs mid-render WITHOUT rendering any probe:
        // it consumes no id, so with a shared counter it only rewinds the one
        // the first render is still using — and the rewound value is handed out
        // a second time.
        const Bare = defineComponent({ setup: () => () => h('span') })

        const pending = renderToString(mountApp(Root))
        const bare = new Promise<string>((resolve) => {
            setTimeout(() => resolve(renderToString(mountApp(Bare))), 10)
        })

        const [html] = await Promise.all([pending, bare])
        const uids = uidsOf(html)

        expect(new Set(uids).size).toBe(uids.length)
    })

    it('the id an element gets on the server is the id it keeps on the client', async () => {
        const Asymmetric = makeAsymmetric()
        const Root = defineComponent({
            setup: () => () => h('div', [
                h(Suspense, null, { default: () => h(Asymmetric) }),
                h(Probe),
                h(Probe)
            ])
        })

        const html = await renderToString(mountApp(Root))
        const serverUids = uidsOf(html)

        const container = document.createElement('div')
        container.innerHTML = html
        document.body.appendChild(container)

        // `mount(container, true)` — the hydration target is the element whose
        // CHILDREN the SSR markup is, not the markup's own root.
        mountApp(Root).mount(container, true)
        await new Promise((resolve) => setTimeout(resolve, 50))
        await nextTick()

        const clientUids = [...container.querySelectorAll('[data-uid]')]
            .map((el) => el.getAttribute('data-uid'))

        container.remove()

        expect(clientUids).toEqual(serverUids)
    })
})
