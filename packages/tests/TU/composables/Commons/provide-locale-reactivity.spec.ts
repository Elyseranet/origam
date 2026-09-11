// C3 du classeur, ligne 150 — `provideLocale` : ses retours sont-ils reactifs,
// ou figes au setup ?
//
// La question etait ouverte (« a determiner ») parce qu'elle ne se lit pas dans
// `provideLocale` lui-meme : celui-ci delegue a `locale.provide(props)`, qui
// delegue a `useProvided`, dans `utils/Commons/locale.util.ts`. C'est la que la
// reponse se trouve, et elle demande une mesure plutot qu'une lecture.
//
// ⛔ Ce que `useProvided` fait aujourd'hui :
//
//     const internal = useVModel(props, prop)
//     internal.value = props[prop] ?? provided.value      // <- au setup
//     watch(provided, v => { if (props[prop] == null) internal.value = v })
//
// Deux canaux de changement existent, et un seul est surveille. Le `watch`
// suit la valeur HERITEE (`provided`) ; rien ici ne suit `props[prop]`. Mais
// `useVModel` en pose un de son cote — ce spec verifie que ce relais tient
// vraiment, au lieu de le supposer depuis le source.
//
// ⛔ Le point delicat est l'affectation eager de la deuxieme ligne. `useVModel`
// a ete rendu PARESSEUX exactement pour ADR-005 : son ref part `UNSEEDED` et ne
// prend sa valeur qu'a la premiere lecture, apres que le resolveur de theme a
// ecrit sur `instance.props` en `beforeCreate`. Ecrire `internal.value` dans le
// corps du setup, comme ici, ressort de cet etat immediatement — donc annule la
// protection. C'est cette hypothese que le dernier bloc met a l'epreuve.

import { describe, expect, it } from 'vitest'
import { computed, defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { useProvided } from '@origam/utils/Commons/locale.util'

/**
 * Monte un hote qui appelle `useProvided` et rend la valeur courante.
 * `provided` est la valeur « heritee » ; `locale` la prop du consommateur.
 */
const mountProvided = (initial: Record<string, unknown>, provided = ref('herite')) => {
    const seen = ref<unknown>(null)

    const wrapper = mount(defineComponent({
        props: { locale: { type: String, default: undefined } },
        setup (props) {
            const value = useProvided(props as never, 'locale', provided)

            seen.value = value

            return () => h('div', String(value.value))
        }
    }), { props: initial })

    return { wrapper, provided, text: () => wrapper.text() }
}

describe('useProvided — le canal HERITE', () => {
    it('sans prop, la valeur heritee est adoptee', () => {
        expect(mountProvided({}).text()).toBe('herite')
    })

    it('⛔ un changement de la valeur heritee est suivi', async () => {
        const { provided, wrapper, text } = mountProvided({})

        provided.value = 'herite-2'
        await nextTick()
        await wrapper.vm.$nextTick()

        // C'est le `watch(provided, …)` explicite de `useProvided`.
        expect(text()).toBe('herite-2')
    })

    it('la prop du consommateur l\'emporte sur la valeur heritee', () => {
        expect(mountProvided({ locale: 'propre' }).text()).toBe('propre')
    })

    it('une valeur heritee qui change n\'ecrase PAS une prop explicite', async () => {
        const { provided, wrapper, text } = mountProvided({ locale: 'propre' })

        provided.value = 'herite-2'
        await nextTick()
        await wrapper.vm.$nextTick()

        // La garde `if (props[prop] == null)` du watch existe pour ca.
        expect(text()).toBe('propre')
    })
})

describe('useProvided — le canal PROP, celui que `useProvided` ne surveille pas lui-meme', () => {
    it('⛔ un changement de la prop est tout de meme suivi', async () => {
        const { wrapper, text } = mountProvided({ locale: 'fr' })

        await wrapper.setProps({ locale: 'en' })
        await nextTick()

        // `useProvided` n'a aucun watch sur `props[prop]`. Si cette assertion
        // passe, c'est que le relais vient de `useVModel`, qui en pose un dans
        // son `useToggleScope(() => !isControlled.value, …)`. Si elle tombe, la
        // valeur est figee au setup et C3 vaut « defaut ».
        expect(text()).toBe('en')
    })

    it('⛔ la prop qui repasse a undefined rend la main a l\'heritage', async () => {
        const { wrapper, provided } = mountProvided({ locale: 'fr' })

        provided.value = 'herite-3'
        await wrapper.setProps({ locale: undefined })
        await nextTick()

        // C'est l'assertion qui a trouve le defaut. Avant le correctif elle
        // rendait la chaine « undefined » : le watch de `useVModel` recopie la
        // nouvelle valeur de la prop telle quelle, et le watch sur `provided`
        // ne part pas puisque c'est la PROP qui a bouge, pas l'heritage.
        // Un consommateur ecrivant `:locale="choix || undefined"` pour dire
        // « reprends celle du parent » voyait donc le mot undefined a l'ecran.
        expect(wrapper.text()).toBe('herite-3')
    })

    it('elle rend la main a la valeur heritee COURANTE, pas a celle du montage', async () => {
        const { wrapper, provided } = mountProvided({ locale: 'fr' })

        await wrapper.setProps({ locale: undefined })
        await nextTick()
        provided.value = 'herite-tardif'
        await nextTick()
        await wrapper.vm.$nextTick()

        // Une fois la prop relachee, le canal herite doit reprendre son role
        // normal — sinon on aurait juste deplace le gel d'un cran.
        expect(wrapper.text()).toBe('herite-tardif')
    })
})

describe('useProvided — la valeur retournee est bien un ref, pas un instantane', () => {
    it('⛔ elle reste consultable a travers un computed exterieur', async () => {
        const provided = ref('a')
        let derived: ReturnType<typeof computed<string>> | null = null

        const wrapper = mount(defineComponent({
            props: { locale: { type: String, default: undefined } },
            setup (props) {
                const value = useProvided(props as never, 'locale', provided)

                derived = computed(() => `[${value.value}]`)

                return () => h('div', derived!.value)
            }
        }))

        expect(wrapper.text()).toBe('[a]')

        provided.value = 'b'
        await nextTick()
        await wrapper.vm.$nextTick()

        // Un retour fige au setup rendrait toujours `[a]` : le computed
        // exterieur n'aurait aucune dependance a invalider.
        expect(wrapper.text()).toBe('[b]')
    })
})
