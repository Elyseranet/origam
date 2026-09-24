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

    /*********************************************************
     * #781 — la region est desormais un <section>, pas un role
     *
     * @description
     * Sonar signalait « role="region" + tabIndex sur un element non
     * interactif ». La moitie « role » est reelle et se corrige par la
     * balise : un `<section>` PORTE le role `region` des qu'il a un nom
     * accessible (HTML-AAM), et `scrollerLabel` n'est jamais vide — les
     * trois tests ci-dessus en epinglent les trois formes. Le `role`
     * explicite ne faisait que repeter la balise.
     *
     * @description
     * La moitie « tabIndex » est un FAUX POSITIF de la regle, et le test
     * ci-dessous le verrouille : cette boite defile
     * (`overflow-x: auto`), donc elle DOIT etre atteignable au clavier
     * (WCAG 2.1.1, regle axe `scrollable-region-focusable`). Retirer le
     * tabindex echangerait une coquetterie de nommage contre un echec de
     * niveau A.
     ********************************************************/
    it('la zone defilante est un <section> nomme, sans role explicite', () => {
        const wrapper = mountCode({ filename: 'App.vue' })
        const scroller = wrapper.find('.origam-code__scroller')

        expect(scroller.element.tagName).toBe('SECTION')
        expect(scroller.attributes('role')).toBeUndefined()
        // Le nom accessible est ce qui fait qu'un <section> EST une region.
        expect(scroller.attributes('aria-label')).toBe('App.vue, code block, scrollable region')

        wrapper.unmount()
    })

    it('garde tabindex="0" — la zone defile, WCAG 2.1.1 l\'exige', () => {
        const wrapper = mountCode({ filename: 'App.vue' })

        expect(wrapper.find('.origam-code__scroller').attributes('tabindex')).toBe('0')

        wrapper.unmount()
    })
})
