import { createApp, h } from 'vue'

import OrigamBlockquote from '@ds-under-test/src/components/Blockquote/OrigamBlockquote.vue'
import { createOrigam } from '@ds-under-test/src/origam'
import { origamTheme } from '@ds-under-test/src/themes/origam.theme'
import '@ds-under-test/src/assets/css/main.css'

import { appleThemes } from '../../../marketing/src/themes/apple.theme'
import { cartoonThemes } from '../../../marketing/src/themes/cartoon.theme'
import { ecomThemes } from '../../../marketing/src/themes/ecom.theme'
import { editorialThemes } from '../../../marketing/src/themes/editorial.theme'
import { geekThemes } from '../../../marketing/src/themes/geek.theme'
import { glassThemes } from '../../../marketing/src/themes/glass.theme'
import { materialThemes } from '../../../marketing/src/themes/material.theme'

import {
    BLOCKQUOTE_PROBE_AUTHOR,
    BLOCKQUOTE_PROBE_BODY,
    BLOCKQUOTE_PROBE_CASES,
    BLOCKQUOTE_PROBE_SOURCE
} from './probe-cases.const'
import type { IBlockquoteProbeConfig } from './probe-cases.interface'

/*********************************************************
 * Harness entry
 *
 * @description
 * Monte les 8 cas de `BLOCKQUOTE_PROBE_CASES` sous UNE identite x mode
 * epinglee sur `<html>`, pour qu'un pilote Playwright lise les styles
 * calcules de chaque surface reelle rendue par Vue.
 *
 * @description
 * ⛔ POURQUOI PAS HISTOIRE. Le bac a sable est epingle
 * `data-theme="light"` et son `createOrigam` n'enregistre QUE
 * `origamTheme` : les 7 marques y sont hors d'atteinte, donc la seule
 * exposition VIVANTE de ce lot — `editorial` qui pose
 * `--origam-blockquote__accent---width: 3px` — y est structurellement
 * immesurable. C'est justement la mesure que #1015 exige.
 *
 * @description
 * ⛔ POURQUOI PAS UNE PAGE STATIQUE. Le preset de variant est resolu A
 * L'EXECUTION par le resolveur d'ADR-005, dans un `beforeCreate` de mixin
 * Vue. Une page sans Vue montrerait les tokens et jamais la resolution,
 * c'est-a-dire tout sauf ce que ce lot modifie.
 *
 * @description
 * Jumeau de `../kbd-preset/main.ts` — lire son en-tete avant de toucher a
 * l'un ou a l'autre.
 ********************************************************/
const cfg = (window as unknown as { __ORIGAM_BQ_PROBE__?: IBlockquoteProbeConfig }).__ORIGAM_BQ_PROBE__
        ?? { identity: 'native', mode: 'light' }

/*********************************************************
 * Epinglage des axes AVANT le premier montage
 *
 * @description
 * ⛔ Infaisable depuis `addInitScript` : ce script tourne sur un document
 * VIDE, ou `document.documentElement` vaut encore `null`, donc le
 * `setAttribute` leve et l'attribut n'est jamais ecrit — en silence. Le
 * harnais `dark-contrast` a mesure ses 16 configurations ainsi et les a
 * TOUTES rendues en clair : un resultat propre, entierement artefactuel.
 ********************************************************/
const html = document.documentElement
if (cfg.identity && cfg.identity !== 'native') html.setAttribute('data-theme', cfg.identity)
if (cfg.mode) html.setAttribute('data-mode', cfg.mode)

/*********************************************************
 * createOrigam — les 8 identites enregistrees d'un coup
 *
 * @description
 * `origamTheme` est passe EXPLICITEMENT : depuis #877 un appel nu
 * n'installe AUCUN theme, donc ni `vars` ni les defauts par composant, ni
 * le registre de presets — et c'est precisement ce que ce harnais mesure.
 *
 * @description
 * Les 7 marques sont enregistrees meme quand une seule est active :
 * `themedPropKeysUnion` et le registre de presets sont calcules a
 * l'installation sur l'UNION des themes enregistres, et c'est cette union
 * qui decide quels slots de props sont interceptes.
 ********************************************************/
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
        BLOCKQUOTE_PROBE_CASES.map((probeCase) => h(
            'div',
            { 'data-probe-case': probeCase.key, style: 'padding: 8px;' },
            [
                h(
                    OrigamBlockquote,
                    {
                        variant: probeCase.variant,
                        accentColor: 'primary',
                        author: BLOCKQUOTE_PROBE_AUTHOR,
                        source: BLOCKQUOTE_PROBE_SOURCE,
                        lang: 'en',
                        ...(probeCase.align ? { align: probeCase.align } : {}),
                        ...(probeCase.fontSize ? { fontSize: probeCase.fontSize } : {}),
                        ...(probeCase.quoteMark ? { quoteMark: probeCase.quoteMark } : {}),
                        ...(probeCase.padding ? { padding: probeCase.padding } : {})
                    },
                    { default: () => BLOCKQUOTE_PROBE_BODY }
                )
            ]
        ))
    )
})

app.use(origam)
app.mount('#app')

/*********************************************************
 * Signal de disponibilite
 *
 * @description
 * Le pilote attend ce drapeau puis deux `requestAnimationFrame` avant de
 * lire : une lecture synchrone apres montage rend des valeurs
 * intermediaires quand une transition tourne.
 ********************************************************/
;(window as unknown as { __ORIGAM_BQ_PROBE_READY__?: boolean }).__ORIGAM_BQ_PROBE_READY__ = true
