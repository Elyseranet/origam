// @vitest-environment node
// #1238 — avec un `attach` explicite, `useTeleport` renvoie `undefined` cote serveur et Vue SSR
// ne rend RIEN pour un Teleport sans `to`. Le contenu doit etre dans le HTML serveur (rendu en ligne).
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import { describe, expect, it } from 'vitest'

import OrigamDrawer from '@origam/components/Drawer/OrigamDrawer.vue'
import { createOrigam } from '@origam/origam'

const render = async (props: Record<string, unknown>) => {
    const app = createSSRApp({
        render: () => h(OrigamDrawer, props, { default: () => h('p', 'DRAWER-CONTENT') })
    })
    app.use(createOrigam({ ssr: true }))
    return renderToString(app)
}

describe.each([
    ['sans attach', {}],
    ['attach selecteur', { attach: '#target' }],
    ['attach true', { attach: true }],
    ['attach false', { attach: false }]
])('Drawer SSR %s', (_name, extra) => {
    it.each([{ permanent: true }, { modelValue: true }])('le contenu est dans le HTML serveur %o', async (state) => {
        expect(await render({ ...state, ...extra })).toContain('DRAWER-CONTENT')
    })
})
