// #550 (critere C1) — `location` etait DECLAREE sur `IBottomNavProps` (via
// `ILayoutItemProps`) et lue NULLE PART : `useLayoutItem` recevait
// `position: computed(() => 'bottom')`, une constante. Passer
// `location="top"` ne produisait donc aucune difference, ni dans le DOM ni
// dans la feuille injectee — exactement le defaut n°1 du CLAUDE.md racine
// (« a documented prop silently does nothing »).
//
// Le verdict se lit dans la regle `#id{...}` que `useStyle()` aplatit et
// injecte dans `<head>` : `useCreateLayout` derive de `position` l'ancre
// (`{[position]: 0}`), puis emet `top` OU `bottom` selon le cote — jamais
// les deux (`top: position !== 'bottom' ? … : undefined`, et le miroir pour
// `bottom`, cf. createLayout.composable.ts:250-251). C'est ce couple
// present/absent qui est mesure ici : il ne peut pas etre produit par
// autre chose que la lecture de `location`.
//
// ⛔ Aucun `getComputedStyle` : sous jsdom il ne resout jamais un `var()` et
// le `<style scoped>` d'un SFC n'est de toute facon jamais injecte (cf.
// CLAUDE.md racine, #398). On lit le texte brut de la regle generee.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { OrigamBottomNav, OrigamLayout } from '@origam/components'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

function mountInLayout (props: Record<string, unknown> = {}) {
    const Host = defineComponent({
        setup () {
            return () => h(OrigamLayout, null, {
                default: () => h(OrigamBottomNav, { modelValue: true, order: 0, ...props })
            })
        }
    })

    return mount(Host, {
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })
}

const injectedRuleFor = (id: string): string => {
    for (const styleEl of Array.from(document.head.querySelectorAll('style'))) {
        if (styleEl.textContent?.includes(`#${id}`)) return styleEl.textContent
    }

    return ''
}

async function ruleFor (props: Record<string, unknown>) {
    const wrapper = mountInLayout(props)
    await nextTick()
    await nextTick()

    const bar = wrapper.find('.origam-bottom-nav')
    const rule = injectedRuleFor(bar.attributes('id') ?? '')
    wrapper.unmount()

    return rule
}

describe('OrigamBottomNav — `location` pilote le cote d\'accroche dans le layout (#550)', () => {
    it('sans `location`, la barre reste ancree en bas (defaut inchange)', async () => {
        const rule = await ruleFor({})

        expect(rule).toMatch(/bottom:\s*0px/)
        expect(rule).not.toMatch(/(^|[;{])\s*top:/)
    })

    it('`location="top"` ancre la barre en haut — `top` emis, `bottom` absent', async () => {
        const rule = await ruleFor({ location: 'top' })

        expect(rule).toMatch(/top:\s*0px/)
        expect(rule).not.toMatch(/(^|[;{])\s*bottom:/)
    })

    it('les deux valeurs ne produisent pas la meme regle', async () => {
        const bottom = await ruleFor({})
        const top = await ruleFor({ location: 'top' })

        expect(top).not.toBe(bottom)
    })

    it('`location="left"` bascule sur l\'axe horizontal — `left` ancre, `height` en calc()', async () => {
        const rule = await ruleFor({ location: 'left' })

        expect(rule).toMatch(/left:\s*0px/)
        expect(rule).toMatch(/height:\s*calc\(100%/)
    })
})
