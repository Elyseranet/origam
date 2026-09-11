import type { ComponentInternalInstance, ComputedRef, CSSProperties, Ref, StyleValue } from 'vue'
import {
    computed,
    inject,
    onActivated,
    onBeforeUnmount,
    onDeactivated,
    onMounted,
    provide,
    reactive,
    ref,
    shallowRef
} from 'vue'
import { useResizeObserver } from '../../composables'

import { ORIGAM_LAYOUT_ITEM_KEY, ORIGAM_LAYOUT_KEY, ROOT_ZINDEX } from '../../consts'

import type { TDirectionBoth } from "../../types"

import { convertToUnit, findChildrenWithProvide, generateLayers, getCurrentInstance, getUid, int } from '../../utils'

/*********************************************************
 * useLayout
 ********************************************************/
export function useLayout () {
    const layout = inject(ORIGAM_LAYOUT_KEY)

    if (!layout) {
        throw new Error('[Origam] Could not find injected layout')
    }

    return {
        getLayoutItem: layout.getLayoutItem,
        mainRect: layout.mainRect,
        mainStyles: layout.mainStyles,
        mainId: layout.layoutId
    }
}

/*********************************************************
 * useLayoutItem
 ********************************************************/
export function useLayoutItem (options: {
    id: string | undefined
    order: Ref<number>
    position: Ref<TDirectionBoth>
    layoutSize: Ref<number | string>
    elementSize: Ref<number | string | undefined>
    active: Ref<boolean> | ComputedRef<boolean>
    disableTransitions?: Ref<boolean>
    absolute: Ref<boolean | undefined>
}) {
    const layout = inject(ORIGAM_LAYOUT_KEY)

    // No layout provider in the tree: fall back to inert styles so the
    // component (BottomNav, AppBar, …) still renders standalone — useful
    // in stories, modal previews, or tests that don't bother wrapping
    // the component in an OrigamLayout. Throwing here used to crash the
    // entire sandbox.
    if (!layout) {
        return {
            layoutItemStyles: computed<CSSProperties>(() => ({})),
            layoutRect: shallowRef(undefined),
            layoutItemScrimStyles: computed<CSSProperties>(() => ({})),
            layoutId: 'origam-layout-orphan'
        }
    }

    const id = options.id ?? `layout-item-${getUid()}`

    const vm = getCurrentInstance('useLayoutItem')

    provide(ORIGAM_LAYOUT_ITEM_KEY, shallowRef({id}))

    const isKeptAlive = shallowRef(false)
    onDeactivated(() => {
        isKeptAlive.value = true
    })
    onActivated(() => {
        isKeptAlive.value = false
    })

    const {
        layoutItemStyles,
        layoutItemScrimStyles
    } = layout.register(vm, {
        ...options,
        active: computed(() => isKeptAlive.value ? false : options.active.value),
        id
    })

    onBeforeUnmount(() => {
        layout.unregister(id)
    })

    return {
        layoutItemStyles,
        layoutRect: layout.layoutRect,
        layoutItemScrimStyles,
        layoutId: layout.layoutId
    }
}

/*********************************************************
 * useCreateLayout
 ********************************************************/
