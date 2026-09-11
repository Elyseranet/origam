import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    watch
} from 'vue'

import { DEFAULT_SHEET_SNAP_POINTS } from '../../consts/Sheet/sheet-snap-points.const'
import { SHEET_FAST_FLICK_THRESHOLD as FAST_FLICK_THRESHOLD } from '../../consts/Sheet/sheet-swipe.const'
import type { ISheetSwipeOptions, ISheetSwipeReturn } from '../../interfaces'
import type { TSheetSnapId, TSheetSnapPoint } from '../../types'

// Re-export so existing `import { DEFAULT_SHEET_SNAP_POINTS } from
// '@/composables'` callsites continue to resolve. The const itself
// lives in `src/consts/Sheet/sheet-snap-points.const.ts` per the
// global CLAUDE.md "Constants ONLY in src/consts/" rule.
export { DEFAULT_SHEET_SNAP_POINTS } from '../../consts/Sheet/sheet-snap-points.const'

// `FAST_FLICK_THRESHOLD` lives in `src/consts/Sheet/sheet-swipe.const.ts`
// (exported there as `SHEET_FAST_FLICK_THRESHOLD`).

/**
 * Resolve a height token (number → px, string → CSS length) to absolute
 * pixels at the current viewport. SSR-safe: when `window` is missing we
 * fall back to a 0/static interpretation since the DOM cannot be read
 * anyway.
 */
function resolveHeightPx (height: number | string): number {
    if (typeof height === 'number') return height
    if (typeof window === 'undefined') return 0

    const value = String(height).trim()
    // Numeric string with optional unit
    const match = value.match(/^([\d.]+)(px|vh|vw|%|rem|em)?$/i)
    if (!match) return 0
    const num = parseFloat(match[1])
    const unit = (match[2] ?? 'px').toLowerCase()

    switch (unit) {
        case 'px': return num
        // For a bottom-sheet, `vh`, `%` and `vw` all map to viewport
        // height — `%` is the conventional shorthand designers reach for
        // even though strictly speaking a percentage on `height` resolves
        // against the parent. We expose `vh` as the canonical unit and
        // treat % the same way; documented in the prop's TSDoc.
        case 'vh':
        case '%':
            return (window.innerHeight * num) / 100
        case 'vw':
            return (window.innerWidth * num) / 100
        case 'rem':
        case 'em': {
            const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
            return num * root
        }
        default:
            return num
    }
}

/**
 * Bottom-sheet swipe gesture composable.
 *
 * Encapsulates pointerdown → pointermove → pointerup tracking, exposes
 * a reactive `currentSnap` plus live drag offset, and snaps to the
 * nearest point on release using either velocity (fast flick) or
 * absolute distance (slow drag). Pointer events cover both mouse and
 * touch, so the same code path drives the desktop story and the mobile
 * device.
 *
 * Contract:
 * - Only the **handle** receives pointer events. The rest of the sheet
 *   stays interactive (lists scroll, buttons click) — exactly like the
 *   Material 3 / iOS sheet patterns.
 * - During a drag we set `transition: none` via the `isDragging` flag so
 *   the user sees 1:1 finger tracking. On release we restore the
 *   transition and animate to the resolved snap.
 * - `persistent` blocks the `closed` snap; the gesture falls back to
 *   the next-lowest snap point.
 */

/*********************************************************
 * useSheetSwipe
 ********************************************************/
