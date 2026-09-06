import { useDisplay } from './display.composable'
import { useGoTo } from './goTo.composable'
import { useResizeObserver } from './resizeObserver.composable'
import { IN_BROWSER } from '../../consts/Commons/commons.const'
import {
    BUFFER_PX,
    DOWN,
    UP,
    VIRTUAL_FALLBACK_ITEM_HEIGHT_PX,
    VIRTUAL_SCROLL_DURATION_MS,
    VIRTUAL_SCROLL_EASING,
    VIRTUAL_SCROLL_SEQUENCE_MS
} from '../../consts/Commons/virtual.const'
import type { IGoToOptions } from '../../interfaces/Commons/goTo.interface'
import type { IVirtualProps } from '../../interfaces/Commons/virtual.interface'
import { clamp, debounce, int } from '../../utils/Commons/commons.util'
import { binaryClosest } from '../../utils/Commons/virtual.util'

import { computed, nextTick, onMounted, onScopeDispose, ref, Ref, shallowRef, watch, watchEffect } from 'vue'

/*********************************************************
 * useVirtual
 *
 * @description
 * Virtualisation de liste : ne rend que la tranche `[first, last[` de
 * `items` réellement visible (`computedItems`), en maintenant des
 * `offsets` par index (recalcules via `updateOffsets`, debattus) et un
 * padding haut/bas qui simule la hauteur totale de la liste. La fenetre
 * visible est recalculee sur scroll (`handleScroll`/`calcVisibleItems`,
 * via `requestAnimationFrame`) et sur redimensionnement du conteneur
 * (`useResizeObserver`). `scrollToIndex` delegue l'animation a `useGoTo`,
 * ou differe le scroll si la liste n'a pas encore mesure sa mise en page
 * (`targetScrollIndex`).
 *
 * @description
 * Le PREMIER `estimateLast()` (au moment du `shallowRef()`, en plein
 * `setup()`) peut lire un `props.height` PRE-THEME — voir la banniere
 * "the anti-flash first-paint guess" et "last's FIRST guess is
 * re-applied once mounted (#504)" juste en dessous : le meme piege
 * ADR-005 que `useSelectLink`/`useValidation`, corrige ici en
 * re-executant la meme estimation dans un `onMounted`. `itemHeight` n'est
 * jamais fige : `handleItemResize` le retrecit au minimum observe parmi
 * les items reellement mesures.
 ********************************************************/
