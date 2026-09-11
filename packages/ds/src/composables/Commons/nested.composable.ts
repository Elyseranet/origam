import { useVModel } from '../../composables'
import {
    EMPTY_NESTED,
    LIST_OPEN_STRATEGY,
    MULTIPLE_OPEN_STRATEGY,
    ORIGAM_NESTED_KEY,
    SINGLE_OPEN_STRATEGY
} from '../../consts'
import { OPEN_STRATEGY, SELECT_STRATEGY } from '../../enums'

import type { INestedProps } from '../../interfaces'

import type { TNestedProvide } from '../../types'

import {
    classicSelectStrategy,
    getCurrentInstance,
    getUid,
    independentSelectStrategy,
    independentSingleSelectStrategy,
    leafSelectStrategy,
    leafSingleSelectStrategy
} from '../../utils'

import { computed, inject, onBeforeUnmount, provide, Ref, ref, shallowRef, toRaw } from 'vue'

export const useNested = (props: INestedProps) => {
    let isUnmounted = false
    const children = ref(new Map<unknown, Array<unknown>>())
    const parents = ref(new Map<unknown, unknown>())

    const opened = ref(new Set(props.opened))

    const selectStrategy = computed(() => {
        if (typeof props.selectStrategy === 'object') return props.selectStrategy

        switch (props.selectStrategy) {
            case SELECT_STRATEGY.SINGLE_LEAF:
                return leafSingleSelectStrategy(props.mandatory)
            case SELECT_STRATEGY.LEAF:
                return leafSelectStrategy(props.mandatory)
            case SELECT_STRATEGY.INDEPENDENT:
                return independentSelectStrategy(props.mandatory)
            case SELECT_STRATEGY.SINGLE_INDEPENDENT:
                return independentSingleSelectStrategy(props.mandatory)
            case SELECT_STRATEGY.CLASSIC:
            default:
                return classicSelectStrategy(props.mandatory)
        }
    })

    const openStrategy = computed(() => {
        if (typeof props.openStrategy === 'object') return props.openStrategy

        switch (props.openStrategy) {
            case OPEN_STRATEGY.LIST:
                return LIST_OPEN_STRATEGY
            case OPEN_STRATEGY.SINGLE:
                return SINGLE_OPEN_STRATEGY
            case OPEN_STRATEGY.MULTIPLE:
            default:
                return MULTIPLE_OPEN_STRATEGY
        }
    })

    const selected = useVModel(
        props,
        'selected',
        props.selected,
        v => selectStrategy.value.in(v, children.value, parents.value),
        v => selectStrategy.value.out(v, children.value, parents.value)
    )

    onBeforeUnmount(() => {
        isUnmounted = true
    })

    const getPath = (id: unknown) => {
        const path: Array<unknown> = []
        let parent: unknown = id

        while (parent != null) {
            path.unshift(parent)
            parent = parents.value.get(parent)
        }

        return path
    }

    const vm = getCurrentInstance('nested')

    const nested: TNestedProvide = {
        id: shallowRef(),
        root: {
            opened,
            selected,
            selectedValues: computed(() => {
                const arr = []

                if (selected.value) {
                    for (const [key, value] of selected.value.entries()) {
                        if (value === 'on') arr.push(key)
                    }
                }

                return arr
            }),
            register: (id, parentId, isGroup) => {
                if (parentId && id !== parentId) {
                    parents.value.set(id, parentId)
                }

                if (isGroup) {
                    children.value.set(id, [])
                }

                if (parentId != null) {
                    children.value.set(parentId, [...children.value.get(parentId) || [], id])
                }
            },
            unregister: (id) => {
                if (isUnmounted) return

                children.value.delete(id)
                const parent = parents.value.get(id)

                if (parent) {
                    const list = children.value.get(parent) ?? []
                    children.value.set(parent, list.filter(child => child !== id))
                }

                parents.value.delete(id)
                opened.value.delete(id)
            },
            open: (id, value, event) => {
                vm.emit('click:open', {id, value, path: getPath(id), event})

                const newOpened = openStrategy.value.open({
                    id,
                    value,
                    opened: new Set(opened.value),
                    children: children.value,
                    parents: parents.value,
                    event
                })

                if (newOpened) {
                    opened.value = new Set(newOpened)
                    vm.emit('update:opened', newOpened)
                }
            },
            openOnSelect: (id, value, event) => {
                const newOpened = openStrategy.value.select({
                    id,
                    value,
                    selected: new Map(selected.value),
                    opened: new Set(opened.value),
                    children: children.value,
                    parents: parents.value,
                    event
                })

                if (newOpened) {
                    opened.value = newOpened
                }
            },
            select: (id, value, event) => {
                vm.emit('click:select', {id, value, path: getPath(id), event})

                const newSelected = selectStrategy.value.select({
                    id,
                    value,
                    selected: new Map(selected.value),
                    children: children.value,
                    parents: parents.value,
                    event
                })

                if (newSelected) {
                    selected.value = newSelected
                    vm.emit('update:selected', newSelected)
                }

                nested.root.openOnSelect(id, value, event)
            },
            children,
            parents
        }
    }

    provide(ORIGAM_NESTED_KEY, nested)

    return nested.root
}

/*********************************************************
 * useNestedItem
 ********************************************************/
export function useNestedItem (id: Ref<unknown>, isGroup: boolean) {
    const parent = inject(ORIGAM_NESTED_KEY, EMPTY_NESTED)

    const uidSymbol = Symbol(getUid())
    const computedId = computed(() => id.value !== undefined ? id.value : uidSymbol)

    const item = {
        ...parent,
        id: computedId,
        open: (open: boolean, e: Event) => {
            if (parent?.root) {
                parent.root.open(computedId.value, open, e)
            }
        },
        openOnSelect: (open: boolean, e?: Event) => {
            if (parent?.root) {
                parent.root.openOnSelect(computedId.value, open, e)
            }
        },
        isOpen: computed(() => Boolean(parent?.root?.opened.value.has(computedId.value))),
        parent: computed(() => parent?.root?.parents.value.get(computedId.value)),
        select: (selected: boolean, e?: Event) => {
            if (parent?.root) {
                parent.root.select(computedId.value, selected, e)
            }
        },
        isSelected: computed(() => Boolean(parent?.root?.selected.value.get(toRaw(computedId.value)) === 'on')),
        isIndeterminate: computed(() => Boolean(parent?.root?.selected.value.get(computedId.value) === 'indeterminate')),
        isLeaf: computed(() => Boolean(!parent?.root?.children.value.get(computedId.value))),
        isGroupActivator: parent?.isGroupActivator
    }

    if (!parent?.isGroupActivator) {
        if (parent?.root) {
            parent.root.register(computedId.value, parent?.id.value, isGroup)
        }
    }

    onBeforeUnmount(() => {
        if (!parent?.isGroupActivator) {
            if (parent?.root) {
                parent.root.unregister(computedId.value)
            }
        }
    })

    if (isGroup) {
        provide(ORIGAM_NESTED_KEY, item)
    }

    return item
}

/*********************************************************
 * useNestedGroupActivator
 ********************************************************/
export function useNestedGroupActivator () {
    const parent = inject(ORIGAM_NESTED_KEY, EMPTY_NESTED)

    const item = {
        ...parent,
        isGroupActivator: true
    }

    provide(ORIGAM_NESTED_KEY, item)
}
