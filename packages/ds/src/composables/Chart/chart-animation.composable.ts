import { computed } from 'vue'

import type { ComputedRef } from 'vue'
import type { IChartBaseProps } from '../../interfaces/Chart/chart-base.interface'

import { CHART_ANIMATION_DURATION_DEFAULT } from '../../consts/Chart/chart.const'

import { usePassedProps } from '../Commons/passedProps.composable'

/**
 * useChartAnimationStyle
 *
 * @description
 * Resolves the `--origam-chart---animation-duration` inline style. Every
 * `OrigamChart*.vue` used to write
 * `` out['--origam-chart---animation-duration'] = `${props.animationDuration}ms` ``
 * UNCONDITIONALLY. That looks harmless because `props.animationDuration`
 * carries a `withDefaults()` default of `600`, but Vue resolves an UNSET
 * prop to that default too — so the assignment fired on every render
 * whether anything ever touched the prop or not, and an inline style
 * ALWAYS outranks a `[data-theme] { --origam-chart---animation-duration:
 * … }` rule set through the `vars`/`cssVars` escape hatch. The token was
 * reachable in the generated CSS but never actually applied — the
 * component itself permanently shadowed it. See #505.
 *
 * @description
 * ⛔ A plain `usePassedProps('animationDuration')` gate is NOT enough on
 * its own, and shipping it as the only condition would be a REGRESSION,
 * not a fix. ADR-005 lets a theme set this exact prop via
 * `theme.components['origam-chart-cartesian'].animationDuration` WITHOUT
 * the consumer ever writing it in the template — `usePassedProps` reads
 * `instance.vnode.props` (the parent's own template), which the ADR-005
 * resolver deliberately does NOT touch (see
 * `theme-props-resolver.composable.ts`'s note on why `usePassedProps` and
 * the resolver "independently arrive at the same answer" — they read the
 * SAME vnode-props source, on purpose). So under a props-level theme
 * override, `usePassedProps('animationDuration')` is `false` even though
 * `props.animationDuration` correctly resolves to the theme's value. Gating
 * on `usePassedProps` alone would silently drop that value from the CSS
 * var — the opposite of "theme applies" — while `props.animationDuration`
 * itself stayed right.
 * @description
 * The distinguishing test is therefore: did the value that reached this
 * render differ from the component's OWN static default
 * (`CHART_ANIMATION_DURATION_DEFAULT`, mirrored in every `withDefaults()`
 * call verbatim — see that const's own doc for why it can't be imported
 * INTO `withDefaults()` itself)? Either the consumer passed something
 * explicitly, OR a theme did — in both cases the resolved value is
 * meaningful and must reach the CSS var. Only when NEITHER touched it
 * (value === the static default, `usePassedProps` false) do we omit the
 * inline write and defer to the CSS-baked
 * `var(--origam-chart---animation-duration, 600ms)` fallback — leaving
 * room for a theme's raw `cssVars` override (a DIFFERENT, lower-level
 * channel than `theme.components`) to apply through the cascade instead.
 *
 * Resulting priority: consumer explicit > theme (either channel:
 * `theme.components[...].animationDuration` OR a raw `cssVars` override)
 * > CSS default (`600ms`).
 *
 * @example
 * const chartAnimationStyle = useChartAnimationStyle(props)
 * // merge into the root styles computed, alongside the other entries:
 * Object.assign(out, chartAnimationStyle.value)
 */
export function useChartAnimationStyle (props: Pick<IChartBaseProps, 'animationDuration'>): ComputedRef<Record<string, string>> {
    const wasPropPassed = usePassedProps(props, 'useChartAnimationStyle')

    return computed<Record<string, string>>(() => {
        const out: Record<string, string> = {}
        const resolved = props.animationDuration
        const wasThemedOrPassed = wasPropPassed('animationDuration')
            || (resolved !== undefined && resolved !== CHART_ANIMATION_DURATION_DEFAULT)

        if (wasThemedOrPassed && resolved !== undefined) {
            out['--origam-chart---animation-duration'] = `${ resolved }ms`
        }
        return out
    })
}
