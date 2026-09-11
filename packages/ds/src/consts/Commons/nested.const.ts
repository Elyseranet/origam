import type { TNestedProvide, TStrategyOpen } from '../../types'

import type { InjectionKey } from 'vue'
import { ref, shallowRef } from 'vue'

export const SINGLE_OPEN_STRATEGY: TStrategyOpen = {
    open: ({id, value, opened, parents}) => {
        if (value) {
            const newOpened = new Set<unknown>()
            newOpened.add(id)

            let parent = parents.get(id)

            while (parent != null) {
                newOpened.add(parent)
                parent = parents.get(parent)
            }

            return newOpened
        } else {
            opened.delete(id)
            return opened
        }
    },
    select: () => null
}

export const MULTIPLE_OPEN_STRATEGY: TStrategyOpen = {
    open: ({id, value, opened, parents}) => {
        if (value) {
            let parent = parents.get(id)
            opened.add(id)

            while (parent != null && parent !== id) {
                opened.add(parent)
                parent = parents.get(parent)
            }

            return opened
        } else {
            opened.delete(id)
        }

        return opened
    },
    select: () => null
}

export const LIST_OPEN_STRATEGY: TStrategyOpen = {
    open: MULTIPLE_OPEN_STRATEGY.open,
    select: ({id, value, opened, parents}) => {
        if (!value) return opened

        const path: Array<unknown> = []

        let parent = parents.get(id)

        while (parent != null) {
            path.push(parent)
            parent = parents.get(parent)
        }

        return new Set(path)
    }
}

export const ORIGAM_NESTED_KEY: InjectionKey<TNestedProvide> = Symbol.for('origam:nested')

export const EMPTY_NESTED: TNestedProvide = {
    id: shallowRef(),
    root: {
        register: () => null,
        unregister: () => null,
        parents: ref(new Map()),
        children: ref(new Map()),
        open: () => null,
        openOnSelect: () => null,
        select: () => null,
        opened: ref(new Set()),
        selected: ref(new Map()),
        selectedValues: ref([])
    }
}
