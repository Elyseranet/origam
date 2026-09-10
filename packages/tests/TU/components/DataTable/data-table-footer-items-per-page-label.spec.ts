// #371 (critere C6) — le selecteur « Items per page » du pied de table
// n'a AUCUN nom accessible utile.
//
// MESURE AVANT CORRECTIF (develop @ a581bfff), attributs reellement rendus
// sur le <input> du selecteur :
//
//   { "aria-label": "Open", "title": "Open", "aria-haspopup": "listbox", … }
//
// Le champ est donc annonce « Open » par un lecteur d'ecran. Le
// <span>Items per page:</span> rendu juste a cote n'est associe au champ
// par RIEN : ni `<label for>`, ni `id` + `aria-labelledby`.
//
// ⛔ POURQUOI « Open » — piege mesure, et il dicte la FORME du correctif.
// <OrigamSelect> declare bien une prop `label`, mais son `<script setup>`
// declare AUSSI, ligne 1153 :
//     const label = computed(() => menu.value ? props.closeText : props.openText)
// En Vue 3 `<script setup>`, un binding de setup MASQUE la prop homonyme
// dans le template. Le `:aria-label="t(label)"` de la ligne 7 vaut donc
// TOUJOURS « origam.open » / « origam.close », jamais le libelle du champ.
// => Passer `:label="…"` au select ne corrigerait RIEN ici. Le defaut amont
//    est reel mais appartient a la famille Select : il est remonte au PM,
//    pas repare depuis ce lot.
//
// CORRECTIF RETENU — le patron natif, sans toucher a OrigamSelect :
// le <span> deja visible porte un `id`, et le champ le reference via
// `aria-labelledby`. Mesure prealable : `aria-labelledby` passe bien le
// fallthrough de <OrigamSelect> jusqu'au <input>, et il PRIME sur
// `aria-label` dans le calcul du nom accessible (ARIA accname).
// `<label for>` n'etait pas jouable : l'id du <input> est genere a
// l'interieur d'OrigamSelect et n'est pas expose au pied de table.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamDataTable from '@origam/components/DataTable/OrigamDataTable.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

const HEADERS = [{title: 'Name', key: 'name'}]
const ITEMS = Array.from({length: 30}, (_, i) => ({name: `User ${i + 1}`}))

async function mountTable (props: Record<string, unknown> = {}) {
    const wrapper = mount(OrigamDataTable as never, {
        props: {headers: HEADERS, items: ITEMS, ...props} as never,
        global: {plugins: [createOrigam()]}
    })

    await nextTick()
    await nextTick()

    return wrapper
}

describe('OrigamDataTableFooter — nom accessible du selecteur items-per-page (#371, C6)', () => {
    it('le <span> visible porte un id, et le champ le reference via aria-labelledby', async () => {
        const wrapper = await mountTable()

        const caption = wrapper.find('.origam-data-table-footer__items-per-page span')
        expect(caption.exists()).toBe(true)

        const captionId = caption.attributes('id')
        expect(
            captionId,
            'le <span> « items per page » doit porter un id pour pouvoir etre reference'
        ).toBeTruthy()

        const field = wrapper.find('.origam-data-table-footer__items-per-page input')
        expect(field.exists()).toBe(true)

        expect(
            field.attributes('aria-labelledby'),
            'le champ items-per-page doit tirer son nom accessible du <span> visible'
        ).toBe(captionId)
    })

    it('le nom accessible resolu est le libelle du champ, pas « Open »', async () => {
        const wrapper = await mountTable()

        const caption = wrapper.find('.origam-data-table-footer__items-per-page span')
        const field = wrapper.find('.origam-data-table-footer__items-per-page input')

        const captionId = field.attributes('aria-labelledby')
        expect(captionId, 'sans aria-labelledby le nom accessible retombe sur aria-label').toBeTruthy()

        // Calcul accname simplifie : aria-labelledby PRIME sur aria-label.
        const target = wrapper.find(`#${captionId}`)
        expect(target.exists(), `aucun element ne porte l id ${captionId}`).toBe(true)

        const accessibleName = target.text().trim()

        // ⛔ Valeur ABSOLUE, pas un simple ecart. Et surtout pas la CLE brute :
        // la premiere version de ce test comparait a 'origam.open' et passait
        // AU VERT sur le code casse, parce que le DOM porte la valeur TRADUITE
        // (« Open »), pas la cle. C'est exactement le faux vert que le brief
        // decrit sous « une chaine anglaise en dur et sa traduction sont
        // identiques octet pour octet ».
        expect(accessibleName).toBe('Items per page:')
        expect(accessibleName).not.toBe('Open')

        // Le <span> reference est bien celui qui est visible a l'ecran.
        expect(target.element).toBe(caption.element)
    })

    it('deux tables de la MEME page ne partagent pas l id du libelle', async () => {
        // ⛔ Deux `mount()` separes ne prouveraient RIEN : chaque montage cree
        // une application Vue neuve, dont le compteur d'uid repart de zero —
        // les deux pieds de table recevaient donc le meme `…-v-35` par
        // artefact de harnais, pas par defaut produit. On monte donc les deux
        // tables dans UNE SEULE application, ce qui est le cas reel.
        const Host = {
            components: {OrigamDataTable},
            template: `
                <div>
                    <origam-data-table :headers="headers" :items="items"/>
                    <origam-data-table :headers="headers" :items="items"/>
                </div>
            `,
            data: () => ({headers: HEADERS, items: ITEMS})
        }

        const wrapper = mount(Host as never, {global: {plugins: [createOrigam()]}})
        await nextTick()
        await nextTick()

        const captions = wrapper.findAll(`.origam-data-table-footer__items-per-page > span`)
        expect(captions.length, 'les deux pieds de table doivent etre rendus').toBe(2)

        const [idA, idB] = captions.map((c) => c.attributes('id'))
        expect(idA).toBeTruthy()
        expect(idB).toBeTruthy()
        expect(idA, 'deux tables de la meme page ne doivent pas partager l id du libelle').not.toBe(idB)

        // Et chaque champ pointe bien sur SON propre libelle.
        const fields = wrapper.findAll('.origam-data-table-footer__items-per-page input')
        expect(fields.map((f) => f.attributes('aria-labelledby'))).toEqual([idA, idB])
    })
})
