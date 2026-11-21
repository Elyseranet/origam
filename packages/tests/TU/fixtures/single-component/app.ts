import { createSSRApp, h } from 'vue'

import { OrigamTitle } from '../../../../ds/src/components/Title/index'
import { origamTheme } from '../../../../ds/src/themes/origam.theme'
import { createOrigamCore } from '../../../../ds/src/origam-core'

// #1404 — a page that renders one `origam-title`, with the DS theme (~16 Kio of source).
export function createFixtureApp () {
    const app = createSSRApp({render: () => h(OrigamTitle, {tag: 'h1'}, () => 'Hello')})
    app.use(createOrigamCore({ssr: true, themes: [origamTheme], components: {OrigamTitle}}))
    return app
}
