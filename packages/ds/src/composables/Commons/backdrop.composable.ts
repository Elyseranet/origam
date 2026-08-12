import { computed, isRef, Ref } from 'vue'

import { UTILITY_BACKDROP_BLUR_RUNGS } from '../../consts/Commons/backdrop.const'
import type { IBackdropProps } from '../../interfaces'
import type { TBackdropBlur } from '../../types'
import { convertToUnit, isCustomBackdropFilter } from '../../utils'

import { useCssSupport } from '../CssSupport/cssSupport.composable'

function isUtilityRung (value: unknown): boolean {
    return typeof value === 'string' && UTILITY_BACKDROP_BLUR_RUNGS.has(value)
}

/**
 * Whether a `backdropBlur` value is a bare CSS length meant to be wrapped
 * in `blur(...)` — a plain `number` (`8` → `blur(8px)`), or a numeric-only
 * string with or without a unit (`'8'`, `'8px'`, `'0.5rem'`). Excludes
 * anything `isCustomBackdropFilter` already claims (a value that already
 * looks like a full filter expression), checked first by the caller.
 */
function isBareLength (value: TBackdropBlur): boolean {
    if (typeof value === 'number') return true
    const trimmed = value.trim()
    return trimmed !== '' && !Number.isNaN(Number(trimmed.replace(/[a-z%]+$/i, '')))
}

/**
 * `useBackdrop` — resolves the `backdropBlur` prop (`IBackdropProps`) into
 * either a utility class (tokenised rung) or an inline style (custom /
 * bare-length value), per `CLAUDE.md` § *Classes-first conventions*. Models
 * `backdrop-filter: blur(...)` as a props surface so consumers never write
 * `@supports`/`backdrop-filter` CSS by hand — the gap this composable was
 * created to close (ADR-005, Q1 arbitration: `ghost` blocked the
 * variant-as-props-preset chantier because no prop/token covered it).
 *
 * Accepts three shapes for `backdropBlur` (see `TBackdropBlur`):
 *   - an origam-native rung name (`'none'|'xs'|'sm'|'md'|'lg'|'xl'`),
 *   - a bare CSS length (`8`, `'8px'`, `'0.5rem'`) — wrapped into `blur(...)`,
 *   - a free-form custom `backdrop-filter` value (`'blur(8px) saturate(1.4)'`,
 *     `'var(--my-filter)'`) — emitted verbatim, detected by
 *     `isCustomBackdropFilter` (same permissive, signal-based approach as
 *     `useElevation`'s `isCustomBoxShadow` / `useRounded`'s
 *     `isCustomBorderRadius`).
 *
 * Cascade safety: unlike `useElevation` (whose `box-shadow` property is
 * rarely pre-declared by the consuming component's own scoped SCSS), several
 * of the DS's 16 `backdrop-filter` call sites (Card, Menu, Sheet, …) already
 * own the property via a component-local `--origam-{cmp}---backdrop-filter`
 * token. A bare utility class (specificity 0,1,0) can lose against that
 * scoped declaration depending on source order. So, like `useRounded`,
 * BOTH a class and an inline-style companion are emitted for a tokenised
 * rung — the inline style (specificity 1,0,0 via `useStyle`) is what
 * actually guarantees the paint; the class stays for consumers who want a
 * CSS-selector override hook (`CLAUDE.md` § *Classes-first*, rule 1 — "Bind
 * both, the empty side is harmless").
 *
 * Browser support: `backdrop-filter` degrades gracefully on its own (an
 * unsupported browser drops the whole declaration, no crash, no visual
 * regression beyond "no blur") — so this composable does NOT gate class/
 * style emission behind `useCssSupport()`. Gating would fight the
 * CSS-first principle (`CLAUDE.md`) and, since `useCssSupport` starts every
 * flag at `false` during SSR/pre-hydration, would cost every consumer a
 * blur-appears-after-hydration flash for no correctness gain. Instead,
 * `backdropSupported` is exposed as an opt-in signal — sourced from the
 * already-registered `backdropFilter` entry in `FEATURE_QUERIES`
 * (`css-support.const.ts`), not a fresh `CSS.supports()` call — for the
 * subset of components that need a *different* fallback appearance while
 * unsupported (mirrors the `@supports` fallback already hand-rolled in
 * `OrigamVideo` / `OrigamBtn` / `OrigamAlert` / `OrigamBtnGroup`), without
 * ever calling `CSS.supports()` directly (`CLAUDE.md` § *CSS-first,
 * JS-fallback*).
 */

/*********************************************************
 * useBackdrop
 ********************************************************/
export function useBackdrop (
    props: IBackdropProps | Ref<TBackdropBlur | undefined>
) {
    const { has } = useCssSupport()
    const backdropSupported = has('backdropFilter')

    const backdropClasses = computed(() => {
        const backdropBlur = isRef(props) ? props.value : props.backdropBlur
        const classes: Array<string> = []

        if (backdropBlur == null || backdropBlur === '') return classes

        if (isUtilityRung(backdropBlur)) {
            classes.push(`origam--backdrop-${backdropBlur}`)
        }

        return classes
    })

    const backdropStyles = computed(() => {
        const backdropBlur = isRef(props) ? props.value : props.backdropBlur
        const styles: Array<string> = []

        if (backdropBlur == null || backdropBlur === '') return styles

        if (isUtilityRung(backdropBlur)) {
            styles.push(`backdrop-filter: var(--origam-backdrop__blur---${backdropBlur})`)
            styles.push(`-webkit-backdrop-filter: var(--origam-backdrop__blur---${backdropBlur})`)
            return styles
        }

        if (typeof backdropBlur === 'string' && isCustomBackdropFilter(backdropBlur)) {
            const trimmed = backdropBlur.trim()
            styles.push(`backdrop-filter: ${trimmed}`)
            styles.push(`-webkit-backdrop-filter: ${trimmed}`)
            return styles
        }

        if (isBareLength(backdropBlur)) {
            const length = convertToUnit(backdropBlur)
            styles.push(`backdrop-filter: blur(${length})`)
            styles.push(`-webkit-backdrop-filter: blur(${length})`)
        }

        return styles
    })

    return { backdropClasses, backdropStyles, backdropSupported }
}
