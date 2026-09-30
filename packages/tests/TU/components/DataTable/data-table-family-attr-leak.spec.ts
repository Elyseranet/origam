/****************************************************************************
 * data-table-family-attr-leak.spec.ts — #371, le « pattern transverse »
 *
 * @description
 * Le ticket #371 signale ses points 1 et 4 comme un SEUL defaut trouve deux
 * fois : un forward de props par `v-bind` d'un objet construit par le parent
 * fuit en attributs DOM des que l'interface de l'enfant est en retard sur ce
 * que le parent construit. Une fonction y est serialisee par `toString()`.
 *
 * @description
 * Les deux specs voisines (`data-table-rows-group-header-attrs.spec.ts`,
 * `data-table-row-attrs-leak.spec.ts`) verrouillent chacune UN site precis.
 * Celle-ci balaye la famille entiere : elle monte `<OrigamDataTable>` dans
 * cinq configurations et inspecte CHAQUE attribut de CHAQUE element rendu.
 * Le ticket note qu'aucun garde ne voit ce motif, « il faut lire le
 * `outerHTML` rendu » — c'est exactement ce que fait ce balayage.
 *
 * @description
 * MESURE — etat corrige : 0 fuite sur les cinq configurations.
 * CONTROLE POSITIF (obligatoire : un detecteur muet et un code sain rendent
 * le meme vert) : en re-cassant la ligne 64 de `OrigamDataTableRows.vue`
 * pour v-binder `groupHeaderSlotProps()` (l'etat d'avant #548), le balayage
 * remonte 10 fuites sur `grouped` et 10 sur `grouped+select+mobile`
 * (`isgroupopen="(group) => {…"`, `isexpanded="(item) => {…"`), et les trois
 * configurations sans groupe restent vertes — le detecteur est donc CIBLE,
 * pas un rouge en bloc.
 *
 * @description
 * ⛔ `[object Object]` est cherche au meme titre que `=>` : un objet qui
 * fuit en attribut se serialise ainsi, sans code source visible, donc sans
 * le signal qui a fini par faire remarquer le point 1.
 ***************************************************************************/

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamDataTable from '@origam/components/DataTable/OrigamDataTable.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})

const HEADERS = [{title: 'Name', key: 'name'}, {title: 'Cat', key: 'cat'}]
const ITEMS = Array.from({length: 30}, (_, i) => ({name: `U${i}`, cat: i % 2 ? 'a' : 'b'}))

const CASES: Array<[string, Record<string, unknown>]> = [
    ['plain', {}],
    ['grouped', {groupBy: [{key: 'cat', order: 'asc'}]}],
    ['select+expand', {showSelect: true, showExpand: true}],
    ['mobile', {mobileBreakpoint: 'xxl'}],
    ['grouped+select+mobile', {groupBy: [{key: 'cat', order: 'asc'}], showSelect: true, mobileBreakpoint: 'xxl'}]
]

describe('PROBE — balayage runtime de la famille DataTable', () => {
    for (const [label, props] of CASES) {
        it(`[${label}] aucun attribut ne porte de source de closure ni [object Object]`, async () => {
            const wrapper = mount(OrigamDataTable as never, {
                props: {headers: HEADERS, items: ITEMS, ...props} as never,
                global: {plugins: [createOrigam()]}
            })
            await nextTick()
            await nextTick()
            await nextTick()

            const offenders: Array<string> = []
            for (const el of Array.from(wrapper.element.querySelectorAll('*'))) {
                for (const a of Array.from(el.attributes)) {
                    if (a.value.includes('=>') || a.value.includes('[object Object]') || a.value === 'function') {
                        offenders.push(`<${el.tagName.toLowerCase()} class="${el.getAttribute('class') ?? ''}"> ${a.name}="${a.value.slice(0, 70)}"`)
                    }
                }
            }
            if (offenders.length) {
                console.log(`\n--- ${label} : ${offenders.length} fuite(s) ---\n${offenders.join('\n')}`)
            }
            expect(offenders).toEqual([])
        })
    }
})
