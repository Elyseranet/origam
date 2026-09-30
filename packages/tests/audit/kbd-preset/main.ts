import { createApp, h } from 'vue'

import { createOrigam } from '../../../ds/src/origam'
import OrigamKbd from '../../../ds/src/components/Kbd/OrigamKbd.vue'
import { origamTheme } from '../../../ds/src/themes/origam.theme'
import '../../../ds/src/assets/css/main.css'

import { appleThemes } from '../../../marketing/src/themes/apple.theme'
import { cartoonThemes } from '../../../marketing/src/themes/cartoon.theme'
import { ecomThemes } from '../../../marketing/src/themes/ecom.theme'
import { editorialThemes } from '../../../marketing/src/themes/editorial.theme'
import { geekThemes } from '../../../marketing/src/themes/geek.theme'
import { glassThemes } from '../../../marketing/src/themes/glass.theme'
import { materialThemes } from '../../../marketing/src/themes/material.theme'

import { KBD_PROBE_CASES, KBD_PROBE_COMBINATION, KBD_PROBE_TEXT } from './probe-cases.const'
import type { IKbdProbeConfig } from './probe-cases.interface'

/*********************************************************
 * Harness entry
 *
 * @description
 * Monte les 9 cas de `KBD_PROBE_CASES` sous UNE identite x mode epinglee
 * sur `<html>`, pour qu'un pilote Playwright puisse lire les styles
 * calcules de chaque surface reelle rendue par Vue.
 *
 * @description
 * ⛔ POURQUOI PAS HISTOIRE. Le bac a sable Histoire est epingle
 * `data-theme="light"` par `packages/stories/histoire.setup.ts` et son
 * `createOrigam` n'enregistre QUE `origamTheme` : les 7 marques n'y sont
 * pas atteignables, donc la matrice 8 identites y est structurellement
 * immesurable. S'ajoutent deux pieges du depot : dans l'iframe `__sandbox`
 * un element deja rendu ne recalcule pas ses styles apres mutation, et le
 * port 6006 est partage par toutes les copies de travail.
 *
 * @description
 * ⛔ POURQUOI PAS UNE PAGE STATIQUE. Le preset de variant est resolu A
 * L'EXECUTION par le resolveur de props d'ADR-005, dans un `beforeCreate`
 * de mixin Vue. Une page HTML sans Vue montrerait les tokens, jamais la
 * resolution — c'est-a-dire tout sauf ce que ce lot modifie.
 ********************************************************/

const cfg = (window as unknown as { __ORIGAM_KBD_PROBE__?: IKbdProbeConfig }).__ORIGAM_KBD_PROBE__
        ?? { identity: 'native', mode: 'light' }

/*********************************************************
 * Epinglage des axes AVANT le premier montage
 *
 * @description
 * ⛔ Infaisable depuis `addInitScript` : ce script tourne sur un document
 * VIDE, ou `document.documentElement` vaut encore `null`, donc le
 * `setAttribute` leve et l'attribut n'est jamais ecrit — en silence. Le
 * harnais voisin `dark-contrast` a mesure ses 16 configurations ainsi et
 * les a TOUTES rendues en clair : un resultat propre, entierement
 * artefactuel.
 ********************************************************/
const html = document.documentElement
if (cfg.identity && cfg.identity !== 'native') html.setAttribute('data-theme', cfg.identity)
if (cfg.mode) html.setAttribute('data-mode', cfg.mode)

/*********************************************************
 * createOrigam — les 8 identites enregistrees d'un coup
 *
 * @description
 * `origamTheme` est passe EXPLICITEMENT : depuis #877 un appel nu
 * n'installe AUCUN theme, donc ni `vars` ni les defauts par composant
 * d'ADR-005 — et c'est precisement le mecanisme que ce harnais mesure.
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
        KBD_PROBE_CASES.map((probeCase) => h(
            'div',
            { 'data-probe-case': probeCase.key, style: 'padding: 8px;' },
            [
                h(OrigamKbd, {
                    variant: probeCase.variant,
                    ...(probeCase.combination
                        ? { combination: [...KBD_PROBE_COMBINATION] }
                        : { text: KBD_PROBE_TEXT }),
                    ...(probeCase.bgColor ? { bgColor: probeCase.bgColor } : {}),
                    ...(probeCase.border ? { border: probeCase.border } : {})
                })
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
 * intermediaires quand une transition tourne — le depot a deja lu un
 * `min-height: 48px` a 10px de haut pour cette raison.
 ********************************************************/
;(window as unknown as { __ORIGAM_KBD_PROBE_READY__?: boolean }).__ORIGAM_KBD_PROBE_READY__ = true
