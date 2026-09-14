// #550 (critere C1) — `elevation` etait DECLAREE sur `IMessagesProps` (via
// `IElevationProps`), EXPOSEE par un controle de la story
// (`OrigamMessages.story.vue:46`), et lue nulle part : `OrigamMessages.vue`
// n'appelait jamais `useElevation`. `<origam-messages elevation="lg">` ne
// posait donc aucune ombre.
//
// Deux canaux mesures, ceux de la « strategie A » :
//   - la CLASSE, lue avec `wrapper.classes()` ;
//   - la DECLARATION, lue dans le texte brut de la regle `#id{...}` que
//     `useStyle()` injecte dans `<head>`.
//
// ⛔ Aucun `getComputedStyle` : la valeur est un `var(--origam-shadow---*)`,
// et jsdom ne resout jamais un `var()` — il renverrait un defaut fabrique
// qui ressemble a une mesure (cf. CLAUDE.md racine, #398).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { OrigamMessages } from '@origam/components'
import { createOrigam } from '@origam/origam'

const injectedRuleFor = (id: string): string => {
    for (const styleEl of Array.from(document.head.querySelectorAll('style'))) {
        if (styleEl.textContent?.includes(`#${id}`)) return styleEl.textContent
    }

    return ''
}

async function mountMessages (props: Record<string, unknown> = {}) {
    const wrapper = mount(OrigamMessages, {
        attachTo: document.body,
        props: { messages: 'hello', ...props },
        global: { plugins: [createOrigam()] }
    })
    await nextTick()
    await nextTick()

    const root = wrapper.find('.origam-messages')

    return {
        wrapper,
        classes: root.classes(),
        rule: injectedRuleFor(root.attributes('id') ?? '')
    }
}

describe('OrigamMessages — `elevation` peint reellement une ombre (#550)', () => {
    it('sans `elevation`, ni classe `--elevated` ni declaration box-shadow', async () => {
        const { wrapper, classes, rule } = await mountMessages()

        expect(classes.some(c => c.endsWith('--elevated'))).toBe(false)
        expect(rule).not.toContain('box-shadow')
        wrapper.unmount()
    })

    it('`elevation="md"` emet la classe d\'etat, l\'utilitaire, et la declaration token', async () => {
        const { wrapper, classes, rule } = await mountMessages({ elevation: 'md' })

        expect(classes).toContain('origam-messages--elevated')
        expect(classes).toContain('origam--shadow-md')
        expect(rule).toContain('box-shadow: var(--origam-shadow---md)')
        wrapper.unmount()
    })

    // ⛔ Monte-demonte SEQUENTIELLEMENT : `useStyle()` derive l'id de
    // `getUid()`, dont le compteur repart de zero d'un fichier de test a
    // l'autre. Deux instances vivantes en meme temps portent donc le meme
    // `#origam-messages-v-0`, et `injectedRuleFor` renvoie la premiere
    // balise trouvee — celle de la PREMIERE instance. Mesure faussee,
    // constatee sur ce spec meme.
    it('deux echelons distincts produisent deux declarations distinctes', async () => {
        const md = await mountMessages({ elevation: 'md' })
        const mdRule = md.rule
        md.wrapper.unmount()

        const xl = await mountMessages({ elevation: 'xl' })
        const xlRule = xl.rule
        xl.wrapper.unmount()

        expect(mdRule).toContain('box-shadow: var(--origam-shadow---md)')
        expect(xlRule).toContain('box-shadow: var(--origam-shadow---xl)')
        expect(mdRule).not.toBe(xlRule)
    })

    it('un `box-shadow` libre passe tel quel (echappatoire documentee de useElevation)', async () => {
        const { wrapper, rule } = await mountMessages({ elevation: '0 4px 12px rgba(0,0,0,.24)' })

        expect(rule).toContain('box-shadow: 0 4px 12px rgba(0,0,0,.24)')
        wrapper.unmount()
    })
})
