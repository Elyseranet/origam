import { computed, reactive } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import { useBorder } from './border.composable'
import { useElevation } from './elevation.composable'
import { useMargin } from './margin.composable'
import { usePadding } from './padding.composable'
import { useRounded } from './rounded.composable'

import {
    getForeground,
    intentBgExpr,
    isCssColor,
    isIntent,
    isParsableColor,
    isUtilityIntent,
    parseColor,
    rawBgExprWithState,
    tokenForegroundForIntent,
    tokenStylesForIntent,
    warnLegacyColor,
} from '../../utils'

import type {
    IActiveState,
    IBgColorProps,
    IBorderProps,
    IColorProps,
    IElevationProps,
    IHoverState,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
} from '../../interfaces'

import type { TBgFgRole, TColor } from '../../types'

// ────────────────────────────────────────────────────────────────────────────
// `useStateEffect` — single composable for state-aware visual styles.
//
// Replaces the chain `useColorEffect` + `useBorder` + `useRounded` +
// `useElevation` + `usePadding` + `useMargin` that every visual component
// had to repeat. Reads the consumer's `hover` / `active` props (which are
// now `boolean | IHoverState | IActiveState`) and emits 8 axes of state-
// aware classes + styles.
//
// Axes covered (8 — matches the surface of IStateEffectConfig):
//   1. color          — foreground / text
//   2. bgColor        — surface background
//   3. border         — width / style / direction / color
//   4. rounded        — corner radius
//   5. elevation      — box-shadow
//   6. padding        — inner spacing (single scalar)
//   7. margin         — outer spacing (single scalar)
//   8. gap            — flex / grid gap (single scalar)
//
// Color resolution keeps the existing `useColorEffect` semantics
// verbatim (intent darkening at -20 % hover / -30 % active, same-intent
// rule, color-clash auto-contrast). Only the WIRING changes: instead
// of reading `props.hoverColor` / `props.hoverBgColor` / etc., we read
// `hoverState.value?.color` / `hoverState.value?.bgColor` and the
// active-state mirror.
//
// Other axes simply delegate to the existing per-axis composables —
// `useBorder`, `useRounded`, `useElevation`, `usePadding`, `useMargin`
// — but with a `computed` Ref that swaps to the override value when
// the state is engaged. The downstream composables already accept a
// `Ref` argument (single value overload), so no signature changes on
// their side.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Pick the effective value for a given axis based on the active state.
 *
 * Resolution order (per axis):
 *   1. isActive=true AND activeState?.{axis} != null  → activeState.{axis}
 *   2. isHover=true  AND hoverState?.{axis}  != null  → hoverState.{axis}
 *   3. default                                        → props[axis]
 *
 * `active` outranks `hover` when both are engaged (the user is pressing
 * AND hovering) — matches the existing role precedence in useColorEffect
 * where `active` takes precedence over `hover` (bg goes to bgActive, not
 * bgHover).
 */
function pickEffective<T> (
    // The RESTING value is passed as a GETTER, not an eager value: reading
    // `props.color` at the call site would capture the value at setup time and
    // the `return rest` default branch would never see later prop changes — so
    // changing `color` / `bgColor` / … at runtime (controls, v-model, parent
    // re-render) silently did nothing. A getter keeps the default branch
    // reactive on the underlying prop.
    rest: () => T | undefined,
    isHover: Ref<boolean> | ComputedRef<boolean>,
    isActive: Ref<boolean> | ComputedRef<boolean>,
    hoverState: ComputedRef<IHoverState | undefined>,
    activeState: ComputedRef<IActiveState | undefined>,
    key: keyof IHoverState,
): ComputedRef<T | undefined> {
    return computed(() => {
        // Display priority: normal → active → HOVER. Hover wins over active,
        // so hovering a pressed / selected element shows the hover surface.
        if (isHover.value && hoverState.value?.[key] != null) {
            return hoverState.value[key] as unknown as T
        }
        if (isActive.value && activeState.value?.[key] != null) {
            return activeState.value[key] as unknown as T
        }
        return rest()
    })
}

type TStateEffectProps =
    & IColorProps
    & IBgColorProps
    & IBorderProps
    & IRoundedProps
    & IElevationProps
    & IPaddingProps
    & IMarginProps
    & { gap?: boolean | number | string }

const noopRef = computed(() => false)

/*********************************************************
 * useStateEffect
 ********************************************************/
