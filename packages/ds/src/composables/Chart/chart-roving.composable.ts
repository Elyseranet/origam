import { onBeforeUnmount, onMounted, onUpdated, type Ref } from 'vue'

import {
    CHART_POINT_SELECTOR,
    CHART_ROVING_KEY_ACTIONS,
    CHART_SERIES_ATTR
} from '../../consts/Chart/chart.const'

import type { IChartRoving } from '../../interfaces/Chart/chart-roving.interface'
import type { TChartRovingAction } from '../../types/Chart/chart.type'

/*********************************************************
 * resolveChartRovingTarget
 *
 * @description
 * Pure navigation rule of the roving tabindex (#1333): from the point at
 * `current`, returns the index of the point `action` leads to.
 * `series[i]` is the series key of the i-th point in DOM order.
 * Left/Right stay inside the current series; Up/Down jump to the adjacent
 * series at the same position (clamped when that series is shorter).
 * With a single series the vertical arrows behave like Left/Right.
 * Nothing wraps: at an end the focus stays where it is.
 ********************************************************/
export function resolveChartRovingTarget(series: string[], current: number, action: TChartRovingAction): number {
    if (!series.length) return -1
    if (action === 'first') return 0
    if (action === 'last') return series.length - 1

    const keys = [...new Set(series)]
    const vertical = action === 'nextSeries' || action === 'previousSeries'
    const step = action === 'next' || action === 'nextSeries' ? 1 : -1

    if (vertical && keys.length > 1) {
        const target = keys.indexOf(series[current]) + step
        if (target < 0 || target >= keys.length) return current
        const position = series.slice(0, current).filter((key) => key === series[current]).length
        const inTarget = series.flatMap((key, index) => (key === keys[target] ? [index] : []))
        return inTarget[Math.min(position, inTarget.length - 1)]
    }

    const group = vertical ? series.map((_, index) => index) : series.flatMap((key, index) => (key === series[current] ? [index] : []))
    const next = group.indexOf(current) + step
    return next < 0 || next >= group.length ? current : group[next]
}

/*********************************************************
 * useChartRoving
 *
 * @description
 * Gives a chart ONE tab stop (WAI-ARIA roving tabindex, WCAG 2.1.1 / 2.4.3).
 * The points carry `data-chart-point` and a static `tabindex="-1"`.
 * This composable promotes the last active one (else the first) to
 * `tabindex="0"` after mount and after each update, and moves it with the
 * arrow keys. Bind `onKeydown` on the chart `<svg>`; `svgRef` is the template
 * ref of that `<svg>`.
 *
 * @description
 * The focus listener lives on the svg's PARENT, never on the svg: Blink makes
 * an SVG element keyboard-focusable as soon as it has a focus / focusin
 * listener, which would add a second tab stop (the svg itself).
 ********************************************************/
export function useChartRoving(svgRef: Ref<SVGSVGElement | null>): IChartRoving {
    let activeIndex = 0
    let host: HTMLElement | null = null

    const points = (): HTMLElement[] => [...(svgRef.value?.querySelectorAll<HTMLElement>(CHART_POINT_SELECTOR) ?? [])]

    const sync = (): void => {
        const items = points()
        activeIndex = Math.max(0, Math.min(activeIndex, items.length - 1))
        items.forEach((el, index) => {
            const value = index === activeIndex ? '0' : '-1'
            if (el.getAttribute('tabindex') !== value) el.setAttribute('tabindex', value)
        })
    }

    const onFocusin = (event: FocusEvent): void => {
        const index = points().indexOf(event.target as HTMLElement)
        if (index < 0 || index === activeIndex) return
        activeIndex = index
        sync()
    }

    const onKeydown = (event: KeyboardEvent): void => {
        const action = CHART_ROVING_KEY_ACTIONS[event.key]
        if (!action || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
        const items = points()
        const current = items.indexOf(event.target as HTMLElement)
        if (current < 0) return
        event.preventDefault()
        const target = resolveChartRovingTarget(items.map((el) => el.getAttribute(CHART_SERIES_ATTR) ?? ''), current, action)
        if (target < 0 || target === current) return
        activeIndex = target
        sync()
        items[target].focus()
    }

    onMounted(() => {
        sync()
        host = svgRef.value?.parentElement ?? null
        host?.addEventListener('focusin', onFocusin)
    })
    onBeforeUnmount(() => host?.removeEventListener('focusin', onFocusin))
    onUpdated(sync)

    return { onKeydown }
}
