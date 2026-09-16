import type { ComponentInternalInstance, CSSProperties, Ref, StyleValue } from 'vue'
import { computed, inject, onMounted, provide, reactive, ref, shallowRef } from 'vue'
import { useResizeObserver } from './resizeObserver.composable'
import {
    LAYOUT_CLASS,
    LAYOUT_DEFAULT_OFFSET,
    LAYOUT_FULL_HEIGHT_CLASS,
    LAYOUT_ID_PREFIX,
    LAYOUT_ITEM_HIDDEN_OFFSET,
    LAYOUT_ITEM_ZINDEX_STEP,
    LAYOUT_OVERLAP_SEPARATOR,
    LAYOUT_POSITION_VARS,
    LAYOUT_SCRIM_ZINDEX_OFFSET,
    NESTED_LAYOUT_ZINDEX_STEP,
    ORIGAM_LAYOUT_KEY,
    ROOT_ZINDEX
} from '../../consts/Commons/layout.const'
import type { TDirectionBoth } from '../../types/Commons/anchor.type'
import { convertToUnit, findChildrenWithProvide, int } from '../../utils/Commons/commons.util'
import { getCurrentInstance, getUid } from '../../utils/Commons/getCurrentInstance.util'
import { generateLayers } from '../../utils/Commons/layout.util'

/*********************************************************
 * useCreateLayout
 *
 * @description
 * Root of the layout system — provides `ORIGAM_LAYOUT_KEY` so
 * `useLayout` / `useLayoutItem` consumers down the tree can register
 * (drawers, toolbars, bottom-navs…) and read back the reserved main
 * area.
 * Independent from `useLayout` / `useLayoutItem` at the call level (no
 * direct function dependency) — the three only share the
 * `ORIGAM_LAYOUT_KEY` provide/inject contract.
 ********************************************************/
export function useCreateLayout (props: { id?: string, overlaps?: Array<string>, fullHeight?: boolean }) {
    const parentLayout = inject(ORIGAM_LAYOUT_KEY, null)

    const uid = getUid()
    const layoutId = computed(() => props.id || `${LAYOUT_ID_PREFIX}${uid}`)

    const rootZIndex = computed(() => parentLayout ? parentLayout.rootZIndex.value - NESTED_LAYOUT_ZINDEX_STEP : ROOT_ZINDEX)
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
        for (const overlap of overlaps.filter(item => item.includes(LAYOUT_OVERLAP_SEPARATOR))) {
            const [top, bottom] = overlap.split(LAYOUT_OVERLAP_SEPARATOR)
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
        const left = convertToUnit(mainRect.value.left) ?? LAYOUT_DEFAULT_OFFSET
        const right = convertToUnit(mainRect.value.right) ?? LAYOUT_DEFAULT_OFFSET
        const top = convertToUnit(mainRect.value.top) ?? LAYOUT_DEFAULT_OFFSET
        const bottom = convertToUnit(mainRect.value.bottom) ?? LAYOUT_DEFAULT_OFFSET
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
            [LAYOUT_POSITION_VARS.left]: left,
            [LAYOUT_POSITION_VARS.right]: right,
            [LAYOUT_POSITION_VARS.top]: top,
            [LAYOUT_POSITION_VARS.bottom]: bottom,
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
            const zIndex = computed(() => rootZIndex.value + (layers.value.length * LAYOUT_ITEM_ZINDEX_STEP) - (index.value * LAYOUT_ITEM_ZINDEX_STEP))

            /*********************************************************
             * baseItemStyles / itemOffsetStyles
             *
             * @description
             * Les deux moities de `layoutItemStyles`, extraites (Sonar #771 :
             * complexite cognitive 18 > 15). Aucune expression modifiee : le
             * `isOppositeHorizontal || isOppositeVertical` d'origine est
             * exactement `position === 'right' || position === 'bottom'`, il
             * est ici nomme `isOpposite`.
             *
             * @description
             * Elles sont declarees ICI, au niveau de `register`, et non dans
             * le callback du `computed` : la complexite cognitive d'une
             * fonction inclut celle des fonctions qu'elle IMBRIQUE, donc une
             * fonction interne n'aurait rien retire au score.
             ********************************************************/
            const isHorizontalPosition = () => position.value === 'left' || position.value === 'right'

            const baseItemStyles = (): CSSProperties => {
                const isOpposite = position.value === 'right' || position.value === 'bottom'

                return {
                    [position.value]: 0,
                    'z-index': zIndex.value,
                    'transform': `translate${isHorizontalPosition() ? 'X' : 'Y'}(${(active.value ? 0 : LAYOUT_ITEM_HIDDEN_OFFSET) * (isOpposite ? -1 : 1)}%)`,
                    'position': absolute.value || rootZIndex.value !== ROOT_ZINDEX ? 'absolute' : 'fixed',
                    ...(transitionsEnabled.value ? undefined : {'transition': 'none'})
                }
            }

            const itemOffsetStyles = (item: typeof items.value[number]): CSSProperties => {
                const isHorizontal = isHorizontalPosition()
                const isOppositeHorizontal = position.value === 'right'

                return {
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
            }

            const layoutItemStyles = computed<CSSProperties>(() => {
                const styles = baseItemStyles()

                if (!isMounted.value) return styles

                const item = items.value[index.value]

                /*********************************************************
                 * item absent — on rend quand meme
                 *
                 * @description
                 * Le code precedent levait quand l'item enregistre restait
                 * introuvable dans `items.value`. Ce crash se declenche a
                 * chaque fois qu'un composant conscient du layout (ex.
                 * `OrigamBottomNav`) est rendu hors d'un hote de layout, et
                 * pendant un HMR avant que le `items` du layout parent ne
                 * recalcule. Les deux etats sont legitimes : on retombe sur
                 * les styles de position de base et on saute les decalages
                 * pilotes par le layout, pour que le composant rende.
                 ********************************************************/
                if (!item) return styles

                const overlap = computedOverlaps.value.get(id)

                if (overlap) {
                    item[overlap.position] += overlap.amount
                }

                return {
                    ...styles,
                    ...itemOffsetStyles(item)
                }
            })

            const layoutItemScrimStyles = computed<CSSProperties>(() => ({
                'z-index': zIndex.value - LAYOUT_SCRIM_ZINDEX_OFFSET
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
            LAYOUT_CLASS,
            {[LAYOUT_FULL_HEIGHT_CLASS]: props.fullHeight}
        ]
    })

    const layoutStyles = computed(() => {
        const left = convertToUnit(mainRect.value.left) ?? LAYOUT_DEFAULT_OFFSET
        const right = convertToUnit(mainRect.value.right) ?? LAYOUT_DEFAULT_OFFSET
        const top = convertToUnit(mainRect.value.top) ?? LAYOUT_DEFAULT_OFFSET
        const bottom = convertToUnit(mainRect.value.bottom) ?? LAYOUT_DEFAULT_OFFSET
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
        out[LAYOUT_POSITION_VARS.left] = left
        out[LAYOUT_POSITION_VARS.right] = right
        out[LAYOUT_POSITION_VARS.top] = top
        out[LAYOUT_POSITION_VARS.bottom] = bottom
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
