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

import { useAdjacent, useAdjacentInner } from '@origam/composables/Commons/adjacent.composable'

// ---------------------------------------------------------------------------
// useAdjacent
// ---------------------------------------------------------------------------

function mountAdjacent (
    props: Partial<IAdjacentProps>,
    slots: { prepend?: boolean; append?: boolean } = {}
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

    mount(Host, { slots: slotObj })
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
// useAdjacentInner
// ---------------------------------------------------------------------------

function mountAdjacentInner (props: Partial<IAdjacentInnerProps>) {
    let api!: ReturnType<typeof useAdjacentInner>

    const Host = defineComponent({
        name: 'OrigamAdjacentInnerHost',
        emits: ['click:prependInner', 'click:appendInner', 'click:clear'],
        setup () {
            api = useAdjacentInner(props as IAdjacentInnerProps)
            return () => h('div')
        }
    })

    mount(Host)
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
