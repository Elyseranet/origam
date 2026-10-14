import { createApp, h } from 'vue'

import { createOrigam } from '../../../ds/src/origam'
import OrigamCard from '../../../ds/src/components/Card/OrigamCard.vue'
import OrigamSkeleton from '../../../ds/src/components/Skeleton/OrigamSkeleton.vue'
import { origamTheme } from '../../../ds/src/themes/origam.theme'

import '../../../ds/src/assets/css/tokens/primitive.css'
import '../../../ds/src/assets/css/tokens/light.css'
import '../../../ds/src/assets/css/tokens/dark.css'
import '../../../ds/src/assets/css/tokens/origam-utilities.css'

import { appleThemes } from '../../../marketing/src/themes/apple.theme'
import { cartoonThemes } from '../../../marketing/src/themes/cartoon.theme'
import { ecomThemes } from '../../../marketing/src/themes/ecom.theme'
import { editorialThemes } from '../../../marketing/src/themes/editorial.theme'
import { geekThemes } from '../../../marketing/src/themes/geek.theme'
import { glassThemes } from '../../../marketing/src/themes/glass.theme'
import { materialThemes } from '../../../marketing/src/themes/material.theme'

/*********************************************************
 * Harness entry
 *
 * @description
 * Monte un `OrigamSkeleton` fixe (pas d'animation : on mesure le repos)
 * sur deux surfaces — la surface de page et une `OrigamCard` — sous UNE
 * identite x mode epinglee sur `<html>` AVANT le premier montage.
 *
 * @description
 * ⛔ Les axes sont ecrits ici et non depuis `addInitScript` : sur un
 * document vide `document.documentElement` vaut `null` et l'ecriture
 * echoue en silence (cf. `../kbd-preset/main.ts`).
 *
 * @description
 * Les deux props de mouvement sont passees : `animation: 'none'` pour le
 * code courant, `pulse: false` pour le parent d'avant le lot (qui ne
 * connait que le booleen). Le harnais sert ainsi aux deux mesures.
 ********************************************************/

const cfg = (window as unknown as { __ORIGAM_SKELETON_PROBE__?: { identity: string; mode: string } }).__ORIGAM_SKELETON_PROBE__
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

const block = (key: string) => h(OrigamSkeleton, {
    variant: 'rectangular',
    width: 160,
    height: 40,
    animation: 'none',
    pulse: false,
    'data-probe-skeleton': key
} as never)

const app = createApp({
    render: () => h('div', { id: 'probe-root' }, [
        h('div', {
            'data-probe-surface': 'page',
            style: 'padding: 16px; background-color: var(--origam-color__surface---default); color: var(--origam-color__text---primary);'
        }, [block('page')]),
        h('div', {
            'data-probe-surface': 'card',
            style: 'padding: 16px; background-color: var(--origam-color__surface---default); color: var(--origam-color__text---primary);'
        }, [
            h(OrigamCard, null, { default: () => [block('card')] })
        ])
    ])
})

app.use(origam)
app.mount('#app')

;(window as unknown as { __ORIGAM_SKELETON_PROBE_READY__?: boolean }).__ORIGAM_SKELETON_PROBE_READY__ = true