export function useVirtual<T> (props: IVirtualProps, items: Ref<readonly T[]>) {
    const display = useDisplay()
    const goTo = useGoTo()

    const itemHeight = shallowRef(0)

    watchEffect(() => {
        itemHeight.value = parseFloat(props.itemHeight || 0)
    })

    /*********************************************************
     * estimateLast — the anti-flash first-paint guess
     *
     * @description
     * How many items to assume visible BEFORE the container/marker have
     * been measured, so the very first paint doesn't render a single
     * item then jump. Deliberately kept as a plain function (not a
     * `computed`) so it can be re-invoked from `onMounted` below,
     * re-reading `props.height` post-`beforeCreate` (#504) — see there
     * for why the FIRST synchronous call, at `shallowRef()` creation
     * time, cannot itself be theme-safe.
     ********************************************************/
    const estimateLast = () => Math.ceil((int(props.height!) || display.height.value) / (itemHeight.value || VIRTUAL_FALLBACK_ITEM_HEIGHT_PX)) || 1

    const first = shallowRef(0)
    const last = shallowRef(estimateLast())
    const paddingTop = shallowRef(0)
    const paddingBottom = shallowRef(0)

    /*********************************************************
     * `last`'s FIRST guess is re-applied once mounted (#504)
     *
     * @description
     * `shallowRef(estimateLast())` above runs during `setup()`, which
     * Vue executes BEFORE the `beforeCreate` hook where the ADR-005
     * theme-props resolver patches `instance.props` — so that FIRST
     * guess can read a pre-theme `props.height`. `onMounted` runs after
     * `beforeCreate` (and still before the browser's next paint, so
     * this does not introduce a visible flash): re-running the SAME
     * estimate there picks up whatever `props.height` a theme set,
     * without waiting for `viewportHeight` to CHANGE (its own watcher,
     * below, only reacts to a later change — it does not correct a
     * wrong INITIAL value on its own).
     ********************************************************/
    onMounted(() => {
        last.value = estimateLast()
    })

    /** The scrollable element */
    const containerRef = ref<HTMLElement>()
    /** An element marking the top of the scrollable area,
     * used to add an offset if there's padding or other elements above the virtual list */
    const markerRef = ref<HTMLElement>()
    /** markerRef's offsetTop, lazily evaluated */
    let markerOffset = 0

    const {resizeRef, contentRect} = useResizeObserver()

    watchEffect(() => {
        resizeRef.value = containerRef.value
    })

    const viewportHeight = computed(() => {
        // SSR-safe: `document` is undefined server-side; the container
        // ref is also unset until mount, so we always take the non-DOM
        // branch during SSR — no crash, no hydration mismatch.
        if (!IN_BROWSER) return int(props.height!) || 0
        return containerRef.value === document.documentElement
            ? display.height.value
            : contentRect.value?.height || int(props.height!) || 0
    })
    /** All static elements have been rendered and we have an assumed item height */
    const hasInitialRender = computed(() => {
        return !!(containerRef.value && markerRef.value && viewportHeight.value && itemHeight.value)
    })

    let sizes = Array.from<number | null>({length: items.value.length})
    let offsets = Array.from<number>({length: items.value.length})
    const updateTime = shallowRef(0)
    let targetScrollIndex = -1

    const getSize = (index: number) => {
        return sizes[index] || itemHeight.value
    }

    const updateOffsets = debounce(() => {
        const start = performance.now()
        offsets[0] = 0
        const length = items.value.length
        for (let i = 1; i <= length - 1; i++) {
            offsets[i] = (offsets[i - 1] || 0) + getSize(i - 1)
        }
        updateTime.value = Math.max(updateTime.value, performance.now() - start)
    }, updateTime)

    const unwatch = watch(hasInitialRender, (v) => {
        if (!v) return
        // First render is complete, update offsets and visible
        // items in case our assumed item height was incorrect

        unwatch()
        markerOffset = markerRef.value!.offsetTop
        updateOffsets.immediate()
        calculateVisibleItems()

        if (!~targetScrollIndex) return

        nextTick(() => {
            if (IN_BROWSER) {
                window.requestAnimationFrame(() => {
                    scrollToIndex(targetScrollIndex)
                    targetScrollIndex = -1
                })
            }
        })
    })

    onScopeDispose(() => {
        updateOffsets.clear()
    })

    const handleItemResize = (index: number, height: number) => {
        const prevHeight = sizes[index]
        const prevMinHeight = itemHeight.value

        itemHeight.value = prevMinHeight ? Math.min(itemHeight.value, height) : height

        if (prevHeight !== height || prevMinHeight !== itemHeight.value) {
            sizes[index] = height
            updateOffsets()
        }
    }

    const calculateOffset = (index: number) => {
        index = clamp(index, 0, items.value.length - 1)
        return offsets[index] || 0
    }
    const calculateIndex = (scrollTop: number) => {
        return binaryClosest(offsets, scrollTop)
    }

    let lastScrollTop = 0
    let scrollVelocity = 0
    let lastScrollTime = 0

    watch(viewportHeight, (val, oldVal) => {
        if (oldVal) {
            calculateVisibleItems()
            if (val < oldVal) {
                requestAnimationFrame(() => {
                    scrollVelocity = 0
                    calculateVisibleItems()
                })
            }
        }
    })

    const handleScroll = () => {
        if (!containerRef.value || !markerRef.value) return

        const scrollTop = containerRef.value.scrollTop
        const scrollTime = performance.now()
        const scrollDeltaT = scrollTime - lastScrollTime

        if (scrollDeltaT > VIRTUAL_SCROLL_SEQUENCE_MS) {
            scrollVelocity = Math.sign(scrollTop - lastScrollTop)

            // Not super important, only update at the
            // start of a scroll sequence to avoid reflows
            markerOffset = markerRef.value.offsetTop
        } else {
            scrollVelocity = scrollTop - lastScrollTop
        }

        lastScrollTop = scrollTop
        lastScrollTime = scrollTime

        calculateVisibleItems()
    }
    const handleScrollend = () => {
        if (!containerRef.value || !markerRef.value) return

        scrollVelocity = 0
        lastScrollTime = 0

        calculateVisibleItems()
    }

    let raf = -1

    const calculateVisibleItems = () => {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(calcVisibleItems)
    }
    const calcVisibleItems = () => {
        if (!containerRef.value || !viewportHeight.value) return
        const scrollTop = lastScrollTop - markerOffset
        const direction = Math.sign(scrollVelocity)

        const startPx = Math.max(0, scrollTop - BUFFER_PX)
        const start = clamp(calculateIndex(startPx), 0, items.value.length)

        const endPx = scrollTop + viewportHeight.value + BUFFER_PX
        const end = clamp(calculateIndex(endPx) + 1, start + 1, items.value.length)

        if (
            // Only update the side we're scrolling towards,
            // the other side will be updated incidentally
            (direction !== UP || start < first.value) &&
            (direction !== DOWN || end > last.value)
        ) {
            const topOverflow = calculateOffset(first.value) - calculateOffset(start)
            const bottomOverflow = calculateOffset(end) - calculateOffset(last.value)
            const bufferOverflow = Math.max(topOverflow, bottomOverflow)

            if (bufferOverflow > BUFFER_PX) {
                first.value = start
                last.value = end
            } else {
                // Only update the side that's reached its limit if there's still buffer left
                if (start <= 0) first.value = start
                if (end >= items.value.length) last.value = end
            }
        }

        paddingTop.value = calculateOffset(first.value)
        paddingBottom.value = calculateOffset(items.value.length) - calculateOffset(last.value)
    }

    const scrollToIndex = (index: number, options: Partial<IGoToOptions> = {}) => {
        const offset = calculateOffset(index)
        if (!containerRef.value || (index && !offset)) {
            // The list hasn't measured yet — defer the scroll to the
            // first-render watcher above, which will retry once layout
            // is stable.
            targetScrollIndex = index
            return
        }

        // Resolve animation options. Component-level props provide the
        // defaults; the per-call `options` argument lets a consumer
        // override (e.g. instant scroll for a "jump to top" button while
        // the rest of the app keeps the smooth feel).
        const duration = options.duration ?? props.scrollDuration ?? VIRTUAL_SCROLL_DURATION_MS
        const easing = options.easing ?? props.scrollEasing ?? VIRTUAL_SCROLL_EASING

        // `duration: 0` skips the rAF loop in `useGoTo` and falls through
        // to a plain assignment — we expose it as the "instant" escape
        // hatch (matches the native Web API's `behavior: 'instant'`).
        if (duration <= 0) {
            containerRef.value.scrollTop = offset
            return
        }

        // `useGoTo` reads the container from the options bag and writes
        // `scrollTop` over `duration` ms using the named easing. It
        // returns a Promise<number> resolving to the final position; we
        // intentionally don't await it so the caller stays sync.
        void goTo(offset, {
            container: containerRef.value,
            duration,
            easing,
            ...options
        })
    }

    const computedItems = computed(() => {
        return items.value.slice(first.value, last.value).map((item, index) => ({
            raw: item,
            index: index + first.value
        }))
    })

    watch(items, () => {
        sizes = Array.from({length: items.value.length})
        offsets = Array.from({length: items.value.length})
        updateOffsets.immediate()
        calculateVisibleItems()
    }, {deep: true})

    return {
        containerRef,
        markerRef,
        computedItems,
        paddingTop,
        paddingBottom,
        scrollToIndex,
        handleScroll,
        handleScrollend,
        handleItemResize
    }
}
