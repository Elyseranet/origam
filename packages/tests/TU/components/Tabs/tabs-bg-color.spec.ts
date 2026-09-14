// #550 (critere C1) — `bgColor` etait DECLAREE sur `ITabsProps` (via
// `IBgColorProps`), EXPOSEE par DEUX controles de la story
// (`OrigamTabs.story.vue:32` et `:130`), DOCUMENTEE
// (`OrigamTabs.md:110`)… et lue nulle part. Le tablist restait sur son
// `--origam-tabs---background-color` quelle que soit la valeur passee.
// Seul `color` etait lu, et uniquement pour etre re-diffuse aux
// `<origam-tab>` enfants via `slotDefaults` — jamais pour peindre.
//
// Deux canaux mesures (« strategie A ») : la classe utilitaire via
// `wrapper.classes()`, et la declaration via le texte brut de la regle
// `#id{...}` injectee par `useStyle()`.
//
// ⛔ Le token consomme est verifie NOMMEMENT, pas seulement « une valeur
// non vide » : c'est le piege dit « motif list », deja trouve sur cette
// famille — une variable ecrite sous deux grammaires qui ne se rencontrent
// jamais, ou le `fallback` fait tout le travail et masque la panne.
// `--origam-color__action--primary---bg` est bien declare
// (`assets/css/tokens/light.css`), et c'est celui-la qui doit sortir.
//
// ⛔ Aucun `getComputedStyle` : la valeur est un `var()`, invisible a jsdom
// (CLAUDE.md racine, #398).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { OrigamTab, OrigamTabs } from '@origam/components'
import { createOrigam } from '@origam/origam'

const injectedRuleFor = (id: string): string => {
    for (const styleEl of Array.from(document.head.querySelectorAll('style'))) {
        if (styleEl.textContent?.includes(`#${id}`)) return styleEl.textContent
    }

    return ''
}

async function mountTabs (props: Record<string, unknown> = {}) {
    const wrapper = mount(OrigamTabs, {
        attachTo: document.body,
        props,
        slots: { default: () => [h(OrigamTab, { value: 'a' }, () => 'A'), h(OrigamTab, { value: 'b' }, () => 'B')] },
        global: { plugins: [createOrigam()] }
    })
    await nextTick()
    await nextTick()

    const root = wrapper.find('.origam-tabs')

    return {
        wrapper,
        classes: root.classes(),
        rule: injectedRuleFor(root.attributes('id') ?? '')
    }
}

describe('OrigamTabs — `bgColor` peint reellement le tablist (#550)', () => {
    it('sans `bgColor`, aucune classe utilitaire ni declaration background-color', async () => {
        const { wrapper, classes, rule } = await mountTabs()

        expect(classes.some(c => c.startsWith('origam--bg-'))).toBe(false)
        expect(rule).not.toContain('background-color')
        wrapper.unmount()
    })

    it('`bgColor="primary"` emet l\'utilitaire ET la declaration du token DECLARE', async () => {
        const { wrapper, classes, rule } = await mountTabs({ bgColor: 'primary' })

        expect(classes).toContain('origam--bg-primary')
        expect(rule).toContain('background-color: var(--origam-color__action--primary---bg)')
        wrapper.unmount()
    })

    it('la paire de contraste suit : le `color:` associe est emis avec la surface', async () => {
        const { wrapper, rule } = await mountTabs({ bgColor: 'primary' })

        expect(rule).toContain('color: var(--origam-color__action--primary---fg)')
        wrapper.unmount()
    })

    // Monte-demonte SEQUENTIELLEMENT : `useStyle()` derive son id de
    // `getUid()`, dont le compteur repart de zero par fichier de test. Deux
    // instances vivantes en meme temps partagent le meme `#id` et
    // `injectedRuleFor` renverrait la regle de la PREMIERE.
    it('deux intentions distinctes produisent deux declarations distinctes', async () => {
        const primary = await mountTabs({ bgColor: 'primary' })
        const primaryRule = primary.rule
        primary.wrapper.unmount()

        const success = await mountTabs({ bgColor: 'success' })
        const successRule = success.rule
        success.wrapper.unmount()

        expect(primaryRule).toContain('var(--origam-color__action--primary---bg)')
        expect(successRule).toContain('var(--origam-color__feedback--success---bg)')
        expect(primaryRule).not.toBe(successRule)
    })

    it('une couleur CSS libre est preservee telle quelle, sans classe utilitaire', async () => {
        const { wrapper, classes, rule } = await mountTabs({ bgColor: '#ff00aa' })

        expect(classes.some(c => c.startsWith('origam--bg-'))).toBe(false)
        expect(rule).toContain('background-color: #ff00aa')
        wrapper.unmount()
    })
})
