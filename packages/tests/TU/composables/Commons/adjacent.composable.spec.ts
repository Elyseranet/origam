// Tests for `useAdjacent` and `useAdjacentInner` composables.
// Covers: hasPrepend / hasAppend derivation from props vs slots,
// hasPrependMedia / hasAppendMedia from icon/avatar props,
// onClickPrepend / onClickAppend emit forwarding.
// click:prepend / click:append emit events cannot be tested headlessly without
// a real DOM interaction — those are covered by a skip with justification.

import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IAdjacentProps, IAdjacentInnerProps } from '@origam/interfaces'

import { useAdjacent } from '@origam/composables/Commons/adjacent.composable'
import { useAdjacentInner } from '@origam/composables/Commons/adjacentInner.composable'

// ---------------------------------------------------------------------------
// useAdjacent
// ---------------------------------------------------------------------------

function mountAdjacent (
    props: Partial<IAdjacentProps>,
    slots: { prepend?: boolean; append?: boolean } = {},
    attrs: Record<string, unknown> = {}
) {
    let api!: ReturnType<typeof useAdjacent>

    const Host = defineComponent({
        name: 'OrigamAdjacentHost',
        emits: ['click:prepend', 'click:append'],
        setup () {
            api = useAdjacent(props as IAdjacentProps)
            return () => h('div')
        }
    })

    const slotObj: Record<string, () => any> = {}
    if (slots.prepend) slotObj.prepend = () => h('span', 'prepend')
    if (slots.append) slotObj.append = () => h('span', 'append')

    mount(Host, { slots: slotObj, attrs })
    return { api: () => api }
}

describe('useAdjacent — hasPrependMedia', () => {
    it('no prependIcon, no prependAvatar → hasPrependMedia=false', () => {
        const { api } = mountAdjacent({})
        expect(api().hasPrependMedia.value).toBe(false)
    })

    it('prependIcon set → hasPrependMedia=true', () => {
        const { api } = mountAdjacent({ prependIcon: 'mdi-account' })
        expect(api().hasPrependMedia.value).toBe(true)
    })

    it('prependAvatar set → hasPrependMedia=true', () => {
        const { api } = mountAdjacent({ prependAvatar: 'https://example.com/avatar.png' })
        expect(api().hasPrependMedia.value).toBe(true)
    })
})

describe('useAdjacent — hasAppendMedia', () => {
    it('no appendIcon, no appendAvatar → hasAppendMedia=false', () => {
        const { api } = mountAdjacent({})
        expect(api().hasAppendMedia.value).toBe(false)
    })

    it('appendIcon set → hasAppendMedia=true', () => {
        const { api } = mountAdjacent({ appendIcon: 'mdi-chevron-down' })
        expect(api().hasAppendMedia.value).toBe(true)
    })

    it('appendAvatar set → hasAppendMedia=true', () => {
        const { api } = mountAdjacent({ appendAvatar: 'https://example.com/avatar.png' })
        expect(api().hasAppendMedia.value).toBe(true)
    })
})

describe('useAdjacent — hasPrepend', () => {
    it('no icon/avatar, no prepend slot → hasPrepend=false', () => {
        const { api } = mountAdjacent({})
        expect(api().hasPrepend.value).toBe(false)
    })

    it('prependIcon alone → hasPrepend=true', () => {
        const { api } = mountAdjacent({ prependIcon: 'mdi-account' })
        expect(api().hasPrepend.value).toBe(true)
    })
})

describe('useAdjacent — hasAppend', () => {
    it('no icon/avatar, no append slot → hasAppend=false', () => {
        const { api } = mountAdjacent({})
        expect(api().hasAppend.value).toBe(false)
    })

    it('appendIcon alone → hasAppend=true', () => {
        const { api } = mountAdjacent({ appendIcon: 'mdi-chevron-down' })
        expect(api().hasAppend.value).toBe(true)
    })
})

describe('useAdjacent — emit click events', () => {
    it.skip(
        'onClickPrepend emits click:prepend — requires real DOM click, not unit-testable headlessly',
        () => {}
    )
    it.skip(
        'onClickAppend emits click:append — requires real DOM click, not unit-testable headlessly',
        () => {}
    )
})

// ---------------------------------------------------------------------------
// issue #443 — isPrependClickable / isAppendClickable + keyboard activation.
//
// A prepend/append zone becomes a real tab stop ONLY when the consumer
// attached a `click:prepend` / `click:append` listener (mirrors
// `useIconAccessibility`'s `isClickable = !!attrs.onClick`) — a decorative
// icon with no listener stays exactly as inert as before.
// ---------------------------------------------------------------------------

