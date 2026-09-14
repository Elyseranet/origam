// Unit tests for <OrigamExpansionPanels> — emit contract.
//
// <OrigamExpansionPanel> already had unit coverage; the PLURAL container that
// owns the selection model had none, and `update:modelValue` — the event that
// tells a consumer which panel is open — was asserted nowhere.
//
// The emit path is: header <button> click → OrigamExpansionPanel's group item
// toggle → useGroup.select → useVModel.set → vm.emit('update:modelValue') on
// <OrigamExpansionPanels>.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import type { VueWrapper } from '@vue/test-utils'

import OrigamExpansionPanels from '@origam/components/ExpansionPanel/OrigamExpansionPanels.vue'
import OrigamExpansionPanel from '@origam/components/ExpansionPanel/OrigamExpansionPanel.vue'
import { createOrigam } from '@origam/origam'

const PANEL_MARKUP = `
    <origam-expansion-panel value="one" title="One"/>
    <origam-expansion-panel value="two" title="Two"/>
    <origam-expansion-panel value="three" title="Three"/>
`

function mountPanels (attrs = '', markup: string = PANEL_MARKUP) {
    const Host = defineComponent({
        components: { OrigamExpansionPanels, OrigamExpansionPanel },
        template: `<origam-expansion-panels ${attrs}>${markup}</origam-expansion-panels>`
    })

    return mount(Host, { global: { plugins: [createOrigam()] } })
}

function modelUpdates (wrapper: VueWrapper): unknown[][] {
    return (wrapper.findComponent(OrigamExpansionPanels).emitted('update:modelValue') ?? []) as unknown[][]
}

function clickHeader (wrapper: VueWrapper, index: number) {
    return wrapper.findAll('button.origam-expansion-panel-header')[index].trigger('click')
}

// ---------------------------------------------------------------------------
// update:modelValue — single (accordion-style default)
// ---------------------------------------------------------------------------

describe('OrigamExpansionPanels — update:modelValue (single)', () => {
    it('renders one header button per panel', () => {
        expect(mountPanels().findAll('button.origam-expansion-panel-header')).toHaveLength(3)
    })

    it('does not emit before any header is clicked', () => {
        expect(modelUpdates(mountPanels())).toHaveLength(0)
    })

    it('emits the opened panel value', async () => {
        const wrapper = mountPanels()
        await clickHeader(wrapper, 1)

        const updates = modelUpdates(wrapper)
        expect(updates).toHaveLength(1)
        expect(updates[0][0]).toBe('two')
    })

    it('emits the new value when another panel is opened', async () => {
        const wrapper = mountPanels()
        await clickHeader(wrapper, 0)
        await clickHeader(wrapper, 2)

        expect(modelUpdates(wrapper).map(args => args[0])).toEqual(['one', 'three'])
    })

    it('emits undefined when the open panel is closed again', async () => {
        const wrapper = mountPanels()
        await clickHeader(wrapper, 0)
        await clickHeader(wrapper, 0)

        expect(modelUpdates(wrapper).at(-1)?.[0]).toBeUndefined()
    })

    it('marks the open panel active and sets aria-expanded alongside the emit', async () => {
        const wrapper = mountPanels()
        await clickHeader(wrapper, 1)

        const headers = wrapper.findAll('button.origam-expansion-panel-header')
        expect(headers[1].attributes('aria-expanded')).toBe('true')
        expect(headers[0].attributes('aria-expanded')).toBe('false')
        expect(wrapper.findAllComponents(OrigamExpansionPanel)[1].classes())
            .toContain('origam-expansion-panel--active')
    })
})

// ---------------------------------------------------------------------------
// update:modelValue — multiple
// ---------------------------------------------------------------------------

describe('OrigamExpansionPanels — update:modelValue (multiple)', () => {
    it('accumulates open panels into an array', async () => {
        const wrapper = mountPanels('multiple')
        await clickHeader(wrapper, 0)
        await clickHeader(wrapper, 2)

        expect(modelUpdates(wrapper).map(args => args[0])).toEqual([['one'], ['one', 'three']])
    })

    it('drops a value when its panel is closed', async () => {
        const wrapper = mountPanels('multiple')
        await clickHeader(wrapper, 0)
        await clickHeader(wrapper, 1)
        await clickHeader(wrapper, 0)

        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['two'])
    })
})

// ---------------------------------------------------------------------------
// Guards that must SUPPRESS the emit
// ---------------------------------------------------------------------------

describe('OrigamExpansionPanels — mandatory', () => {
    it('emits the forced initial panel on mount', () => {
        expect(modelUpdates(mountPanels('mandatory')).at(-1)?.[0]).toBe('one')
    })

    it('does NOT emit when closing the only open panel', async () => {
        const wrapper = mountPanels('mandatory')
        const before = modelUpdates(wrapper).length

        await clickHeader(wrapper, 0)

        expect(modelUpdates(wrapper)).toHaveLength(before)
    })
})

describe('OrigamExpansionPanels — max', () => {
    it('stops emitting once max open panels is reached', async () => {
        const wrapper = mountPanels('multiple :max="2"')
        await clickHeader(wrapper, 0)
        await clickHeader(wrapper, 1)

        const before = modelUpdates(wrapper).length
        await clickHeader(wrapper, 2)

        expect(modelUpdates(wrapper)).toHaveLength(before)
        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['one', 'two'])
    })
})

