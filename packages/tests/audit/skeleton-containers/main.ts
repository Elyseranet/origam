import { createApp, h } from 'vue'

import { createOrigam } from '../../../ds/src/origam'
import OrigamCard from '../../../ds/src/components/Card/OrigamCard.vue'
import OrigamDataTable from '../../../ds/src/components/DataTable/OrigamDataTable.vue'
import OrigamExpansionPanel from '../../../ds/src/components/ExpansionPanel/OrigamExpansionPanel.vue'
import OrigamExpansionPanels from '../../../ds/src/components/ExpansionPanel/OrigamExpansionPanels.vue'
import { origamTheme } from '../../../ds/src/themes/origam.theme'

import '../../../ds/src/assets/css/tokens/primitive.css'
import '../../../ds/src/assets/css/tokens/light.css'
import '../../../ds/src/assets/css/tokens/dark.css'
import '../../../ds/src/assets/css/tokens/origam-utilities.css'

/*********************************************************
 * Harness entry
 *
 * @description
 * Monte UN conteneur en chargement `skeleton` par page, selon
 * `window.__ORIGAM_SKELETON_CONTAINERS__.scenario` (`card`, `panel`,
 * `table`). Une page par scenario, pour que le compte de `<style>` du
 * document ne soit pas melange d'un conteneur a l'autre.
 ********************************************************/

const query = new URLSearchParams(window.location.search)

const cfg = (window as unknown as { __ORIGAM_SKELETON_CONTAINERS__?: { scenario: string, mode?: string } }).__ORIGAM_SKELETON_CONTAINERS__
        ?? { scenario: query.get('scenario') ?? 'card', mode: query.get('mode') ?? 'light' }

document.documentElement.setAttribute('data-mode', cfg.mode ?? 'light')

const SKELETON = { type: 'skeleton' }

const headers = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'status', title: 'Status' },
    { key: 'amount', title: 'Amount', align: 'end' }
]

const scenarios: Record<string, () => ReturnType<typeof h>> = {
    card: () => h(OrigamCard, {
        loading: SKELETON,
        title: 'Title',
        subtitle: 'Subtitle',
        image: 'x.png',
        prependIcon: 'mdi-account',
        style: 'width: 320px;'
    }, { footer: () => h('button', 'Action') }),
    panel: () => h(OrigamExpansionPanels, { modelValue: 'p1' }, {
        default: () => h(OrigamExpansionPanel, { value: 'p1', title: 'Panel', content: 'Body', loading: SKELETON })
    }),
    table: () => h(OrigamDataTable, { headers, items: [], loading: SKELETON, hideDefaultFooter: true })
}

const app = createApp({
    render: () => h('div', { id: 'probe-root', 'data-probe-scenario': cfg.scenario }, [
        h('div', {
            style: 'padding: 16px; background-color: var(--origam-color__surface---default); color: var(--origam-color__text---primary);'
        }, [scenarios[cfg.scenario]()])
    ])
})

app.use(createOrigam({ themes: [...origamTheme] }))
app.mount('#app')

;(window as unknown as { __ORIGAM_SKELETON_CONTAINERS_READY__?: boolean }).__ORIGAM_SKELETON_CONTAINERS_READY__ = true
