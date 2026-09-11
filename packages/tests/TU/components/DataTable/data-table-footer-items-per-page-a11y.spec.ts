// Classeur "divers" (2026-09-01), OrigamDataTableFooter, critère C6 —
// le sélecteur "Items per page" n'avait AUCUN nom accessible : le libellé
// visible était un <span> purement visuel, jamais associé au contrôle
// (pas de <label for>, pas d'aria-label, pas d'aria-labelledby). Un
// lecteur d'écran annonçait un select anonyme.
//
// Réparé en donnant au <span> un id stable et en le référençant via
// `aria-labelledby` sur `<origam-select>` — jamais un `aria-label`
// dupliquant le texte déjà visible (cf. #427/#622 : un aria-label sur un
// contrôle qui a déjà un libellé visible est une source de désync, pas
// une correction).
//
// `<OrigamDataTableFooter>` lit son contexte de pagination par `inject()`
// — normalement fourni par `<OrigamDataTable>`. Une doublure minimale
// suffit à le monter isolément (même approche que
// `data-table-rows-dead-props.spec.ts`).

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { computed, defineComponent, h, ref } from 'vue'

import OrigamDataTableFooter from '@origam/components/DataTable/OrigamDataTableFooter.vue'
import { createOrigam } from '@origam/origam'

import { ORIGAM_DATA_TABLE_PAGINATION_KEY } from '@origam/consts'

const page = ref(1)
const itemsPerPage = ref(10)
const itemsLength = ref(42)

const PROVIDE = {
    [ORIGAM_DATA_TABLE_PAGINATION_KEY as symbol]: {
        page,
        itemsPerPage,
        startIndex: computed(() => (page.value - 1) * itemsPerPage.value),
        stopIndex: computed(() => Math.min(page.value * itemsPerPage.value, itemsLength.value)),
        pageCount: computed(() => Math.ceil(itemsLength.value / itemsPerPage.value)),
        itemsLength,
        nextPage: () => { page.value += 1 },
        prevPage: () => { page.value -= 1 },
        setPage: (value: number) => { page.value = value },
        setItemsPerPage: (value: number) => { itemsPerPage.value = value }
    }
}

function mountFooter (props: Record<string, unknown> = {}) {
    return mount(OrigamDataTableFooter as never, {
        props: props as never,
        global: { plugins: [createOrigam()], provide: PROVIDE }
    })
}

describe('OrigamDataTableFooter — nom accessible du select "Items per page" (C6)', () => {
    it('le <span> visible porte un id stable', () => {
        const wrapper = mountFooter()
        const label = wrapper.find('.origam-data-table-footer__items-per-page > span')

        expect(label.exists()).toBe(true)
        expect(label.attributes('id')).toBeTruthy()
        expect(label.text()).toBe('Items per page:')
    })

    it('le <input> réel du select porte aria-labelledby pointant vers le <span>', () => {
        const wrapper = mountFooter()
        const label = wrapper.find('.origam-data-table-footer__items-per-page > span')
        const input = wrapper.find('.origam-data-table-footer__items-per-page input')

        expect(input.exists()).toBe(true)
        expect(input.attributes('aria-labelledby')).toBe(label.attributes('id'))
    })

    it('aria-labelledby gagne le calcul du nom accessible même si `OrigamSelect` pose aussi un aria-label (#622, hors perimetre)', () => {
        // `OrigamSelect` pose INCONDITIONNELLEMENT `:aria-label="t(label)"`
        // (l.7 de OrigamSelect.vue) a cause d'un bug distinct, deja ouvert et
        // deja trace (#622 : un `const label` local masque la prop `label`),
        // hors perimetre de ce lot. Mesure : l'input recoit bien
        // `aria-label="Open"` EN PLUS de notre `aria-labelledby`. Ce n'est pas
        // notre regression — la specification ARIA calcule le nom accessible
        // depuis `aria-labelledby` EN PRIORITE sur `aria-label` quand les deux
        // sont presents, donc le nom accessible reste correct ("Items per
        // page:") malgre le bruit. On documente l'etat plutot que de fermer
        // les yeux dessus.
        const wrapper = mountFooter()
        const label = wrapper.find('.origam-data-table-footer__items-per-page > span')
        const input = wrapper.find('.origam-data-table-footer__items-per-page input')

        expect(input.attributes('aria-labelledby')).toBe(label.attributes('id'))
        // Note : pas d'assertion sur aria-label — son contenu est regi par
        // #622, un defaut distinct sur OrigamSelect lui-meme.
    })

    it('deux instances dans la MÊME app ont des ids distincts (pas de collision DOM)', () => {
        // ⚠️ Deux `mount()` separes creent chacun leur propre app Vue, et
        // `useId()` (donc `getUid()`) redemarre a `v-0` par app — deux mounts
        // separes produiraient TOUJOURS le meme id sans que ce soit un
        // defaut : ce n'est pas un scenario reel (une page n'a qu'une app).
        // Le vrai scenario — deux tables sur la MÊME page — s'obtient en
        // montant les deux footers comme freres dans un seul composant hote.
        const Host = defineComponent({
            render: () => h('div', [
                h(OrigamDataTableFooter as never, {} as never),
                h(OrigamDataTableFooter as never, {} as never)
            ])
        })
        const wrapper = mount(Host, {
            global: { plugins: [createOrigam()], provide: PROVIDE }
        })

        const spans = wrapper.findAll('.origam-data-table-footer__items-per-page > span')
        expect(spans).toHaveLength(2)

        const idA = spans[0].attributes('id')
        const idB = spans[1].attributes('id')

        expect(idA).toBeTruthy()
        expect(idB).toBeTruthy()
        expect(idA).not.toBe(idB)
    })
})