export function useCreateLayout (props: { id?: string, overlaps?: Array<string>, fullHeight?: boolean }) {
    const parentLayout = inject(ORIGAM_LAYOUT_KEY, null)

    const uid = getUid()
    const layoutId = computed(() => props.id || `layout-${uid}`)

    const rootZIndex = computed(() => parentLayout ? parentLayout.rootZIndex.value - 100 : ROOT_ZINDEX)
    const registered = ref<Array<string>>([])
    const positions = reactive(new Map<string, Ref<TDirectionBoth>>())
    const layoutSizes = reactive(new Map<string, Ref<number | string>>())
    const priorities = reactive(new Map<string, Ref<number>>())
    const activeItems = reactive(new Map<string, Ref<boolean>>())
    const disabledTransitions = reactive(new Map<string, Ref<boolean>>())
    const {resizeRef, contentRect: layoutRect} = useResizeObserver()

    const computedOverlaps = computed(() => {
        const map = new Map<string, { position: TDirectionBoth, amount: number }>()
        const overlaps = props.overlaps ?? []
        for (const overlap of overlaps.filter(item => item.includes(':'))) {
            const [top, bottom] = overlap.split(':')
            if (!registered.value.includes(top) || !registered.value.includes(bottom)) continue

            const topPosition = positions.get(top)
            const bottomPosition = positions.get(bottom)
            const topAmount = layoutSizes.get(top) as Ref<string>
            const bottomAmount = layoutSizes.get(bottom) as Ref<string>

            if (!topPosition || !bottomPosition || !topAmount || !bottomAmount) continue

            map.set(bottom, {position: topPosition.value, amount: int(topAmount.value)})
            map.set(top, {position: bottomPosition.value, amount: -int(bottomAmount.value)})
        }

        return map
    })

    const layers = computed(() => {
        const uniquePriorities = [...new Set([...priorities.values()].map(p => p.value))].sort((a, b) => a - b)
        const layout = []

        for (const p of uniquePriorities) {
            const items = registered.value.filter(id => priorities.get(id)?.value === p)
            layout.push(...items)
        }

        return generateLayers(layout, positions, layoutSizes, activeItems)
    })

    const transitionsEnabled = computed(() => {
        return !Array.from(disabledTransitions.values()).some(ref => ref.value)
    })

    const mainRect = computed(() => {
        return layers.value[layers.value.length - 1].layer
    })

    const mainStyles = computed<CSSProperties>(() => {
        const left = convertToUnit(mainRect.value.left) ?? '0px'
        const right = convertToUnit(mainRect.value.right) ?? '0px'
        const top = convertToUnit(mainRect.value.top) ?? '0px'
        const bottom = convertToUnit(mainRect.value.bottom) ?? '0px'
        // Emit BOTH:
        //   • the standard `left / right / top / bottom` props for
        //     consumers that use `position: absolute` (e.g.
        //     OrigamMain in scrollable mode, OrigamSnackbar);
        //   • the matching CSS custom properties so that consumers
        //     using `padding-inline-start: var(--origam-layout---
        //     position-left)` (default OrigamMain) actually receive
        //     the reserved-space values. Without the latter, the
        //     drawer reserved its width via useLayoutItem but the
        //     main content never offset → "drawer overlays main
        //     instead of pushing it" (user report).
        return {
            'left': left,
            'right': right,
            'top': top,
            'bottom': bottom,
            '--origam-layout---position-left': left,
            '--origam-layout---position-right': right,
            '--origam-layout---position-top': top,
            '--origam-layout---position-bottom': bottom,
            ...(transitionsEnabled.value ? undefined : {transition: 'none'})
        } as CSSProperties
    })

    const items = computed(() => {
        return layers.value.slice(1).map(({id}, index) => {
            const {layer} = layers.value[index]
            const size = layoutSizes.get(id)
            const position = positions.get(id)

            return {
                id,
                ...layer,
                size: Number(size!.value),
                position: position!.value
            }
        })
    })

    const getLayoutItem = (id: string) => {
        return items.value.find(item => item.id === id)
    }

    const rootVm = getCurrentInstance('createLayout')

    const isMounted = shallowRef(false)
    onMounted(() => {
        isMounted.value = true
    })

    provide(ORIGAM_LAYOUT_KEY, {
        register: (
            vm: ComponentInternalInstance,
            {
                id,
                order,
                position,
                layoutSize,
                elementSize,
                active,
                disableTransitions,
                absolute
            }
        ) => {
            priorities.set(id, order)
            positions.set(id, position)
            layoutSizes.set(id, layoutSize)
            activeItems.set(id, active)

            if (disableTransitions) {
                disabledTransitions.set(id, disableTransitions)
            }

            // Evict any stale registrations occupying the same (order, position) slot.
            //
            // Root cause: in SSR + prod builds, Vue's hydration-mismatch recovery
            // can abandon a component instance mid-setup (after register() runs but
            // before onBeforeUnmount ever fires) and remount a fresh one. The
            // orphaned instance keeps its id in `registered`, so both the orphan and
            // the fresh instance accumulate — producing 2× the intended offset
            // (e.g. 480 px instead of 240 px for a 240 px drawer).
            //
            // The eviction targets all ids at the exact same (order, position) pair
            // that differ from the incoming id. In normal operation (no hydration
            // anomaly) this set is always empty. For truly independent items that
            // share the same order, their positions will differ, so they are not
            // affected.
            const staleIds = registered.value.filter(
                existingId =>
                    existingId !== id
                    && priorities.get(existingId)?.value === order.value
                    && positions.get(existingId)?.value === position.value
            )
            if (staleIds.length > 0) {
                const staleSet = new Set(staleIds)
                for (const staleId of staleIds) {
                    priorities.delete(staleId)
                    positions.delete(staleId)
                    layoutSizes.delete(staleId)
                    activeItems.delete(staleId)
                    disabledTransitions.delete(staleId)
                }
                registered.value = registered.value.filter(v => !staleSet.has(v))
            }

            const instances = findChildrenWithProvide(ORIGAM_LAYOUT_KEY, rootVm?.vnode)
            const instanceIndex = instances.indexOf(vm)

            if (instanceIndex > -1) registered.value.splice(instanceIndex, 0, id)
            else registered.value.push(id)

            const index = computed(() => items.value.findIndex(i => i.id === id))
            const zIndex = computed(() => rootZIndex.value + (layers.value.length * 2) - (index.value * 2))

            const layoutItemStyles = computed<CSSProperties>(() => {
                const isHorizontal = position.value === 'left' || position.value === 'right'
                const isOppositeHorizontal = position.value === 'right'
                const isOppositeVertical = position.value === 'bottom'
                const styles = {
                    [position.value]: 0,
                    'z-index': zIndex.value,
                    'transform': `translate${isHorizontal ? 'X' : 'Y'}(${(active.value ? 0 : -110) * (isOppositeHorizontal || isOppositeVertical ? -1 : 1)}%)`,
                    'position': absolute.value || rootZIndex.value !== ROOT_ZINDEX ? 'absolute' : 'fixed',
                    ...(transitionsEnabled.value ? undefined : {'transition': 'none'})
                } as const

                if (!isMounted.value) return styles

                const item = items.value[index.value]

                // The previous code threw when the registered item couldn't
                // be found in `items.value` — but that crash fires every
                // time a layout-aware component (e.g. `OrigamBottomNav`)
                // is rendered outside a layout host, or during HMR before
                // the parent layout's `items` computed re-runs. Both are
                // legitimate states. Fall back to the base position styles
                // and skip the layout-driven offsets in that case so the
                // component still renders.
                if (!item) return styles

                const overlap = computedOverlaps.value.get(id)

                if (overlap) {
                    item[overlap.position] += overlap.amount
                }

                return {
                    ...styles,
                    'height':
                        isHorizontal ? `calc(100% - ${convertToUnit(item.top)} - ${convertToUnit(item.bottom)})`
                            : elementSize.value ? `${convertToUnit(elementSize.value)}`
                                : undefined,
                    left: isOppositeHorizontal ? undefined : convertToUnit(item.left),
                    right: isOppositeHorizontal ? convertToUnit(item.right) : undefined,
                    top: position.value !== 'bottom' ? convertToUnit(item.top) : undefined,
                    bottom: position.value !== 'top' ? convertToUnit(item.bottom) : undefined,
                    'width':
                        !isHorizontal ? `calc(100% - ${convertToUnit(item.left)} - ${convertToUnit(item.right)})`
                            : elementSize.value ? `${convertToUnit(elementSize.value)}`
                                : undefined
                }
            })

            const layoutItemScrimStyles = computed<CSSProperties>(() => ({
                'z-index': zIndex.value - 1
            }))

            return {layoutItemStyles, layoutItemScrimStyles, zIndex}
        },
        unregister: (id: string) => {
            priorities.delete(id)
            positions.delete(id)
            layoutSizes.delete(id)
            activeItems.delete(id)
            disabledTransitions.delete(id)
            registered.value = registered.value.filter(v => v !== id)
        },
        mainRect,
        mainStyles,
        getLayoutItem,
        items,
        layoutRect,
        rootZIndex,
        layoutId
    })

    const layoutClasses = computed(() => {
        return [
            'origam-layout',
            {'origam-layout--full-height': props.fullHeight}
        ]
    })

    const layoutStyles = computed(() => {
        const left = convertToUnit(mainRect.value.left) ?? '0px'
        const right = convertToUnit(mainRect.value.right) ?? '0px'
        const top = convertToUnit(mainRect.value.top) ?? '0px'
        const bottom = convertToUnit(mainRect.value.bottom) ?? '0px'
        // Expose the layout's reserved-space (drawer width, toolbar height,
        // …) via CSS custom properties on the LAYOUT ROOT so every
        // descendant inherits them (toolbar, main, footer, snackbar, …).
        // Bracket-assignment is used for the `--*` custom properties
        // because the surrounding object literal cast to `StyleValue`
        // erases unknown keys at the Vue level otherwise (CSSProperties
        // typing only allows camelCase known props).
        const out: Record<string, unknown> = {
            'z-index': parentLayout ? rootZIndex.value : undefined,
            'position': parentLayout ? 'relative' as const : undefined,
            'overflow': parentLayout ? 'hidden' : undefined,
        }
        out['--origam-layout---position-left'] = left
        out['--origam-layout---position-right'] = right
        out['--origam-layout---position-top'] = top
        out['--origam-layout---position-bottom'] = bottom
        return out as StyleValue
    })

    return {
        layoutClasses,
        layoutStyles,
        getLayoutItem,
        items,
        layoutRect,
        layoutRef: resizeRef,
        layoutId
    }
}
