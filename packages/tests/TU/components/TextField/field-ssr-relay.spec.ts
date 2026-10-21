/**
 * #1226 — props relayed to the inner origam-input / origam-text-field must be
 * present at SERVER render and survive hydration unchanged. They used to travel
 * through a template ref (undefined on the server and during hydration), so the
 * `<input>` id and the style classes changed AFTER mount with no Vue warning.
 */
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { OrigamSelect, OrigamTextField } from '@origam/components'
import { createOrigam } from '@origam/origam'
import { origamTheme } from '@origam/themes'

const cases: Array<[string, () => ReturnType<typeof h>]> = [
    ['text-field with id', () => h(OrigamTextField, { id: 'my-id', label: 'L', variant: 'solo', rounded: 'full' })],
    ['text-field without id', () => h(OrigamTextField, { label: 'L', variant: 'solo', rounded: 'full' })],
    ['select with id', () => h(OrigamSelect, { id: 'my-id', items: ['a', 'b'], label: 'L', variant: 'solo', rounded: 'full' })],
    ['select without id', () => h(OrigamSelect, { items: ['a', 'b'], label: 'L', variant: 'solo', rounded: 'full' })]
]

const snapshot = (root: ParentNode) => {
    const input = root.querySelector('input')!

    return {
        id: input.id,
        describedby: input.getAttribute('aria-describedby'),
        rootClasses: [...root.querySelector('.origam-input')!.classList].sort().join(' ')
    }
}

describe('field prop relay — SSR vs hydrated DOM (#1226)', () => {
    afterEach(() => { document.body.innerHTML = '' })

    it.each(cases)('%s: same id / aria-describedby / root classes after hydration', async (_name, tree) => {
        const serverApp = createSSRApp({ render: tree })

        serverApp.use(createOrigam({ themes: origamTheme, ssr: true }))
        const html = await renderToString(serverApp)

        const container = document.createElement('div')

        container.innerHTML = html
        document.body.appendChild(container)
        const server = snapshot(container)

        vi.spyOn(console, 'warn').mockImplementation(() => {})
        const clientApp = createSSRApp({ render: tree })

        clientApp.use(createOrigam({ themes: origamTheme, ssr: true }))
        clientApp.mount(container)
        await nextTick()
        await nextTick()

        expect(snapshot(container)).toEqual(server)
        expect(server.rootClasses).toContain('origam--rounded-full')
    })
})
