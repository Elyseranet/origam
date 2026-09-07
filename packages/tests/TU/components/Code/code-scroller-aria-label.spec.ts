import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { OrigamCode } from '@origam/components'
import { createOrigam } from '@origam/origam'

/*********************************************************
 * OrigamCode — nom accessible de la zone defilante (critere C7)
 *
 * @description
 * La doc annoncait « The container carries `role="region"` and an
 * `aria-label` that includes the filename (or language fallback) ». Le role
 * et le tabindex existaient bien, mais le nom etait la constante
 * `origam.code.scroller_aria_label` — « Code block, scrollable region » —
 * pour TOUTES les instances : ni `filename` ni `lang` n'etait jamais
 * interpole nulle part dans le composant.
 *
 * @description
 * C'est le code qui a ete corrige plutot que la doc : cinq blocs sur une
 * page produisaient cinq reperes rigoureusement homonymes dans la liste
 * d'un lecteur d'ecran, ce qui vide le `role="region"` de son interet. Le
 * DS servait deja le besoin (`t()` interpole `{param}`, cf.
 * `origam.qr_code.aria_label`).
 *
 * @description
 * `aria-label` est un ATTRIBUT, lu par `wrapper.attributes()` — aucun
 * `getComputedStyle`, donc aucune exposition au piege jsdom/`var()`.
 ********************************************************/

const mountCode = (props: Record<string, unknown>) =>
    mount(OrigamCode, {
        props: { code: 'const a = 1', ...props } as never,
        global: { plugins: [createOrigam()] }
    })

const scrollerLabel = (wrapper: ReturnType<typeof mountCode>) =>
    wrapper.find('.origam-code__scroller').attributes('aria-label')

describe('OrigamCode — .origam-code__scroller aria-label', () => {
    it('names the region with the filename when one is passed', () => {
        const wrapper = mountCode({ filename: 'App.vue', lang: 'vue' })

        expect(scrollerLabel(wrapper)).toBe('App.vue, code block, scrollable region')

        wrapper.unmount()
    })

    it('falls back to the language when there is no filename', () => {
        const wrapper = mountCode({ lang: 'typescript' })

        expect(scrollerLabel(wrapper)).toBe('typescript code block, scrollable region')

        wrapper.unmount()
    })

    it('falls back to the generic name for a plaintext block with no filename', () => {
        const wrapper = mountCode({})

        expect(scrollerLabel(wrapper)).toBe('Code block, scrollable region')

        wrapper.unmount()
    })

    it('two blocks with different filenames get DIFFERENT accessible names', () => {
        const first = mountCode({ filename: 'App.vue' })
        const second = mountCode({ filename: 'main.ts' })

        expect(scrollerLabel(first)).not.toBe(scrollerLabel(second))

        first.unmount()
        second.unmount()
    })

    it('keeps role="region" and tabindex="0" on that same element', () => {
        const wrapper = mountCode({ filename: 'App.vue' })
        const scroller = wrapper.find('.origam-code__scroller')

        expect(scroller.attributes('role')).toBe('region')
        expect(scroller.attributes('tabindex')).toBe('0')

        wrapper.unmount()
    })
})
