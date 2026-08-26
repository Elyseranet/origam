/*********************************************************
 * useHover — la prop `hover` est-elle REELLEMENT morte ?
 *
 * @description
 * Le garde `unconsumed-props` a signale 16 NOUVELLES violations
 * `hover` / `hoverClass` juste apres le commit aa1d9f97, qui a
 * reecrit `useHover`. Le message du garde est sans ambiguite :
 * « A NEW entry means a prop was added and nothing reads it. »
 * Seize props mortes d'un coup, ce serait un defaut majeur.
 *
 * @description
 * Hypothese concurrente : le garde est un detecteur STATIQUE, et
 * le composable est passe d'une lecture litterale `props.hover` a
 * une lecture par CLE CALCULEE `(props as any)[prop]`, ou `prop`
 * est un parametre. Un detecteur statique ne resout pas une cle
 * variable — il verrait donc « personne ne lit » alors que la
 * lecture a bien lieu.
 *
 * @description
 * ⛔ CES DEUX HYPOTHESES PRODUISENT LE MEME RAPPORT DE GARDE.
 * Seule une mesure au runtime les separe. Ce fichier est cette
 * mesure : il n'audite pas le code, il fait tourner le composable
 * et regarde ce qui en sort.
 *
 * @description
 * Si ces tests passent, la prop est VIVANTE et c'est le garde qui
 * est aveugle. S'ils echouent, les 16 props sont mortes et c'est
 * une regression a corriger.
 ********************************************************/

import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'

import { useHover } from '@origam/composables/Commons/hover.composable'

/**
 * Hote minimal : declare `hover` / `hoverClass` comme le fait
 * `IHoverProps`, appelle `useHover(props)` exactement comme les
 * 21 sites d'appel reels du catalogue (un seul argument), et
 * expose le resultat dans le DOM.
 */
const HoverHost = defineComponent({
    name: 'ProbeHover',
    props: {
        hover: {type: [Boolean, Object], default: undefined},
        hoverClass: {type: String, default: undefined}
    },
    setup (props) {
        const {isHover, hoverState, hoverClasses, onMouseenter, onMouseleave} = useHover(props)

        return () => h('div', {
            'class': hoverClasses.value,
            'data-is-hover': String(isHover.value),
            'data-has-state': String(hoverState.value !== undefined),
            'onMouseenter': onMouseenter,
            'onMouseleave': onMouseleave
        })
    }
})

describe('useHover — la prop est-elle lue au runtime ?', () => {
    it('hover=true FORCE l etat survole (lecture de la prop booleenne)', () => {
        const wrapper = mount(HoverHost, {props: {hover: true}})

        expect(wrapper.attributes('data-is-hover')).toBe('true')
    })

    it('hover absent laisse l etat au repos — le vrai/faux ne vient pas d un defaut', () => {
        const wrapper = mount(HoverHost)

        expect(wrapper.attributes('data-is-hover')).toBe('false')
    })

    it('hover={enabled:true} FORCE aussi — la forme objet est lue', () => {
        const wrapper = mount(HoverHost, {props: {hover: {enabled: true}}})

        expect(wrapper.attributes('data-is-hover')).toBe('true')
        expect(wrapper.attributes('data-has-state')).toBe('true')
    })

    it('hoverClass est ajoutee a la classe quand l etat est survole', () => {
        const wrapper = mount(HoverHost, {props: {hover: true, hoverClass: 'ma-classe'}})

        expect(wrapper.classes()).toContain('ma-classe')
    })

    it('changer hover APRES le montage change le rendu (la lecture est reactive)', async () => {
        const wrapper = mount(HoverHost, {props: {hover: false}})

        expect(wrapper.attributes('data-is-hover')).toBe('false')

        await wrapper.setProps({hover: true})
        await nextTick()

        expect(wrapper.attributes('data-is-hover')).toBe('true')
    })

    it('mouseenter / mouseleave pilotent l etat quand hover n est pas force', async () => {
        const wrapper = mount(HoverHost)

        await wrapper.trigger('mouseenter')
        expect(wrapper.attributes('data-is-hover')).toBe('true')

        await wrapper.trigger('mouseleave')
        expect(wrapper.attributes('data-is-hover')).toBe('false')
    })
})
