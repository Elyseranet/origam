import { createSSRApp } from 'vue'

import { OrigamBlockquote } from '../../../../ds/src/components/Blockquote/index'
import { OrigamBtn } from '../../../../ds/src/components/Btn/index'
import { OrigamImg } from '../../../../ds/src/components/Img/index'
import { OrigamTitle } from '../../../../ds/src/components/Title/index'
import type { IOrigamTheme } from '../../../../ds/src/interfaces'
import { createOrigamCore } from '../../../../ds/src/origam-core'

import App from './App.vue'
import { FIXTURE_THEME } from './fixture-theme'

export function createFixtureApp (themes: IOrigamTheme[] = [FIXTURE_THEME]) {
    const app = createSSRApp(App)
    app.use(createOrigamCore({
        ssr: true,
        themes,
        components: {OrigamTitle, OrigamBlockquote, OrigamBtn, OrigamImg}
    }))
    return app
}
