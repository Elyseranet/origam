// VAGUE 3 — critere C5 sur la famille Avatar (+ Card, meme constat au
// classeur) : « `update:hover` est declare dans l'interface d'emits et
// demontre par une Variant de story, mais emis NULLE PART ».
//
// Ce fichier VERIFIE le constat au lieu de le croire. Il monte chaque
// composant, declenche un vrai `mouseenter` / `mouseleave` sur la racine,
// et lit `wrapper.emitted()`.
//
// Le constat datait du 2026-09-01. Depuis, les trois composants sont passes
// sur `useStateFlag(props, {state: 'hover'})`, dont `set()` / `unset()`
// ecrivent a travers le v-model — ce qui emet `update:hover`. Si ces tests
// sont verts, le constat C5 est PERIME pour ces composants.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamAvatar from '@origam/components/Avatar/OrigamAvatar.vue'
import OrigamAvatarGroup from '@origam/components/Avatar/OrigamAvatarGroup.vue'
import OrigamCard from '@origam/components/Card/OrigamCard.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

const CASES: Array<[string, unknown, Record<string, unknown>]> = [
    ['OrigamAvatar', OrigamAvatar, {text: 'AB'}],
    ['OrigamAvatarGroup', OrigamAvatarGroup, {}]
]

describe.each(CASES)('%s — update:hover est reellement emis (C5)', (name, component, props) => {
    it('mouseenter emet update:hover=true, mouseleave emet false', async () => {
        const wrapper = mount(component as never, {
            props: props as never,
            global: {plugins: [createOrigam()]}
        })

        await nextTick()

        await wrapper.trigger('mouseenter')
        await nextTick()

        const afterEnter = wrapper.emitted('update:hover')
        expect(
            afterEnter,
            `${name} : aucun update:hover apres mouseenter — la prop serait declarative seulement`
        ).toBeTruthy()

        // ⛔ Valeur ABSOLUE, pas « il s'est passe quelque chose ».
        expect(afterEnter?.[0]).toEqual([true])

        await wrapper.trigger('mouseleave')
        await nextTick()

        const afterLeave = wrapper.emitted('update:hover')
        expect(afterLeave?.length, `${name} : mouseleave doit emettre a son tour`).toBe(2)
        expect(afterLeave?.[1]).toEqual([false])
    })
})

/*********************************************************
 * OrigamCard — C5 : RESOLU par #641 (option (b) retenue par l'utilisateur)
 *
 * @description
 * Ce bloc documentait initialement un defaut confirme et laisse en attente
 * d'arbitrage : Card n'emettait JAMAIS `update:hover` sous le theme `origam`,
 * contrairement a Avatar / AvatarGroup ci-dessus. Mesure a l'epoque (`develop`
 * @ a581bfff) :
 *
 *   Card   → emitted keys = ["mouseenter"]              update:hover absent
 *   Avatar → emitted keys = ["update:hover","mouseenter"]  update:hover = [[true]]
 *
 * @description
 * CAUSE RACINE, mesuree et non supposee. `isHoverable` vaut
 * `!props.disabled && !props.flat` (OrigamCard.vue) et ne sert qu'a decider
 * si `@mouseenter` / `@mouseleave` sont bindes du tout — un handler
 * `undefined` retire l'ecouteur natif. Le THEME DE BASE fixait
 * `flat: true` sur chaque carte (`themes/origam.theme.ts:187` et `:353`,
 * bloc `'origam-card'`), valeur qui atterrissait sur `props.flat` par le
 * resolveur ADR-005 — `isHoverable` etait donc FAUX pour toute carte par
 * defaut.
 *
 * @description
 * Trois options avaient ete presentees au PM :
 *   (a) ecouteurs sur `!disabled` + peinture regatee sur `!flat` ;
 *   (b) retirer `flat: true` du theme de base ;
 *   (c) statu quo + retirer `update:hover` de `ICardEmits`, de la story
 *       et de la doc.
 * **Decision utilisateur (#641) : option (b).** `flat: true` a ete retire
 * des deux blocs (`origamLightTheme`/`origamDarkTheme`) de
 * `origam.theme.ts`. Le couplage `flat`/`isHoverable` dans le composant
 * n'a PAS change — seul le defaut de theme change, ce qui restaure
 * `update:hover` pour toute carte qui ne passe pas explicitement
 * `flat: true`. Consequence visuelle acceptee : toutes les cartes du
 * catalogue regagnent `box-shadow: var(--origam-shadow---sm)`
 * (`light.css:153`), puisque `flat` etait ce qui neutralisait cette ombre
 * de base (`elevation` ne fait qu'AJOUTER une ombre, jamais en retirer).
 * Le test ci-dessous verrouille le comportement corrige.
 ********************************************************/
describe('OrigamCard — update:hover est reellement emis (C5, #641)', () => {
    it('mouseenter emet update:hover=true, mouseleave emet false, sous le theme origam reel', async () => {
        const wrapper = mount(OrigamCard, {
            props: { title: 'X' },
            global: { plugins: [createOrigam()] }
        })

        await nextTick()

        await wrapper.trigger('mouseenter')
        await nextTick()

        const afterEnter = wrapper.emitted('update:hover')
        expect(
            afterEnter,
            'OrigamCard : aucun update:hover apres mouseenter sous le theme origam reel'
        ).toBeTruthy()
        expect(afterEnter?.[0]).toEqual([true])

        await wrapper.trigger('mouseleave')
        await nextTick()

        const afterLeave = wrapper.emitted('update:hover')
        expect(afterLeave?.length, 'OrigamCard : mouseleave doit emettre a son tour').toBe(2)
        expect(afterLeave?.[1]).toEqual([false])
    })
})
