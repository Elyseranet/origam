import { computed, useAttrs, watchEffect } from 'vue'

import type { IAccessibleClickableProps } from '../../interfaces/Commons/accessible-clickable.interface'

/*********************************************************
 * useIconAccessibility
 *
 * @description
 * ⛔ issue #427 / #653 — shared `aria-hidden` / `role` contract for every
 * icon leaf (`OrigamIcon`, `OrigamClassIcon`, `OrigamComponentIcon`,
 * `OrigamLigatureIcon`). A glyph is decorative by default
 * (`aria-hidden="true"`, no `role`) — the moment it is clickable it
 * becomes an interactive control (`aria-hidden="false"`,
 * `role="button"`), matching the semantics an icon-only button needs.
 * A control is considered clickable when the consumer attaches a click
 * handler (`$attrs.onClick`, untyped — any JS consumer) OR sets the
 * typed `clickable` prop (`props.clickable`, TS-checked — see below).
 *
 * @description
 * "No ARIA is better than bad ARIA" — a `role="button"` with no
 * accessible name is worse than no role at all: it promises a control
 * a screen reader user cannot identify. This hook does not fabricate a
 * label (a guessed "icon button" string would itself be bad ARIA, see
 * #622); it surfaces the gap two ways:
 * - **Typed consumers (#653)**: `IAccessibleClickableProps` (the
 *   `clickable` prop's discriminated-union type, declared on the
 *   component's own props interface) makes `vue-tsc` REFUSE
 *   `clickable="true"` without `aria-label` / `aria-labelledby` at
 *   compile time. This is the primary guard.
 * - **Untyped / plain-JS consumers**: a dev-only `console.warn` fires
 *   whenever the resolved state is clickable (by either signal) with
 *   neither name — the runtime safety net the type system cannot reach
 *   (a `.js` consumer, or a `@click` attached without `clickable`),
 *   mirroring the same defect already found on `OrigamFileFieldListItem`
 *   (#418). It stays a warning, not a `throw`: the user chose the type,
 *   not the runtime.
 *
 * @description
 * Reads `props` for `clickable` / `ariaLabel` / `ariaLabelledby` (all
 * three are now DECLARED props on the four consuming components, so
 * Vue routes them out of `$attrs`) and `$attrs` for `onClick` only
 * (never declared as a prop, so it stays in `$attrs` as before). Never a
 * themable prop, so this carries no ADR-005 lazy-read obligation.
 * `useAttrs()` is safe to call from within a composable: it resolves
 * against whichever component is currently mid-`setup()`, regardless of
 * how many function calls deep it's invoked from.
 ********************************************************/
export function useIconAccessibility (props: IAccessibleClickableProps) {
    const attrs = useAttrs()

    const isClickable = computed(() => !!attrs.onClick || !!props.clickable)
    const ariaHidden = computed(() => !isClickable.value)
    const role = computed(() => isClickable.value ? 'button' : undefined)
    const hasAccessibleName = computed(() => !!(props.ariaLabel || props.ariaLabelledby))

    if (import.meta.env?.DEV) {
        watchEffect(() => {
            if (isClickable.value && !hasAccessibleName.value) {
                console.warn('[Origam] Icon rendered as a clickable control (role="button") with no accessible name — pass aria-label or aria-labelledby.')
            }
        })
    }

    return { isClickable, ariaHidden, role, hasAccessibleName }
}
