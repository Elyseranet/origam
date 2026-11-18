// #1223 — un OrigamDrawer sans `attach` perdait son contenu en SSR et l'hydratation
// echouait. Vrai rendu serveur (renderToString) puis vraie hydratation (createSSRApp).
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'

import OrigamLayout from '@origam/components/Layout/OrigamLayout.vue'
import OrigamDrawer from '@origam/components/Drawer/OrigamDrawer.vue'
import OrigamMain from '@origam/components/Main/OrigamMain.vue'
import { createOrigam } from '@origam/origam'

const build = (drawerProps: Record<string, unknown>) => {
    const app = createSSRApp({
        render: () => h(OrigamLayout, null, {
            default: () => [
                h(OrigamDrawer, drawerProps, { default: () => h('p', { id: 'drawer-content' }, 'DRAWER-CONTENT') }),
                h(OrigamMain, null, { default: () => h('p', 'MAIN') })
            ]
        })
    })
    app.use(createOrigam({ ssr: true }))
    return app
}

afterEach(() => { document.body.innerHTML = '' })

describe.each([{ permanent: true }, { modelValue: true }])('Drawer SSR + hydratation %o', (drawerProps) => {
    it('le HTML serveur contient le contenu, et l\'hydratation ne produit aucun warning', async () => {
        const html = await renderToString(build(drawerProps))
        expect(html).toContain('DRAWER-CONTENT')

        const container = document.createElement('div')
        container.innerHTML = html
        document.body.appendChild(container)

        const client = build(drawerProps)
        const handler = vi.fn()
        client.config.warnHandler = handler
        client.config.errorHandler = handler
        client.mount(container)
        await new Promise(r => setTimeout(r, 50))

        expect(handler.mock.calls.map(c => String(c[0]))).toEqual([])
        expect(container.querySelectorAll('#drawer-content').length).toBe(1)
        expect(container.querySelector('.origam-layout__wrapper #drawer-content')).not.toBeNull()
    })
})
