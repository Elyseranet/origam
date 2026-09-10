// Unit tests for <OrigamCommandPalette> — typography props surface (ITypographyProps).
//
// OrigamCommandPalette renders its content inside <teleport to="body">:
//   - Mount with `attachTo: document.body` so the teleport target exists.
//   - Read inline styles via `document.querySelector()` — wrapper.find() does
//     not cross teleport boundaries.
//   - `hotkey: null` prevents the global keyboard listener from attaching.
//   - `modelValue: true` makes `v-if="isActive"` render both surfaces.
//   - GROUP_COMMANDS carries a `group` field so `groupedResults` produces
//     buckets with labels → `v-if="group.label"` renders `.origam-command-palette__group-title`.
//
// Only `fontSize` has a real visual effect on either surface:
//   __input       → reads --origam-command-palette__input---font-size
//   __group-title → reads --origam-command-palette__group-title---font-size
// Other ITypographyProps (fontWeight, letterSpacing, …) emit their vars but the
// SCSS has no matching rule on these surfaces — they are not exercised here.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import type { ICommand } from '@origam/interfaces'

import OrigamCommandPalette from '@origam/components/CommandPalette/OrigamCommandPalette.vue'
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

// Commands with groups so __group-title renders (v-if="group.label").
const GROUP_COMMANDS: ReadonlyArray<ICommand> = [
    { id: 'nav', label: 'Go home', group: 'Navigation', perform: () => undefined },
    { id: 'act', label: 'Create item', group: 'Actions', perform: () => undefined }
]

function mountPalette (props: Record<string, unknown> = {}) {
    return mount(OrigamCommandPalette, {
        props: {
            modelValue: true,
            commands: GROUP_COMMANDS,
            hotkey: null,
            ...props
        } as never,
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })
}

// Read inline style of .origam-command-palette__input via document.querySelector
// (teleport content is not in the wrapper's DOM subtree).
function inputStyle (props: Record<string, unknown> = {}): string {
    const wrapper = mountPalette(props)
    const style = document.querySelector('.origam-command-palette__input')?.getAttribute('style') || ''
    wrapper.unmount()
    return style
}

// Read inline style of .origam-command-palette__group-title.
function groupTitleStyle (props: Record<string, unknown> = {}): string {
    const wrapper = mountPalette(props)
    const style = document.querySelector('.origam-command-palette__group-title')?.getAttribute('style') || ''
    wrapper.unmount()
    return style
}

// ---------------------------------------------------------------------------
// Surfaces exist
// ---------------------------------------------------------------------------
describe('OrigamCommandPalette — surfaces are present', () => {
    it('renders the __input surface when open', () => {
        const wrapper = mountPalette()
        expect(document.querySelector('.origam-command-palette__input')).not.toBeNull()
        wrapper.unmount()
    })

    it('renders the __group-title surface when open with grouped commands', () => {
        const wrapper = mountPalette()
        expect(document.querySelector('.origam-command-palette__group-title')).not.toBeNull()
        wrapper.unmount()
    })

    it('emits no typography override on __input when no typo prop is set', () => {
        expect(inputStyle()).not.toContain('--origam-command-palette__input---')
    })

    it('emits no typography override on __group-title when no typo prop is set', () => {
        expect(groupTitleStyle()).not.toContain('--origam-command-palette__group-title---')
    })
})

// ---------------------------------------------------------------------------
// __input — fontSize
// ---------------------------------------------------------------------------
describe('OrigamCommandPalette — __input fontSize', () => {
    it('fontSize="xl" sets --origam-command-palette__input---font-size to the xl token', () => {
        expect(inputStyle({ fontSize: 'xl' })).toContain(
            '--origam-command-palette__input---font-size: var(--origam-font__size---xl)'
        )
    })

    it('fontSize="sm" sets --origam-command-palette__input---font-size to the sm token', () => {
        expect(inputStyle({ fontSize: 'sm' })).toContain(
            '--origam-command-palette__input---font-size: var(--origam-font__size---sm)'
        )
    })

    it('emits no font-size override on __input when fontSize is unset', () => {
        expect(inputStyle()).not.toContain('---font-size:')
    })
})

