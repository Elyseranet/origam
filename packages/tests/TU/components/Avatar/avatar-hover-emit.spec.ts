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
 * OrigamCard — C5 CONFIRME EN DEFAUT, en attente d'arbitrage
 *
 * @description
 * Contrairement a Avatar / AvatarGroup, Card n'emet JAMAIS `update:hover`,
 * et sa surface de survol est entierement inerte. Mesure (meme harnais que
 * ci-dessus, `develop` @ a581bfff) :
 *
 *   Card   → emitted keys = ["mouseenter"]              update:hover absent
 *   Avatar → emitted keys = ["update:hover","mouseenter"]  update:hover = [[true]]
 *
 * @description
 * CAUSE RACINE, mesuree et non supposee. `isHoverable` vaut
 * `!props.disabled && !props.flat` (OrigamCard.vue:337) et ne sert qu'a
 * decider si `@mouseenter` / `@mouseleave` sont bindes du tout — un
 * handler `undefined` retire l'ecouteur natif. Or le THEME DE BASE fixe
 * `flat: true` sur chaque carte (`themes/origam.theme.ts:187` et `:353`,
 * bloc `'origam-card'`), valeur qui atterrit sur `props.flat` par le
 * resolveur ADR-005. `isHoverable` est donc FAUX pour toute carte par
 * defaut : classe rendue mesuree = `origam-card origam-card--flat …`.
 * Lire `withDefaults` seul (`{ripple, density, tag}`) laisserait croire
 * que `flat` est `undefined` — c'est le piege ADR-005 en vrai.
 *
 * @description
 * ⛔ POURQUOI CE LOT NE LE CORRIGE PAS. Le correctif evident (binder les
 * ecouteurs sur `!disabled`) n'est pas neutre : `useStateFlag.classes`
 * pousse `origam-card--hover` — EXACTEMENT la classe que la regle SCSS
 * `&--hover` (ligne 800) utilise pour peindre `cursor: pointer` et
 * l'overlay `:before`. Delier l'ecouteur de la peinture change donc le
 * rendu au survol de TOUTES les cartes, et `<OrigamDialog>` delegue la
 * totalite de son rendu a `<OrigamCard>` sans figurer dans ce lot. Il
 * faut trancher entre :
 *   (a) ecouteurs sur `!disabled` + peinture regatee sur `!flat` —
 *       restaure l'emit et les overrides `hover={…}`, change le survol
 *       des cartes plates qui passent un objet `hover` ;
 *   (b) retirer `flat: true` du theme de base — toutes les cartes
 *       gagnent une elevation, blast radius visuel large ;
 *   (c) statu quo + retirer `update:hover` de `ICardEmits`, de la story
 *       et de la doc — assumer que Card n'est pas survolable.
 * Remonte au PM. Aucun test rouge n'est laisse dans la suite.
 ********************************************************/
