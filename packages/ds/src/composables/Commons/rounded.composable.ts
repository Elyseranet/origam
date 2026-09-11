import { computed, isRef, Ref } from 'vue'

import { BORDER_RADIUS_REGEX, PREDEFINED_ROUNDED } from '../../consts'

import type { IRoundedProps } from '../../interfaces'

import type { TRounded } from '../../types'

import { convertToUnit, formatRoundedStylesVar, getCurrentInstanceName, isCustomBorderRadius } from '../../utils'

/**
 * Set of rounded values for which a global utility class exists in
 * `src/assets/css/tokens/origam-utilities.css` (Phase 1 manifest).
 *
 * NOTE: this set does NOT overlap the legacy `PREDEFINED_ROUNDED`
 * (`x-small | small | default | medium | large | x-large | shaped |
 * shaped-invert`) — the utility manifest follows the modern
 * `xs|sm|md|lg|xl` taxonomy plus `none|full`. Components that pass
 * `rounded="default"` or `rounded="x-small"` keep emitting their
 * component-local class (no utility companion). This mismatch is
 * documented in the Phase 2 report; a Phase 1.5 may bridge the
 * legacy ROUNDED enum onto utility names.
 */
const UTILITY_ROUNDED: ReadonlySet<string> = new Set([
    'none', 'xs', 'sm', 'md', 'lg', 'xl', 'full'
])

function isUtilityRounded (value: unknown): value is string {
    return typeof value === 'string' && UTILITY_ROUNDED.has(value)
}

/**
 * Resolve the consumer's `rounded` prop into either a class (named variant
 * or legacy boolean) or an inline `border-radius` declaration (free-form
 * CSS value). Mirrors the origam-design-system implementation but uses a
 * static `PREDEFINED_ROUNDED` whitelist instead of the origam
 * theme-driven `useTheme().current.value.variables.rounded`, since origam
 * ships its radius rungs as fixed primitive tokens.
 *
 * Behaviour matrix:
 *
 * | `rounded` value           | output                                      |
 * |---------------------------|---------------------------------------------|
 * | unset / `false` / `null`  | nothing — component default radius wins      |
 * | `'small'`, `'large'`, …   | class `${name}--rounded-${value}`            |
 * | `true` or `''`            | class `${name}--rounded` (legacy)            |
 * | `4` (number)              | inline `border-radius: 4px`                  |
 * | `'4px'`                   | inline `border-radius: 4px`                  |
 * | `'4px 0 4px 0'`           | inline 4-corner radii                        |
 *
 * Free-form strings are parsed by `BORDER_RADIUS_REGEX`. Anything that
 * doesn't match is silently dropped (no inline style emitted).
 */

/*********************************************************
 * useRounded
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

    // Map a `PREDEFINED_ROUNDED` named variant to its primitive radius
    // token. Mirrors the per-component SCSS rules (Avatar, Btn, …) that
    // historically duplicated this mapping inline. Centralising it here
    // lets every component pick up its `border-radius` from
    // `roundedStyles` (inline-style via `useStyle`) without each one
    // re-implementing the 6-row table.
    const NAMED_RADIUS_TOKEN: Record<string, string> = {
        'x-small': 'var(--origam-radius---xs, 2px)',
        'small':   'var(--origam-radius---sm, 4px)',
        'default': 'var(--origam-radius---md, 8px)',
        'medium':  'var(--origam-radius---lg, 12px)',
        'large':   'var(--origam-radius---xl, 16px)',
        'x-large': 'var(--origam-radius---2xl, 24px)'
    }

    // Fallback radius per utility rung. `none` has NO token (none = 0), so a
    // bare `var(--origam-radius---none)` is an invalid declaration that gets
    // dropped — and a component's hardcoded default radius then wins
    // (`rounded="none"` looked slightly rounded on Audio). The fallback also
    // protects themes that omit a rung.
    const UTILITY_RADIUS_FALLBACK: Record<string, string> = {
        none: '0',
        xs:   '2px',
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        full: '9999px'
    }

    const roundedStyles = computed(() => {
        const rounded = isRef(props) ? props.value : props.rounded
        const styles: Array<string> = []

        // Boolean / empty / nullish — the legacy class chrome handles it.
        if (rounded == null || rounded === false) return styles

        // Utility variants (`'xs'|'sm'|'md'|'lg'|'xl'|'none'|'full'`):
        // the `.origam--rounded-*` utility class has specificity (0,1,0)
        // and routinely LOSES the cascade against a component's scoped
        // `border-radius` / per-corner declarations (spec 0,2,0). Emit
        // an inline-style companion so `useStyle` lands the radius at
        // `#id` (spec 1,0,0) and wins everywhere.
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
    })

    return {
        roundedClasses,
        roundedStyles
    }
}
