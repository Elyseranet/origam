// @vitest-environment node
/**
 * #1469 — the panel's header / content props came from the child components'
 * template refs (`ref.value?.filterProps`), which are undefined on the server:
 * neither the title nor the content reached the served HTML.
 */
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import { describe, expect, it } from 'vitest'

import { OrigamExpansionPanel, OrigamExpansionPanels } from '@origam/components'
import { createOrigam } from '@origam/origam'
import { origamTheme } from '@origam/themes'

async function render (root: () => ReturnType<typeof h>) {
    const app = createSSRApp({ render: root })
    app.use(createOrigam({ themes: origamTheme, ssr: true }))
    return renderToString(app)
}

// `eager` is the documented opt-in to mount the (hidden) body from the start; without it the body is lazy by design.
const panel = () => h(OrigamExpansionPanels, () => h(OrigamExpansionPanel, { title: 'SSR-TITLE', content: 'SSR-CONTENT', eager: true }))

describe('OrigamExpansionPanel SSR (#1469)', () => {
    it('renders title and content in the served HTML', async () => {
        const html = await render(panel)
        expect(html).toContain('SSR-TITLE')
        expect(html).toContain('SSR-CONTENT')
    })

    it('keeps the closed panel collapsed in the served HTML', async () => {
        expect(await render(panel)).toMatch(/aria-expanded="false"[\s\S]*display:none/)
    })

    it('gives the same ids on two renders (no module counter)', async () => {
        expect(await render(panel)).toBe(await render(panel))
    })
})
