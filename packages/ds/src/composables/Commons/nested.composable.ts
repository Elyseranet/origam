import { computed, onBeforeUnmount, onMounted, provide, ref, shallowRef, watch } from 'vue'
import { useVModel } from './vModel.composable'
import { LIST_OPEN_STRATEGY, MULTIPLE_OPEN_STRATEGY, ORIGAM_NESTED_KEY, SINGLE_OPEN_STRATEGY } from '../../consts/Commons/nested.const'
import { OPEN_STRATEGY, SELECTED, SELECT_STRATEGY } from '../../enums'
import type { INestedProps } from '../../interfaces/Commons/nested.interface'
import type { TNestedProvide } from '../../types/Commons/nested.type'
import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'
import { classicSelectStrategy, independentSelectStrategy, independentSingleSelectStrategy, leafSelectStrategy, leafSingleSelectStrategy } from '../../utils/Commons/nested.util'

/*********************************************************
 * useNested
 *
 * @description
 * Root of the nested-tree system — tracks children/parents/opened/
 * selected state and provides `ORIGAM_NESTED_KEY` so `useNestedItem` /
 * `useNestedGroupActivator` consumers down the tree (list items, tree
 * nodes, menu items…) can register and read/write back into it.
 * Independent from `useNestedItem` / `useNestedGroupActivator` at the
 * call level (no direct function dependency) — the three only share
 * the `ORIGAM_NESTED_KEY` provide/inject contract.
 ********************************************************/
export const useNested = (props: INestedProps) => {
    let isUnmounted = false

    /*********************************************************
     * openedTouchedBeforeMount
     *
     * @description
     * Flips the moment `open()`/`openOnSelect()` writes `opened.value` for
     * the first time — guards the `onMounted` reseed below from clobbering
     * a legitimate pre-mount write (see the comment there).
     ********************************************************/
    let openedTouchedBeforeMount = false
    const children = ref(new Map<unknown, Array<unknown>>())
    const parents = ref(new Map<unknown, unknown>())

    const opened = ref(new Set(props.opened))

    /*********************************************************
     * opened must track an external props.opened change (#486)
     *
     * @description
     * `opened` was seeded from `props.opened` once, here, and never
     * watched again — unlike `selected` below, which goes through
     * `useVModel` and reacts correctly. A consumer driving `opened` as
     * an external v-model and reassigning it from OUTSIDE the tree
     * (not via a node click routed through `open()`) never reached
     * this ref. `open()` itself still writes `opened.value` directly
     * for the internal click path, so this watcher only needs to
     * cover the external-write path — reseeding whenever the prop
     * reference actually changes.
     ********************************************************/
    watch(() => props.opened, (val) => {
        opened.value = new Set(val)
    })

    /*********************************************************
     * opened's FIRST seed is re-applied once mounted (ADR-005)
     *
     * @description
     * `ref(new Set(props.opened))` above runs during the caller's
     * `setup()`, BEFORE `beforeCreate` installs the ADR-005 theme-props
     * accessor on `instance.props` — so a theme-only `opened` default
     * (`theme.components['origam-list'].opened`, the same shape `selected`
     * already supports via `useVModel`) is invisible to this first
     * snapshot. The `watch` just above does not correct it either: its
     * own baseline read runs at the same `setup()` instant, so it only
     * ever fires for a LATER change coming from the parent (#486), never
     * for the theme value landing for the first time. Measured, not
     * assumed — `nested-opened-theme-race.spec.ts` reproduced the miss
     * against the real `createOrigam({ themes })` mechanism before this
     * fix, mirroring `useVirtual.estimateLast`'s already-shipped pattern
     * for the exact same class of defect.
     *
     * @description
     * Re-applying the seed unconditionally would clobber a legitimate
     * `open()`/`openOnSelect()` call a CHILD's own `onMounted`/watcher may
     * have already routed through this ref — Vue mounts children before
     * their parent, so that ordering is possible. `openedTouchedBeforeMount`
     * flips the moment either handler writes `opened.value`, and the
     * reseed below only runs while it is still untouched.
     ********************************************************/
    onMounted(() => {
        if (!openedTouchedBeforeMount) {
            opened.value = new Set(props.opened)
        }
    })

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

    /*********************************************************
     * selected
     *
     * @description
     * ⛔ Pas de `props.selected` en 3e argument — meme forme que
     * `provideExpanded` (`expand.composable.ts`) et `provideSelection`
     * (`select.composable.ts`) : l'argument était mort et forçait une
     * lecture pendant le `setup()` de l'appelant (#504). Mesuré, cas du
     * thème compris : `vmodel-default-value.spec.ts`.
     ********************************************************/
    const selected = useVModel(
        props,
        'selected',
        undefined,
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
                        if (value === SELECTED.ON) arr.push(key)
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
                    openedTouchedBeforeMount = true
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
                    openedTouchedBeforeMount = true
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
