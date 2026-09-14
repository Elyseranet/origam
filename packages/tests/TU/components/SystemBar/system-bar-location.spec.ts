// #550 (critere C1) — `location` etait DECLAREE sur `ISystemBarProps` (via
// `ILayoutItemProps`) et lue NULLE PART : `useLayoutItem` recevait
// `position: shallowRef('top')`, une constante. `<origam-system-bar
// location="bottom">` restait donc ancree en haut, sans erreur ni
// avertissement.
//
// La mesure porte sur la regle `#id{...}` que `useStyle()` injecte dans
// `<head>` : `useCreateLayout` emet `top` OU `bottom` selon `position`,
// jamais les deux (createLayout.composable.ts:250-251). Ce couple
// present/absent ne peut etre produit que par la lecture de `location`.
//
// ⛔ Aucun `getComputedStyle` (jsdom ne resout pas `var()`, #398) — texte
// brut de la regle generee.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { OrigamLayout, OrigamSystemBar } from '@origam/components'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

function mountInLayout (props: Record<string, unknown> = {}) {
    const Host = defineComponent({
        setup () {
            return () => h(OrigamLayout, null, {
                default: () => h(OrigamSystemBar, { order: 0, ...props })
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

    const bar = wrapper.find('.origam-system-bar')
    const rule = injectedRuleFor(bar.attributes('id') ?? '')
    wrapper.unmount()

    return rule
}

describe('OrigamSystemBar — `location` pilote le cote d\'accroche dans le layout (#550)', () => {
    it('sans `location`, la barre reste ancree en haut (defaut inchange)', async () => {
        const rule = await ruleFor({})

        expect(rule).toMatch(/top:\s*0px/)
        expect(rule).not.toMatch(/(^|[;{])\s*bottom:/)
    })

    it('`location="bottom"` ancre la barre en bas — `bottom` emis, `top` absent', async () => {
        const rule = await ruleFor({ location: 'bottom' })

        expect(rule).toMatch(/bottom:\s*0px/)
        expect(rule).not.toMatch(/(^|[;{])\s*top:/)
    })

    it('les deux valeurs ne produisent pas la meme regle', async () => {
        const top = await ruleFor({})
        const bottom = await ruleFor({ location: 'bottom' })

        expect(bottom).not.toBe(top)
    })

    it('`location="right"` bascule sur l\'axe horizontal — `right` ancre, `height` en calc()', async () => {
        const rule = await ruleFor({ location: 'right' })

        expect(rule).toMatch(/right:\s*0px/)
        expect(rule).toMatch(/height:\s*calc\(100%/)
    })

    // #550 — sur un ancrage horizontal, `useCreateLayout` derive `width` de
    // `elementSize`. `explicitElementSize` restait `undefined` sans prop
    // `height` (contrat #440-3, ecrit pour l'ancrage VERTICAL) : aucune
    // largeur n'etait ecrite et la regle scopee `width: var(--origam-system-
    // bar---width, 100%)` reprenait la main. Mesure Playwright avant
    // correctif : width 594px au lieu de 24px.
    it('`location="left"` ecrit l\'epaisseur en `width`, meme sans prop `height`', async () => {
        const rule = await ruleFor({ location: 'left' })

        expect(rule).toMatch(/width:\s*24px/)
    })

    it('en ancrage vertical, aucune largeur literale n\'est forcee (contrat #440-3 intact)', async () => {
        const rule = await ruleFor({})

        expect(rule).not.toMatch(/width:\s*24px/)
        expect(rule).toMatch(/width:\s*calc\(100%/)
    })

    it('`window` epaissit la barre horizontale a 32px', async () => {
        const rule = await ruleFor({ location: 'left', window: true })

        expect(rule).toMatch(/width:\s*32px/)
    })
})