export function useStateEffect (
    props: TStateEffectProps,
    isHover: Ref<boolean> | ComputedRef<boolean> = noopRef,
    isActive: Ref<boolean> | ComputedRef<boolean> = noopRef,
    hoverState: ComputedRef<IHoverState | undefined> = computed(() => undefined),
    activeState: ComputedRef<IActiveState | undefined> = computed(() => undefined),
    isDisabled: Ref<boolean> | ComputedRef<boolean> = noopRef,
    /**
     * Flat flag — when `true`, `elevationClasses` / `elevationStyles`
     * resolve to empty (no shadow). Bridges the existing `useElevation`
     * second-arg contract so Card / Btn can pass their `props.flat`
     * boolean without losing the "flat overrides elevation" behaviour.
     */
    flat: Ref<boolean> | ComputedRef<boolean> = noopRef,
) {
    // ── Status overrides color/bgColor (non-overridable by props) ────
    // A `status` ('success' | 'info' | 'warning' | 'error') carries its
    // own semantic surface: it forces the matching feedback intent on the
    // color axis and WINS over any `color` / `bgColor` the consumer passed
    // — otherwise the status would be cosmetically pointless. `error` maps
    // to the `danger` intent (TStatus uses `error`, TIntent uses `danger`).
    const statusToIntent: Record<string, TColor> = {
        success: 'success',
        info: 'info',
        warning: 'warning',
        error: 'danger'
    }
    const statusIntent = computed<TColor | undefined>(() => {
        const status = (props as TStateEffectProps & { status?: string }).status
        return status ? (statusToIntent[status] ?? (status as TColor)) : undefined
    })

    // ── Effective per-axis values (computed, swap on state) ──────────
    const baseColor   = pickEffective<TColor>(() => props.color, isHover, isActive, hoverState, activeState, 'color')
    const baseBgColor = pickEffective<TColor>(() => props.bgColor, isHover, isActive, hoverState, activeState, 'bgColor')
    // When a status is active, drop the consumer's foreground so the bg
    // intent auto-pairs its own contrasting text, and force the bg intent.
    const color    = computed<TColor | undefined>(() => statusIntent.value ? undefined : baseColor.value)
    const bgColor  = computed<TColor | undefined>(() => statusIntent.value ?? baseBgColor.value)
    const border   = pickEffective(() => props.border, isHover, isActive, hoverState, activeState, 'border')
    const rounded  = pickEffective(() => props.rounded, isHover, isActive, hoverState, activeState, 'rounded')
    const elevation = pickEffective(() => props.elevation, isHover, isActive, hoverState, activeState, 'elevation')
    const padding  = pickEffective(() => props.padding, isHover, isActive, hoverState, activeState, 'padding')
    const margin   = pickEffective(() => props.margin, isHover, isActive, hoverState, activeState, 'margin')
    const gap      = pickEffective<boolean | number | string>(
        () => (props as any).gap, isHover, isActive, hoverState, activeState, 'gap',
    )

    // ── Color axis (preserved verbatim from useColorEffect) ──────────
    // Helper: same intent on the override slot is equivalent to no
    // override → bump to bgHover / bgActive rung (canonical -20 % / -30 %
    // darken). Matches the rule introduced in commit d62cc4e.
    const sameIntent = (a: TColor | undefined | null, b: TColor | undefined | null) => {
        return !!a && !!b && a === b && isIntent(a)
    }

    const colorClasses = computed<string[]>(() => {
        // Bypass utility layer in hover/active/disabled — resolved token
        // is no longer the resting `--origam-color__action--*---bg`.
        if (isHover.value || isActive.value || isDisabled.value) return []

        const classes: string[] = []
        const bgVal = bgColor.value
        const fgVal = color.value

        if (bgVal && isUtilityIntent(bgVal)) classes.push(`origam--bg-${bgVal}`)
        if (fgVal && isUtilityIntent(fgVal)) classes.push(`origam--color-${fgVal}`)

        return classes
    })

    const colorStyles = computed<string[]>(() => {
        void isDisabled.value // accepted for API symmetry; disabled is an opacity veil, not a token swap

        // Display priority: normal → active → HOVER. Hover takes precedence
        // over active, so a simultaneous press+hover lands on the hover
        // surface (matches `pickEffective`).
        const hoverHasOwnBg  = hoverState.value?.bgColor != null && !sameIntent(hoverState.value.bgColor, props.bgColor)
        const activeHasOwnBg = activeState.value?.bgColor != null && !sameIntent(activeState.value.bgColor, props.bgColor)

        const bgRole: TBgFgRole =
            isHover.value && !hoverHasOwnBg ? 'hover' :
            isActive.value && !activeHasOwnBg ? 'active' :
            'default'

        let bgDecl: string | null = null
        let fgDecl: string | null = null
        let bgIntentFg: string | null = null

        // ── Background resolution ───────────────────────────────────
        if (bgColor.value && isIntent(bgColor.value)) {
            const m = tokenStylesForIntent(bgColor.value, bgRole)
            bgDecl = `background-color: ${m['background-color']}`
            // Intent's contrast fg is fixed across roles (text never darkens with bg)
            bgIntentFg = tokenStylesForIntent(bgColor.value, 'default').color
        } else if (bgColor.value === 'transparent') {
            bgDecl = `background-color: ${rawBgExprWithState('transparent', bgRole)}`
        } else if (bgColor.value && typeof bgColor.value === 'string' && isCssColor(bgColor.value)) {
            warnLegacyColor('bgColor', bgColor.value)
            bgDecl = `background-color: ${rawBgExprWithState(bgColor.value, bgRole)}`
        }

        // ── Foreground resolution ───────────────────────────────────
        if (color.value && isIntent(color.value)) {
            // Color-clash auto-contrast: same intent on both axes →
            // swap to bg's paired contrast token instead of intent's
            // own hue (unreadable hue-on-hue otherwise).
            if (
                bgIntentFg &&
                bgColor.value &&
                isIntent(bgColor.value) &&
                color.value === bgColor.value
            ) {
                fgDecl = `color: ${bgIntentFg}`
            } else {
                fgDecl = `color: ${tokenForegroundForIntent(color.value)}`
            }
        } else if (color.value && typeof color.value === 'string' && isCssColor(color.value)) {
            if (color.value !== 'transparent') warnLegacyColor('color', color.value)
            fgDecl = `color: ${color.value}`
        } else if (!color.value && bgIntentFg) {
            fgDecl = `color: ${bgIntentFg}`
        } else if (!color.value && bgColor.value && typeof bgColor.value === 'string'
                   && bgColor.value !== 'transparent' && isParsableColor(bgColor.value)) {
            const parsed = parseColor(bgColor.value)
            if (parsed.a == null || parsed.a === 1) {
                fgDecl = `color: ${getForeground(parsed)}`
            }
        }

        const styles: string[] = []
        if (bgDecl) styles.push(bgDecl)
        if (fgDecl) styles.push(fgDecl)
        return styles
    })

    // Silence unused-var warning — `intentBgExpr` is re-exported for
    // back-compat from this composable so consumers can opt out and
    // hand-roll the expression. Future: drop once nobody imports it.
    void intentBgExpr

    // ── Other axes — delegate to existing composables via Ref overloads
    // Border goes through the props-object overload (not the bare Ref) so
    // the standalone `borderColor` / `borderStyle` props are honoured in
    // addition to the state-resolved `border` shorthand. The shorthand
    // stays state-aware via the reactive getter (same pattern as
    // padding / margin); `borderColor` / `borderStyle` — and the per-side
    // `borderTop`/`borderRight`/`borderBottom`/`borderLeft` (+ `*Color`)
    // props from issue #215 — are not state-swappable, so they read
    // straight from the base props. Forwarding these was the same "declared
    // but never read" bug the ticket fixes at the `useBorder` level: without
    // this explicit pass-through, any consumer of `useStateEffect` (Card,
    // Sheet, …) would have the props typed on `IBorderProps` yet silently
    // dropped before reaching `useBorder`.
    const { borderClasses, borderStyles }       = useBorder(
        reactive({
            get border () { return border.value },
            get borderColor () { return props.borderColor },
            get borderStyle () { return props.borderStyle },
            get borderTop () { return props.borderTop },
            get borderRight () { return props.borderRight },
            get borderBottom () { return props.borderBottom },
            get borderLeft () { return props.borderLeft },
            get borderTopColor () { return props.borderTopColor },
            get borderRightColor () { return props.borderRightColor },
            get borderBottomColor () { return props.borderBottomColor },
            get borderLeftColor () { return props.borderLeftColor },
        }) as IBorderProps,
    )
    const { roundedClasses, roundedStyles }     = useRounded(rounded)
    const { elevationClasses, elevationStyles } = useElevation(
        elevation as Ref<number | string | undefined>,
        flat as Ref<boolean>,
    )
    // `usePadding` / `useMargin` consume an `IPaddingProps` / `IMarginProps`
    // and read `props.padding` / `props.margin` inside `computed`s. If we
    // pass a plain literal (`{ padding: padding.value }`), Vue captures
    // the value once at call time and downstream computeds never re-run
    // when `padding` changes — which is exactly what happens on
    // hover/active swaps. Wrap with a `reactive` getter so the read goes
    // through the ref every time, preserving the dependency chain.
    const { paddingClasses, paddingStyles }     = usePadding(
        reactive({ get padding () { return padding.value } }) as IPaddingProps,
    )
    const { marginClasses, marginStyles }       = useMargin(
        reactive({ get margin () { return margin.value } }) as IMarginProps,
    )

    // Gap support: there's no `useGap` composable today. Emit an inline
    // style when the override is present (and a runtime gap class if we
    // ever expose one). For now we just emit the style declaration.
    const gapStyles = computed<string[]>(() => {
        const v = gap.value
        if (v == null || v === false) return []
        if (typeof v === 'number') return [`gap: ${v}px`]
        if (v === true) return []
        return [`gap: ${v}`]
    })
    const gapClasses = computed<string[]>(() => [])

    return {
        // Resolved scalar refs (so consumers can read the effective value)
        color,
        bgColor,
        border,
        rounded,
        elevation,
        padding,
        margin,
        gap,

        // Per-axis classes + styles (state-aware)
        colorClasses,
        colorStyles,
        borderClasses,
        borderStyles,
        roundedClasses,
        roundedStyles,
        elevationClasses,
        elevationStyles,
        paddingClasses,
        paddingStyles,
        marginClasses,
        marginStyles,
        gapClasses,
        gapStyles,
    }
}
