/*********************************************************
 * #421/#422 — l'id du consommateur n'atteint pas la racine d'<OrigamField>
 *
 * @description
 * Mesure du PM : `mount(OrigamField, { props: { id: 'my-field' } })` rend une
 * racine `origam-field-0`. La racine lie `:id="styleId"`, l'id de style
 * genere par `useStyle(fieldStyles)` appele SANS son second argument.
 *
 * @description
 * ⛔ VARIANTE DE #381 QUE SON GARDE NE VERRAIT PAS. #381 decrit une
 * HOMONYMIE ou un local masque `props.id` a l'insu de l'auteur. Ici c'est
 * l'inverse : l'auteur a RENOMME la variable en `const {id: styleId} =
 * useStyle(...)` PRECISEMENT pour eviter la collision avec le
 * `const id = computed(...)`, et le template racine lie simplement la
 * mauvaise des deux. Il n'y a aucune homonymie a detecter.
 *
 * @description
 * ⛔ LA CORRECTION EVIDENTE EST FAUSSE, et c'est le coeur de ce fichier.
 * Lier `:id="id"` sur la racine — la correction « naturelle » — fabrique
 * DEUX elements de meme id : `props.id` est deja porte par le vrai
 * `<input>` (via `slotProps.id`) et sert de cible aux `for=` des deux
 * labels. Le meme piege a ete mesure sur `OrigamInput` (#421,
 * `input-root-id-421.spec.ts`), ou six consommateurs de la famille
 * auraient pris un id duplique. La racine doit donc porter un id DERIVE :
 * `${props.id}-field`, adressable et deterministe, jamais egal.
 ********************************************************/

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamField from '@origam/components/Field/OrigamField.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false, media: query, onchange: null,
            addListener: vi.fn(), removeListener: vi.fn(),
            addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
        }))
    })
})

const SENTINEL = 'email'

const mountField = (props: Record<string, unknown> = {}) => mount(OrigamField, {
    props: props as never,
    slots: { default: '<input class="probe-control" type="text">' },
    global: { plugins: [createOrigam()] }
})

describe('OrigamField — la racine porte un id DERIVE de celui du consommateur', () => {
    it('rend `${props.id}-field` sur la racine quand un id est fourni', () => {
        const wrapper = mountField({ id: SENTINEL })

        expect(wrapper.find('.origam-field').attributes('id')).toBe(`${SENTINEL}-field`)

        wrapper.unmount()
    })

    it('garde un id genere non vide quand le consommateur n en fournit aucun', () => {
        const wrapper = mountField()
        const rootId = wrapper.find('.origam-field').attributes('id')

        expect(rootId).toBeTruthy()
        expect(rootId).not.toBe('undefined-field')

        wrapper.unmount()
    })
})

describe('OrigamField — la derivation ne casse pas le pairage label/controle', () => {
    it('n introduit AUCUN id duplique dans l arbre rendu', () => {
        const wrapper = mountField({ id: SENTINEL, label: 'Adresse e-mail' })

        const ids = wrapper.findAll('[id]').map(el => el.attributes('id'))

        expect(ids.length).toBeGreaterThan(1)
        expect(new Set(ids).size).toBe(ids.length)

        wrapper.unmount()
    })

    it('laisse l id du consommateur a la cible des `for=` des labels', () => {
        const wrapper = mountField({ id: SENTINEL, label: 'Adresse e-mail' })

        const labels = wrapper.findAll('label')

        expect(labels.length).toBeGreaterThan(0)

        for (const label of labels) {
            expect(label.attributes('for')).toBe(SENTINEL)
        }

        wrapper.unmount()
    })
})