export function useSheetSwipe (options: ISheetSwipeOptions): ISheetSwipeReturn {
    const {
        el,
        handle,
        snapPoints,
        defaultSnap,
        disabled,
        persistent
    } = options

    // Resolve effective snap-points list — sort by height ASC so
    // index lookups (`snaps[i+1]`, `snaps[i-1]`) map to neighbours in
    // monotonic visual order.
    const sortedSnaps = computed<Array<TSheetSnapPoint>>(() => {
        const src = snapPoints?.value ?? DEFAULT_SHEET_SNAP_POINTS
        return [...src].sort((a, b) => resolveHeightPx(a.height) - resolveHeightPx(b.height))
    })

    const currentSnap = ref<TSheetSnapId>(defaultSnap?.value ?? 'half')

    const currentSnapHeight = computed(() => {
        const snap = sortedSnaps.value.find(s => s.id === currentSnap.value)
            ?? sortedSnaps.value[Math.floor(sortedSnaps.value.length / 2)]
        return resolveHeightPx(snap?.height ?? 0)
    })

    const dragOffset = shallowRef(0)
    const isDragging = shallowRef(false)

    // Keep currentSnap in sync with an external defaultSnap binding —
    // useful when the host swaps the v-model binding programmatically.
    watch(() => defaultSnap?.value, (next) => {
        if (next && next !== currentSnap.value) currentSnap.value = next
    })

    /** Internal pointer state. */
    let startY = 0
    let startTime = 0
    let baselineHeight = 0
    let activePointer: number | null = null

    /**
     * Snap-resolution algorithm.
     *
     * Inputs:
     *   - `releaseY`     last pointermove clientY
     *   - `releaseTime`  performance.now() at release
     *   - `delta`        net Δ in px since pointerdown (positive = drag up)
     *   - `velocity`     px/ms (positive = upward motion)
     *
     * Strategy: above `FAST_FLICK_THRESHOLD`, hop one step in the flick
     * direction; otherwise pick the snap whose pixel height is closest
     * to the projected height (baseline + delta).
     */
    function resolveSnap (delta: number, velocity: number): TSheetSnapId {
        const snaps = sortedSnaps.value
        if (snaps.length === 0) return currentSnap.value

        const currentIdx = Math.max(0, snaps.findIndex(s => s.id === currentSnap.value))
        const goingUp = velocity > 0   // pointer moving up = sheet expanding
        const goingDown = velocity < 0
        const speed = Math.abs(velocity)

        // Fast flick → step one snap in the gesture direction.
        if (speed >= FAST_FLICK_THRESHOLD) {
            const nextIdx = goingUp
                ? Math.min(snaps.length - 1, currentIdx + 1)
                : goingDown
                    ? Math.max(0, currentIdx - 1)
                    : currentIdx
            const candidate = snaps[nextIdx]
            return enforcePersistent(candidate.id, snaps)
        }

        // Slow release → nearest snap by absolute height.
        const projectedHeight = baselineHeight + delta
        let bestId = snaps[0].id
        let bestDist = Number.POSITIVE_INFINITY
        for (const s of snaps) {
            const dist = Math.abs(resolveHeightPx(s.height) - projectedHeight)
            if (dist < bestDist) {
                bestDist = dist
                bestId = s.id
            }
        }
        return enforcePersistent(bestId, snaps)
    }

    /**
     * `persistent` blocks `closed` — fall back to the next non-closed
     * snap (the closest non-zero one, which is `peek` in the default
     * preset).
     */
    function enforcePersistent (candidate: TSheetSnapId, snaps: Array<TSheetSnapPoint>): TSheetSnapId {
        if (!persistent?.value) return candidate
        if (candidate !== 'closed') return candidate
        const fallback = snaps.find(s => s.id !== 'closed' && resolveHeightPx(s.height) > 0)
        return fallback ? fallback.id : candidate
    }

    function snapTo (id: TSheetSnapId) {
        const snaps = sortedSnaps.value
        const target = enforcePersistent(id, snaps)
        if (snaps.some(s => s.id === target)) {
            currentSnap.value = target
            dragOffset.value = 0
        }
    }

    function dismiss () {
        snapTo('closed')
    }

    /*********************************************************
     * pointer handlers
     ********************************************************/
    function onPointerDown (e: PointerEvent) {
        if (disabled?.value) return
        const target = handle.value
        if (!target) return

        activePointer = e.pointerId
        startY = e.clientY
        startTime = e.timeStamp
        baselineHeight = currentSnapHeight.value
        dragOffset.value = 0
        isDragging.value = true

        try {
            target.setPointerCapture(e.pointerId)
        } catch {
            // setPointerCapture is best-effort; harmless if the runtime
            // refuses (synthetic event in jsdom, detached element, …).
        }
        // We want to suppress the page's vertical scroll while the user
        // grips the handle. preventDefault on touchstart-equivalent
        // pointerdown is a no-op on most browsers, but the pointermove
        // handler explicitly suppresses native scroll via touch-action.
    }

    function onPointerMove (e: PointerEvent) {
        if (!isDragging.value || activePointer !== e.pointerId) return
        if (e.cancelable) e.preventDefault()

        // Sheet grows when the finger moves UP the screen (clientY ↓).
        // Translate to a "delta" expressed in *sheet-height pixels*.
        const delta = startY - e.clientY
        dragOffset.value = delta
    }

    function onPointerUp (e: PointerEvent) {
        if (!isDragging.value || activePointer !== e.pointerId) return
        const delta = startY - e.clientY
        const dt = Math.max(1, e.timeStamp - startTime)  // guard ÷0
        const velocity = delta / dt                       // px / ms, +up

        try {
            handle.value?.releasePointerCapture(e.pointerId)
        } catch {
            // Ignore — pointer was never captured (jsdom synthesis case).
        }

        const next = resolveSnap(delta, velocity)
        currentSnap.value = next
        dragOffset.value = 0
        isDragging.value = false
        activePointer = null
    }

    function onPointerCancel () {
        // Treat cancel as "settle back to current snap" — never dismiss
        // unintentionally on an OS-level interruption.
        dragOffset.value = 0
        isDragging.value = false
        activePointer = null
    }

    /*********************************************************
     * lifecycle
     ********************************************************/
    function bind () {
        const target = handle.value
        if (!target) return
        target.addEventListener('pointerdown', onPointerDown, { passive: false })
        target.addEventListener('pointermove', onPointerMove, { passive: false })
        target.addEventListener('pointerup', onPointerUp,    { passive: false })
        target.addEventListener('pointercancel', onPointerCancel, { passive: false })
        target.addEventListener('pointerleave', onPointerCancel, { passive: false })
    }

    function unbind () {
        const target = handle.value
        if (!target) return
        target.removeEventListener('pointerdown', onPointerDown)
        target.removeEventListener('pointermove', onPointerMove)
        target.removeEventListener('pointerup', onPointerUp)
        target.removeEventListener('pointercancel', onPointerCancel)
        target.removeEventListener('pointerleave', onPointerCancel)
    }

    onMounted(() => {
        bind()
    })

    // Re-bind when the handle ref changes (handle conditionally rendered,
    // re-mount after `<keep-alive>`, …).
    watch(handle, (next, prev) => {
        if (prev) {
            prev.removeEventListener('pointerdown', onPointerDown)
            prev.removeEventListener('pointermove', onPointerMove)
            prev.removeEventListener('pointerup', onPointerUp)
            prev.removeEventListener('pointercancel', onPointerCancel)
            prev.removeEventListener('pointerleave', onPointerCancel)
        }
        if (next) bind()
    })

    onBeforeUnmount(() => {
        unbind()
    })

    // Avoid an unused-variable warning when the consumer never reads `el`.
    // The ref is documented as part of the contract so we can grow into
    // height-based assertions later (e.g. read computed bounds for snap
    // resolution against the actual rendered sheet rather than the
    // snap-point preset).
    void el

    return {
        currentSnap,
        dragOffset,
        isDragging,
        snapTo,
        dismiss,
        currentSnapHeight
    }
}
