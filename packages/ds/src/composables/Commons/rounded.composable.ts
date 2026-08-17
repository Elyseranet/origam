import { computed, isRef, Ref } from 'vue'

import {
    BORDER_RADIUS_REGEX,
    NAMED_RADIUS_TOKEN,
    PREDEFINED_ROUNDED,
    ROUNDED_CORNER_MAP,
    UTILITY_RADIUS_FALLBACK
} from '../../consts'

import type { IRoundedProps } from '../../interfaces'

import type { TRounded } from '../../types'

import {
    convertToUnit,
    formatRoundedStylesVar,
    getCurrentInstanceName,
    isCustomBorderRadius,
    resolveRoundedCornerValue
} from '../../utils'

/**
 * Whether `value` names a rung for which a global utility class exists in
 * `src/assets/css/tokens/origam-utilities.css` (Phase 1 manifest):
 * `none | xs | sm | md | lg | xl | full`.
 *
 * The rung list is READ OFF `UTILITY_RADIUS_FALLBACK` rather than
 * duplicated as a second hand-maintained literal, so the two cannot drift.
 *
 * ⚠️ The lookup is deliberately done at CALL time, not hoisted into a
 * module-level `new Set(Object.keys(...))`. Hoisting it crashed the whole
 * `composables/index.ts` barrel with `TypeError: Cannot convert undefined
 * or null to object`: this module reads `UTILITY_RADIUS_FALLBACK` through
 * the `consts` barrel, and under the barrel's circular-import graph that
 * binding is still `undefined` while this module's top level executes.
 * By call time every module is initialised.
 *
 * NOTE: these rungs do NOT overlap the legacy `PREDEFINED_ROUNDED`
 * (`x-small | small | default | medium | large | x-large | shaped |
 * shaped-invert`) — the utility manifest follows the modern
 * `xs|sm|md|lg|xl` taxonomy plus `none|full`. Components that pass
 * `rounded="default"` or `rounded="x-small"` keep emitting their
 * component-local class (no utility companion).
 */
function isUtilityRounded (value: unknown): value is string {
    return typeof value === 'string' && Object.hasOwn(UTILITY_RADIUS_FALLBACK, value)
}

/*********************************************************
 * useRounded
 *
 * @description
 * Resolve the consumer's `rounded` prop into either a class (named variant
 * or legacy boolean) or an inline `border-radius` declaration (free-form
 * CSS value), then layer the per-corner overrides on top.
 *
 * Precedence rule — SPECIFIC beats GLOBAL, enforced by PUSH ORDER onto the
 * `styles` array (later declarations win within the same inline `style`
 * attribute — this holds even across logical vs physical corner syntax for
 * the same corner). Mirrors `useBorder` / `usePadding` / `useMargin`:
 *
 *   1. global `rounded` (utility rung, named variant, legacy boolean, or
 *      free-form 1/4-value CSS)
 *   2. per-corner `roundedTopLeft` / `roundedTopRight` /
 *      `roundedBottomLeft` / `roundedBottomRight`
 *
 * So `roundedTopLeft="0"` beats `rounded="lg"` for the top-left corner
 * only; the other three keep the `lg` rung.
 *
 * ⚠️ The per-corner props are only reachable through the PROPS-OBJECT
 * overload. The `Ref` overload carries a single scalar — the `rounded`
 * shorthand — by construction, so a caller that needs the corners must
 * pass an object (see `useStateEffect`, which builds a `reactive` getter
 * bag for exactly this reason).
 *
 * Behaviour matrix for the shorthand:
 *
 * | `rounded` value           | output                                      |
 * |---------------------------|---------------------------------------------|
 * | unset / `false` / `null`  | nothing — component default radius wins      |
 * | `'small'`, `'large'`, …   | class `${name}--rounded-${value}` + token    |
 * | `true` or `''`            | class `${name}--rounded` (legacy)            |
 * | `4` (number)              | inline `border-radius: 4px`                  |
 * | `'4px'`                   | inline `border-radius: 4px`                  |
 * | `'4px 0 4px 0'`           | inline 4-corner radii                        |
 *
 * Free-form strings are parsed by `BORDER_RADIUS_REGEX`. Anything that
 * doesn't match (and isn't a `var()`/`calc()`) is silently dropped.
 * Accepted per-corner value forms are documented on
 * `resolveRoundedCornerValue`.
 ********************************************************/
