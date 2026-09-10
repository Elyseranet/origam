/*********************************************************
 * ADR-005 — le 3e argument de `useVModel` dans OrigamFileField
 *
 * @description
 * `OrigamFileField.vue` appelait `useVModel(props, 'modelValue',
 * props.multiple ? [] : null, …)`. Le 3e argument est evalue AU SITE
 * D'APPEL, donc pendant le `setup()` de l'hote — avant le `beforeCreate`
 * ou le resolveur ADR-005 ecrit `instance.props`. La valeur du theme
 * n'etait donc pas encore la, et rien ne relisait ensuite.
 *
 * @description
 * ⛔ RESULTAT MESURE, a ne pas confondre avec une validation du
 * correctif : le defaut est REEL DANS SA FORME mais n'avait AUCUN effet
 * observable. `transformIn` vaut `wrapInArray`, et `wrapInArray(null)`
 * comme `wrapInArray([])` rendent `[]` : les deux amorces sont
 * indiscernables. Le passage au getter `() => props.multiple ? [] : null`
 * a donc ete fait pour se conformer au contrat documente de `useVModel`
 * (#448), PAS pour reparer un comportement casse — ne pas rapporter ce
 * point comme un bug utilisateur repare.
 *
 * @description
 * Ce fichier reste comme FILET : il epingle les deux faits qui rendent le
 * defaut inoffensif. Si `transformIn` cessait un jour de normaliser, la
 * premiere assertion tomberait et le seed redeviendrait discernable.
 ********************************************************/

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamFileField from '@origam/components/FileField/OrigamFileField.vue'
import { createOrigam } from '@origam/origam'
import { wrapInArray } from '@origam/utils/Commons/commons.util'

import type { IOrigamTheme } from '@origam/types'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})

describe('OrigamFileField — amorce de useVModel et resolution de theme', () => {
    it('wrapInArray normalise `null` et `[]` vers la MEME valeur', () => {
        expect(wrapInArray(null)).toEqual([])
        expect(wrapInArray([])).toEqual([])
        expect(wrapInArray(null)).toEqual(wrapInArray([]))
    })

    it('un theme qui pose `multiple` atteint bien le vrai <input>', async () => {
        const theme: IOrigamTheme = {
            name: 'brandx',
            components: { 'origam-file-field': { multiple: true } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })

        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        const wrapper = mount(OrigamFileField, { global: { plugins: [origam] } })

        await nextTick()

        expect(wrapper.find('input[type="file"]').attributes('multiple')).toBeDefined()

        wrapper.unmount()
    })
})
