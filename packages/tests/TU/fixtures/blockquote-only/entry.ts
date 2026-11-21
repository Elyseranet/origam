import { createSSRApp, h } from 'vue'
import { OrigamBlockquote } from '../../../../ds/src/components/Blockquote/index'
import { createOrigamCore } from '../../../../ds/src/origam-core'
const app = createSSRApp({render: () => h(OrigamBlockquote, null, () => 'Citation')})
app.use(createOrigamCore({ssr: true, components: {OrigamBlockquote}}))
app.mount('#app')