export function useRounded (
    props: IRoundedProps | Ref<boolean | number | string | TRounded | null | undefined>,
    name = getCurrentInstanceName()
) {
    const roundedClasses = computed(() => {
        const rounded = isRef(props) ? props.value : props.rounded
        const classes: Array<string> = []

        if (!rounded && rounded !== '') return classes

        // Modern utility variant: `'xs' | 'sm' | 'md' | 'lg' | 'xl' |
        // 'none' | 'full'` lands on the matching `.origam--rounded-*`
        // utility class. These are the names emitted by the Phase 1
        // manifest. They do NOT overlap with `PREDEFINED_ROUNDED`
        // (legacy enum); the legacy values continue to emit their
        // component-local class below.
        if (isUtilityRounded(rounded)) {
            classes.push(`origam--rounded-${rounded}`)
            return classes
        }

        // Named variant: `'small' | 'large' | …` matches one of the
        // entries in PREDEFINED_ROUNDED. Emits a class so the component's
        // SCSS can pick the right `--origam-{cmp}---border-radius` token.
        if (typeof rounded === 'string' && PREDEFINED_ROUNDED.includes(rounded as TRounded)) {
            classes.push(`${name}--rounded-${rounded}`)
            return classes
        }

        // Legacy boolean / empty-string opt-in for the single-state
        // `--rounded` chrome (kept for backward compat with
        // `<OrigamBtn rounded>`). The legacy boolean form historically
        // means "default radius" — companion utility class is `md`.
        if (rounded === true || (typeof rounded === 'string' && rounded === '')) {
            classes.push(`${name}--rounded`)
            classes.push('origam--rounded-md')
        }

        return classes
    })

    /**
     * Rung 1 — the `rounded` shorthand, resolved to inline declarations.
     * Extracted so the per-corner rung below can always run: the previous
     * implementation `return`ed early from each shorthand branch, which
     * would have made the corners unreachable for every value of
     * `rounded` except "unset".
     */
    const shorthandStyles = (rounded: boolean | number | string | TRounded | null | undefined): Array<string> => {
        const styles: Array<string> = []

        // Boolean / empty / nullish — the legacy class chrome handles it.
        if (rounded == null || rounded === false) return styles

        // Utility variants (`'xs'|'sm'|'md'|'lg'|'xl'|'none'|'full'`):
        // the `.origam--rounded-*` utility class has specificity (0,1,0)
        // and routinely LOSES the cascade against a component's scoped
        // `border-radius` / per-corner declarations (spec 0,2,0). Emit
        // an inline-style companion so `useStyle` lands the radius at
        // `#id` (spec 1,0,0) and wins everywhere.
        //
        // ⛔ "Routinely" is MEASURED, not asserted — do not delete this
        // branch as a Strategy-A cleanup. Chromium, Histoire rebuilt with
        // and without this `styles.push`, computed `border-start-start-
        // radius` on the component root of each component whose entry in
        // `themes/origam.theme.ts` pins a utility rung:
        //
        //   component         with      without    verdict
        //   card              12px      0px        companion REQUIRED
        //   table             12px      0px        companion REQUIRED
        //   expansion-panel   8px       4px        companion REQUIRED
        //   code              12px      12px       class suffices
        //   text-field        12px      12px       class suffices
        //   skeleton          4px       4px        class suffices
        //   avatar            9999px    9999px     class suffices
        //
        // 3 of 7 regress. Card is the clearest case: `.origam-card[data-v-…]`
        // declares the four LOGICAL corner longhands (`border-start-start-
        // radius: var(…, 0)` …) at (0,2,0), which beat this utility class's
        // `border-radius` shorthand at (0,1,0) — every Card in the catalogue
        // turns square without the companion.
        //
        // Retiring this in v3.0.0 (when `*Styles` goes away) is therefore
        // NOT a pure deletion: each component in the "REQUIRED" list must
        // first drop or lower its own scoped radius rule, or the utility
        // class must be promoted. Pinned by two Playwright assertions in
        // `packages/tests/e2e/prop-audit-phase4.spec.ts` (OrigamCard block),
        // one of which fails LOUDLY the day the cascade is fixed — that is
        // the signal this branch can finally go.
        if (isUtilityRounded(rounded)) {
            styles.push(`border-radius: var(--origam-radius---${rounded}, ${UTILITY_RADIUS_FALLBACK[rounded]})`)
            return styles
        }

        // Named variants (`'x-small'…'x-large'`): same cascade issue —
        // components rarely ship per-variant scoped rules. Map to the
        // primitive radius token and emit the inline declaration.
        // `shaped` / `shaped-invert` are corner-asymmetric and stay
        // owned by each component's scoped SCSS.
        if (typeof rounded === 'string'
            && PREDEFINED_ROUNDED.includes(rounded as TRounded)
            && rounded !== 'shaped'
            && rounded !== 'shaped-invert') {
            const token = NAMED_RADIUS_TOKEN[rounded]
            if (token) styles.push(`border-radius: ${token}`)
            return styles
        }

        // Legacy boolean-true and empty-string opt-in: also push an
        // inline radius so the chrome lands regardless of per-component
        // SCSS coverage. Mirrors the utility `md` rung.
        if (rounded === true || (typeof rounded === 'string' && rounded === '')) {
            styles.push(`border-radius: var(--origam-radius---md, 8px)`)
            return styles
        }

        if (typeof rounded === 'string') {
            const match = BORDER_RADIUS_REGEX.exec(rounded)?.groups
            if (match) {
                Object.keys(match).forEach((key) => {
                    const values = String(match[key]).split(' ')

                    styles.push(...formatRoundedStylesVar(values))
                })
            } else if (isCustomBorderRadius(rounded)) {
                // Free-form custom CSS value the literal `BORDER_RADIUS_REGEX`
                // can't describe: a custom-property ref (`var(--origam-radius---card)`),
                // a `calc(...)` expression, or any single CSS length the regex's
                // fixed unit list doesn't cover (`vw`, `vmin`, `q`, …). Aligns
                // `useRounded` with `convertToUnit`/`useDimension`, which already
                // pass custom-property refs and computed lengths straight through.
                // Emit the declaration verbatim — no warning, no drop.
                styles.push(`border-radius: ${(rounded as string).trim()}`)
            }
        } else if (typeof rounded === 'number') {
            styles.push(`border-radius: ${convertToUnit(rounded)}`)
        }

        return styles
    }

    const roundedStyles = computed(() => {
        const rounded = isRef(props) ? props.value : props.rounded

        const styles: Array<string> = shorthandStyles(rounded)

        // ── Rung 2: per-corner overrides ─────────────────────────────
        // Declared on `IRoundedProps` but never read until now. Emitted
        // as PHYSICAL corner longhands (`border-top-left-radius`), which
        // beat the LOGICAL ones the 4-value shorthand emits
        // (`border-start-start-radius`) by declaration order.
        if (!isRef(props)) {
            ROUNDED_CORNER_MAP.forEach(({corner, prop}) => {
                const resolved = resolveRoundedCornerValue(props[prop])

                if (resolved) styles.push(`border-${corner}-radius: ${resolved}`)
            })
        }

        return styles
    })

    return {
        roundedClasses,
        roundedStyles
    }
}
