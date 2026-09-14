// #547 — le contrat clavier de la zone prepend/append d'OrigamExpansionPanelHeader.
//
// ## Le défaut
//
// Les deux `<span>` `__prepend` / `__append` portaient un `@click` — donc
// `click:prepend` / `click:append`, une API publique — sans `tabindex` ni
// `role`. Un utilisateur au clavier ne pouvait pas les atteindre, et un
// lecteur d'écran ne les annonçait pas comme actionnables.
//
// ## Pourquoi ce composant seul
//
// #547 listait 14 consommateurs de `useAdjacent`. Mesure du 2026-09-05 :
// six portaient déjà le contrat (Input, Alert, Chip, CardHeader, DataText,
// DataTitle, DatePickerHeader), quatre ne rendent aucune zone adjacente
// (Tab, AppBar, ColorPickerField), et trois — Toolbar, Drawer, SnackbarItem —
// rendent bien un `<span>` mais **sans aucun gestionnaire de clic** : ce sont
// des zones décoratives, un `<span>` inerte y est le bon élément. Il ne
// restait que celui-ci.
//
// ## Le contrat, tel que `useAdjacent` le définit
//
// `role` et `tabindex` sont **conditionnels** : ils n'apparaissent que si un
// consommateur a réellement attaché un écouteur. Annoncer `role="button"` sur
// une zone qui ne fait rien serait la dette exacte que le CLAUDE.md interdit
// — *« No ARIA is better than bad ARIA »*.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

import OrigamExpansionPanelHeader from '@origam/components/ExpansionPanel/OrigamExpansionPanelHeader.vue'
import { ORIGAM_EXPANSION_PANEL_KEY } from '@origam/consts/ExpansionPanel/expansion-panel.const'
import { createOrigam } from '@origam/origam'

// Le header refuse de se monter hors d'un `<origam-expansion-panel>` : il
// `inject()` le contrat du panneau et lève sinon. On fournit ce contrat
// directement plutôt que de monter tout le groupe — le test porte sur le
// contrat clavier de la zone adjacente, pas sur l'appartenance au groupe.
const panelProvide = () => ({
    id: 1,
    isSelected: ref(false),
    toggle: () => {},
    select: () => {},
    selectedClass: ref(false),
    value: ref(undefined),
    disabled: ref(false),
    headerId: ref('header-1'),
    contentId: ref('content-1'),
    group: {} as never
})

const mountHeader = (attrs: Record<string, unknown> = {}) => mount(OrigamExpansionPanelHeader, {
    props: { prependIcon: 'mdi-account', appendIcon: 'mdi-close' } as never,
    attrs,
    global: {
        plugins: [ createOrigam() ],
        provide: { [ORIGAM_EXPANSION_PANEL_KEY as symbol]: panelProvide() }
    }
})

describe('OrigamExpansionPanelHeader — contrat clavier de prepend/append (#547)', () => {
    it('sans écouteur, la zone reste un span inerte — pas de role fabriqué', () => {
        const wrapper = mountHeader()
        const prepend = wrapper.find('.origam-expansion-panel-header__prepend')

        expect(prepend.exists()).toBe(true)
        expect(prepend.attributes('role')).toBeUndefined()
        expect(prepend.attributes('tabindex')).toBeUndefined()
    })

    it('avec un écouteur click:prepend, la zone devient focusable et annoncée', () => {
        const wrapper = mountHeader({ 'onClick:prepend': () => {} })
        const prepend = wrapper.find('.origam-expansion-panel-header__prepend')

        expect(prepend.attributes('role')).toBe('button')
        expect(prepend.attributes('tabindex')).toBe('0')
    })

    it('avec un écouteur click:append, idem sur l\'autre zone', () => {
        const wrapper = mountHeader({ 'onClick:append': () => {} })
        const append = wrapper.find('.origam-expansion-panel-header__append')

        expect(append.attributes('role')).toBe('button')
        expect(append.attributes('tabindex')).toBe('0')
    })

    it('Enter et Espace déclenchent click:prepend, comme un vrai bouton', async () => {
        const wrapper = mountHeader({ 'onClick:prepend': () => {} })
        const prepend = wrapper.find('.origam-expansion-panel-header__prepend')

        await prepend.trigger('keydown', { key: 'Enter' })
        await prepend.trigger('keydown', { key: ' ' })

        expect(wrapper.emitted('click:prepend')).toHaveLength(2)
    })

    it('une touche quelconque ne déclenche rien', async () => {
        const wrapper = mountHeader({ 'onClick:prepend': () => {} })
        const prepend = wrapper.find('.origam-expansion-panel-header__prepend')

        await prepend.trigger('keydown', { key: 'a' })
        await prepend.trigger('keydown', { key: 'Tab' })

        expect(wrapper.emitted('click:prepend')).toBeUndefined()
    })

    it('Enter sur append déclenche click:append', async () => {
        const wrapper = mountHeader({ 'onClick:append': () => {} })
        const append = wrapper.find('.origam-expansion-panel-header__append')

        await append.trigger('keydown', { key: 'Enter' })

        expect(wrapper.emitted('click:append')).toHaveLength(1)
    })
})
