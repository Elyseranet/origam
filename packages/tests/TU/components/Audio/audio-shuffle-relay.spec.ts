/*********************************************************
 * OrigamAudio — update:shuffle est RELAYE, pas v-modelise
 *
 * @description
 * Ce test existe parce que le correctif du lot 4 (garde
 * unemitted-declarations) etait le SEUL des 47 emits de la campagne a
 * avoir ete livre sans preuve. Le relais marchait, mais rien ne le
 * tenait : la prochaine refonte du template l aurait casse en silence.
 *
 * @description
 * Le defaut d origine : `origam-media-controller` emettait bien
 * `update:shuffle`, mais `OrigamAudio` le consommait dans un v-model
 * LOCAL sans le repasser. Or Vue retire inconditionnellement de $attrs
 * tout listener correspondant a un emit declare — donc le
 * `@update:shuffle` du consommateur etait retire ET jamais re-emis. Il
 * ne partait nulle part.
 *
 * @description
 * La mutation qui doit rendre ce test rouge : retirer
 * `emit('update:shuffle', next)` du corps d `onShuffleChange`
 * (OrigamAudio.vue).
 ********************************************************/
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { OrigamAudio } from '@origam/components'
import { createOrigam } from '@origam/origam'

describe('OrigamAudio — relais update:shuffle', () => {
    it('re-emet update:shuffle quand le media-controller enfant le declenche', async () => {
        const wrapper = mount(OrigamAudio, {
            props: { src: 'x.mp3' } as never,
            global: { plugins: [createOrigam()] }
        })

        const controller = wrapper.findComponent({ name: 'OrigamMediaController' })
        expect(controller.exists()).toBe(true)

        controller.vm.$emit('update:shuffle', true)
        await wrapper.vm.$nextTick()

        expect(wrapper.emitted('update:shuffle')).toBeTruthy()
        expect(wrapper.emitted('update:shuffle')![0]).toEqual([true])
    })
})
