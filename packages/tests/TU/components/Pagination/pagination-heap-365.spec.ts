// #365 — le heap grossit-il vraiment, serie apres serie ?
//
// Le ticket demande explicitement, avant tout diagnostic : « Reproduire hors
// du harness : monter/demonter en boucle avec un snapshot heap avant/apres,
// et verifier que la croissance est REELLE et MONOTONE. » Puis, si infirme :
// « le noter ici et fermer — un faux positif de harness documente vaut mieux
// qu'un ticket qui traine. »
//
// ⛔ Ce spec ne s'execute QUE si `global.gc` est disponible, c'est-a-dire
// sous `--expose-gc`. Sans GC forcee la mesure ne dit rien : on lirait du
// dechet pas encore collecte, pas de la retention. Un test de heap qui
// s'execute sans GC est un generateur de faux verdicts, dans les deux sens.
//
//   NODE_OPTIONS=--expose-gc pnpm exec vitest run TU/components/Pagination
//
// ## Verdict, 2026-09-06 : la fuite ne se reproduit PAS
//
// Cinq mesures, toutes plates :
//
//   <style> de composant, 200 cycles        compte plat
//   ResizeObserver                          observed=0, disconnected=200
//   heap, 4 x 500 cycles                    119,1 -> 119,6 Mo   (+0,4 %)
//   heap, 5 x 2000 cycles (protocole exact) passe, aucun OOM
//   heap, protocole du harness (hote        118,5 -> 119,0 Mo   (+0,3 %)
//   persistant + v-if, 5 x 2000)
//
// La derniere ligne compte : mes trois premieres mesures recreaient l'app a
// chaque cycle, la ou le harness bascule un `v-if` sur un hote PERSISTANT.
// Si la retention avait ete dans ce chemin-la, mon protocole ne l'aurait pas
// vue. Elle n'y est pas non plus.
//
// Ce spec reste au depot en regime reduit (4 x 500) : il tourne en quelques
// secondes et attraperait une regression future, sans couter une minute a
// chaque suite.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamPagination from '@origam/components/Pagination/OrigamPagination.vue'
import { createOrigam } from '@origam/origam'

const gc = (globalThis as { gc?: () => void }).gc

const SERIES = 4
const PER_SERIES = 500

vi.stubGlobal('ResizeObserver', class { observe () {} unobserve () {} disconnect () {} })

describe.runIf(gc)('#365 — OrigamPagination, retention heap', () => {
    it('le heap ne croit pas serie apres serie', () => {
        const plugins = [ createOrigam() ]
        const cycle = () => mount(OrigamPagination, {
            props: { length: 20, modelValue: 3 } as never,
            global: { plugins }
        }).unmount()

        // Rodage : la premiere serie paie la compilation et le remplissage
        // des caches. La mesurer ferait passer un cout unique pour une fuite.
        for (let i = 0; i < 200; i++) cycle()

        const readings: Array<number> = []

        for (let s = 0; s < SERIES; s++) {
            for (let i = 0; i < PER_SERIES; i++) cycle()
            gc!(); gc!()
            readings.push(process.memoryUsage().heapUsed)
        }

        const growth = ((readings[readings.length - 1] - readings[0]) / readings[0]) * 100

        // eslint-disable-next-line no-console
        console.log(`#365 heap par serie (Mo) : ${ readings.map((r) => (r / 1048576).toFixed(1)).join(' → ') }  |  croissance ${ growth.toFixed(1) } %`)

        // Un composant qui retient a chaque cycle produit une croissance
        // monotone et forte. Le seuil est large a dessein : on cherche une
        // fuite, pas une variation due au bruit de l'allocateur. Mesure
        // reelle au moment de l'ecriture : 0,4 %.
        expect(growth).toBeLessThan(50)
    }, 60000)
})