describe('OrigamExpansionPanels — disabled', () => {
    it('does not emit when the whole group is disabled', async () => {
        const wrapper = mountPanels('disabled')
        await clickHeader(wrapper, 0)

        expect(modelUpdates(wrapper)).toHaveLength(0)
    })

    it('does not emit when the clicked panel itself is disabled', async () => {
        const wrapper = mountPanels('', `
            <origam-expansion-panel value="one" title="One" disabled/>
            <origam-expansion-panel value="two" title="Two"/>
        `)
        await clickHeader(wrapper, 0)

        expect(modelUpdates(wrapper)).toHaveLength(0)
    })
})

// ---------------------------------------------------------------------------
// #420 — a CLOSED panel's #default-slot body must stay hidden. `hasContent`
// on `<OrigamExpansionPanel>` used to check `slots.content` (never true: this
// container forwards its own `content`/`content.{index}` slot to the
// CHILD's `#default`, never to a slot literally named `content`) instead of
// `slots.default`. Without a true `hasContent`, the template fell through
// to `<slot v-else name="default"/>` — bypassing `<origam-expansion-panel
// -content>` (and its `v-show`, `role="region"`, `aria-labelledby`, lazy
// mount, transition) entirely. The body rendered fully visible even though
// the panel was never opened.
// ---------------------------------------------------------------------------

describe('OrigamExpansionPanels — #420 closed panel hides its #default-slot body', () => {
    // Content is lazy by default (`useLazy`): a never-opened panel does not
    // even MOUNT its slot content, so `.secret` legitimately does not exist
    // in the DOM yet. That is a stronger guarantee than merely hidden — the
    // pre-fix defect was that the text rendered (and was visible) regardless.
    it('never opened: the body text is absent and the panel carries no --active class', () => {
        const wrapper = mountPanels('', `
            <origam-expansion-panel value="one" title="One">
                <p class="secret">Secret body text</p>
            </origam-expansion-panel>
        `)

        expect(wrapper.text()).not.toContain('Secret body text')
        expect(wrapper.html()).not.toContain('origam-expansion-panel--active')
    })

    it('is wrapped by origam-expansion-panel-content (not the raw v-else passthrough)', () => {
        const wrapper = mountPanels('', `
            <origam-expansion-panel value="one" title="One">
                <p class="secret">Secret body text</p>
            </origam-expansion-panel>
        `)

        expect(wrapper.find('.origam-expansion-panel-content').exists()).toBe(true)
        expect(wrapper.find('.origam-expansion-panel-content[role="region"]').exists()).toBe(true)
    })

    it('opening the panel reveals the body', async () => {
        const wrapper = mountPanels('', `
            <origam-expansion-panel value="one" title="One">
                <p class="secret">Secret body text</p>
            </origam-expansion-panel>
        `)

        await clickHeader(wrapper, 0)

        expect(wrapper.find('.secret').isVisible()).toBe(true)
        expect(wrapper.html()).toContain('origam-expansion-panel--active')
    })
})

// ---------------------------------------------------------------------------
// ⛔ EMIT `group:selected` — critère C5 du classeur.
//
// L'émission est RÉELLE : `useGroupItem` fait `vm.emit('group:selected',
// {value})` sur l'instance du composant appelant (groupItem.composable.ts:94),
// donc la déclaration héritée d'`IGroupEmits` est légitime.
//
// Ce qui manquait, c'est un test qui le PROUVE. Le seul existant est un e2e
// dont le titre affirme ce que le corps ne vérifie pas :
//
//   test('click does not throw (group:selected fires)', …)
//       await header.click()          ← et rien d'autre
//
// Il clique et n'assert RIEN. C'est le motif exact que le classeur reprochait
// à `form.spec.ts` — « LE TEST QUI PRÉTEND LE PROUVER NE PROUVE RIEN ». Un
// test qui ne peut pas rougir est une décoration.
// ---------------------------------------------------------------------------
describe('OrigamExpansionPanel — emit group:selected (classeur C5)', () => {
    it('ouvrir un panneau émet group:selected avec value: true', async () => {
        const wrapper = mountPanels()
        await clickHeader(wrapper, 0)

        const panel = wrapper.findAllComponents(OrigamExpansionPanel)[0]
        const events = panel.emitted('group:selected') as unknown[][] | undefined

        expect(events).toBeTruthy()
        expect(events![events!.length - 1][0]).toEqual({ value: true })
    })

    it('refermer le même panneau émet group:selected avec value: false', async () => {
        const wrapper = mountPanels()
        await clickHeader(wrapper, 0)
        await clickHeader(wrapper, 0)

        const panel = wrapper.findAllComponents(OrigamExpansionPanel)[0]
        const events = panel.emitted('group:selected') as unknown[][]

        expect(events.length).toBeGreaterThanOrEqual(2)
        expect(events[events.length - 1][0]).toEqual({ value: false })
    })

    it("un panneau qu'on n'a jamais touché n'émet rien", async () => {
        const wrapper = mountPanels()
        await clickHeader(wrapper, 0)

        const others = wrapper.findAllComponents(OrigamExpansionPanel).slice(1)
        const untouched = others.filter(p => !p.emitted('group:selected'))

        expect(untouched.length).toBe(others.length)
    })
})
