import { createApp, h } from 'vue'

import { createOrigam } from '../../../ds/src/origam'
import OrigamBtn from '../../../ds/src/components/Btn/OrigamBtn.vue'
import OrigamBtnGroup from '../../../ds/src/components/Btn/OrigamBtnGroup.vue'
import OrigamBtnToggle from '../../../ds/src/components/Btn/OrigamBtnToggle.vue'
import OrigamChip from '../../../ds/src/components/Chip/OrigamChip.vue'
import OrigamCode from '../../../ds/src/components/Code/OrigamCode.vue'
import { origamTheme } from '../../../ds/src/themes/origam.theme'
import '../../../ds/src/assets/css/main.css'

import { appleThemes } from '../../../marketing/src/themes/apple.theme'
import { cartoonThemes } from '../../../marketing/src/themes/cartoon.theme'
import { ecomThemes } from '../../../marketing/src/themes/ecom.theme'
import { editorialThemes } from '../../../marketing/src/themes/editorial.theme'
import { geekThemes } from '../../../marketing/src/themes/geek.theme'
import { glassThemes } from '../../../marketing/src/themes/glass.theme'
import { materialThemes } from '../../../marketing/src/themes/material.theme'

import { BTN_PROBE_CASES } from './probe-cases.const'
import type { IBtnProbeConfig } from './probe-cases.interface'

/*********************************************************
 * Harness entry
 *
 * @description
 * Monte les cas de `BTN_PROBE_CASES` sous UNE identite x mode epinglee sur
 * `<html>`. Meme raisonnement que `../kbd-preset/main.ts` — lire son
 * en-tete : pas Histoire (epinglee `data-theme="light"`, une seule identite)
 * et pas une page statique (les props sont resolues a l'execution).
 *
 * @description
 * ⛔ Les axes sont ecrits AVANT le montage et ne le sont JAMAIS depuis
 * `addInitScript` (document vide, `documentElement` nul).
 ********************************************************/

const cfg = (window as unknown as { __ORIGAM_BTN_PROBE__?: IBtnProbeConfig }).__ORIGAM_BTN_PROBE__
        ?? { identity: 'native', mode: 'light' }

const html = document.documentElement
if (cfg.identity && cfg.identity !== 'native') html.setAttribute('data-theme', cfg.identity)
if (cfg.mode) html.setAttribute('data-mode', cfg.mode)

const origam = createOrigam({
    themes: [
        ...origamTheme,
        ...appleThemes,
        ...cartoonThemes,
        ...ecomThemes,
        ...editorialThemes,
        ...geekThemes,
        ...glassThemes,
        ...materialThemes
    ]
})

const app = createApp({
    render: () => h(
        'div',
        { id: 'probe-root' },
        BTN_PROBE_CASES.map((probeCase) => h(
            'div',
            {
                'data-probe-case': probeCase.key,
                style: `padding: 8px; ${probeCase.containerWidth ? `width: ${probeCase.containerWidth}px; box-sizing: border-box;` : ''}`
            },
            [
                probeCase.component === 'btn-group' ? h(OrigamBtnGroup, probeCase.props)
                    : probeCase.component === 'btn-toggle' ? h(OrigamBtnToggle, probeCase.props)
                        : probeCase.component === 'chip' ? h(OrigamChip, probeCase.props)
                            : probeCase.component === 'code' ? h(OrigamCode, probeCase.props)
                                : h(OrigamBtn, probeCase.props, probeCase.label ? { default: () => probeCase.label } : undefined)
            ]
        ))
    )
})

app.use(origam)
app.mount('#app')

;(window as unknown as { __ORIGAM_BTN_PROBE_READY__?: boolean }).__ORIGAM_BTN_PROBE_READY__ = true