describe('useAdjacent — isPrependClickable / isAppendClickable', () => {
    it('no listener attached → both false (decorative icon stays inert)', () => {
        const { api } = mountAdjacent({ prependIcon: 'mdi-account', appendIcon: 'mdi-chevron-down' })
        expect(api().isPrependClickable.value).toBe(false)
        expect(api().isAppendClickable.value).toBe(false)
    })

    it('@click:prepend listener attached → isPrependClickable=true, isAppendClickable stays false', () => {
        const { api } = mountAdjacent(
            { prependIcon: 'mdi-account' },
            {},
            { 'onClick:prepend': () => {} }
        )
        expect(api().isPrependClickable.value).toBe(true)
        expect(api().isAppendClickable.value).toBe(false)
    })

    it('@click:append listener attached → isAppendClickable=true, isPrependClickable stays false', () => {
        const { api } = mountAdjacent(
            { appendIcon: 'mdi-chevron-down' },
            {},
            { 'onClick:append': () => {} }
        )
        expect(api().isAppendClickable.value).toBe(true)
        expect(api().isPrependClickable.value).toBe(false)
    })
})

describe('useAdjacent — onKeydownPrepend / onKeydownAppend', () => {
    function keydown (key: string): KeyboardEvent {
        return new KeyboardEvent('keydown', { key, cancelable: true })
    }

    it('not clickable → Enter does nothing (no emit, no preventDefault)', () => {
        const { api } = mountAdjacent({ prependIcon: 'mdi-account' })
        const event = keydown('Enter')
        api().onKeydownPrepend(event)
        expect(event.defaultPrevented).toBe(false)
    })

    it('clickable + Enter → preventDefault called and onClickPrepend fires', () => {
        const onClickPrependSpy = { called: false }
        const { api } = mountAdjacent(
            { prependIcon: 'mdi-account' },
            {},
            { 'onClick:prepend': () => { onClickPrependSpy.called = true } }
        )
        const event = keydown('Enter')
        api().onKeydownPrepend(event)
        expect(event.defaultPrevented).toBe(true)
        expect(onClickPrependSpy.called).toBe(true)
    })

    it('clickable + Space (" ") → preventDefault called and onClickPrepend fires (blocks page scroll)', () => {
        const onClickPrependSpy = { called: false }
        const { api } = mountAdjacent(
            { prependIcon: 'mdi-account' },
            {},
            { 'onClick:prepend': () => { onClickPrependSpy.called = true } }
        )
        const event = keydown(' ')
        api().onKeydownPrepend(event)
        expect(event.defaultPrevented).toBe(true)
        expect(onClickPrependSpy.called).toBe(true)
    })

    it('clickable + unrelated key (Tab) → no emit, no preventDefault', () => {
        const onClickPrependSpy = { called: false }
        const { api } = mountAdjacent(
            { prependIcon: 'mdi-account' },
            {},
            { 'onClick:prepend': () => { onClickPrependSpy.called = true } }
        )
        const event = keydown('Tab')
        api().onKeydownPrepend(event)
        expect(event.defaultPrevented).toBe(false)
        expect(onClickPrependSpy.called).toBe(false)
    })

    it('clickable + Enter on append → onClickAppend fires, onClickPrepend untouched', () => {
        const spies = { prepend: false, append: false }
        const { api } = mountAdjacent(
            { appendIcon: 'mdi-chevron-down' },
            {},
            { 'onClick:append': () => { spies.append = true } }
        )
        api().onKeydownAppend(keydown('Enter'))
        expect(spies.append).toBe(true)
        expect(spies.prepend).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// useAdjacentInner
// ---------------------------------------------------------------------------

function mountAdjacentInner (props: Partial<IAdjacentInnerProps>, attrs: Record<string, unknown> = {}) {
    let api!: ReturnType<typeof useAdjacentInner>

    const Host = defineComponent({
        name: 'OrigamAdjacentInnerHost',
        emits: ['click:prependInner', 'click:appendInner', 'click:clear'],
        setup () {
            api = useAdjacentInner(props as IAdjacentInnerProps)
            return () => h('div')
        }
    })

    mount(Host, { attrs })
    return { api: () => api }
}

describe('useAdjacentInner — hasPrependInnerMedia', () => {
    it('no inner props → hasPrependInnerMedia=false', () => {
        const { api } = mountAdjacentInner({})
        expect(api().hasPrependInnerMedia.value).toBe(false)
    })

    it('prependInnerIcon set → hasPrependInnerMedia=true', () => {
        const { api } = mountAdjacentInner({ prependInnerIcon: 'mdi-magnify' })
        expect(api().hasPrependInnerMedia.value).toBe(true)
    })

    it('prependInnerAvatar set → hasPrependInnerMedia=true', () => {
        const { api } = mountAdjacentInner({ prependInnerAvatar: 'https://example.com/a.png' })
        expect(api().hasPrependInnerMedia.value).toBe(true)
    })
})

describe('useAdjacentInner — hasAppendInnerMedia', () => {
    it('no inner props → hasAppendInnerMedia=false', () => {
        const { api } = mountAdjacentInner({})
        expect(api().hasAppendInnerMedia.value).toBe(false)
    })

    it('appendInnerIcon set → hasAppendInnerMedia=true', () => {
        const { api } = mountAdjacentInner({ appendInnerIcon: 'mdi-eye' })
        expect(api().hasAppendInnerMedia.value).toBe(true)
    })
})

describe('useAdjacentInner — hasClear', () => {
    it('clearable=false (default) → hasClear=false', () => {
        const { api } = mountAdjacentInner({ clearable: false })
        expect(api().hasClear.value).toBeFalsy()
    })

    it('clearable=true → hasClear=true', () => {
        const { api } = mountAdjacentInner({ clearable: true })
        expect(api().hasClear.value).toBeTruthy()
    })
})

describe('useAdjacentInner — hasPrependInner', () => {
    it('hasPrependInner=false when no icon/avatar and no slot', () => {
        const { api } = mountAdjacentInner({})
        expect(api().hasPrependInner.value).toBeFalsy()
    })

    it('hasPrependInner=true when prependInnerIcon is set', () => {
        const { api } = mountAdjacentInner({ prependInnerIcon: 'mdi-lock' })
        expect(api().hasPrependInner.value).toBeTruthy()
    })
})

describe('useAdjacentInner — hasAppendInner', () => {
    it('hasAppendInner=false when no icon/avatar and no slot', () => {
        const { api } = mountAdjacentInner({})
        expect(api().hasAppendInner.value).toBeFalsy()
    })

    it('hasAppendInner=true when appendInnerIcon is set', () => {
        const { api } = mountAdjacentInner({ appendInnerIcon: 'mdi-calendar' })
        expect(api().hasAppendInner.value).toBeTruthy()
    })
})

// ---------------------------------------------------------------------------
// issue #443 — isPrependInnerClickable / isAppendInnerClickable + keyboard.
// Same contract as useAdjacent, mirrored for the inner zone.
// ---------------------------------------------------------------------------

describe('useAdjacentInner — isPrependInnerClickable / isAppendInnerClickable', () => {
    it('no listener attached → both false', () => {
        const { api } = mountAdjacentInner({ prependInnerIcon: 'mdi-magnify', appendInnerIcon: 'mdi-eye' })
        expect(api().isPrependInnerClickable.value).toBe(false)
        expect(api().isAppendInnerClickable.value).toBe(false)
    })

    it('@click:prependInner listener attached → isPrependInnerClickable=true', () => {
        const { api } = mountAdjacentInner(
            { prependInnerIcon: 'mdi-magnify' },
            { 'onClick:prependInner': () => {} }
        )
        expect(api().isPrependInnerClickable.value).toBe(true)
        expect(api().isAppendInnerClickable.value).toBe(false)
    })

    it('@click:appendInner listener attached → isAppendInnerClickable=true', () => {
        const { api } = mountAdjacentInner(
            { appendInnerIcon: 'mdi-eye' },
            { 'onClick:appendInner': () => {} }
        )
        expect(api().isAppendInnerClickable.value).toBe(true)
        expect(api().isPrependInnerClickable.value).toBe(false)
    })
})

describe('useAdjacentInner — onKeydownPrependInner / onKeydownAppendInner', () => {
    function keydown (key: string): KeyboardEvent {
        return new KeyboardEvent('keydown', { key, cancelable: true })
    }

    it('not clickable → Enter does nothing', () => {
        const { api } = mountAdjacentInner({ prependInnerIcon: 'mdi-magnify' })
        const event = keydown('Enter')
        api().onKeydownPrependInner(event)
        expect(event.defaultPrevented).toBe(false)
    })

    it('clickable + Enter → preventDefault + onClickPrependInner fires', () => {
        const spy = { called: false }
        const { api } = mountAdjacentInner(
            { prependInnerIcon: 'mdi-magnify' },
            { 'onClick:prependInner': () => { spy.called = true } }
        )
        const event = keydown('Enter')
        api().onKeydownPrependInner(event)
        expect(event.defaultPrevented).toBe(true)
        expect(spy.called).toBe(true)
    })

    it('clickable + Space (" ") → preventDefault + onClickAppendInner fires', () => {
        const spy = { called: false }
        const { api } = mountAdjacentInner(
            { appendInnerIcon: 'mdi-eye' },
            { 'onClick:appendInner': () => { spy.called = true } }
        )
        const event = keydown(' ')
        api().onKeydownAppendInner(event)
        expect(event.defaultPrevented).toBe(true)
        expect(spy.called).toBe(true)
    })

    it('clickable + unrelated key → no emit, no preventDefault', () => {
        const spy = { called: false }
        const { api } = mountAdjacentInner(
            { prependInnerIcon: 'mdi-magnify' },
            { 'onClick:prependInner': () => { spy.called = true } }
        )
        const event = keydown('Tab')
        api().onKeydownPrependInner(event)
        expect(event.defaultPrevented).toBe(false)
        expect(spy.called).toBe(false)
    })
})