// ---------------------------------------------------------------------------
// __group-title — fontSize
// ---------------------------------------------------------------------------
describe('OrigamCommandPalette — __group-title fontSize', () => {
    it('fontSize="xl" sets --origam-command-palette__group-title---font-size to the xl token', () => {
        expect(groupTitleStyle({ fontSize: 'xl' })).toContain(
            '--origam-command-palette__group-title---font-size: var(--origam-font__size---xl)'
        )
    })

    it('fontSize="sm" sets --origam-command-palette__group-title---font-size to the sm token', () => {
        expect(groupTitleStyle({ fontSize: 'sm' })).toContain(
            '--origam-command-palette__group-title---font-size: var(--origam-font__size---sm)'
        )
    })

    it('emits no font-size override on __group-title when fontSize is unset', () => {
        expect(groupTitleStyle()).not.toContain('---font-size:')
    })
})

// ---------------------------------------------------------------------------
// i18n — deux chaînes anglaises en dur en valeur par défaut de prop (#404, C8)
// ---------------------------------------------------------------------------
//
// `placeholder: 'Search…'` et `emptyText: 'No results'` étaient écrites en
// dur dans `withDefaults`. Le placeholder est doublement visible : il remplit
// l'input ET sert d'`aria-label` au combobox.
//
// Asserté sous `fr` contre l'adaptateur de locale RÉEL : sous `en`, la chaîne
// en dur et sa traduction sont identiques octet pour octet, donc un test `en`
// resterait vert avec le défaut intact.
//
// La compatibilité ascendante tient au repli de l'adaptateur : `t()` rend la
// clé inchangée quand elle est absente du catalogue, donc un consommateur qui
// passe du texte littéral (`placeholder="Chercher un client"`) le voit rendu
// tel quel — c'est le cas couvert par le dernier test.

function mountPaletteLocalised (locale: string, props: Record<string, unknown> = {}) {
    return mount(OrigamCommandPalette, {
        props: {
            modelValue: true,
            commands: GROUP_COMMANDS,
            hotkey: null,
            ...props
        } as never,
        attachTo: document.body,
        global: { plugins: [createOrigam({ locale: { locale } } as never)] }
    })
}

// ⛔ `wrapper.unmount()` ne retire PAS le contenu téléporté dans ce harnais :
// mesuré, 4 `.origam-command-palette__input` empilés dans `document.body` après
// quatre tests. `document.querySelector` rendait alors le noeud le PLUS ANCIEN,
// donc l'assertion portait sur un montage précédent — un rouge qui ressemble
// exactement à un défaut produit. On repart d'un body propre à chaque cas.
function wipeTeleportedPalettes (): void {
    document.querySelectorAll('.origam-command-palette, .origam-command-palette__backdrop')
        .forEach(node => node.remove())
}

describe('OrigamCommandPalette — placeholder et emptyText traduisibles (#404, C8)', () => {
    beforeEach(wipeTeleportedPalettes)
    afterEach(wipeTeleportedPalettes)

    it('traduit le placeholder sous fr (échoue sur une chaîne en dur)', () => {
        const wrapper = mountPaletteLocalised('fr')
        const inputs = document.querySelectorAll('.origam-command-palette__input')

        expect(inputs.length).toBe(1)
        expect(inputs[0].getAttribute('placeholder')).toBe('Rechercher…')
        wrapper.unmount()
    })

    // Le `role="combobox"` est porté par l'`<input>` lui-même et tire son nom
    // de son `placeholder` — c'est la listbox qui porte un `aria-label`, et il
    // reprend la même prop. Les deux surfaces sont donc couvertes par la même
    // traduction : le placeholder rendu (test précédent) et ce libellé-ci.
    it('traduit l aria-label de la listbox, qui reprend la même prop', () => {
        const wrapper = mountPaletteLocalised('fr')
        const listboxes = document.querySelectorAll('[role="listbox"]')

        expect(listboxes.length).toBe(1)
        expect(listboxes[0].getAttribute('aria-label')).toBe('Rechercher…')
        wrapper.unmount()
    })

    it('traduit emptyText sous fr quand la recherche ne rend rien', async () => {
        const wrapper = mountPaletteLocalised('fr', { commands: [] })
        await nextTick()

        const empties = document.querySelectorAll('.origam-command-palette__empty')

        expect(empties.length).toBe(1)
        expect(empties[0].textContent?.trim()).toBe('Aucun résultat')
        wrapper.unmount()
    })

    it('rend tel quel un texte littéral fourni par le consommateur', () => {
        const wrapper = mountPaletteLocalised('fr', { placeholder: 'Chercher un client' })
        const inputs = document.querySelectorAll('.origam-command-palette__input')

        expect(inputs.length).toBe(1)
        expect(inputs[0].getAttribute('placeholder')).toBe('Chercher un client')
        wrapper.unmount()
    })
})
