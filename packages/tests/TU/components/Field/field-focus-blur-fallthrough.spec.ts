import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { OrigamField } from '@origam/components'
import { createOrigam } from '@origam/origam'

/*********************************************************
 * OrigamField — `@focus` / `@blur` sur la racine ne recoivent RIEN (C7)
 *
 * @description
 * Le tableau Emits avait bien ete corrige (focus/blur retires : ce ne sont
 * pas des emits declares). Le paragraphe qui le suivait affirmait en
 * revanche que « `@focus` / `@blur` bound on `<origam-field>` work the
 * normal HTML way » via le fallthrough d'attributs. C'est faux, et pour une
 * raison de plateforme, pas d'implementation : la racine d'OrigamField est
 * un `<div>` sans `tabindex`, donc jamais focusable elle-meme, et
 * `focus` / `blur` NE BULLENT PAS (contrairement a `focusin` / `focusout`).
 * Un listener pose par fallthrough sur la racine n'est donc jamais atteint
 * par le focus de l'input imbrique.
 *
 * @description
 * Ce spec est la MESURE de cette affirmation, et le garde-fou contre son
 * retour dans la doc. Le canal reel est `@update:focused` (emit declare via
 * `IFocusEmits`), alimente par les `onFocus` / `onBlur` que le slot
 * `default` fournit au controle.
 ********************************************************/

const SLOT = '<input :id="params.id" class="origam-field__input" @focus="params.onFocus" @blur="params.onBlur">'

const mountField = (attrs: Record<string, unknown> = {}) =>
    mount(OrigamField, {
        props: { label: 'Field label' } as never,
        attrs,
        attachTo: document.body,
        slots: { default: SLOT },
        global: { plugins: [createOrigam()] }
    })

describe('OrigamField — focus / blur on the root', () => {
    it('a root-level @focus / @blur listener is NEVER called when the inner input takes focus', async () => {
        const onFocus = vi.fn()
        const onBlur = vi.fn()
        const wrapper = mountField({ onFocus, onBlur })

        const input = wrapper.find('input').element as HTMLInputElement
        input.focus()
        await nextTick()
        input.blur()
        await nextTick()

        expect(onFocus).toHaveBeenCalledTimes(0)
        expect(onBlur).toHaveBeenCalledTimes(0)

        wrapper.unmount()
    })

    it('the root is a plain <div> with no tabindex — it cannot be focused either', () => {
        const wrapper = mountField()
        const root = wrapper.find('.origam-field')

        expect(root.element.tagName).toBe('DIV')
        expect(root.attributes('tabindex')).toBeUndefined()

        wrapper.unmount()
    })

    it('`update:focused` IS the working channel, and the root reflects it as a class', async () => {
        const wrapper = mountField()

        const input = wrapper.find('input').element as HTMLInputElement
        input.focus()
        await nextTick()

        expect(wrapper.emitted('update:focused')?.at(-1)).toEqual([true])
        expect(wrapper.find('.origam-field').classes()).toContain('origam-field--focused')

        input.blur()
        await nextTick()

        expect(wrapper.emitted('update:focused')?.at(-1)).toEqual([false])
        expect(wrapper.find('.origam-field').classes()).not.toContain('origam-field--focused')

        wrapper.unmount()
    })
})
